declare const spindle: import("lumiverse-spindle-types").SpindleAPI;

import type { InterceptorResultDTO, LlmMessageDTO, LlmMessagePartDTO } from "lumiverse-spindle-types";
import type { FrontendToBackend, BackendToFrontend, SpotifyConfig, WidgetPrefs, SearchResult, AlbumColors, MiniPlayerStyle, PlaybackState, SongSnapshot, MessageSongEntry } from "./types";
import * as spotify from "./spotify-api";
import {
  createLyricsRequestCoordinator,
  type LyricsRequestCoordinator,
  type LyricsRequestTrack,
} from "./lyrics-request-coordinator";

// ─── State ───────────────────────────────────────────────────────────────

let activeUserId: string | null = null;

type PendingOAuth = {
  state: string;
  redirectUri: string;
  clientId: string;
  clientSecret?: string;
  codeVerifier: string;
  userId: string;
};

type UserSession = {
  pollingInterval: ReturnType<typeof setTimeout> | null;
  pollingGeneration: number;
  nullStateRetries: number;
  lastState: PlaybackState | null;
  lastStateUpdatedAt: number;
  lyricsRequests: LyricsRequestCoordinator<spotify.LyricsData>;
  initialized: boolean;
};

const sessions = new Map<string, UserSession>();
const pendingOAuthByState = new Map<string, PendingOAuth>();
const LYRICS_CACHE_ENTRIES = 24;

// ─── Helpers ─────────────────────────────────────────────────────────────

function send(msg: BackendToFrontend, userId: string) {
  spindle.sendToFrontend(msg, userId);
}

function getSession(userId: string): UserSession {
  let session = sessions.get(userId);
  if (!session) {
    session = {
      pollingInterval: null,
      pollingGeneration: 0,
      nullStateRetries: 0,
      lastState: null,
      lastStateUpdatedAt: 0,
      lyricsRequests: createLyricsRequestCoordinator(
        (track) => spotify.getLyrics(
          track.trackName,
          track.artistName,
          track.albumName,
          track.durationMs / 1000,
          userId,
        ),
        LYRICS_CACHE_ENTRIES,
      ),
      initialized: false,
    };
    sessions.set(userId, session);
  }
  return session;
}

function syncActiveUserState(userId: string) {
  activeUserId = userId;
  spotify.setActiveUser(userId);
  const session = getSession(userId);
  lastState = session.lastState;
  lastStateUpdatedAt = session.lastStateUpdatedAt;
}

async function loadConfig(userId?: string): Promise<SpotifyConfig> {
  const stored = await spindle.userStorage.getJson<{ clientId: string; promptAudioPreviewEnabled?: boolean }>("config.json", {
    fallback: { clientId: "", promptAudioPreviewEnabled: false },
    userId,
  });
  const [clientSecret, lastfmApiKey] = await Promise.all([
    spindle.enclave.get("client_secret", userId),
    spindle.enclave.get("lastfm_api_key", userId),
  ]);
  return {
    clientId: stored.clientId,
    clientSecret: clientSecret || "",
    lastfmApiKey: lastfmApiKey || undefined,
    promptAudioPreviewEnabled: !!stored.promptAudioPreviewEnabled,
  };
}

