declare const spindle: import("lumiverse-spindle-types").SpindleAPI;

import type { FrontendToBackend, BackendToFrontend, SpotifyConfig, WidgetPrefs } from "./types";
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

spindle.registerTool({
  name: "spotify_search",
  display_name: "Spotify Search",
  description: "Search for tracks on Spotify. Returns track names, artists, albums, and URIs.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query for tracks" },
    },
    required: ["query"],
  },
});

spindle.registerTool({
  name: "spotify_queue",
  display_name: "Spotify Queue",
  description: "Add a track to the Spotify playback queue by its URI.",
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

spindle.registerTool({
  name: "spotify_find_playlist",
  display_name: "Find Spotify Playlist",
  description: "Search for Spotify playlists using 3-4 words describing the atmosphere, mood, or tone of a scene. Returns matching playlists that can be played with spotify_play.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "3-4 words describing the scene's atmosphere and tone (e.g. 'dark ambient mysterious', 'upbeat jazz cafe', 'epic orchestral battle')" },
    },
    required: ["query"],
  },
});

spindle.registerTool({
  name: "spotify_play",
  display_name: "Spotify Play",
  description: "Start playback of a Spotify track, playlist, or album by URI.",
  parameters: {
    type: "object",
    properties: {
      uri: { type: "string", description: "Spotify URI (spotify:track:..., spotify:playlist:..., or spotify:album:...)" },
    },
    required: ["uri"],
  },
});

spindle.registerTool({
  name: "spotify_playlist_tracks",
  display_name: "Spotify Playlist Tracks",
  description: "Preview the tracks in a Spotify playlist before playing it.",
  parameters: {
    type: "object",
    properties: {
      playlist_uri: { type: "string", description: "Spotify playlist URI" },
    },
    required: ["playlist_uri"],
  },
});

spindle.registerTool({
  name: "spotify_recommend",
  display_name: "Music Recommendations",
  description: "Get music recommendations via Last.fm. Modes: 'similar_tracks' (find tracks like a given one), 'similar_artists' (find artists like a given one), 'tag_top_tracks' (top tracks for a genre/mood tag like 'dark ambient', 'synthwave', 'chill').",
  parameters: {
    type: "object",
    properties: {
      mode: { type: "string", enum: ["similar_tracks", "similar_artists", "tag_top_tracks"], description: "Recommendation mode" },
      track: { type: "string", description: "Track name (for similar_tracks mode)" },
      artist: { type: "string", description: "Artist name (for similar_tracks or similar_artists mode)" },
      tag: { type: "string", description: "Genre/mood tag (for tag_top_tracks mode)" },
    },
    required: ["mode"],
  },
});

// Handle tool invocations via events
spindle.on("TOOL_INVOCATION", async (payload: any) => {
  if (!payload?.toolName || !payload?.requestId) return;

  if (payload.toolName === "spotify_search") {
    try {
      const results = await spotify.search(payload.args?.query || "");
      const formatted = results
        .map((r, i) => `${i + 1}. "${r.name}" by ${r.artist} (${r.album}) — ${r.uri}`)
        .join("\n");
      return formatted || "No results found.";
    } catch (err: any) {
      return `Search failed: ${err?.message}`;
    }
  }

  if (payload.toolName === "spotify_queue") {
    try {
      await spotify.addToQueue(payload.args?.uri || "");
      return "Track added to queue.";
    } catch (err: any) {
      return `Failed to queue track: ${err?.message}`;
    }
  }

  if (payload.toolName === "spotify_find_playlist") {
    try {
      const results = await spotify.searchPlaylists(payload.args?.query || "");
      const formatted = results
        .map((r, i) => `${i + 1}. "${r.name}" by ${r.owner} (${r.trackCount} tracks) — ${r.uri}`)
        .join("\n");
      return formatted || "No playlists found.";
    } catch (err: any) {
      return `Playlist search failed: ${err?.message}`;
    }
  }

  if (payload.toolName === "spotify_play") {
    try {
      const uri: string = payload.args?.uri || "";
      if (uri.startsWith("spotify:track:")) {
        await spotify.play({ trackUri: uri });
      } else if (uri.startsWith("spotify:playlist:") || uri.startsWith("spotify:album:")) {
        await spotify.play({ contextUri: uri });
      } else {
        return `Invalid URI format: ${uri}`;
      }
      pushStateAfterCommand();
      return `Now playing: ${uri}`;
    } catch (err: any) {
      return `Playback failed: ${err?.message}`;
    }
  }

  if (payload.toolName === "spotify_playlist_tracks") {
    try {
      const uri: string = payload.args?.playlist_uri || "";
      const id = uri.startsWith("spotify:playlist:") ? uri.split(":")[2] : uri;
      const tracks = await spotify.getPlaylistTracks(id);
      const formatted = tracks
        .map((t, i) => `${i + 1}. "${t.name}" by ${t.artist} (${t.album}) — ${t.uri}`)
        .join("\n");
      return formatted || "No tracks found in playlist.";
    } catch (err: any) {
      return `Failed to get playlist tracks: ${err?.message}`;
    }
  }

  if (payload.toolName === "spotify_recommend") {
    try {
      const mode: string = payload.args?.mode || "";
      if (mode === "similar_tracks") {
        const track = payload.args?.track;
        const artist = payload.args?.artist;
        if (!track || !artist) return "Both 'track' and 'artist' parameters are required for similar_tracks mode.";
        const results = await spotify.getSimilarTracks(track, artist);
        const formatted = results
          .map((r, i) => `${i + 1}. "${r.name}" by ${r.artist}`)
          .join("\n");
        return formatted || "No similar tracks found.";
      } else if (mode === "similar_artists") {
        const artist = payload.args?.artist;
        if (!artist) return "The 'artist' parameter is required for similar_artists mode.";
        const results = await spotify.getSimilarArtists(artist);
        return results.length > 0 ? `Similar artists: ${results.join(", ")}` : "No similar artists found.";
      } else if (mode === "tag_top_tracks") {
        const tag = payload.args?.tag;
        if (!tag) return "The 'tag' parameter is required for tag_top_tracks mode.";
        const results = await spotify.getTopTracksByTag(tag);
        const formatted = results
          .map((r, i) => `${i + 1}. "${r.name}" by ${r.artist}`)
          .join("\n");
        return formatted || "No tracks found for that tag.";
      } else {
        return `Unknown mode: ${mode}. Use 'similar_tracks', 'similar_artists', or 'tag_top_tracks'.`;
      }
    } catch (err: any) {
      if (err?.message?.includes("Last.fm API key not configured")) {
        return "Last.fm API key is not configured. Please ask the user to add their Last.fm API key in the Spotify Controls settings.";
      }
      return `Recommendation failed: ${err?.message}`;
    }
  }
});

// ─── Init ────────────────────────────────────────────────────────────────

(async () => {
  await loadCachedState();
  spindle.log.info("Spotify Controls loaded!");
})();
