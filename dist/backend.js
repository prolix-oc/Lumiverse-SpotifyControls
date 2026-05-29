// @bun
// src/spotify-api.ts
var SPOTIFY_API = "https://api.spotify.com/v1";
var SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
var tokenDataByUser = new Map;
var activeUserId;
function setActiveUser(userId) {
  activeUserId = userId;
}
function resolveUserId(userId) {
  return userId || activeUserId;
}
function getTokenData(userId) {
  const resolvedUserId = resolveUserId(userId);
  return resolvedUserId ? tokenDataByUser.get(resolvedUserId) ?? null : null;
}
function setTokenData(data, userId) {
  const resolvedUserId = resolveUserId(userId);
  if (!resolvedUserId)
    throw new Error("Spotify user context is not set");
  tokenDataByUser.set(resolvedUserId, data);
  return resolvedUserId;
}
async function loadTokens(userId) {
  const resolvedUserId = resolveUserId(userId);
  try {
    const raw = await spindle.enclave.get("spotify_tokens", resolvedUserId);
    if (resolvedUserId)
      tokenDataByUser.set(resolvedUserId, raw ? JSON.parse(raw) : null);
  } catch {
    if (resolvedUserId)
      tokenDataByUser.set(resolvedUserId, null);
  }
}
async function saveTokens(data, userId) {
  const resolvedUserId = setTokenData(data, userId);
  await spindle.enclave.put("spotify_tokens", JSON.stringify(data), resolvedUserId);
}
async function clearTokens(userId) {
  const resolvedUserId = setTokenData(null, userId);
  await spindle.enclave.delete("spotify_tokens", resolvedUserId);
}
function isConnected(userId) {
  return getTokenData(userId) !== null;
}
function basicAuthHeader(clientId, clientSecret) {
  return "Basic " + btoa(`${clientId}:${clientSecret}`);
}
function tokenAuthHeaders(clientId, clientSecret) {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  };
  if (clientSecret) {
    headers.Authorization = basicAuthHeader(clientId, clientSecret);
  }
  return headers;
}
function formatSpotifyAuthError(action, status, body) {
  if (!body)
    return `${action} failed (${status})`;
  try {
    const parsed = JSON.parse(body);
    const details = [parsed.error, parsed.error_description || parsed.message].filter(Boolean).join(": ");
    if (details)
      return `${action} failed (${status}): ${details}`;
  } catch {}
  return `${action} failed (${status}): ${body}`;
}
async function refreshAccessToken(userId) {
  const tokenData = getTokenData(userId);
  if (!tokenData)
    throw new Error("No tokens stored");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokenData.refresh_token
  });
  if (!tokenData.client_secret) {
    body.set("client_id", tokenData.client_id);
  }
  const res = await spindle.cors(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: tokenAuthHeaders(tokenData.client_id, tokenData.client_secret),
    body: body.toString()
  });
  if (res.status !== 200) {
    throw new Error(formatSpotifyAuthError("Token refresh", res.status, res.body || ""));
  }
  const json = JSON.parse(res.body);
  const updated = {
    access_token: json.access_token,
    refresh_token: json.refresh_token || tokenData.refresh_token,
    expires_at: Date.now() + json.expires_in * 1000 - 60000,
    client_id: tokenData.client_id,
    client_secret: tokenData.client_secret
  };
  await saveTokens(updated, userId);
  return updated.access_token;
}
async function ensureToken(userId) {
  const tokenData = getTokenData(userId);
  if (!tokenData)
    throw new Error("Not connected to Spotify");
  if (Date.now() >= tokenData.expires_at) {
    return refreshAccessToken(userId);
  }
  return tokenData.access_token;
}
async function spotifyFetch(endpoint, options = {}, userId) {
  const token = await ensureToken(userId);
  const res = await spindle.cors(`${SPOTIFY_API}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: options.body
  });
  if (res.status === 401) {
    const newToken = await refreshAccessToken(userId);
    return await spindle.cors(`${SPOTIFY_API}${endpoint}`, {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json"
      },
      body: options.body
    });
  }
  return res;
}
async function getCurrentPlayback(userId) {
  const res = await spotifyFetch("/me/player", {}, userId);
  if (res.status === 204 || !res.body || res.body.trim() === "")
    return null;
  if (res.status !== 200)
    return null;
  return parsePlaybackState(JSON.parse(res.body));
}
function parsePlaybackState(data) {
  if (!data?.item)
    return null;
  const images = data.item.album?.images ?? [];
  return {
    isPlaying: data.is_playing,
    trackName: data.item.name,
    artistName: (data.item.artists || []).map((a) => a.name).join(", "),
    albumName: data.item.album?.name || "",
    albumArtUrl: images.length > 0 ? images[images.length > 1 ? 1 : 0].url : null,
    progressMs: data.progress_ms || 0,
    durationMs: data.item.duration_ms || 0,
    shuffleState: data.shuffle_state || false,
    repeatState: data.repeat_state || "off",
    volume: data.device?.volume_percent ?? null,
    trackUri: data.item.uri || "",
    deviceName: data.device?.name || null,
    deviceType: data.device?.type || null,
    deviceId: data.device?.id || null
  };
}
async function play(options, userId) {
  const body = {};
  if (options?.contextUri)
    body.context_uri = options.contextUri;
  if (options?.trackUri)
    body.uris = [options.trackUri];
  await spotifyFetch("/me/player/play", {
    method: "PUT",
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
  }, userId);
}
async function pause(userId) {
  await spotifyFetch("/me/player/pause", { method: "PUT" }, userId);
}
async function next(userId) {
  await spotifyFetch("/me/player/next", { method: "POST" }, userId);
}
async function previous(userId) {
  await spotifyFetch("/me/player/previous", { method: "POST" }, userId);
}
async function seek(positionMs, userId) {
  await spotifyFetch(`/me/player/seek?position_ms=${positionMs}`, {
    method: "PUT"
  }, userId);
}
async function setVolume(percent, userId) {
  await spotifyFetch(`/me/player/volume?volume_percent=${Math.round(Math.max(0, Math.min(100, percent)))}`, { method: "PUT" }, userId);
}
async function setShuffle(state, userId) {
  await spotifyFetch(`/me/player/shuffle?state=${state}`, { method: "PUT" }, userId);
}
async function setRepeat(mode, userId) {
  await spotifyFetch(`/me/player/repeat?state=${mode}`, { method: "PUT" }, userId);
}
async function search(query, userId) {
  const res = await spotifyFetch(`/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {}, userId);
  if (res.status !== 200)
    return [];
  const data = JSON.parse(res.body);
  return (data.tracks?.items || []).filter((track) => track != null).map((track) => {
    const images = track.album?.images ?? [];
    return {
      name: track.name ?? "",
      artist: (track.artists || []).map((a) => a.name).join(", "),
      album: track.album?.name || "",
      albumArtUrl: images.length > 0 ? images[images.length > 1 ? 1 : 0].url : null,
      uri: track.uri ?? "",
      durationMs: track.duration_ms || 0
    };
  });
}
async function addToQueue(uri, userId) {
  await spotifyFetch(`/me/player/queue?uri=${encodeURIComponent(uri)}`, {
    method: "POST"
  }, userId);
}
async function getDevices(userId) {
  const res = await spotifyFetch("/me/player/devices", {}, userId);
  if (res.status !== 200)
    return [];
  const data = JSON.parse(res.body);
  return (data.devices || []).map((d) => ({
    id: d.id || "",
    name: d.name || "Unknown",
    type: d.type || "unknown",
    isActive: d.is_active || false,
    volume: d.volume_percent ?? null
  }));
}
async function transferPlayback(deviceId, userId) {
  await spotifyFetch("/me/player", {
    method: "PUT",
    body: JSON.stringify({ device_ids: [deviceId], play: true })
  }, userId);
}
var LRCLIB_API = "https://lrclib.net/api";
function normalizeInstrumental(result) {
  if (result.instrumental)
    return result;
  const plain = result.plainLyrics?.trim().toLowerCase();
  if (plain === "instrumental") {
    return { plainLyrics: null, syncedLyrics: null, instrumental: true };
  }
  if (result.syncedLyrics) {
    const lines = result.syncedLyrics.split(`
`).filter((l) => l.trim());
    if (lines.length === 1) {
      const text = lines[0].replace(/\[\d+:\d+[.:]\d+\]\s*/g, "").trim().toLowerCase();
      if (text === "instrumental") {
        return { plainLyrics: null, syncedLyrics: null, instrumental: true };
      }
    }
  }
  return result;
}
async function getLyrics(trackName, artistName, albumName, durationSec, _userId) {
  const params = new URLSearchParams({
    track_name: trackName,
    artist_name: artistName,
    album_name: albumName,
    duration: String(Math.round(durationSec))
  });
  try {
    const res = await spindle.cors(`${LRCLIB_API}/get?${params.toString()}`, {
      method: "GET",
      headers: { "User-Agent": "Lumiverse-SpotifyControls/1.0.0" }
    });
    if (res.status === 200) {
      const data = JSON.parse(res.body);
      return normalizeInstrumental({
        plainLyrics: data.plainLyrics || null,
        syncedLyrics: data.syncedLyrics || null,
        instrumental: data.instrumental || false
      });
    }
  } catch {}
  try {
    const searchParams = new URLSearchParams({
      q: `${artistName} ${trackName}`
    });
    const res = await spindle.cors(`${LRCLIB_API}/search?${searchParams.toString()}`, {
      method: "GET",
      headers: { "User-Agent": "Lumiverse-SpotifyControls/1.0.0" }
    });
    if (res.status === 200) {
      const results = JSON.parse(res.body);
      if (results.length > 0) {
        const best = results[0];
        return normalizeInstrumental({
          plainLyrics: best.plainLyrics || null,
          syncedLyrics: best.syncedLyrics || null,
          instrumental: best.instrumental || false
        });
      }
    }
  } catch {}
  return null;
}
async function searchPlaylists(query, limit = 15) {
  const res = await spotifyFetch(`/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}`);
  if (res.status !== 200)
    return [];
  const data = JSON.parse(res.body);
  return (data.playlists?.items || []).filter((p) => p != null).map((p) => {
    const images = p.images ?? [];
    return {
      name: p.name ?? "",
      owner: p.owner?.display_name || "Unknown",
      trackCount: p.tracks?.total || 0,
      uri: p.uri ?? "",
      spotifyUrl: p.external_urls?.spotify || "",
      imageUrl: images.length > 0 ? images[0].url : null
    };
  });
}
var LASTFM_API = "https://ws.audioscrobbler.com/2.0/";
async function lastfmFetch(method, params, userId) {
  const lastfmApiKey = await spindle.enclave.get("lastfm_api_key", resolveUserId(userId));
  if (!lastfmApiKey) {
    throw new Error("Last.fm API key not configured. Please add it in the Spotify Controls settings.");
  }
  const query = new URLSearchParams({
    method,
    api_key: lastfmApiKey,
    format: "json",
    ...params
  });
  const res = await spindle.cors(`${LASTFM_API}?${query.toString()}`, {
    method: "GET"
  });
  if (res.status !== 200) {
    throw new Error(`Last.fm API error (${res.status})`);
  }
  return JSON.parse(res.body);
}
async function getSimilarTracks(track, artist, limit = 15, userId) {
  const data = await lastfmFetch("track.getSimilar", {
    track,
    artist,
    autocorrect: "1",
    limit: String(limit)
  }, userId);
  return (data.similartracks?.track || []).map((t) => ({
    name: t.name,
    artist: t.artist?.name || "",
    match: parseFloat(t.match) || 0
  })).sort((a, b) => b.match - a.match);
}
async function getSimilarArtists(artist, limit = 10, userId) {
  const data = await lastfmFetch("artist.getSimilar", {
    artist,
    limit: String(limit)
  }, userId);
  return (data.similarartists?.artist || []).map((a) => a.name);
}
async function getTopTracksByTag(tag, limit = 15, page = 1, userId) {
  const data = await lastfmFetch("tag.getTopTracks", {
    tag,
    limit: String(limit),
    page: String(page)
  }, userId);
  return (data.tracks?.track || []).map((t) => ({
    name: t.name,
    artist: t.artist?.name || ""
  }));
}
async function getTrackTopTags(track, artist, userId) {
  const data = await lastfmFetch("track.getTopTags", {
    track,
    artist,
    autocorrect: "1"
  }, userId);
  return (data.toptags?.tag || []).map((t) => ({
    name: (t.name || "").toLowerCase().trim(),
    count: parseInt(t.count) || 0
  })).filter((t) => t.count > 0);
}
async function getArtistTopTags(artist, userId) {
  const data = await lastfmFetch("artist.getTopTags", {
    artist,
    autocorrect: "1"
  }, userId);
  return (data.toptags?.tag || []).map((t) => ({
    name: (t.name || "").toLowerCase().trim(),
    count: parseInt(t.count) || 0
  })).filter((t) => t.count > 0);
}
async function exchangeCodeForTokens(code, redirectUri, clientId, clientSecret, codeVerifier) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri
  });
  if (codeVerifier) {
    body.set("client_id", clientId);
    body.set("code_verifier", codeVerifier);
  }
  const res = await spindle.cors(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: tokenAuthHeaders(clientId, codeVerifier ? undefined : clientSecret),
    body: body.toString()
  });
  if (res.status !== 200) {
    throw new Error(formatSpotifyAuthError("Token exchange", res.status, res.body || ""));
  }
  const json = JSON.parse(res.body);
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: Date.now() + json.expires_in * 1000 - 60000,
    client_id: clientId,
    client_secret: clientSecret || undefined
  };
}

