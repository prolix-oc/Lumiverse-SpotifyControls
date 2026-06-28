declare const spindle: import("lumiverse-spindle-types").SpindleAPI;

import type { PlaybackState, SearchResult, TokenData, DeviceInfo, PlaylistResult } from "./types";

const SPOTIFY_API = "https://api.spotify.com/v1";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

const tokenDataByUser = new Map<string, TokenData | null>();
let activeUserId: string | undefined;

export function setActiveUser(userId: string) {
  activeUserId = userId;
}

function resolveUserId(userId?: string): string | undefined {
  return userId || activeUserId;
}

function getTokenData(userId?: string): TokenData | null {
  const resolvedUserId = resolveUserId(userId);
  return resolvedUserId ? tokenDataByUser.get(resolvedUserId) ?? null : null;
}

function setTokenData(data: TokenData | null, userId?: string): string {
  const resolvedUserId = resolveUserId(userId);
  if (!resolvedUserId) throw new Error("Spotify user context is not set");
  tokenDataByUser.set(resolvedUserId, data);
  return resolvedUserId;
}

// ─── Token persistence ──────────────────────────────────────────────────

export async function loadTokens(userId?: string): Promise<void> {
  const resolvedUserId = resolveUserId(userId);
  try {
    const raw = await spindle.enclave.get("spotify_tokens", resolvedUserId);
    if (resolvedUserId) tokenDataByUser.set(resolvedUserId, raw ? JSON.parse(raw) : null);
  } catch {
    if (resolvedUserId) tokenDataByUser.set(resolvedUserId, null);
  }
}

export async function saveTokens(data: TokenData, userId?: string): Promise<void> {
  const resolvedUserId = setTokenData(data, userId);
  await spindle.enclave.put("spotify_tokens", JSON.stringify(data), resolvedUserId);
}

export async function clearTokens(userId?: string): Promise<void> {
  const resolvedUserId = setTokenData(null, userId);
  await spindle.enclave.delete("spotify_tokens", resolvedUserId);
}

export function isConnected(userId?: string): boolean {
  return getTokenData(userId) !== null;
}

// ─── Auth helpers ────────────────────────────────────────────────────────

/**
 * Build the Base64-encoded Basic auth header value from client credentials.
 * Per Spotify docs: Authorization: Basic base64(client_id:client_secret)
 */
function basicAuthHeader(clientId: string, clientSecret: string): string {
  return "Basic " + btoa(`${clientId}:${clientSecret}`);
}

function tokenAuthHeaders(clientId: string, clientSecret?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (clientSecret) {
    headers.Authorization = basicAuthHeader(clientId, clientSecret);
  }
  return headers;
}

function formatSpotifyAuthError(action: string, status: number, body: string): string {
  if (!body) return `${action} failed (${status})`;

  try {
    const parsed = JSON.parse(body) as {
      error?: string;
      error_description?: string;
      message?: string;
    };
    const details = [parsed.error, parsed.error_description || parsed.message].filter(Boolean).join(": ");
    if (details) return `${action} failed (${status}): ${details}`;
  } catch {
    // Fall back to raw body if Spotify did not return JSON.
  }

  return `${action} failed (${status}): ${body}`;
}

/**
 * Refresh the access token using the stored refresh_token and client credentials.
 * Spotify Authorization Code Flow: POST /api/token with
 *   grant_type=refresh_token, refresh_token, Authorization: Basic header
 */