async function saveConfig(config: SpotifyConfig, userId?: string): Promise<void> {
  await spindle.userStorage.setJson("config.json", {
    clientId: config.clientId,
    promptAudioPreviewEnabled: !!config.promptAudioPreviewEnabled,
  }, { userId });
  await Promise.all([
    config.clientSecret
      ? spindle.enclave.put("client_secret", config.clientSecret, userId)
      : spindle.enclave.delete("client_secret", userId),
    config.lastfmApiKey
      ? spindle.enclave.put("lastfm_api_key", config.lastfmApiKey, userId)
      : Promise.resolve(),
  ]);
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function createCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

async function createCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

function getLoopbackRedirectUri(serverBaseUrl: string): string {
  const url = new URL(serverBaseUrl);
  url.hostname = "127.0.0.1";
  return url.origin + spindle.oauth.getCallbackUrl();
}

const MIGRATION_FLAG = "enclave_migration_done.json";

async function migrateToEnclave(userId: string): Promise<void> {
  try {
    // Skip if already migrated
    const done = await spindle.userStorage.getJson<{ done: boolean }>(MIGRATION_FLAG, {
      fallback: { done: false },
      userId,
    });
    if (done.done) return;

    // Migrate config secrets (clientSecret, lastfmApiKey) from plaintext storage
    const oldUserConfig = await spindle.userStorage.getJson<SpotifyConfig>("config.json", {
      fallback: { clientId: "", clientSecret: "" },
      userId,
    });
    const oldSharedConfig = await spindle.storage.getJson<SpotifyConfig>("config.json", {
      fallback: { clientId: "", clientSecret: "" },
    });
    const oldConfig = oldUserConfig.clientId || oldUserConfig.clientSecret || oldUserConfig.lastfmApiKey
      ? oldUserConfig
      : oldSharedConfig;
    if (oldConfig.clientSecret || oldConfig.lastfmApiKey) {
      if (oldConfig.clientSecret) {
        await spindle.enclave.put("client_secret", oldConfig.clientSecret, userId);
      }
      if (oldConfig.lastfmApiKey) {
        await spindle.enclave.put("lastfm_api_key", oldConfig.lastfmApiKey, userId);
      }
      await spindle.userStorage.setJson("config.json", {
        clientId: oldConfig.clientId,
        promptAudioPreviewEnabled: !!oldConfig.promptAudioPreviewEnabled,
      }, { userId });
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

    await spindle.userStorage.setJson(MIGRATION_FLAG, { done: true }, { userId });
  } catch (err: any) {
    spindle.log.warn(`Enclave migration: ${err?.message}`);
  }
}

async function handleUserChange(userId: string): Promise<void> {
  const session = getSession(userId);
  if (!session.initialized) {
    await migrateToEnclave(userId);
    await loadCachedState(userId);
    await spotify.loadTokens(userId);
    session.initialized = true;
  }
  if (activeUserId === userId || !activeUserId || spotify.isConnected(userId)) {
    syncActiveUserState(userId);
  }
  if (spotify.isConnected(userId)) {
    startPolling(userId);
  } else {
    stopPolling(userId);
  }
}

// ─── Cached state ────────────────────────────────────────────────────────

const DEFAULT_SIZE_PRESETS = { small: 36, medium: 48, large: 64 } as const;
const MODERN_SIZE_PRESETS = { small: 112, medium: 128, large: 144 } as const;
const DEFAULT_WIDGET_SIZE_MIN = 24;
const DEFAULT_WIDGET_SIZE_MAX = 128;
const MODERN_WIDGET_SIZE_MIN = 112;
const MODERN_WIDGET_SIZE_MAX = 192;

function getSizePresets(style: MiniPlayerStyle) {
  return style === "modern" ? MODERN_SIZE_PRESETS : DEFAULT_SIZE_PRESETS;
}

function getSizeBounds(style: MiniPlayerStyle) {
  return style === "modern"
    ? { min: MODERN_WIDGET_SIZE_MIN, max: MODERN_WIDGET_SIZE_MAX }
    : { min: DEFAULT_WIDGET_SIZE_MIN, max: DEFAULT_WIDGET_SIZE_MAX };
}

function clampWidgetSize(size: number, style: MiniPlayerStyle): number {
  const { min, max } = getSizeBounds(style);
  return Math.max(min, Math.min(size, max));
}

function isSizeMode(value: unknown): value is WidgetPrefs["sizeMode"] {
  return value === "small" || value === "medium" || value === "large" || value === "custom";
}

function inferSizeMode(size: number, style: MiniPlayerStyle): WidgetPrefs["sizeMode"] {
  const presets = getSizePresets(style);
  if (size === presets.small) return "small";
  if (size === presets.large) return "large";
  if (size !== presets.medium) return "custom";
  return "medium";
}

function normalizeWidgetPrefs(prefs?: Partial<WidgetPrefs> | null): WidgetPrefs {
  const miniPlayerStyle = prefs?.miniPlayerStyle === "modern" ? "modern" : "default";
  const presets = getSizePresets(miniPlayerStyle);
  let sizeMode = isSizeMode(prefs?.sizeMode) ? prefs.sizeMode : undefined;
  let size = typeof prefs?.size === "number"
    ? clampWidgetSize(prefs.size, miniPlayerStyle)
    : presets.medium;

  if (sizeMode && sizeMode !== "custom") {
    size = presets[sizeMode];
  } else if (!sizeMode) {
    sizeMode = inferSizeMode(size, miniPlayerStyle);
  }

  return {
    size,
    shape: prefs?.shape === "squircle" ? "squircle" : "circle",
    sizeMode,
    miniPlayerStyle,
    x: typeof prefs?.x === "number" ? prefs.x : undefined,
    y: typeof prefs?.y === "number" ? prefs.y : undefined,
  };
}

let lastState: PlaybackState | null = null;
let lastStateUpdatedAt = 0;

async function loadCachedState(userId: string): Promise<void> {
  const session = getSession(userId);
  try {
    const cachedState = await spindle.userStorage.getJson<PlaybackState>("last_state.json", { userId });
    session.lastState = cachedState ? { ...cachedState, albumArtUrl: null } : null;
    session.lastStateUpdatedAt = 0;
  } catch {
    session.lastState = null;
    session.lastStateUpdatedAt = 0;
  }
  if (activeUserId === userId) syncActiveUserState(userId);
}

function buildLyricsRequestTrack(state: PlaybackState): LyricsRequestTrack {
  return {
    trackUri: state.trackUri,
    trackName: state.trackName,
    artistName: state.artistName,
    albumName: state.albumName,
    durationMs: state.durationMs,
  };
}

function getCachedLyricsForTrack(userId: string, trackUri: string): spotify.LyricsData | null | undefined {
  return getSession(userId).lyricsRequests.peek(trackUri);
}

async function getLyricsForState(state: PlaybackState, userId: string): Promise<spotify.LyricsData | null> {
  const lyrics = await getSession(userId).lyricsRequests.get(buildLyricsRequestTrack(state));
  if (getSession(userId).lastState?.trackUri === state.trackUri) {
    pushLyricsMacros(lyrics);
  }
  return lyrics;
}

function prefetchLyricsForState(userId: string, state: PlaybackState | null): void {
  if (!state?.trackUri) return;

  const cachedLyrics = getCachedLyricsForTrack(userId, state.trackUri);
  if (cachedLyrics !== undefined) {
    if (getSession(userId).lastState?.trackUri === state.trackUri) {
      pushLyricsMacros(cachedLyrics);
    }
    return;
  }

  void getLyricsForState(state, userId);
}

function syncLyricsForTrackChange(userId: string, previousTrackUri: string | null, state: PlaybackState | null): void {
  const nextTrackUri = state?.trackUri ?? null;
  if (nextTrackUri === previousTrackUri) return;

  if (!nextTrackUri) {
    pushLyricsMacros(null);
    return;
  }

  const cachedLyrics = getCachedLyricsForTrack(userId, nextTrackUri);
  if (cachedLyrics !== undefined) {
    pushLyricsMacros(cachedLyrics);
    return;
  }

  pushLyricsMacros(null);
  prefetchLyricsForState(userId, state);
}

async function cacheState(userId: string, state: PlaybackState | null): Promise<void> {
  const session = getSession(userId);
  const previousTrackUri = session.lastState?.trackUri ?? null;
  session.lastState = state;
  session.lastStateUpdatedAt = state ? Date.now() : 0;
  if (activeUserId === userId) syncActiveUserState(userId);

  if (state) {
    await spindle.userStorage.setJson("last_state.json", state, { userId }).catch(() => {});
  } else {
    await spindle.userStorage.delete("last_state.json", userId).catch(() => {});
  }
  pushPlaybackMacros(state);
  syncLyricsForTrackChange(userId, previousTrackUri, state);
}

// ─── Permission-aware polling ────────────────────────────────────────────

spindle.permissions.onChanged(({ permission, granted }) => {
  if (permission !== "cors_proxy") return;
  if (granted) {
    for (const userId of sessions.keys()) {
      if (spotify.isConnected(userId)) startPolling(userId);
    }
  } else if (!granted) {
    for (const userId of sessions.keys()) {
      stopPolling(userId);
      send({ type: "state", playbackState: null, connected: false }, userId);
    }
  }
});

const POLL_ACTIVE_MS = 5000;
const POLL_PAUSED_MS = 15000;

function startPolling(userId: string) {
  stopPolling(userId);
  const session = getSession(userId);
  session.pollingGeneration += 1;
  const generation = session.pollingGeneration;
  scheduleNextPoll(userId);
  void primePlaybackState(generation, userId);
}

/** Tracks consecutive null-state polls so we keep fast-polling through brief
 *  Spotify API gaps (e.g. during track transitions on external devices). */
const MAX_NULL_RETRIES = 3;

function scheduleNextPoll(userId: string) {
  const session = getSession(userId);
  // Use fast polling when playing, or when state just went null (may be
  // mid-transition on an external device — keep checking quickly).
  const useFastPoll = session.lastState?.isPlaying || session.nullStateRetries > 0;
  const interval = useFastPoll ? POLL_ACTIVE_MS : POLL_PAUSED_MS;

  session.pollingInterval = setTimeout(async () => {
    if (!spotify.isConnected(userId)) {
      scheduleNextPoll(userId);
      return;
    }
    const previousUri = session.lastState?.trackUri ?? null;
    try {
      const state = await spotify.getCurrentPlayback(userId);
      // Track null-state transitions to avoid falling into 15s slow polling
      // while Spotify is briefly between tracks
      if (!state && previousUri) {
        session.nullStateRetries = Math.min(session.nullStateRetries + 1, MAX_NULL_RETRIES);
      } else {
        session.nullStateRetries = 0;
      }
      await cacheState(userId, state);
      send({ type: "state", playbackState: state, connected: true }, userId);

      // If the track changed externally, do a quick follow-up fetch so the
      // frontend gets the most settled state (progress, duration, etc.)
      if (state && previousUri && state.trackUri !== previousUri) {
        setTimeout(async () => {
          try {
            const fresh = await spotify.getCurrentPlayback(userId);
            if (fresh) {
              await cacheState(userId, fresh);
              send({ type: "state", playbackState: fresh, connected: true }, userId);
            }
          } catch {}
        }, 1200);
      }
    } catch (err: any) {
      spindle.log.warn(`Polling error: ${err?.message}`);
    }
    scheduleNextPoll(userId);
  }, interval);
}

function stopPolling(userId: string) {
  const session = getSession(userId);
  if (session.pollingInterval) {
    clearTimeout(session.pollingInterval);
    session.pollingInterval = null;
  }
  session.pollingGeneration += 1;
}

/** Fetch and push current playback state to the frontend. */
async function pushStateUpdate(userId: string): Promise<PlaybackState | null> {
  try {
    const state = await spotify.getCurrentPlayback(userId);
    await cacheState(userId, state);
    send({ type: "state", playbackState: state, connected: true }, userId);
    return state;
  } catch {
    return null;
  }
}

async function primePlaybackState(generation: number, userId: string): Promise<void> {
  const session = getSession(userId);
  const retryDelays = [0, 1000, 3000];

  for (const delay of retryDelays) {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    if (generation !== session.pollingGeneration || !spotify.isConnected(userId)) {
      return;
    }

    const state = await pushStateUpdate(userId);
    if (state) {
      return;
    }
  }
}

/**
 * Push a state update after a short delay.
 * Spotify's API needs a moment to reflect changes from playback commands.
 *
 * When `expectTrackChange` is true (e.g. next/previous), schedules multiple
 * retries so we keep fetching until the track URI actually changes — Spotify
 * can take up to a few seconds to reflect a skip.
 */
function pushStateAfterCommand(userId: string, expectTrackChange = false) {
  if (!expectTrackChange) {
    setTimeout(() => pushStateUpdate(userId), 300);
    return;
  }
  const previousUri = getSession(userId).lastState?.trackUri ?? null;
  const retryAt = [300, 900, 1800, 3500];
  for (const delay of retryAt) {
    setTimeout(async () => {
      // If a previous retry already detected the change, skip
      if (getSession(userId).lastState?.trackUri !== previousUri) return;
      await pushStateUpdate(userId);
    }, delay);
  }
}

// ─── OAuth callback handler ─────────────────────────────────────────────

async function completeOAuthCallback(params: Record<string, string>) {
  const { code, state, error } = params;
  const pendingOAuth = state ? pendingOAuthByState.get(state) ?? null : null;
  const pendingUserId = pendingOAuth?.userId;

  if (error) {
    spindle.log.error(`Spotify OAuth error: ${error}`);
    if (pendingUserId) {
      send({ type: "error", message: `Spotify authorization denied: ${error}` }, pendingUserId);
    }
    return { html: errorPage(`Authorization denied: ${error}`) };
  }

  if (!code) {
    return { html: errorPage("OAuth callback did not include an authorization code.") };
  }

  if (!pendingOAuth) {
    return { html: errorPage("Invalid or expired OAuth state. Please try connecting again.") };
  }

  const { redirectUri, clientId, clientSecret, codeVerifier, userId: oauthUserId } = pendingOAuth;
  pendingOAuthByState.delete(state);

  try {
    syncActiveUserState(oauthUserId);
    const tokens = await spotify.exchangeCodeForTokens(code, redirectUri, clientId, clientSecret, codeVerifier);
    await spotify.saveTokens(tokens, oauthUserId);
    getSession(oauthUserId).initialized = true;
    send({ type: "connected" }, oauthUserId);
    startPolling(oauthUserId);
    return { html: successPage() };
  } catch (err: any) {
    spindle.log.error(`OAuth token exchange failed: ${err?.message}`);
    send({ type: "error", message: `Authentication failed: ${err?.message}` }, oauthUserId);
    return { html: errorPage(err?.message || "Token exchange failed. Please try again.") };
  }
}

function parseCallbackUrl(value: string): Record<string, string> {
  const trimmed = value.trim();
  const query = trimmed.includes("?") ? trimmed.slice(trimmed.indexOf("?") + 1) : trimmed;
  const params = new URLSearchParams(query);
  const result: Record<string, string> = {};
  for (const [key, paramValue] of params) {
    result[key] = paramValue;
  }
  return result;
}

spindle.oauth.onCallback(async (params) => {
  return completeOAuthCallback(params);
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
        const playbackState = spotify.isConnected(userId)
          ? await spotify.getCurrentPlayback(userId)
          : null;
        await cacheState(userId, playbackState);
        send({
          type: "state",
          playbackState,
          connected: spotify.isConnected(userId),
        }, userId);
        break;
      }

      case "get_config": {
        const config = await loadConfig(userId);
        send({
          type: "config",
          clientId: config.clientId,
          hasSecret: !!config.clientSecret,
          connected: spotify.isConnected(userId),
          callbackUrl: spindle.oauth.getCallbackUrl(),
          hasLastfmKey: !!config.lastfmApiKey,
          promptAudioPreviewEnabled: !!config.promptAudioPreviewEnabled,
        }, userId);
        break;
      }

      case "connect": {
        const { clientId, clientSecret, serverBaseUrl } = msg;
        const existing = await loadConfig(userId);
        await saveConfig({
          clientId,
          clientSecret: clientSecret || "",
          lastfmApiKey: existing.lastfmApiKey,
          promptAudioPreviewEnabled: existing.promptAudioPreviewEnabled,
        }, userId);

        const state = await spindle.oauth.createState();
        const codeVerifier = createCodeVerifier();
        const codeChallenge = await createCodeChallenge(codeVerifier);
        const redirectUri = getLoopbackRedirectUri(serverBaseUrl);

        pendingOAuthByState.set(state, { state, redirectUri, clientId, clientSecret: clientSecret || undefined, codeVerifier, userId });

        const scopes = "user-read-playback-state user-modify-playback-state user-read-currently-playing";
        const params = new URLSearchParams({
          response_type: "code",
          client_id: clientId,
          scope: scopes,
          redirect_uri: redirectUri,
          state: state,
          code_challenge_method: "S256",
          code_challenge: codeChallenge,
        });

        send({ type: "auth_url", url: `https://accounts.spotify.com/authorize?${params.toString()}` }, userId);
        break;
      }

      case "complete_auth_callback": {
        const result = await completeOAuthCallback(parseCallbackUrl(msg.callbackUrl));
        if (result?.html?.includes("Connection Failed")) {
          send({ type: "error", message: "Could not complete Spotify authorization from that callback URL." }, userId);
        }
        break;
      }

      case "disconnect": {
        stopPolling(userId);
        await spotify.clearTokens(userId);
        await (spindle.theme as typeof spindle.theme & { clear(targetUserId?: string): Promise<void> }).clear(userId).catch(() => {});
        const session = getSession(userId);
        session.lyricsRequests.clear();
        await cacheState(userId, null);
        if (activeUserId === userId) {
          activeUserId = null;
          lastState = null;
          lastStateUpdatedAt = 0;
        }
        send({ type: "disconnected" }, userId);
        send({ type: "state", playbackState: null, connected: false }, userId);
        break;
      }

      case "set_prompt_audio_preview": {
        const config = await loadConfig(userId);
        config.promptAudioPreviewEnabled = msg.enabled;
        await saveConfig(config, userId);
        send({
          type: "config",
          clientId: config.clientId,
          hasSecret: !!config.clientSecret,
          connected: spotify.isConnected(userId),
          callbackUrl: spindle.oauth.getCallbackUrl(),
          hasLastfmKey: !!config.lastfmApiKey,
          promptAudioPreviewEnabled: !!config.promptAudioPreviewEnabled,
        }, userId);
        break;
      }

      case "play":
        await spotify.play({
          trackUri: msg.trackUri,
          contextUri: msg.contextUri,
        }, userId);
        pushStateAfterCommand(userId);
        break;

      case "pause":
        await spotify.pause(userId);
        pushStateAfterCommand(userId);
        break;

      case "next":
        await spotify.next(userId);
        pushStateAfterCommand(userId, true);
        break;

      case "previous":
        await spotify.previous(userId);
        pushStateAfterCommand(userId, true);
        break;

      case "seek":
        await spotify.seek(msg.positionMs, userId);
        pushStateAfterCommand(userId);
        break;

      case "set_volume":
        await spotify.setVolume(msg.percent, userId);
        pushStateAfterCommand(userId);
        break;

      case "toggle_shuffle": {
        const state = await spotify.getCurrentPlayback(userId);
        if (state) await spotify.setShuffle(!state.shuffleState, userId);
        pushStateAfterCommand(userId);
        break;
      }

      case "set_repeat":
        await spotify.setRepeat(msg.mode, userId);
        pushStateAfterCommand(userId);
        break;

      case "search": {
        const results = await spotify.search(msg.query, userId);
        send({ type: "search_results", results }, userId);
        break;
      }

      case "queue":
        await spotify.addToQueue(msg.trackUri, userId);
        break;

      case "get_devices": {
        const devices = await spotify.getDevices(userId);
        send({ type: "devices", devices }, userId);
        break;
      }

      case "transfer_playback":
        await spotify.transferPlayback(msg.deviceId, userId);
        pushStateAfterCommand(userId);
        break;

      case "save_lastfm_key": {
        const config = await loadConfig(userId);
        config.lastfmApiKey = msg.apiKey;
        await saveConfig(config, userId);
        send({
          type: "config",
          clientId: config.clientId,
          hasSecret: !!config.clientSecret,
          connected: spotify.isConnected(userId),
          callbackUrl: spindle.oauth.getCallbackUrl(),
          hasLastfmKey: !!config.lastfmApiKey,
          promptAudioPreviewEnabled: !!config.promptAudioPreviewEnabled,
        }, userId);
        break;
      }

      case "get_widget_prefs": {
        const stored = await spindle.userStorage.getJson<Partial<WidgetPrefs>>("widget_prefs.json", {
          fallback: { size: 48, shape: "circle", sizeMode: "medium", miniPlayerStyle: "default" },
          userId,
        });
        const prefs = normalizeWidgetPrefs(stored);
        send({ type: "widget_prefs", prefs }, userId);
        break;
      }

      case "save_widget_prefs": {
        await spindle.userStorage.setJson("widget_prefs.json", normalizeWidgetPrefs(msg.prefs), { userId });
        break;
      }

      case "get_lyrics": {
        void sendLyricsForCurrentTrack(userId);
        break;
      }

      case "album_colors": {
        await applyAlbumTheme(msg.colors, userId);
        break;
      }

      case "get_chat_songs": {
        await sendChatSongs(msg.chatId, userId);
        break;
      }
    }
  } catch (err: any) {
    send({ type: "error", message: err?.message || "Unknown error" }, userId);
  }
});