// src/backend.ts
var activeUserId2 = null;
var sessions = new Map;
var pendingOAuthByState = new Map;
function send(msg, userId) {
  spindle.sendToFrontend(msg, userId);
}
function getSession(userId) {
  let session = sessions.get(userId);
  if (!session) {
    session = {
      pollingInterval: null,
      pollingGeneration: 0,
      nullStateRetries: 0,
      lastState: null,
      lastStateUpdatedAt: 0,
      cachedLyrics: null,
      initialized: false
    };
    sessions.set(userId, session);
  }
  return session;
}
function syncActiveUserState(userId) {
  activeUserId2 = userId;
  setActiveUser(userId);
  const session = getSession(userId);
  lastState = session.lastState;
  lastStateUpdatedAt = session.lastStateUpdatedAt;
}
async function loadConfig(userId) {
  const stored = await spindle.userStorage.getJson("config.json", {
    fallback: { clientId: "" },
    userId
  });
  const [clientSecret, lastfmApiKey] = await Promise.all([
    spindle.enclave.get("client_secret", userId),
    spindle.enclave.get("lastfm_api_key", userId)
  ]);
  return {
    clientId: stored.clientId,
    clientSecret: clientSecret || "",
    lastfmApiKey: lastfmApiKey || undefined
  };
}
async function saveConfig(config, userId) {
  await spindle.userStorage.setJson("config.json", { clientId: config.clientId }, { userId });
  await Promise.all([
    config.clientSecret ? spindle.enclave.put("client_secret", config.clientSecret, userId) : spindle.enclave.delete("client_secret", userId),
    config.lastfmApiKey ? spindle.enclave.put("lastfm_api_key", config.lastfmApiKey, userId) : Promise.resolve()
  ]);
}
function base64UrlEncode(bytes) {
  let binary = "";
  for (const byte of bytes)
    binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function createCodeVerifier() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}