async function refreshAccessToken(userId?: string): Promise<string> {
  const tokenData = getTokenData(userId);
  if (!tokenData) throw new Error("No tokens stored");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokenData.refresh_token,
  });
  if (!tokenData.client_secret) {
    body.set("client_id", tokenData.client_id);
  }

  const res = (await spindle.cors(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: tokenAuthHeaders(tokenData.client_id, tokenData.client_secret),
    body: body.toString(),
  })) as { status: number; body: string };

  if (res.status !== 200) {
    throw new Error(formatSpotifyAuthError("Token refresh", res.status, res.body || ""));
  }

  const json = JSON.parse(res.body);
  const updated: TokenData = {
    access_token: json.access_token,
    // Spotify may or may not return a new refresh_token; keep old one if not
    refresh_token: json.refresh_token || tokenData.refresh_token,
    expires_at: Date.now() + json.expires_in * 1000 - 60_000,
    client_id: tokenData.client_id,
    client_secret: tokenData.client_secret,
  };
  await saveTokens(updated, userId);
  return updated.access_token;
}

async function ensureToken(userId?: string): Promise<string> {
  const tokenData = getTokenData(userId);
  if (!tokenData) throw new Error("Not connected to Spotify");

  if (Date.now() >= tokenData.expires_at) {
    return refreshAccessToken(userId);
  }
  return tokenData.access_token;
}

// ─── API request helper ─────────────────────────────────────────────────

