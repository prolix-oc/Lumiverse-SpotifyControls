// src/ui/styles.ts
var PANEL_CSS = `
@property --spotify-modern-marquee-left-fade {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

@property --spotify-modern-marquee-right-fade {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

.spotify-tab-root {
  display: flex;
  width: 100%;
  height: var(--spotify-tab-height, 100%);
  max-height: var(--spotify-tab-height, 100%);
  min-height: 0;
  overflow: hidden;
  overscroll-behavior: none;
}

.spotify-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 12px 0;
  flex: 1 1 auto;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--lumiverse-text);
}

.spotify-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.spotify-section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--lumiverse-text-muted);
  margin: 0;
}

/* Settings card (matches SimTracker pattern) */
.spotify-settings-card {
  width: 100%;
  border: 1px solid var(--lumiverse-border);
  border-radius: calc(var(--lumiverse-radius) + 2px);
  background: linear-gradient(180deg, var(--lumiverse-fill) 0%, var(--lumiverse-fill-subtle) 100%);
  color: var(--lumiverse-text);
  overflow: hidden;
}

.spotify-settings-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--lumiverse-border);
}

.spotify-settings-card-header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.spotify-settings-card-body {
  padding: 12px;
  display: grid;
  gap: 10px;
}

.spotify-settings-label {
  font-size: 11px;
  color: var(--lumiverse-text-muted);
  display: grid;
  gap: 5px;
}

.spotify-settings-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.spotify-input {
  width: 100%;
  padding: 6px 8px;
  background: var(--lumiverse-fill-subtle);
  border: 1px solid var(--lumiverse-border);
  border-radius: 8px;
  color: var(--lumiverse-text);
  font-size: 12px;
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--lumiverse-transition-fast);
}

.spotify-input:focus {
  border-color: var(--lumiverse-border-hover);
}

.spotify-btn {
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid var(--lumiverse-border);
  background: var(--lumiverse-fill-subtle);
  color: var(--lumiverse-text);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--lumiverse-transition-fast);
  white-space: nowrap;
}

.spotify-btn:hover {
  background: var(--lumiverse-fill);
  border-color: var(--lumiverse-border-hover);
}

.spotify-btn-primary {
  background: #1db954;
  border-color: #1db954;
  color: #fff;
}

.spotify-btn-primary:hover {
  background: #1ed760;
  border-color: #1ed760;
}

.spotify-btn-danger {
  border-color: #e74c3c;
  color: #e74c3c;
}

.spotify-btn-danger:hover {
  background: rgba(231, 76, 60, 0.1);
}

.spotify-status {
  font-size: 11px;
  color: var(--lumiverse-text-dim);
}

.spotify-status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.spotify-status-dot.connected {
  background: #1db954;
}

.spotify-status-dot.disconnected {
  background: #e74c3c;
}

/* Now Playing */
.spotify-now-playing {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px;
  background: var(--lumiverse-fill-subtle);
  border-radius: var(--lumiverse-radius);
  border: 1px solid var(--lumiverse-border);
}

.spotify-album-art {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--lumiverse-fill);
}

.spotify-track-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spotify-track-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-track-artist {
  font-size: 12px;
  color: var(--lumiverse-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-track-album {
  font-size: 11px;
  color: var(--lumiverse-text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-track-device {
  font-size: 10px;
  color: var(--lumiverse-text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.7;
}

/* Progress bar */
.spotify-progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--lumiverse-text-dim);
}

.spotify-progress-bar {
  flex: 1;
  height: 4px;
  background: var(--lumiverse-fill);
  border-radius: 2px;
  cursor: pointer;
  padding: 8px 0;
  background-clip: content-box;
  position: relative;
}

.spotify-progress-fill {
  position: absolute;
  top: 8px;
  left: 0;
  height: 4px;
  background: #1db954;
  border-radius: 2px;
  pointer-events: none;
}

/* Controls */
.spotify-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.spotify-ctrl-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--lumiverse-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--lumiverse-transition-fast);
  padding: 0;
}

.spotify-ctrl-btn:hover {
  background: var(--lumiverse-fill-subtle);
}

.spotify-ctrl-btn.active {
  color: #1db954;
}

.spotify-ctrl-btn-main {
  width: 56px;
  height: 56px;
  background: #1db954;
  color: #fff;
}

.spotify-ctrl-btn-main:hover {
  background: #1ed760;
}

.spotify-ctrl-btn svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.spotify-ctrl-btn-main svg {
  width: 26px;
  height: 26px;
}

/* Volume */
.spotify-volume-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 4px;
}

.spotify-volume-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: var(--lumiverse-fill-subtle);
  border: none;
  outline: none;
}

.spotify-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--lumiverse-primary);
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.spotify-volume-slider::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: var(--lumiverse-fill-subtle);
  border: none;
}

.spotify-volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--lumiverse-primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* Search */
.spotify-search-input {
  width: 100%;
  padding: 8px 12px;
  background: var(--lumiverse-fill);
  border: 1px solid var(--lumiverse-border);
  border-radius: var(--lumiverse-radius);
  color: var(--lumiverse-text);
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

.spotify-search-input:focus {
  border-color: var(--lumiverse-border-hover);
}

.spotify-search-results {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.spotify-search-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--lumiverse-radius);
  cursor: default;
  transition: background var(--lumiverse-transition-fast);
}

.spotify-search-item:hover {
  background: var(--lumiverse-fill-subtle);
}

.spotify-search-item-art {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--lumiverse-fill);
}

.spotify-search-item-info {
  flex: 1;
  min-width: 0;
}

.spotify-search-item-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-search-item-artist {
  font-size: 11px;
  color: var(--lumiverse-text-muted);
}

.spotify-search-item-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.spotify-search-item-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--lumiverse-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.spotify-search-item-btn:hover {
  background: var(--lumiverse-fill);
  color: var(--lumiverse-text);
}

.spotify-search-item-btn svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

/* Float widget */
.spotify-float-widget {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: var(--lumiverse-fill-subtle);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: box-shadow var(--lumiverse-transition-fast), opacity 320ms cubic-bezier(0.22, 1, 0.36, 1);
  touch-action: none;
}

.spotify-float-widget.spotify-float-widget-mounted {
  opacity: 1;
}

.spotify-float-widget:hover {
  box-shadow: 0 0 0 2px #1db954;
}

.spotify-float-widget-modern-mode {
  background: transparent;
  box-shadow: none;
}

.spotify-float-widget-modern-mode:hover {
  box-shadow: none;
}

.spotify-float-widget-legacy {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spotify-float-widget-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spotify-float-widget-icon svg {
  width: 24px;
  height: 24px;
  fill: var(--lumiverse-text-muted);
}

.spotify-float-widget-art {
  width: 100%;
  height: 100%;
}

/* Modern expanding widget player */
.spotify-modern-widget-player {
  --spotify-modern-widget-collapsed-size: 48px;
  --spotify-modern-widget-empty-expanded-width: 300px;
  --spotify-modern-widget-empty-expanded-height: 196px;
  --spotify-modern-expanded-surface: var(--lcs-glass-bg, var(--lumiverse-bg-elevated));
  --spotify-modern-expanded-surface-alt: var(--lcs-glass-bg-hover, var(--lumiverse-bg));
  --spotify-modern-widget-motion-duration: 420ms;
  --spotify-modern-widget-motion-ease: cubic-bezier(0.22, 1, 0.36, 1);
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: inherit;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.022) 0%, rgba(255, 255, 255, 0.008) 42%, rgba(255, 255, 255, 0.014) 100%),
    linear-gradient(180deg, var(--spotify-modern-expanded-surface) 0%, var(--spotify-modern-expanded-surface-alt) 100%);
  border: 1px solid var(--lcs-glass-border, var(--lumiverse-border));
  box-shadow:
    0 14px 34px var(--lumiverse-fill-heavy),
    var(--lumiverse-highlight-inset),
    inset 0 -1px 0 var(--lcs-glass-border, var(--lumiverse-border));
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  color: #fff;
  transition:
    width var(--spotify-modern-widget-motion-duration) var(--spotify-modern-widget-motion-ease),
    height var(--spotify-modern-widget-motion-duration) var(--spotify-modern-widget-motion-ease),
    border-radius var(--spotify-modern-widget-motion-duration) var(--spotify-modern-widget-motion-ease),
    box-shadow var(--spotify-modern-widget-motion-duration) var(--spotify-modern-widget-motion-ease),
    border-color 320ms ease,
    background 320ms ease;
}

[data-glass] .spotify-modern-widget-player {
  -webkit-backdrop-filter: blur(var(--lcs-glass-blur, 8px));
  backdrop-filter: blur(var(--lcs-glass-blur, 8px));
  will-change: backdrop-filter;
}

.spotify-modern-widget-player[data-expanded="false"] {
  width: var(--spotify-modern-widget-collapsed-size);
  height: var(--spotify-modern-widget-collapsed-size);
}

.spotify-modern-widget-player[data-expanded="true"] {
  min-height: 420px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.024) 0%, rgba(255, 255, 255, 0.01) 100%),
    linear-gradient(180deg, var(--spotify-modern-expanded-surface) 0%, var(--spotify-modern-expanded-surface-alt) 100%);
  border-color: var(--lcs-glass-border, var(--lumiverse-border));
  box-shadow: var(--lumiverse-shadow-xl);
}

.spotify-modern-widget-player[data-expanded="true"][data-empty="true"] {
  min-height: var(--spotify-modern-widget-empty-expanded-height);
}

.spotify-modern-widget-compact,
.spotify-modern-widget-expanded {
  position: absolute;
  inset: 0;
  clip-path: inset(0 0 0 0);
  transition:
    opacity 260ms cubic-bezier(0.22, 1, 0.36, 1),
    clip-path var(--spotify-modern-widget-motion-duration) var(--spotify-modern-widget-motion-ease);
}

.spotify-modern-widget-player[data-expanded="false"] .spotify-modern-widget-expanded,
.spotify-modern-widget-player[data-expanded="true"] .spotify-modern-widget-compact {
  opacity: 0;
  pointer-events: none;
  clip-path: inset(0 calc(100% - var(--spotify-modern-widget-collapsed-size)) calc(100% - var(--spotify-modern-widget-collapsed-size)) 0);
}

.spotify-modern-widget-player[data-expanded="true"] .spotify-modern-widget-expanded,
.spotify-modern-widget-player[data-expanded="false"] .spotify-modern-widget-compact {
  opacity: 1;
  clip-path: inset(0 0 0 0);
}

.spotify-modern-widget-compact {
  inset: 0 auto auto 0;
  width: var(--spotify-modern-widget-collapsed-size);
  height: var(--spotify-modern-widget-collapsed-size);
  border-radius: inherit;
  overflow: hidden;
  padding: 6px;
  box-sizing: border-box;
}

.spotify-modern-widget-compact-art {
  width: 100%;
  height: 100%;
  border-radius: max(14px, calc(var(--spotify-modern-widget-collapsed-size) * 0.24));
  overflow: hidden;
}

.spotify-modern-widget-compact-fallback {
  position: absolute;
  inset: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: max(14px, calc(var(--spotify-modern-widget-collapsed-size) * 0.24));
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
}

.spotify-modern-widget-compact-fallback svg {
  width: 46%;
  height: 46%;
  fill: rgba(255, 255, 255, 0.78);
}

.spotify-modern-widget-compact-overlay {
  position: absolute;
  inset: 12px 12px 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  pointer-events: none;
}

.spotify-modern-widget-compact-status {
  display: none;
}

.spotify-modern-widget-compact-progress {
  align-self: stretch;
  margin-top: auto;
  height: 4px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.spotify-modern-widget-compact-progress-fill {
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.72);
}

.spotify-modern-widget-expanded {
  display: grid;
  grid-template-rows: auto auto auto 1fr auto auto auto;
  gap: 10px;
  padding: 14px 14px 12px;
  box-sizing: border-box;
  min-height: 100%;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.014) 0%, rgba(255, 255, 255, 0.005) 100%),
    linear-gradient(180deg, var(--spotify-modern-expanded-surface) 0%, var(--spotify-modern-expanded-surface-alt) 100%);
}

.spotify-modern-widget-player[data-empty="true"] .spotify-modern-widget-expanded {
  grid-template-rows: auto 1fr;
  gap: 12px;
}

.spotify-modern-widget-header,
.spotify-modern-widget-meta,
.spotify-modern-widget-progress-row,
.spotify-modern-widget-lyrics,
.spotify-modern-widget-controls,
.spotify-modern-widget-volume-row,
.spotify-modern-widget-empty {
  transition: opacity 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.spotify-modern-widget-player[data-expanded="false"] .spotify-modern-widget-header,
.spotify-modern-widget-player[data-expanded="false"] .spotify-modern-widget-meta,
.spotify-modern-widget-player[data-expanded="false"] .spotify-modern-widget-progress-row,
.spotify-modern-widget-player[data-expanded="false"] .spotify-modern-widget-lyrics,
.spotify-modern-widget-player[data-expanded="false"] .spotify-modern-widget-controls,
.spotify-modern-widget-player[data-expanded="false"] .spotify-modern-widget-volume-row,
.spotify-modern-widget-player[data-expanded="false"] .spotify-modern-widget-empty {
  opacity: 0;
}

.spotify-modern-widget-player[data-expanded="true"] .spotify-modern-widget-header,
.spotify-modern-widget-player[data-expanded="true"] .spotify-modern-widget-meta,
.spotify-modern-widget-player[data-expanded="true"] .spotify-modern-widget-progress-row,
.spotify-modern-widget-player[data-expanded="true"] .spotify-modern-widget-lyrics,
.spotify-modern-widget-player[data-expanded="true"] .spotify-modern-widget-controls,
.spotify-modern-widget-player[data-expanded="true"] .spotify-modern-widget-volume-row,
.spotify-modern-widget-player[data-expanded="true"] .spotify-modern-widget-empty {
  opacity: 1;
}

.spotify-modern-widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.spotify-modern-widget-eyebrow,
.spotify-modern-widget-section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.48);
}

.spotify-modern-widget-header-buttons {
  display: flex;
  gap: 6px;
}

.spotify-modern-widget-icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.78);
  cursor: pointer;
}

.spotify-modern-widget-icon-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.spotify-modern-widget-icon-btn svg,
.spotify-modern-widget-btn svg,
.spotify-modern-widget-volume-icon svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.spotify-modern-widget-hero {
  display: grid;
  grid-template-columns: 108px 1fr;
  gap: 14px;
  align-items: center;
}

.spotify-modern-widget-art,
.spotify-modern-widget-art-fallback {
  width: 108px;
  height: 108px;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: border-radius 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 260ms ease;
}

.spotify-modern-widget-art {
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.28);
}

.spotify-modern-widget-art-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.04) 100%);
}

.spotify-modern-widget-art-fallback svg {
  width: 40%;
  height: 40%;
  fill: rgba(255, 255, 255, 0.82);
}

.spotify-modern-widget-meta {
  min-width: 0;
  display: grid;
  gap: 5px;
}

.spotify-modern-widget-marquee {
  --spotify-modern-marquee-left-fade: 0px;
  --spotify-modern-marquee-right-fade: 0px;
  position: relative;
  min-width: 0;
  overflow: hidden;
  -webkit-mask-image: none;
  mask-image: none;
  transition:
    --spotify-modern-marquee-left-fade 220ms cubic-bezier(0.22, 1, 0.36, 1),
    --spotify-modern-marquee-right-fade 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.spotify-modern-widget-marquee[data-overflow="true"] {
  --spotify-modern-marquee-right-fade: 18px;
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0,
    black var(--spotify-modern-marquee-left-fade),
    black calc(100% - var(--spotify-modern-marquee-right-fade)),
    transparent 100%
  );
  mask-image: linear-gradient(
    90deg,
    transparent 0,
    black var(--spotify-modern-marquee-left-fade),
    black calc(100% - var(--spotify-modern-marquee-right-fade)),
    transparent 100%
  );
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.spotify-modern-widget-marquee[data-overflow="true"][data-marquee-phase="scrolling"] {
  --spotify-modern-marquee-left-fade: 18px;
}

.spotify-modern-widget-marquee-content {
  width: max-content;
  min-width: 100%;
  white-space: nowrap;
  will-change: transform;
}

.spotify-modern-widget-marquee-animate {
  animation: spotify-modern-marquee var(--spotify-modern-marquee-duration, 10s) ease-in-out 2 alternate;
}

.spotify-modern-widget-track {
  font-size: 20px;
  line-height: 1.12;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.spotify-modern-widget-artist {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.74);
}

.spotify-modern-widget-album {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.48);
}

.spotify-modern-widget-progress-row {
  display: grid;
  grid-template-columns: 34px 1fr 34px;
  gap: 8px;
  align-items: center;
}

.spotify-modern-widget-time {
  font-size: 10px;
  text-align: center;
  color: rgba(255, 255, 255, 0.56);
}

.spotify-modern-widget-progress-bar {
  position: relative;
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.14);
  cursor: pointer;
}

.spotify-modern-widget-progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #f7f8fb 0%, #c7cfdd 100%);
}

.spotify-modern-widget-lyrics {
  display: grid;
  gap: 8px;
  min-height: 0;
  padding: 14px 14px 12px;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.032) 0%, rgba(255, 255, 255, 0.012) 100%),
    var(--spotify-modern-expanded-surface);
  border: 1px solid var(--lcs-glass-border, var(--lumiverse-border));
  overflow: hidden;
}

.spotify-modern-widget-lyrics-body {
  min-height: 132px;
  max-height: 176px;
  display: block;
  gap: 4px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  box-sizing: border-box;
  padding-top: 16px;
  padding-bottom: 16px;
  scroll-padding-top: 36%;
  scroll-padding-bottom: 24px;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--lumiverse-fill-strong) transparent;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, black 18px, black calc(100% - 18px), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, black 18px, black calc(100% - 18px), transparent 100%);
}

.spotify-modern-widget-lyrics-track {
  width: 100%;
  display: grid;
  gap: 4px;
  padding: 0 0 2px;
}

.spotify-modern-widget-lyrics-status {
  text-align: center;
  font-size: 13px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.58);
}

.spotify-modern-widget-lyrics-status-loading {
  animation: spotify-lyrics-loading-pulse 1.15s ease-in-out infinite;
}

.spotify-modern-widget-lyric-line {
  text-align: center;
  font-size: 16px;
  line-height: 1.24;
  font-weight: 600;
  letter-spacing: -0.018em;
  color: rgba(255, 255, 255, 0.22);
  white-space: pre-wrap;
  text-wrap: pretty;
  transition: color 220ms ease, transform 220ms ease, text-shadow 220ms ease;
}

.spotify-modern-widget-lyric-line-enter {
  animation: spotify-lyrics-line-in 360ms cubic-bezier(0.18, 0.9, 0.22, 1) both;
  animation-delay: var(--spotify-modern-lyric-enter-delay, 0ms);
}

.spotify-modern-widget-lyric-line-long {
  max-width: calc(100% - 24px);
  margin-inline: auto;
}

.spotify-modern-widget-lyric-line.active {
  color: #fff;
  transform: scale(1.035);
  text-shadow: 0 0 16px rgba(255, 255, 255, 0.12);
}

.spotify-modern-widget-lyric-line.near {
  color: rgba(255, 255, 255, 0.64);
}

.spotify-modern-widget-lyric-line.mid {
  color: rgba(255, 255, 255, 0.38);
}

.spotify-modern-widget-lyric-line.far,
.spotify-modern-widget-lyric-line.plain {
  color: rgba(255, 255, 255, 0.24);
}

.spotify-modern-widget-lyric-line.plain {
  color: rgba(255, 255, 255, 0.52);
}

.spotify-modern-widget-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: auto;
}

.spotify-modern-widget-btn {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
}

.spotify-modern-widget-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

.spotify-modern-widget-btn-main {
  width: 58px;
  height: 58px;
  background: linear-gradient(180deg, #fbfcff 0%, #d8deea 100%);
  color: #11131a;
}

.spotify-modern-widget-btn-main:hover {
  background: linear-gradient(180deg, #fff 0%, #e7ebf3 100%);
}

.spotify-modern-widget-btn-main svg {
  width: 22px;
  height: 22px;
}

.spotify-modern-widget-volume-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 6px 2px;
  margin-top: -2px;
}

.spotify-modern-widget-volume-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.58);
}

.spotify-modern-widget-volume-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  outline: none;
  border: none;
}

.spotify-modern-widget-volume-slider::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 999px;
  background: transparent;
}

.spotify-modern-widget-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  margin-top: -5px;
  border-radius: 50%;
  background: #f4f6fa;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.spotify-modern-widget-volume-slider::-moz-range-track {
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: none;
}

.spotify-modern-widget-volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f4f6fa;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.spotify-modern-widget-empty {
  display: none;
  align-content: center;
  justify-items: center;
  gap: 10px;
  min-height: 0;
  text-align: center;
  padding: 10px 12px 16px;
}

.spotify-modern-widget-empty-icon {
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%),
    rgba(255, 255, 255, 0.02);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 12px 24px rgba(0, 0, 0, 0.18);
}

.spotify-modern-widget-empty-icon svg {
  width: 28px;
  height: 28px;
  fill: rgba(255, 255, 255, 0.84);
}

.spotify-modern-widget-empty-title {
  font-size: 24px;
  line-height: 1.06;
  font-weight: 700;
  letter-spacing: -0.035em;
  color: #fff;
}

.spotify-modern-widget-empty-subtitle {
  max-width: 26ch;
  font-size: 12px;
  line-height: 1.45;
  letter-spacing: -0.01em;
  color: rgba(255, 255, 255, 0.58);
}

@keyframes spotify-modern-marquee {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(calc(-1 * var(--spotify-modern-marquee-distance, 0px)));
  }
}

/* Empty state */
.spotify-empty {
  text-align: center;
  padding: 16px;
  color: var(--lumiverse-text-dim);
  font-size: 13px;
}

/* Crossfade album art */
.spotify-crossfade-art {
  position: relative;
  overflow: hidden;
}

.spotify-crossfade-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
}

/* Mini player popup */
.spotify-mini-player {
  position: fixed;
  z-index: 9990;
  width: var(--spotify-mini-player-width, 280px);
  background: var(--lumiverse-bg);
  border: 1px solid var(--lumiverse-border);
  border-radius: 12px;
  box-shadow: var(--lumiverse-shadow-xl);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--lumiverse-text);
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.spotify-mini-player[data-style="modern"] {
  gap: 12px;
  padding: 14px;
  border-radius: 24px;
  border-color: rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.06) 100%),
    linear-gradient(180deg, rgba(18, 18, 20, 0.96) 0%, rgba(10, 10, 12, 0.98) 100%);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(26px) saturate(1.15);
}

.spotify-mini-player.open {
  transform: scale(1);
  opacity: 1;
  pointer-events: auto;
}

.spotify-mini-player.closing {
  display: flex;
  transform: scale(0);
  opacity: 0;
  pointer-events: none;
}

.spotify-mini-header {
  display: flex;
  gap: 10px;
  align-items: center;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-header {
  align-items: stretch;
  gap: 14px;
}

.spotify-mini-art {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--lumiverse-fill);
}

.spotify-mini-player[data-style="modern"] .spotify-mini-art {
  width: 94px;
  height: 94px;
  border-radius: 22px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);
}

.spotify-mini-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-info {
  justify-content: center;
  gap: 4px;
}

.spotify-mini-track {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-track {
  font-size: 18px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.spotify-mini-artist {
  font-size: 11px;
  color: var(--lumiverse-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.spotify-mini-album {
  display: none;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.48);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-album {
  display: block;
}

.spotify-mini-header-btns {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-header-btns {
  align-self: flex-start;
  gap: 6px;
}

.spotify-mini-header-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--lumiverse-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s ease;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-header-btn {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.08);
}

.spotify-mini-header-btn:hover {
  background: var(--lumiverse-fill-subtle);
  color: var(--lumiverse-text);
}

.spotify-mini-player[data-style="modern"] .spotify-mini-header-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.spotify-mini-header-btn svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.spotify-mini-progress-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-progress-row {
  gap: 8px;
}

.spotify-mini-time {
  font-size: 10px;
  color: var(--lumiverse-text-dim);
  min-width: 28px;
  text-align: center;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-time {
  min-width: 32px;
  color: rgba(255, 255, 255, 0.56);
}

.spotify-mini-progress-bar {
  flex: 1;
  height: 4px;
  background: var(--lumiverse-fill);
  border-radius: 2px;
  cursor: pointer;
  padding: 6px 0;
  background-clip: content-box;
  position: relative;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-progress-bar {
  height: 6px;
  padding: 7px 0;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}

.spotify-mini-progress-fill {
  position: absolute;
  top: 6px;
  left: 0;
  height: 4px;
  background: #1db954;
  border-radius: 2px;
  pointer-events: none;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-progress-fill {
  top: 7px;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #f6f7fb 0%, #c7ccd8 100%);
}

.spotify-mini-lyrics-section {
  display: none;
  flex-direction: column;
  gap: 8px;
  padding: 14px 14px 12px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.04) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.spotify-mini-lyrics-header {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.46);
}

.spotify-mini-lyrics-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 132px;
  min-height: 132px;
  justify-content: center;
  overflow: hidden;
}

.spotify-mini-lyrics-status {
  font-size: 13px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.58);
  text-align: center;
}

.spotify-mini-lyrics-status-loading {
  animation: spotify-lyrics-loading-pulse 1.15s ease-in-out infinite;
}

.spotify-mini-lyric-line {
  font-size: 16px;
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: -0.018em;
  text-align: center;
  color: rgba(255, 255, 255, 0.22);
  transition: color 220ms ease, transform 220ms ease, opacity 220ms ease;
  white-space: pre-wrap;
  text-wrap: pretty;
}

.spotify-mini-lyric-line-active {
  color: #fff;
  transform: scale(1.035);
  text-shadow: 0 0 16px rgba(255, 255, 255, 0.12);
}

.spotify-mini-lyric-line-near {
  color: rgba(255, 255, 255, 0.62);
}

.spotify-mini-lyric-line-mid {
  color: rgba(255, 255, 255, 0.38);
}

.spotify-mini-lyric-line-far,
.spotify-mini-lyric-line-plain {
  color: rgba(255, 255, 255, 0.24);
}

.spotify-mini-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-controls {
  gap: 12px;
}

.spotify-mini-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--lumiverse-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s ease;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-btn {
  width: 42px;
  height: 42px;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.08);
}

.spotify-mini-btn:hover {
  background: var(--lumiverse-fill-subtle);
}

.spotify-mini-player[data-style="modern"] .spotify-mini-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

.spotify-mini-btn svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.spotify-mini-btn-main {
  width: 56px;
  height: 56px;
  background: #1db954;
  color: #fff;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-btn-main {
  width: 58px;
  height: 58px;
  background: linear-gradient(180deg, #f5f7fb 0%, #d6dce8 100%);
  color: #111318;
}

.spotify-mini-btn-main:hover {
  background: #1ed760;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-btn-main:hover {
  background: linear-gradient(180deg, #ffffff 0%, #e4e9f2 100%);
}

.spotify-mini-btn-main svg {
  width: 26px;
  height: 26px;
}

.spotify-mini-volume-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-volume-row {
  padding: 0 4px;
}

.spotify-mini-volume-icon {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  color: var(--lumiverse-text-muted);
}

.spotify-mini-player[data-style="modern"] .spotify-mini-volume-icon {
  color: rgba(255, 255, 255, 0.56);
}

.spotify-mini-volume-icon svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.spotify-mini-volume-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: var(--lumiverse-fill-subtle);
  border: none;
  outline: none;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-volume-slider {
  background: rgba(255, 255, 255, 0.12);
}

.spotify-mini-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--lumiverse-primary);
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.spotify-mini-volume-slider::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: var(--lumiverse-fill-subtle);
  border: none;
}

.spotify-mini-volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--lumiverse-primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.spotify-mini-empty {
  text-align: center;
  padding: 12px 8px;
  color: var(--lumiverse-text-dim);
  font-size: 12px;
}

/* Mini player device row */
.spotify-mini-device-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 2px;
  border-top: 1px solid var(--lumiverse-border);
  padding: 6px 0 0;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-device-row {
  padding-top: 4px;
  border-top-color: rgba(255, 255, 255, 0.08);
}

.spotify-mini-device-icon {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  color: var(--lumiverse-text-dim);
  flex-shrink: 0;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-device-icon {
  color: rgba(255, 255, 255, 0.48);
}

.spotify-mini-device-icon svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.spotify-mini-device-name {
  flex: 1;
  font-size: 11px;
  color: var(--lumiverse-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-device-name {
  color: rgba(255, 255, 255, 0.62);
}

.spotify-mini-device-toggle {
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--lumiverse-border);
  background: transparent;
  color: var(--lumiverse-text-muted);
  font-size: 10px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.spotify-mini-player[data-style="modern"] .spotify-mini-device-toggle {
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.76);
}

.spotify-mini-device-toggle:hover {
  background: var(--lumiverse-fill-subtle);
  color: var(--lumiverse-text);
}

.spotify-mini-player[data-style="modern"] .spotify-mini-device-toggle:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.spotify-mini-device-list {
  display: none;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0 0;
}

.spotify-mini-device-loading {
  font-size: 11px;
  color: var(--lumiverse-text-dim);
  text-align: center;
  padding: 6px;
}

.spotify-mini-device-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s ease;
  font-size: 11px;
}

.spotify-mini-device-item:hover {
  background: var(--lumiverse-fill-subtle);
}

.spotify-mini-device-item.active {
  color: #1db954;
  cursor: default;
}

.spotify-mini-device-item-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-mini-device-item-type {
  color: var(--lumiverse-text-dim);
  font-size: 10px;
  text-transform: capitalize;
  flex-shrink: 0;
}

/* Lyrics */
.spotify-lyrics-section {
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.spotify-lyrics-body {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 48px;
  overflow: hidden;
}

.spotify-lyrics-has-content {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--lumiverse-fill-strong) transparent;
  position: relative;
  padding-top: 28px;
  padding-bottom: 112px;
  padding-inline: 6px;
  scroll-padding-top: 34%;
  scroll-padding-bottom: 112px;
  box-sizing: border-box;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, black 40px, black calc(100% - 56px), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, black 40px, black calc(100% - 56px), transparent 100%);
}

.spotify-lyrics-status {
  padding: 12px 0;
  text-align: center;
  font-size: 12px;
  color: var(--lumiverse-text-dim);
  font-style: italic;
}

.spotify-lyrics-status-loading {
  letter-spacing: 0.02em;
  animation: spotify-lyrics-loading-pulse 1.15s ease-in-out infinite;
}

.spotify-lyrics-text {
  white-space: pre-wrap;
  font-size: 16px;
  line-height: 1.65;
  color: var(--lumiverse-text-muted);
  text-align: center;
  text-wrap: pretty;
  padding: 8px 12px 24px;
}

.spotify-lyrics-synced {
  gap: 2px;
  scroll-behavior: smooth;
}

.spotify-lyrics-line {
  --spotify-lyrics-line-opacity: 1;
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 6px 8px;
  color: var(--lumiverse-text-dim);
  text-align: center;
  opacity: var(--spotify-lyrics-line-opacity);
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: color 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 260ms cubic-bezier(0.22, 1, 0.36, 1), background 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.spotify-lyrics-line-text {
  display: block;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: normal;
  text-wrap: pretty;
  letter-spacing: -0.015em;
  transform: translateY(0);
  transform-origin: center center;
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), text-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1), filter 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.spotify-lyrics-line-text-long {
  max-width: calc(100% - 32px);
  margin-inline: auto;
}

.spotify-lyrics-line-enter {
  animation: spotify-lyrics-line-in 420ms cubic-bezier(0.18, 0.9, 0.22, 1) both;
  animation-delay: var(--spotify-lyrics-enter-delay, 0ms);
}

.spotify-lyrics-line:hover {
  background: var(--lumiverse-fill-subtle);
}

.spotify-lyrics-line-active {
  --spotify-lyrics-line-opacity: 1;
  color: var(--lumiverse-text);
  opacity: 1;
}

.spotify-lyrics-line-active .spotify-lyrics-line-text {
  transform: scale(1.17);
  text-shadow: 0 0 18px rgba(255, 255, 255, 0.1);
  filter: brightness(1.12);
}

.spotify-lyrics-line-tier-1 {
  --spotify-lyrics-line-opacity: 0.78;
  color: var(--lumiverse-text-muted);
}

.spotify-lyrics-line-tier-2 {
  --spotify-lyrics-line-opacity: 0.56;
  color: var(--lumiverse-text-muted);
}

.spotify-lyrics-line-tier-3 {
  --spotify-lyrics-line-opacity: 0.38;
}

.spotify-lyrics-line-tier-4 {
  --spotify-lyrics-line-opacity: 0.24;
}

.spotify-lyrics-line-past {
  --spotify-lyrics-line-opacity: 0.3;
}

.spotify-lyrics-line-future {
  --spotify-lyrics-line-opacity: 0.42;
}

.spotify-lyrics-line-past.spotify-lyrics-line-tier-1,
.spotify-lyrics-line-future.spotify-lyrics-line-tier-1 {
  --spotify-lyrics-line-opacity: 0.78;
}

.spotify-lyrics-line-past.spotify-lyrics-line-tier-2,
.spotify-lyrics-line-future.spotify-lyrics-line-tier-2 {
  --spotify-lyrics-line-opacity: 0.56;
}

.spotify-lyrics-line-past.spotify-lyrics-line-tier-3,
.spotify-lyrics-line-future.spotify-lyrics-line-tier-3 {
  --spotify-lyrics-line-opacity: 0.38;
}

.spotify-lyrics-line-past.spotify-lyrics-line-tier-4,
.spotify-lyrics-line-future.spotify-lyrics-line-tier-4 {
  --spotify-lyrics-line-opacity: 0.24;
}

.spotify-lyrics-line-blank {
  min-height: 22px;
  --spotify-lyrics-line-opacity: 0.18;
}

.spotify-lyrics-line-blank .spotify-lyrics-line-text {
  font-size: 15px;
  letter-spacing: 0.08em;
}

.spotify-lyrics-line-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  min-height: 1em;
}

.spotify-lyrics-text-enter {
  animation: spotify-lyrics-text-in 340ms cubic-bezier(0.18, 0.9, 0.22, 1) both;
}

@keyframes spotify-lyrics-loading-pulse {
  0%,
  100% {
    opacity: 0.38;
  }

  50% {
    opacity: 0.8;
  }
}

@keyframes spotify-lyrics-line-in {
  from {
    opacity: 0;
    transform: translateY(16px);
    filter: blur(8px);
  }

  to {
    opacity: var(--spotify-lyrics-line-opacity);
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes spotify-lyrics-text-in {
  from {
    opacity: 0;
    transform: translateY(10px);
    filter: blur(6px);
  }

  to {
    opacity: 1;
    transform: none;
    filter: blur(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spotify-lyrics-line,
  .spotify-lyrics-text,
  .spotify-lyrics-status-loading {
    animation: none !important;
    transition: none;
  }
}

`;

