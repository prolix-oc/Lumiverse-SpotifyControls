import type { PlaybackState } from "../types";

export interface LyricsUI {
  root: HTMLElement;
  update(trackUri: string | null, plainLyrics: string | null, syncedLyrics: string | null, instrumental: boolean): void;
  updatePlayback(state: PlaybackState | null): void;
  setLoading(loading: boolean): void;
  clear(): void;
  destroy(): void;
}

interface SyncedLyricLine {
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

const USER_SCROLL_SUPPRESS_MS = 2500;
const LOADING_STATUS_DELAY_MS = 180;
const EMPTY_SYNCED_LINE_SYMBOL = "♪";
const SEEK_SYNC_TOLERANCE_MS = 1400;
const SEEK_STATE_GRACE_MS = 1800;

interface UpdateLineClassesOptions {
  forceCenter?: boolean;
  behavior?: ScrollBehavior;
}

function parseTimestamp(raw: string): number | null {
  const match = /^(\d+):(\d{2})(?:\.(\d{1,3}))?$/.exec(raw);
  if (!match) return null;

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const fraction = match[3] ? Number(match[3].padEnd(3, "0")) : 0;
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || seconds > 59) return null;

  return minutes * 60_000 + seconds * 1000 + fraction;
}

function parseSyncedLyrics(value: string | null): Array<{ timeMs: number; text: string }> {
  if (!value) return [];

  const parsed: Array<{ timeMs: number; text: string }> = [];
  for (const line of value.split(/\r?\n/)) {
    const timestamps = [...line.matchAll(/\[([^\]]+)\]/g)]
      .map((match) => parseTimestamp(match[1]))
      .filter((timeMs): timeMs is number => timeMs !== null);
    if (timestamps.length === 0) continue;

    const text = line.replace(/(?:\[[^\]]+\])+/g, "").trim();
    for (const timeMs of timestamps) parsed.push({ timeMs, text });
  }

  const grouped: Array<{ timeMs: number; text: string }> = [];
  for (const line of parsed.sort((a, b) => a.timeMs - b.timeMs)) {
    const previous = grouped[grouped.length - 1];
    if (previous?.timeMs === line.timeMs) {
      previous.text = [previous.text, line.text].filter(Boolean).join("\n");
    } else {
      grouped.push({ ...line });
    }
  }

  return grouped;
}

function getLineClassName(index: number, activeLineIndex: number, hasText: boolean): string {
  const classes = ["spotify-lyrics-line"];
  if (!hasText) classes.push("spotify-lyrics-line-blank");
  if (index === activeLineIndex) classes.push("spotify-lyrics-line-active");
  else if (index < activeLineIndex) classes.push("spotify-lyrics-line-past");
  else classes.push("spotify-lyrics-line-future");
  if (activeLineIndex >= 0) {
    const distance = Math.abs(index - activeLineIndex);
    if (distance === 1) classes.push("spotify-lyrics-line-tier-1");
    else if (distance === 2) classes.push("spotify-lyrics-line-tier-2");
    else if (distance === 3) classes.push("spotify-lyrics-line-tier-3");
    else if (distance >= 4) classes.push("spotify-lyrics-line-tier-4");
  }
  return classes.join(" ");
}

function getLineDisplayText(text: string): string {
  return text || EMPTY_SYNCED_LINE_SYMBOL;
}

