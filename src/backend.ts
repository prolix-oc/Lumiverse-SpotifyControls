declare const spindle: import("lumiverse-spindle-types").SpindleAPI;

import type { FrontendToBackend, BackendToFrontend, SpotifyConfig, WidgetPrefs, SearchResult } from "./types";
import * as spotify from "./spotify-api";

// ─── State ───────────────────────────────────────────────────────────────

let pollingInterval: ReturnType<typeof setTimeout> | null = null;
let activeUserId: string | null = null;
let pendingOAuth: {
  state: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
  userId: string;
} | null = null;

// ─── Helpers ─────────────────────────────────────────────────────────────

function send(msg: BackendToFrontend) {
  spindle.sendToFrontend(msg);
}

async function loadConfig(userId: string): Promise<SpotifyConfig> {
  const stored = await spindle.storage.getJson<{ clientId: string }>("config.json", {
    fallback: { clientId: "" },
  });
  const [clientSecret, lastfmApiKey] = await Promise.all([
    spindle.enclave.get("client_secret", userId),
    spindle.enclave.get("lastfm_api_key", userId),
  ]);
  return {
    clientId: stored.clientId,
    clientSecret: clientSecret || "",
    lastfmApiKey: lastfmApiKey || undefined,
  };
}

async function saveConfig(config: SpotifyConfig, userId: string): Promise<void> {
  await spindle.storage.setJson("config.json", { clientId: config.clientId });
  await Promise.all([
    config.clientSecret
      ? spindle.enclave.put("client_secret", config.clientSecret, userId)
      : Promise.resolve(),
    config.lastfmApiKey
      ? spindle.enclave.put("lastfm_api_key", config.lastfmApiKey, userId)
      : Promise.resolve(),
  ]);
}

const MIGRATION_FLAG = "enclave_migration_done.json";

async function migrateToEnclave(userId: string): Promise<void> {
  try {
    // Skip if already migrated
    const done = await spindle.storage.getJson<{ done: boolean }>(MIGRATION_FLAG, {
      fallback: { done: false },
    });
    if (done.done) return;

    // Migrate config secrets (clientSecret, lastfmApiKey) from plaintext storage
    const oldConfig = await spindle.storage.getJson<SpotifyConfig>("config.json", {
      fallback: { clientId: "", clientSecret: "" },
    });
    if (oldConfig.clientSecret || oldConfig.lastfmApiKey) {
      if (oldConfig.clientSecret) {
        await spindle.enclave.put("client_secret", oldConfig.clientSecret, userId);
      }
      if (oldConfig.lastfmApiKey) {
        await spindle.enclave.put("lastfm_api_key", oldConfig.lastfmApiKey, userId);
      }
      await spindle.storage.setJson("config.json", { clientId: oldConfig.clientId });
      spindle.log.info("Migrated config secrets to secure enclave");
    }

    // Migrate OAuth tokens from plaintext tokens.json
    try {
      const raw = await spindle.storage.read("tokens.json");
      if (raw) {
        await spindle.enclave.put("spotify_tokens", raw, userId);
        await spindle.storage.delete("tokens.json");
        spindle.log.info("Migrated OAuth tokens to secure enclave");
      }
    } catch {
      // tokens.json doesn't exist, nothing to migrate
    }

    await spindle.storage.setJson(MIGRATION_FLAG, { done: true });
  } catch (err: any) {
    spindle.log.warn(`Enclave migration: ${err?.message}`);
  }
}

async function handleUserChange(userId: string): Promise<void> {
  if (activeUserId === userId) return;
  activeUserId = userId;
  spotify.setActiveUser(userId);
  await migrateToEnclave(userId);
  await spotify.loadTokens();
  if (spotify.isConnected()) {
    startPolling();
  } else {
    stopPolling();
  }
}

// ─── Cached state ────────────────────────────────────────────────────────

import type { PlaybackState } from "./types";

let lastState: PlaybackState | null = null;

async function loadCachedState(): Promise<void> {
  try {
    lastState = await spindle.storage.getJson<PlaybackState>("last_state.json");
  } catch {
    lastState = null;
  }
}

async function cacheState(state: PlaybackState | null): Promise<void> {
  lastState = state;
  if (state) {
    await spindle.storage.setJson("last_state.json", state).catch(() => {});
  }
}

// ─── Polling ─────────────────────────────────────────────────────────────

const POLL_ACTIVE_MS = 5000;
const POLL_PAUSED_MS = 15000;

function startPolling() {
  stopPolling();
  scheduleNextPoll();
  // Immediate fetch
  pushStateUpdate();
}

function scheduleNextPoll() {
  const interval = lastState?.isPlaying ? POLL_ACTIVE_MS : POLL_PAUSED_MS;
  pollingInterval = setTimeout(async () => {
    if (!spotify.isConnected()) {
      scheduleNextPoll();
      return;
    }
    try {
      const state = await spotify.getCurrentPlayback();
      cacheState(state);
      send({ type: "state", playbackState: state, connected: true });
    } catch (err: any) {
      spindle.log.warn(`Polling error: ${err?.message}`);
    }
    scheduleNextPoll();
  }, interval);
}