// src/ui/settings.ts
function createSettingsUI(sendToBackend, getServerBaseUrl) {
  const root = document.createElement("section");
  root.className = "spotify-settings-card";
  const header = document.createElement("header");
  header.className = "spotify-settings-card-header";
  const title = document.createElement("h3");
  title.textContent = "Spotify Controls";
  const statusEl = document.createElement("span");
  statusEl.className = "spotify-status";
  header.appendChild(title);
  header.appendChild(statusEl);
  const body = document.createElement("div");
  body.className = "spotify-settings-card-body";
  const idLabel = document.createElement("label");
  idLabel.className = "spotify-settings-label";
  idLabel.textContent = "Client ID";
  const idInput = document.createElement("input");
  idInput.className = "spotify-input";
  idInput.type = "text";
  idInput.placeholder = "Spotify Client ID";
  idLabel.appendChild(idInput);
  const secretLabel = document.createElement("label");
  secretLabel.className = "spotify-settings-label";
  secretLabel.textContent = "Client Secret (optional)";
  const secretInput = document.createElement("input");
  secretInput.className = "spotify-input";
  secretInput.type = "password";
  secretInput.placeholder = "Optional for PKCE apps";
  secretLabel.appendChild(secretInput);
  const lastfmLabel = document.createElement("label");
  lastfmLabel.className = "spotify-settings-label";
  lastfmLabel.textContent = "Last.fm API Key";
  const lastfmInput = document.createElement("input");
  lastfmInput.className = "spotify-input";
  lastfmInput.type = "password";
  lastfmInput.placeholder = "Last.fm API Key (for recommendations)";
  lastfmLabel.appendChild(lastfmInput);
  const lastfmRow = document.createElement("div");
  lastfmRow.className = "spotify-settings-row";
  const lastfmBtn = document.createElement("button");
  lastfmBtn.className = "spotify-btn spotify-btn-primary";
  lastfmBtn.textContent = "Save";
  lastfmBtn.style.fontSize = "0.85em";
  lastfmBtn.style.padding = "4px 12px";
  lastfmBtn.addEventListener("click", () => {
    const apiKey = lastfmInput.value.trim();
    if (!apiKey)
      return;
    sendToBackend({ type: "save_lastfm_key", apiKey });
  });
  lastfmRow.appendChild(lastfmBtn);
  const callbackLabel = document.createElement("label");
  callbackLabel.className = "spotify-settings-label";
  callbackLabel.textContent = "Redirect URI";
  const callbackRow = document.createElement("div");
  callbackRow.className = "spotify-settings-row";
  callbackRow.style.gap = "6px";
  const callbackInput = document.createElement("input");
  callbackInput.className = "spotify-input";
  callbackInput.type = "text";
  callbackInput.readOnly = true;
  callbackInput.placeholder = "Loading...";
  callbackInput.style.flex = "1";
  callbackInput.style.cursor = "text";
  callbackInput.style.userSelect = "all";
  const copyBtn = document.createElement("button");
  copyBtn.className = "spotify-btn spotify-btn-primary";
  copyBtn.textContent = "Copy";
  copyBtn.style.fontSize = "0.85em";
  copyBtn.style.padding = "4px 12px";
  copyBtn.style.flexShrink = "0";
  copyBtn.addEventListener("click", () => {
    if (!callbackInput.value)
      return;
    navigator.clipboard.writeText(callbackInput.value).then(() => {
      const prev = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = prev;
      }, 1500);
    });
  });
  callbackRow.appendChild(callbackInput);
  callbackRow.appendChild(copyBtn);
  callbackLabel.appendChild(callbackRow);
  const callbackHint = document.createElement("div");
  callbackHint.style.cssText = "font-size:0.8em;opacity:0.6;margin-top:2px";
  callbackHint.textContent = "Add this loopback URL in Spotify. If it fails on another device, paste the failed callback URL below.";
  callbackLabel.appendChild(callbackHint);
  const forwardLabel = document.createElement("label");
  forwardLabel.className = "spotify-settings-label";
  forwardLabel.textContent = "Finish from another device";
  const forwardRow = document.createElement("div");
  forwardRow.className = "spotify-settings-row";
  forwardRow.style.gap = "6px";
  const forwardInput = document.createElement("input");
  forwardInput.className = "spotify-input";
  forwardInput.type = "text";
  forwardInput.placeholder = "Paste the 127.0.0.1 callback URL here";
  forwardInput.style.flex = "1";
  const forwardBtn = document.createElement("button");
  forwardBtn.className = "spotify-btn spotify-btn-primary";
  forwardBtn.textContent = "Finish";
  forwardBtn.style.fontSize = "0.85em";
  forwardBtn.style.padding = "4px 12px";
  forwardBtn.style.flexShrink = "0";
  forwardBtn.addEventListener("click", () => {
    const callbackUrl = forwardInput.value.trim();
    if (!callbackUrl)
      return;
    sendToBackend({ type: "complete_auth_callback", callbackUrl });
  });
  forwardRow.appendChild(forwardInput);
  forwardRow.appendChild(forwardBtn);
  forwardLabel.appendChild(forwardRow);
  const btnRow = document.createElement("div");
  btnRow.className = "spotify-settings-row";
  const btn = document.createElement("button");
  btn.className = "spotify-btn spotify-btn-primary";
  btn.textContent = "Connect";
  btnRow.appendChild(btn);
  body.appendChild(idLabel);
  body.appendChild(secretLabel);
  body.appendChild(callbackLabel);
  body.appendChild(forwardLabel);
  body.appendChild(lastfmLabel);
  body.appendChild(lastfmRow);
  body.appendChild(btnRow);
  root.appendChild(header);
  root.appendChild(body);
  let connected = false;
  function updateUI(isConnected, clientId, hasSecret, hasLastfmKey, callbackPath) {
    connected = isConnected;
    if (clientId) {
      idInput.value = clientId;
    }
    if (callbackPath) {
      const baseUrl = getServerBaseUrl();
      callbackInput.value = baseUrl + callbackPath;
    }
    if (isConnected) {
      idInput.disabled = true;
      secretInput.disabled = true;
      secretInput.value = "";
      secretInput.placeholder = "••••••••";
      btn.textContent = "Disconnect";
      btn.className = "spotify-btn spotify-btn-danger";
      btn.disabled = false;
      statusEl.innerHTML = '<span class="spotify-status-dot connected"></span>Connected';
    } else {
      idInput.disabled = false;
      secretInput.disabled = false;
      if (hasSecret) {
        secretInput.placeholder = "Saved (re-enter to change)";
      } else {
        secretInput.placeholder = "Optional for PKCE apps";
      }
      btn.textContent = "Connect";
      btn.className = "spotify-btn spotify-btn-primary";
      btn.disabled = false;
      statusEl.innerHTML = '<span class="spotify-status-dot disconnected"></span>Not connected';
    }
    if (hasLastfmKey) {
      lastfmInput.value = "";
      lastfmInput.placeholder = "Saved (re-enter to change)";
    } else {
      lastfmInput.placeholder = "Last.fm API Key (for recommendations)";
    }
  }
  function setConnecting() {
    btn.textContent = "Connecting...";
    btn.disabled = true;
    btn.className = "spotify-btn spotify-btn-primary";
    statusEl.innerHTML = '<span class="spotify-status-dot disconnected"></span>Waiting for authorization...';
  }
  btn.addEventListener("click", () => {
    if (connected) {
      sendToBackend({ type: "disconnect" });
    } else {
      const clientId = idInput.value.trim();
      const clientSecret = secretInput.value.trim();
      if (!clientId) {
        statusEl.innerHTML = '<span class="spotify-status-dot disconnected"></span><span style="color:#e74c3c">Client ID is required</span>';
        return;
      }
      setConnecting();
      sendToBackend({
        type: "connect",
        clientId,
        clientSecret: clientSecret || undefined,
        serverBaseUrl: getServerBaseUrl()
      });
    }
  });
  updateUI(false, "");
  return {
    root,
    update: updateUI,
    setConnecting,
    destroy() {
      root.remove();
    }
  };
}

