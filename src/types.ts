// ─── Frontend → Backend messages ─────────────────────────────────────────

export type FrontendToBackend =
  | { type: "get_state" }
  | { type: "get_config" }
  | { type: "connect"; clientId: string; clientSecret?: string; serverBaseUrl: string }
  | { type: "complete_auth_callback"; callbackUrl: string }
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
  | { type: "save_widget_prefs"; prefs: WidgetPrefs }
  | { type: "get_lyrics" }
  | { type: "album_colors"; colors: AlbumColors | null }
  | { type: "get_chat_songs"; chatId: string };

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
  | { type: "lyrics"; trackUri: string; plainLyrics: string | null; syncedLyrics: string | null; instrumental: boolean }
  | { type: "chat_songs"; chatId: string; entries: MessageSongEntry[] }
  | { type: "message_song"; chatId: string; messageId: string; swipeId: number; snapshot: SongSnapshot }
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

/**
 * A frozen snapshot of the Spotify track that was playing at the moment an
 * assistant message (or one of its swipes) was generated. Persisted per-swipe,
 * per-message in the message's spindle metadata and surfaced through the corner
 * badge popover.
 */
export interface SongSnapshot {
  trackName: string;
  artistName: string;
  albumName: string;
  albumArtUrl: string | null;
  /** Spotify URI, e.g. `spotify:track:xxxx`. Used for quick-play. */
  trackUri: string;
  /** Shareable web link, e.g. `https://open.spotify.com/track/xxxx`. */
  spotifyUrl: string;
  /** Whether playback was active (vs paused) when captured. */
  isPlaying: boolean;
  /** Epoch ms the snapshot was captured. */
  capturedAt: number;
}

/** Per-message bundle of snapshots keyed by swipe index. */
export interface MessageSongEntry {
  messageId: string;
  /** The message's active swipe index when the chat was read. */
  activeSwipe: number;
  /** Snapshots keyed by swipe index. Sparse — swipes generated with nothing playing are absent. */
  bySwipe: Record<number, SongSnapshot>;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  volume: number | null;
}

export type MiniPlayerStyle = "default" | "modern";

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
  miniPlayerStyle: MiniPlayerStyle;
  x?: number;
  y?: number;
}

export interface AlbumColors {
  dominant: { r: number; g: number; b: number };
  dominantHsl: { h: number; s: number; l: number };
  isLight: boolean;
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
  client_secret?: string;
}
