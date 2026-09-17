import type { PlaybackState } from "../types";
import { createLyricAutoScroller } from "./lyric-auto-scroll";
import {
  createSyncedLyricsModel,
  parseSyncedLyrics,
  shouldReserveScaleGutter,
} from "./synced-lyrics-model";

export interface LyricsUI {
  root: HTMLElement;
  update(trackUri: string | null, plainLyrics: string | null, syncedLyrics: string | null, instrumental: boolean): void;
  updatePlayback(state: PlaybackState | null): void;
  setLoading(loading: boolean): void;
  setAutoScrollSuspended(suspended: boolean): void;
  /** Turns the receding-line depth blur and the blur-in animation on or off. */
  setBlurEnabled(enabled: boolean): void;
  clear(): void;
  destroy(): void;
}

interface SyncedLyricLine {
  index: number;
  timeMs: number;
  text: string;
  el: HTMLDivElement;
  textEl: HTMLDivElement;
}

interface LyricsPlayback {
  trackUri: string;
  progressMs: number;
  durationMs: number;
  isPlaying: boolean;
  updatedAt: number;
}

const LOADING_STATUS_DELAY_MS = 180;
const SEEK_SYNC_TOLERANCE_MS = 1400;
const SEEK_STATE_GRACE_MS = 1800;


function getLineClassName(index: number, activeLineIndex: number, hasText: boolean, blurEnabled: boolean): string {
  const classes = ["spotify-lyrics-line"];
  if (!hasText) classes.push("spotify-lyrics-line-blank");
  if (index === activeLineIndex) classes.push("spotify-lyrics-line-active");
  else if (index < activeLineIndex) classes.push("spotify-lyrics-line-past");
  else classes.push("spotify-lyrics-line-future");
  if (activeLineIndex >= 0) {
    const distance = Math.abs(index - activeLineIndex);
    if (distance >= 1) {
      const tier = Math.min(distance, 4);
      classes.push(`spotify-lyrics-line-tier-${tier}`);
      // The active line and its neighbour stay sharp so the eye has a crisp
      // edge to land on; blur only starts two lines out.
      if (blurEnabled && tier >= 2) classes.push(`spotify-lyrics-line-blur-${tier}`);
    }
  }
  return classes.join(" ");
}