function stopPolling() {
  if (pollingInterval) {
    clearTimeout(pollingInterval);
    pollingInterval = null;
  }
}

/** Fetch and push current playback state to the frontend. */
async function pushStateUpdate() {
  try {
    const state = await spotify.getCurrentPlayback();
    cacheState(state);
    send({ type: "state", playbackState: state, connected: true });
  } catch {
    // ignore
  }
}

/**
 * Push a state update after a short delay.
 * Spotify's API needs a moment to reflect changes from playback commands.
 */
function pushStateAfterCommand() {
  setTimeout(pushStateUpdate, 300);
}

// ─── OAuth callback handler ─────────────────────────────────────────────

spindle.oauth.onCallback(async (params) => {
  const { code, state, error } = params;

  if (error) {
    spindle.log.error(`Spotify OAuth error: ${error}`);
    send({ type: "error", message: `Spotify authorization denied: ${error}` });
    return { html: errorPage(`Authorization denied: ${error}`) };
  }

  if (!pendingOAuth || state !== pendingOAuth.state) {
    return { html: errorPage("Invalid or expired OAuth state. Please try connecting again.") };
  }

  const { redirectUri, clientId, clientSecret, userId: oauthUserId } = pendingOAuth;
  pendingOAuth = null;

  try {
    spotify.setActiveUser(oauthUserId);
    const tokens = await spotify.exchangeCodeForTokens(code, redirectUri, clientId, clientSecret);
    await spotify.saveTokens(tokens);
    send({ type: "connected" });
    startPolling();
    return { html: successPage() };
  } catch (err: any) {
    spindle.log.error(`OAuth token exchange failed: ${err?.message}`);
    send({ type: "error", message: `Authentication failed: ${err?.message}` });
    return { html: errorPage(err?.message || "Token exchange failed. Please try again.") };
  }
});

function successPage(): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Spotify Connected</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1a1a2e;color:#e0e0e0}
.card{text-align:center;padding:2rem;border-radius:12px;background:#16213e;border:1px solid #1db954}
h1{margin:0 0 .5rem;font-size:1.5rem;color:#1db954}p{margin:0;opacity:.7}</style></head>
<body><div class="card"><h1>Spotify Connected</h1><p>You can close this window.</p></div>
<script>setTimeout(()=>window.close(),2000)</script></body></html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function errorPage(message: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Connection Failed</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1a1a2e;color:#e0e0e0}
.card{text-align:center;padding:2rem;border-radius:12px;background:#16213e;border:1px solid #e74c3c}
h1{margin:0 0 .5rem;font-size:1.5rem;color:#e74c3c}p{margin:0;opacity:.7}</style></head>
<body><div class="card"><h1>Connection Failed</h1><p>${escapeHtml(message)}</p></div></body></html>`;
}

// ─── Frontend message handler ────────────────────────────────────────────

spindle.onFrontendMessage(async (raw, userId) => {
  await handleUserChange(userId);
  const msg = raw as FrontendToBackend;
  try {
    switch (msg.type) {
      case "get_state": {
        // Return cached state immediately so the UI populates instantly
        if (lastState && spotify.isConnected()) {
          send({ type: "state", playbackState: lastState, connected: true });
        }
        // Then fetch fresh state
        const playbackState = spotify.isConnected()
          ? await spotify.getCurrentPlayback()
          : null;
        cacheState(playbackState);
        send({
          type: "state",
          playbackState,
          connected: spotify.isConnected(),
        });
        break;
      }

      case "get_config": {
        const config = await loadConfig(userId);
        send({
          type: "config",
          clientId: config.clientId,
          hasSecret: !!config.clientSecret,
          connected: spotify.isConnected(),
          callbackUrl: spindle.oauth.getCallbackUrl(),
          hasLastfmKey: !!config.lastfmApiKey,
        });
        break;
      }

      case "connect": {
        const { clientId, clientSecret, serverBaseUrl } = msg;
        const existing = await loadConfig(userId);
        await saveConfig({ clientId, clientSecret, lastfmApiKey: existing.lastfmApiKey }, userId);

        const state = await spindle.oauth.createState();
        // Spotify rejects "localhost" in redirect URIs — use IPv6 loopback [::1]
        const baseUrl = serverBaseUrl.replace("://localhost", "://[::1]");
        const redirectUri = baseUrl + spindle.oauth.getCallbackUrl();

        pendingOAuth = { state, redirectUri, clientId, clientSecret, userId };

        const scopes = "user-read-playback-state user-modify-playback-state user-read-currently-playing";
        const params = new URLSearchParams({
          response_type: "code",
          client_id: clientId,
          scope: scopes,
          redirect_uri: redirectUri,
          state: state,
        });

        send({ type: "auth_url", url: `https://accounts.spotify.com/authorize?${params.toString()}` });
        break;
      }

      case "disconnect": {
        stopPolling();
        await spotify.clearTokens();
        send({ type: "disconnected" });
        send({ type: "state", playbackState: null, connected: false });
        break;
      }

      case "play":
        await spotify.play({
          trackUri: msg.trackUri,
          contextUri: msg.contextUri,
        });
        pushStateAfterCommand();
        break;

      case "pause":
        await spotify.pause();
        pushStateAfterCommand();
        break;

      case "next":
        await spotify.next();
        pushStateAfterCommand();
        break;

      case "previous":
        await spotify.previous();
        pushStateAfterCommand();
        break;

      case "seek":
        await spotify.seek(msg.positionMs);
        pushStateAfterCommand();
        break;

      case "set_volume":
        await spotify.setVolume(msg.percent);
        pushStateAfterCommand();
        break;

      case "toggle_shuffle": {
        const state = await spotify.getCurrentPlayback();
        if (state) await spotify.setShuffle(!state.shuffleState);
        pushStateAfterCommand();
        break;
      }

      case "set_repeat":
        await spotify.setRepeat(msg.mode);
        pushStateAfterCommand();
        break;

      case "search": {
        const results = await spotify.search(msg.query);
        send({ type: "search_results", results });
        break;
      }

      case "queue":
        await spotify.addToQueue(msg.trackUri);
        break;

      case "get_devices": {
        const devices = await spotify.getDevices();
        send({ type: "devices", devices });
        break;
      }

      case "transfer_playback":
        await spotify.transferPlayback(msg.deviceId);
        pushStateAfterCommand();
        break;

      case "save_lastfm_key": {
        const config = await loadConfig(userId);
        config.lastfmApiKey = msg.apiKey;
        await saveConfig(config, userId);
        send({
          type: "config",
          clientId: config.clientId,
          hasSecret: !!config.clientSecret,
          connected: spotify.isConnected(),
          callbackUrl: spindle.oauth.getCallbackUrl(),
          hasLastfmKey: !!config.lastfmApiKey,
        });
        break;
      }

      case "get_widget_prefs": {
        const prefs = await spindle.userStorage.getJson<WidgetPrefs>("widget_prefs.json", {
          fallback: { size: 48, shape: "circle", sizeMode: "medium" } as WidgetPrefs,
          userId,
        });
        send({ type: "widget_prefs", prefs });
        break;
      }

      case "save_widget_prefs": {
        await spindle.userStorage.setJson("widget_prefs.json", msg.prefs, { userId });
        break;
      }
    }
  } catch (err: any) {
    send({ type: "error", message: err?.message || "Unknown error" });
  }
});