async function spotifyFetch(
  endpoint: string,
  options: { method?: string; body?: string } = {},
  userId?: string,
): Promise<{ status: number; body: string }> {
  const token = await ensureToken(userId);

  const res = (await spindle.cors(`${SPOTIFY_API}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: options.body,
  })) as { status: number; body: string };

  // Auto-refresh on 401 and retry once
  if (res.status === 401) {
    const newToken = await refreshAccessToken(userId);
    return (await spindle.cors(`${SPOTIFY_API}${endpoint}`, {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json",
      },
      body: options.body,
    })) as { status: number; body: string };
  }

  return res;
}

// ─── Playback ────────────────────────────────────────────────────────────

export async function getCurrentlyPlaying(userId?: string): Promise<PlaybackState | null> {
  const res = await spotifyFetch("/me/player/currently-playing", {}, userId);
  if (res.status === 204 || !res.body || res.body.trim() === "") return null;
  if (res.status !== 200) return null;

  return parsePlaybackState(JSON.parse(res.body));
}

export async function getCurrentPlayback(userId?: string): Promise<PlaybackState | null> {
  // Always use /me/player (not /me/player/currently-playing) because the full
  // endpoint includes device data (volume, device name/type/id) that the
  // currently-playing endpoint omits.
  const res = await spotifyFetch("/me/player", {}, userId);
  if (res.status === 204 || !res.body || res.body.trim() === "") return null;
  if (res.status !== 200) return null;

  return parsePlaybackState(JSON.parse(res.body));
}

function parsePlaybackState(data: any): PlaybackState | null {
  if (!data?.item) return null;
  const images = data.item.album?.images ?? [];
  return {
    isPlaying: data.is_playing,
    trackName: data.item.name,
    artistName: (data.item.artists || []).map((a: any) => a.name).join(", "),
    albumName: data.item.album?.name || "",
    albumArtUrl: images.length > 0 ? images[images.length > 1 ? 1 : 0].url : null,
    previewUrl: typeof data.item.preview_url === "string"
      ? data.item.preview_url
      : typeof data.item.audio_preview_url === "string"
        ? data.item.audio_preview_url
        : null,
    progressMs: data.progress_ms || 0,
    durationMs: data.item.duration_ms || 0,
    shuffleState: data.shuffle_state || false,
    repeatState: data.repeat_state || "off",
    volume: data.device?.volume_percent ?? null,
    trackUri: data.item.uri || "",
    deviceName: data.device?.name || null,
    deviceType: data.device?.type || null,
    deviceId: data.device?.id || null,
  };
}

export async function play(options?: {
  trackUri?: string;
  contextUri?: string;
}, userId?: string): Promise<void> {
  const body: Record<string, unknown> = {};
  if (options?.contextUri) body.context_uri = options.contextUri;
  if (options?.trackUri) body.uris = [options.trackUri];

  await spotifyFetch("/me/player/play", {
    method: "PUT",
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  }, userId);
}

export async function pause(userId?: string): Promise<void> {
  await spotifyFetch("/me/player/pause", { method: "PUT" }, userId);
}

export async function next(userId?: string): Promise<void> {
  await spotifyFetch("/me/player/next", { method: "POST" }, userId);
}

export async function previous(userId?: string): Promise<void> {
  await spotifyFetch("/me/player/previous", { method: "POST" }, userId);
}

export async function seek(positionMs: number, userId?: string): Promise<void> {
  await spotifyFetch(`/me/player/seek?position_ms=${positionMs}`, {
    method: "PUT",
  }, userId);
}

export async function setVolume(percent: number, userId?: string): Promise<void> {
  await spotifyFetch(
    `/me/player/volume?volume_percent=${Math.round(Math.max(0, Math.min(100, percent)))}`,
    { method: "PUT" },
    userId,
  );
}

export async function setShuffle(state: boolean, userId?: string): Promise<void> {
  await spotifyFetch(`/me/player/shuffle?state=${state}`, { method: "PUT" }, userId);
}

export async function setRepeat(mode: "off" | "context" | "track", userId?: string): Promise<void> {
  await spotifyFetch(`/me/player/repeat?state=${mode}`, { method: "PUT" }, userId);
}

// ─── Search ──────────────────────────────────────────────────────────────

export async function search(query: string, userId?: string): Promise<SearchResult[]> {
  const res = await spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {},
    userId,
  );
  if (res.status !== 200) return [];

  const data = JSON.parse(res.body);
  return (data.tracks?.items || [])
    .filter((track: any) => track != null)
    .map((track: any) => {
      const images = track.album?.images ?? [];
      return {
        name: track.name ?? "",
        artist: (track.artists || []).map((a: any) => a.name).join(", "),
        album: track.album?.name || "",
        albumArtUrl: images.length > 0 ? images[images.length > 1 ? 1 : 0].url : null,
        uri: track.uri ?? "",
        durationMs: track.duration_ms || 0,
      };
    });
}

export async function addToQueue(uri: string, userId?: string): Promise<void> {
  await spotifyFetch(`/me/player/queue?uri=${encodeURIComponent(uri)}`, {
    method: "POST",
  }, userId);
}

// ─── Devices ──────────────────────────────────────────────────────────

export async function getDevices(userId?: string): Promise<DeviceInfo[]> {
  const res = await spotifyFetch("/me/player/devices", {}, userId);
  if (res.status !== 200) return [];

  const data = JSON.parse(res.body);
  return (data.devices || []).map((d: any) => ({
    id: d.id || "",
    name: d.name || "Unknown",
    type: d.type || "unknown",
    isActive: d.is_active || false,
    volume: d.volume_percent ?? null,
  }));
}

export async function transferPlayback(deviceId: string, userId?: string): Promise<void> {
  await spotifyFetch("/me/player", {
    method: "PUT",
    body: JSON.stringify({ device_ids: [deviceId], play: true }),
  }, userId);
}

// ─── OAuth token exchange ────────────────────────────────────────────────

/**
 * Exchange an authorization code for access + refresh tokens.
 * Uses the Authorization Code Flow (with client secret, NOT PKCE).
 *
 * POST https://accounts.spotify.com/api/token
 * Headers: Authorization: Basic base64(client_id:client_secret)
 * Body: grant_type=authorization_code&code=...&redirect_uri=...
 */
// ─── LRCLib (Lyrics) ─────────────────────────────────────────────────────

const LRCLIB_API = "https://lrclib.net/api";

export interface LyricsData {
  plainLyrics: string | null;
  syncedLyrics: string | null;
  instrumental: boolean;
}

function normalizeInstrumental(result: LyricsData): LyricsData {
  if (result.instrumental) return result;
  const plain = result.plainLyrics?.trim().toLowerCase();
  if (plain === "instrumental") {
    return { plainLyrics: null, syncedLyrics: null, instrumental: true };
  }
  if (result.syncedLyrics) {
    const lines = result.syncedLyrics.split("\n").filter((l) => l.trim());
    if (lines.length === 1) {
      const text = lines[0].replace(/\[\d+:\d+[.:]\d+\]\s*/g, "").trim().toLowerCase();
      if (text === "instrumental") {
        return { plainLyrics: null, syncedLyrics: null, instrumental: true };
      }
    }
  }
  return result;
}

export async function getLyrics(
  trackName: string,
  artistName: string,
  albumName: string,
  durationSec: number,
  _userId?: string,
): Promise<LyricsData | null> {
  // Try exact match first
  const params = new URLSearchParams({
    track_name: trackName,
    artist_name: artistName,
    album_name: albumName,
    duration: String(Math.round(durationSec)),
  });

  try {
    const res = (await spindle.cors(`${LRCLIB_API}/get?${params.toString()}`, {
      method: "GET",
      headers: { "User-Agent": "Lumiverse-SpotifyControls/1.0.0" },
    })) as { status: number; body: string };

    if (res.status === 200) {
      const data = JSON.parse(res.body);
      return normalizeInstrumental({
        plainLyrics: data.plainLyrics || null,
        syncedLyrics: data.syncedLyrics || null,
        instrumental: data.instrumental || false,
      });
    }
  } catch {}

  // Fallback to search
  try {
    const searchParams = new URLSearchParams({
      q: `${artistName} ${trackName}`,
    });
    const res = (await spindle.cors(`${LRCLIB_API}/search?${searchParams.toString()}`, {
      method: "GET",
      headers: { "User-Agent": "Lumiverse-SpotifyControls/1.0.0" },
    })) as { status: number; body: string };

    if (res.status === 200) {
      const results = JSON.parse(res.body);
      if (results.length > 0) {
        const best = results[0];
        return normalizeInstrumental({
          plainLyrics: best.plainLyrics || null,
          syncedLyrics: best.syncedLyrics || null,
          instrumental: best.instrumental || false,
        });
      }
    }
  } catch {}

  return null;
}

// ─── Playlist Search ──────────────────────────────────────────────────

export async function searchPlaylists(query: string, limit = 15): Promise<PlaylistResult[]> {
  const res = await spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}`
  );
  if (res.status !== 200) return [];

  const data = JSON.parse(res.body);
  return (data.playlists?.items || [])
    .filter((p: any) => p != null)
    .map((p: any) => {
      const images = p.images ?? [];
      return {
        name: p.name ?? "",
        owner: p.owner?.display_name || "Unknown",
        trackCount: p.tracks?.total || 0,
        uri: p.uri ?? "",
        spotifyUrl: p.external_urls?.spotify || "",
        imageUrl: images.length > 0 ? images[0].url : null,
      };
    });
}

// ─── Playlist Tracks ──────────────────────────────────────────────────

export async function getPlaylistTracks(playlistId: string, limit = 20): Promise<SearchResult[]> {
  const res = await spotifyFetch(
    `/playlists/${playlistId}/tracks?fields=items(track(name,artists,album(name,images),uri,duration_ms))&limit=${limit}`
  );
  if (res.status !== 200) return [];

  const data = JSON.parse(res.body);
  return (data.items || [])
    .filter((item: any) => item != null && item.track)
    .map((item: any) => {
      const track = item.track;
      const images = track.album?.images ?? [];
      return {
        name: track.name ?? "",
        artist: (track.artists || []).map((a: any) => a.name).join(", "),
        album: track.album?.name || "",
        albumArtUrl: images.length > 0 ? images[images.length > 1 ? 1 : 0].url : null,
        uri: track.uri ?? "",
        durationMs: track.duration_ms || 0,
      };
    });
}

// ─── Last.fm ──────────────────────────────────────────────────────────

const LASTFM_API = "https://ws.audioscrobbler.com/2.0/";

async function lastfmFetch(method: string, params: Record<string, string>, userId?: string): Promise<any> {
  const lastfmApiKey = await spindle.enclave.get("lastfm_api_key", resolveUserId(userId));
  if (!lastfmApiKey) {
    throw new Error("Last.fm API key not configured. Please add it in the Spotify Controls settings.");
  }

  const query = new URLSearchParams({
    method,
    api_key: lastfmApiKey,
    format: "json",
    ...params,
  });

  const res = (await spindle.cors(`${LASTFM_API}?${query.toString()}`, {
    method: "GET",
  })) as { status: number; body: string };

  if (res.status !== 200) {
    throw new Error(`Last.fm API error (${res.status})`);
  }

  return JSON.parse(res.body);
}

export interface SimilarTrack {
  name: string;
  artist: string;
  match: number;
}

export async function getSimilarTracks(track: string, artist: string, limit = 15, userId?: string): Promise<SimilarTrack[]> {
  const data = await lastfmFetch("track.getSimilar", {
    track,
    artist,
    autocorrect: "1",
    limit: String(limit),
  }, userId);
  return (data.similartracks?.track || [])
    .map((t: any) => ({
      name: t.name,
      artist: t.artist?.name || "",
      match: parseFloat(t.match) || 0,
    }))
    .sort((a: SimilarTrack, b: SimilarTrack) => b.match - a.match);
}

export async function getSimilarArtists(artist: string, limit = 10, userId?: string): Promise<string[]> {
  const data = await lastfmFetch("artist.getSimilar", {
    artist,
    limit: String(limit),
  }, userId);
  return (data.similarartists?.artist || []).map((a: any) => a.name);
}

export async function getTopTracksByTag(tag: string, limit = 15, page = 1, userId?: string): Promise<{ name: string; artist: string }[]> {
  const data = await lastfmFetch("tag.getTopTracks", {
    tag,
    limit: String(limit),
    page: String(page),
  }, userId);
  return (data.tracks?.track || []).map((t: any) => ({
    name: t.name,
    artist: t.artist?.name || "",
  }));
}

export async function getTrackTopTags(track: string, artist: string, userId?: string): Promise<{ name: string; count: number }[]> {
  const data = await lastfmFetch("track.getTopTags", {
    track,
    artist,
    autocorrect: "1",
  }, userId);
  return (data.toptags?.tag || [])
    .map((t: any) => ({
      name: ((t.name as string) || "").toLowerCase().trim(),
      count: parseInt(t.count) || 0,
    }))
    .filter((t: { name: string; count: number }) => t.count > 0);
}

export async function getArtistTopTags(artist: string, userId?: string): Promise<{ name: string; count: number }[]> {
  const data = await lastfmFetch("artist.getTopTags", {
    artist,
    autocorrect: "1",
  }, userId);
  return (data.toptags?.tag || [])
    .map((t: any) => ({
      name: ((t.name as string) || "").toLowerCase().trim(),
      count: parseInt(t.count) || 0,
    }))
    .filter((t: { name: string; count: number }) => t.count > 0);
}

// ─── OAuth token exchange ────────────────────────────────────────────────

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret?: string,
  codeVerifier?: string
): Promise<TokenData> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  if (codeVerifier) {
    body.set("client_id", clientId);
    body.set("code_verifier", codeVerifier);
  }

  const res = (await spindle.cors(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: tokenAuthHeaders(clientId, codeVerifier ? undefined : clientSecret),
    body: body.toString(),
  })) as { status: number; body: string };

  if (res.status !== 200) {
    throw new Error(formatSpotifyAuthError("Token exchange", res.status, res.body || ""));
  }

  const json = JSON.parse(res.body);
  return {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: Date.now() + json.expires_in * 1000 - 60_000,
    client_id: clientId,
    client_secret: clientSecret || undefined,
  };
}