// ─── Lyrics cache ────────────────────────────────────────────────────────

async function getLyricsForCurrentTrack(userId?: string): Promise<spotify.LyricsData | null> {
  const resolvedUserId = userId || activeUserId || undefined;
  if (!resolvedUserId || !spotify.isConnected(resolvedUserId)) return null;
  try {
    const session = getSession(resolvedUserId);
    const state = session.lastState || await spotify.getCurrentPlayback(resolvedUserId);
    if (!state?.trackUri) return null;

    return getLyricsForState(state, resolvedUserId);
  } catch {
    return null;
  }
}

async function sendLyricsForCurrentTrack(userId: string): Promise<void> {
  try {
    const session = getSession(userId);
    const state = session.lastState || await spotify.getCurrentPlayback(userId);
    if (!state?.trackUri) {
      send({
        type: "lyrics",
        trackUri: "",
        plainLyrics: null,
        syncedLyrics: null,
        instrumental: false,
      }, userId);
      return;
    }

    const lyrics = await getLyricsForState(state, userId);
    send({
      type: "lyrics",
      trackUri: state.trackUri,
      plainLyrics: lyrics?.plainLyrics || null,
      syncedLyrics: lyrics?.syncedLyrics || null,
      instrumental: !!lyrics?.instrumental,
    }, userId);
  } catch {
    send({
      type: "lyrics",
      trackUri: getSession(userId).lastState?.trackUri || "",
      plainLyrics: null,
      syncedLyrics: null,
      instrumental: false,
    }, userId);
  }
}

// ─── Album theme ────────────────────────────────────────────────────────

async function applyAlbumTheme(colors: AlbumColors | null, userId?: string): Promise<void> {
  try {
    const themeApi = spindle.theme as typeof spindle.theme & {
      clear(targetUserId?: string): Promise<void>;
    };

    if (!colors) {
      await themeApi.clear(userId);
      return;
    }
    // Let Lumiverse own the final presentation layer (glass/alpha/shadows/
    // mode-aware tokens) and only provide palette intent from the album art.
    await spindle.theme.applyPalette({ accent: colors.dominantHsl }, userId);
  } catch (err: any) {
    spindle.log.warn(`Album theme: ${err?.message}`);
  }
}

// ─── Message song snapshots ────────────────────────────────────────────────
// Capture the Spotify track that was playing when an assistant message (or one
// of its swipes) was generated, and persist it per-swipe in the message's
// spindle metadata. The corner badge popover (frontend) renders from this.
// Capture is driven by generation events (`generation` permission); persistence
// uses chat mutation (`chat_mutation` permission).

const SONG_META_KEY = "spotify_song";
const SNAPSHOT_FRESH_MS = 8000;

type MsgLike = {
  id?: string;
  is_user?: boolean;
  name?: string;
  swipe_id?: number;
  extra?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

function trackUriToUrl(uri: string): string {
  // spotify:track:ID -> https://open.spotify.com/track/ID (also episode/show/etc.)
  const m = /^spotify:([a-z]+):([A-Za-z0-9]+)/.exec(uri || "");
  if (m) return `https://open.spotify.com/${m[1]}/${m[2]}`;
  return uri || "";
}

function buildSongSnapshot(state: PlaybackState | null): SongSnapshot | null {
  if (!state || !state.trackUri || !state.trackName) return null;
  return {
    trackName: state.trackName,
    artistName: state.artistName,
    albumName: state.albumName,
    albumArtUrl: state.albumArtUrl ?? null,
    trackUri: state.trackUri,
    spotifyUrl: trackUriToUrl(state.trackUri),
    isPlaying: state.isPlaying,
    capturedAt: Date.now(),
  };
}

/** Best-effort "what is playing right now" — prefers the recently polled state,
 *  falls back to a live fetch when stale, and never throws. */
async function getSnapshotState(userId: string): Promise<PlaybackState | null> {
  const session = getSession(userId);
  if (session.lastState && Date.now() - session.lastStateUpdatedAt <= SNAPSHOT_FRESH_MS) {
    return session.lastState;
  }
  if (spotify.isConnected(userId)) {
    const fresh = await spotify.getCurrentPlayback(userId).catch(() => null);
    if (fresh) return fresh;
  }
  return session.lastState;
}

// ─── Prompt audio attachment ───────────────────────────────────────────────

type SpotifyAudioInterceptorContext = {
  chatId?: string;
  connectionId?: string;
  generationType?: string;
};

type CorsBinaryResponse = {
  status: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: string;
  encoding?: string;
};

type PreviewAudioPayload = {
  data: string;
  mimeType: string;
  fetchedAt: number;
};

type PromptAudioAttachmentResult = {
  messages: LlmMessageDTO[];
  targetIndex: number;
};

const AUDIO_ENABLED_MODELS = new Set([
  "gemini-3-pro-preview",
  "gemini-3.1-pro-preview",
  "gemini-3-flash",
  "gemini-3.5-flash",
  "kimi-k2.5",
  "kimi-k2.6",
].map((model) => model.toLowerCase()));

const PREVIEW_AUDIO_CACHE_TTL_MS = 30 * 60_000;
const PREVIEW_AUDIO_CACHE_MAX = 12;
const PREVIEW_AUDIO_MAX_BASE64_CHARS = 2_000_000;
const PROMPT_AUDIO_BREAKDOWN_NAME = "Spotify preview audio attached";
const PROMPT_AUDIO_BREAKDOWN_CONTENT = "[Spotify Controls] The latest user turn includes an attached Spotify audio preview from Spotify.";

const previewAudioCache = new Map<string, PreviewAudioPayload>();
let promptAudioInterceptorRegistered = false;

function normalizeModelId(model: string): string {
  return model.trim().toLowerCase();
}

function isAudioEnabledModel(model: string | null | undefined): boolean {
  return !!model && AUDIO_ENABLED_MODELS.has(normalizeModelId(model));
}

function resolveConnectedSpotifyUserId(): string | null {
  if (activeUserId && spotify.isConnected(activeUserId)) return activeUserId;
  for (const userId of sessions.keys()) {
    if (spotify.isConnected(userId)) return userId;
  }
  return null;
}

async function resolveInterceptorModel(context: SpotifyAudioInterceptorContext): Promise<string | null> {
  const connectionId = typeof context.connectionId === "string" ? context.connectionId : null;
  if (connectionId) {
    return (await spindle.connections.get(connectionId))?.model?.trim() || null;
  }
  const defaultConnection = (await spindle.connections.list()).find((connection) => connection.is_default);
  return defaultConnection?.model?.trim() || null;
}

function touchPreviewAudioCache(previewUrl: string, payload: PreviewAudioPayload): void {
  previewAudioCache.delete(previewUrl);
  previewAudioCache.set(previewUrl, payload);
  while (previewAudioCache.size > PREVIEW_AUDIO_CACHE_MAX) {
    const oldest = previewAudioCache.keys().next().value;
    if (!oldest) break;
    previewAudioCache.delete(oldest);
  }
}

function readCachedPreviewAudio(previewUrl: string): PreviewAudioPayload | null {
  const cached = previewAudioCache.get(previewUrl);
  if (!cached) return null;
  if (Date.now() - cached.fetchedAt > PREVIEW_AUDIO_CACHE_TTL_MS) {
    previewAudioCache.delete(previewUrl);
    return null;
  }
  touchPreviewAudioCache(previewUrl, cached);
  return cached;
}

function readHeader(headers: Record<string, string> | undefined, name: string): string | null {
  if (!headers) return null;
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target) return value;
  }
  return null;
}

