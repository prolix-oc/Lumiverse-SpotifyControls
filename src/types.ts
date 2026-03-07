// ─── Frontend → Backend messages ─────────────────────────────────────────

export type FrontendToBackend =
  | { type: "get_state" }
  | { type: "get_config" }
  | { type: "connect"; clientId: string; clientSecret: string; serverBaseUrl: string }
  | { type: "disconnect" }
  | { type: "play"; trackUri?: string; contextUri?: string }
  | { type: "pause" }
  | { type: "next" }
  | { type: "previous" }
  | { type: "seek"; positionMs: number }
  | { type: "set_volume"; percent: number }
  | { type: "toggle_shuffle" }
  | { type: "set_repeat"; mode: "off" | "context" | "track" }
  | { type: "search"; query: string }
  | { type: "queue"; trackUri: string }
  | { type: "get_devices" }
  | { type: "transfer_playback"; deviceId: string }
  | { type: "save_lastfm_key"; apiKey: string }
  | { type: "get_widget_prefs" }
  | { type: "save_widget_prefs"; prefs: WidgetPrefs };

// ─── Backend → Frontend messages ─────────────────────────────────────────

export type BackendToFrontend =
  | { type: "state"; playbackState: PlaybackState | null; connected: boolean }
  | { type: "config"; clientId: string; hasSecret: boolean; connected: boolean; callbackUrl: string; hasLastfmKey: boolean }
  | { type: "search_results"; results: SearchResult[] }
  | { type: "auth_url"; url: string }
  | { type: "connected" }
  | { type: "disconnected" }
  | { type: "devices"; devices: DeviceInfo[] }
  | { type: "widget_prefs"; prefs: WidgetPrefs }
  | { type: "error"; message: string };

// ─── Shared interfaces ──────────────────────────────────────────────────

export interface PlaybackState {
  isPlaying: boolean;
  trackName: string;
  artistName: string;
  albumName: string;
  albumArtUrl: string | null;
  progressMs: number;
  durationMs: number;
  shuffleState: boolean;
  repeatState: "off" | "context" | "track";
  volume: number | null;
  trackUri: string;
  deviceName: string | null;
  deviceType: string | null;
  deviceId: string | null;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  volume: number | null;
}

export interface SearchResult {
  name: string;
  artist: string;
  album: string;
  albumArtUrl: string | null;
  uri: string;
  durationMs: number;
}

export interface PlaylistResult {
  name: string;
  owner: string;
  trackCount: number;
  uri: string;
  spotifyUrl: string;
  imageUrl: string | null;
}

export interface WidgetPrefs {
  size: number;
  shape: "circle" | "squircle";
  sizeMode: "small" | "medium" | "large" | "custom";
}

export interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
  lastfmApiKey?: string;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  client_id: string;
  client_secret: string;
}