async function createCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}
function getLoopbackRedirectUri(serverBaseUrl) {
  const url = new URL(serverBaseUrl);
  url.hostname = "127.0.0.1";
  return url.origin + spindle.oauth.getCallbackUrl();
}
var MIGRATION_FLAG = "enclave_migration_done.json";
async function migrateToEnclave(userId) {
  try {
    const done = await spindle.userStorage.getJson(MIGRATION_FLAG, {
      fallback: { done: false },
      userId
    });
    if (done.done)
      return;
    const oldUserConfig = await spindle.userStorage.getJson("config.json", {
      fallback: { clientId: "", clientSecret: "" },
      userId
    });
    const oldSharedConfig = await spindle.storage.getJson("config.json", {
      fallback: { clientId: "", clientSecret: "" }
    });
    const oldConfig = oldUserConfig.clientId || oldUserConfig.clientSecret || oldUserConfig.lastfmApiKey ? oldUserConfig : oldSharedConfig;
    if (oldConfig.clientSecret || oldConfig.lastfmApiKey) {
      if (oldConfig.clientSecret) {
        await spindle.enclave.put("client_secret", oldConfig.clientSecret, userId);
      }
      if (oldConfig.lastfmApiKey) {
        await spindle.enclave.put("lastfm_api_key", oldConfig.lastfmApiKey, userId);
      }
      await spindle.userStorage.setJson("config.json", { clientId: oldConfig.clientId }, { userId });
      spindle.log.info("Migrated config secrets to secure enclave");
    }
    try {
      const raw = await spindle.storage.read("tokens.json");
      if (raw) {
        await spindle.enclave.put("spotify_tokens", raw, userId);
        await spindle.storage.delete("tokens.json");
        spindle.log.info("Migrated OAuth tokens to secure enclave");
      }
    } catch {}
    await spindle.userStorage.setJson(MIGRATION_FLAG, { done: true }, { userId });
  } catch (err) {
    spindle.log.warn(`Enclave migration: ${err?.message}`);
  }
}
async function handleUserChange(userId) {
  const session = getSession(userId);
  if (!session.initialized) {
    await migrateToEnclave(userId);
    await loadCachedState(userId);
    await loadTokens(userId);
    session.initialized = true;
  }
  if (activeUserId2 === userId || !activeUserId2 || isConnected(userId)) {
    syncActiveUserState(userId);
  }
  if (isConnected(userId)) {
    startPolling(userId);
  } else {
    stopPolling(userId);
  }
}
var DEFAULT_SIZE_PRESETS = { small: 36, medium: 48, large: 64 };
var MODERN_SIZE_PRESETS = { small: 112, medium: 128, large: 144 };
var DEFAULT_WIDGET_SIZE_MIN = 24;
var DEFAULT_WIDGET_SIZE_MAX = 128;
var MODERN_WIDGET_SIZE_MIN = 112;
var MODERN_WIDGET_SIZE_MAX = 192;
function getSizePresets(style) {
  return style === "modern" ? MODERN_SIZE_PRESETS : DEFAULT_SIZE_PRESETS;
}
function getSizeBounds(style) {
  return style === "modern" ? { min: MODERN_WIDGET_SIZE_MIN, max: MODERN_WIDGET_SIZE_MAX } : { min: DEFAULT_WIDGET_SIZE_MIN, max: DEFAULT_WIDGET_SIZE_MAX };
}
function clampWidgetSize(size, style) {
  const { min, max } = getSizeBounds(style);
  return Math.max(min, Math.min(size, max));
}
function isSizeMode(value) {
  return value === "small" || value === "medium" || value === "large" || value === "custom";
}
function inferSizeMode(size, style) {
  const presets = getSizePresets(style);
  if (size === presets.small)
    return "small";
  if (size === presets.large)
    return "large";
  if (size !== presets.medium)
    return "custom";
  return "medium";
}
function normalizeWidgetPrefs(prefs) {
  const miniPlayerStyle = prefs?.miniPlayerStyle === "modern" ? "modern" : "default";
  const presets = getSizePresets(miniPlayerStyle);
  let sizeMode = isSizeMode(prefs?.sizeMode) ? prefs.sizeMode : undefined;
  let size = typeof prefs?.size === "number" ? clampWidgetSize(prefs.size, miniPlayerStyle) : presets.medium;
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
    y: typeof prefs?.y === "number" ? prefs.y : undefined
  };
}
var lastState = null;
var lastStateUpdatedAt = 0;
async function loadCachedState(userId) {
  const session = getSession(userId);
  try {
    const cachedState = await spindle.userStorage.getJson("last_state.json", { userId });
    session.lastState = cachedState ? { ...cachedState, albumArtUrl: null } : null;
    session.lastStateUpdatedAt = 0;
  } catch {
    session.lastState = null;
    session.lastStateUpdatedAt = 0;
  }
  if (activeUserId2 === userId)
    syncActiveUserState(userId);
}
async function cacheState(userId, state) {
  const session = getSession(userId);
  session.lastState = state;
  session.lastStateUpdatedAt = state ? Date.now() : 0;
  if (activeUserId2 === userId)
    syncActiveUserState(userId);
  if (state) {
    await spindle.userStorage.setJson("last_state.json", state, { userId }).catch(() => {});
  } else {
    await spindle.userStorage.delete("last_state.json", userId).catch(() => {});
  }
  pushPlaybackMacros(state);
}
spindle.permissions.onChanged(({ permission, granted }) => {
  if (permission !== "cors_proxy")
    return;
  if (granted) {
    for (const userId of sessions.keys()) {
      if (isConnected(userId))
        startPolling(userId);
    }
  } else if (!granted) {
    for (const userId of sessions.keys()) {
      stopPolling(userId);
      send({ type: "state", playbackState: null, connected: false }, userId);
    }
  }
});
var POLL_ACTIVE_MS = 5000;
var POLL_PAUSED_MS = 15000;
function startPolling(userId) {
  stopPolling(userId);
  const session = getSession(userId);
  session.pollingGeneration += 1;
  const generation = session.pollingGeneration;
  scheduleNextPoll(userId);
  primePlaybackState(generation, userId);
}
var MAX_NULL_RETRIES = 3;
function scheduleNextPoll(userId) {
  const session = getSession(userId);
  const useFastPoll = session.lastState?.isPlaying || session.nullStateRetries > 0;
  const interval = useFastPoll ? POLL_ACTIVE_MS : POLL_PAUSED_MS;
  session.pollingInterval = setTimeout(async () => {
    if (!isConnected(userId)) {
      scheduleNextPoll(userId);
      return;
    }
    const previousUri = session.lastState?.trackUri ?? null;
    try {
      const state = await getCurrentPlayback(userId);
      if (!state && previousUri) {
        session.nullStateRetries = Math.min(session.nullStateRetries + 1, MAX_NULL_RETRIES);
      } else {
        session.nullStateRetries = 0;
      }
      await cacheState(userId, state);
      send({ type: "state", playbackState: state, connected: true }, userId);
      if (state && previousUri && state.trackUri !== previousUri) {
        setTimeout(async () => {
          try {
            const fresh = await getCurrentPlayback(userId);
            if (fresh) {
              await cacheState(userId, fresh);
              send({ type: "state", playbackState: fresh, connected: true }, userId);
            }
          } catch {}
        }, 1200);
      }
    } catch (err) {
      spindle.log.warn(`Polling error: ${err?.message}`);
    }
    scheduleNextPoll(userId);
  }, interval);
}
function stopPolling(userId) {
  const session = getSession(userId);
  if (session.pollingInterval) {
    clearTimeout(session.pollingInterval);
    session.pollingInterval = null;
  }
  session.pollingGeneration += 1;
}
async function pushStateUpdate(userId) {
  try {
    const state = await getCurrentPlayback(userId);
    await cacheState(userId, state);
    send({ type: "state", playbackState: state, connected: true }, userId);
    return state;
  } catch {
    return null;
  }
}
async function primePlaybackState(generation, userId) {
  const session = getSession(userId);
  const retryDelays = [0, 1000, 3000];
  for (const delay of retryDelays) {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    if (generation !== session.pollingGeneration || !isConnected(userId)) {
      return;
    }
    const state = await pushStateUpdate(userId);
    if (state) {
      return;
    }
  }
}
function pushStateAfterCommand(userId, expectTrackChange = false) {
  if (!expectTrackChange) {
    setTimeout(() => pushStateUpdate(userId), 300);
    return;
  }
  const previousUri = getSession(userId).lastState?.trackUri ?? null;
  const retryAt = [300, 900, 1800, 3500];
  for (const delay of retryAt) {
    setTimeout(async () => {
      if (getSession(userId).lastState?.trackUri !== previousUri)
        return;
      await pushStateUpdate(userId);
    }, delay);
  }
}
async function completeOAuthCallback(params) {
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
    const tokens = await exchangeCodeForTokens(code, redirectUri, clientId, clientSecret, codeVerifier);
    await saveTokens(tokens, oauthUserId);
    getSession(oauthUserId).initialized = true;
    send({ type: "connected" }, oauthUserId);
    startPolling(oauthUserId);
    return { html: successPage() };
  } catch (err) {
    spindle.log.error(`OAuth token exchange failed: ${err?.message}`);
    send({ type: "error", message: `Authentication failed: ${err?.message}` }, oauthUserId);
    return { html: errorPage(err?.message || "Token exchange failed. Please try again.") };
  }
}
function parseCallbackUrl(value) {
  const trimmed = value.trim();
  const query = trimmed.includes("?") ? trimmed.slice(trimmed.indexOf("?") + 1) : trimmed;
  const params = new URLSearchParams(query);
  const result = {};
  for (const [key, paramValue] of params) {
    result[key] = paramValue;
  }
  return result;
}
spindle.oauth.onCallback(async (params) => {
  return completeOAuthCallback(params);
});
function successPage() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Spotify Connected</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1a1a2e;color:#e0e0e0}
.card{text-align:center;padding:2rem;border-radius:12px;background:#16213e;border:1px solid #1db954}
h1{margin:0 0 .5rem;font-size:1.5rem;color:#1db954}p{margin:0;opacity:.7}</style></head>
<body><div class="card"><h1>Spotify Connected</h1><p>You can close this window.</p></div>
<script>setTimeout(()=>window.close(),2000)</script></body></html>`;
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function errorPage(message) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Connection Failed</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1a1a2e;color:#e0e0e0}
.card{text-align:center;padding:2rem;border-radius:12px;background:#16213e;border:1px solid #e74c3c}
h1{margin:0 0 .5rem;font-size:1.5rem;color:#e74c3c}p{margin:0;opacity:.7}</style></head>
<body><div class="card"><h1>Connection Failed</h1><p>${escapeHtml(message)}</p></div></body></html>`;
}
spindle.onFrontendMessage(async (raw, userId) => {
  await handleUserChange(userId);
  const msg = raw;
  try {
    switch (msg.type) {
      case "get_state": {
        const playbackState = isConnected(userId) ? await getCurrentPlayback(userId) : null;
        await cacheState(userId, playbackState);
        send({
          type: "state",
          playbackState,
          connected: isConnected(userId)
        }, userId);
        break;
      }
      case "get_config": {
        const config = await loadConfig(userId);
        send({
          type: "config",
          clientId: config.clientId,
          hasSecret: !!config.clientSecret,
          connected: isConnected(userId),
          callbackUrl: spindle.oauth.getCallbackUrl(),
          hasLastfmKey: !!config.lastfmApiKey
        }, userId);
        break;
      }
      case "connect": {
        const { clientId, clientSecret, serverBaseUrl } = msg;
        const existing = await loadConfig(userId);
        await saveConfig({ clientId, clientSecret: clientSecret || "", lastfmApiKey: existing.lastfmApiKey }, userId);
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
          state,
          code_challenge_method: "S256",
          code_challenge: codeChallenge
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
        await clearTokens(userId);
        await spindle.theme.clear(userId).catch(() => {});
        const session = getSession(userId);
        session.cachedLyrics = null;
        await cacheState(userId, null);
        if (activeUserId2 === userId) {
          activeUserId2 = null;
          lastState = null;
          lastStateUpdatedAt = 0;
        }
        send({ type: "disconnected" }, userId);
        send({ type: "state", playbackState: null, connected: false }, userId);
        break;
      }
      case "play":
        await play({
          trackUri: msg.trackUri,
          contextUri: msg.contextUri
        }, userId);
        pushStateAfterCommand(userId);
        break;
      case "pause":
        await pause(userId);
        pushStateAfterCommand(userId);
        break;
      case "next":
        await next(userId);
        pushStateAfterCommand(userId, true);
        break;
      case "previous":
        await previous(userId);
        pushStateAfterCommand(userId, true);
        break;
      case "seek":
        await seek(msg.positionMs, userId);
        pushStateAfterCommand(userId);
        break;
      case "set_volume":
        await setVolume(msg.percent, userId);
        pushStateAfterCommand(userId);
        break;
      case "toggle_shuffle": {
        const state = await getCurrentPlayback(userId);
        if (state)
          await setShuffle(!state.shuffleState, userId);
        pushStateAfterCommand(userId);
        break;
      }
      case "set_repeat":
        await setRepeat(msg.mode, userId);
        pushStateAfterCommand(userId);
        break;
      case "search": {
        const results = await search(msg.query, userId);
        send({ type: "search_results", results }, userId);
        break;
      }
      case "queue":
        await addToQueue(msg.trackUri, userId);
        break;
      case "get_devices": {
        const devices = await getDevices(userId);
        send({ type: "devices", devices }, userId);
        break;
      }
      case "transfer_playback":
        await transferPlayback(msg.deviceId, userId);
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
          connected: isConnected(userId),
          callbackUrl: spindle.oauth.getCallbackUrl(),
          hasLastfmKey: !!config.lastfmApiKey
        }, userId);
        break;
      }
      case "get_widget_prefs": {
        const stored = await spindle.userStorage.getJson("widget_prefs.json", {
          fallback: { size: 48, shape: "circle", sizeMode: "medium", miniPlayerStyle: "default" },
          userId
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
        const trackUri = getSession(userId).lastState?.trackUri || "";
        const lyrics = await getLyricsForCurrentTrack(userId);
        send({
          type: "lyrics",
          trackUri,
          plainLyrics: lyrics?.plainLyrics || null,
          syncedLyrics: lyrics?.syncedLyrics || null,
          instrumental: !!lyrics?.instrumental
        }, userId);
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
  } catch (err) {
    send({ type: "error", message: err?.message || "Unknown error" }, userId);
  }
});
async function getLyricsForCurrentTrack(userId) {
  const resolvedUserId = userId || activeUserId2 || undefined;
  if (!resolvedUserId || !isConnected(resolvedUserId))
    return null;
  const session = getSession(resolvedUserId);
  try {
    const state = session.lastState || await getCurrentPlayback(resolvedUserId);
    if (!state)
      return null;
    if (session.cachedLyrics && session.cachedLyrics.trackUri === state.trackUri) {
      return session.cachedLyrics.data;
    }
    const data = await getLyrics(state.trackName, state.artistName, state.albumName, state.durationMs / 1000, resolvedUserId);
    session.cachedLyrics = { trackUri: state.trackUri, data };
    if (activeUserId2 === resolvedUserId)
      syncActiveUserState(resolvedUserId);
    pushLyricsMacros(data);
    return data;
  } catch {
    return null;
  }
}
async function applyAlbumTheme(colors, userId) {
  try {
    const themeApi = spindle.theme;
    if (!colors) {
      await themeApi.clear(userId);
      return;
    }
    await spindle.theme.applyPalette({ accent: colors.dominantHsl }, userId);
  } catch (err) {
    spindle.log.warn(`Album theme: ${err?.message}`);
  }
}
var SONG_META_KEY = "spotify_song";
var SNAPSHOT_FRESH_MS = 8000;
function trackUriToUrl(uri) {
  const m = /^spotify:([a-z]+):([A-Za-z0-9]+)/.exec(uri || "");
  if (m)
    return `https://open.spotify.com/${m[1]}/${m[2]}`;
  return uri || "";
}
function buildSongSnapshot(state) {
  if (!state || !state.trackUri || !state.trackName)
    return null;
  return {
    trackName: state.trackName,
    artistName: state.artistName,
    albumName: state.albumName,
    albumArtUrl: state.albumArtUrl ?? null,
    trackUri: state.trackUri,
    spotifyUrl: trackUriToUrl(state.trackUri),
    isPlaying: state.isPlaying,
    capturedAt: Date.now()
  };
}
async function getSnapshotState(userId) {
  const session = getSession(userId);
  if (session.lastState && Date.now() - session.lastStateUpdatedAt <= SNAPSHOT_FRESH_MS) {
    return session.lastState;
  }
  if (isConnected(userId)) {
    const fresh = await getCurrentPlayback(userId).catch(() => null);
    if (fresh)
      return fresh;
  }
  return session.lastState;
}
function readSpindleMeta(message) {
  const fromMeta = message.metadata;
  if (fromMeta && typeof fromMeta === "object")
    return { ...fromMeta };
  const fromExtra = message.extra?.spindle_metadata;
  if (fromExtra && typeof fromExtra === "object")
    return { ...fromExtra };
  return {};
}
function readSongMap(meta) {
  const node = meta[SONG_META_KEY];
  const bySwipe = node?.bySwipe;
  if (!bySwipe || typeof bySwipe !== "object")
    return {};
  const out = {};
  for (const [k, v] of Object.entries(bySwipe)) {
    const idx = Number(k);
    if (Number.isInteger(idx) && v && typeof v === "object")
      out[idx] = v;
  }
  return out;
}
function isAssistantMessage(message) {
  return message.is_user === false && message.name !== "System";
}
async function captureSongForMessage(chatId, message, swipeId, userId) {
  if (!chatId || !message?.id)
    return;
  const snapshot = buildSongSnapshot(await getSnapshotState(userId));
  if (!snapshot)
    return;
  const meta = readSpindleMeta(message);
  const map = readSongMap(meta);
  map[swipeId] = snapshot;
  meta[SONG_META_KEY] = { bySwipe: map };
  try {
    await spindle.chat.updateMessage(chatId, message.id, { metadata: meta, skipChunkRebuild: true });
  } catch (err) {
    spindle.log.warn(`Song capture (update) failed: ${err?.message}`);
    return;
  }
  send({ type: "message_song", chatId, messageId: message.id, swipeId, snapshot }, userId);
}
async function realignAfterSwipeDelete(chatId, message, deletedIndex, userId) {
  if (!message.id)
    return;
  const meta = readSpindleMeta(message);
  const map = readSongMap(meta);
  if (Object.keys(map).length === 0)
    return;
  const next2 = {};
  for (const [k, v] of Object.entries(map)) {
    const idx = Number(k);
    if (idx === deletedIndex)
      continue;
    next2[idx > deletedIndex ? idx - 1 : idx] = v;
  }
  meta[SONG_META_KEY] = { bySwipe: next2 };
  try {
    await spindle.chat.updateMessage(chatId, message.id, { metadata: meta, skipChunkRebuild: true });
  } catch (err) {
    spindle.log.warn(`Song capture (realign) failed: ${err?.message}`);
    return;
  }
  await sendChatSongs(chatId, userId).catch(() => {});
}
async function sendChatSongs(chatId, userId) {
  if (!chatId)
    return;
  let messages;
  try {
    messages = await spindle.chat.getMessages(chatId);
  } catch (err) {
    spindle.log.warn(`get_chat_songs failed: ${err?.message}`);
    return;
  }
  const entries = [];
  for (const m of messages) {
    if (m.is_user)
      continue;
    const map = readSongMap(readSpindleMeta(m));
    if (Object.keys(map).length === 0)
      continue;
    entries.push({ messageId: m.id, activeSwipe: m.swipe_id ?? 0, bySwipe: map });
  }
  send({ type: "chat_songs", chatId, entries }, userId);
}
spindle.on("MESSAGE_SENT", async (payload, userId) => {
  const p = payload;
  const message = p?.message;
  const chatId = p?.chatId;
  const uid = userId || activeUserId2;
  if (!chatId || !message || !uid || !isAssistantMessage(message))
    return;
  await captureSongForMessage(chatId, message, message.swipe_id ?? 0, uid).catch(() => {});
});
spindle.on("MESSAGE_SWIPED", async (payload, userId) => {
  const p = payload;
  const message = p?.message;
  const chatId = p?.chatId;
  const uid = userId || activeUserId2;
  if (!chatId || !message || !uid || !message.id || !isAssistantMessage(message))
    return;
  if (p?.action === "added") {
    const swipeId = typeof p.swipeId === "number" ? p.swipeId : message.swipe_id ?? 0;
    await captureSongForMessage(chatId, message, swipeId, uid).catch(() => {});
  } else if (p?.action === "deleted" && typeof p?.swipeId === "number") {
    await realignAfterSwipeDelete(chatId, message, p.swipeId, uid).catch(() => {});
  }
});
spindle.commands.register([
  {
    id: "play-pause",
    label: "Play / Pause",
    description: "Toggle Spotify playback",
    keywords: ["music", "play", "pause", "stop", "resume", "song"],
    scope: "global"
  },
  {
    id: "next-track",
    label: "Next Track",
    description: "Skip to the next track on Spotify",
    keywords: ["skip", "forward", "next", "song", "music"],
    scope: "global"
  },
  {
    id: "previous-track",
    label: "Previous Track",
    description: "Go back to the previous track on Spotify",
    keywords: ["back", "rewind", "previous", "song", "music"],
    scope: "global"
  }
]);
spindle.commands.onInvoked(async (commandId) => {
  if (!isConnected())
    return;
  const commandUserId = activeUserId2;
  if (!commandUserId)
    return;
  try {
    switch (commandId) {
      case "play-pause": {
        const state = lastState || await getCurrentPlayback();
        if (state?.isPlaying) {
          await pause();
        } else {
          await play({});
        }
        pushStateAfterCommand(commandUserId);
        break;
      }
      case "next-track":
        await next();
        pushStateAfterCommand(commandUserId, true);
        break;
      case "previous-track":
        await previous();
        pushStateAfterCommand(commandUserId, true);
        break;
    }
  } catch (err) {
    spindle.log.warn(`Command "${commandId}": ${err?.message}`);
  }
});
spindle.registerMacro({
  name: "spotify_now_playing",
  category: "extension:spotify_controls",
  description: "Returns the currently playing Spotify track",
  returnType: "string",
  handler: async () => {
    const state = isConnected() ? await getCurrentPlayback().catch(() => null) : null;
    if (!state)
      return "Nothing playing";
    return `${state.trackName} by ${state.artistName}`;
  }
});
spindle.registerMacro({
  name: "spotify_track_name",
  category: "extension:spotify_controls",
  description: "Returns the track name of the currently playing Spotify track",
  returnType: "string",
  handler: async () => {
    const state = isConnected() ? await getCurrentPlayback().catch(() => null) : null;
    return state?.trackName || "";
  }
});
spindle.registerMacro({
  name: "spotify_artists",
  category: "extension:spotify_controls",
  description: "Returns the artist(s) of the currently playing Spotify track",
  returnType: "string",
  handler: async () => {
    const state = isConnected() ? await getCurrentPlayback().catch(() => null) : null;
    return state?.artistName || "";
  }
});
spindle.registerMacro({
  name: "spotify_album_name",
  category: "extension:spotify_controls",
  description: "Returns the album name of the currently playing Spotify track",
  returnType: "string",
  handler: async () => {
    const state = isConnected() ? await getCurrentPlayback().catch(() => null) : null;
    return state?.albumName || "";
  }
});
spindle.registerMacro({
  name: "spotify_album_art",
  category: "extension:spotify_controls",
  description: "Returns the URL of the currently playing track's album art",
  returnType: "string",
  handler: async () => {
    const state = isConnected() ? await getCurrentPlayback().catch(() => null) : null;
    return state?.albumArtUrl || "";
  }
});
spindle.registerMacro({
  name: "spotify_is_playing",
  category: "extension:spotify_controls",
  description: "Returns whether Spotify is currently playing a track",
  returnType: "boolean",
  volatile: true,
  handler: async () => {
    const state = isConnected() ? await getCurrentPlayback().catch(() => null) : null;
    return state?.isPlaying ?? false;
  }
});
spindle.registerMacro({
  name: "spotify_lyrics",
  category: "extension:spotify_controls",
  description: "Returns the full lyrics of the currently playing Spotify track",
  returnType: "string",
  handler: async () => {
    try {
      const lyrics = await getLyricsForCurrentTrack();
      if (!lyrics)
        return "No lyrics available";
      if (lyrics.instrumental)
        return "[Instrumental]";
      return lyrics.plainLyrics || "No lyrics available";
    } catch {
      return "No lyrics available";
    }
  }
});
spindle.registerMacro({
  name: "spotify_has_lyrics",
  category: "extension:spotify_controls",
  description: "Returns whether the currently playing Spotify track has lyrics available",
  returnType: "boolean",
  handler: async () => {
    try {
      const lyrics = await getLyricsForCurrentTrack();
      if (!lyrics || lyrics.instrumental)
        return false;
      return !!(lyrics.syncedLyrics || lyrics.plainLyrics);
    } catch {
      return false;
    }
  }
});
function pushPlaybackMacros(state) {
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
function pushLyricsMacros(lyrics) {
  if (!lyrics || lyrics.instrumental) {
    spindle.updateMacroValue("spotify_lyrics", lyrics?.instrumental ? "[Instrumental]" : "No lyrics available");
    spindle.updateMacroValue("spotify_has_lyrics", "false");
    return;
  }
  spindle.updateMacroValue("spotify_lyrics", lyrics.plainLyrics || "No lyrics available");
  spindle.updateMacroValue("spotify_has_lyrics", String(!!(lyrics.syncedLyrics || lyrics.plainLyrics)));
}
var TOOL_NAMES = [
  "spotify_search",
  "spotify_search_similar",
  "spotify_mood_discover",
  "spotify_queue"
];
for (const name of TOOL_NAMES)
  spindle.unregisterTool(name);
var DEPRECATED_TOOL_NAMES = [
  "spotify_find_playlist",
  "spotify_play",
  "spotify_playlist_tracks",
  "spotify_recommend"
];
for (const name of DEPRECATED_TOOL_NAMES)
  spindle.unregisterTool(name);
spindle.registerTool({
  name: "spotify_search",
  display_name: "Spotify Search & Play",
  description: "Search for music on Spotify and start playback. Supports two modes: 'playlist' searches for curated playlists matching a mood or query and plays the best match; 'tracks' searches for individual songs and plays the top result. Handles the full pipeline \u2014 search, resolve, and play \u2014 in one step.",
  council_eligible: true,
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Either a specific title to find (e.g. 'Bohemian Rhapsody Queen'), or 2-4 descriptors derived from the current scene when scoring an unnamed moment. When deriving from the scene, ground yourself in the most recent beats: the texture of the action, the genre or period the setting suggests, the emotional pitch, what's happening between characters. Aim for descriptors that wouldn't transfer cleanly to a different scene \u2014 if they would, you're reaching for stock phrasing rather than reading what's in front of you." },
      mode: { type: "string", enum: ["tracks", "playlist"], description: "Search mode: 'playlist' finds curated playlists (best for mood/atmosphere), 'tracks' finds individual songs (best for specific songs). Defaults to 'playlist'." }
    },
    required: ["query"]
  }
});
spindle.registerTool({
  name: "spotify_search_similar",
  display_name: "Find & Play Similar Music",
  description: "Find music similar to what is currently playing and start playback. Uses Last.fm's track similarity data (based on listening patterns, not genre tags) to find genuinely related tracks, then resolves and plays them on Spotify. Queues additional similar tracks automatically. Requires a track to be currently playing and a Last.fm API key.",
  council_eligible: true,
  parameters: {
    type: "object",
    properties: {},
    required: []
  }
});
spindle.registerTool({
  name: "spotify_mood_discover",
  display_name: "Mood-Based Music Discovery",
  description: "Discover music matching a specific mood/atmosphere with deliberate variety \u2014 finds tracks from different artists and genres that share the emotional tone. Uses Last.fm's crowd-sourced mood tags for discovery. Requires a track to be currently playing and a Last.fm API key.",
  council_eligible: true,
  parameters: {
    type: "object",
    properties: {
      mood: {
        type: "string",
        description: "2-3 lowercase, comma-separated descriptors derived from the current scene. Before choosing, ground yourself in the most recent beats: the pace, the closeness or distance between characters, the emotional register of the dialogue, the physical setting, what just shifted. Pick words that describe *this* moment's texture \u2014 not the genre of moment it resembles. If your descriptors would fit equally well over a wholly different scene, you're describing the trope rather than the music this scene needs; observe again and reach for something more specific."
      }
    },
    required: []
  }
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
        description: "Spotify track URI (e.g. spotify:track:abc123)"
      }
    },
    required: ["uri"]
  }
});
var MOOD_KEYWORDS = {
  dark: ["dark", "shadow", "grim", "ominous", "dread", "sinister", "bleak", "foreboding", "menacing", "eerie"],
  tense: ["tense", "suspense", "anxious", "nervous", "uneasy", "danger", "threat", "urgent", "panic", "fear"],
  sad: ["sad", "grief", "mourn", "sorrow", "lonely", "melancholy", "loss", "cry", "tears", "heartbreak"],
  romantic: ["love", "kiss", "tender", "intimate", "passion", "embrace", "romantic", "heart", "gentle", "longing"],
  epic: ["battle", "war", "fight", "sword", "army", "charge", "clash", "siege", "conquest", "glory"],
  peaceful: ["calm", "quiet", "serene", "peaceful", "gentle", "rest", "tranquil", "still", "soft", "meadow"],
  mysterious: ["mystery", "secret", "hidden", "enigma", "strange", "curious", "ancient", "forgotten", "cryptic", "arcane"],
  joyful: ["happy", "joy", "laugh", "celebrate", "cheer", "bright", "warm", "smile", "delight", "playful"],
  intense: ["intense", "fierce", "rage", "fury", "storm", "roar", "crash", "fire", "burn", "blaze"],
  ethereal: ["dream", "ethereal", "celestial", "spirit", "ghost", "divine", "heavenly", "astral", "mystic", "void"],
  anime: ["anime", "shonen", "shojo", "isekai", "mecha", "otaku", "opening", "ending", "japanese", "visual kei"],
  cinematic_jp: ["anime", "soundtrack", "orchestral", "japanese", "epic", "dramatic", "opening", "ending", "instrumental", "fantasy"]
};
var MOOD_TAG_SET = new Set([
  "happy",
  "sad",
  "melancholy",
  "melancholic",
  "angry",
  "aggressive",
  "romantic",
  "love",
  "nostalgic",
  "bittersweet",
  "hopeful",
  "euphoric",
  "joyful",
  "cheerful",
  "depressing",
  "gloomy",
  "uplifting",
  "triumphant",
  "passionate",
  "sentimental",
  "wistful",
  "longing",
  "heartbreak",
  "heartfelt",
  "blissful",
  "tender",
  "gentle",
  "fierce",
  "furious",
  "anxious",
  "atmospheric",
  "dreamy",
  "ethereal",
  "haunting",
  "dark",
  "eerie",
  "hypnotic",
  "psychedelic",
  "cinematic",
  "epic",
  "majestic",
  "sinister",
  "ominous",
  "mysterious",
  "brooding",
  "moody",
  "sultry",
  "whimsical",
  "playful",
  "surreal",
  "otherworldly",
  "chill",
  "chillout",
  "relaxing",
  "calm",
  "peaceful",
  "serene",
  "soothing",
  "mellow",
  "laid-back",
  "upbeat",
  "energetic",
  "intense",
  "driving",
  "groovy",
  "fun",
  "party",
  "night",
  "summer",
  "rainy",
  "morning",
  "sensual",
  "introspective",
  "contemplative",
  "spiritual",
  "meditative",
  "nocturnal",
  "warm",
  "sweet",
  "cute",
  "lighthearted",
  "carefree",
  "innocent",
  "hopeful",
  "heartwarming",
  "cozy",
  "breezy",
  "anime",
  "anime ost",
  "anisong",
  "j-pop",
  "j-rock",
  "visual kei",
  "soundtrack",
  "score",
  "orchestral",
  "opening",
  "ending"
]);
var MOOD_TO_LASTFM_TAGS = {
  dark: ["dark", "brooding", "haunting", "ominous", "sinister", "nocturnal"],
  tense: ["intense", "aggressive", "anxious", "driving"],
  sad: ["sad", "melancholy", "melancholic", "bittersweet", "gloomy"],
  romantic: ["romantic", "love", "sensual", "passionate", "tender"],
  epic: ["epic", "cinematic", "triumphant", "majestic", "uplifting"],
  peaceful: ["chill", "relaxing", "calm", "peaceful", "serene", "mellow"],
  mysterious: ["mysterious", "atmospheric", "ethereal", "eerie", "hypnotic"],
  joyful: ["happy", "joyful", "cheerful", "upbeat", "fun", "euphoric"],
  intense: ["aggressive", "energetic", "intense", "fierce", "furious"],
  ethereal: ["dreamy", "ethereal", "atmospheric", "hypnotic", "meditative"],
  warm: ["warm", "gentle", "tender", "heartfelt", "soothing", "cozy"],
  lighthearted: ["fun", "playful", "cheerful", "upbeat", "happy", "whimsical", "carefree"],
  sweet: ["romantic", "tender", "gentle", "love", "heartfelt", "sweet", "innocent"],
  nostalgic: ["nostalgic", "bittersweet", "wistful", "sentimental", "melancholic"],
  suspenseful: ["intense", "dark", "anxious", "driving", "ominous"],
  melancholic: ["melancholy", "melancholic", "sad", "bittersweet", "gloomy"],
  hopeful: ["hopeful", "uplifting", "gentle", "warm", "tender"],
  playful: ["playful", "fun", "upbeat", "whimsical", "groovy", "lighthearted"],
  tender: ["tender", "gentle", "romantic", "heartfelt", "love", "sweet"],
  brooding: ["brooding", "dark", "moody", "introspective", "nocturnal"],
  mellow: ["mellow", "chill", "relaxing", "laid-back", "soothing"],
  dreamy: ["dreamy", "ethereal", "hypnotic", "atmospheric", "psychedelic"],
  gentle: ["gentle", "tender", "soft", "calm", "soothing", "warm"],
  anime: ["anime", "anime ost", "anisong", "j-pop", "j-rock", "opening", "ending", "soundtrack"],
  shonen: ["anime", "anisong", "j-rock", "opening", "epic", "energetic", "dramatic"],
  shojo: ["anime", "j-pop", "romantic", "sweet", "dreamy", "ending"],
  ghibli: ["anime", "soundtrack", "orchestral", "dreamy", "peaceful", "ethereal"],
  mecha: ["anime", "soundtrack", "electronic", "epic", "dramatic", "intense"],
  isekai: ["anime", "fantasy", "soundtrack", "ethereal", "adventure", "orchestral"],
  opening: ["opening", "anime", "j-rock", "j-pop", "energetic", "dramatic"],
  ending: ["ending", "anime", "j-pop", "dreamy", "melancholic", "gentle"],
  soundtrack: ["soundtrack", "score", "cinematic", "orchestral", "instrumental"]
};
var ANIME_THEME_TAGS = new Set([
  "anime",
  "anime ost",
  "anisong",
  "j-pop",
  "j-rock",
  "visual kei",
  "soundtrack",
  "score",
  "orchestral",
  "opening",
  "ending",
  "japanese",
  "shonen",
  "shojo",
  "isekai",
  "mecha",
  "ghibli"
]);
function extractMoodTags(tags, minCount = 5) {
  return tags.filter((t) => t.count >= minCount && MOOD_TAG_SET.has(t.name)).map((t) => t.name);
}
var GENERIC_TAG_SET = new Set([
  "favorites",
  "favourite",
  "favorite",
  "loved",
  "seen live",
  "albums i own",
  "my spotigram sundays",
  "under 2000 listeners",
  "spotify",
  "lastfm",
  "good"
]);
function extractFlavorTags(tags, minCount = 5, limit = 6) {
  return tags.filter((t) => t.count >= minCount).map((t) => t.name).filter((name) => !MOOD_TAG_SET.has(name) && !GENERIC_TAG_SET.has(name) && !/^\d{4}s$/.test(name) && !/^\d{2}s$/.test(name) && name.length >= 3).slice(0, limit);
}
function overlapCount(a, b) {
  const bSet = new Set(Array.from(b, (value) => value.toLowerCase()));
  let count = 0;
  for (const value of a) {
    if (bSet.has(value.toLowerCase()))
      count += 1;
  }
  return count;
}
function hasAnimeTheme(values) {
  for (const value of values) {
    if (ANIME_THEME_TAGS.has(value.toLowerCase()))
      return true;
  }
  return false;
}
function extractMoodFromContext(context, topN = 3) {
  if (!context)
    return "";
  const lower = context.toLowerCase();
  const scores = [];
  for (const [mood, words] of Object.entries(MOOD_KEYWORDS)) {
    let score = 0;
    for (const w of words) {
      const idx = lower.indexOf(w);
      if (idx !== -1)
        score++;
      let pos = idx;
      while (pos !== -1) {
        pos = lower.indexOf(w, pos + w.length);
        if (pos !== -1)
          score += 0.5;
      }
    }
    if (score > 0)
      scores.push([mood, score]);
  }
  scores.sort((a, b) => b[1] - a[1]);
  return scores.slice(0, topN).map(([mood]) => mood).join(" ");
}
function isCouncilInvocation(args) {
  if (!args)
    return false;
  const keys = Object.keys(args).filter((key) => !key.startsWith("__"));
  return keys.length === 1 && keys[0] === "context";
}
function timed(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label}: timed out after ${ms}ms`)), ms);
    promise.then((val) => {
      clearTimeout(timer);
      resolve(val);
    }, (err) => {
      clearTimeout(timer);
      reject(new Error(`${label}: ${err?.message || err}`));
    });
  });
}
function timedSafe(promise, ms, label, fallback) {
  return timed(promise, ms, label).catch((err) => {
    spindle.log.warn(err.message);
    return fallback;
  });
}
var activeToolInvocations = new Map;
var RECENT_DISCOVERY_FILE = "recent_mood_discover.json";
var RECENT_DISCOVERY_LIMIT = 20;
var RECENT_DISCOVERY_WINDOW_MS = 1000 * 60 * 60 * 24 * 14;
function getToolInvocationKey(toolName, userId) {
  return `${userId || "unknown"}:${toolName}`;
}
function ensureInvocationActive(invocationKey, requestId, deadlineMs, stage) {
  if (activeToolInvocations.get(invocationKey) !== requestId) {
    throw new Error(`Invocation superseded${stage ? ` during ${stage}` : ""}`);
  }
  if (deadlineMs && Date.now() >= deadlineMs - 150) {
    throw new Error(`Invocation deadline reached${stage ? ` before ${stage}` : ""}`);
  }
}
function candidateKey(name, artist) {
  return `${name.toLowerCase()}::${artist.toLowerCase()}`;
}
function addDiscoveryCandidate(map, name, artist, score, source) {
  const key = candidateKey(name, artist);
  const existing = map.get(key);
  if (existing) {
    existing.score += score;
    if (!existing.source.includes(source))
      existing.source.push(source);
    return;
  }
  map.set(key, { name, artist, score, source: [source] });
}
async function loadRecentMoodDiscoveries() {
  if (!activeUserId2)
    return [];
  const entries = await spindle.userStorage.getJson(RECENT_DISCOVERY_FILE, {
    fallback: [],
    userId: activeUserId2
  }).catch(() => []);
  const cutoff = Date.now() - RECENT_DISCOVERY_WINDOW_MS;
  return entries.filter((entry) => entry.ts >= cutoff);
}
async function saveRecentMoodDiscoveries(entries) {
  if (!activeUserId2)
    return;
  await spindle.userStorage.setJson(RECENT_DISCOVERY_FILE, entries.slice(0, RECENT_DISCOVERY_LIMIT), {
    userId: activeUserId2
  }).catch(() => {});
}
async function rememberMoodDiscoveries(results) {
  const existing = await loadRecentMoodDiscoveries();
  const now = Date.now();
  const merged = [
    ...results.map((result) => ({
      key: candidateKey(result.name, result.artist),
      name: result.name,
      artist: result.artist,
      ts: now
    })),
    ...existing
  ];
  const deduped = new Map;
  for (const entry of merged) {
    if (!deduped.has(entry.key))
      deduped.set(entry.key, entry);
  }
  await saveRecentMoodDiscoveries(Array.from(deduped.values()));
}
function normalizeMatchText(value) {
  return value.toLowerCase().replace(/[\[(].*?[\])]/g, " ").replace(/\b(feat|ft|featuring)\b.*$/g, " ").replace(/[^\p{L}\p{N}\s]+/gu, " ").replace(/\s+/g, " ").trim();
}
function countTokenOverlap(a, b) {
  if (!a || !b)
    return 0;
  const bTokens = new Set(b.split(" ").filter(Boolean));
  let score = 0;
  for (const token of a.split(" ")) {
    if (token && bTokens.has(token))
      score += 1;
  }
  return score;
}
function scoreResolvedTrackMatch(trackName, artist, result) {
  const wantedTrack = normalizeMatchText(trackName);
  const wantedArtist = normalizeMatchText(artist);
  const gotTrack = normalizeMatchText(result.name);
  const gotArtist = normalizeMatchText(result.artist);
  let score = 0;
  if (gotTrack === wantedTrack)
    score += 12;
  else if (gotTrack.startsWith(wantedTrack) || wantedTrack.startsWith(gotTrack))
    score += 8;
  else if (gotTrack.includes(wantedTrack) || wantedTrack.includes(gotTrack))
    score += 4;
  score += Math.min(4, countTokenOverlap(wantedTrack, gotTrack));
  if (gotArtist === wantedArtist)
    score += 12;
  else if (gotArtist.includes(wantedArtist) || wantedArtist.includes(gotArtist))
    score += 8;
  score += Math.min(4, countTokenOverlap(wantedArtist, gotArtist));
  if (/\b(remaster|live|karaoke|tribute|instrumental|cover|acoustic)\b/.test(gotTrack) && !/\b(remaster|live|karaoke|tribute|instrumental|cover|acoustic)\b/.test(wantedTrack)) {
    score -= 4;
  }
  return score;
}
async function enrichCandidatesWithTagAffinity(candidates, seedFlavorTags, moodTags, readTimeout) {
  if (candidates.length === 0)
    return candidates;
  const shortlist = candidates.slice(0, 8);
  const seedFlavorSet = new Set(seedFlavorTags.map((tag) => tag.toLowerCase()));
  const moodTagSet = new Set(moodTags.map((tag) => tag.toLowerCase()));
  const enriched = await Promise.all(shortlist.map(async (candidate) => {
    const [artistTags, trackTags] = await Promise.all([
      timedSafe(getArtistTopTags(candidate.artist), readTimeout, `artist.getTopTags("${candidate.artist}")`, []),
      timedSafe(getTrackTopTags(candidate.name, candidate.artist), readTimeout, `track.getTopTags("${candidate.name}")`, [])
    ]);
    const candidateFlavor = new Set([
      ...extractFlavorTags(trackTags, 0, 5),
      ...extractFlavorTags(artistTags, 0, 5)
    ]);
    const candidateMood = new Set([
      ...extractMoodTags(trackTags, 0),
      ...extractMoodTags(artistTags, 0)
    ]);
    const candidateTheme = new Set([
      ...candidateFlavor,
      ...candidateMood,
      ...extractFlavorTags(trackTags, 0, 8).filter((tag) => ANIME_THEME_TAGS.has(tag.toLowerCase())),
      ...extractFlavorTags(artistTags, 0, 8).filter((tag) => ANIME_THEME_TAGS.has(tag.toLowerCase()))
    ]);
    let score = candidate.score;
    const flavorOverlap = overlapCount(seedFlavorSet, candidateFlavor);
    const moodOverlap = overlapCount(moodTagSet, candidateMood);
    score += flavorOverlap * 4;
    score += moodOverlap * 2;
    if (hasAnimeTheme([...seedFlavorSet, ...moodTagSet])) {
      score += overlapCount(ANIME_THEME_TAGS, candidateTheme) * 3;
      if (!hasAnimeTheme(candidateTheme))
        score -= 4;
    }
    if (candidateFlavor.size > 0 && flavorOverlap === 0 && seedFlavorSet.size > 0)
      score -= 3;
    const source = [...candidate.source];
    if (flavorOverlap > 0)
      source.push(`flavor:${flavorOverlap}`);
    if (moodOverlap > 0)
      source.push(`mood:${moodOverlap}`);
    return { ...candidate, score, source };
  }));
  return [...enriched, ...candidates.slice(shortlist.length)];
}
async function resolveOnSpotify(trackName, artist) {
  try {
    const results = await search(`${trackName} ${artist}`);
    if (results.length === 0)
      return null;
    const ranked = results.map((result) => ({
      result,
      score: scoreResolvedTrackMatch(trackName, artist, result)
    })).sort((a, b) => b.score - a.score);
    return ranked[0]?.result || results[0] || null;
  } catch (err) {
    spindle.log.warn(`resolveOnSpotify("${trackName}", "${artist}"): ${err?.message}`);
    return null;
  }
}
async function getPlaybackSeedState() {
  try {
    const current = await getCurrentPlayback();
    if (current) {
      if (activeUserId2)
        await cacheState(activeUserId2, current);
      return current;
    }
    return null;
  } catch {
    if (lastState && Date.now() - lastStateUpdatedAt < 60000) {
      spindle.log.warn(`[playback_seed] Falling back to cached state "${lastState.trackName}" by ${lastState.artistName}`);
      return lastState;
    }
    return null;
  }
}
async function playMoodFallback(query, state, council, userId, beforePlay) {
  const playlists = await searchPlaylists(query, 5);
  if (playlists.length > 0) {
    const best = playlists[0];
    beforePlay?.(`fallback playlist play for "${query}"`);
    await play({ contextUri: best.uri });
    pushStateAfterCommand(userId);
    const prefix = council ? `[Mood fallback "${query}"] ` : "";
    return `${prefix}Now playing playlist "${best.name}" by ${best.owner} after mood discovery could not find enough reliable track matches from "${state.trackName}".`;
  }
  const tracks = await search(query);
  if (tracks.length > 0) {
    beforePlay?.(`fallback track play for "${query}"`);
    await play({ trackUri: tracks[0].uri });
    pushStateAfterCommand(userId);
    const prefix = council ? `[Mood fallback "${query}"] ` : "";
    return `${prefix}Now playing "${tracks[0].name}" by ${tracks[0].artist} after mood discovery fell back to direct Spotify matching.`;
  }
  return `Mood discovery could not find enough strong matches, and no Spotify fallback results were found for "${query}".`;
}
spindle.on("TOOL_INVOCATION", async (payload) => {
  if (!payload?.toolName || !payload?.requestId)
    return;
  const rawName = payload.toolName;
  const requestId = String(payload.requestId);
  const toolName = rawName.includes(":") ? rawName.split(":").pop() : rawName;
  const args = payload.args ?? {};
  const toolUserId = typeof args.__userId === "string" ? args.__userId : null;
  const deadlineMs = typeof args.__deadlineMs === "number" ? args.__deadlineMs : undefined;
  const council = isCouncilInvocation(args);
  const context = args.context || "";
  const resolvedToolUserId = toolUserId || activeUserId2;
  const invocationKey = getToolInvocationKey(toolName, resolvedToolUserId);
  const guard = (stage) => ensureInvocationActive(invocationKey, requestId, deadlineMs, stage);
  activeToolInvocations.set(invocationKey, requestId);
  if (toolUserId) {
    await handleUserChange(toolUserId);
  } else if (!activeUserId2) {
    return "Spotify Controls has no active user context for this tool invocation yet. Open the extension once, then try again.";
  }
  const sessionUserId = activeUserId2;
  if (!isConnected()) {
    await loadTokens();
  }
  guard("startup");
  const councilSeedState = council ? await getPlaybackSeedState() : null;
  if (council && councilSeedState) {
    spindle.log.info(`[council_spotify] Seed for ${toolName}: "${councilSeedState.trackName}" by ${councilSeedState.artistName} (request ${requestId})`);
  }
  try {
    const guardPlaybackMutation = (stage) => {
      guard(stage);
    };
    if (toolName === "spotify_search") {
      try {
        let query = args.query;
        let mode = args.mode;
        if (council) {
          query = extractMoodFromContext(context) || "ambient";
          mode = "playlist";
        }
        if (!query)
          return "No search query provided.";
        if (!mode)
          mode = "playlist";
        if (mode === "playlist") {
          const playlists = await searchPlaylists(query);
          if (playlists.length > 0) {
            const best2 = playlists[0];
            guardPlaybackMutation(`playlist play for "${best2.name}"`);
            await play({ contextUri: best2.uri });
            pushStateAfterCommand(sessionUserId);
            const others2 = playlists.slice(1, 5).map((p, i) => `${i + 2}. "${p.name}" by ${p.owner} (${p.trackCount} tracks)`).join(`