// ─── Lyrics cache ────────────────────────────────────────────────────────

let cachedLyrics: {
  trackUri: string;
  data: spotify.LyricsData | null;
} | null = null;

async function getLyricsForCurrentTrack(): Promise<spotify.LyricsData | null> {
  if (!spotify.isConnected()) return null;
  try {
    const state = lastState || await spotify.getCurrentPlayback();
    if (!state) return null;

    if (cachedLyrics && cachedLyrics.trackUri === state.trackUri) {
      return cachedLyrics.data;
    }

    const data = await spotify.getLyrics(
      state.trackName,
      state.artistName,
      state.albumName,
      state.durationMs / 1000
    );
    cachedLyrics = { trackUri: state.trackUri, data };
    return data;
  } catch {
    return null;
  }
}

// ─── Macros ──────────────────────────────────────────────────────────────

spindle.registerMacro({
  name: "spotify_now_playing",
  category: "extension:spotify_controls",
  description: "Returns the currently playing Spotify track",
  returnType: "string",
  handler: (async () => {
    const state = lastState || (spotify.isConnected() ? await spotify.getCurrentPlayback().catch(() => null) : null);
    if (!state) return "Nothing playing";
    return `${state.artistName} - ${state.trackName} (${state.albumName})`;
  }) as any,
});

spindle.registerMacro({
  name: "spotify_album_art",
  category: "extension:spotify_controls",
  description: "Returns the URL of the currently playing track's album art",
  returnType: "string",
  handler: (async () => {
    const state = lastState || (spotify.isConnected() ? await spotify.getCurrentPlayback().catch(() => null) : null);
    return state?.albumArtUrl || "";
  }) as any,
});

spindle.registerMacro({
  name: "spotify_lyrics",
  category: "extension:spotify_controls",
  description: "Returns the full lyrics of the currently playing Spotify track",
  returnType: "string",
  handler: (async () => {
    try {
      const lyrics = await getLyricsForCurrentTrack();
      if (!lyrics) return "No lyrics available";
      if (lyrics.instrumental) return "[Instrumental]";
      return lyrics.plainLyrics || "No lyrics available";
    } catch {
      return "No lyrics available";
    }
  }) as any,
});

// ─── LLM Tools ───────────────────────────────────────────────────────────

// Unregister first so hot-reloads / re-evaluations don't create duplicates
const TOOL_NAMES = [
  "spotify_search",
  "spotify_search_similar",
  "spotify_mood_discover",
  "spotify_queue",
] as const;
for (const name of TOOL_NAMES) spindle.unregisterTool(name);

