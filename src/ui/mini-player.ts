import type { PlaybackState, DeviceInfo } from "../types";
import { createCrossfadeArt } from "./crossfade-art";

const ICON_PREV = `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`;
const ICON_PLAY = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
const ICON_PAUSE = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
const ICON_NEXT = `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`;
const ICON_VOLUME = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
const ICON_EXPAND = `<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`;
const ICON_COLLAPSE = `<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>`;
const ICON_DEVICE = `<svg viewBox="0 0 24 24"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>`;

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export interface MiniPlayerUI {
  root: HTMLElement;
  update(state: PlaybackState | null, connected: boolean): void;
  setDevices(devices: DeviceInfo[]): void;
  toggle(): void;
  hide(): void;
  isOpen(): boolean;
  reposition(): void;
  destroy(): void;
}

interface Rect { x: number; y: number; w: number; h: number }

const POPUP_W = 280;
const GAP = 8;

export function createMiniPlayerUI(
  sendToBackend: (msg: unknown) => void,
  onExpandClick: () => void,
  getWidgetRect: () => Rect
): MiniPlayerUI {
  const root = document.createElement("div");
  root.className = "spotify-mini-player";

  // ─── Build DOM ─────────────────────────────────────────────────────

  const art = createCrossfadeArt("spotify-mini-art");

  const info = document.createElement("div");
  info.className = "spotify-mini-info";

  const trackName = document.createElement("div");
  trackName.className = "spotify-mini-track";

  const artistName = document.createElement("div");
  artistName.className = "spotify-mini-artist";

  info.appendChild(trackName);
  info.appendChild(artistName);

  const expandBtn = document.createElement("button");
  expandBtn.className = "spotify-mini-header-btn";
  expandBtn.innerHTML = ICON_EXPAND;
  expandBtn.title = "Open full player";

  const collapseBtn = document.createElement("button");
  collapseBtn.className = "spotify-mini-header-btn";
  collapseBtn.innerHTML = ICON_COLLAPSE;
  collapseBtn.title = "Collapse";

  const headerBtns = document.createElement("div");
  headerBtns.className = "spotify-mini-header-btns";
  headerBtns.appendChild(expandBtn);
  headerBtns.appendChild(collapseBtn);

  const progressRow = document.createElement("div");
  progressRow.className = "spotify-mini-progress-row";

  const progressTime = document.createElement("span");
  progressTime.className = "spotify-mini-time";

  const progressBar = document.createElement("div");
  progressBar.className = "spotify-mini-progress-bar";

  const progressFill = document.createElement("div");
  progressFill.className = "spotify-mini-progress-fill";
  progressBar.appendChild(progressFill);

  const durationTime = document.createElement("span");
  durationTime.className = "spotify-mini-time";

  progressRow.appendChild(progressTime);
  progressRow.appendChild(progressBar);
  progressRow.appendChild(durationTime);

  const controls = document.createElement("div");
  controls.className = "spotify-mini-controls";

  function makeBtn(html: string, cls: string = ""): HTMLButtonElement {
    const b = document.createElement("button");
    b.className = `spotify-mini-btn ${cls}`.trim();
    b.innerHTML = html;
    return b;
  }

  const prevBtn = makeBtn(ICON_PREV);
  const playPauseBtn = makeBtn(ICON_PLAY, "spotify-mini-btn-main");
  const nextBtn = makeBtn(ICON_NEXT);

  controls.appendChild(prevBtn);
  controls.appendChild(playPauseBtn);
  controls.appendChild(nextBtn);

  const volumeRow = document.createElement("div");
  volumeRow.className = "spotify-mini-volume-row";

  const volumeIcon = document.createElement("span");
  volumeIcon.className = "spotify-mini-volume-icon";
  volumeIcon.innerHTML = ICON_VOLUME;

  const volumeSlider = document.createElement("input");
  volumeSlider.type = "range";
  volumeSlider.className = "spotify-mini-volume-slider";
  volumeSlider.min = "0";
  volumeSlider.max = "100";
  volumeSlider.value = "50";

  volumeRow.appendChild(volumeIcon);
  volumeRow.appendChild(volumeSlider);

  // ─── Device row ──────────────────────────────────────────────────────

  const deviceRow = document.createElement("div");
  deviceRow.className = "spotify-mini-device-row";

  const deviceIcon = document.createElement("span");
  deviceIcon.className = "spotify-mini-device-icon";
  deviceIcon.innerHTML = ICON_DEVICE;

  const deviceName = document.createElement("span");
  deviceName.className = "spotify-mini-device-name";

  const deviceToggle = document.createElement("button");
  deviceToggle.className = "spotify-mini-device-toggle";
  deviceToggle.textContent = "Switch";

  deviceRow.appendChild(deviceIcon);
  deviceRow.appendChild(deviceName);
  deviceRow.appendChild(deviceToggle);

  const deviceList = document.createElement("div");
  deviceList.className = "spotify-mini-device-list";

  const emptyState = document.createElement("div");
  emptyState.className = "spotify-mini-empty";
  emptyState.textContent = "No active playback";

  const header = document.createElement("div");
  header.className = "spotify-mini-header";
  header.appendChild(art.el);
  header.appendChild(info);
  header.appendChild(headerBtns);

  root.appendChild(header);
  root.appendChild(progressRow);
  root.appendChild(controls);
  root.appendChild(volumeRow);
  root.appendChild(deviceRow);
  root.appendChild(deviceList);
  root.appendChild(emptyState);

  // ─── State & interpolation ─────────────────────────────────────────

  let isPlaying = false;
  let currentDuration = 0;
  let visible = false;
  let cachedPopupH = 0;

  let lastProgressMs = 0;
  let lastUpdateTime = 0;
  let lastIsPlaying = false;
  let animFrameId: number | null = null;

  function tickProgress() {
    if (!visible || !lastIsPlaying || !currentDuration) {
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

  // ─── Event handlers ────────────────────────────────────────────────

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sendToBackend({ type: "previous" });
  });
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sendToBackend({ type: "next" });
  });
  playPauseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sendToBackend({ type: isPlaying ? "pause" : "play" });
  });
  expandBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    hide();
    onExpandClick();
  });
  collapseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    hide();
  });

  progressBar.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!currentDuration) return;
    const rect = progressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    sendToBackend({ type: "seek", positionMs: Math.round(pct * currentDuration) });
  });

  let volumeDebounce: ReturnType<typeof setTimeout> | null = null;
  volumeSlider.addEventListener("input", (e) => {
    e.stopPropagation();
    if (volumeDebounce) clearTimeout(volumeDebounce);
    volumeDebounce = setTimeout(() => {
      sendToBackend({ type: "set_volume", percent: parseInt(volumeSlider.value, 10) });
    }, 200);
  });

  let deviceListOpen = false;
  let currentDeviceId: string | null = null;

  deviceToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (deviceListOpen) {
      deviceList.style.display = "none";
      deviceListOpen = false;
    } else {
      sendToBackend({ type: "get_devices" });
      deviceList.innerHTML = '<div class="spotify-mini-device-loading">Loading devices…</div>';
      deviceList.style.display = "flex";
      deviceListOpen = true;
    }
  });

  root.addEventListener("pointerdown", (e) => e.stopPropagation());

  function onDocClick(e: MouseEvent) {
    if (!root.contains(e.target as Node)) {
      hide();
    }
  }

  // ─── Positioning ───────────────────────────────────────────────────

  /**
   * Position the popup adjacent to the widget and set transform-origin
   * so the scale animation radiates from the widget's center.
   */
  function applyPosition() {
    const { x: ax, y: ay, w: aw, h: ah } = getWidgetRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Center popup horizontally on the widget, clamp to viewport
    let left = ax + aw / 2 - POPUP_W / 2;
    left = Math.max(GAP, Math.min(left, vw - POPUP_W - GAP));

    // Measure actual height by briefly making content visible
    root.style.left = `${left}px`;
    root.style.top = "0px";
    root.style.visibility = "hidden";
    root.style.transform = "scale(1)";
    root.style.display = "flex";

    const popupH = root.offsetHeight;
    cachedPopupH = popupH;

    root.style.visibility = "";
    root.style.transform = "";
    root.style.display = "";

    // Place above the widget if room, otherwise below
    let top: number;
    let below = false;

    if (ay - popupH - GAP >= GAP) {
      top = ay - popupH - GAP;
    } else {
      top = ay + ah + GAP;
      below = true;
    }
    top = Math.max(GAP, Math.min(top, vh - popupH - GAP));

    root.style.left = `${left}px`;
    root.style.top = `${top}px`;

    // transform-origin: the widget's center, relative to the popup's top-left
    const originX = ax + aw / 2 - left;
    const originY = below ? -GAP : popupH + GAP;
    root.style.transformOrigin = `${originX}px ${originY}px`;
  }

  /**
   * Lightweight reposition using cached height — no DOM measurement flicker.
   * Used to follow the widget during drag.
   */
  function repositionFast() {
    if (!visible || !cachedPopupH) return;

    const { x: ax, y: ay, w: aw, h: ah } = getWidgetRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = ax + aw / 2 - POPUP_W / 2;
    left = Math.max(GAP, Math.min(left, vw - POPUP_W - GAP));

    let top: number;
    let below = false;

    if (ay - cachedPopupH - GAP >= GAP) {
      top = ay - cachedPopupH - GAP;
    } else {
      top = ay + ah + GAP;
      below = true;
    }
    top = Math.max(GAP, Math.min(top, vh - cachedPopupH - GAP));

    root.style.left = `${left}px`;
    root.style.top = `${top}px`;

    const originX = ax + aw / 2 - left;
    const originY = below ? -GAP : cachedPopupH + GAP;
    root.style.transformOrigin = `${originX}px ${originY}px`;
  }

  // ─── Show / Hide ───────────────────────────────────────────────────

  function show() {
    if (!document.body.contains(root)) {
      document.body.appendChild(root);
    }

    applyPosition();

    // Ensure we start from scale(0), then animate to scale(1)
    root.classList.remove("open", "closing");
    root.offsetHeight; // reflow
    root.classList.add("open");

    visible = true;
    if (lastIsPlaying) startTicking();
    setTimeout(() => document.addEventListener("click", onDocClick), 0);
  }

  function hide() {
    if (!visible) return;
    visible = false;
    document.removeEventListener("click", onDocClick);
    stopTicking();

    // Re-query widget position so the collapse animates toward current location
    applyPosition();

    root.classList.remove("open");
    root.classList.add("closing");

    const cleanup = () => {
      root.classList.remove("closing");
      root.removeEventListener("transitionend", cleanup);
    };
    root.addEventListener("transitionend", cleanup);
    setTimeout(cleanup, 250);
  }

  function update(state: PlaybackState | null, connected: boolean) {
    if (!connected || !state) {
      header.style.display = "none";
      progressRow.style.display = "none";
      controls.style.display = "none";
      volumeRow.style.display = "none";
      deviceRow.style.display = "none";
      deviceList.style.display = "none";
      deviceListOpen = false;
      emptyState.style.display = "";
      emptyState.textContent = !connected
        ? "Connect to Spotify in Settings"
        : "No active playback";
      stopTicking();
      return;
    }

    header.style.display = "";
    progressRow.style.display = "";
    controls.style.display = "";
    volumeRow.style.display = "";
    emptyState.style.display = "none";

    if (state.deviceName) {
      deviceName.textContent = state.deviceName;
      deviceRow.style.display = "";
      currentDeviceId = state.deviceId;
    } else {
      deviceRow.style.display = "none";
    }

    trackName.textContent = state.trackName;
    artistName.textContent = state.artistName;
    currentDuration = state.durationMs;

    art.setUrl(state.albumArtUrl);

    isPlaying = state.isPlaying;
    lastIsPlaying = state.isPlaying;
    lastProgressMs = state.progressMs;
    lastUpdateTime = Date.now();
    playPauseBtn.innerHTML = isPlaying ? ICON_PAUSE : ICON_PLAY;

    const pct = state.durationMs > 0 ? (state.progressMs / state.durationMs) * 100 : 0;
    progressFill.style.width = `${pct}%`;
    progressTime.textContent = formatTime(state.progressMs);
    durationTime.textContent = formatTime(state.durationMs);

    if (state.volume !== null) {
      volumeSlider.value = String(state.volume);
    }

    if (visible && isPlaying) {
      startTicking();
    } else {
      stopTicking();
    }
  }

  function setDevices(devices: DeviceInfo[]) {
    deviceList.innerHTML = "";
    if (devices.length === 0) {
      deviceList.innerHTML = '<div class="spotify-mini-device-loading">No devices found</div>';
      return;
    }
    for (const dev of devices) {
      const item = document.createElement("div");
      item.className = `spotify-mini-device-item${dev.isActive ? " active" : ""}`;
      item.innerHTML = `<span class="spotify-mini-device-item-name">${dev.name}</span><span class="spotify-mini-device-item-type">${dev.type}</span>`;
      if (!dev.isActive) {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          sendToBackend({ type: "transfer_playback", deviceId: dev.id });
          deviceList.style.display = "none";
          deviceListOpen = false;
        });
      }
      deviceList.appendChild(item);
    }
  }

  return {
    root,
    update,
    setDevices,
    toggle() {
      if (visible) {
        hide();
      } else {
        show();
      }
    },
    hide,
    isOpen: () => visible,
    reposition: repositionFast,
    destroy() {
      hide();
      stopTicking();
      if (volumeDebounce) clearTimeout(volumeDebounce);
      root.remove();
    },
  };
}