// src/ui/crossfade-art.ts
function getTrackScopedArtUrl(url, trackUri) {
  if (!url)
    return null;
  if (!trackUri)
    return url;
  try {
    const scopedUrl = new URL(url);
    scopedUrl.searchParams.set("track", trackUri);
    return scopedUrl.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}track=${encodeURIComponent(trackUri)}`;
  }
}
function createCrossfadeArt(className) {
  const el = document.createElement("div");
  el.className = `${className} spotify-crossfade-art`;
  const imgA = document.createElement("img");
  const imgB = document.createElement("img");
  imgA.className = "spotify-crossfade-img";
  imgB.className = "spotify-crossfade-img";
  imgA.alt = "Album art";
  imgB.alt = "Album art";
  imgA.loading = "lazy";
  imgB.loading = "lazy";
  imgA.decoding = "async";
  imgB.decoding = "async";
  imgA.style.opacity = "1";
  imgB.style.opacity = "0";
  el.appendChild(imgA);
  el.appendChild(imgB);
  let currentUrl = null;
  let activeImg = imgA;
  let inactiveImg = imgB;
  let hasLoadedOnce = false;
  function resetImage(img) {
    img.onload = null;
    img.onerror = null;
    img.removeAttribute("src");
  }
  function hideArt() {
    el.style.display = "none";
    activeImg.style.opacity = "1";
    inactiveImg.style.opacity = "0";
  }
  function setUrl(url) {
    if (url === currentUrl)
      return;
    currentUrl = url;
    if (!url) {
      resetImage(activeImg);
      resetImage(inactiveImg);
      hideArt();
      return;
    }
    if (!hasLoadedOnce) {
      activeImg.onload = () => {
        hasLoadedOnce = true;
        el.style.display = "";
      };
      activeImg.onerror = () => {
        currentUrl = null;
        resetImage(activeImg);
        hideArt();
      };
      activeImg.src = url;
      if (activeImg.complete && activeImg.naturalWidth > 0) {
        hasLoadedOnce = true;
        el.style.display = "";
      }
      return;
    }
    el.style.display = "";
    inactiveImg.onload = () => {
      inactiveImg.style.opacity = "1";
      activeImg.style.opacity = "0";
      const tmp = activeImg;
      activeImg = inactiveImg;
      inactiveImg = tmp;
    };
    inactiveImg.onerror = () => {
      currentUrl = null;
      resetImage(inactiveImg);
      inactiveImg.style.opacity = "0";
    };
    inactiveImg.src = url;
    if (inactiveImg.complete && inactiveImg.naturalWidth > 0) {
      inactiveImg.style.opacity = "1";
      activeImg.style.opacity = "0";
      const tmp = activeImg;
      activeImg = inactiveImg;
      inactiveImg = tmp;
    }
  }
  return {
    el,
    setUrl,
    destroy() {
      el.remove();
    }
  };
}

// src/ui/now-playing.ts
function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
function createNowPlayingUI(onSeek) {
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
  let lastProgressMs = 0;
  let lastUpdateTime = 0;
  let lastIsPlaying = false;
  let animFrameId = null;
  function tickProgress() {
    if (!lastIsPlaying || !currentDuration) {
      animFrameId = null;
      return;
    }
    const elapsed = Date.now() - lastUpdateTime;
    const interpolated = Math.min(lastProgressMs + elapsed, currentDuration);
    const pct = interpolated / currentDuration * 100;
    progressFill.style.width = `${pct}%`;
    progressTime.textContent = formatTime(interpolated);
    animFrameId = requestAnimationFrame(tickProgress);
  }
  function startTicking() {
    if (animFrameId !== null)
      return;
    animFrameId = requestAnimationFrame(tickProgress);
  }
  function stopTicking() {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }
  progressBar.addEventListener("click", (e) => {
    if (!currentDuration)
      return;
    const rect = progressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(Math.round(pct * currentDuration));
  });
  function showEmpty(message) {
    art.setUrl(null);
    container.style.display = "none";
    progressContainer.style.display = "none";
    emptyState.textContent = message;
    if (!root.contains(emptyState))
      root.appendChild(emptyState);
    currentDuration = 0;
    progressFill.style.width = "0%";
    progressTime.textContent = formatTime(0);
    durationTime.textContent = formatTime(0);
    stopTicking();
  }
  function update(state, connected) {
    if (!connected) {
      showEmpty("Connect to Spotify to see playback");
      return;
    }
    if (!state) {
      showEmpty("No active playback — open Spotify on a device to get started");
      return;
    }
    if (root.contains(emptyState))
      root.removeChild(emptyState);
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
    art.setUrl(getTrackScopedArtUrl(state.albumArtUrl, state.trackUri));
    lastProgressMs = state.progressMs;
    lastUpdateTime = Date.now();
    lastIsPlaying = state.isPlaying;
    const pct = state.durationMs > 0 ? state.progressMs / state.durationMs * 100 : 0;
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
    }
  };
}

// src/ui/controls.ts
var ICON_PREV = `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`;
var ICON_PLAY = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
var ICON_PAUSE = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
var ICON_NEXT = `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`;
var ICON_SHUFFLE = `<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`;
var ICON_REPEAT = `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`;
var ICON_REPEAT_ONE = `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>`;
var ICON_VOLUME = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
function createControlsUI(sendToBackend) {
  const root = document.createElement("div");
  root.className = "spotify-section";
  const title = document.createElement("h3");
  title.className = "spotify-section-title";
  title.textContent = "Controls";
  root.appendChild(title);
  const controls = document.createElement("div");
  controls.className = "spotify-controls";
  function makeBtn(html, cls = "") {
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
  const volumeRow = document.createElement("div");
  volumeRow.className = "spotify-volume-row";
  const volumeIcon = document.createElement("span");
  volumeIcon.innerHTML = ICON_VOLUME;
  volumeIcon.style.cssText = "width:16px;height:16px;display:flex;align-items:center;color:var(--lumiverse-text-muted)";
  volumeIcon.querySelector("svg").style.cssText = "width:16px;height:16px;fill:currentColor";
  const volumeSlider = document.createElement("input");
  volumeSlider.type = "range";
  volumeSlider.className = "spotify-volume-slider";
  volumeSlider.min = "0";
  volumeSlider.max = "100";
  volumeSlider.value = "50";
  volumeRow.appendChild(volumeIcon);
  volumeRow.appendChild(volumeSlider);
  root.appendChild(volumeRow);
  let isPlaying = false;
  let currentRepeat = "off";
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
  let volumeDebounce = null;
  const volumeChangeHandlers = new Set;
  volumeSlider.addEventListener("input", () => {
    const percent = parseInt(volumeSlider.value, 10);
    for (const h of volumeChangeHandlers)
      h(percent);
    if (volumeDebounce)
      clearTimeout(volumeDebounce);
    volumeDebounce = setTimeout(() => {
      sendToBackend({ type: "set_volume", percent });
    }, 200);
  });
  function update(state, connected) {
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
    setVolume(percent) {
      volumeSlider.value = String(percent);
    },
    onVolumeChange(handler) {
      volumeChangeHandlers.add(handler);
    },
    destroy() {
      if (volumeDebounce)
        clearTimeout(volumeDebounce);
      volumeChangeHandlers.clear();
      root.remove();
    }
  };
}

// src/ui/search.ts
var ICON_PLAY_SMALL = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
var ICON_QUEUE = `<svg viewBox="0 0 24 24"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>`;
function createSearchUI(sendToBackend) {
  const root = document.createElement("div");
  root.className = "spotify-section";
  const title = document.createElement("h3");
  title.className = "spotify-section-title";
  title.textContent = "Search";
  root.appendChild(title);
  const input = document.createElement("input");
  input.className = "spotify-search-input";
  input.placeholder = "Search for tracks...";
  root.appendChild(input);
  const resultsList = document.createElement("div");
  resultsList.className = "spotify-search-results";
  root.appendChild(resultsList);
  let debounce = null;
  input.addEventListener("input", () => {
    if (debounce)
      clearTimeout(debounce);
    debounce = setTimeout(() => {
      const query = input.value.trim();
      if (query.length >= 2) {
        sendToBackend({ type: "search", query });
      } else {
        resultsList.innerHTML = "";
      }
    }, 400);
  });
  function setResults(results) {
    resultsList.innerHTML = "";
    if (results.length === 0) {
      const empty = document.createElement("div");
      empty.className = "spotify-empty";
      empty.textContent = "No results found";
      resultsList.appendChild(empty);
      return;
    }
    for (const result of results) {
      const item = document.createElement("div");
      item.className = "spotify-search-item";
      if (result.albumArtUrl) {
        const img = document.createElement("img");
        img.className = "spotify-search-item-art";
        img.src = result.albumArtUrl;
        img.alt = result.album;
        item.appendChild(img);
      }
      const info = document.createElement("div");
      info.className = "spotify-search-item-info";
      const name = document.createElement("div");
      name.className = "spotify-search-item-name";
      name.textContent = result.name;
      const artist = document.createElement("div");
      artist.className = "spotify-search-item-artist";
      artist.textContent = `${result.artist} — ${result.album}`;
      info.appendChild(name);
      info.appendChild(artist);
      item.appendChild(info);
      const actions = document.createElement("div");
      actions.className = "spotify-search-item-actions";
      const playBtn = document.createElement("button");
      playBtn.className = "spotify-search-item-btn";
      playBtn.title = "Play";
      playBtn.innerHTML = ICON_PLAY_SMALL;
      playBtn.addEventListener("click", () => {
        sendToBackend({ type: "play", trackUri: result.uri });
      });
      const queueBtn = document.createElement("button");
      queueBtn.className = "spotify-search-item-btn";
      queueBtn.title = "Add to queue";
      queueBtn.innerHTML = ICON_QUEUE;
      queueBtn.addEventListener("click", () => {
        sendToBackend({ type: "queue", trackUri: result.uri });
      });
      actions.appendChild(playBtn);
      actions.appendChild(queueBtn);
      item.appendChild(actions);
      resultsList.appendChild(item);
    }
  }
  return {
    root,
    setResults,
    destroy() {
      if (debounce)
        clearTimeout(debounce);
      root.remove();
    }
  };
}

// src/ui/synced-lyrics-model.ts
var EMPTY_SYNCED_LINE_SYMBOL = "♪";
function parseTimestamp(raw) {
  const match = /^(\d+):(\d{2})(?:\.(\d{1,3}))?$/.exec(raw);
  if (!match)
    return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const fraction = match[3] ? Number(match[3].padEnd(3, "0")) : 0;
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || seconds > 59)
    return null;
  return minutes * 60000 + seconds * 1000 + fraction;
}
function parseSyncedLyrics(value) {
  if (!value)
    return [];
  const parsed = [];
  for (const line of value.split(/\r?\n/)) {
    const timestamps = [...line.matchAll(/\[([^\]]+)\]/g)].map((match) => parseTimestamp(match[1])).filter((timeMs) => timeMs !== null);
    if (timestamps.length === 0)
      continue;
    const text = line.replace(/(?:\[[^\]]+\])+/g, "").trim();
    for (const timeMs of timestamps)
      parsed.push({ timeMs, text });
  }
  const grouped = [];
  for (const line of parsed.sort((a, b) => a.timeMs - b.timeMs)) {
    const previous = grouped[grouped.length - 1];
    if (previous?.timeMs === line.timeMs) {
      previous.text = [previous.text, line.text].filter(Boolean).join(`
`);
    } else {
      grouped.push({ ...line });
    }
  }
  return grouped;
}
function getLineDisplayText(text) {
  return text || EMPTY_SYNCED_LINE_SYMBOL;
}
function shouldReserveScaleGutter(text) {
  return !text.includes(`
`) && text.length >= 36;
}
function createSyncedLyricsModel(maxLines) {
  let lyrics = [];
  let playback = null;
  let activeLineIndex = -1;
  function getProgressMs() {
    if (!playback)
      return 0;
    if (!playback.isPlaying)
      return playback.progressMs;
    return Math.min(playback.progressMs + Date.now() - playback.updatedAt, playback.durationMs || Infinity);
  }
  function refreshActiveLineIndex() {
    if (lyrics.length === 0) {
      const changed2 = activeLineIndex !== -1;
      activeLineIndex = -1;
      return changed2;
    }
    const progressMs = getProgressMs();
    let nextActiveLineIndex = -1;
    for (let i = 0;i < lyrics.length; i++) {
      if (lyrics[i].timeMs > progressMs)
        break;
      nextActiveLineIndex = i;
    }
    const changed = nextActiveLineIndex !== activeLineIndex;
    activeLineIndex = nextActiveLineIndex;
    return changed;
  }
  function getVisibleLines() {
    const indexed = lyrics.map((line, index) => ({
      ...line,
      index,
      displayText: getLineDisplayText(line.text),
      hasText: Boolean(line.text)
    }));
    if (!maxLines || indexed.length <= maxLines)
      return indexed;
    if (activeLineIndex < 0)
      return indexed.slice(0, maxLines);
    const start = Math.max(0, Math.min(activeLineIndex - Math.floor(maxLines / 2), indexed.length - maxLines));
    return indexed.slice(start, start + maxLines);
  }
  function getIndexedLines() {
    return lyrics.map((line, index) => ({
      ...line,
      index,
      displayText: getLineDisplayText(line.text),
      hasText: Boolean(line.text)
    }));
  }
  return {
    clear() {
      lyrics = [];
      playback = null;
      activeLineIndex = -1;
    },
    setLyrics(nextLyrics) {
      lyrics = nextLyrics;
      activeLineIndex = -1;
      refreshActiveLineIndex();
    },
    setPlayback(nextPlayback) {
      playback = nextPlayback;
    },
    refreshActiveLineIndex,
    getActiveLineIndex() {
      return activeLineIndex;
    },
    hasLyrics() {
      return lyrics.length > 0;
    },
    getIndexedLines,
    getSnapshot() {
      refreshActiveLineIndex();
      return {
        activeLineIndex,
        lines: getVisibleLines()
      };
    }
  };
}

// src/ui/mini-player.ts
var ICON_PREV2 = `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`;
var ICON_PLAY2 = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
var ICON_PAUSE2 = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
var ICON_NEXT2 = `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`;
var ICON_VOLUME2 = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
var ICON_EXPAND = `<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`;
var ICON_COLLAPSE = `<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>`;
var ICON_DEVICE = `<svg viewBox="0 0 24 24"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>`;
var EMPTY_SYNCED_LINE_SYMBOL2 = "♪";
function formatTime2(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
var POPUP_W_DEFAULT = 280;
var POPUP_W_MODERN = 336;
var GAP = 8;
function getPopupWidth(style) {
  return style === "modern" ? POPUP_W_MODERN : POPUP_W_DEFAULT;
}
function getCompactPlainLyricLines(lyrics) {
  if (!lyrics)
    return [];
  return lyrics.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 5);
}
function createMiniPlayerUI(sendToBackend, onExpandClick, getWidgetRect) {
  const root = document.createElement("div");
  root.className = "spotify-mini-player";
  root.dataset.style = "default";
  root.style.setProperty("--spotify-mini-player-width", `${POPUP_W_DEFAULT}px`);
  const art = createCrossfadeArt("spotify-mini-art");
  const info = document.createElement("div");
  info.className = "spotify-mini-info";
  const trackName = document.createElement("div");
  trackName.className = "spotify-mini-track";
  const artistName = document.createElement("div");
  artistName.className = "spotify-mini-artist";
  const albumName = document.createElement("div");
  albumName.className = "spotify-mini-album";
  info.appendChild(trackName);
  info.appendChild(artistName);
  info.appendChild(albumName);
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
  function makeBtn(html, cls = "") {
    const b = document.createElement("button");
    b.className = `spotify-mini-btn ${cls}`.trim();
    b.innerHTML = html;
    return b;
  }
  const prevBtn = makeBtn(ICON_PREV2);
  const playPauseBtn = makeBtn(ICON_PLAY2, "spotify-mini-btn-main");
  const nextBtn = makeBtn(ICON_NEXT2);
  controls.appendChild(prevBtn);
  controls.appendChild(playPauseBtn);
  controls.appendChild(nextBtn);
  const volumeRow = document.createElement("div");
  volumeRow.className = "spotify-mini-volume-row";
  const volumeIcon = document.createElement("span");
  volumeIcon.className = "spotify-mini-volume-icon";
  volumeIcon.innerHTML = ICON_VOLUME2;
  const volumeSlider = document.createElement("input");
  volumeSlider.type = "range";
  volumeSlider.className = "spotify-mini-volume-slider";
  volumeSlider.min = "0";
  volumeSlider.max = "100";
  volumeSlider.value = "50";
  volumeRow.appendChild(volumeIcon);
  volumeRow.appendChild(volumeSlider);
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
  const lyricsSection = document.createElement("div");
  lyricsSection.className = "spotify-mini-lyrics-section";
  const lyricsHeader = document.createElement("div");
  lyricsHeader.className = "spotify-mini-lyrics-header";
  lyricsHeader.textContent = "Lyrics";
  const lyricsBody = document.createElement("div");
  lyricsBody.className = "spotify-mini-lyrics-body";
  const lyricsStatus = document.createElement("div");
  lyricsStatus.className = "spotify-mini-lyrics-status";
  const lyricLineEls = Array.from({ length: 5 }, () => {
    const el = document.createElement("div");
    el.className = "spotify-mini-lyric-line";
    lyricsBody.appendChild(el);
    return el;
  });
  lyricsBody.appendChild(lyricsStatus);
  lyricsSection.appendChild(lyricsHeader);
  lyricsSection.appendChild(lyricsBody);
  root.appendChild(lyricsSection);
  root.appendChild(controls);
  root.appendChild(volumeRow);
  root.appendChild(deviceRow);
  root.appendChild(deviceList);
  root.appendChild(emptyState);
  let isPlaying = false;
  let currentDuration = 0;
  let visible = false;
  let cachedPopupH = 0;
  let currentStyle = "default";
  let currentState = null;
  let currentConnected = false;
  let lastProgressMs = 0;
  let lastUpdateTime = 0;
  let lastIsPlaying = false;
  let animFrameId = null;
  let lyricsTrackUri = null;
  let syncedLyrics = [];
  let plainLyricLines = [];
  let lyricsInstrumental = false;
  let lyricsLoading = false;
  let activeLyricLineIndex = -1;
  let lyricsUpdateSuspended = false;
  let pendingLyricsRefresh = false;
  let uiSuspended = false;
  let pendingPlaybackRefresh = null;
  let pendingDevices = null;
  let pendingVolume = null;
  function setLyricsStatus(message, loading = false) {
    lyricsStatus.className = loading ? "spotify-mini-lyrics-status spotify-mini-lyrics-status-loading" : "spotify-mini-lyrics-status";
    lyricsStatus.textContent = message;
    lyricsStatus.style.display = "";
    for (const el of lyricLineEls) {
      el.style.display = "none";
      el.textContent = "";
      el.className = "spotify-mini-lyric-line";
    }
  }
  function showLyricRows() {
    lyricsStatus.style.display = "none";
    for (const el of lyricLineEls) {
      el.style.display = "";
    }
  }
  function flushPendingLyricsRefresh() {
    if (!pendingLyricsRefresh || lyricsUpdateSuspended)
      return;
    pendingLyricsRefresh = false;
    updateActiveLyricLine(true);
  }
  function flushPendingUiRefresh() {
    if (uiSuspended)
      return;
    const nextPlaybackRefresh = pendingPlaybackRefresh;
    const nextDevices = pendingDevices;
    const nextVolume = pendingVolume;
    pendingPlaybackRefresh = null;
    pendingDevices = null;
    pendingVolume = null;
    if (nextPlaybackRefresh) {
      update(nextPlaybackRefresh.state, nextPlaybackRefresh.connected);
    }
    if (nextDevices) {
      setDevices(nextDevices);
    }
    if (nextVolume !== null) {
      setVolume(nextVolume);
    }
    flushPendingLyricsRefresh();
  }
  function getInterpolatedProgressMs() {
    if (!lastIsPlaying)
      return lastProgressMs;
    return Math.min(lastProgressMs + Math.max(0, Date.now() - lastUpdateTime), currentDuration || Infinity);
  }
  function getLyricWindow() {
    const windowSize = 5;
    if (syncedLyrics.length === 0)
      return [];
    const lines = [];
    if (activeLyricLineIndex < 0) {
      for (let index = 0;index < Math.min(windowSize, syncedLyrics.length); index++) {
        const line = syncedLyrics[index];
        lines.push({ text: line.text || EMPTY_SYNCED_LINE_SYMBOL2, index });
      }
    } else {
      const start = Math.max(0, Math.min(activeLyricLineIndex - 2, syncedLyrics.length - windowSize));
      for (let offset = 0;offset < windowSize && start + offset < syncedLyrics.length; offset++) {
        const index = start + offset;
        const line = syncedLyrics[index];
        lines.push({ text: line.text || EMPTY_SYNCED_LINE_SYMBOL2, index });
      }
    }
    while (lines.length < windowSize) {
      lines.push({ text: " ", index: -1 - lines.length });
    }
    return lines;
  }
  function renderLyricsWindow() {
    if (lyricsLoading) {
      setLyricsStatus("Loading lyrics...", true);
      return;
    }
    if (lyricsInstrumental) {
      setLyricsStatus("♪ Instrumental");
      return;
    }
    if (syncedLyrics.length > 0) {
      showLyricRows();
      const lines = getLyricWindow();
      lyricLineEls.forEach((el, idx) => {
        const line = lines[idx] ?? { text: " ", index: -1 - idx };
        const distance = activeLyricLineIndex < 0 ? line.index : Math.abs(line.index - activeLyricLineIndex);
        el.className = "spotify-mini-lyric-line";
        if (line.index === activeLyricLineIndex)
          el.classList.add("spotify-mini-lyric-line-active");
        else if (distance === 1)
          el.classList.add("spotify-mini-lyric-line-near");
        else if (distance === 2)
          el.classList.add("spotify-mini-lyric-line-mid");
        else
          el.classList.add("spotify-mini-lyric-line-far");
        el.textContent = line.text;
      });
      return;
    }
    if (plainLyricLines.length > 0) {
      showLyricRows();
      lyricLineEls.forEach((el, idx) => {
        el.className = "spotify-mini-lyric-line spotify-mini-lyric-line-plain";
        el.textContent = plainLyricLines[idx] ?? " ";
      });
      return;
    }
    setLyricsStatus("No lyrics available");
  }
  function updateActiveLyricLine(force = false) {
    if (lyricsUpdateSuspended) {
      pendingLyricsRefresh = true;
      return;
    }
    if (currentStyle !== "modern" || syncedLyrics.length === 0 || !currentState || currentState.trackUri !== lyricsTrackUri) {
      if (force && currentStyle === "modern")
        renderLyricsWindow();
      return;
    }
    const progressMs = getInterpolatedProgressMs();
    let nextActiveLineIndex = -1;
    for (let i = 0;i < syncedLyrics.length; i++) {
      if (syncedLyrics[i].timeMs > progressMs)
        break;
      nextActiveLineIndex = i;
    }
    if (force || nextActiveLineIndex !== activeLyricLineIndex) {
      activeLyricLineIndex = nextActiveLineIndex;
      renderLyricsWindow();
    }
  }
  function refreshLyrics(reposition = false) {
    const shouldShowLyrics = currentStyle === "modern" && currentConnected && Boolean(currentState);
    lyricsSection.style.display = shouldShowLyrics ? "" : "none";
    if (!shouldShowLyrics)
      return;
    if (lyricsUpdateSuspended) {
      pendingLyricsRefresh = true;
      return;
    }
    updateActiveLyricLine(true);
    if (reposition && visible)
      applyPosition();
  }
  function tickProgress() {
    if (uiSuspended || !visible || !lastIsPlaying || !currentDuration) {
      animFrameId = null;
      return;
    }
    const elapsed = Date.now() - lastUpdateTime;
    const interpolated = Math.min(lastProgressMs + elapsed, currentDuration);
    const pct = interpolated / currentDuration * 100;
    progressFill.style.width = `${pct}%`;
    progressTime.textContent = formatTime2(interpolated);
    updateActiveLyricLine();
    animFrameId = requestAnimationFrame(tickProgress);
  }
  function startTicking() {
    if (animFrameId !== null)
      return;
    animFrameId = requestAnimationFrame(tickProgress);
  }
  function stopTicking() {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }
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
    if (!currentDuration)
      return;
    const rect = progressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    sendToBackend({ type: "seek", positionMs: Math.round(pct * currentDuration) });
  });
  let volumeDebounce = null;
  const volumeChangeHandlers = new Set;
  volumeSlider.addEventListener("input", (e) => {
    e.stopPropagation();
    const percent = parseInt(volumeSlider.value, 10);
    for (const h of volumeChangeHandlers)
      h(percent);
    if (volumeDebounce)
      clearTimeout(volumeDebounce);
    volumeDebounce = setTimeout(() => {
      sendToBackend({ type: "set_volume", percent });
    }, 200);
  });
  let deviceListOpen = false;
  let currentDeviceId = null;
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
  function onDocClick(e) {
    if (!root.contains(e.target)) {
      hide();
    }
  }
  function applyPosition() {
    const { x: ax, y: ay, w: aw, h: ah } = getWidgetRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const popupW = getPopupWidth(currentStyle);
    let left = ax + aw / 2 - popupW / 2;
    left = Math.max(GAP, Math.min(left, vw - popupW - GAP));
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
    let top;
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
    const originX = ax + aw / 2 - left;
    const originY = below ? -GAP : popupH + GAP;
    root.style.transformOrigin = `${originX}px ${originY}px`;
  }
  function repositionFast() {
    if (!visible || !cachedPopupH)
      return;
    const { x: ax, y: ay, w: aw, h: ah } = getWidgetRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const popupW = getPopupWidth(currentStyle);
    let left = ax + aw / 2 - popupW / 2;
    left = Math.max(GAP, Math.min(left, vw - popupW - GAP));
    let top;
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
  function show() {
    if (!document.body.contains(root)) {
      document.body.appendChild(root);
    }
    applyPosition();
    root.classList.remove("open", "closing");
    root.offsetHeight;
    root.classList.add("open");
    visible = true;
    if (lastIsPlaying)
      startTicking();
    setTimeout(() => document.addEventListener("click", onDocClick), 0);
  }
  function hide() {
    if (!visible)
      return;
    visible = false;
    document.removeEventListener("click", onDocClick);
    stopTicking();
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
  function update(state, connected) {
    currentState = state;
    currentConnected = connected;
    if (uiSuspended) {
      pendingPlaybackRefresh = { state, connected };
      return;
    }
    if (!connected || !state) {
      art.setUrl(null);
      header.style.display = "none";
      progressRow.style.display = "none";
      lyricsSection.style.display = "none";
      controls.style.display = "none";
      volumeRow.style.display = "none";
      deviceRow.style.display = "none";
      deviceList.style.display = "none";
      deviceListOpen = false;
      emptyState.style.display = "";
      emptyState.textContent = !connected ? "Connect to Spotify in Settings" : "No active playback";
      currentDuration = 0;
      progressFill.style.width = "0%";
      progressTime.textContent = formatTime2(0);
      durationTime.textContent = formatTime2(0);
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
    albumName.textContent = state.albumName;
    currentDuration = state.durationMs;
    art.setUrl(getTrackScopedArtUrl(state.albumArtUrl, state.trackUri));
    isPlaying = state.isPlaying;
    lastIsPlaying = state.isPlaying;
    lastProgressMs = state.progressMs;
    lastUpdateTime = Date.now();
    playPauseBtn.innerHTML = isPlaying ? ICON_PAUSE2 : ICON_PLAY2;
    const pct = state.durationMs > 0 ? state.progressMs / state.durationMs * 100 : 0;
    progressFill.style.width = `${pct}%`;
    progressTime.textContent = formatTime2(state.progressMs);
    durationTime.textContent = formatTime2(state.durationMs);
    if (state.volume !== null) {
      volumeSlider.value = String(state.volume);
    }
    if (visible && isPlaying) {
      startTicking();
    } else {
      stopTicking();
    }
    refreshLyrics();
  }
  function updateLyrics(trackUri, plainLyrics, syncedLyricsText, instrumental) {
    lyricsTrackUri = trackUri;
    syncedLyrics = parseSyncedLyrics(syncedLyricsText);
    plainLyricLines = getCompactPlainLyricLines(plainLyrics);
    lyricsInstrumental = instrumental;
    lyricsLoading = false;
    activeLyricLineIndex = -1;
    refreshLyrics(true);
  }
  function setLyricsLoading(loading) {
    lyricsLoading = loading;
    if (loading) {
      lyricsTrackUri = currentState?.trackUri ?? null;
      syncedLyrics = [];
      plainLyricLines = [];
      lyricsInstrumental = false;
      activeLyricLineIndex = -1;
    }
    refreshLyrics(true);
  }
  function setStyle(style) {
    currentStyle = style;
    root.dataset.style = style;
    root.style.setProperty("--spotify-mini-player-width", `${getPopupWidth(style)}px`);
    refreshLyrics(true);
    if (visible)
      applyPosition();
  }
  function setDevices(devices) {
    if (uiSuspended) {
      pendingDevices = devices;
      return;
    }
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
  function setVolume(percent) {
    if (uiSuspended) {
      pendingVolume = percent;
      return;
    }
    volumeSlider.value = String(percent);
  }
  return {
    root,
    update,
    updateLyrics,
    setLyricsLoading,
    setLyricsUpdateSuspended(suspended) {
      lyricsUpdateSuspended = suspended;
      if (!suspended)
        flushPendingLyricsRefresh();
    },
    setUiSuspended(suspended) {
      uiSuspended = suspended;
      lyricsUpdateSuspended = suspended;
      if (suspended) {
        stopTicking();
        return;
      }
      flushPendingUiRefresh();
      if (visible && lastIsPlaying)
        startTicking();
    },
    setStyle,
    setDevices,
    setVolume,
    onVolumeChange(handler) {
      volumeChangeHandlers.add(handler);
    },
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
      if (volumeDebounce)
        clearTimeout(volumeDebounce);
      volumeChangeHandlers.clear();
      root.remove();
    }
  };
}

// src/ui/modern-widget-player.ts
var USER_SCROLL_SUPPRESS_MS = 2500;
var ICON_PREV3 = `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`;
var ICON_PLAY3 = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
var ICON_PAUSE3 = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
var ICON_NEXT3 = `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`;
var ICON_VOLUME3 = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
var ICON_EXPAND2 = `<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`;
var ICON_COLLAPSE2 = `<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>`;
var ICON_NOTE = `<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
var MARQUEE_REST_MS = 4000;
function formatTime3(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
function getCompactPlainLyricLines2(lyrics) {
  if (!lyrics)
    return [];
  return lyrics.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}
function stopEventPropagation(el) {
  el.addEventListener("pointerdown", (e) => e.stopPropagation());
  el.addEventListener("click", (e) => e.stopPropagation());
}
function createMarqueeLabel(baseClass) {
  const root = document.createElement("div");
  root.className = `${baseClass} spotify-modern-widget-marquee`;
  root.dataset.marqueePhase = "idle";
  const content = document.createElement("div");
  content.className = `${baseClass}-content spotify-modern-widget-marquee-content`;
  root.appendChild(content);
  let marqueeCycleTimer = null;
  function stopMarquee() {
    if (marqueeCycleTimer) {
      clearTimeout(marqueeCycleTimer);
      marqueeCycleTimer = null;
    }
    root.dataset.marqueePhase = "idle";
    content.classList.remove("spotify-modern-widget-marquee-animate");
  }
  function startMarqueePass(restart) {
    root.dataset.marqueePhase = "scrolling";
    content.classList.remove("spotify-modern-widget-marquee-animate");
    if (restart) {
      content.offsetWidth;
    }
    content.classList.add("spotify-modern-widget-marquee-animate");
  }
  function queueMarqueeStart(restart) {
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
    setText(value) {
      content.textContent = value;
      root.setAttribute("aria-label", value);
    },
    refresh(expanded, restart = false) {
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
      if (restart || !isQueued && !isScrolling) {
        queueMarqueeStart(restart);
      }
    }
  };
}
function createModernWidgetPlayerUI(sendToBackend, onExpandClick, onCollapseClick) {
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
  openFullBtn.innerHTML = ICON_EXPAND2;
  openFullBtn.title = "Open full player";
  const collapseBtn = document.createElement("button");
  collapseBtn.className = "spotify-modern-widget-icon-btn";
  collapseBtn.innerHTML = ICON_COLLAPSE2;
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
  heroArt.el.title = "Collapse";
  const heroFallback = document.createElement("div");
  heroFallback.className = "spotify-modern-widget-art-fallback";
  heroFallback.innerHTML = ICON_NOTE;
  heroFallback.title = "Collapse";
  stopEventPropagation(heroArt.el);
  stopEventPropagation(heroFallback);
  heroArt.el.addEventListener("click", () => onCollapseClick());
  heroFallback.addEventListener("click", () => onCollapseClick());
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
  prevBtn.innerHTML = ICON_PREV3;
  const playPauseBtn = document.createElement("button");
  playPauseBtn.className = "spotify-modern-widget-btn spotify-modern-widget-btn-main";
  playPauseBtn.innerHTML = ICON_PLAY3;
  const nextBtn = document.createElement("button");
  nextBtn.className = "spotify-modern-widget-btn";
  nextBtn.innerHTML = ICON_NEXT3;
  controls.appendChild(prevBtn);
  controls.appendChild(playPauseBtn);
  controls.appendChild(nextBtn);
  const volumeRow = document.createElement("div");
  volumeRow.className = "spotify-modern-widget-volume-row";
  const volumeIcon = document.createElement("span");
  volumeIcon.className = "spotify-modern-widget-volume-icon";
  volumeIcon.innerHTML = ICON_VOLUME3;
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
  const emptyIcon = document.createElement("div");
  emptyIcon.className = "spotify-modern-widget-empty-icon";
  emptyIcon.innerHTML = ICON_NOTE;
  const emptyTitle = document.createElement("div");
  emptyTitle.className = "spotify-modern-widget-empty-title";
  emptyTitle.textContent = "No music playing.";
  const emptySubtitle = document.createElement("div");
  emptySubtitle.className = "spotify-modern-widget-empty-subtitle";
  emptySubtitle.textContent = "Your speakers are enjoying a brief moment of mindfulness.";
  emptyState.appendChild(emptyIcon);
  emptyState.appendChild(emptyTitle);
  emptyState.appendChild(emptySubtitle);
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
  let state = null;
  let isExpandedState = false;
  let currentDuration = 0;
  let lastProgressMs = 0;
  let lastUpdateTime = 0;
  let lastIsPlaying = false;
  let animFrameId = null;
  let lyricsTrackUri = null;
  const syncedLyricsModel = createSyncedLyricsModel();
  let plainLyricLines = [];
  let lyricsInstrumental = false;
  let lyricsLoading = false;
  let volumeDebounce = null;
  let lastRenderedLyricSignature = "";
  let syncedLyricEls = [];
  let autoScrollTimer = null;
  let isAutoScrolling = false;
  let lastUserScrollAt = 0;
  let lastMetadataSignature = "";
  let marqueeRefreshTimer = null;
  let marqueeRefreshTimerLate = null;
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
    if (!isAutoScrolling)
      lastUserScrollAt = Date.now();
  }, { passive: true });
  function refreshMarquees(restart) {
    requestAnimationFrame(() => {
      trackName.refresh(isExpandedState, restart);
      artistName.refresh(isExpandedState, restart);
      albumName.refresh(isExpandedState, restart);
    });
  }
  function scheduleMarqueeRefresh(restart) {
    if (marqueeRefreshTimer)
      clearTimeout(marqueeRefreshTimer);
    if (marqueeRefreshTimerLate)
      clearTimeout(marqueeRefreshTimerLate);
    refreshMarquees(restart);
    marqueeRefreshTimer = setTimeout(() => refreshMarquees(restart), 180);
    marqueeRefreshTimerLate = setTimeout(() => refreshMarquees(restart), 460);
  }
  function renderCompactArt(trackArtUrl) {
    compactArt.setUrl(trackArtUrl);
    compactFallback.style.display = trackArtUrl ? "none" : "flex";
  }
  function renderHeroArt(trackArtUrl) {
    heroArt.setUrl(trackArtUrl);
    heroFallback.style.display = trackArtUrl ? "none" : "flex";
  }
  function getInterpolatedProgressMs() {
    if (!lastIsPlaying)
      return lastProgressMs;
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
      if (!el)
        return;
      el.className = "spotify-modern-widget-lyric-line";
      if (shouldReserveScaleGutter(line.text)) {
        el.classList.add("spotify-modern-widget-lyric-line-long");
      }
      if (line.index === activeLineIndex) {
        el.classList.add("active");
      } else if (activeLineIndex >= 0) {
        const distance = Math.abs(line.index - activeLineIndex);
        if (distance === 1)
          el.classList.add("near");
        else if (distance === 2)
          el.classList.add("mid");
        else
          el.classList.add("far");
      } else {
        el.classList.add("far");
      }
    });
    const activeEl = activeLineIndex >= 0 ? syncedLyricEls[activeLineIndex] : syncedLyricEls[0];
    if (!activeEl || !shouldAutoscroll)
      return;
    const shouldCenter = Date.now() - lastUserScrollAt > USER_SCROLL_SUPPRESS_MS;
    if (!shouldCenter)
      return;
    requestAnimationFrame(() => {
      const targetScrollTop = activeEl.offsetTop + activeEl.offsetHeight / 2 - lyricsBody.clientHeight / 2;
      const maxScrollTop = Math.max(0, lyricsBody.scrollHeight - lyricsBody.clientHeight);
      isAutoScrolling = true;
      lyricsBody.scrollTo({
        top: Math.max(0, Math.min(targetScrollTop, maxScrollTop)),
        behavior: "smooth"
      });
      if (autoScrollTimer)
        clearTimeout(autoScrollTimer);
      autoScrollTimer = setTimeout(stopAutoScrollTracking, 700);
    });
  }
  function renderLyrics() {
    clearLyricsTrack();
    if (!connected || !state) {
      lastRenderedLyricSignature = "";
      const status2 = document.createElement("div");
      status2.className = "spotify-modern-widget-lyrics-status";
      status2.textContent = connected ? "Start playback to see lyrics" : "Connect Spotify to see lyrics";
      lyricsTrack.appendChild(status2);
      return;
    }
    if (lyricsLoading) {
      lastRenderedLyricSignature = "loading";
      const status2 = document.createElement("div");
      status2.className = "spotify-modern-widget-lyrics-status spotify-modern-widget-lyrics-status-loading";
      status2.textContent = "Loading lyrics...";
      lyricsTrack.appendChild(status2);
      return;
    }
    if (lyricsInstrumental) {
      lastRenderedLyricSignature = "instrumental";
      const status2 = document.createElement("div");
      status2.className = "spotify-modern-widget-lyrics-status";
      status2.textContent = "♪ Instrumental";
      lyricsTrack.appendChild(status2);
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
      if (force)
        renderLyrics();
      return;
    }
    syncedLyricsModel.setPlayback({
      trackUri: state.trackUri,
      progressMs: getInterpolatedProgressMs(),
      durationMs: currentDuration,
      isPlaying: lastIsPlaying,
      updatedAt: Date.now()
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
    const pct = currentDuration > 0 ? interpolated / currentDuration * 100 : 0;
    progressFill.style.width = `${pct}%`;
    compactProgressFill.style.width = `${pct}%`;
    progressTime.textContent = formatTime3(interpolated);
    updateActiveLyricLine();
    animFrameId = requestAnimationFrame(tickProgress);
  }
  function startTicking() {
    if (animFrameId !== null)
      return;
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
    if (!currentDuration)
      return;
    const rect = progressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    sendToBackend({ type: "seek", positionMs: Math.round(pct * currentDuration) });
  });
  volumeSlider.addEventListener("input", () => {
    const percent = parseInt(volumeSlider.value, 10);
    if (volumeDebounce)
      clearTimeout(volumeDebounce);
    volumeDebounce = setTimeout(() => sendToBackend({ type: "set_volume", percent }), 160);
  });
  function update(playbackState, isConnected) {
    state = playbackState;
    connected = isConnected;
    root.dataset.empty = !playbackState ? "true" : "false";
    if (!isConnected || !playbackState) {
      eyebrow.textContent = isConnected ? "Standby" : "Connect Spotify";
      compactStatus.textContent = isConnected ? "No playback" : "Connect Spotify";
      emptyState.style.display = "grid";
      hero.style.display = "none";
      progressRow.style.display = "none";
      lyricsSection.style.display = "none";
      controls.style.display = "none";
      volumeRow.style.display = "none";
      compactProgressFill.style.width = "0%";
      renderCompactArt(null);
      renderHeroArt(null);
      syncedLyricsModel.setPlayback(null);
      lastMetadataSignature = "";
      stopTicking();
      renderLyrics();
      return;
    }
    eyebrow.textContent = "Now Playing";
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
      updatedAt: lastUpdateTime
    });
    playPauseBtn.innerHTML = playbackState.isPlaying ? ICON_PAUSE3 : ICON_PLAY3;
    volumeSlider.value = String(playbackState.volume ?? Number(volumeSlider.value));
    const pct = playbackState.durationMs > 0 ? playbackState.progressMs / playbackState.durationMs * 100 : 0;
    progressFill.style.width = `${pct}%`;
    compactProgressFill.style.width = `${pct}%`;
    progressTime.textContent = formatTime3(playbackState.progressMs);
    durationTime.textContent = formatTime3(playbackState.durationMs);
    if (syncedLyricsModel.hasLyrics() && playbackState.trackUri === lyricsTrackUri) {
      if (syncedLyricEls.length === 0)
        renderLyrics();
      else
        updateActiveLyricLine();
    } else if (lyricsTrack.childElementCount === 0) {
      renderLyrics();
    }
    scheduleMarqueeRefresh(metadataChanged);
    if (playbackState.isPlaying)
      startTicking();
    else
      stopTicking();
  }
  function updateLyrics(trackUri, plainLyrics, syncedLyricsText, instrumental) {
    lyricsTrackUri = trackUri;
    const parsedSyncedLyrics = parseSyncedLyrics(syncedLyricsText);
    syncedLyricsModel.setLyrics(parsedSyncedLyrics);
    plainLyricLines = getCompactPlainLyricLines2(plainLyrics);
    lyricsInstrumental = instrumental;
    lyricsLoading = false;
    updateActiveLyricLine(true);
  }
  function setLyricsLoading(loading) {
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
    setCollapsedSize(size) {
      root.style.setProperty("--spotify-modern-widget-collapsed-size", `${size}px`);
    },
    setExpanded(expandedValue) {
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
      if (volumeDebounce)
        clearTimeout(volumeDebounce);
      if (marqueeRefreshTimer)
        clearTimeout(marqueeRefreshTimer);
      if (marqueeRefreshTimerLate)
        clearTimeout(marqueeRefreshTimerLate);
      marqueeObserver.disconnect();
      compactArt.destroy();
      heroArt.destroy();
      root.remove();
    }
  };
}