function normalizeMimeType(value: string | null | undefined): string | null {
  if (!value) return null;
  const mimeType = value.split(";")[0]?.trim().toLowerCase();
  return mimeType || null;
}

function findLastUserMessageIndex(messages: LlmMessageDTO[]): number {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user") return i;
  }
  return -1;
}

function stripAudioPartsFromUserMessage(message: LlmMessageDTO): LlmMessageDTO {
  if (typeof message.content === "string") return message;
  const nextContent = message.content.filter((part) => part.type !== "audio");
  if (nextContent.length === message.content.length) return message;
  return { ...message, content: nextContent.length > 0 ? nextContent : "" };
}

function stripAudioFromNonLastUserMessages(messages: LlmMessageDTO[]): LlmMessageDTO[] {
  const lastUserIndex = findLastUserMessageIndex(messages);
  if (lastUserIndex < 0) return messages;

  let changed = false;
  const nextMessages = messages.map((message, index) => {
    if (message.role !== "user" || index === lastUserIndex) return message;
    const nextMessage = stripAudioPartsFromUserMessage(message);
    if (nextMessage !== message) changed = true;
    return nextMessage;
  });
  return changed ? nextMessages : messages;
}

async function getPreviewAudioPayload(previewUrl: string): Promise<PreviewAudioPayload | null> {
  const cached = readCachedPreviewAudio(previewUrl);
  if (cached) return cached;

  let response: CorsBinaryResponse;
  try {
    response = (await spindle.cors(previewUrl, {
      responseType: "arraybuffer",
      mediaType: "audio",
    })) as CorsBinaryResponse;
  } catch (err: any) {
    spindle.log.warn(`Spotify preview download failed: ${err?.message || err}`);
    return null;
  }

  if (response.status !== 200 || !response.body) return null;
  if (response.encoding && response.encoding !== "base64") return null;
  if (response.body.length > PREVIEW_AUDIO_MAX_BASE64_CHARS) {
    spindle.log.warn(`Spotify preview skipped: base64 payload exceeded ${PREVIEW_AUDIO_MAX_BASE64_CHARS} chars`);
    return null;
  }

  const payload: PreviewAudioPayload = {
    data: response.body,
    mimeType: normalizeMimeType(readHeader(response.headers, "content-type")) || "audio/mpeg",
    fetchedAt: Date.now(),
  };
  touchPreviewAudioCache(previewUrl, payload);
  return payload;
}

function appendAudioPart(
  content: string | LlmMessagePartDTO[],
  audioPart: Extract<LlmMessagePartDTO, { type: "audio" }>,
): LlmMessagePartDTO[] | null {
  if (typeof content === "string") {
    return content ? [{ type: "text", text: content }, audioPart] : [audioPart];
  }
  if (content.some((part) => part.type === "audio")) return null;
  return [...content, audioPart];
}

function canAttachAudioToLastUserMessage(message: LlmMessageDTO): boolean {
  if (message.role !== "user") return false;
  if (typeof message.content === "string") return true;
  return message.content.some((part) => part.type !== "tool_result");
}

function attachPreviewAudioToLastUserMessage(
  messages: LlmMessageDTO[],
  previewAudio: PreviewAudioPayload,
): PromptAudioAttachmentResult | null {
  const targetIndex = findLastUserMessageIndex(messages);
  if (targetIndex < 0) return null;

  const target = messages[targetIndex];
  if (!canAttachAudioToLastUserMessage(target)) return null;
  const nextContent = appendAudioPart(target.content, {
    type: "audio",
    data: previewAudio.data,
    mime_type: previewAudio.mimeType,
  });
  if (!nextContent) return null;

  const nextMessages = messages.slice();
  nextMessages[targetIndex] = { ...target, content: nextContent };
  return { messages: nextMessages, targetIndex };
}

function insertPromptAudioBreakdownNote(
  messages: LlmMessageDTO[],
  targetIndex: number,
): { messages: LlmMessageDTO[]; breakdownIndex: number } {
  const nextMessages = messages.slice();
  nextMessages.splice(targetIndex, 0, {
    role: "system",
    content: PROMPT_AUDIO_BREAKDOWN_CONTENT,
  });
  return { messages: nextMessages, breakdownIndex: targetIndex };
}

function formatPromptAudioTrackLabel(state: PlaybackState): string {
  return state.artistName
    ? `"${state.trackName}" by ${state.artistName}`
    : `"${state.trackName}"`;
}

function logAndToastPromptAudioAttachment(
  userId: string,
  state: PlaybackState,
  model: string,
  chatId?: string,
): void {
  const trackLabel = formatPromptAudioTrackLabel(state);
  spindle.log.info(
    `[spotify_prompt_audio] Attached preview audio for ${trackLabel} ` +
    `(model ${model}${chatId ? `, chat ${chatId}` : ""})`
  );
  spindle.toast.info(`Attached Spotify preview for ${trackLabel}.`, {
    title: "Spotify Audio Attached",
    duration: 2600,
    userId,
  });
}

async function maybeAttachSpotifyPreviewAudio(
  messages: LlmMessageDTO[],
  rawContext: unknown,
): Promise<LlmMessageDTO[] | InterceptorResultDTO> {
  const sanitizedMessages = stripAudioFromNonLastUserMessages(messages);
  const context = rawContext && typeof rawContext === "object"
    ? rawContext as SpotifyAudioInterceptorContext
    : {};

  if (context.generationType === "quiet") return sanitizedMessages;

  const config = await loadConfig().catch(() => null);
  if (!config?.promptAudioPreviewEnabled) return sanitizedMessages;

  let model: string | null;
  try {
    model = await resolveInterceptorModel(context);
  } catch (err: any) {
    spindle.log.warn(`Spotify prompt audio model lookup failed: ${err?.message || err}`);
    return sanitizedMessages;
  }
  if (!isAudioEnabledModel(model)) return sanitizedMessages;

  const spotifyUserId = resolveConnectedSpotifyUserId();
  if (!spotifyUserId) return sanitizedMessages;

  const state = await getSnapshotState(spotifyUserId).catch(() => null);
  const previewUrl = state?.previewUrl;
  if (!previewUrl) return sanitizedMessages;

  const previewAudio = await getPreviewAudioPayload(previewUrl);
  if (!previewAudio) return sanitizedMessages;

  const attached = attachPreviewAudioToLastUserMessage(sanitizedMessages, previewAudio);
  if (!attached || !state) return sanitizedMessages;

  logAndToastPromptAudioAttachment(spotifyUserId, state, model, context.chatId);
  const withNote = insertPromptAudioBreakdownNote(attached.messages, attached.targetIndex);
  return {
    messages: withNote.messages,
    breakdown: [
      {
        messageIndex: withNote.breakdownIndex,
        name: PROMPT_AUDIO_BREAKDOWN_NAME,
      },
    ],
  };
}

function readSpindleMeta(message: MsgLike): Record<string, unknown> {
  // Event payloads carry spindle metadata under extra.spindle_metadata; the
  // normalized getMessages() shape surfaces it on `metadata`. Support both.
  const fromMeta = message.metadata;
  if (fromMeta && typeof fromMeta === "object") return { ...fromMeta };
  const fromExtra = message.extra?.spindle_metadata;
  if (fromExtra && typeof fromExtra === "object") return { ...(fromExtra as Record<string, unknown>) };
  return {};
}

function readSongMap(meta: Record<string, unknown>): Record<number, SongSnapshot> {
  const node = meta[SONG_META_KEY] as { bySwipe?: Record<string, SongSnapshot> } | undefined;
  const bySwipe = node?.bySwipe;
  if (!bySwipe || typeof bySwipe !== "object") return {};
  const out: Record<number, SongSnapshot> = {};
  for (const [k, v] of Object.entries(bySwipe)) {
    const idx = Number(k);
    if (Number.isInteger(idx) && v && typeof v === "object") out[idx] = v as SongSnapshot;
  }
  return out;
}