`);
            const prefix2 = council ? `[Matched mood "${query}"] ` : "";
            return `${prefix2}Now playing playlist "${best2.name}" by ${best2.owner} (${best2.trackCount} tracks)${others2 ? `

Other matches:
${others2}` : ""}`;
          }
        }
        const results = await search(query);
        if (results.length === 0)
          return `No results found for "${query}".`;
        const best = results[0];
        guardPlaybackMutation(`track play for "${best.name}"`);
        await play({ trackUri: best.uri });
        pushStateAfterCommand(sessionUserId);
        const others = results.slice(1, 5).map((r, i) => `${i + 2}. "${r.name}" by ${r.artist} (${r.album})`).join(`
`);
        const prefix = council ? `[Searched for "${query}"] ` : "";
        return `${prefix}Now playing "${best.name}" by ${best.artist} (${best.album})${others ? `

Other matches:
${others}` : ""}`;
      } catch (err) {
        return `Search & play failed: ${err?.message}`;
      }
    }
    if (toolName === "spotify_search_similar") {
      try {
        const state = councilSeedState || await getPlaybackSeedState();
        if (!state?.trackName || !state?.artistName) {
          return "Nothing is currently playing. Play something first so we can find similar tracks.";
        }
        const similar = await getSimilarTracks(state.trackName, state.artistName, 5);
        if (similar.length === 0) {
          const results = await search(state.artistName);
          if (results.length === 0)
            return `No similar tracks found for "${state.trackName}" by ${state.artistName}.`;
          guardPlaybackMutation(`similar fallback play for "${results[0].name}"`);
          await play({ trackUri: results[0].uri });
          pushStateAfterCommand(sessionUserId);
          return `No Last.fm similarity data \u2014 playing "${results[0].name}" by ${results[0].artist} (more by artist)`;
        }
        const resolved = (await Promise.all(similar.map((c) => resolveOnSpotify(c.name, c.artist)))).filter((r) => r !== null);
        if (resolved.length === 0)
          return "Found similar tracks via Last.fm but could not match any on Spotify.";
        guardPlaybackMutation(`similar result play for "${resolved[0].name}"`);
        await play({ trackUri: resolved[0].uri });
        pushStateAfterCommand(sessionUserId);
        const toQueue = resolved.slice(1);
        const queueResults = await Promise.all(toQueue.map(async (track) => {
          try {
            guardPlaybackMutation(`similar queue for "${track.name}"`);
            await addToQueue(track.uri);
            return `"${track.name}" by ${track.artist}`;
          } catch {
            return null;
          }
        }));
        const queued = queueResults.filter((q) => q !== null);
        const queueLine = queued.length > 0 ? `

