import type { SpindleFrontendContext } from "lumiverse-spindle-types";
import type { BackendToFrontend, PlaybackState, WidgetPrefs } from "./types";
import { PANEL_CSS } from "./ui/styles";
import { createSettingsUI } from "./ui/settings";
import { createNowPlayingUI } from "./ui/now-playing";
import { createControlsUI } from "./ui/controls";
import { createSearchUI } from "./ui/search";
import { createMiniPlayerUI } from "./ui/mini-player";
import { createCrossfadeArt } from "./ui/crossfade-art";
import { createLyricsUI } from "./ui/lyrics";
import { createPermissionModal, PERMISSION_MODAL_CSS } from "./ui/permission-modal";

const SPOTIFY_ICON_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.224-2.719a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.517.781.781 0 01.517-.972c3.632-1.102 8.147-.568 11.236 1.327a.78.78 0 01.257 1.071zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.936.936 0 11-.543-1.791c3.532-1.072 9.404-.865 13.115 1.338a.936.936 0 01-.954 1.613z"/></svg>`;
const MUSIC_NOTE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;

export function setup(ctx: SpindleFrontendContext) {
  const cleanups: (() => void)[] = [];

  // Add styles
  const removeStyle = ctx.dom.addStyle(PANEL_CSS + PERMISSION_MODAL_CSS);
  cleanups.push(removeStyle);

  // State
  let currentState: PlaybackState | null = null;
  let connected = false;

  // Widget preferences
  type ArtShape = "circle" | "squircle";
  type SizeMode = "small" | "medium" | "large" | "custom";
  const SIZE_PRESETS: Record<Exclude<SizeMode, "custom">, number> = { small: 36, medium: 48, large: 64 };
  const PREFS_KEY = "spotify-controls-widget-prefs";
  let currentWidgetSize = 48;
  let currentArtShape: ArtShape = "circle";
  let currentSizeMode: SizeMode = "medium";
  let savedX: number | undefined;
  let savedY: number | undefined;
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
    if (typeof saved.size === "number" && saved.size >= 24 && saved.size <= 128) currentWidgetSize = saved.size;
    if (saved.shape === "circle" || saved.shape === "squircle") currentArtShape = saved.shape;
    if (["small", "medium", "large", "custom"].includes(saved.sizeMode)) {
      currentSizeMode = saved.sizeMode;
    } else {
      // Infer mode from saved size for backward compat
      if (currentWidgetSize === 36) currentSizeMode = "small";
      else if (currentWidgetSize === 64) currentSizeMode = "large";
      else if (currentWidgetSize !== 48) currentSizeMode = "custom";
    }
    if (typeof saved.x === "number") savedX = saved.x;
    if (typeof saved.y === "number") savedY = saved.y;
  } catch {}
  function saveWidgetPrefs() {
    const pos = widget.getPosition();
    const prefs: WidgetPrefs = { size: currentWidgetSize, shape: currentArtShape, sizeMode: currentSizeMode, x: pos.x, y: pos.y };
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    sendToBackend({ type: "save_widget_prefs", prefs });
  }

  let savePositionTimer: ReturnType<typeof setTimeout> | null = null;
  function debounceSavePosition() {
    if (savePositionTimer) clearTimeout(savePositionTimer);
    savePositionTimer = setTimeout(saveWidgetPrefs, 500);
  }

  // Server base URL helper — Spotify rejects "localhost" in redirect URIs;
  // use the IPv4 loopback 127.0.0.1 instead for local development.
  function getServerBaseUrl(): string {
    const origin = window.location.origin;
    if (new URL(origin).hostname === "localhost") {
      return origin.replace("://localhost", "://127.0.0.1");
    }
    return origin;
  }

  // Send helper
  function sendToBackend(msg: unknown) {
    ctx.sendToBackend(msg);
  }

  // ─── Settings (in settings_extensions mount) ──────────────────────────

  const settingsMount = ctx.ui.mount("settings_extensions");
  const settingsUI = createSettingsUI(sendToBackend, getServerBaseUrl);
  settingsMount.appendChild(settingsUI.root);
  cleanups.push(() => settingsUI.destroy());

  // Custom widget size field in settings
  const settingsBody = settingsUI.root.querySelector(".spotify-settings-card-body");
  if (settingsBody) {
    const widgetDivider = document.createElement("div");
    widgetDivider.style.cssText = "height:1px;background:var(--lumiverse-border);margin:4px 0";
    settingsBody.appendChild(widgetDivider);

    const widgetSizeLabel = document.createElement("label");
    widgetSizeLabel.className = "spotify-settings-label";
    widgetSizeLabel.textContent = "Custom Widget Size (px)";

    const widgetSizeRow = document.createElement("div");
    widgetSizeRow.className = "spotify-settings-row";

    const widgetSizeInput = document.createElement("input");
    widgetSizeInput.className = "spotify-input";
    widgetSizeInput.type = "number";
    widgetSizeInput.min = "24";
    widgetSizeInput.max = "128";
    widgetSizeInput.style.width = "80px";
    widgetSizeInput.value = currentSizeMode === "custom" ? String(currentWidgetSize) : "";
    widgetSizeInput.placeholder = "e.g. 56";

    const widgetSizeBtn = document.createElement("button");
    widgetSizeBtn.className = "spotify-btn spotify-btn-primary";
    widgetSizeBtn.textContent = "Apply";
    widgetSizeBtn.style.fontSize = "0.85em";
    widgetSizeBtn.style.padding = "4px 12px";
    widgetSizeBtn.addEventListener("click", () => {
      const val = parseInt(widgetSizeInput.value, 10);
      if (isNaN(val) || val < 24 || val > 128) return;
      currentSizeMode = "custom";
      recreateWidget(val);
    });

    widgetSizeRow.appendChild(widgetSizeInput);
    widgetSizeRow.appendChild(widgetSizeBtn);
    widgetSizeLabel.appendChild(widgetSizeRow);
    settingsBody.appendChild(widgetSizeLabel);
  }

  // ─── Drawer Tab ──────────────────────────────────────────────────────

  const tab = ctx.ui.registerDrawerTab({
    id: "spotify",
    title: "Spotify",
    iconSvg: SPOTIFY_ICON_SVG,
  });
  cleanups.push(() => tab.destroy());

  const panel = document.createElement("div");
  panel.className = "spotify-panel";
  tab.root.appendChild(panel);

  // Create UI sections (no settings here — it's in the settings mount)
  const nowPlayingUI = createNowPlayingUI((positionMs) => {
    sendToBackend({ type: "seek", positionMs });
  });
  const controlsUI = createControlsUI(sendToBackend);
  const searchUI = createSearchUI(sendToBackend);
  const lyricsUI = createLyricsUI();

  panel.appendChild(nowPlayingUI.root);
  panel.appendChild(controlsUI.root);
  panel.appendChild(searchUI.root);
  panel.appendChild(lyricsUI.root);

  cleanups.push(
    () => nowPlayingUI.destroy(),
    () => controlsUI.destroy(),
    () => searchUI.destroy(),
    () => lyricsUI.destroy()
  );

  let lastLyricsTrackUri: string | null = null;

  // ─── Float Widget + Mini Player ──────────────────────────────────────

  let widget = ctx.ui.createFloatWidget({
    width: currentWidgetSize,
    height: currentWidgetSize,
    tooltip: "Spotify",
    chromeless: true,
  });
  cleanups.push(() => widget.destroy());

  const widgetContent = document.createElement("div");
  widgetContent.className = "spotify-float-widget";

  const widgetIcon = document.createElement("div");
  widgetIcon.className = "spotify-float-widget-icon";
  widgetIcon.innerHTML = MUSIC_NOTE_SVG;

  const widgetArt = createCrossfadeArt("spotify-float-widget-art");
  widgetArt.el.style.display = "none";

  widgetContent.appendChild(widgetIcon);
  widgetContent.appendChild(widgetArt.el);
  widget.root.appendChild(widgetContent);

  function applyWidgetStyle() {
    const radius = currentArtShape === "circle" ? "50%" : "22%";
    // Ensure both the framework container and inner content match the target size
    widget.root.style.width = `${currentWidgetSize}px`;
    widget.root.style.height = `${currentWidgetSize}px`;
    widgetContent.style.width = `${currentWidgetSize}px`;
    widgetContent.style.height = `${currentWidgetSize}px`;
    widgetContent.style.borderRadius = radius;
    const iconSize = Math.round(currentWidgetSize * 0.5);
    const iconSvg = widgetIcon.querySelector("svg");
    if (iconSvg) {
      (iconSvg as SVGElement).style.width = `${iconSize}px`;
      (iconSvg as SVGElement).style.height = `${iconSize}px`;
    }
  }
  applyWidgetStyle();
  widget.onDragEnd(() => debounceSavePosition());
  if (savedX !== undefined && savedY !== undefined) {
    widget.moveTo(savedX, savedY);
  }

  function clampWidgetPosition() {
    const pos = widget.getPosition();
    const pad = 12;
    const maxX = window.innerWidth - currentWidgetSize - pad;
    const maxY = window.innerHeight - currentWidgetSize - pad;
    const clampedX = Math.max(pad, Math.min(pos.x, maxX));
    const clampedY = Math.max(pad, Math.min(pos.y, maxY));
    if (clampedX !== pos.x || clampedY !== pos.y) {
      widget.moveTo(clampedX, clampedY);
    }
  }

  window.addEventListener("resize", clampWidgetPosition);
  cleanups.push(() => window.removeEventListener("resize", clampWidgetPosition));

  const miniPlayer = createMiniPlayerUI(
    sendToBackend,
    () => tab.activate(),
    () => {
      const rect = widget.root.getBoundingClientRect();
      return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
    }
  );
  cleanups.push(() => miniPlayer.destroy());

  // Track drag state so we don't open the mini player when releasing a drag
  let didDrag = false;
  let pointerStartPos = { x: 0, y: 0 };
  const DRAG_THRESHOLD = 5;

  widgetContent.addEventListener("pointerdown", (e) => {
    didDrag = false;
    pointerStartPos = { x: e.clientX, y: e.clientY };

    // Follow the widget with the mini player during drag
    if (miniPlayer.isOpen()) {
      let dragRaf: number | null = null;
      const onDragMove = () => {
        if (didDrag && dragRaf === null) {
          dragRaf = requestAnimationFrame(() => {
            miniPlayer.reposition();
            dragRaf = null;
          });
        }
      };
      const onDragEnd = () => {
        document.removeEventListener("pointermove", onDragMove);
        if (dragRaf !== null) cancelAnimationFrame(dragRaf);
      };
      document.addEventListener("pointermove", onDragMove);
      document.addEventListener("pointerup", onDragEnd, { once: true });
    }
  });

  widgetContent.addEventListener("pointermove", (e) => {
    if (!didDrag) {
      const dx = Math.abs(e.clientX - pointerStartPos.x);
      const dy = Math.abs(e.clientY - pointerStartPos.y);
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        didDrag = true;
      }
    }
  });

  widgetContent.addEventListener("pointerup", () => {
    requestAnimationFrame(clampWidgetPosition);
  });

  widgetContent.addEventListener("click", (e) => {
    if (didDrag) {
      e.stopPropagation();
      didDrag = false;
      return;
    }
    e.stopPropagation();
    miniPlayer.toggle();
  });

  // ─── Context Menu (via Spindle API — themed, works on mobile via long-press) ─

  async function showContextMenu(x: number, y: number) {
    const { selectedKey } = await ctx.ui.showContextMenu({
      position: { x, y },
      items: [
        { key: "small", label: "Small", active: currentSizeMode === "small" },
        { key: "medium", label: "Medium", active: currentSizeMode === "medium" },
        { key: "large", label: "Large", active: currentSizeMode === "large" },
        { key: "custom", label: "Custom…", active: currentSizeMode === "custom" },
        { key: "div", label: "", type: "divider" },
        { key: "circle", label: "Circle", active: currentArtShape === "circle" },
        { key: "squircle", label: "Squircle", active: currentArtShape === "squircle" },
      ],
    });

    if (!selectedKey) return;

    if (selectedKey === "small" || selectedKey === "medium" || selectedKey === "large") {
      currentSizeMode = selectedKey;
      recreateWidget(SIZE_PRESETS[selectedKey]);
    } else if (selectedKey === "custom") {
      ctx.events.emit("open-settings", { view: "extensions" });
    } else if (selectedKey === "circle" || selectedKey === "squircle") {
      currentArtShape = selectedKey;
      saveWidgetPrefs();
      applyWidgetStyle();
    }
  }

  // Long-press detection for mobile
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let longPressFired = false;
  let longPressStart = { x: 0, y: 0 };

  widgetContent.addEventListener("touchstart", (e) => {
    longPressFired = false;
    const touch = e.touches[0];
    longPressStart = { x: touch.clientX, y: touch.clientY };
    longPressTimer = setTimeout(() => {
      longPressFired = true;
      navigator.vibrate?.(50);
      showContextMenu(touch.clientX, touch.clientY);
    }, 500);
  }, { passive: true });

  widgetContent.addEventListener("touchmove", (e) => {
    if (!longPressTimer) return;
    const touch = e.touches[0];
    if (Math.abs(touch.clientX - longPressStart.x) > 10 || Math.abs(touch.clientY - longPressStart.y) > 10) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }, { passive: true });

  widgetContent.addEventListener("touchend", (e) => {
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    if (longPressFired) { e.preventDefault(); longPressFired = false; }
  });

  function recreateWidget(newSize: number) {
    miniPlayer.hide();
    const pos = widget.getPosition();
    widget.destroy();

    currentWidgetSize = newSize;
    saveWidgetPrefs();

    widget = ctx.ui.createFloatWidget({
      width: newSize,
      height: newSize,
      tooltip: "Spotify",
      chromeless: true,
    });

    applyWidgetStyle();
    widget.root.appendChild(widgetContent);
    widget.moveTo(pos.x, pos.y);
    widget.onDragEnd(() => debounceSavePosition());
    clampWidgetPosition();
  }

  widgetContent.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY);
  });

  function updateWidget(state: PlaybackState | null) {
    if (state?.albumArtUrl) {
      widgetIcon.style.display = "none";
      widgetArt.el.style.display = "";
      widgetArt.setUrl(state.albumArtUrl);
    } else {
      widgetIcon.style.display = "";
      widgetArt.el.style.display = "none";
      widgetArt.setUrl(null);
    }
  }

  // ─── Tag Interceptor ─────────────────────────────────────────────────

  const tagUnsub = ctx.messages.registerTagInterceptor(
    { tagName: "spotify-search" },
    (payload) => {
      const query = payload.attrs.query;
      if (!query) return;

      // Trigger search — results will appear in the drawer tab search section
      sendToBackend({ type: "search", query });
    }
  );
  cleanups.push(tagUnsub);

  // ─── Track-end anticipation ─────────────────────────────────────────
  // When a track is playing, schedule a state refresh for when it should
  // end so track transitions are caught quickly without constant polling.
  let trackEndTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleTrackEndRefresh(state: PlaybackState | null) {
    if (trackEndTimer) {
      clearTimeout(trackEndTimer);
      trackEndTimer = null;
    }
    if (!state || !state.isPlaying || state.durationMs <= 0) return;
    const remaining = state.durationMs - state.progressMs;
    if (remaining <= 0) return;
    // Fire slightly after the track should end to give Spotify time to advance
    trackEndTimer = setTimeout(() => {
      trackEndTimer = null;
      sendToBackend({ type: "get_state" });
    }, remaining + 500);
  }
  cleanups.push(() => { if (trackEndTimer) clearTimeout(trackEndTimer); });

  // ─── Backend Messages ────────────────────────────────────────────────

  const msgUnsub = ctx.onBackendMessage((raw) => {
    const msg = raw as BackendToFrontend;

    switch (msg.type) {
      case "state": {
        currentState = msg.playbackState;
        connected = msg.connected;
        nowPlayingUI.update(currentState, connected);
        controlsUI.update(currentState, connected);
        miniPlayer.update(currentState, connected);
        updateWidget(currentState);
        scheduleTrackEndRefresh(currentState);
        // Fetch lyrics when track changes
        const trackUri = currentState?.trackUri || null;
        if (trackUri && trackUri !== lastLyricsTrackUri) {
          lastLyricsTrackUri = trackUri;
          lyricsUI.setLoading(true);
          sendToBackend({ type: "get_lyrics" });
        } else if (!trackUri && lastLyricsTrackUri) {
          lastLyricsTrackUri = null;
          lyricsUI.clear();
        }
        break;
      }

      case "config":
        settingsUI.update(msg.connected, msg.clientId, msg.hasSecret, msg.hasLastfmKey, msg.callbackUrl);
        connected = msg.connected;
        break;

      case "search_results":
        searchUI.setResults(msg.results);
        break;

      case "devices":
        miniPlayer.setDevices(msg.devices);
        break;

      case "widget_prefs": {
        const p = msg.prefs;
        if (!p) break;
        const sizeChanged = p.size !== currentWidgetSize;
        const anyChanged = sizeChanged || p.shape !== currentArtShape || p.sizeMode !== currentSizeMode;
        currentArtShape = p.shape;
        currentSizeMode = p.sizeMode;
        if (anyChanged) {
          localStorage.setItem(PREFS_KEY, JSON.stringify(p));
        }
        if (sizeChanged) {
          // Defer to avoid destroying/creating a widget while React is mid-render
          requestAnimationFrame(() => recreateWidget(p.size));
        } else {
          // Always re-apply styles so the framework container matches the
          // expected size even when stored values already agree.
          applyWidgetStyle();
        }
        // Restore saved position from backend (only on initial load — don't
        // override a position the user just dragged to)
        if (typeof p.x === "number" && typeof p.y === "number") {
          const cur = widget.getPosition();
          // Only apply if widget is still at its default position
          if (savedX === undefined && savedY === undefined && (cur.x !== p.x || cur.y !== p.y)) {
            widget.moveTo(p.x, p.y);
            clampWidgetPosition();
          }
        }
        break;
      }

      case "auth_url": {
        // Open in popup — fall back to redirect if popup is blocked
        const popup = window.open(
          msg.url,
          "spotify-auth",
          "width=500,height=700,menubar=no,toolbar=no"
        );
        if (!popup || popup.closed) {
          window.location.href = msg.url;
        }
        break;
      }

      case "connected":
        connected = true;
        sendToBackend({ type: "get_config" });
        sendToBackend({ type: "get_state" });
        break;

      case "disconnected":
        connected = false;
        currentState = null;
        settingsUI.update(false, "");
        nowPlayingUI.update(null, false);
        controlsUI.update(null, false);
        miniPlayer.update(null, false);
        updateWidget(null);
        break;

      case "lyrics":
        lyricsUI.update(msg.trackUri, msg.lyrics, msg.instrumental);
        break;

      case "error":
        console.warn("[Spotify Controls]", msg.message);
        break;
    }
  });
  cleanups.push(msgUnsub);

  // ─── Permission gate ─────────────────────────────────────────────────

  let permModal: ReturnType<typeof createPermissionModal> | null = null;

  ctx.permissions.getGranted().then((granted) => {
    if (granted.includes("cors_proxy")) return;

    permModal = createPermissionModal(
      async () => {
        await ctx.permissions.request(["cors_proxy"]);
        // Extension will restart after the grant — this is expected
      },
      () => {
        // User dismissed — they can still browse settings, just API calls won't work
        permModal = null;
      }
    );
    cleanups.push(() => permModal?.destroy());
  });

  // ─── Request initial state ───────────────────────────────────────────

  sendToBackend({ type: "get_config" });
  sendToBackend({ type: "get_state" });
  sendToBackend({ type: "get_widget_prefs" });

  // ─── Teardown ────────────────────────────────────────────────────────

  return () => {
    for (const fn of cleanups) {
      try {
        fn();
      } catch {
        // ignore cleanup errors
      }
    }
  };
}