// Clean up deprecated tools from previous versions
const DEPRECATED_TOOL_NAMES = [
  "spotify_find_playlist",
  "spotify_play",
  "spotify_playlist_tracks",
  "spotify_recommend",
];
for (const name of DEPRECATED_TOOL_NAMES) spindle.unregisterTool(name);

spindle.registerTool({
  name: "spotify_search",
  display_name: "Spotify Search & Play",
  description: "Search for music on Spotify and start playback. Supports two modes: 'playlist' searches for curated playlists matching a mood or query and plays the best match; 'tracks' searches for individual songs and plays the top result. Handles the full pipeline — search, resolve, and play — in one step.",
  council_eligible: true,
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query — a song/artist name, or mood/atmosphere descriptors like 'dark ambient mysterious', 'upbeat jazz cafe', 'epic orchestral battle'" },
      mode: { type: "string", enum: ["tracks", "playlist"], description: "Search mode: 'playlist' finds curated playlists (best for mood/atmosphere), 'tracks' finds individual songs (best for specific songs). Defaults to 'playlist'." },
    },
    required: ["query"],
  },
});

spindle.registerTool({
  name: "spotify_search_similar",
  display_name: "Find & Play Similar Music",
  description: "Find music similar to what is currently playing and start playback. Uses Last.fm's track similarity data (based on listening patterns, not genre tags) to find genuinely related tracks, then resolves and plays them on Spotify. Queues additional similar tracks automatically. Requires a track to be currently playing and a Last.fm API key.",
  council_eligible: true,
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
});

spindle.registerTool({
  name: "spotify_mood_discover",
  display_name: "Mood-Based Music Discovery",
  description: "Discover music matching a specific mood/atmosphere with deliberate variety — finds tracks from different artists and genres that share the emotional tone. Uses Last.fm's crowd-sourced mood tags for discovery. Requires a track to be currently playing and a Last.fm API key.",
  council_eligible: true,
  parameters: {
    type: "object",
    properties: {
      mood: {
        type: "string",
        description: "Comma-separated mood/atmosphere descriptors matching the scene's emotional tone. Be specific and faithful to the scene — e.g. 'romantic, tender, gentle' for a love scene; 'playful, lighthearted, warm' for a meet-cute or comedic beat; 'melancholic, bittersweet, nostalgic' for a farewell; 'dark, brooding, ominous' for menace; 'chill, mellow, dreamy' for a quiet moment. Avoid defaulting to 'epic' or 'cinematic' — only use those for genuinely grand, sweeping moments like battles or revelations.",
      },
    },
    required: [],
  },
});

spindle.registerTool({
  name: "spotify_queue",
  display_name: "Spotify Queue",
  description: "Add a track to the Spotify playback queue by its URI.",
  council_eligible: true,
  parameters: {
    type: "object",
    properties: {
      uri: {
        type: "string",
        description: "Spotify track URI (e.g. spotify:track:abc123)",
      },
    },
    required: ["uri"],
  },
});

// ─── Council context helpers ─────────────────────────────────────────────

/** Mood/atmosphere vocabulary grouped by broad categories. Used to extract
 *  searchable terms from raw story context when the council invokes a tool
 *  without explicit arguments. */
const MOOD_KEYWORDS: Record<string, string[]> = {
  dark:        ["dark", "shadow", "grim", "ominous", "dread", "sinister", "bleak", "foreboding", "menacing", "eerie"],
  tense:       ["tense", "suspense", "anxious", "nervous", "uneasy", "danger", "threat", "urgent", "panic", "fear"],
  sad:         ["sad", "grief", "mourn", "sorrow", "lonely", "melancholy", "loss", "cry", "tears", "heartbreak"],
  romantic:    ["love", "kiss", "tender", "intimate", "passion", "embrace", "romantic", "heart", "gentle", "longing"],
  epic:        ["battle", "war", "fight", "sword", "army", "charge", "clash", "siege", "conquest", "glory"],
  peaceful:    ["calm", "quiet", "serene", "peaceful", "gentle", "rest", "tranquil", "still", "soft", "meadow"],
  mysterious:  ["mystery", "secret", "hidden", "enigma", "strange", "curious", "ancient", "forgotten", "cryptic", "arcane"],
  joyful:      ["happy", "joy", "laugh", "celebrate", "cheer", "bright", "warm", "smile", "delight", "playful"],
  intense:     ["intense", "fierce", "rage", "fury", "storm", "roar", "crash", "fire", "burn", "blaze"],
  ethereal:    ["dream", "ethereal", "celestial", "spirit", "ghost", "divine", "heavenly", "astral", "mystic", "void"],
};

/** Known mood/atmosphere tags on Last.fm. Used to separate mood tags from genre
 *  tags when processing track.getTopTags results. */
