import type { PlaybackState } from "../types";

// SVG icons
const ICON_PREV = `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`;
const ICON_PLAY = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
const ICON_PAUSE = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
const ICON_NEXT = `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`;
const ICON_SHUFFLE = `<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`;
const ICON_REPEAT = `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`;
const ICON_REPEAT_ONE = `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>`;
const ICON_VOLUME = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;

export interface ControlsUI {
  root: HTMLElement;
  update(state: PlaybackState | null, connected: boolean): void;
  destroy(): void;
}

export function createControlsUI(
  sendToBackend: (msg: unknown) => void
): ControlsUI {
  const root = document.createElement("div");
  root.className = "spotify-section";

  const title = document.createElement("h3");
  title.className = "spotify-section-title";
  title.textContent = "Controls";
  root.appendChild(title);

  const controls = document.createElement("div");
  controls.className = "spotify-controls";

  function makeBtn(html: string, cls: string = ""): HTMLButtonElement {
    const b = document.createElement("button");
    b.className = `spotify-ctrl-btn ${cls}`.trim();
    b.innerHTML = html;
    return b;
  }

  const shuffleBtn = makeBtn(ICON_SHUFFLE);
  const prevBtn = makeBtn(ICON_PREV);
  const playPauseBtn = makeBtn(ICON_PLAY, "spotify-ctrl-btn-main");
  const nextBtn = makeBtn(ICON_NEXT);
  const repeatBtn = makeBtn(ICON_REPEAT);

  controls.appendChild(shuffleBtn);
  controls.appendChild(prevBtn);
  controls.appendChild(playPauseBtn);
  controls.appendChild(nextBtn);
  controls.appendChild(repeatBtn);
  root.appendChild(controls);

  // Volume row
  const volumeRow = document.createElement("div");
  volumeRow.className = "spotify-volume-row";

  const volumeIcon = document.createElement("span");
  volumeIcon.innerHTML = ICON_VOLUME;
  volumeIcon.style.cssText = "width:16px;height:16px;display:flex;align-items:center;color:var(--lumiverse-text-muted)";
  volumeIcon.querySelector("svg")!.style.cssText = "width:16px;height:16px;fill:currentColor";

  const volumeSlider = document.createElement("input");
  volumeSlider.type = "range";
  volumeSlider.className = "spotify-volume-slider";
  volumeSlider.min = "0";
  volumeSlider.max = "100";
  volumeSlider.value = "50";

  volumeRow.appendChild(volumeIcon);
  volumeRow.appendChild(volumeSlider);
  root.appendChild(volumeRow);

  // Event handlers
  let isPlaying = false;
  let currentRepeat: "off" | "context" | "track" = "off";

  prevBtn.addEventListener("click", () => sendToBackend({ type: "previous" }));
  nextBtn.addEventListener("click", () => sendToBackend({ type: "next" }));

  playPauseBtn.addEventListener("click", () => {
    sendToBackend({ type: isPlaying ? "pause" : "play" });
  });

  shuffleBtn.addEventListener("click", () => {
    sendToBackend({ type: "toggle_shuffle" });
  });

  repeatBtn.addEventListener("click", () => {
    const nextMode = currentRepeat === "off" ? "context" : currentRepeat === "context" ? "track" : "off";
    sendToBackend({ type: "set_repeat", mode: nextMode });
  });

  let volumeDebounce: ReturnType<typeof setTimeout> | null = null;
  volumeSlider.addEventListener("input", () => {
    if (volumeDebounce) clearTimeout(volumeDebounce);
    volumeDebounce = setTimeout(() => {
      sendToBackend({ type: "set_volume", percent: parseInt(volumeSlider.value, 10) });
    }, 200);
  });

  function update(state: PlaybackState | null, connected: boolean) {
    if (!connected) {
      root.style.display = "none";
      return;
    }
    root.style.display = "";

    if (!state) {
      isPlaying = false;
      playPauseBtn.innerHTML = ICON_PLAY;
      shuffleBtn.classList.remove("active");
      repeatBtn.classList.remove("active");
      repeatBtn.innerHTML = ICON_REPEAT;
      return;
    }

    isPlaying = state.isPlaying;
    playPauseBtn.innerHTML = isPlaying ? ICON_PAUSE : ICON_PLAY;

    shuffleBtn.classList.toggle("active", state.shuffleState);

    currentRepeat = state.repeatState;
    repeatBtn.classList.toggle("active", currentRepeat !== "off");
    repeatBtn.innerHTML = currentRepeat === "track" ? ICON_REPEAT_ONE : ICON_REPEAT;

    if (state.volume !== null) {
      volumeSlider.value = String(state.volume);
    }
  }

  return {
    root,
    update,
    destroy() {
      if (volumeDebounce) clearTimeout(volumeDebounce);
      root.remove();
    },
  };
}