export function createLyricsUI(onSeek?: (positionMs: number) => void): LyricsUI {
  const root = document.createElement("div");
  root.className = "spotify-section spotify-lyrics-section";

  const title = document.createElement("h3");
  title.className = "spotify-section-title";
  title.textContent = "Lyrics";
  root.appendChild(title);

  const body = document.createElement("div");
  body.className = "spotify-lyrics-body";
  root.appendChild(body);

  let currentTrackUri: string | null = null;
  let syncedLines: SyncedLyricLine[] = [];
  const syncedLyricsModel = createSyncedLyricsModel();
  const autoScroll = createLyricAutoScroller(body);
  let playback: LyricsPlayback | null = null;
  let activeLineIndex = -1;
  let blurEnabled = true;
  let tickTimer: ReturnType<typeof setInterval> | null = null;
  let loadingTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingSeekPositionMs: number | null = null;
  let pendingSeekUntil = 0;

  function stopLoadingState() {
    if (loadingTimer) {
      clearTimeout(loadingTimer);
      loadingTimer = null;
    }
    body.classList.remove("spotify-lyrics-loading");
  }


  function stopTicking() {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  }

  function startTicking() {
    if (tickTimer || syncedLines.length === 0) return;
    tickTimer = setInterval(updateActiveLine, 200);
  }

  function refreshLineClasses() {
    syncedLines.forEach((line) => {
      line.el.className = getLineClassName(line.index, activeLineIndex, Boolean(line.text), blurEnabled);
    });
  }
  function applyEnterBlur() {
    if (blurEnabled) root.style.removeProperty("--spotify-lyrics-enter-blur");
    else root.style.setProperty("--spotify-lyrics-enter-blur", "0px");
  }
  function updateLineClasses(nextActiveLineIndex: number, forceCenter = false) {
    activeLineIndex = nextActiveLineIndex;
    refreshLineClasses();
    const activeLine = syncedLines.find((line) => line.index === activeLineIndex);
    if (activeLine) autoScroll.center(activeLine.textEl, { force: forceCenter });
  }

  function updateActiveLine() {
    if (syncedLines.length === 0) return;

    if (syncedLyricsModel.refreshActiveLineIndex()) {
      updateLineClasses(syncedLyricsModel.getActiveLineIndex());
    }
  }

  function clear() {
    stopTicking();
    autoScroll.cancel();
    stopLoadingState();
    body.innerHTML = "";
    body.className = "spotify-lyrics-body";
    currentTrackUri = null;
    syncedLines = [];
    syncedLyricsModel.clear();
    playback = null;
    activeLineIndex = -1;
    pendingSeekPositionMs = null;
    pendingSeekUntil = 0;
  }

  function setLoading(loading: boolean) {
    stopLoadingState();
    if (!loading) return;

    if (loading) {
      stopTicking();
      autoScroll.cancel();
      body.innerHTML = "";
      body.className = "spotify-lyrics-body spotify-lyrics-loading";
      syncedLines = [];
      syncedLyricsModel.clear();
      activeLineIndex = -1;
      loadingTimer = setTimeout(() => {
        loadingTimer = null;
        if (!body.classList.contains("spotify-lyrics-loading")) return;
        const el = document.createElement("div");
        el.className = "spotify-lyrics-status spotify-lyrics-status-loading";
        el.textContent = "Loading lyrics...";
        body.appendChild(el);
      }, LOADING_STATUS_DELAY_MS);
    }
  }

  function renderSyncedLyrics(lines: Array<{ timeMs: number; text: string }>) {
    stopLoadingState();
    body.className = "spotify-lyrics-body spotify-lyrics-has-content spotify-lyrics-synced";
    syncedLyricsModel.setLyrics(lines);
    const snapshot = syncedLyricsModel.getSnapshot();
    activeLineIndex = snapshot.activeLineIndex;
    syncedLines = snapshot.lines.map((line, renderIndex) => {
      const el = document.createElement("div");
      const textEl = document.createElement("div");
      el.className = getLineClassName(line.index, activeLineIndex, line.hasText, blurEnabled);
      el.classList.add("spotify-lyrics-line-enter");
      el.style.setProperty("--spotify-lyrics-enter-delay", `${Math.min(renderIndex * 28, 280)}ms`);
      textEl.className = "spotify-lyrics-line-text";
      if (!line.hasText) textEl.classList.add("spotify-lyrics-line-symbol");
      if (shouldReserveScaleGutter(line.text)) textEl.classList.add("spotify-lyrics-line-text-long");
      textEl.textContent = line.displayText;
      el.appendChild(textEl);
      el.addEventListener("click", () => {
        pendingSeekPositionMs = line.timeMs;
        pendingSeekUntil = Date.now() + SEEK_STATE_GRACE_MS;
        if (playback && playback.trackUri === currentTrackUri) {
          playback = {
            ...playback,
            progressMs: line.timeMs,
            updatedAt: Date.now(),
          };
          syncedLyricsModel.setPlayback(playback);
        }
        updateLineClasses(line.index, true);
        onSeek?.(line.timeMs);
      });
      body.appendChild(el);
      return { index: line.index, timeMs: line.timeMs, text: line.text, el, textEl };
    });
    updateActiveLine();
    if (playback?.isPlaying) startTicking();
  }

  function renderPlainLyrics(lyrics: string) {
    stopLoadingState();
    body.className = "spotify-lyrics-body spotify-lyrics-has-content";
    const pre = document.createElement("div");
    pre.className = "spotify-lyrics-text spotify-lyrics-text-enter";
    pre.textContent = lyrics;
    body.appendChild(pre);
  }

  function update(trackUri: string | null, plainLyrics: string | null, syncedLyrics: string | null, instrumental: boolean) {
    stopTicking();
    autoScroll.cancel();
    stopLoadingState();
    currentTrackUri = trackUri;
    body.innerHTML = "";
    syncedLines = [];
    activeLineIndex = -1;

    if (instrumental) {
      body.className = "spotify-lyrics-body";
      const el = document.createElement("div");
      el.className = "spotify-lyrics-status";
      el.textContent = "♪ Instrumental";
      body.appendChild(el);
      return;
    }

    const parsedSyncedLyrics = parseSyncedLyrics(syncedLyrics);
    if (parsedSyncedLyrics.length > 0) {
      renderSyncedLyrics(parsedSyncedLyrics);
      return;
    }

    if (!plainLyrics) {
      body.className = "spotify-lyrics-body";
      const el = document.createElement("div");
      el.className = "spotify-lyrics-status";
      el.textContent = "No lyrics available";
      body.appendChild(el);
      return;
    }

    renderPlainLyrics(plainLyrics);
  }

  function updatePlayback(state: PlaybackState | null) {
    if (!state || state.trackUri !== currentTrackUri) {
      playback = null;
      syncedLyricsModel.setPlayback(null);
      pendingSeekPositionMs = null;
      pendingSeekUntil = 0;
      stopTicking();
      return;
    }

    if (pendingSeekPositionMs !== null) {
      const isNearPendingSeek = Math.abs(state.progressMs - pendingSeekPositionMs) <= SEEK_SYNC_TOLERANCE_MS;
      if (isNearPendingSeek) {
        pendingSeekPositionMs = null;
        pendingSeekUntil = 0;
      } else if (Date.now() < pendingSeekUntil) {
        return;
      } else {
        pendingSeekPositionMs = null;
        pendingSeekUntil = 0;
      }
    }

    playback = {
      trackUri: state.trackUri,
      progressMs: state.progressMs,
      durationMs: state.durationMs,
      isPlaying: state.isPlaying,
      updatedAt: Date.now(),
    };
    syncedLyricsModel.setPlayback(playback);
    updateActiveLine();

    if (state.isPlaying) startTicking();
    else stopTicking();
  }

  return {
    root,
    update,
    updatePlayback,
    setLoading,
    setAutoScrollSuspended(suspended: boolean) {
      if (autoScroll.suspend(suspended) && !suspended && syncedLines.length) {
        updateLineClasses(activeLineIndex, true);
      }
    },
    setBlurEnabled(enabled: boolean) {
      if (blurEnabled === enabled) return;
      blurEnabled = enabled;
      applyEnterBlur();
      refreshLineClasses();
    },
    clear,
    destroy() {
      stopTicking();
      autoScroll.destroy();
      stopLoadingState();
      root.remove();
    },
  };
}