const MOOD_TAG_SET = new Set([
  // Emotional
  "happy", "sad", "melancholy", "melancholic", "angry", "aggressive",
  "romantic", "love", "nostalgic", "bittersweet", "hopeful", "euphoric",
  "joyful", "cheerful", "depressing", "gloomy", "uplifting", "triumphant",
  "passionate", "sentimental", "wistful", "longing", "heartbreak", "heartfelt",
  "blissful", "tender", "gentle", "fierce", "furious", "anxious",
  // Atmospheric
  "atmospheric", "dreamy", "ethereal", "haunting", "dark", "eerie",
  "hypnotic", "psychedelic", "cinematic", "epic", "majestic",
  "sinister", "ominous", "mysterious", "brooding", "moody", "sultry",
  "whimsical", "playful", "surreal", "otherworldly",
  // Energy
  "chill", "chillout", "relaxing", "calm", "peaceful", "serene",
  "soothing", "mellow", "laid-back", "upbeat", "energetic", "intense",
  "driving", "groovy", "fun", "party",
  // Scene
  "night", "summer", "rainy", "morning", "sensual", "introspective",
  "contemplative", "spiritual", "meditative", "nocturnal",
  // Softer / lighter tones (meet-cute, comedy, warmth)
  "warm", "sweet", "cute", "lighthearted", "carefree", "innocent",
  "hopeful", "heartwarming", "cozy", "breezy",
]);

/** Maps extracted mood categories (from MOOD_KEYWORDS) to concrete Last.fm
 *  tag strings suitable for tag.getTopTracks queries. */
const MOOD_TO_LASTFM_TAGS: Record<string, string[]> = {
  dark:        ["dark", "brooding", "haunting", "ominous", "sinister", "nocturnal"],
  tense:       ["intense", "aggressive", "anxious", "driving"],
  sad:         ["sad", "melancholy", "melancholic", "bittersweet", "gloomy"],
  romantic:    ["romantic", "love", "sensual", "passionate", "tender"],
  epic:        ["epic", "cinematic", "triumphant", "majestic", "uplifting"],
  peaceful:    ["chill", "relaxing", "calm", "peaceful", "serene", "mellow"],
  mysterious:  ["mysterious", "atmospheric", "ethereal", "eerie", "hypnotic"],
  joyful:      ["happy", "joyful", "cheerful", "upbeat", "fun", "euphoric"],
  intense:     ["aggressive", "energetic", "intense", "fierce", "furious"],
  ethereal:    ["dreamy", "ethereal", "atmospheric", "hypnotic", "meditative"],
  // Extended categories for LLM-supplied mood descriptors
  warm:          ["warm", "gentle", "tender", "heartfelt", "soothing", "cozy"],
  lighthearted:  ["fun", "playful", "cheerful", "upbeat", "happy", "whimsical", "carefree"],
  sweet:         ["romantic", "tender", "gentle", "love", "heartfelt", "sweet", "innocent"],
  nostalgic:     ["nostalgic", "bittersweet", "wistful", "sentimental", "melancholic"],
  suspenseful:   ["intense", "dark", "anxious", "driving", "ominous"],
  melancholic:   ["melancholy", "melancholic", "sad", "bittersweet", "gloomy"],
  hopeful:       ["hopeful", "uplifting", "gentle", "warm", "tender"],
  playful:       ["playful", "fun", "upbeat", "whimsical", "groovy", "lighthearted"],
  tender:        ["tender", "gentle", "romantic", "heartfelt", "love", "sweet"],
  brooding:      ["brooding", "dark", "moody", "introspective", "nocturnal"],
  mellow:        ["mellow", "chill", "relaxing", "laid-back", "soothing"],
  dreamy:        ["dreamy", "ethereal", "hypnotic", "atmospheric", "psychedelic"],
  gentle:        ["gentle", "tender", "soft", "calm", "soothing", "warm"],
};

/** Extract mood-related tags from a track/artist's Last.fm tag list. */
function extractMoodTags(tags: { name: string; count: number }[], minCount = 5): string[] {
  return tags
    .filter(t => t.count >= minCount && MOOD_TAG_SET.has(t.name))
    .map(t => t.name);
}

/** Score a context string against mood categories and return the top N mood
 *  descriptors suitable for a Spotify/Last.fm search query. */
function extractMoodFromContext(context: string, topN = 3): string {
  if (!context) return "";
  const lower = context.toLowerCase();
  const scores: [string, number][] = [];

  for (const [mood, words] of Object.entries(MOOD_KEYWORDS)) {
    let score = 0;
    for (const w of words) {
      // Count occurrences (rough — word boundary isn't critical here)
      const idx = lower.indexOf(w);
      if (idx !== -1) score++;
      // Extra weight if it appears multiple times
      let pos = idx;
      while (pos !== -1) {
        pos = lower.indexOf(w, pos + w.length);
        if (pos !== -1) score += 0.5;
      }
    }
    if (score > 0) scores.push([mood, score]);
  }

  scores.sort((a, b) => b[1] - a[1]);
  return scores.slice(0, topN).map(([mood]) => mood).join(" ");
}

/** Check whether this invocation came from the council (has context but no
 *  explicit user-supplied args). */
function isCouncilInvocation(args: Record<string, unknown> | undefined): boolean {
  if (!args) return false;
  // Council invocations carry a `context` key injected by the backend;
  // direct LLM tool calls pass explicit parameters like query, uri, mode, etc.
  const keys = Object.keys(args);
  return keys.length === 1 && keys[0] === "context";
}