function isAssistantMessage(message: MsgLike): boolean {
  return message.is_user === false && message.name !== "System";
}

/** Look up a single assistant message by id (returns null for user/system/missing). */
async function getAssistantMessage(
  chatId: string,
  messageId: string,
): Promise<(MsgLike & { id: string; swipe_id: number }) | null> {
  let messages: Array<MsgLike & { id: string; swipe_id: number }>;
  try {
    messages = (await spindle.chat.getMessages(chatId)) as unknown as Array<MsgLike & { id: string; swipe_id: number }>;
  } catch (err: any) {
    spindle.log.warn(`Song capture (read) failed: ${err?.message}`);
    return null;
  }
  const m = messages.find((x) => x.id === messageId);
  return m && isAssistantMessage(m) ? m : null;
}

/** Persist a prebuilt snapshot onto one (message, swipe) and notify the client. */
async function writeSnapshotToMessage(
  chatId: string,
  message: MsgLike & { id: string },
  swipeId: number,
  snapshot: SongSnapshot,
  userId: string,
): Promise<void> {
  const meta = readSpindleMeta(message);
  const map = readSongMap(meta);
  map[swipeId] = snapshot;
  meta[SONG_META_KEY] = { bySwipe: map };
  try {
    await spindle.chat.updateMessage(chatId, message.id, { metadata: meta, skipChunkRebuild: true });
  } catch (err: any) {
    spindle.log.warn(`Song capture (update) failed: ${err?.message}`);
    return;
  }
  send({ type: "message_song", chatId, messageId: message.id, swipeId, snapshot }, userId);
}

/** Keep the per-swipe map aligned with swipes[] after a swipe is removed. */
async function realignAfterSwipeDelete(
  chatId: string,
  message: MsgLike,
  deletedIndex: number,
  userId: string,
): Promise<void> {
  if (!message.id) return;
  const meta = readSpindleMeta(message);
  const map = readSongMap(meta);
  if (Object.keys(map).length === 0) return;
  const next: Record<number, SongSnapshot> = {};
  for (const [k, v] of Object.entries(map)) {
    const idx = Number(k);
    if (idx === deletedIndex) continue;
    next[idx > deletedIndex ? idx - 1 : idx] = v;
  }
  meta[SONG_META_KEY] = { bySwipe: next };
  try {
    await spindle.chat.updateMessage(chatId, message.id, { metadata: meta, skipChunkRebuild: true });
  } catch (err: any) {
    spindle.log.warn(`Song capture (realign) failed: ${err?.message}`);
    return;
  }
  await sendChatSongs(chatId, userId).catch(() => {});
}

// ── Capture at generation start (most reliable + most accurate) ───────────
// GENERATION_STARTED fires the instant a reply begins, so the snapshot reflects
// exactly what was playing when the assistant "wrote" the message. The target
// message id isn't known until GENERATION_ENDED, so we stash the snapshot keyed
// by generationId and persist it once the saved message id arrives.
// Both events require the `generation` permission.

const pendingGenerationSongs = new Map<string, { snapshot: SongSnapshot; userId: string }>();
const PENDING_GEN_MAX = 64;
let generationUnsubs: Array<() => void> = [];

async function onGenerationStarted(payload: unknown, userId?: string): Promise<void> {
  const p = payload as { generationId?: string } | undefined;
  const genId = p?.generationId;
  const uid = userId || activeUserId;
  if (!genId || !uid) return;
  const snapshot = buildSongSnapshot(await getSnapshotState(uid));
  if (!snapshot) return; // nothing playing when generation began — no badge
  if (pendingGenerationSongs.size >= PENDING_GEN_MAX) {
    const oldest = pendingGenerationSongs.keys().next().value;
    if (oldest) pendingGenerationSongs.delete(oldest);
  }
  pendingGenerationSongs.set(genId, { snapshot, userId: uid });
}

async function onGenerationEnded(payload: unknown): Promise<void> {
  const p = payload as { generationId?: string; chatId?: string; messageId?: string; error?: string } | undefined;
  const genId = p?.generationId;
  if (!genId) return;
  const pending = pendingGenerationSongs.get(genId);
  pendingGenerationSongs.delete(genId);
  if (!pending) return;
  if (p?.error || !p.messageId || !p.chatId) return; // failed/aborted — drop it
  const message = await getAssistantMessage(p.chatId, p.messageId);
  if (!message) return;
  await writeSnapshotToMessage(p.chatId, message, message.swipe_id ?? 0, pending.snapshot, pending.userId);
}

/** (Re)subscribe to generation events. Re-run when the permission is granted at
 *  runtime so a subscription rejected while ungranted starts firing. */
function setupGenerationCapture(): void {
  for (const unsub of generationUnsubs) {
    try { unsub(); } catch { /* ignore */ }
  }
  generationUnsubs = [];
  try {
    generationUnsubs.push(spindle.on("GENERATION_STARTED", (payload, userId) => { void onGenerationStarted(payload, userId); }));
    generationUnsubs.push(spindle.on("GENERATION_ENDED", (payload) => { void onGenerationEnded(payload); }));
  } catch (err: any) {
    spindle.log.warn(`Generation capture subscribe failed: ${err?.message}`);
  }
}

function setupPromptAudioInterceptor(): void {
  if (promptAudioInterceptorRegistered) return;
  try {
    spindle.registerInterceptor(async (messages, context) => maybeAttachSpotifyPreviewAudio(messages, context));
    promptAudioInterceptorRegistered = true;
  } catch (err: any) {
    spindle.log.warn(`Spotify prompt audio interceptor register failed: ${err?.message}`);
  }
}

setupPromptAudioInterceptor();
setupGenerationCapture();

spindle.permissions.onChanged(({ permission, granted }) => {
  if (permission === "generation" && granted) setupGenerationCapture();
  if (permission === "interceptor" && granted) setupPromptAudioInterceptor();
});

/** Read every assistant message's stored snapshots and push them to the client. */
async function sendChatSongs(chatId: string, userId: string): Promise<void> {
  if (!chatId) return;
  let messages: Array<MsgLike & { id: string; swipe_id: number }>;
  try {
    messages = (await spindle.chat.getMessages(chatId)) as unknown as Array<MsgLike & { id: string; swipe_id: number }>;
  } catch (err: any) {
    spindle.log.warn(`get_chat_songs failed: ${err?.message}`);
    return;
  }
  const entries: MessageSongEntry[] = [];
  for (const m of messages) {
    if (m.is_user) continue;
    const map = readSongMap(readSpindleMeta(m));
    if (Object.keys(map).length === 0) continue;
    entries.push({ messageId: m.id, activeSwipe: m.swipe_id ?? 0, bySwipe: map });
  }
  send({ type: "chat_songs", chatId, entries }, userId);
}

// Swipe deleted → realign the stored map so indices stay aligned with swipes[].
// (New swipes/regenerations are captured via the generation events above.)
spindle.on("MESSAGE_SWIPED", async (payload, userId) => {
  const p = payload as { chatId?: string; message?: MsgLike; action?: string; swipeId?: number } | undefined;
  const message = p?.message;
  const chatId = p?.chatId;
  const uid = userId || activeUserId;
  if (!chatId || !message || !uid || !message.id || !isAssistantMessage(message)) return;

  if (p?.action === "deleted" && typeof p?.swipeId === "number") {
    await realignAfterSwipeDelete(chatId, message, p.swipeId, uid).catch(() => {});
  }
});

// ─── Command Palette ────────────────────────────────────────────────────

spindle.commands.register([
  {
    id: "play-pause",
    label: "Play / Pause",
    description: "Toggle Spotify playback",
    keywords: ["music", "play", "pause", "stop", "resume", "song"],
    scope: "global",
  },
  {
    id: "next-track",
    label: "Next Track",
    description: "Skip to the next track on Spotify",
    keywords: ["skip", "forward", "next", "song", "music"],
    scope: "global",
  },
  {
    id: "previous-track",
    label: "Previous Track",
    description: "Go back to the previous track on Spotify",
    keywords: ["back", "rewind", "previous", "song", "music"],
    scope: "global",
  },
]);

spindle.commands.onInvoked(async (commandId) => {
  if (!spotify.isConnected()) return;
  const commandUserId = activeUserId;
  if (!commandUserId) return;
  try {
    switch (commandId) {
      case "play-pause": {
        const state = lastState || await spotify.getCurrentPlayback();
        if (state?.isPlaying) {
          await spotify.pause();
        } else {
          await spotify.play({});
        }
        pushStateAfterCommand(commandUserId);
        break;
      }
      case "next-track":
        await spotify.next();
        pushStateAfterCommand(commandUserId, true);
        break;
      case "previous-track":
        await spotify.previous();
        pushStateAfterCommand(commandUserId, true);
        break;
    }
  } catch (err: any) {
    spindle.log.warn(`Command "${commandId}": ${err?.message}`);
  }
});

// ─── Macros ──────────────────────────────────────────────────────────────

spindle.registerMacro({
  name: "spotify_now_playing",
  category: "extension:spotify_controls",
  description: "Returns the currently playing Spotify track",
  returnType: "string",
  handler: (async () => {
    const state = spotify.isConnected() ? await spotify.getCurrentPlayback().catch(() => null) : null;
    if (!state) return "Nothing playing";
    return `${state.trackName} by ${state.artistName}`;
  }) as any,
});

spindle.registerMacro({
  name: "spotify_track_name",
  category: "extension:spotify_controls",
  description: "Returns the track name of the currently playing Spotify track",
  returnType: "string",
  handler: (async () => {
    const state = spotify.isConnected() ? await spotify.getCurrentPlayback().catch(() => null) : null;
    return state?.trackName || "";
  }) as any,
});

spindle.registerMacro({
  name: "spotify_artists",
  category: "extension:spotify_controls",
  description: "Returns the artist(s) of the currently playing Spotify track",
  returnType: "string",
  handler: (async () => {
    const state = spotify.isConnected() ? await spotify.getCurrentPlayback().catch(() => null) : null;
    return state?.artistName || "";
  }) as any,
});