Queued ${queued.length} similar tracks:
${queued.map((q, i) => `${i + 1}. ${q}`).join(`
`)}` : "";
        const prefix = council ? `[Similar music] ` : "";
        return `${prefix}Now playing "${resolved[0].name}" by ${resolved[0].artist} (similar to "${state.trackName}" by ${state.artistName})${queueLine}`;
      } catch (err) {
        if (err?.message?.includes("Last.fm API key not configured")) {
          return "Last.fm API key is not configured. Please add it in the Spotify Controls settings.";
        }
        return `Similar search failed: ${err?.message}`;
      }
    }
    if (toolName === "spotify_mood_discover") {
      const READ_TIMEOUT = 6000;
      const WRITE_TIMEOUT = 8000;
      try {
        const state = councilSeedState || await getPlaybackSeedState();
        if (!state?.trackName || !state?.artistName) {
          return "Nothing is currently playing. Play something first so we can discover mood-matching music.";
        }
        spindle.log.info(`[mood_discover] Starting for "${state.trackName}" by ${state.artistName}`);
        let moodTags = [];
        const moodArg = args.mood;
        if (moodArg) {
          const terms = moodArg.split(/[,\s]+/).map((t) => t.trim().toLowerCase()).filter(Boolean);
          for (const term of terms) {
            const mapped = MOOD_TO_LASTFM_TAGS[term];
            if (mapped) {
              moodTags.push(...mapped);
            } else if (MOOD_TAG_SET.has(term)) {
              moodTags.push(term);
            }
          }
          moodTags = [...new Set(moodTags)];
          spindle.log.info(`[mood_discover] Mood from arg "${moodArg}" \u2192 tags: [${moodTags.join(", ")}]`);
        }
        if (moodTags.length === 0 && context) {
          const moodStr = extractMoodFromContext(context);
          if (moodStr) {
            for (const mood of moodStr.split(" ")) {
              const mapped = MOOD_TO_LASTFM_TAGS[mood];
              if (mapped)
                moodTags.push(...mapped);
            }
            moodTags = [...new Set(moodTags)];
            spindle.log.info(`[mood_discover] Mood from context \u2192 "${moodStr}" \u2192 tags: [${moodTags.join(", ")}]`);
          }
        }
        const needTagFallback = moodTags.length === 0;
        const [trackTags, artistTags, similarArtists, similarTracks, recentDiscoveries] = await Promise.all([
          timedSafe(getTrackTopTags(state.trackName, state.artistName), READ_TIMEOUT, "track.getTopTags", []),
          timedSafe(getArtistTopTags(state.artistName), READ_TIMEOUT, "artist.getTopTags", []),
          timedSafe(getSimilarArtists(state.artistName, 8), READ_TIMEOUT, "artist.getSimilar", []),
          timedSafe(getSimilarTracks(state.trackName, state.artistName, 12), READ_TIMEOUT, "track.getSimilar", []),
          loadRecentMoodDiscoveries()
        ]);
        if (needTagFallback) {
          moodTags = extractMoodTags(trackTags);
          if (moodTags.length === 0)
            moodTags = extractMoodTags(artistTags, 0);
          spindle.log.info(`[mood_discover] Mood from tags fallback \u2192 [${moodTags.join(", ")}]`);
        }
        if (moodTags.length === 0) {
          const fallbackQuery = (moodArg?.trim() || extractMoodFromContext(context) || state.artistName).trim();
          spindle.log.info(`[mood_discover] No mood tags found; falling back to Spotify query "${fallbackQuery}"`);
          return playMoodFallback(fallbackQuery, state, council, sessionUserId, guardPlaybackMutation);
        }
        const seedFlavorTags = [...new Set([
          ...extractFlavorTags(trackTags),
          ...extractFlavorTags(artistTags, 0)
        ])].slice(0, 6);
        const wantsAnimeTheme = hasAnimeTheme([...moodTags, ...seedFlavorTags]);
        const recentKeys = new Set(recentDiscoveries.map((entry) => entry.key));
        const similarArtistSet = new Set([state.artistName, ...similarArtists].map((artist) => artist.toLowerCase()));
        const currentTrackLower = state.trackName.toLowerCase();
        const currentArtistLower = state.artistName.toLowerCase();
        const candidateMap = new Map;
        for (const similar of similarTracks) {
          const artistLower = similar.artist.toLowerCase();
          if (similar.name.toLowerCase() === currentTrackLower && artistLower === currentArtistLower)
            continue;
          const similarityScore = Math.round(similar.match * 24) + 12;
          addDiscoveryCandidate(candidateMap, similar.name, similar.artist, similarityScore, "track-similar");
        }
        const queryTags = moodTags.slice(0, 3);
        const tagPages = Array.from(new Set([
          Math.floor(Math.random() * 4) + 1,
          Math.floor(Math.random() * 6) + 3
        ])).sort((a, b) => a - b);
        spindle.log.info(`[mood_discover] Querying tag.getTopTracks for [${queryTags.join(", ")}] pages=${tagPages.join(",")}`);
        const tagResults = await Promise.all(queryTags.flatMap((tag) => tagPages.map(async (page) => ({
          tag,
          page,
          tracks: await timedSafe(getTopTracksByTag(tag, 20, page), READ_TIMEOUT, `tag.getTopTracks("${tag}", page=${page})`, [])
        }))));
        for (const result of tagResults) {
          for (const [index, track] of result.tracks.entries()) {
            const artistLower = track.artist.toLowerCase();
            if (track.name.toLowerCase() === currentTrackLower && artistLower === currentArtistLower)
              continue;
            let scoreBoost = Math.max(1, 7 - index);
            if (similarArtistSet.has(artistLower))
              scoreBoost += 5;
            else
              scoreBoost -= 2;
            if (result.page > 1)
              scoreBoost += 1;
            addDiscoveryCandidate(candidateMap, track.name, track.artist, scoreBoost, `tag:${result.tag}:p${result.page}`);
          }
        }
        let candidates = await enrichCandidatesWithTagAffinity(Array.from(candidateMap.values()), seedFlavorTags, moodTags, READ_TIMEOUT);
        candidates = candidates.map((candidate) => {
          let adjustedScore = candidate.score;
          const artistLower = candidate.artist.toLowerCase();
          const key = candidateKey(candidate.name, candidate.artist);
          const sourceText = candidate.source.join(" ").toLowerCase();
          if (artistLower === currentArtistLower)
            adjustedScore -= 6;
          if (similarArtistSet.has(artistLower))
            adjustedScore += 4;
          else
            adjustedScore -= 3;
          if (wantsAnimeTheme) {
            if (/anime|anisong|j-pop|j-rock|opening|ending|soundtrack|orchestral|score/.test(sourceText))
              adjustedScore += 5;
            else
              adjustedScore -= 4;
          }
          if (recentKeys.has(key))
            adjustedScore -= 12;
          adjustedScore += Math.random() * 2;
          return { ...candidate, score: adjustedScore };
        }).filter((candidate) => candidate.score > 0);
        candidates.sort((a, b) => b.score - a.score);
        const shuffled = [];
        let ci = 0;
        while (ci < candidates.length) {
          let cj = ci;
          while (cj < candidates.length && candidates[cj].score === candidates[ci].score)
            cj++;
          const tier = candidates.slice(ci, cj);
          for (let k = tier.length - 1;k > 0; k--) {
            const m = Math.floor(Math.random() * (k + 1));
            [tier[k], tier[m]] = [tier[m], tier[k]];
          }
          shuffled.push(...tier);
          ci = cj;
        }
        const seenArtists = new Set;
        candidates = shuffled.filter((candidate) => {
          const artistKey = candidate.artist.toLowerCase();
          if (seenArtists.has(artistKey))
            return false;
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
        const resolved = (await Promise.all(candidates.map((c) => timed(resolveOnSpotify(c.name, c.artist), READ_TIMEOUT, `spotify.search("${c.name}")`).catch((err) => {
          spindle.log.warn(err.message);
          return null;
        })))).filter((r) => r !== null);
        if (resolved.length === 0) {
          const fallbackQuery = (moodArg?.trim() || queryTags.join(" ") || state.artistName).trim();
          spindle.log.info(`[mood_discover] No Spotify matches for Last.fm candidates; falling back to Spotify query "${fallbackQuery}"`);
          return playMoodFallback(fallbackQuery, state, council, sessionUserId, guardPlaybackMutation);
        }
        guardPlaybackMutation(`mood result play for "${resolved[0].name}"`);
        await timed(play({ trackUri: resolved[0].uri }), WRITE_TIMEOUT, "spotify.play");
        pushStateAfterCommand(sessionUserId);
        const toQueue = resolved.slice(1, 4);
        await rememberMoodDiscoveries(resolved.slice(0, 4));
        if (toQueue.length > 0) {
          Promise.allSettled(toQueue.map(async (track) => {
            guardPlaybackMutation(`mood queue for "${track.name}"`);
            return timed(addToQueue(track.uri), WRITE_TIMEOUT, `spotify.queue("${track.name}")`);
          })).then((results) => {
            results.forEach((result, index) => {
              if (result.status === "rejected") {
                spindle.log.warn(`Queue failed for "${toQueue[index]?.name}": ${result.reason?.message || result.reason}`);
              }
            });
          });
        }
        const moodDesc = queryTags.join(", ");
        const queueLine = toQueue.length > 0 ? `