// ─── Tool helpers ────────────────────────────────────────────────────────

/**
 * Race a promise against a timeout. Rejects with a descriptive error if the
 * call exceeds `ms`. The label is included in logs and error messages so we
 * can pinpoint exactly which API call stalled.
 */
function timed<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label}: timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(new Error(`${label}: ${err?.message || err}`)); },
    );
  });
}

/** Convenience: run a timed call and fall back to `fallback` on any error,
 *  logging the failure so it surfaces in the Spindle console. */
function timedSafe<T>(promise: Promise<T>, ms: number, label: string, fallback: T): Promise<T> {
  return timed(promise, ms, label).catch((err: Error) => {
    spindle.log.warn(err.message);
    return fallback;
  });
}

/** Resolve a Last.fm track recommendation to a Spotify search result. */
async function resolveOnSpotify(trackName: string, artist: string): Promise<SearchResult | null> {
  try {
    const results = await spotify.search(`${trackName} ${artist}`);
    return results.length > 0 ? results[0] : null;
  } catch (err: any) {
    spindle.log.warn(`resolveOnSpotify("${trackName}", "${artist}"): ${err?.message}`);
    return null;
  }
}

// ─── Tool invocation handler ────────────────────────────────────────────

// Handle tool invocations via events
spindle.on("TOOL_INVOCATION", async (payload: any) => {
  if (!payload?.toolName || !payload?.requestId) return;

  // The council passes qualified names like "spotify_controls:spotify_search",
  // while direct LLM tool calls use bare names like "spotify_search".
  // Strip the extension prefix if present so handlers match either form.
  const rawName = payload.toolName;
  const toolName = rawName.includes(":") ? rawName.split(":").pop()! : rawName;
  const args: Record<string, unknown> = payload.args ?? {};
  const council = isCouncilInvocation(args);
  const context: string = (args.context as string) || "";

  // Tool invocations don't carry a userId, so tokens may not be loaded yet
  // (e.g. after a hot reload before the frontend reconnects). Try to load
  // them if we have a previously-set activeUserId.
  if (!spotify.isConnected()) {
    await spotify.loadTokens();
  }

  // ── spotify_search: search + play pipeline ──────────────────────────
  if (toolName === "spotify_search") {
    try {
      let query = args.query as string | undefined;
      let mode = args.mode as string | undefined;

      // Council invocation: extract mood from context, default to playlist mode
      if (council) {
        query = extractMoodFromContext(context) || "ambient";
        mode = "playlist";
      }

      if (!query) return "No search query provided.";
      if (!mode) mode = "playlist";

      if (mode === "playlist") {
        const playlists = await spotify.searchPlaylists(query);
        if (playlists.length > 0) {
          const best = playlists[0];
          await spotify.play({ contextUri: best.uri });
          pushStateAfterCommand();
          const others = playlists.slice(1, 5)
            .map((p, i) => `${i + 2}. "${p.name}" by ${p.owner} (${p.trackCount} tracks)`)
            .join("\n");
          const prefix = council ? `[Matched mood "${query}"] ` : "";
          return `${prefix}Now playing playlist "${best.name}" by ${best.owner} (${best.trackCount} tracks)${others ? `\n\nOther matches:\n${others}` : ""}`;
        }
        // Playlist search found nothing — fall through to track search
      }

      // Tracks mode (or playlist fallback)
      const results = await spotify.search(query);
      if (results.length === 0) return `No results found for "${query}".`;

      const best = results[0];
      await spotify.play({ trackUri: best.uri });
      pushStateAfterCommand();
      const others = results.slice(1, 5)
        .map((r, i) => `${i + 2}. "${r.name}" by ${r.artist} (${r.album})`)
        .join("\n");
      const prefix = council ? `[Searched for "${query}"] ` : "";
      return `${prefix}Now playing "${best.name}" by ${best.artist} (${best.album})${others ? `\n\nOther matches:\n${others}` : ""}`;
    } catch (err: any) {
      return `Search & play failed: ${err?.message}`;
    }
  }

  // ── spotify_search_similar: similar music discovery + play ───────────
  if (toolName === "spotify_search_similar") {
    try {
      // Get the currently playing track — this is the sole seed for similarity
      const state = lastState || await spotify.getCurrentPlayback();
      if (!state?.trackName || !state?.artistName) {
        return "Nothing is currently playing. Play something first so we can find similar tracks.";
      }

      // Query Last.fm for similar tracks (autocorrect enabled, sorted by match score)
      const similar = await spotify.getSimilarTracks(state.trackName, state.artistName, 5);

      if (similar.length === 0) {
        // Fallback: search Spotify for more by this artist
        const results = await spotify.search(state.artistName);
        if (results.length === 0) return `No similar tracks found for "${state.trackName}" by ${state.artistName}.`;
        await spotify.play({ trackUri: results[0].uri });
        pushStateAfterCommand();
        return `No Last.fm similarity data — playing "${results[0].name}" by ${results[0].artist} (more by artist)`;
      }

      // Resolve candidates on Spotify in parallel — just "track artist", no mood strings
      const resolved = (await Promise.all(
        similar.map((c) => resolveOnSpotify(c.name, c.artist))
      )).filter((r): r is SearchResult => r !== null);

      if (resolved.length === 0) return "Found similar tracks via Last.fm but could not match any on Spotify.";

      // Play the first track and queue the rest in parallel
      await spotify.play({ trackUri: resolved[0].uri });
      pushStateAfterCommand();

      const toQueue = resolved.slice(1);
      const queueResults = await Promise.all(
        toQueue.map(async (track) => {
          try {
            await spotify.addToQueue(track.uri);
            return `"${track.name}" by ${track.artist}`;
          } catch {
            return null;
          }
        })
      );
      const queued = queueResults.filter((q): q is string => q !== null);

      const queueLine = queued.length > 0 ? `\n\nQueued ${queued.length} similar tracks:\n${queued.map((q, i) => `${i + 1}. ${q}`).join("\n")}` : "";
      const prefix = council ? `[Similar music] ` : "";
      return `${prefix}Now playing "${resolved[0].name}" by ${resolved[0].artist} (similar to "${state.trackName}" by ${state.artistName})${queueLine}`;
    } catch (err: any) {
      if (err?.message?.includes("Last.fm API key not configured")) {
        return "Last.fm API key is not configured. Please add it in the Spotify Controls settings.";
      }
      return `Similar search failed: ${err?.message}`;
    }
  }

  // ── spotify_mood_discover: mood-matched but varied discovery ────────
  if (toolName === "spotify_mood_discover") {
    const CALL_TIMEOUT = 4000; // Per-call timeout for CORS-proxied requests
    try {
      // Use cached state to avoid an extra API call
      const state = lastState;
      if (!state?.trackName || !state?.artistName) {
        return "Nothing is currently playing. Play something first so we can discover mood-matching music.";
      }

      spindle.log.info(`[mood_discover] Starting for "${state.trackName}" by ${state.artistName}`);

      // ── Resolve mood tags ────────────────────────────────────────
      // Priority: explicit mood arg > context extraction > track tags > artist tags
      let moodTags: string[] = [];
      const moodArg = args.mood as string | undefined;

      if (moodArg) {
        const terms = moodArg.split(/[,\s]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
        for (const term of terms) {
          const mapped = MOOD_TO_LASTFM_TAGS[term];
          if (mapped) {
            moodTags.push(...mapped);
          } else if (MOOD_TAG_SET.has(term)) {
            moodTags.push(term);
          }
        }
        moodTags = [...new Set(moodTags)];
        spindle.log.info(`[mood_discover] Mood from arg "${moodArg}" → tags: [${moodTags.join(", ")}]`);
      }

      if (moodTags.length === 0 && context) {
        const moodStr = extractMoodFromContext(context);
        if (moodStr) {
          for (const mood of moodStr.split(" ")) {
            const mapped = MOOD_TO_LASTFM_TAGS[mood];
            if (mapped) moodTags.push(...mapped);
          }
          moodTags = [...new Set(moodTags)];
          spindle.log.info(`[mood_discover] Mood from context → "${moodStr}" → tags: [${moodTags.join(", ")}]`);
        }
      }

      // ── Batch 1: Fetch Last.fm data in parallel ────────────────
      const needTagFallback = moodTags.length === 0;
      const [trackTags, artistTags, similarArtists] = await Promise.all([
        needTagFallback
          ? timedSafe(spotify.getTrackTopTags(state.trackName, state.artistName), CALL_TIMEOUT, "track.getTopTags", [])
          : Promise.resolve([]),
        needTagFallback
          ? timedSafe(spotify.getArtistTopTags(state.artistName), CALL_TIMEOUT, "artist.getTopTags", [])
          : Promise.resolve([]),
        timedSafe(spotify.getSimilarArtists(state.artistName, 5), CALL_TIMEOUT, "artist.getSimilar", []),
      ]);

      if (needTagFallback) {
        moodTags = extractMoodTags(trackTags);
        if (moodTags.length === 0) moodTags = extractMoodTags(artistTags, 0);
        spindle.log.info(`[mood_discover] Mood from tags fallback → [${moodTags.join(", ")}]`);
      }

      if (moodTags.length === 0) {
        return `Could not determine the mood of "${state.trackName}" by ${state.artistName}. No mood tags found on Last.fm.`;
      }

      // ── Batch 2: Query tag.getTopTracks for top 2 mood tags ───────
      const queryTags = moodTags.slice(0, 2);
      const page = Math.floor(Math.random() * 3) + 1;
      spindle.log.info(`[mood_discover] Querying tag.getTopTracks for [${queryTags.join(", ")}] page=${page}`);
      const tagResults = await Promise.all(
        queryTags.map(tag =>
          timedSafe(spotify.getTopTracksByTag(tag, 20, page), CALL_TIMEOUT, `tag.getTopTracks("${tag}")`, [])
        )
      );

      // ── Build candidate pool — score, filter, diversify (CPU only) ─
      const blockedArtists = new Set(similarArtists.map(a => a.toLowerCase()));
      blockedArtists.add(state.artistName.toLowerCase());
      const currentTrackLower = state.trackName.toLowerCase();
      const currentArtistLower = state.artistName.toLowerCase();

      const candidateMap = new Map<string, { name: string; artist: string; score: number }>();
      for (const tracks of tagResults) {
        for (const track of tracks) {
          const artistLower = track.artist.toLowerCase();
          if (track.name.toLowerCase() === currentTrackLower && artistLower === currentArtistLower) continue;
          if (blockedArtists.has(artistLower)) continue;

          const key = `${track.name.toLowerCase()}::${artistLower}`;
          const existing = candidateMap.get(key);
          if (existing) {
            existing.score++;
          } else {
            candidateMap.set(key, { name: track.name, artist: track.artist, score: 1 });
          }
        }
      }

      let candidates = Array.from(candidateMap.values());

      // Max 1 track per artist
      const seenArtists = new Set<string>();
      candidates = candidates.filter(c => {
        const a = c.artist.toLowerCase();
        if (seenArtists.has(a)) return false;
        seenArtists.add(a);
        return true;
      });

      // Sort by score, shuffle within tiers
      candidates.sort((a, b) => b.score - a.score);
      const shuffled: typeof candidates = [];
      let ci = 0;
      while (ci < candidates.length) {
        let cj = ci;
        while (cj < candidates.length && candidates[cj].score === candidates[ci].score) cj++;
        const tier = candidates.slice(ci, cj);
        for (let k = tier.length - 1; k > 0; k--) {
          const m = Math.floor(Math.random() * (k + 1));
          [tier[k], tier[m]] = [tier[m], tier[k]];
        }
        shuffled.push(...tier);
        ci = cj;
      }
      candidates = shuffled.slice(0, 5);

      if (candidates.length === 0) {
        const totalResults = tagResults.reduce((n, r) => n + r.length, 0);
        return `Found mood tags [${queryTags.join(", ")}] with ${totalResults} raw results, but 0 remained after filtering ${blockedArtists.size} blocked artists. Try playing a different track.`;
      }

      spindle.log.info(`[mood_discover] Resolving ${candidates.length} candidates on Spotify`);

      // ── Batch 3: Resolve on Spotify + play ─────────────────────
      const resolved = (await Promise.all(
        candidates.map(c =>
          timed(resolveOnSpotify(c.name, c.artist), CALL_TIMEOUT, `spotify.search("${c.name}")`)
            .catch((err: Error) => { spindle.log.warn(err.message); return null; })
        )
      )).filter((r): r is SearchResult => r !== null);

      if (resolved.length === 0) return "Found mood-matching tracks via Last.fm but could not match any on Spotify.";

      await timed(spotify.play({ trackUri: resolved[0].uri }), CALL_TIMEOUT, "spotify.play");
      pushStateAfterCommand();

      // Queue remaining — fire-and-forget, don't let queue failures delay the response
      const toQueue = resolved.slice(1);
      const queued: string[] = [];
      if (toQueue.length > 0) {
        await Promise.all(
          toQueue.map(async (track) => {
            try {
              await timed(spotify.addToQueue(track.uri), CALL_TIMEOUT, `spotify.queue("${track.name}")`);
              queued.push(`"${track.name}" by ${track.artist}`);
            } catch (err: any) {
              spindle.log.warn(`Queue failed for "${track.name}": ${err?.message}`);
            }
          })
        );
      }

      const moodDesc = queryTags.join(", ");
      const queueLine = queued.length > 0
        ? `\n\nQueued ${queued.length} varied tracks:\n${queued.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
        : "";
      const prefix = (council || (moodArg && context)) ? `[Mood discovery: ${moodDesc}] ` : "";
      spindle.log.info(`[mood_discover] Done — playing "${resolved[0].name}", ${queued.length} queued`);
      return `${prefix}Now playing "${resolved[0].name}" by ${resolved[0].artist} (mood: ${moodDesc}, varied from "${state.trackName}")${queueLine}`;
    } catch (err: any) {
      spindle.log.error(`[mood_discover] ${err?.message}`);
      if (err?.message?.includes("Last.fm API key not configured")) {
        return "Last.fm API key is not configured. Please add it in the Spotify Controls settings.";
      }
      return `Mood discovery failed: ${err?.message}`;
    }
  }

  // ── spotify_queue: add to queue (unchanged) ─────────────────────────
  if (toolName === "spotify_queue") {
    try {
      const uri = args.uri as string | undefined;
      if (!uri && council) {
        return "Cannot queue a track without a URI. Use spotify_search to discover tracks first.";
      }
      await spotify.addToQueue(uri || "");
      return "Track added to queue.";
    } catch (err: any) {
      return `Failed to queue track: ${err?.message}`;
    }
  }
});

// ─── Init ────────────────────────────────────────────────────────────────

(async () => {
  await loadCachedState();
  spindle.log.info("Spotify Controls loaded!");
})();