spindle.registerMacro({
  name: "spotify_album_name",
  category: "extension:spotify_controls",
  description: "Returns the album name of the currently playing Spotify track",
  returnType: "string",
  handler: (async () => {
    const state = spotify.isConnected() ? await spotify.getCurrentPlayback().catch(() => null) : null;
    return state?.albumName || "";
  }) as any,
});

spindle.registerMacro({
  name: "spotify_album_art",
  category: "extension:spotify_controls",
  description: "Returns the URL of the currently playing track's album art",
  returnType: "string",
  handler: (async () => {
    const state = spotify.isConnected() ? await spotify.getCurrentPlayback().catch(() => null) : null;
    return state?.albumArtUrl || "";
  }) as any,
});

spindle.registerMacro({
  name: "spotify_is_playing",
  category: "extension:spotify_controls",
  description: "Returns whether Spotify is currently playing a track",
  returnType: "boolean",
  volatile: true,
  handler: (async () => {
    const state = spotify.isConnected() ? await spotify.getCurrentPlayback().catch(() => null) : null;
    return state?.isPlaying ?? false;
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

spindle.registerMacro({
  name: "spotify_has_lyrics",
  category: "extension:spotify_controls",
  description: "Returns whether the currently playing Spotify track has lyrics available",
  returnType: "boolean",
  handler: (async () => {
    try {
      const lyrics = await getLyricsForCurrentTrack();
      if (!lyrics || lyrics.instrumental) return false;
      return !!(lyrics.syncedLyrics || lyrics.plainLyrics);
    } catch {
      return false;
    }
  }) as any,
});

function pushPlaybackMacros(state: PlaybackState | null) {
  if (!state) {
    spindle.updateMacroValue("spotify_now_playing", "Nothing playing");
    spindle.updateMacroValue("spotify_track_name", "");
    spindle.updateMacroValue("spotify_artists", "");
    spindle.updateMacroValue("spotify_album_name", "");
    spindle.updateMacroValue("spotify_album_art", "");
    spindle.updateMacroValue("spotify_is_playing", "false");
    return;
  }
  spindle.updateMacroValue("spotify_now_playing", `${state.trackName} by ${state.artistName}`);
  spindle.updateMacroValue("spotify_track_name", state.trackName || "");
  spindle.updateMacroValue("spotify_artists", state.artistName || "");
  spindle.updateMacroValue("spotify_album_name", state.albumName || "");
  spindle.updateMacroValue("spotify_album_art", state.albumArtUrl || "");
  spindle.updateMacroValue("spotify_is_playing", String(state.isPlaying));
}

function pushLyricsMacros(lyrics: spotify.LyricsData | null) {
  if (!lyrics || lyrics.instrumental) {
    spindle.updateMacroValue("spotify_lyrics", lyrics?.instrumental ? "[Instrumental]" : "No lyrics available");
    spindle.updateMacroValue("spotify_has_lyrics", "false");
    return;
  }
  spindle.updateMacroValue("spotify_lyrics", lyrics.plainLyrics || "No lyrics available");
  spindle.updateMacroValue("spotify_has_lyrics", String(!!(lyrics.syncedLyrics || lyrics.plainLyrics)));
}

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
      query: { type: "string", description: "Either a specific title to find (e.g. 'Bohemian Rhapsody Queen'), or 2-4 descriptors derived from the current scene when scoring an unnamed moment. When deriving from the scene, ground yourself in the most recent beats: the texture of the action, the genre or period the setting suggests, the emotional pitch, what's happening between characters. Aim for descriptors that wouldn't transfer cleanly to a different scene — if they would, you're reaching for stock phrasing rather than reading what's in front of you." },
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
        description: "2-3 lowercase, comma-separated descriptors derived from the current scene. Before choosing, ground yourself in the most recent beats: the pace, the closeness or distance between characters, the emotional register of the dialogue, the physical setting, what just shifted. Pick words that describe *this* moment's texture — not the genre of moment it resembles. If your descriptors would fit equally well over a wholly different scene, you're describing the trope rather than the music this scene needs; observe again and reach for something more specific.",
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
  anime:       ["anime", "shonen", "shojo", "isekai", "mecha", "otaku", "opening", "ending", "japanese", "visual kei"],
  cinematic_jp:["anime", "soundtrack", "orchestral", "japanese", "epic", "dramatic", "opening", "ending", "instrumental", "fantasy"],
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
  // Theme/style crossover
  "anime", "anime ost", "anisong", "j-pop", "j-rock", "visual kei",
  "soundtrack", "score", "orchestral", "opening", "ending",
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
  anime:         ["anime", "anime ost", "anisong", "j-pop", "j-rock", "opening", "ending", "soundtrack"],
  shonen:        ["anime", "anisong", "j-rock", "opening", "epic", "energetic", "dramatic"],
  shojo:         ["anime", "j-pop", "romantic", "sweet", "dreamy", "ending"],
  ghibli:        ["anime", "soundtrack", "orchestral", "dreamy", "peaceful", "ethereal"],
  mecha:         ["anime", "soundtrack", "electronic", "epic", "dramatic", "intense"],
  isekai:        ["anime", "fantasy", "soundtrack", "ethereal", "adventure", "orchestral"],
  opening:       ["opening", "anime", "j-rock", "j-pop", "energetic", "dramatic"],
  ending:        ["ending", "anime", "j-pop", "dreamy", "melancholic", "gentle"],
  soundtrack:    ["soundtrack", "score", "cinematic", "orchestral", "instrumental"],
};

const ANIME_THEME_TAGS = new Set([
  "anime", "anime ost", "anisong", "j-pop", "j-rock", "visual kei",
  "soundtrack", "score", "orchestral", "opening", "ending", "japanese",
  "shonen", "shojo", "isekai", "mecha", "ghibli",
]);

/** Extract mood-related tags from a track/artist's Last.fm tag list. */
function extractMoodTags(tags: { name: string; count: number }[], minCount = 5): string[] {
  return tags
    .filter(t => t.count >= minCount && MOOD_TAG_SET.has(t.name))
    .map(t => t.name);
}

const GENERIC_TAG_SET = new Set([
  "favorites", "favourite", "favorite", "loved", "seen live", "albums i own",
  "my spotigram sundays", "under 2000 listeners", "spotify", "lastfm", "good",
]);

function extractFlavorTags(tags: { name: string; count: number }[], minCount = 5, limit = 6): string[] {
  return tags
    .filter((t) => t.count >= minCount)
    .map((t) => t.name)
    .filter((name) =>
      !MOOD_TAG_SET.has(name) &&
      !GENERIC_TAG_SET.has(name) &&
      !/^\d{4}s$/.test(name) &&
      !/^\d{2}s$/.test(name) &&
      name.length >= 3
    )
    .slice(0, limit);
}

function overlapCount(a: Iterable<string>, b: Iterable<string>): number {
  const bSet = new Set(Array.from(b, (value) => value.toLowerCase()));
  let count = 0;
  for (const value of a) {
    if (bSet.has(value.toLowerCase())) count += 1;
  }
  return count;
}

function hasAnimeTheme(values: Iterable<string>): boolean {
  for (const value of values) {
    if (ANIME_THEME_TAGS.has(value.toLowerCase())) return true;
  }
  return false;
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
  const keys = Object.keys(args).filter((key) => !key.startsWith("__"));
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

const activeToolInvocations = new Map<string, string>();
const RECENT_DISCOVERY_FILE = "recent_mood_discover.json";
const RECENT_DISCOVERY_LIMIT = 20;
const RECENT_DISCOVERY_WINDOW_MS = 1000 * 60 * 60 * 24 * 14;

type DiscoveryCandidate = {
  name: string;
  artist: string;
  score: number;
  source: string[];
};

type RecentDiscoveryEntry = {
  key: string;
  name: string;
  artist: string;
  ts: number;
};

function getToolInvocationKey(toolName: string, userId: string | null): string {
  return `${userId || "unknown"}:${toolName}`;
}

function ensureInvocationActive(
  invocationKey: string,
  requestId: string,
  deadlineMs?: number,
  stage?: string
): void {
  if (activeToolInvocations.get(invocationKey) !== requestId) {
    throw new Error(`Invocation superseded${stage ? ` during ${stage}` : ""}`);
  }
  if (deadlineMs && Date.now() >= deadlineMs - 150) {
    throw new Error(`Invocation deadline reached${stage ? ` before ${stage}` : ""}`);
  }
}

function candidateKey(name: string, artist: string): string {
  return `${name.toLowerCase()}::${artist.toLowerCase()}`;
}

function addDiscoveryCandidate(
  map: Map<string, DiscoveryCandidate>,
  name: string,
  artist: string,
  score: number,
  source: string
): void {
  const key = candidateKey(name, artist);
  const existing = map.get(key);
  if (existing) {
    existing.score += score;
    if (!existing.source.includes(source)) existing.source.push(source);
    return;
  }
  map.set(key, { name, artist, score, source: [source] });
}

async function loadRecentMoodDiscoveries(): Promise<RecentDiscoveryEntry[]> {
  if (!activeUserId) return [];
  const entries = await spindle.userStorage.getJson<RecentDiscoveryEntry[]>(RECENT_DISCOVERY_FILE, {
    fallback: [],
    userId: activeUserId,
  }).catch(() => []);
  const cutoff = Date.now() - RECENT_DISCOVERY_WINDOW_MS;
  return entries.filter((entry) => entry.ts >= cutoff);
}

async function saveRecentMoodDiscoveries(entries: RecentDiscoveryEntry[]): Promise<void> {
  if (!activeUserId) return;
  await spindle.userStorage.setJson(RECENT_DISCOVERY_FILE, entries.slice(0, RECENT_DISCOVERY_LIMIT), {
    userId: activeUserId,
  }).catch(() => {});
}

async function rememberMoodDiscoveries(results: SearchResult[]): Promise<void> {
  const existing = await loadRecentMoodDiscoveries();
  const now = Date.now();
  const merged = [
    ...results.map((result) => ({
      key: candidateKey(result.name, result.artist),
      name: result.name,
      artist: result.artist,
      ts: now,
    })),
    ...existing,
  ];
  const deduped = new Map<string, RecentDiscoveryEntry>();
  for (const entry of merged) {
    if (!deduped.has(entry.key)) deduped.set(entry.key, entry);
  }
  await saveRecentMoodDiscoveries(Array.from(deduped.values()));
}

function normalizeMatchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\[(].*?[\])]/g, " ")
    .replace(/\b(feat|ft|featuring)\b.*$/g, " ")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countTokenOverlap(a: string, b: string): number {
  if (!a || !b) return 0;
  const bTokens = new Set(b.split(" ").filter(Boolean));
  let score = 0;
  for (const token of a.split(" ")) {
    if (token && bTokens.has(token)) score += 1;
  }
  return score;
}

function scoreResolvedTrackMatch(trackName: string, artist: string, result: SearchResult): number {
  const wantedTrack = normalizeMatchText(trackName);
  const wantedArtist = normalizeMatchText(artist);
  const gotTrack = normalizeMatchText(result.name);
  const gotArtist = normalizeMatchText(result.artist);
  let score = 0;

  if (gotTrack === wantedTrack) score += 12;
  else if (gotTrack.startsWith(wantedTrack) || wantedTrack.startsWith(gotTrack)) score += 8;
  else if (gotTrack.includes(wantedTrack) || wantedTrack.includes(gotTrack)) score += 4;
  score += Math.min(4, countTokenOverlap(wantedTrack, gotTrack));

  if (gotArtist === wantedArtist) score += 12;
  else if (gotArtist.includes(wantedArtist) || wantedArtist.includes(gotArtist)) score += 8;
  score += Math.min(4, countTokenOverlap(wantedArtist, gotArtist));

  if (/\b(remaster|live|karaoke|tribute|instrumental|cover|acoustic)\b/.test(gotTrack) &&
      !/\b(remaster|live|karaoke|tribute|instrumental|cover|acoustic)\b/.test(wantedTrack)) {
    score -= 4;
  }

  return score;
}

async function enrichCandidatesWithTagAffinity(
  candidates: DiscoveryCandidate[],
  seedFlavorTags: string[],
  moodTags: string[],
  readTimeout: number
): Promise<DiscoveryCandidate[]> {
  if (candidates.length === 0) return candidates;

  const shortlist = candidates.slice(0, 8);
  const seedFlavorSet = new Set(seedFlavorTags.map((tag) => tag.toLowerCase()));
  const moodTagSet = new Set(moodTags.map((tag) => tag.toLowerCase()));

  const enriched = await Promise.all(shortlist.map(async (candidate) => {
    const [artistTags, trackTags] = await Promise.all([
      timedSafe(spotify.getArtistTopTags(candidate.artist), readTimeout, `artist.getTopTags("${candidate.artist}")`, []),
      timedSafe(spotify.getTrackTopTags(candidate.name, candidate.artist), readTimeout, `track.getTopTags("${candidate.name}")`, []),
    ]);

    const candidateFlavor = new Set([
      ...extractFlavorTags(trackTags, 0, 5),
      ...extractFlavorTags(artistTags, 0, 5),
    ]);
    const candidateMood = new Set([
      ...extractMoodTags(trackTags, 0),
      ...extractMoodTags(artistTags, 0),
    ]);
    const candidateTheme = new Set([
      ...candidateFlavor,
      ...candidateMood,
      ...extractFlavorTags(trackTags, 0, 8).filter((tag) => ANIME_THEME_TAGS.has(tag.toLowerCase())),
      ...extractFlavorTags(artistTags, 0, 8).filter((tag) => ANIME_THEME_TAGS.has(tag.toLowerCase())),
    ]);

    let score = candidate.score;
    const flavorOverlap = overlapCount(seedFlavorSet, candidateFlavor);
    const moodOverlap = overlapCount(moodTagSet, candidateMood);
    score += flavorOverlap * 4;
    score += moodOverlap * 2;
    if (hasAnimeTheme([...seedFlavorSet, ...moodTagSet])) {
      score += overlapCount(ANIME_THEME_TAGS, candidateTheme) * 3;
      if (!hasAnimeTheme(candidateTheme)) score -= 4;
    }
    if (candidateFlavor.size > 0 && flavorOverlap === 0 && seedFlavorSet.size > 0) score -= 3;

    const source = [...candidate.source];
    if (flavorOverlap > 0) source.push(`flavor:${flavorOverlap}`);
    if (moodOverlap > 0) source.push(`mood:${moodOverlap}`);
    return { ...candidate, score, source };
  }));

  return [...enriched, ...candidates.slice(shortlist.length)];
}

/** Resolve a Last.fm track recommendation to a Spotify search result. */
async function resolveOnSpotify(trackName: string, artist: string): Promise<SearchResult | null> {
  try {
    const results = await spotify.search(`${trackName} ${artist}`);
    if (results.length === 0) return null;

    const ranked = results
      .map((result) => ({
        result,
        score: scoreResolvedTrackMatch(trackName, artist, result),
      }))
      .sort((a, b) => b.score - a.score);

    return ranked[0]?.result || results[0] || null;
  } catch (err: any) {
    spindle.log.warn(`resolveOnSpotify("${trackName}", "${artist}"): ${err?.message}`);
    return null;
  }
}

async function getPlaybackSeedState(): Promise<PlaybackState | null> {
  try {
    const current = await spotify.getCurrentPlayback();
    if (current) {
      if (activeUserId) await cacheState(activeUserId, current);
      return current;
    }
    return null;
  } catch {
    if (lastState && Date.now() - lastStateUpdatedAt < 60_000) {
      spindle.log.warn(`[playback_seed] Falling back to cached state "${lastState.trackName}" by ${lastState.artistName}`);
      return lastState;
    }
    return null;
  }
}

async function playMoodFallback(
  query: string,
  state: PlaybackState,
  council: boolean,
  userId: string,
  beforePlay?: (stage: string) => void
): Promise<string> {
  const playlists = await spotify.searchPlaylists(query, 5);
  if (playlists.length > 0) {
    const best = playlists[0];
    beforePlay?.(`fallback playlist play for \"${query}\"`);
    await spotify.play({ contextUri: best.uri });
    pushStateAfterCommand(userId);
    const prefix = council ? `[Mood fallback "${query}"] ` : "";
    return `${prefix}Now playing playlist "${best.name}" by ${best.owner} after mood discovery could not find enough reliable track matches from "${state.trackName}".`;
  }

  const tracks = await spotify.search(query);
  if (tracks.length > 0) {
    beforePlay?.(`fallback track play for \"${query}\"`);
    await spotify.play({ trackUri: tracks[0].uri });
    pushStateAfterCommand(userId);
    const prefix = council ? `[Mood fallback "${query}"] ` : "";
    return `${prefix}Now playing "${tracks[0].name}" by ${tracks[0].artist} after mood discovery fell back to direct Spotify matching.`;
  }

  return `Mood discovery could not find enough strong matches, and no Spotify fallback results were found for "${query}".`;
}

// ─── Tool invocation handler ────────────────────────────────────────────

// Handle tool invocations via events
spindle.on("TOOL_INVOCATION", async (payload: any) => {
  if (!payload?.toolName || !payload?.requestId) return;

  // The council passes qualified names like "spotify_controls:spotify_search",
  // while direct LLM tool calls use bare names like "spotify_search".
  // Strip the extension prefix if present so handlers match either form.
  const rawName = payload.toolName;
  const requestId = String(payload.requestId);
  const toolName = rawName.includes(":") ? rawName.split(":").pop()! : rawName;
  const args: Record<string, unknown> = payload.args ?? {};
  const toolUserId = typeof args.__userId === "string" ? args.__userId : null;
  const deadlineMs = typeof args.__deadlineMs === "number" ? args.__deadlineMs : undefined;
  const council = isCouncilInvocation(args);
  const context: string = (args.context as string) || "";
  const resolvedToolUserId = toolUserId || activeUserId;
  const invocationKey = getToolInvocationKey(toolName, resolvedToolUserId);
  const guard = (stage: string) => ensureInvocationActive(invocationKey, requestId, deadlineMs, stage);

  activeToolInvocations.set(invocationKey, requestId);

  if (toolUserId) {
    await handleUserChange(toolUserId);
  } else if (!activeUserId) {
    return "Spotify Controls has no active user context for this tool invocation yet. Open the extension once, then try again.";
  }
  const sessionUserId = activeUserId!;

  // Tool invocations may arrive before tokens are loaded in this worker
  // (e.g. after a hot reload). Ensure we have a connected user context.
  if (!spotify.isConnected()) {
    await spotify.loadTokens();
  }

  guard("startup");

  const councilSeedState = council ? await getPlaybackSeedState() : null;
  if (council && councilSeedState) {
    spindle.log.info(
      `[council_spotify] Seed for ${toolName}: "${councilSeedState.trackName}" by ${councilSeedState.artistName} (request ${requestId})`
    );
  }

  try {
    const guardPlaybackMutation = (stage: string) => {
      guard(stage);
    };

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
            guardPlaybackMutation(`playlist play for \"${best.name}\"`);
            await spotify.play({ contextUri: best.uri });
            pushStateAfterCommand(sessionUserId);
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
        guardPlaybackMutation(`track play for \"${best.name}\"`);
        await spotify.play({ trackUri: best.uri });
        pushStateAfterCommand(sessionUserId);
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
      // Get the currently playing track — this is the sole seed for similarity.
      // Council runs use a frozen snapshot so later Spotify tools cannot reseed
      // themselves from playback changed earlier in the same turn.
      const state = councilSeedState || await getPlaybackSeedState();
      if (!state?.trackName || !state?.artistName) {
        return "Nothing is currently playing. Play something first so we can find similar tracks.";
      }

      // Query Last.fm for similar tracks (autocorrect enabled, sorted by match score)
      const similar = await spotify.getSimilarTracks(state.trackName, state.artistName, 5);

        if (similar.length === 0) {
          // Fallback: search Spotify for more by this artist
          const results = await spotify.search(state.artistName);
          if (results.length === 0) return `No similar tracks found for "${state.trackName}" by ${state.artistName}.`;
          guardPlaybackMutation(`similar fallback play for \"${results[0].name}\"`);
          await spotify.play({ trackUri: results[0].uri });
          pushStateAfterCommand(sessionUserId);
        return `No Last.fm similarity data — playing "${results[0].name}" by ${results[0].artist} (more by artist)`;
      }

      // Resolve candidates on Spotify in parallel — just "track artist", no mood strings
      const resolved = (await Promise.all(
        similar.map((c) => resolveOnSpotify(c.name, c.artist))
      )).filter((r): r is SearchResult => r !== null);

        if (resolved.length === 0) return "Found similar tracks via Last.fm but could not match any on Spotify.";

        // Play the first track and queue the rest in parallel
        guardPlaybackMutation(`similar result play for \"${resolved[0].name}\"`);
        await spotify.play({ trackUri: resolved[0].uri });
        pushStateAfterCommand(sessionUserId);

      const toQueue = resolved.slice(1);
        const queueResults = await Promise.all(
          toQueue.map(async (track) => {
            try {
              guardPlaybackMutation(`similar queue for \"${track.name}\"`);
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
    const READ_TIMEOUT = 6000;
    const WRITE_TIMEOUT = 8000;
    try {
      const state = councilSeedState || await getPlaybackSeedState();
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

      const needTagFallback = moodTags.length === 0;
      const [trackTags, artistTags, similarArtists, similarTracks, recentDiscoveries] = await Promise.all([
        timedSafe(spotify.getTrackTopTags(state.trackName, state.artistName), READ_TIMEOUT, "track.getTopTags", []),
        timedSafe(spotify.getArtistTopTags(state.artistName), READ_TIMEOUT, "artist.getTopTags", []),
        timedSafe(spotify.getSimilarArtists(state.artistName, 8), READ_TIMEOUT, "artist.getSimilar", []),
        timedSafe(spotify.getSimilarTracks(state.trackName, state.artistName, 12), READ_TIMEOUT, "track.getSimilar", []),
        loadRecentMoodDiscoveries(),
      ]);

      if (needTagFallback) {
        moodTags = extractMoodTags(trackTags);
        if (moodTags.length === 0) moodTags = extractMoodTags(artistTags, 0);
        spindle.log.info(`[mood_discover] Mood from tags fallback → [${moodTags.join(", ")}]`);
      }

      if (moodTags.length === 0) {
        const fallbackQuery = (moodArg?.trim() || extractMoodFromContext(context) || state.artistName).trim();
        spindle.log.info(`[mood_discover] No mood tags found; falling back to Spotify query "${fallbackQuery}"`);
        return playMoodFallback(fallbackQuery, state, council, sessionUserId, guardPlaybackMutation);
      }

      const seedFlavorTags = [...new Set([
        ...extractFlavorTags(trackTags),
        ...extractFlavorTags(artistTags, 0),
      ])].slice(0, 6);
      const wantsAnimeTheme = hasAnimeTheme([...moodTags, ...seedFlavorTags]);
      const recentKeys = new Set(recentDiscoveries.map((entry) => entry.key));
      const similarArtistSet = new Set([state.artistName, ...similarArtists].map((artist) => artist.toLowerCase()));
      const currentTrackLower = state.trackName.toLowerCase();
      const currentArtistLower = state.artistName.toLowerCase();

      const candidateMap = new Map<string, DiscoveryCandidate>();

      for (const similar of similarTracks) {
        const artistLower = similar.artist.toLowerCase();
        if (similar.name.toLowerCase() === currentTrackLower && artistLower === currentArtistLower) continue;
        const similarityScore = Math.round(similar.match * 24) + 12;
        addDiscoveryCandidate(candidateMap, similar.name, similar.artist, similarityScore, "track-similar");
      }

      const queryTags = moodTags.slice(0, 3);
      const tagPages = Array.from(new Set([
        Math.floor(Math.random() * 4) + 1,
        Math.floor(Math.random() * 6) + 3,
      ])).sort((a, b) => a - b);
      spindle.log.info(`[mood_discover] Querying tag.getTopTracks for [${queryTags.join(", ")}] pages=${tagPages.join(",")}`);
      const tagResults = await Promise.all(
        queryTags.flatMap((tag) =>
          tagPages.map(async (page) => ({
            tag,
            page,
            tracks: await timedSafe(
              spotify.getTopTracksByTag(tag, 20, page),
              READ_TIMEOUT,
              `tag.getTopTracks("${tag}", page=${page})`,
              []
            ),
          }))
        )
      );

      for (const result of tagResults) {
        for (const [index, track] of result.tracks.entries()) {
          const artistLower = track.artist.toLowerCase();
          if (track.name.toLowerCase() === currentTrackLower && artistLower === currentArtistLower) continue;

          let scoreBoost = Math.max(1, 7 - index);
          if (similarArtistSet.has(artistLower)) scoreBoost += 5;
          else scoreBoost -= 2;
          if (result.page > 1) scoreBoost += 1;
          addDiscoveryCandidate(candidateMap, track.name, track.artist, scoreBoost, `tag:${result.tag}:p${result.page}`);
        }
      }

      let candidates = await enrichCandidatesWithTagAffinity(
        Array.from(candidateMap.values()),
        seedFlavorTags,
        moodTags,
        READ_TIMEOUT
      );

      candidates = candidates
        .map((candidate) => {
          let adjustedScore = candidate.score;
          const artistLower = candidate.artist.toLowerCase();
          const key = candidateKey(candidate.name, candidate.artist);
          const sourceText = candidate.source.join(" ").toLowerCase();
          if (artistLower === currentArtistLower) adjustedScore -= 6;
          if (similarArtistSet.has(artistLower)) adjustedScore += 4;
          else adjustedScore -= 3;
          if (wantsAnimeTheme) {
            if (/anime|anisong|j-pop|j-rock|opening|ending|soundtrack|orchestral|score/.test(sourceText)) adjustedScore += 5;
            else adjustedScore -= 4;
          }
          if (recentKeys.has(key)) adjustedScore -= 12;
          adjustedScore += Math.random() * 2;
          return { ...candidate, score: adjustedScore };
        })
        .filter((candidate) => candidate.score > 0);

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

      const seenArtists = new Set<string>();
      candidates = shuffled.filter((candidate) => {
        const artistKey = candidate.artist.toLowerCase();
        if (seenArtists.has(artistKey)) return false;
        seenArtists.add(artistKey);
        return true;
      }).slice(0, 8);

      if (candidates.length === 0) {
        const totalResults = tagResults.reduce((n, r) => n + r.tracks.length, 0);
        const fallbackQuery = (moodArg?.trim() || queryTags.join(" ") || state.artistName).trim();
        spindle.log.info(`[mood_discover] ${totalResults} raw results but no ranked candidates; falling back to Spotify query "${fallbackQuery}"`);
        return playMoodFallback(fallbackQuery, state, council, sessionUserId, guardPlaybackMutation);
      }

      spindle.log.info(`[mood_discover] Resolving ${candidates.length} candidates on Spotify`);

      // ── Batch 3: Resolve on Spotify + play ─────────────────────
      const resolved = (await Promise.all(
        candidates.map(c =>
          timed(resolveOnSpotify(c.name, c.artist), READ_TIMEOUT, `spotify.search("${c.name}")`)
            .catch((err: Error) => { spindle.log.warn(err.message); return null; })
        )
      )).filter((r): r is SearchResult => r !== null);

      if (resolved.length === 0) {
        const fallbackQuery = (moodArg?.trim() || queryTags.join(" ") || state.artistName).trim();
        spindle.log.info(`[mood_discover] No Spotify matches for Last.fm candidates; falling back to Spotify query "${fallbackQuery}"`);
        return playMoodFallback(fallbackQuery, state, council, sessionUserId, guardPlaybackMutation);
      }

      guardPlaybackMutation(`mood result play for \"${resolved[0].name}\"`);
      await timed(spotify.play({ trackUri: resolved[0].uri }), WRITE_TIMEOUT, "spotify.play");
      pushStateAfterCommand(sessionUserId);

      // Queue remaining in the background so discovery returns quickly even on
      // slower connections.
      const toQueue = resolved.slice(1, 4);
      await rememberMoodDiscoveries(resolved.slice(0, 4));
      if (toQueue.length > 0) {
        void Promise.allSettled(
          toQueue.map(async (track) => {
            guardPlaybackMutation(`mood queue for \"${track.name}\"`);
            return timed(spotify.addToQueue(track.uri), WRITE_TIMEOUT, `spotify.queue("${track.name}")`);
          })
        ).then((results) => {
          results.forEach((result, index) => {
            if (result.status === "rejected") {
              spindle.log.warn(`Queue failed for "${toQueue[index]?.name}": ${result.reason?.message || result.reason}`);
            }
          });
        });
      }

      const moodDesc = queryTags.join(", ");
      const queueLine = toQueue.length > 0
        ? `\n\nQueueing ${toQueue.length} varied tracks:\n${toQueue.map((q, i) => `${i + 1}. "${q.name}" by ${q.artist}`).join("\n")}`
        : "";
      const prefix = (council || (moodArg && context)) ? `[Mood discovery: ${moodDesc}] ` : "";
      spindle.log.info(`[mood_discover] Done — playing "${resolved[0].name}", ${toQueue.length} queued in background`);
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
      guardPlaybackMutation(`queue for \"${uri || "unknown track"}\"`);
      await spotify.addToQueue(uri || "");
      return "Track added to queue.";
    } catch (err: any) {
      return `Failed to queue track: ${err?.message}`;
    }
  }
  } finally {
    // No-op: stale invocations are handled by activeToolInvocations guards.
  }
});

// ─── Init ────────────────────────────────────────────────────────────────

(async () => {
  spindle.log.info("Spotify Controls loaded!");
})();