Queueing ${toQueue.length} varied tracks:
${toQueue.map((q, i) => `${i + 1}. "${q.name}" by ${q.artist}`).join(`
`)}` : "";
        const prefix = council || moodArg && context ? `[Mood discovery: ${moodDesc}] ` : "";
        spindle.log.info(`[mood_discover] Done \u2014 playing "${resolved[0].name}", ${toQueue.length} queued in background`);
        return `${prefix}Now playing "${resolved[0].name}" by ${resolved[0].artist} (mood: ${moodDesc}, varied from "${state.trackName}")${queueLine}`;
      } catch (err) {
        spindle.log.error(`[mood_discover] ${err?.message}`);
        if (err?.message?.includes("Last.fm API key not configured")) {
          return "Last.fm API key is not configured. Please add it in the Spotify Controls settings.";
        }
        return `Mood discovery failed: ${err?.message}`;
      }
    }
    if (toolName === "spotify_queue") {
      try {
        const uri = args.uri;
        if (!uri && council) {
          return "Cannot queue a track without a URI. Use spotify_search to discover tracks first.";
        }
        guardPlaybackMutation(`queue for "${uri || "unknown track"}"`);
        await addToQueue(uri || "");
        return "Track added to queue.";
      } catch (err) {
        return `Failed to queue track: ${err?.message}`;
      }
    }
  } finally {}
});
(async () => {
  spindle.log.info("Spotify Controls loaded!");
})();
