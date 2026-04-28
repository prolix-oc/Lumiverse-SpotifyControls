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
}

interface LyricsPlayback {
  trackUri: string;
  progressMs: number;
  durationMs: number;
  isPlaying: boolean;
  updatedAt: number;
}

const USER_SCROLL_SUPPRESS_MS = 2500;

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
  if (activeLineIndex >= 0 && Math.abs(index - activeLineIndex) === 1) classes.push("spotify-lyrics-line-near");
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
  let playback: LyricsPlayback | null = null;
  let activeLineIndex = -1;
  let tickTimer: ReturnType<typeof setInterval> | null = null;
  let autoScrollTimer: ReturnType<typeof setTimeout> | null = null;
  let isAutoScrolling = false;
  let lastUserScrollAt = 0;

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

  function updateLineClasses(nextActiveLineIndex: number) {
    activeLineIndex = nextActiveLineIndex;
    syncedLines.forEach((line, index) => {
      line.el.className = getLineClassName(index, activeLineIndex, Boolean(line.text));
    });

    const activeLine = syncedLines[activeLineIndex];
    if (activeLine && Date.now() - lastUserScrollAt > USER_SCROLL_SUPPRESS_MS) {
      isAutoScrolling = true;
      if (autoScrollTimer) clearTimeout(autoScrollTimer);
      activeLine.el.scrollIntoView({ block: "center", behavior: "smooth" });
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
    body.innerHTML = "";
    body.className = "spotify-lyrics-body";
    currentTrackUri = null;
    syncedLines = [];
    playback = null;
    activeLineIndex = -1;
  }

  function setLoading(loading: boolean) {
    if (loading) {
      stopTicking();
      stopAutoScrollTracking();
      body.innerHTML = "";
      body.className = "spotify-lyrics-body";
      syncedLines = [];
      activeLineIndex = -1;
      const el = document.createElement("div");
      el.className = "spotify-lyrics-status";
      el.textContent = "Loading lyrics…";
      body.appendChild(el);
    }
  }

  function renderSyncedLyrics(lines: Array<{ timeMs: number; text: string }>) {
    body.className = "spotify-lyrics-body spotify-lyrics-has-content spotify-lyrics-synced";
    syncedLines = lines.map((line, index) => {
      const el = document.createElement("div");
      el.className = getLineClassName(index, activeLineIndex, Boolean(line.text));
      el.textContent = line.text || " ";
      el.addEventListener("click", () => onSeek?.(line.timeMs));
      body.appendChild(el);
      return { ...line, el };
    });
    updateActiveLine();
    if (playback?.isPlaying) startTicking();
  }

  function renderPlainLyrics(lyrics: string) {
    body.className = "spotify-lyrics-body spotify-lyrics-has-content";
    const pre = document.createElement("div");
    pre.className = "spotify-lyrics-text";
    pre.textContent = lyrics;
    body.appendChild(pre);
  }

  function update(trackUri: string | null, plainLyrics: string | null, syncedLyrics: string | null, instrumental: boolean) {
    stopTicking();
    stopAutoScrollTracking();
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
      stopTicking();
      return;
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
      root.remove();
    },
  };
}