function shouldReserveScaleGutter(text: string): boolean {
  return !text.includes("\n") && text.length >= 36;
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
  let playback: LyricsPlayback | null = null;
  let activeLineIndex = -1;
  let tickTimer: ReturnType<typeof setInterval> | null = null;
  let autoScrollTimer: ReturnType<typeof setTimeout> | null = null;
  let loadingTimer: ReturnType<typeof setTimeout> | null = null;
  let isAutoScrolling = false;
  let lastUserScrollAt = 0;
  let pendingSeekPositionMs: number | null = null;
  let pendingSeekUntil = 0;

  function stopLoadingState() {
    if (loadingTimer) {
      clearTimeout(loadingTimer);
      loadingTimer = null;
    }
    body.classList.remove("spotify-lyrics-loading");
  }

  function stopAutoScrollTracking() {
    if (autoScrollTimer) {
      clearTimeout(autoScrollTimer);
      autoScrollTimer = null;
    }
    isAutoScrolling = false;
  }

  function noteUserScroll() {
    stopAutoScrollTracking();
    lastUserScrollAt = Date.now();
  }

  body.addEventListener("wheel", noteUserScroll, { passive: true });
  body.addEventListener("touchmove", noteUserScroll, { passive: true });
  body.addEventListener("pointerdown", noteUserScroll, { passive: true });
  body.addEventListener("scroll", () => {
    if (!isAutoScrolling) lastUserScrollAt = Date.now();
  }, { passive: true });

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

  function getProgressMs(): number {
    if (!playback) return 0;
    if (!playback.isPlaying) return playback.progressMs;
    return Math.min(playback.progressMs + Date.now() - playback.updatedAt, playback.durationMs || Infinity);
  }

  function centerLine(line: SyncedLyricLine, behavior: ScrollBehavior = "smooth") {
    requestAnimationFrame(() => {
      const bodyRect = body.getBoundingClientRect();
      const textRect = line.textEl.getBoundingClientRect();
      const targetScrollTop = body.scrollTop + (textRect.top + textRect.height / 2) - (bodyRect.top + body.clientHeight / 2);
      const maxScrollTop = Math.max(0, body.scrollHeight - body.clientHeight);
      body.scrollTo({ top: Math.max(0, Math.min(targetScrollTop, maxScrollTop)), behavior });
    });
  }

  function updateLineClasses(nextActiveLineIndex: number, options: UpdateLineClassesOptions = {}) {
    activeLineIndex = nextActiveLineIndex;
    syncedLines.forEach((line, index) => {
      line.el.className = getLineClassName(index, activeLineIndex, Boolean(line.text));
    });

    const activeLine = syncedLines[activeLineIndex];
    const shouldCenter = options.forceCenter || Date.now() - lastUserScrollAt > USER_SCROLL_SUPPRESS_MS;
    if (activeLine && shouldCenter) {
      isAutoScrolling = true;
      if (autoScrollTimer) clearTimeout(autoScrollTimer);
      centerLine(activeLine, options.behavior);
      autoScrollTimer = setTimeout(stopAutoScrollTracking, 700);
    }
  }

  function updateActiveLine() {
    if (syncedLines.length === 0) return;

    const progressMs = getProgressMs();
    let nextActiveLineIndex = -1;
    for (let i = 0; i < syncedLines.length; i++) {
      if (syncedLines[i].timeMs > progressMs) break;
      nextActiveLineIndex = i;
    }

    if (nextActiveLineIndex !== activeLineIndex) {
      updateLineClasses(nextActiveLineIndex);
    }
  }

  function clear() {
    stopTicking();
    stopAutoScrollTracking();
    stopLoadingState();
    body.innerHTML = "";
    body.className = "spotify-lyrics-body";
    currentTrackUri = null;
    syncedLines = [];
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
      stopAutoScrollTracking();
      body.innerHTML = "";
      body.className = "spotify-lyrics-body spotify-lyrics-loading";
      syncedLines = [];
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
    syncedLines = lines.map((line, index) => {
      const el = document.createElement("div");
      const textEl = document.createElement("div");
      el.className = getLineClassName(index, activeLineIndex, Boolean(line.text));
      el.classList.add("spotify-lyrics-line-enter");
      el.style.setProperty("--spotify-lyrics-enter-delay", `${Math.min(index * 28, 280)}ms`);
      textEl.className = "spotify-lyrics-line-text";
      if (!line.text) textEl.classList.add("spotify-lyrics-line-symbol");
      if (shouldReserveScaleGutter(line.text)) textEl.classList.add("spotify-lyrics-line-text-long");
      textEl.textContent = getLineDisplayText(line.text);
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
        }
        updateLineClasses(index, { forceCenter: true, behavior: "smooth" });
        onSeek?.(line.timeMs);
      });
      body.appendChild(el);
      return { ...line, el, textEl };
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
    stopAutoScrollTracking();
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
    updateActiveLine();

    if (state.isPlaying) startTicking();
    else stopTicking();
  }

  return {
    root,
    update,
    updatePlayback,
    setLoading,
    clear,
    destroy() {
      stopTicking();
      stopAutoScrollTracking();
      stopLoadingState();
      root.remove();
    },
  };
}
