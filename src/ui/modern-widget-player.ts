import type { PlaybackState } from "../types";
import { createCrossfadeArt, getTrackScopedArtUrl } from "./crossfade-art";
import {
  createSyncedLyricsModel,
  parseSyncedLyrics,
  shouldReserveScaleGutter,
} from "./synced-lyrics-model";

const USER_SCROLL_SUPPRESS_MS = 2500;

const ICON_PREV = `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`;
const ICON_PLAY = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
const ICON_PAUSE = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
const ICON_NEXT = `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`;
const ICON_VOLUME = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
const ICON_EXPAND = `<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`;
const ICON_COLLAPSE = `<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>`;
const ICON_NOTE = `<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
const MARQUEE_REST_MS = 4000;

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function getCompactPlainLyricLines(lyrics: string | null): string[] {
  if (!lyrics) return [];
  return lyrics
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function stopEventPropagation(el: HTMLElement) {
  el.addEventListener("pointerdown", (e) => e.stopPropagation());
  el.addEventListener("click", (e) => e.stopPropagation());
}

function createMarqueeLabel(baseClass: string) {
  const root = document.createElement("div");
  root.className = `${baseClass} spotify-modern-widget-marquee`;
  root.dataset.marqueePhase = "idle";

  const content = document.createElement("div");
  content.className = `${baseClass}-content spotify-modern-widget-marquee-content`;
  root.appendChild(content);

  let marqueeCycleTimer: ReturnType<typeof setTimeout> | null = null;

  function stopMarquee() {
    if (marqueeCycleTimer) {
      clearTimeout(marqueeCycleTimer);
      marqueeCycleTimer = null;
    }
    root.dataset.marqueePhase = "idle";
    content.classList.remove("spotify-modern-widget-marquee-animate");
  }

  function startMarqueePass(restart: boolean) {
    root.dataset.marqueePhase = "scrolling";
    content.classList.remove("spotify-modern-widget-marquee-animate");
    if (restart) {
      content.offsetWidth;
    }
    content.classList.add("spotify-modern-widget-marquee-animate");
  }

  function queueMarqueeStart(restart: boolean) {
    if (marqueeCycleTimer) {
      clearTimeout(marqueeCycleTimer);
      marqueeCycleTimer = null;
    }
    root.dataset.marqueePhase = "rest";
    content.classList.remove("spotify-modern-widget-marquee-animate");
    marqueeCycleTimer = setTimeout(() => {
      marqueeCycleTimer = null;
      startMarqueePass(restart);
    }, MARQUEE_REST_MS);
  }

  content.addEventListener("animationend", (event) => {
    if (event.animationName !== "spotify-modern-marquee" || root.dataset.marqueePhase !== "scrolling") {
      return;
    }
    queueMarqueeStart(true);
  });

  return {
    root,
    setText(value: string) {
      content.textContent = value;
      root.setAttribute("aria-label", value);
    },
    refresh(expanded: boolean, restart = false) {
      if (!expanded) {
        root.dataset.overflow = "false";
        stopMarquee();
        root.style.removeProperty("--spotify-modern-marquee-distance");
        root.style.removeProperty("--spotify-modern-marquee-duration");
        return;
      }

      const overflow = Math.ceil(content.scrollWidth - root.clientWidth);
      if (overflow <= 6) {
        root.dataset.overflow = "false";
        stopMarquee();
        root.style.removeProperty("--spotify-modern-marquee-distance");
        root.style.removeProperty("--spotify-modern-marquee-duration");
        return;
      }

      root.dataset.overflow = "true";
      root.style.setProperty("--spotify-modern-marquee-distance", `${overflow}px`);
      root.style.setProperty("--spotify-modern-marquee-duration", `${Math.max(8, Math.min(20, 8 + overflow / 18))}s`);

      const isQueued = marqueeCycleTimer !== null;
      const isScrolling = root.dataset.marqueePhase === "scrolling";
      if (restart || (!isQueued && !isScrolling)) {
        queueMarqueeStart(restart);
      }
    },
  };
}

export interface ModernWidgetPlayerUI {
  root: HTMLElement;
  update(state: PlaybackState | null, connected: boolean): void;
  updateLyrics(trackUri: string | null, plainLyrics: string | null, syncedLyrics: string | null, instrumental: boolean): void;
  setLyricsLoading(loading: boolean): void;
  setCollapsedSize(size: number): void;
  setExpanded(expanded: boolean): void;
  isExpanded(): boolean;
  destroy(): void;
}

export function createModernWidgetPlayerUI(
  sendToBackend: (msg: unknown) => void,
  onExpandClick: () => void,
  onCollapseClick: () => void
): ModernWidgetPlayerUI {
  const root = document.createElement("div");
  root.className = "spotify-modern-widget-player";
  root.dataset.expanded = "false";

  const compact = document.createElement("div");
  compact.className = "spotify-modern-widget-compact";

  const compactArt = createCrossfadeArt("spotify-modern-widget-compact-art");
  const compactFallback = document.createElement("div");
  compactFallback.className = "spotify-modern-widget-compact-fallback";
  compactFallback.innerHTML = ICON_NOTE;

  const compactOverlay = document.createElement("div");
  compactOverlay.className = "spotify-modern-widget-compact-overlay";

  const compactStatus = document.createElement("div");
  compactStatus.className = "spotify-modern-widget-compact-status";

  const compactProgress = document.createElement("div");
  compactProgress.className = "spotify-modern-widget-compact-progress";
  const compactProgressFill = document.createElement("div");
  compactProgressFill.className = "spotify-modern-widget-compact-progress-fill";
  compactProgress.appendChild(compactProgressFill);

  compactOverlay.appendChild(compactStatus);
  compactOverlay.appendChild(compactProgress);
  compact.appendChild(compactArt.el);
  compact.appendChild(compactFallback);
  compact.appendChild(compactOverlay);

  const expanded = document.createElement("div");
  expanded.className = "spotify-modern-widget-expanded";

  const header = document.createElement("div");
  header.className = "spotify-modern-widget-header";

  const eyebrow = document.createElement("div");
  eyebrow.className = "spotify-modern-widget-eyebrow";
  eyebrow.textContent = "Now Playing";

  const headerButtons = document.createElement("div");
  headerButtons.className = "spotify-modern-widget-header-buttons";

  const openFullBtn = document.createElement("button");
  openFullBtn.className = "spotify-modern-widget-icon-btn";
  openFullBtn.innerHTML = ICON_EXPAND;
  openFullBtn.title = "Open full player";

  const collapseBtn = document.createElement("button");
  collapseBtn.className = "spotify-modern-widget-icon-btn";
  collapseBtn.innerHTML = ICON_COLLAPSE;
  collapseBtn.title = "Collapse";

  stopEventPropagation(openFullBtn);
  stopEventPropagation(collapseBtn);

  openFullBtn.addEventListener("click", () => onExpandClick());
  collapseBtn.addEventListener("click", () => onCollapseClick());

  headerButtons.appendChild(openFullBtn);
  headerButtons.appendChild(collapseBtn);
  header.appendChild(eyebrow);
  header.appendChild(headerButtons);

  const hero = document.createElement("div");
  hero.className = "spotify-modern-widget-hero";

  const heroArt = createCrossfadeArt("spotify-modern-widget-art");
  const heroFallback = document.createElement("div");
  heroFallback.className = "spotify-modern-widget-art-fallback";
  heroFallback.innerHTML = ICON_NOTE;

  const meta = document.createElement("div");
  meta.className = "spotify-modern-widget-meta";

  const trackName = createMarqueeLabel("spotify-modern-widget-track");
  const artistName = createMarqueeLabel("spotify-modern-widget-artist");
  const albumName = createMarqueeLabel("spotify-modern-widget-album");

  meta.appendChild(trackName.root);
  meta.appendChild(artistName.root);
  meta.appendChild(albumName.root);
  hero.appendChild(heroArt.el);
  hero.appendChild(heroFallback);
  hero.appendChild(meta);

  const progressRow = document.createElement("div");
  progressRow.className = "spotify-modern-widget-progress-row";
  const progressTime = document.createElement("span");
  progressTime.className = "spotify-modern-widget-time";
  const progressBar = document.createElement("div");
  progressBar.className = "spotify-modern-widget-progress-bar";
  const progressFill = document.createElement("div");
  progressFill.className = "spotify-modern-widget-progress-fill";
  progressBar.appendChild(progressFill);
  const durationTime = document.createElement("span");
  durationTime.className = "spotify-modern-widget-time";
  progressRow.appendChild(progressTime);
  progressRow.appendChild(progressBar);
  progressRow.appendChild(durationTime);

  const lyricsSection = document.createElement("div");
  lyricsSection.className = "spotify-modern-widget-lyrics";
  const lyricsHeader = document.createElement("div");
  lyricsHeader.className = "spotify-modern-widget-section-label";
  lyricsHeader.textContent = "Lyrics";
  const lyricsBody = document.createElement("div");
  lyricsBody.className = "spotify-modern-widget-lyrics-body";
  const lyricsTrack = document.createElement("div");
  lyricsTrack.className = "spotify-modern-widget-lyrics-track";
  lyricsBody.appendChild(lyricsTrack);
  lyricsSection.appendChild(lyricsHeader);
  lyricsSection.appendChild(lyricsBody);

  const controls = document.createElement("div");
  controls.className = "spotify-modern-widget-controls";
  const prevBtn = document.createElement("button");
  prevBtn.className = "spotify-modern-widget-btn";
  prevBtn.innerHTML = ICON_PREV;
  const playPauseBtn = document.createElement("button");
  playPauseBtn.className = "spotify-modern-widget-btn spotify-modern-widget-btn-main";
  playPauseBtn.innerHTML = ICON_PLAY;
  const nextBtn = document.createElement("button");
  nextBtn.className = "spotify-modern-widget-btn";
  nextBtn.innerHTML = ICON_NEXT;
  controls.appendChild(prevBtn);
  controls.appendChild(playPauseBtn);
  controls.appendChild(nextBtn);

  const volumeRow = document.createElement("div");
  volumeRow.className = "spotify-modern-widget-volume-row";
  const volumeIcon = document.createElement("span");
  volumeIcon.className = "spotify-modern-widget-volume-icon";
  volumeIcon.innerHTML = ICON_VOLUME;
  const volumeSlider = document.createElement("input");
  volumeSlider.type = "range";
  volumeSlider.min = "0";
  volumeSlider.max = "100";
  volumeSlider.value = "50";
  volumeSlider.className = "spotify-modern-widget-volume-slider";
  volumeRow.appendChild(volumeIcon);
  volumeRow.appendChild(volumeSlider);

  const emptyState = document.createElement("div");
  emptyState.className = "spotify-modern-widget-empty";

  expanded.appendChild(header);
  expanded.appendChild(hero);
  expanded.appendChild(progressRow);
  expanded.appendChild(lyricsSection);
  expanded.appendChild(controls);
  expanded.appendChild(volumeRow);
  expanded.appendChild(emptyState);

  root.appendChild(compact);
  root.appendChild(expanded);

  [progressBar, prevBtn, playPauseBtn, nextBtn, volumeSlider].forEach((el) => stopEventPropagation(el));

  let connected = false;
  let state: PlaybackState | null = null;
  let isExpandedState = false;
  let currentDuration = 0;
  let lastProgressMs = 0;
  let lastUpdateTime = 0;
  let lastIsPlaying = false;
  let animFrameId: number | null = null;
  let lyricsTrackUri: string | null = null;
  const syncedLyricsModel = createSyncedLyricsModel();
  let plainLyricLines: string[] = [];
  let lyricsInstrumental = false;
  let lyricsLoading = false;
  let volumeDebounce: ReturnType<typeof setTimeout> | null = null;
  let lastRenderedLyricSignature = "";
  let syncedLyricEls: HTMLDivElement[] = [];
  let autoScrollTimer: ReturnType<typeof setTimeout> | null = null;
  let isAutoScrolling = false;
  let lastUserScrollAt = 0;
  let lastMetadataSignature = "";
  let marqueeRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  let marqueeRefreshTimerLate: ReturnType<typeof setTimeout> | null = null;

  const marqueeObserver = new ResizeObserver(() => {
    refreshMarquees(false);
  });
  marqueeObserver.observe(meta);
  marqueeObserver.observe(root);

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

  lyricsBody.addEventListener("wheel", noteUserScroll, { passive: true });
  lyricsBody.addEventListener("touchmove", noteUserScroll, { passive: true });
  lyricsBody.addEventListener("pointerdown", noteUserScroll, { passive: true });
  lyricsBody.addEventListener("scroll", () => {
    if (!isAutoScrolling) lastUserScrollAt = Date.now();
  }, { passive: true });

  function refreshMarquees(restart: boolean) {
    requestAnimationFrame(() => {
      trackName.refresh(isExpandedState, restart);
      artistName.refresh(isExpandedState, restart);
      albumName.refresh(isExpandedState, restart);
    });
  }

  function scheduleMarqueeRefresh(restart: boolean) {
    if (marqueeRefreshTimer) clearTimeout(marqueeRefreshTimer);
    if (marqueeRefreshTimerLate) clearTimeout(marqueeRefreshTimerLate);
    refreshMarquees(restart);
    marqueeRefreshTimer = setTimeout(() => refreshMarquees(restart), 180);
    marqueeRefreshTimerLate = setTimeout(() => refreshMarquees(restart), 460);
  }

  function renderCompactArt(trackArtUrl: string | null) {
    compactArt.setUrl(trackArtUrl);
    compactFallback.style.display = trackArtUrl ? "none" : "flex";
  }

  function renderHeroArt(trackArtUrl: string | null) {
    heroArt.setUrl(trackArtUrl);
    heroFallback.style.display = trackArtUrl ? "none" : "flex";
  }

  function getInterpolatedProgressMs(): number {
    if (!lastIsPlaying) return lastProgressMs;
    return Math.min(lastProgressMs + Math.max(0, Date.now() - lastUpdateTime), currentDuration || Infinity);
  }

  function clearLyricsTrack() {
    stopAutoScrollTracking();
    lyricsTrack.innerHTML = "";
    lyricsBody.scrollTop = 0;
    syncedLyricEls = [];
  }

  function buildSyncedLyricsTrack() {
    clearLyricsTrack();
    const indexedLines = syncedLyricsModel.getIndexedLines();
    syncedLyricEls = indexedLines.map((line, renderIndex) => {
      const el = document.createElement("div");
      el.className = "spotify-modern-widget-lyric-line spotify-modern-widget-lyric-line-enter";
      el.style.setProperty("--spotify-modern-lyric-enter-delay", `${Math.min(renderIndex * 22, 110)}ms`);
      if (shouldReserveScaleGutter(line.text)) {
        el.classList.add("spotify-modern-widget-lyric-line-long");
      }
      el.textContent = line.displayText;
      lyricsTrack.appendChild(el);
      return el;
    });
  }

  function updateSyncedLyricsPresentation(shouldAutoscroll = true) {
    const activeLineIndex = syncedLyricsModel.getActiveLineIndex();
    const indexedLines = syncedLyricsModel.getIndexedLines();
    indexedLines.forEach((line, idx) => {
      const el = syncedLyricEls[idx];
      if (!el) return;
      el.className = "spotify-modern-widget-lyric-line";
      if (shouldReserveScaleGutter(line.text)) {
        el.classList.add("spotify-modern-widget-lyric-line-long");
      }
      if (line.index === activeLineIndex) {
        el.classList.add("active");
      } else if (activeLineIndex >= 0) {
        const distance = Math.abs(line.index - activeLineIndex);
        if (distance === 1) el.classList.add("near");
        else if (distance === 2) el.classList.add("mid");
        else el.classList.add("far");
      } else {
        el.classList.add("far");
      }
    });

    const activeEl = activeLineIndex >= 0 ? syncedLyricEls[activeLineIndex] : syncedLyricEls[0];
    if (!activeEl || !shouldAutoscroll) return;

    const shouldCenter = Date.now() - lastUserScrollAt > USER_SCROLL_SUPPRESS_MS;
    if (!shouldCenter) return;

    requestAnimationFrame(() => {
      const targetScrollTop = activeEl.offsetTop + activeEl.offsetHeight / 2 - lyricsBody.clientHeight / 2;
      const maxScrollTop = Math.max(0, lyricsBody.scrollHeight - lyricsBody.clientHeight);
      isAutoScrolling = true;
      lyricsBody.scrollTo({
        top: Math.max(0, Math.min(targetScrollTop, maxScrollTop)),
        behavior: "smooth",
      });
      if (autoScrollTimer) clearTimeout(autoScrollTimer);
      autoScrollTimer = setTimeout(stopAutoScrollTracking, 700);
    });
  }

  function renderLyrics() {
    clearLyricsTrack();

    if (!connected || !state) {
      lastRenderedLyricSignature = "";
      const status = document.createElement("div");
      status.className = "spotify-modern-widget-lyrics-status";
      status.textContent = connected ? "Start playback to see lyrics" : "Connect Spotify to see lyrics";
      lyricsTrack.appendChild(status);
      return;
    }

    if (lyricsLoading) {
      lastRenderedLyricSignature = "loading";
      const status = document.createElement("div");
      status.className = "spotify-modern-widget-lyrics-status spotify-modern-widget-lyrics-status-loading";
      status.textContent = "Loading lyrics...";
      lyricsTrack.appendChild(status);
      return;
    }

    if (lyricsInstrumental) {
      lastRenderedLyricSignature = "instrumental";
      const status = document.createElement("div");
      status.className = "spotify-modern-widget-lyrics-status";
      status.textContent = "♪ Instrumental";
      lyricsTrack.appendChild(status);
      return;
    }

    if (syncedLyricsModel.hasLyrics() && state.trackUri === lyricsTrackUri) {
      const nextSignature = syncedLyricsModel.getIndexedLines().map((line) => `${line.index}:${line.text}`).join("|");
      lastRenderedLyricSignature = nextSignature;
      buildSyncedLyricsTrack();
      updateSyncedLyricsPresentation(false);
      return;
    }

    if (plainLyricLines.length > 0) {
      const nextSignature = plainLyricLines.join("|");
      const shouldAnimate = nextSignature !== lastRenderedLyricSignature;
      lastRenderedLyricSignature = nextSignature;

      plainLyricLines.forEach((line, renderIndex) => {
        const el = document.createElement("div");
        el.className = "spotify-modern-widget-lyric-line plain";
        if (shouldAnimate) {
          el.classList.add("spotify-modern-widget-lyric-line-enter");
          el.style.setProperty("--spotify-modern-lyric-enter-delay", `${Math.min(renderIndex * 20, 100)}ms`);
        }
        el.textContent = line;
        lyricsTrack.appendChild(el);
      });
      return;
    }

    lastRenderedLyricSignature = "empty";

    const status = document.createElement("div");
    status.className = "spotify-modern-widget-lyrics-status";
    status.textContent = "No lyrics available";
    lyricsTrack.appendChild(status);
  }

  function updateActiveLyricLine(force = false) {
    if (!state || state.trackUri !== lyricsTrackUri || !syncedLyricsModel.hasLyrics()) {
      if (force) renderLyrics();
      return;
    }

    syncedLyricsModel.setPlayback({
      trackUri: state.trackUri,
      progressMs: getInterpolatedProgressMs(),
      durationMs: currentDuration,
      isPlaying: lastIsPlaying,
      updatedAt: Date.now(),
    });

    if (force) {
      renderLyrics();
      return;
    }

    if (syncedLyricsModel.refreshActiveLineIndex()) {
      updateSyncedLyricsPresentation(true);
    }
  }

  function tickProgress() {
    if (!state || !connected || !lastIsPlaying || !currentDuration) {
      animFrameId = null;
      return;
    }

    const interpolated = getInterpolatedProgressMs();
    const pct = currentDuration > 0 ? (interpolated / currentDuration) * 100 : 0;
    progressFill.style.width = `${pct}%`;
    compactProgressFill.style.width = `${pct}%`;
    progressTime.textContent = formatTime(interpolated);
    updateActiveLyricLine();
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

  prevBtn.addEventListener("click", () => sendToBackend({ type: "previous" }));
  nextBtn.addEventListener("click", () => sendToBackend({ type: "next" }));
  playPauseBtn.addEventListener("click", () => sendToBackend({ type: state?.isPlaying ? "pause" : "play" }));

  progressBar.addEventListener("click", (e) => {
    if (!currentDuration) return;
    const rect = progressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    sendToBackend({ type: "seek", positionMs: Math.round(pct * currentDuration) });
  });

  volumeSlider.addEventListener("input", () => {
    const percent = parseInt(volumeSlider.value, 10);
    if (volumeDebounce) clearTimeout(volumeDebounce);
    volumeDebounce = setTimeout(() => sendToBackend({ type: "set_volume", percent }), 160);
  });

  function update(playbackState: PlaybackState | null, isConnected: boolean) {
    state = playbackState;
    connected = isConnected;

    if (!isConnected || !playbackState) {
      compactStatus.textContent = isConnected ? "No playback" : "Connect Spotify";
      emptyState.style.display = "";
      emptyState.textContent = isConnected ? "Start playback to open the modern player." : "Connect Spotify in Settings to use the modern player.";
      hero.style.display = "none";
      progressRow.style.display = "none";
      lyricsSection.style.display = "none";
      controls.style.display = "none";
      volumeRow.style.display = "none";
      compactProgressFill.style.width = "0%";
      renderCompactArt(null);
      renderHeroArt(null);
      syncedLyricsModel.setPlayback(null);
      stopTicking();
      renderLyrics();
      return;
    }

    const artUrl = getTrackScopedArtUrl(playbackState.albumArtUrl, playbackState.trackUri);
    renderCompactArt(artUrl);
    renderHeroArt(artUrl);

    compactStatus.textContent = playbackState.isPlaying ? "Playing" : "Paused";
    const metadataSignature = `${playbackState.trackName}|${playbackState.artistName}|${playbackState.albumName}`;
    const metadataChanged = metadataSignature !== lastMetadataSignature;
    lastMetadataSignature = metadataSignature;
    trackName.setText(playbackState.trackName);
    artistName.setText(playbackState.artistName);
    albumName.setText(playbackState.albumName);
    hero.style.display = "grid";
    progressRow.style.display = "grid";
    lyricsSection.style.display = "grid";
    controls.style.display = "flex";
    volumeRow.style.display = "flex";
    emptyState.style.display = "none";

    currentDuration = playbackState.durationMs;
    lastProgressMs = playbackState.progressMs;
    lastUpdateTime = Date.now();
    lastIsPlaying = playbackState.isPlaying;
    syncedLyricsModel.setPlayback({
      trackUri: playbackState.trackUri,
      progressMs: playbackState.progressMs,
      durationMs: playbackState.durationMs,
      isPlaying: playbackState.isPlaying,
      updatedAt: lastUpdateTime,
    });
    playPauseBtn.innerHTML = playbackState.isPlaying ? ICON_PAUSE : ICON_PLAY;
    volumeSlider.value = String(playbackState.volume ?? Number(volumeSlider.value));

    const pct = playbackState.durationMs > 0 ? (playbackState.progressMs / playbackState.durationMs) * 100 : 0;
    progressFill.style.width = `${pct}%`;
    compactProgressFill.style.width = `${pct}%`;
    progressTime.textContent = formatTime(playbackState.progressMs);
    durationTime.textContent = formatTime(playbackState.durationMs);

    if (syncedLyricsModel.hasLyrics() && playbackState.trackUri === lyricsTrackUri) {
      if (syncedLyricEls.length === 0) renderLyrics();
      else updateActiveLyricLine();
    } else if (lyricsTrack.childElementCount === 0) {
      renderLyrics();
    }
    scheduleMarqueeRefresh(metadataChanged);
    if (playbackState.isPlaying) startTicking();
    else stopTicking();
  }

  function updateLyrics(trackUri: string | null, plainLyrics: string | null, syncedLyricsText: string | null, instrumental: boolean) {
    lyricsTrackUri = trackUri;
    const parsedSyncedLyrics = parseSyncedLyrics(syncedLyricsText);
    syncedLyricsModel.setLyrics(parsedSyncedLyrics);
    plainLyricLines = getCompactPlainLyricLines(plainLyrics);
    lyricsInstrumental = instrumental;
    lyricsLoading = false;
    updateActiveLyricLine(true);
  }

  function setLyricsLoading(loading: boolean) {
    lyricsLoading = loading;
    if (loading) {
      lyricsTrackUri = state?.trackUri ?? null;
      syncedLyricsModel.clear();
      plainLyricLines = [];
      lyricsInstrumental = false;
    }
    renderLyrics();
  }

  return {
    root,
    update,
    updateLyrics,
    setLyricsLoading,
    setCollapsedSize(size: number) {
      root.style.setProperty("--spotify-modern-widget-collapsed-size", `${size}px`);
    },
    setExpanded(expandedValue: boolean) {
      isExpandedState = expandedValue;
      root.dataset.expanded = String(expandedValue);
      scheduleMarqueeRefresh(true);
    },
    isExpanded() {
      return isExpandedState;
    },
    destroy() {
      stopTicking();
      stopAutoScrollTracking();
      if (volumeDebounce) clearTimeout(volumeDebounce);
      if (marqueeRefreshTimer) clearTimeout(marqueeRefreshTimer);
      if (marqueeRefreshTimerLate) clearTimeout(marqueeRefreshTimerLate);
      marqueeObserver.disconnect();
      compactArt.destroy();
      heroArt.destroy();
      root.remove();
    },
  };
}