// src/ui/lyrics.ts
var USER_SCROLL_SUPPRESS_MS2 = 2500;
var LOADING_STATUS_DELAY_MS = 180;
var SEEK_SYNC_TOLERANCE_MS = 1400;
var SEEK_STATE_GRACE_MS = 1800;
function getLineClassName(index, activeLineIndex, hasText) {
  const classes = ["spotify-lyrics-line"];
  if (!hasText)
    classes.push("spotify-lyrics-line-blank");
  if (index === activeLineIndex)
    classes.push("spotify-lyrics-line-active");
  else if (index < activeLineIndex)
    classes.push("spotify-lyrics-line-past");
  else
    classes.push("spotify-lyrics-line-future");
  if (activeLineIndex >= 0) {
    const distance = Math.abs(index - activeLineIndex);
    if (distance === 1)
      classes.push("spotify-lyrics-line-tier-1");
    else if (distance === 2)
      classes.push("spotify-lyrics-line-tier-2");
    else if (distance === 3)
      classes.push("spotify-lyrics-line-tier-3");
    else if (distance >= 4)
      classes.push("spotify-lyrics-line-tier-4");
  }
  return classes.join(" ");
}
function createLyricsUI(onSeek) {
  const root = document.createElement("div");
  root.className = "spotify-section spotify-lyrics-section";
  const title = document.createElement("h3");
  title.className = "spotify-section-title";
  title.textContent = "Lyrics";
  root.appendChild(title);
  const body = document.createElement("div");
  body.className = "spotify-lyrics-body";
  root.appendChild(body);
  let currentTrackUri = null;
  let syncedLines = [];
  const syncedLyricsModel = createSyncedLyricsModel();
  let playback = null;
  let activeLineIndex = -1;
  let tickTimer = null;
  let autoScrollTimer = null;
  let loadingTimer = null;
  let isAutoScrolling = false;
  let lastUserScrollAt = 0;
  let pendingSeekPositionMs = null;
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
    if (!isAutoScrolling)
      lastUserScrollAt = Date.now();
  }, { passive: true });
  function stopTicking() {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  }
  function startTicking() {
    if (tickTimer || syncedLines.length === 0)
      return;
    tickTimer = setInterval(updateActiveLine, 200);
  }
  function centerLine(line, behavior = "smooth") {
    requestAnimationFrame(() => {
      const bodyRect = body.getBoundingClientRect();
      const textRect = line.textEl.getBoundingClientRect();
      const targetScrollTop = body.scrollTop + (textRect.top + textRect.height / 2) - (bodyRect.top + body.clientHeight / 2);
      const maxScrollTop = Math.max(0, body.scrollHeight - body.clientHeight);
      body.scrollTo({ top: Math.max(0, Math.min(targetScrollTop, maxScrollTop)), behavior });
    });
  }
  function updateLineClasses(nextActiveLineIndex, options = {}) {
    activeLineIndex = nextActiveLineIndex;
    syncedLines.forEach((line, index) => {
      line.el.className = getLineClassName(line.index, activeLineIndex, Boolean(line.text));
    });
    const activeLine = syncedLines.find((line) => line.index === activeLineIndex);
    const shouldCenter = options.forceCenter || Date.now() - lastUserScrollAt > USER_SCROLL_SUPPRESS_MS2;
    if (activeLine && shouldCenter) {
      isAutoScrolling = true;
      if (autoScrollTimer)
        clearTimeout(autoScrollTimer);
      centerLine(activeLine, options.behavior);
      autoScrollTimer = setTimeout(stopAutoScrollTracking, 700);
    }
  }
  function updateActiveLine() {
    if (syncedLines.length === 0)
      return;
    if (syncedLyricsModel.refreshActiveLineIndex()) {
      updateLineClasses(syncedLyricsModel.getActiveLineIndex());
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
    syncedLyricsModel.clear();
    playback = null;
    activeLineIndex = -1;
    pendingSeekPositionMs = null;
    pendingSeekUntil = 0;
  }
  function setLoading(loading) {
    stopLoadingState();
    if (!loading)
      return;
    if (loading) {
      stopTicking();
      stopAutoScrollTracking();
      body.innerHTML = "";
      body.className = "spotify-lyrics-body spotify-lyrics-loading";
      syncedLines = [];
      syncedLyricsModel.clear();
      activeLineIndex = -1;
      loadingTimer = setTimeout(() => {
        loadingTimer = null;
        if (!body.classList.contains("spotify-lyrics-loading"))
          return;
        const el = document.createElement("div");
        el.className = "spotify-lyrics-status spotify-lyrics-status-loading";
        el.textContent = "Loading lyrics...";
        body.appendChild(el);
      }, LOADING_STATUS_DELAY_MS);
    }
  }
  function renderSyncedLyrics(lines) {
    stopLoadingState();
    body.className = "spotify-lyrics-body spotify-lyrics-has-content spotify-lyrics-synced";
    syncedLyricsModel.setLyrics(lines);
    const snapshot = syncedLyricsModel.getSnapshot();
    activeLineIndex = snapshot.activeLineIndex;
    syncedLines = snapshot.lines.map((line, renderIndex) => {
      const el = document.createElement("div");
      const textEl = document.createElement("div");
      el.className = getLineClassName(line.index, activeLineIndex, line.hasText);
      el.classList.add("spotify-lyrics-line-enter");
      el.style.setProperty("--spotify-lyrics-enter-delay", `${Math.min(renderIndex * 28, 280)}ms`);
      textEl.className = "spotify-lyrics-line-text";
      if (!line.hasText)
        textEl.classList.add("spotify-lyrics-line-symbol");
      if (shouldReserveScaleGutter(line.text))
        textEl.classList.add("spotify-lyrics-line-text-long");
      textEl.textContent = line.displayText;
      el.appendChild(textEl);
      el.addEventListener("click", () => {
        pendingSeekPositionMs = line.timeMs;
        pendingSeekUntil = Date.now() + SEEK_STATE_GRACE_MS;
        if (playback && playback.trackUri === currentTrackUri) {
          playback = {
            ...playback,
            progressMs: line.timeMs,
            updatedAt: Date.now()
          };
          syncedLyricsModel.setPlayback(playback);
        }
        updateLineClasses(line.index, { forceCenter: true, behavior: "smooth" });
        onSeek?.(line.timeMs);
      });
      body.appendChild(el);
      return { index: line.index, timeMs: line.timeMs, text: line.text, el, textEl };
    });
    updateActiveLine();
    if (playback?.isPlaying)
      startTicking();
  }
  function renderPlainLyrics(lyrics) {
    stopLoadingState();
    body.className = "spotify-lyrics-body spotify-lyrics-has-content";
    const pre = document.createElement("div");
    pre.className = "spotify-lyrics-text spotify-lyrics-text-enter";
    pre.textContent = lyrics;
    body.appendChild(pre);
  }
  function update(trackUri, plainLyrics, syncedLyrics, instrumental) {
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
  function updatePlayback(state) {
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
      updatedAt: Date.now()
    };
    syncedLyricsModel.setPlayback(playback);
    updateActiveLine();
    if (state.isPlaying)
      startTicking();
    else
      stopTicking();
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
    }
  };
}

