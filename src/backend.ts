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
    return { html: errorPage("Token exchange failed. Please try again.") };
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
  description: "Find music similar to what is currently playing and start playback. Uses the current track to query Last.fm for similar songs, optionally filtered by mood/genre tags. Resolves the best match on Spotify and plays it, queuing additional similar tracks. Requires Last.fm API key.",
  council_eligible: true,
  parameters: {
    type: "object",
    properties: {
      mood: { type: "string", description: "Optional mood/genre tags to influence discovery (e.g. 'dark ambient', 'synthwave', 'chill electronic'). Combined with the currently playing track for better results." },
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

/** Resolve a Last.fm track recommendation to a Spotify search result. */
async function resolveOnSpotify(trackName: string, artist: string): Promise<SearchResult | null> {
  try {
    const results = await spotify.search(`${trackName} ${artist}`);
    return results.length > 0 ? results[0] : null;
  } catch {
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
      let mood = args.mood as string | undefined;

      // Council invocation: extract mood from context
      if (council) {
        mood = extractMoodFromContext(context) || undefined;
      }

      // Get the currently playing track
      const state = lastState || await spotify.getCurrentPlayback();
      const hasCurrentTrack = state?.trackName && state?.artistName;

      if (!hasCurrentTrack && !mood) {
        return "Nothing is currently playing and no mood provided. Play something first or provide a mood.";
      }

      // Gather candidates from Last.fm in parallel
      const candidates: { name: string; artist: string }[] = [];
      const sources: string[] = [];

      const promises: Promise<void>[] = [];

      // Similar tracks from Last.fm (based on current song)
      if (hasCurrentTrack) {
        promises.push(
          spotify.getSimilarTracks(state!.trackName, state!.artistName)
            .then((tracks) => {
              candidates.push(...tracks);
              if (tracks.length > 0) sources.push(`similar to "${state!.trackName}" by ${state!.artistName}`);
            })
            .catch(() => { /* Last.fm unavailable — continue with other sources */ })
        );
      }

      // Tag-based tracks from Last.fm (based on mood)
      if (mood) {
        promises.push(
          spotify.getTopTracksByTag(mood)
            .then((tracks) => {
              candidates.push(...tracks);
              if (tracks.length > 0) sources.push(`mood "${mood}"`);
            })
            .catch(() => { /* Last.fm unavailable — continue with other sources */ })
        );
      }

      await Promise.all(promises);

      // Deduplicate by name+artist (case-insensitive)
      const seen = new Set<string>();
      const unique = candidates.filter((c) => {
        const key = `${c.name.toLowerCase()}::${c.artist.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (unique.length === 0) {
        // Fallback: search Spotify directly with combined terms
        const fallbackQuery = [
          hasCurrentTrack ? state!.artistName : "",
          mood || "",
        ].filter(Boolean).join(" ");
        const results = await spotify.search(fallbackQuery);
        if (results.length === 0) return "Could not find similar music.";
        await spotify.play({ trackUri: results[0].uri });
        pushStateAfterCommand();
        return `Now playing "${results[0].name}" by ${results[0].artist} (Spotify search fallback for "${fallbackQuery}")`;
      }

      // Resolve top candidates on Spotify (limit to 8 to avoid excessive API calls)
      const toResolve = unique.slice(0, 8);
      const resolved = (await Promise.all(
        toResolve.map((c) => resolveOnSpotify(c.name, c.artist))
      )).filter((r): r is SearchResult => r !== null);

      if (resolved.length === 0) return "Found similar tracks via Last.fm but could not match any on Spotify.";

      // Play the first track
      await spotify.play({ trackUri: resolved[0].uri });
      pushStateAfterCommand();

      // Queue the rest
      const queued: string[] = [];
      for (const track of resolved.slice(1)) {
        try {
          await spotify.addToQueue(track.uri);
          queued.push(`"${track.name}" by ${track.artist}`);
        } catch {
          // Skip tracks that fail to queue
        }
      }

      const sourceLine = sources.length > 0 ? `\nSources: ${sources.join(", ")}` : "";
      const queueLine = queued.length > 0 ? `\n\nQueued ${queued.length} similar tracks:\n${queued.map((q, i) => `${i + 1}. ${q}`).join("\n")}` : "";
      const prefix = council ? `[Similar music] ` : "";
      return `${prefix}Now playing "${resolved[0].name}" by ${resolved[0].artist}${sourceLine}${queueLine}`;
    } catch (err: any) {
      if (err?.message?.includes("Last.fm API key not configured")) {
        return "Last.fm API key is not configured. Please add it in the Spotify Controls settings.";
      }
      return `Similar search failed: ${err?.message}`;
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
