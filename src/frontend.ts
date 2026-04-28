import type { SpindleFrontendContext } from "lumiverse-spindle-types";
import type { BackendToFrontend, PlaybackState, WidgetPrefs, AlbumColors, MiniPlayerStyle } from "./types";
import { PANEL_CSS } from "./ui/styles";
import { createSettingsUI } from "./ui/settings";
import { createNowPlayingUI } from "./ui/now-playing";
import { createControlsUI } from "./ui/controls";
import { createSearchUI } from "./ui/search";
import { createMiniPlayerUI } from "./ui/mini-player";
import { createCrossfadeArt, getTrackScopedArtUrl } from "./ui/crossfade-art";
import { createLyricsUI } from "./ui/lyrics";

const SPOTIFY_ICON_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.224-2.719a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.517.781.781 0 01.517-.972c3.632-1.102 8.147-.568 11.236 1.327a.78.78 0 01.257 1.071zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.936.936 0 11-.543-1.791c3.532-1.072 9.404-.865 13.115 1.338a.936.936 0 01-.954 1.613z"/></svg>`;
const MUSIC_NOTE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;

export function setup(ctx: SpindleFrontendContext) {
  const cleanups: (() => void)[] = [];

  // Add styles
  const removeStyle = ctx.dom.addStyle(PANEL_CSS);
  cleanups.push(removeStyle);

  // State
  let currentState: PlaybackState | null = null;
  let connected = false;

  // Widget preferences
  type ArtShape = "circle" | "squircle";
  type SizeMode = "small" | "medium" | "large" | "custom";
  const SIZE_PRESETS: Record<Exclude<SizeMode, "custom">, number> = { small: 36, medium: 48, large: 64 };
  const PREFS_KEY = "spotify-controls-widget-prefs";

  function normalizeWidgetPrefs(prefs?: Partial<WidgetPrefs> | null): WidgetPrefs {
    const size = typeof prefs?.size === "number" && prefs.size >= 24 && prefs.size <= 128 ? prefs.size : 48;
    let sizeMode = prefs?.sizeMode;
    if (sizeMode !== "small" && sizeMode !== "medium" && sizeMode !== "large" && sizeMode !== "custom") {
      if (size === 36) sizeMode = "small";
      else if (size === 64) sizeMode = "large";
      else if (size !== 48) sizeMode = "custom";
      else sizeMode = "medium";
    }

    return {
      size,
      shape: prefs?.shape === "squircle" ? "squircle" : "circle",
      sizeMode,
      miniPlayerStyle: prefs?.miniPlayerStyle === "modern" ? "modern" : "default",
      x: typeof prefs?.x === "number" ? prefs.x : undefined,
      y: typeof prefs?.y === "number" ? prefs.y : undefined,
    };
  }

  let currentWidgetSize = 48;
  let currentArtShape: ArtShape = "circle";
  let currentSizeMode: SizeMode = "medium";
  let currentMiniPlayerStyle: MiniPlayerStyle = "default";
  let savedX: number | undefined;
  let savedY: number | undefined;
  try {
    const saved = normalizeWidgetPrefs(JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"));
    currentWidgetSize = saved.size;
    currentArtShape = saved.shape;
    currentSizeMode = saved.sizeMode;
    currentMiniPlayerStyle = saved.miniPlayerStyle;
    savedX = saved.x;
    savedY = saved.y;
  } catch {}
  let lastKnownPos: { x: number; y: number } | null = null;

  function saveWidgetPrefs() {
    const pos = lastKnownPos ?? widget.getPosition();
    const prefs: WidgetPrefs = {
      size: currentWidgetSize,
      shape: currentArtShape,
      sizeMode: currentSizeMode,
      miniPlayerStyle: currentMiniPlayerStyle,
      x: pos.x,
      y: pos.y,
    };
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    sendToBackend({ type: "save_widget_prefs", prefs });
  }

  let savePositionTimer: ReturnType<typeof setTimeout> | null = null;
  function debounceSavePosition(pos: { x: number; y: number }) {
    lastKnownPos = pos;
    if (savePositionTimer) clearTimeout(savePositionTimer);
    savePositionTimer = setTimeout(saveWidgetPrefs, 500);
  }

  // Use a loopback redirect URI so Spotify app setup does not depend on the
  // browser origin (LAN IP, cloud hostname, phone, etc.). Non-origin clients can
  // paste the failed loopback callback URL back into settings to finish auth.
  function getServerBaseUrl(): string {
    const { port } = window.location;
    return `http://127.0.0.1${port ? `:${port}` : ""}`;
  }

  // Send helper
  function sendToBackend(msg: unknown) {
    ctx.sendToBackend(msg);
  }

  // ─── Album art color extraction (for theme) ──────────────────────────

  let lastThemeArtUrl: string | null = null;
  let themeApplySeq = 0;
  let pendingThemeClearTimer: ReturnType<typeof setTimeout> | null = null;

  function cancelPendingThemeClear() {
    if (pendingThemeClearTimer) {
      clearTimeout(pendingThemeClearTimer);
      pendingThemeClearTimer = null;
    }
  }

  function clearAlbumTheme() {
    cancelPendingThemeClear();
    themeApplySeq += 1;
    sendToBackend({ type: "album_colors", colors: null });
  }

  // Spotify can briefly report no active playback while transitioning between
  // tracks/devices. Delay theme clearing so we do not flash back to the base
  // app theme during those short gaps.
  function scheduleAlbumThemeClear(delayMs = 1800) {
    cancelPendingThemeClear();
    pendingThemeClearTimer = setTimeout(() => {
      pendingThemeClearTimer = null;
      clearAlbumTheme();
    }, delayMs);
  }

  function extractColorsFromImage(url: string): Promise<AlbumColors | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const S = 32;
          canvas.width = S;
          canvas.height = S;
          const c = canvas.getContext("2d");
          if (!c) { resolve(null); return; }
          c.drawImage(img, 0, 0, S, S);
          const px = c.getImageData(0, 0, S, S).data;

          let bestH = 0, bestS = 0, bestL = 0.5, bestScore = -1;
          let rTotal = 0, gTotal = 0, bTotal = 0, n = 0;

          for (let i = 0; i < px.length; i += 4) {
            const r = px[i], g = px[i + 1], b = px[i + 2];
            rTotal += r; gTotal += g; bTotal += b; n++;

            const rn = r / 255, gn = g / 255, bn = b / 255;
            const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
            const l = (max + min) / 2;
            let h = 0, s = 0;
            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
              else if (max === gn) h = ((bn - rn) / d + 2) / 6;
              else h = ((rn - gn) / d + 4) / 6;
            }
            // Prefer saturated, mid-lightness colors for the dominant pick
            const score = s * (1 - Math.abs(l - 0.5) * 1.6);
            if (score > bestScore) {
              bestScore = score; bestH = h; bestS = s; bestL = l;
            }
          }

          const avgR = Math.round(rTotal / n);
          const avgG = Math.round(gTotal / n);
          const avgB = Math.round(bTotal / n);
          const luminance = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;

          resolve({
            dominant: { r: avgR, g: avgG, b: avgB },
            dominantHsl: {
              h: Math.round(bestH * 360),
              s: Math.round(bestS * 100),
              l: Math.round(bestL * 100),
            },
            isLight: luminance > 152,
          });
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
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
    title: "Spotify Controls",
    shortName: "Spotify",
    description: "Control Spotify playback, search for music, and view lyrics",
    keywords: ["music", "player", "now playing", "song", "track", "album", "lyrics"],
    headerTitle: "Spotify",
    iconSvg: SPOTIFY_ICON_SVG,
  });
  cleanups.push(() => tab.destroy());

  const panel = document.createElement("div");
  panel.className = "spotify-panel";
  tab.root.classList.add("spotify-tab-root");
  tab.root.appendChild(panel);

  function updateTabHeight() {
    const top = tab.root.getBoundingClientRect().top;
    const parentBottom = tab.root.parentElement?.getBoundingClientRect().bottom ?? window.innerHeight;
    const viewportBottom = window.visualViewport?.height ?? window.innerHeight;
    const bottom = Math.min(parentBottom, viewportBottom);
    tab.root.style.setProperty("--spotify-tab-height", `${Math.max(240, bottom - top - 2)}px`);
  }
  updateTabHeight();
  const tabHeightObserver = new ResizeObserver(updateTabHeight);
  tabHeightObserver.observe(tab.root);
  window.addEventListener("resize", updateTabHeight);
  cleanups.push(() => {
    tabHeightObserver.disconnect();
    window.removeEventListener("resize", updateTabHeight);
  });

  // Create UI sections (no settings here — it's in the settings mount)
  const nowPlayingUI = createNowPlayingUI((positionMs) => {
    sendToBackend({ type: "seek", positionMs });
  });
  const controlsUI = createControlsUI(sendToBackend);
  const searchUI = createSearchUI(sendToBackend);
  const lyricsUI = createLyricsUI((positionMs) => {
    sendToBackend({ type: "seek", positionMs });
  });

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
    widget.root.style.touchAction = "none";
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
  widget.onDragEnd((pos) => debounceSavePosition(pos));
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
  miniPlayer.setStyle(currentMiniPlayerStyle);
  cleanups.push(() => miniPlayer.destroy());

  // Sync volume between drawer controls and mini player
  controlsUI.onVolumeChange((pct) => miniPlayer.setVolume(pct));
  miniPlayer.onVolumeChange((pct) => controlsUI.setVolume(pct));

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
        { key: "div2", label: "", type: "divider" },
        { key: "mini-default", label: "Default Mini Player", active: currentMiniPlayerStyle === "default" },
        { key: "mini-modern", label: "Modern Lyrics Mini Player", active: currentMiniPlayerStyle === "modern" },
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
    } else if (selectedKey === "mini-default" || selectedKey === "mini-modern") {
      currentMiniPlayerStyle = selectedKey === "mini-modern" ? "modern" : "default";
      miniPlayer.setStyle(currentMiniPlayerStyle);
      saveWidgetPrefs();
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
  });

  widgetContent.addEventListener("touchmove", (e) => {
    if (!longPressTimer) return;
    const touch = e.touches[0];
    if (Math.abs(touch.clientX - longPressStart.x) > 10 || Math.abs(touch.clientY - longPressStart.y) > 10) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  });

  widgetContent.addEventListener("touchend", (e) => {
    // Always prevent default to block synthetic click/mouse events from
    // reaching elements underneath the floating widget on mobile.
    e.preventDefault();
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    if (longPressFired) { longPressFired = false; return; }
    // Since we block the browser's click generation, handle taps here
    if (!didDrag) {
      miniPlayer.toggle();
    }
    didDrag = false;
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
    widget.onDragEnd((pos) => debounceSavePosition(pos));
    clampWidgetPosition();
  }

  widgetContent.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY);
  });

  function updateWidget(state: PlaybackState | null) {
    const artUrl = getTrackScopedArtUrl(state?.albumArtUrl ?? null, state?.trackUri);
    if (artUrl) {
      widgetIcon.style.display = "none";
      widgetArt.el.style.display = "";
      widgetArt.setUrl(artUrl);
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
        lyricsUI.updatePlayback(currentState);
        updateWidget(currentState);
        scheduleTrackEndRefresh(currentState);
        // Extract album art colors for theme when art changes
        const artUrl = getTrackScopedArtUrl(currentState?.albumArtUrl ?? null, currentState?.trackUri);
        if (artUrl !== lastThemeArtUrl) {
          lastThemeArtUrl = artUrl;
          if (artUrl) {
            cancelPendingThemeClear();
            const applySeq = ++themeApplySeq;
            extractColorsFromImage(artUrl).then((colors) => {
              if (applySeq !== themeApplySeq || artUrl !== lastThemeArtUrl) return;
              if (colors) {
                sendToBackend({ type: "album_colors", colors });
              } else if (!connected) {
                clearAlbumTheme();
              }
            });
          } else {
            if (connected) scheduleAlbumThemeClear();
            else clearAlbumTheme();
          }
        }
        // Fetch lyrics when track changes
        const trackUri = currentState?.trackUri || null;
        if (trackUri && trackUri !== lastLyricsTrackUri) {
          lastLyricsTrackUri = trackUri;
          lyricsUI.setLoading(true);
          miniPlayer.setLyricsLoading(true);
          sendToBackend({ type: "get_lyrics" });
        } else if (!trackUri && lastLyricsTrackUri) {
          lastLyricsTrackUri = null;
          lyricsUI.clear();
          miniPlayer.updateLyrics(null, null, null, false);
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
        const p = normalizeWidgetPrefs(msg.prefs);
        if (!p) break;
        const sizeChanged = p.size !== currentWidgetSize;
        const anyChanged = sizeChanged || p.shape !== currentArtShape || p.sizeMode !== currentSizeMode || p.miniPlayerStyle !== currentMiniPlayerStyle;
        currentArtShape = p.shape;
        currentSizeMode = p.sizeMode;
        currentMiniPlayerStyle = p.miniPlayerStyle;
        miniPlayer.setStyle(currentMiniPlayerStyle);
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
        lastThemeArtUrl = null;
        clearAlbumTheme();
        settingsUI.update(false, "");
        nowPlayingUI.update(null, false);
        controlsUI.update(null, false);
        miniPlayer.update(null, false);
        miniPlayer.updateLyrics(null, null, null, false);
        lyricsUI.clear();
        updateWidget(null);
        break;

      case "lyrics":
        if (msg.trackUri && msg.trackUri !== lastLyricsTrackUri) break;
        lyricsUI.update(msg.trackUri, msg.plainLyrics, msg.syncedLyrics, msg.instrumental);
        lyricsUI.updatePlayback(currentState);
        miniPlayer.updateLyrics(msg.trackUri, msg.plainLyrics, msg.syncedLyrics, msg.instrumental);
        break;

      case "error":
        console.warn("[Spotify Controls]", msg.message);
        break;
    }
  });
  cleanups.push(msgUnsub);

  // ─── Permission gate (real-time) ─────────────────────────────────────
  // SPINDLE_PERMISSION_CHANGED is broadcast on the event bus with an
  // extensionId — scope to our own identifier so we ignore other extensions.

  const permUnsub = ctx.events.on("SPINDLE_PERMISSION_CHANGED", (payload: unknown) => {
    const detail = payload as { extensionId: string; permission: string; granted: boolean };
    if (detail.extensionId !== ctx.manifest.identifier) return;
    if (detail.permission !== "cors_proxy") return;

    if (detail.granted) {
      sendToBackend({ type: "get_config" });
      sendToBackend({ type: "get_state" });
    } else {
      currentState = null;
      connected = false;
      clearAlbumTheme();
      nowPlayingUI.update(null, false);
      controlsUI.update(null, false);
      miniPlayer.update(null, false);
      updateWidget(null);
    }
  });
  cleanups.push(permUnsub);

  // Prompt once on startup if the permission hasn't been granted yet
  ctx.permissions.getGranted().then((granted) => {
    if (granted.includes("cors_proxy")) return;
    ctx.ui
      .showConfirm({
        title: "Permission Required",
        message:
          "Spotify Controls needs the CORS Proxy permission to communicate with the Spotify and Last.fm APIs on your behalf.",
        variant: "info",
        confirmLabel: "Grant Permission",
        cancelLabel: "Not Now",
      })
      .then(({ confirmed }) => {
        if (confirmed) {
          ctx.permissions.request(["cors_proxy"]);
        }
      });
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
