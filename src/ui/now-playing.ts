import type { PlaybackState } from "../types";
import { createCrossfadeArt } from "./crossfade-art";

export interface NowPlayingUI {
  root: HTMLElement;
  update(state: PlaybackState | null, connected: boolean): void;
  destroy(): void;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function createNowPlayingUI(
  onSeek: (positionMs: number) => void
): NowPlayingUI {
  const root = document.createElement("div");
  root.className = "spotify-section";

  const title = document.createElement("h3");
  title.className = "spotify-section-title";
  title.textContent = "Now Playing";
  root.appendChild(title);

  const container = document.createElement("div");
  container.className = "spotify-now-playing";

  const art = createCrossfadeArt("spotify-album-art");

  const info = document.createElement("div");
  info.className = "spotify-track-info";

  const trackName = document.createElement("div");
  trackName.className = "spotify-track-name";

  const artistName = document.createElement("div");
  artistName.className = "spotify-track-artist";

  const albumName = document.createElement("div");
  albumName.className = "spotify-track-album";

  const deviceRow = document.createElement("div");
  deviceRow.className = "spotify-track-device";

  info.appendChild(trackName);
  info.appendChild(artistName);
  info.appendChild(albumName);
  info.appendChild(deviceRow);

  container.appendChild(art.el);
  container.appendChild(info);
  root.appendChild(container);

  // Progress bar
  const progressContainer = document.createElement("div");
  progressContainer.className = "spotify-progress-container";

  const progressTime = document.createElement("span");
  const progressBar = document.createElement("div");
  progressBar.className = "spotify-progress-bar";

  const progressFill = document.createElement("div");
  progressFill.className = "spotify-progress-fill";
  progressBar.appendChild(progressFill);

  const durationTime = document.createElement("span");

  progressContainer.appendChild(progressTime);
  progressContainer.appendChild(progressBar);
  progressContainer.appendChild(durationTime);
  root.appendChild(progressContainer);

  const emptyState = document.createElement("div");
  emptyState.className = "spotify-empty";

  let currentDuration = 0;

  // Client-side progress interpolation
  let lastProgressMs = 0;
  let lastUpdateTime = 0;
  let lastIsPlaying = false;
  let animFrameId: number | null = null;

  function tickProgress() {
    if (!lastIsPlaying || !currentDuration) {
      animFrameId = null;
      return;
    }
    const elapsed = Date.now() - lastUpdateTime;
    const interpolated = Math.min(lastProgressMs + elapsed, currentDuration);
    const pct = (interpolated / currentDuration) * 100;
    progressFill.style.width = `${pct}%`;
    progressTime.textContent = formatTime(interpolated);
    animFrameId = requestAnimationFrame(tickProgress);
  }

  function startTicking() {
    if (animFrameId !== null) return;
    animFrameId = requestAnimationFrame(tickProgress);
  }

  function stopTicking() {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  progressBar.addEventListener("click", (e) => {
    if (!currentDuration) return;
    const rect = progressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(Math.round(pct * currentDuration));
  });

  function showEmpty(message: string) {
    container.style.display = "none";
    progressContainer.style.display = "none";
    emptyState.textContent = message;
    if (!root.contains(emptyState)) root.appendChild(emptyState);
    stopTicking();
  }

  function update(state: PlaybackState | null, connected: boolean) {
    if (!connected) {
      showEmpty("Connect to Spotify to see playback");
      return;
    }

    if (!state) {
      showEmpty("No active playback — open Spotify on a device to get started");
      return;
    }

    if (root.contains(emptyState)) root.removeChild(emptyState);
    container.style.display = "flex";
    progressContainer.style.display = "flex";

    trackName.textContent = state.trackName;
    artistName.textContent = state.artistName;
    albumName.textContent = state.albumName;
    if (state.deviceName) {
      deviceRow.textContent = `Playing on ${state.deviceName}`;
      deviceRow.style.display = "";
    } else {
      deviceRow.style.display = "none";
    }
    currentDuration = state.durationMs;

    art.setUrl(state.albumArtUrl);

    lastProgressMs = state.progressMs;
    lastUpdateTime = Date.now();
    lastIsPlaying = state.isPlaying;

    const pct = state.durationMs > 0 ? (state.progressMs / state.durationMs) * 100 : 0;
    progressFill.style.width = `${pct}%`;
    progressTime.textContent = formatTime(state.progressMs);
    durationTime.textContent = formatTime(state.durationMs);

    if (state.isPlaying) {
      startTicking();
    } else {
      stopTicking();
    }
  }

  update(null, false);

  return {
    root,
    update,
    destroy() {
      stopTicking();
      art.destroy();
      root.remove();
    },
  };
}