// src/frontend.ts
var SPOTIFY_ICON_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.224-2.719a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.517.781.781 0 01.517-.972c3.632-1.102 8.147-.568 11.236 1.327a.78.78 0 01.257 1.071zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.936.936 0 11-.543-1.791c3.532-1.072 9.404-.865 13.115 1.338a.936.936 0 01-.954 1.613z"/></svg>`;
var MUSIC_NOTE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
function setup(ctx) {
  const cleanups = [];
  const removeStyle = ctx.dom.addStyle(PANEL_CSS);
  cleanups.push(removeStyle);
  let currentState = null;
  let connected = false;
  const DEFAULT_SIZE_PRESETS = { small: 36, medium: 48, large: 64 };
  const MODERN_SIZE_PRESETS = { small: 112, medium: 128, large: 144 };
  const DEFAULT_WIDGET_SIZE_MIN = 24;
  const DEFAULT_WIDGET_SIZE_MAX = 128;
  const MODERN_WIDGET_SIZE_MIN = 112;
  const MODERN_WIDGET_SIZE_MAX = 192;
  const PREFS_KEY = "spotify-controls-widget-prefs";
  function getSizePresets(style) {
    return style === "modern" ? MODERN_SIZE_PRESETS : DEFAULT_SIZE_PRESETS;
  }
  function getSizeBounds(style) {
    return style === "modern" ? { min: MODERN_WIDGET_SIZE_MIN, max: MODERN_WIDGET_SIZE_MAX } : { min: DEFAULT_WIDGET_SIZE_MIN, max: DEFAULT_WIDGET_SIZE_MAX };
  }
  function clampWidgetSize(size, style) {
    const { min, max } = getSizeBounds(style);
    return Math.max(min, Math.min(size, max));
  }
  function isSizeMode(value) {
    return value === "small" || value === "medium" || value === "large" || value === "custom";
  }
  function inferSizeMode(size, style) {
    const presets = getSizePresets(style);
    if (size === presets.small)
      return "small";
    if (size === presets.large)
      return "large";
    if (size !== presets.medium)
      return "custom";
    return "medium";
  }
  function normalizeWidgetPrefs(prefs) {
    const miniPlayerStyle = prefs?.miniPlayerStyle === "modern" ? "modern" : "default";
    const presets = getSizePresets(miniPlayerStyle);
    let sizeMode = isSizeMode(prefs?.sizeMode) ? prefs.sizeMode : undefined;
    let size = typeof prefs?.size === "number" ? clampWidgetSize(prefs.size, miniPlayerStyle) : presets.medium;
    if (sizeMode && sizeMode !== "custom") {
      size = presets[sizeMode];
    } else if (!sizeMode) {
      sizeMode = inferSizeMode(size, miniPlayerStyle);
    }
    return {
      size,
      shape: prefs?.shape === "squircle" ? "squircle" : "circle",
      sizeMode,
      miniPlayerStyle,
      x: typeof prefs?.x === "number" ? prefs.x : undefined,
      y: typeof prefs?.y === "number" ? prefs.y : undefined
    };
  }
  let currentWidgetSize = 48;
  let currentArtShape = "circle";
  let currentSizeMode = "medium";
  let currentMiniPlayerStyle = "default";
  let savedX;
  let savedY;
  try {
    const saved = normalizeWidgetPrefs(JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"));
    currentWidgetSize = saved.size;
    currentArtShape = saved.shape;
    currentSizeMode = saved.sizeMode;
    currentMiniPlayerStyle = saved.miniPlayerStyle;
    savedX = saved.x;
    savedY = saved.y;
  } catch {}
  let lastKnownPos = null;
  function saveWidgetPrefs() {
    const pos = lastKnownPos ?? widget.getPosition();
    const prefs = {
      size: currentWidgetSize,
      shape: currentArtShape,
      sizeMode: currentSizeMode,
      miniPlayerStyle: currentMiniPlayerStyle,
      x: pos.x,
      y: pos.y
    };
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    sendToBackend({ type: "save_widget_prefs", prefs });
  }
  let savePositionTimer = null;
  function debounceSavePosition(pos) {
    lastKnownPos = pos;
    if (savePositionTimer)
      clearTimeout(savePositionTimer);
    savePositionTimer = setTimeout(saveWidgetPrefs, 500);
  }
  function getServerBaseUrl() {
    const { port } = window.location;
    return `http://127.0.0.1${port ? `:${port}` : ""}`;
  }
  function sendToBackend(msg) {
    ctx.sendToBackend(msg);
  }
  let lastThemeArtUrl = null;
  let themeApplySeq = 0;
  let pendingThemeClearTimer = null;
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
  function scheduleAlbumThemeClear(delayMs = 1800) {
    cancelPendingThemeClear();
    pendingThemeClearTimer = setTimeout(() => {
      pendingThemeClearTimer = null;
      clearAlbumTheme();
    }, delayMs);
  }
  function extractColorsFromImage(url) {
    return new Promise((resolve) => {
      const img = new Image;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const S = 32;
          canvas.width = S;
          canvas.height = S;
          const c = canvas.getContext("2d");
          if (!c) {
            resolve(null);
            return;
          }
          c.drawImage(img, 0, 0, S, S);
          const px = c.getImageData(0, 0, S, S).data;
          let bestH = 0, bestS = 0, bestL = 0.5, bestScore = -1;
          let rTotal = 0, gTotal = 0, bTotal = 0, n = 0;
          for (let i = 0;i < px.length; i += 4) {
            const r = px[i], g = px[i + 1], b = px[i + 2];
            rTotal += r;
            gTotal += g;
            bTotal += b;
            n++;
            const rn = r / 255, gn = g / 255, bn = b / 255;
            const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
            const l = (max + min) / 2;
            let h = 0, s = 0;
            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              if (max === rn)
                h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
              else if (max === gn)
                h = ((bn - rn) / d + 2) / 6;
              else
                h = ((rn - gn) / d + 4) / 6;
            }
            const score = s * (1 - Math.abs(l - 0.5) * 1.6);
            if (score > bestScore) {
              bestScore = score;
              bestH = h;
              bestS = s;
              bestL = l;
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
              l: Math.round(bestL * 100)
            },
            isLight: luminance > 152
          });
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
  const settingsMount = ctx.ui.mount("settings_extensions");
  const settingsUI = createSettingsUI(sendToBackend, getServerBaseUrl);
  settingsMount.appendChild(settingsUI.root);
  cleanups.push(() => settingsUI.destroy());
  let widgetSizeLabelTitle = null;
  let widgetSizeHint = null;
  let widgetSizeInputRef = null;
  function updateWidgetCustomizationUI() {
    const { min, max } = getSizeBounds(currentMiniPlayerStyle);
    if (widgetSizeLabelTitle) {
      widgetSizeLabelTitle.textContent = currentMiniPlayerStyle === "modern" ? "Collapsed Modern Player Size (px)" : "Custom Widget Size (px)";
    }
    if (widgetSizeHint) {
      widgetSizeHint.textContent = currentMiniPlayerStyle === "modern" ? "Controls the compact size of the modern player before it expands." : "Controls the floating widget size.";
    }
    if (widgetSizeInputRef) {
      widgetSizeInputRef.min = String(min);
      widgetSizeInputRef.max = String(max);
      widgetSizeInputRef.placeholder = currentMiniPlayerStyle === "modern" ? "e.g. 128" : "e.g. 56";
      widgetSizeInputRef.value = currentSizeMode === "custom" ? String(currentWidgetSize) : "";
    }
  }
  const settingsBody = settingsUI.root.querySelector(".spotify-settings-card-body");
  if (settingsBody) {
    const widgetDivider = document.createElement("div");
    widgetDivider.style.cssText = "height:1px;background:var(--lumiverse-border);margin:4px 0";
    settingsBody.appendChild(widgetDivider);
    const widgetSizeLabel = document.createElement("label");
    widgetSizeLabel.className = "spotify-settings-label";
    widgetSizeLabelTitle = document.createElement("span");
    widgetSizeLabel.appendChild(widgetSizeLabelTitle);
    widgetSizeHint = document.createElement("div");
    widgetSizeHint.style.cssText = "font-size:0.8em;opacity:0.6;margin-top:2px";
    const widgetSizeRow = document.createElement("div");
    widgetSizeRow.className = "spotify-settings-row";
    const widgetSizeInput = document.createElement("input");
    widgetSizeInput.className = "spotify-input";
    widgetSizeInput.type = "number";
    widgetSizeInput.style.width = "80px";
    widgetSizeInputRef = widgetSizeInput;
    const widgetSizeBtn = document.createElement("button");
    widgetSizeBtn.className = "spotify-btn spotify-btn-primary";
    widgetSizeBtn.textContent = "Apply";
    widgetSizeBtn.style.fontSize = "0.85em";
    widgetSizeBtn.style.padding = "4px 12px";
    widgetSizeBtn.addEventListener("click", () => {
      const val = parseInt(widgetSizeInput.value, 10);
      const { min, max } = getSizeBounds(currentMiniPlayerStyle);
      if (isNaN(val) || val < min || val > max)
        return;
      currentSizeMode = "custom";
      recreateWidget(val);
    });
    widgetSizeRow.appendChild(widgetSizeInput);
    widgetSizeRow.appendChild(widgetSizeBtn);
    widgetSizeLabel.appendChild(widgetSizeRow);
    widgetSizeLabel.appendChild(widgetSizeHint);
    settingsBody.appendChild(widgetSizeLabel);
  }
  updateWidgetCustomizationUI();
  const tab = ctx.ui.registerDrawerTab({
    id: "spotify",
    title: "Spotify Controls",
    shortName: "Spotify",
    description: "Control Spotify playback, search for music, and view lyrics",
    keywords: ["music", "player", "now playing", "song", "track", "album", "lyrics"],
    headerTitle: "Spotify",
    iconSvg: SPOTIFY_ICON_SVG
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
  cleanups.push(() => nowPlayingUI.destroy(), () => controlsUI.destroy(), () => searchUI.destroy(), () => lyricsUI.destroy());
  let lastLyricsTrackUri = null;
  let widget = ctx.ui.createFloatWidget({
    width: currentWidgetSize,
    height: currentWidgetSize,
    tooltip: "Spotify",
    chromeless: true
  });
  cleanups.push(() => widget.destroy());
  const widgetContent = document.createElement("div");
  widgetContent.className = "spotify-float-widget";
  function animateWidgetMount() {
    widgetContent.classList.remove("spotify-float-widget-mounted");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        widgetContent.classList.add("spotify-float-widget-mounted");
      });
    });
  }
  const legacyWidgetVisual = document.createElement("div");
  legacyWidgetVisual.className = "spotify-float-widget-legacy";
  const widgetIcon = document.createElement("div");
  widgetIcon.className = "spotify-float-widget-icon";
  widgetIcon.innerHTML = MUSIC_NOTE_SVG;
  const widgetArt = createCrossfadeArt("spotify-float-widget-art");
  widgetArt.el.style.display = "none";
  legacyWidgetVisual.appendChild(widgetIcon);
  legacyWidgetVisual.appendChild(widgetArt.el);
  widgetContent.appendChild(legacyWidgetVisual);
  let modernWidgetExpanded = false;
  const modernWidget = createModernWidgetPlayerUI(sendToBackend, () => tab.activate(), () => setModernWidgetExpanded(false));
  widgetContent.appendChild(modernWidget.root);
  widget.root.appendChild(widgetContent);
  animateWidgetMount();
  function getModernExpandedSize() {
    if (!currentState) {
      return {
        width: Math.max(280, Math.min(320, window.innerWidth - 24)),
        height: 196
      };
    }
    return {
      width: Math.max(300, Math.min(348, window.innerWidth - 24)),
      height: Math.max(420, Math.min(520, window.innerHeight - 24))
    };
  }
  function setModernWidgetExpanded(expanded) {
    modernWidgetExpanded = expanded && currentMiniPlayerStyle === "modern";
    modernWidget.setExpanded(modernWidgetExpanded);
    miniPlayer.hide();
    applyWidgetStyle();
    requestAnimationFrame(clampWidgetPosition);
  }
  function applyWidgetStyle() {
    widget.root.style.touchAction = "none";
    widget.root.style.transition = "width 420ms cubic-bezier(0.22, 1, 0.36, 1), height 420ms cubic-bezier(0.22, 1, 0.36, 1)";
    widgetContent.style.transition = "width 420ms cubic-bezier(0.22, 1, 0.36, 1), height 420ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 420ms cubic-bezier(0.22, 1, 0.36, 1)";
    modernWidget.setCollapsedSize(currentWidgetSize);
    if (currentMiniPlayerStyle === "modern") {
      const size = modernWidgetExpanded ? getModernExpandedSize() : { width: currentWidgetSize, height: currentWidgetSize };
      widgetContent.classList.add("spotify-float-widget-modern-mode");
      legacyWidgetVisual.style.display = "none";
      modernWidget.root.style.display = "block";
      widget.root.style.width = `${size.width}px`;
      widget.root.style.height = `${size.height}px`;
      widgetContent.style.width = `${size.width}px`;
      widgetContent.style.height = `${size.height}px`;
      widgetContent.style.borderRadius = modernWidgetExpanded ? "30px" : `${Math.max(18, Math.round(currentWidgetSize * 0.28))}px`;
      return;
    }
    widgetContent.classList.remove("spotify-float-widget-modern-mode");
    legacyWidgetVisual.style.display = "flex";
    modernWidget.root.style.display = "none";
    const radius = currentArtShape === "circle" ? "50%" : "22%";
    widget.root.style.width = `${currentWidgetSize}px`;
    widget.root.style.height = `${currentWidgetSize}px`;
    widgetContent.style.width = `${currentWidgetSize}px`;
    widgetContent.style.height = `${currentWidgetSize}px`;
    widgetContent.style.borderRadius = radius;
    const iconSize = Math.round(currentWidgetSize * 0.5);
    const iconSvg = widgetIcon.querySelector("svg");
    if (iconSvg) {
      iconSvg.style.width = `${iconSize}px`;
      iconSvg.style.height = `${iconSize}px`;
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
    const rect = widget.root.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - pad;
    const maxY = window.innerHeight - rect.height - pad;
    const clampedX = Math.max(pad, Math.min(pos.x, maxX));
    const clampedY = Math.max(pad, Math.min(pos.y, maxY));
    if (clampedX !== pos.x || clampedY !== pos.y) {
      widget.moveTo(clampedX, clampedY);
    }
  }
  window.addEventListener("resize", clampWidgetPosition);
  cleanups.push(() => window.removeEventListener("resize", clampWidgetPosition));
  const miniPlayer = createMiniPlayerUI(sendToBackend, () => tab.activate(), () => {
    const rect = widget.root.getBoundingClientRect();
    return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
  });
  miniPlayer.setStyle("default");
  cleanups.push(() => miniPlayer.destroy());
  cleanups.push(() => modernWidget.destroy());
  function syncWidgetVisibility() {
    widget.root.style.display = connected ? "" : "none";
    if (!connected) {
      miniPlayer.hide();
      modernWidgetExpanded = false;
      modernWidget.setExpanded(false);
    }
  }
  syncWidgetVisibility();
  controlsUI.onVolumeChange((pct) => miniPlayer.setVolume(pct));
  miniPlayer.onVolumeChange((pct) => controlsUI.setVolume(pct));
  let didDrag = false;
  let pointerStartPos = { x: 0, y: 0 };
  const DRAG_THRESHOLD = 5;
  widgetContent.addEventListener("pointerdown", (e) => {
    didDrag = false;
    pointerStartPos = { x: e.clientX, y: e.clientY };
    if (miniPlayer.isOpen()) {
      let dragRaf = null;
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
        if (dragRaf !== null)
          cancelAnimationFrame(dragRaf);
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
    if (currentMiniPlayerStyle === "modern") {
      if (!modernWidgetExpanded)
        setModernWidgetExpanded(true);
      return;
    }
    miniPlayer.toggle();
  });
  let openContextMenuCount = 0;
  async function showContextMenu(x, y) {
    const items = [
      { key: "small", label: "Small", active: currentSizeMode === "small" },
      { key: "medium", label: "Medium", active: currentSizeMode === "medium" },
      { key: "large", label: "Large", active: currentSizeMode === "large" },
      { key: "custom", label: "Custom…", active: currentSizeMode === "custom" }
    ];
    if (currentMiniPlayerStyle !== "modern") {
      items.push({ key: "div", label: "", type: "divider" }, { key: "circle", label: "Circle", active: currentArtShape === "circle" }, { key: "squircle", label: "Squircle", active: currentArtShape === "squircle" });
    }
    items.push({ key: currentMiniPlayerStyle === "modern" ? "div" : "div2", label: "", type: "divider" }, { key: "mini-default", label: "Default Mini Player", active: currentMiniPlayerStyle === "default" }, { key: "mini-modern", label: "Modern Lyrics Mini Player", active: currentMiniPlayerStyle === "modern" });
    openContextMenuCount += 1;
    miniPlayer.setUiSuspended(true);
    let selectedKey;
    try {
      ({ selectedKey } = await ctx.ui.showContextMenu({
        position: { x, y },
        items
      }));
    } finally {
      openContextMenuCount = Math.max(0, openContextMenuCount - 1);
      if (openContextMenuCount === 0) {
        miniPlayer.setUiSuspended(false);
      }
    }
    if (!selectedKey)
      return;
    if (selectedKey === "small" || selectedKey === "medium" || selectedKey === "large") {
      currentSizeMode = selectedKey;
      recreateWidget(getSizePresets(currentMiniPlayerStyle)[selectedKey]);
    } else if (selectedKey === "custom") {
      ctx.events.emit("open-settings", { view: "extensions" });
    } else if (selectedKey === "circle" || selectedKey === "squircle") {
      currentArtShape = selectedKey;
      saveWidgetPrefs();
      applyWidgetStyle();
    } else if (selectedKey === "mini-default" || selectedKey === "mini-modern") {
      currentMiniPlayerStyle = selectedKey === "mini-modern" ? "modern" : "default";
      const presets = getSizePresets(currentMiniPlayerStyle);
      if (currentSizeMode !== "custom") {
        currentWidgetSize = presets[currentSizeMode];
      } else {
        currentWidgetSize = clampWidgetSize(currentWidgetSize, currentMiniPlayerStyle);
      }
      if (currentMiniPlayerStyle !== "modern") {
        modernWidgetExpanded = false;
        modernWidget.setExpanded(false);
      }
      miniPlayer.hide();
      saveWidgetPrefs();
      updateWidgetCustomizationUI();
      applyWidgetStyle();
      clampWidgetPosition();
    }
  }
  let longPressTimer = null;
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
    if (!longPressTimer)
      return;
    const touch = e.touches[0];
    if (Math.abs(touch.clientX - longPressStart.x) > 10 || Math.abs(touch.clientY - longPressStart.y) > 10) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  });
  widgetContent.addEventListener("touchend", (e) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    if (longPressFired) {
      longPressFired = false;
      return;
    }
    if (currentMiniPlayerStyle === "modern" && modernWidgetExpanded) {
      didDrag = false;
      return;
    }
    e.preventDefault();
    if (!didDrag) {
      if (currentMiniPlayerStyle === "modern") {
        if (!modernWidgetExpanded)
          setModernWidgetExpanded(true);
      } else {
        miniPlayer.toggle();
      }
    }
    didDrag = false;
  });
  function recreateWidget(newSize) {
    miniPlayer.hide();
    modernWidgetExpanded = false;
    modernWidget.setExpanded(false);
    const pos = widget.getPosition();
    widget.destroy();
    currentWidgetSize = clampWidgetSize(newSize, currentMiniPlayerStyle);
    updateWidgetCustomizationUI();
    saveWidgetPrefs();
    widget = ctx.ui.createFloatWidget({
      width: currentWidgetSize,
      height: currentWidgetSize,
      tooltip: "Spotify",
      chromeless: true
    });
    applyWidgetStyle();
    widget.root.appendChild(widgetContent);
    animateWidgetMount();
    syncWidgetVisibility();
    widget.moveTo(pos.x, pos.y);
    widget.onDragEnd((pos2) => debounceSavePosition(pos2));
    clampWidgetPosition();
  }
  widgetContent.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY);
  });
  function updateWidget(state) {
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
    modernWidget.update(state, connected);
  }
  const tagUnsub = ctx.messages.registerTagInterceptor({ tagName: "spotify-search" }, (payload) => {
    const query = payload.attrs.query;
    if (!query)
      return;
    sendToBackend({ type: "search", query });
  });
  cleanups.push(tagUnsub);
  let trackEndTimer = null;
  function scheduleTrackEndRefresh(state) {
    if (trackEndTimer) {
      clearTimeout(trackEndTimer);
      trackEndTimer = null;
    }
    if (!state || !state.isPlaying || state.durationMs <= 0)
      return;
    const remaining = state.durationMs - state.progressMs;
    if (remaining <= 0)
      return;
    trackEndTimer = setTimeout(() => {
      trackEndTimer = null;
      sendToBackend({ type: "get_state" });
    }, remaining + 500);
  }
  cleanups.push(() => {
    if (trackEndTimer)
      clearTimeout(trackEndTimer);
  });
  const msgUnsub = ctx.onBackendMessage((raw) => {
    const msg = raw;
    switch (msg.type) {
      case "state": {
        const hadPlayback = !!currentState;
        currentState = msg.playbackState;
        connected = msg.connected;
        syncWidgetVisibility();
        nowPlayingUI.update(currentState, connected);
        controlsUI.update(currentState, connected);
        miniPlayer.update(currentState, connected);
        lyricsUI.updatePlayback(currentState);
        updateWidget(currentState);
        if (currentMiniPlayerStyle === "modern" && modernWidgetExpanded && hadPlayback !== !!currentState) {
          applyWidgetStyle();
          requestAnimationFrame(clampWidgetPosition);
        }
        scheduleTrackEndRefresh(currentState);
        const artUrl = getTrackScopedArtUrl(currentState?.albumArtUrl ?? null, currentState?.trackUri);
        if (artUrl !== lastThemeArtUrl) {
          lastThemeArtUrl = artUrl;
          if (artUrl) {
            cancelPendingThemeClear();
            const applySeq = ++themeApplySeq;
            extractColorsFromImage(artUrl).then((colors) => {
              if (applySeq !== themeApplySeq || artUrl !== lastThemeArtUrl)
                return;
              if (colors) {
                sendToBackend({ type: "album_colors", colors });
              } else if (!connected) {
                clearAlbumTheme();
              }
            });
          } else {
            if (connected)
              scheduleAlbumThemeClear();
            else
              clearAlbumTheme();
          }
        }
        const trackUri = currentState?.trackUri || null;
        if (trackUri && trackUri !== lastLyricsTrackUri) {
          lastLyricsTrackUri = trackUri;
          lyricsUI.setLoading(true);
          modernWidget.setLyricsLoading(true);
          sendToBackend({ type: "get_lyrics" });
        } else if (!trackUri && lastLyricsTrackUri) {
          lastLyricsTrackUri = null;
          lyricsUI.clear();
          modernWidget.updateLyrics(null, null, null, false);
        }
        break;
      }
      case "config":
        settingsUI.update(msg.connected, msg.clientId, msg.hasSecret, msg.hasLastfmKey, msg.callbackUrl);
        connected = msg.connected;
        syncWidgetVisibility();
        break;
      case "search_results":
        searchUI.setResults(msg.results);
        break;
      case "devices":
        miniPlayer.setDevices(msg.devices);
        break;
      case "widget_prefs": {
        const p = normalizeWidgetPrefs(msg.prefs);
        if (!p)
          break;
        const sizeChanged = p.size !== currentWidgetSize;
        const anyChanged = sizeChanged || p.shape !== currentArtShape || p.sizeMode !== currentSizeMode || p.miniPlayerStyle !== currentMiniPlayerStyle;
        currentArtShape = p.shape;
        currentSizeMode = p.sizeMode;
        currentMiniPlayerStyle = p.miniPlayerStyle;
        updateWidgetCustomizationUI();
        if (currentMiniPlayerStyle !== "modern") {
          modernWidgetExpanded = false;
          modernWidget.setExpanded(false);
        }
        if (anyChanged) {
          localStorage.setItem(PREFS_KEY, JSON.stringify(p));
        }
        if (sizeChanged) {
          requestAnimationFrame(() => recreateWidget(p.size));
        } else {
          applyWidgetStyle();
        }
        if (typeof p.x === "number" && typeof p.y === "number") {
          const cur = widget.getPosition();
          if (savedX === undefined && savedY === undefined && (cur.x !== p.x || cur.y !== p.y)) {
            widget.moveTo(p.x, p.y);
            clampWidgetPosition();
          }
        }
        break;
      }
      case "auth_url": {
        const popup = window.open(msg.url, "spotify-auth", "width=500,height=700,menubar=no,toolbar=no");
        if (!popup || popup.closed) {
          window.location.href = msg.url;
        }
        break;
      }
      case "connected":
        connected = true;
        syncWidgetVisibility();
        sendToBackend({ type: "get_config" });
        sendToBackend({ type: "get_state" });
        break;
      case "disconnected":
        connected = false;
        syncWidgetVisibility();
        currentState = null;
        lastThemeArtUrl = null;
        clearAlbumTheme();
        settingsUI.update(false, "");
        nowPlayingUI.update(null, false);
        controlsUI.update(null, false);
        miniPlayer.update(null, false);
        modernWidget.update(null, false);
        modernWidget.updateLyrics(null, null, null, false);
        modernWidgetExpanded = false;
        modernWidget.setExpanded(false);
        lyricsUI.clear();
        updateWidget(null);
        break;
      case "lyrics":
        if (msg.trackUri && msg.trackUri !== lastLyricsTrackUri)
          break;
        lyricsUI.update(msg.trackUri, msg.plainLyrics, msg.syncedLyrics, msg.instrumental);
        lyricsUI.updatePlayback(currentState);
        modernWidget.updateLyrics(msg.trackUri, msg.plainLyrics, msg.syncedLyrics, msg.instrumental);
        break;
      case "error":
        console.warn("[Spotify Controls]", msg.message);
        break;
    }
  });
  cleanups.push(msgUnsub);
  const permUnsub = ctx.events.on("SPINDLE_PERMISSION_CHANGED", (payload) => {
    const detail = payload;
    if (detail.extensionId !== ctx.manifest.identifier)
      return;
    if (detail.permission !== "cors_proxy")
      return;
    if (detail.granted) {
      sendToBackend({ type: "get_config" });
      sendToBackend({ type: "get_state" });
    } else {
      currentState = null;
      connected = false;
      syncWidgetVisibility();
      clearAlbumTheme();
      nowPlayingUI.update(null, false);
      controlsUI.update(null, false);
      miniPlayer.update(null, false);
      modernWidget.update(null, false);
      modernWidgetExpanded = false;
      modernWidget.setExpanded(false);
      updateWidget(null);
    }
  });
  cleanups.push(permUnsub);
  ctx.permissions.getGranted().then((granted) => {
    if (granted.includes("cors_proxy"))
      return;
    ctx.ui.showConfirm({
      title: "Permission Required",
      message: "Spotify Controls needs the CORS Proxy permission to communicate with the Spotify and Last.fm APIs on your behalf.",
      variant: "info",
      confirmLabel: "Grant Permission",
      cancelLabel: "Not Now"
    }).then(({ confirmed }) => {
      if (confirmed) {
        ctx.permissions.request(["cors_proxy"]);
      }
    });
  });
  sendToBackend({ type: "get_config" });
  sendToBackend({ type: "get_state" });
  sendToBackend({ type: "get_widget_prefs" });
  return () => {
    for (const fn of cleanups) {
      try {
        fn();
      } catch {}
    }
  };
}
export {
  setup
};
