var Gt=`
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

.spotify-settings-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--lumiverse-text-muted);
  cursor: pointer;
}

.spotify-settings-check input[type="checkbox"] {
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: #1db954;
  cursor: pointer;
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
  --spotify-modern-widget-compact-progress: 0%;
  position: absolute;
  inset: 4px;
  z-index: 2;
  border-radius: max(16px, calc(var(--spotify-modern-widget-collapsed-size) * 0.26));
  padding: 2px;
  pointer-events: none;
  background:
    conic-gradient(
      from -90deg,
      rgba(255, 255, 255, 0.88) 0 var(--spotify-modern-widget-compact-progress),
      rgba(255, 255, 255, 0.16) var(--spotify-modern-widget-compact-progress) 100%
    );
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.08);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  transition: opacity 180ms ease, background 180ms ease;
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
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--lumiverse-fill-strong) transparent;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, black 18px, black calc(100% - 18px), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, black 18px, black calc(100% - 18px), transparent 100%);
}

.spotify-modern-widget-lyrics-track {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
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
  /* Reserve room before wrapping for the active line's 1.035 scale. */
  width: calc(96% - 12px);
  min-width: 0;
  margin-inline: auto;
  text-align: center;
  font-size: 16px;
  line-height: 1.24;
  font-weight: 600;
  letter-spacing: -0.018em;
  color: rgba(255, 255, 255, 0.22);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  text-wrap: pretty;
  transition: color 220ms ease, transform 220ms ease, text-shadow 220ms ease;
}

.spotify-modern-widget-lyric-line-enter {
  animation: spotify-lyrics-line-in 360ms cubic-bezier(0.18, 0.9, 0.22, 1) both;
  animation-delay: var(--spotify-modern-lyric-enter-delay, 0ms);
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
}

/* Apple Music-esque lyric motion. Focus always moves forward: the leaving line
   contracts on a short, prompt ease-out while the arriving line springs up
   behind it, so a sung line never lingers at full size beside its successor.
   Only compositor-friendly properties move: opacity and transform animate,
   while the depth blur is a static per-tier value that never re-rasterizes
   mid-transition. */
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
  transition:
    opacity 320ms cubic-bezier(0.25, 0.7, 0.5, 1),
    background 220ms cubic-bezier(0.22, 1, 0.36, 1);
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
  transform: translateY(0) scale(0.955);
  transform-origin: center center;
  transition: transform 320ms cubic-bezier(0.25, 0.7, 0.5, 1);
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
  transition:
    opacity 520ms cubic-bezier(0.25, 0.7, 0.5, 1),
    background 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* Only the arriving scale springs. Nothing that transforms carries a filter or
   a paint-invalidating property, so the compositor never has to re-rasterize a
   blurred layer mid-scale. */
.spotify-lyrics-line-active .spotify-lyrics-line-text {
  transform: translateY(0) scale(1.17);
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.14);
  transition: transform 520ms cubic-bezier(0.34, 1.5, 0.5, 1);
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

/* Depth blur is static and sits only on receding lines, never on the active or
   adjacent line. A blur that animates, or that shares an element with a
   transform, forces the compositor to re-rasterize that layer every frame and
   leaves the text visibly soft mid-scale. These classes are emitted only while
   the Lyrics blur setting is on, so a disabled blur leaves the text unfiltered
   instead of carrying a no-op blur(0). */
.spotify-lyrics-line-blur-2 .spotify-lyrics-line-text {
  filter: blur(0.8px);
}

.spotify-lyrics-line-blur-3 .spotify-lyrics-line-text {
  filter: blur(1.5px);
}

.spotify-lyrics-line-blur-4 .spotify-lyrics-line-text {
  filter: blur(2.2px);
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

/* The blur-in radius is a variable so the Lyrics blur setting can zero it
   without a second copy of the motion. A custom property inside @keyframes is
   substituted when the animation starts, which is the only moment that
   matters here: the element is created, and the setting read, before it is
   inserted. */
@keyframes spotify-lyrics-line-in {
  from {
    opacity: 0;
    transform: translateY(16px);
    filter: blur(var(--spotify-lyrics-enter-blur, 8px));
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
    filter: blur(var(--spotify-lyrics-enter-blur, 6px));
  }

  to {
    opacity: 1;
    transform: none;
    filter: blur(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spotify-lyrics-line,
  .spotify-lyrics-line .spotify-lyrics-line-text,
  .spotify-lyrics-text,
  .spotify-lyrics-status-loading {
    animation: none !important;
    transition: none;
  }
}

/* ─── Per-message "song that was playing" badge ─────────────────────────── */

.spotify-song-badge-wrap {
  position: absolute;
  bottom: 8px;
  z-index: 4;
  line-height: 0;
}

.spotify-song-badge-wrap[data-corner="right"] {
  right: 8px;
}

.spotify-song-badge-wrap[data-corner="left"] {
  left: 8px;
}

.spotify-song-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid var(--lumiverse-border);
  border-radius: 50%;
  background: var(--lumiverse-fill-subtle, rgba(127, 127, 127, 0.12));
  color: var(--lumiverse-text-dim);
  cursor: pointer;
  opacity: 0.55;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  transition: opacity 160ms ease, color 160ms ease, border-color 160ms ease,
              transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.spotify-song-badge:hover,
.spotify-song-badge:focus-visible {
  opacity: 1;
  color: #1db954;
  border-color: #1db954;
  transform: scale(1.08);
  outline: none;
}

.spotify-song-badge svg {
  width: 14px;
  height: 14px;
}

/* ─── Song popover (sleek view, lazy-rendered on click) ─────────────────── */

.spotify-song-pop {
  position: fixed;
  z-index: 9991;
  width: 280px;
  max-width: calc(100vw - 16px);
  box-sizing: border-box;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--lumiverse-bg);
  border: 1px solid var(--lumiverse-border);
  border-radius: 14px;
  box-shadow: var(--lumiverse-shadow-xl);
  -webkit-backdrop-filter: blur(20px) saturate(1.1);
  backdrop-filter: blur(20px) saturate(1.1);
  color: var(--lumiverse-text);
  font-family: system-ui, -apple-system, sans-serif;
  transform: scale(0.85);
  opacity: 0;
  pointer-events: none;
  transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 140ms ease;
}

.spotify-song-pop.open {
  transform: scale(1);
  opacity: 1;
  pointer-events: auto;
}

.spotify-song-pop-header {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--lumiverse-text-dim);
  display: flex;
  align-items: center;
  gap: 6px;
}

.spotify-song-pop-header::before {
  content: "♪";
  color: #1db954;
  font-size: 12px;
}

.spotify-song-pop-body {
  display: flex;
  gap: 12px;
  align-items: center;
}

.spotify-song-pop-art {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--lumiverse-fill);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
}

.spotify-song-pop-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spotify-song-pop-track {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.spotify-song-pop-artist {
  font-size: 12px;
  color: var(--lumiverse-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-song-pop-album {
  font-size: 11px;
  color: var(--lumiverse-text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-song-pop-when {
  margin-top: 2px;
  font-size: 10.5px;
  color: var(--lumiverse-text-dim);
}

.spotify-song-pop-actions {
  display: flex;
  gap: 6px;
}

.spotify-song-pop-btn {
  flex: 1 1 0;
  min-width: 0;
  box-sizing: border-box;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 8px;
  border: 1px solid var(--lumiverse-border);
  border-radius: 9px;
  background: var(--lumiverse-fill-subtle, rgba(127, 127, 127, 0.1));
  color: var(--lumiverse-text);
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, transform 120ms ease;
}

.spotify-song-pop-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.spotify-song-pop-btn:hover {
  border-color: var(--lumiverse-border-hover, var(--lumiverse-border));
  transform: translateY(-1px);
}

.spotify-song-pop-btn:active {
  transform: translateY(0);
}

.spotify-song-pop-btn-primary {
  background: #1db954;
  border-color: #1db954;
  color: #fff;
}

.spotify-song-pop-btn-primary:hover {
  background: #1ed760;
  border-color: #1ed760;
}

@media (prefers-reduced-motion: reduce) {
  .spotify-song-badge,
  .spotify-song-pop,
  .spotify-song-pop-btn {
    transition: none;
  }
}

`;function Xt(e,n,r){let t=document.createElement("section");t.className="spotify-settings-card";let c=document.createElement("header");c.className="spotify-settings-card-header";let l=document.createElement("h3");l.textContent="Spotify Controls";let a=document.createElement("span");a.className="spotify-status",c.appendChild(l),c.appendChild(a);let u=document.createElement("div");u.className="spotify-settings-card-body";let d=document.createElement("label");d.className="spotify-settings-label",d.textContent="Client ID";let p=document.createElement("input");p.className="spotify-input",p.type="text",p.placeholder="Spotify Client ID",d.appendChild(p);let y=document.createElement("label");y.className="spotify-settings-label",y.textContent="Client Secret (optional)";let h=document.createElement("input");h.className="spotify-input",h.type="password",h.placeholder="Optional for PKCE apps",y.appendChild(h);let L=document.createElement("label");L.className="spotify-settings-label",L.textContent="Last.fm API Key";let w=document.createElement("input");w.className="spotify-input",w.type="password",w.placeholder="Last.fm API Key (for recommendations)",L.appendChild(w);let k=document.createElement("div");k.className="spotify-settings-row";let E=document.createElement("button");E.className="spotify-btn spotify-btn-primary",E.textContent="Save",E.style.fontSize="0.85em",E.style.padding="4px 12px",E.addEventListener("click",()=>{let Z=w.value.trim();if(!Z)return;e({type:"save_lastfm_key",apiKey:Z})}),k.appendChild(E);let x=document.createElement("label");x.className="spotify-settings-label",x.style.display="block";let U=document.createElement("div");U.className="spotify-settings-row",U.style.alignItems="center",U.style.gap="10px";let b=document.createElement("input");b.type="checkbox",b.style.margin="0";let N=document.createElement("div");N.style.display="grid",N.style.gap="2px";let q=document.createElement("span");q.textContent="Attach Spotify preview audio";let F=document.createElement("span");F.style.cssText="font-size:0.8em;opacity:0.68",F.textContent="For eligible multimodal models only. Downloads Spotify's 30-second preview and attaches it to the latest user turn.",N.appendChild(q),N.appendChild(F),U.appendChild(b),U.appendChild(N),x.appendChild(U);let se=document.createElement("label");se.className="spotify-settings-label",se.textContent="Redirect URI";let ie=document.createElement("div");ie.className="spotify-settings-row",ie.style.gap="6px";let P=document.createElement("input");P.className="spotify-input",P.type="text",P.readOnly=!0,P.placeholder="Loading...",P.style.flex="1",P.style.cursor="text",P.style.userSelect="all";let V=document.createElement("button");V.className="spotify-btn spotify-btn-primary",V.textContent="Copy",V.style.fontSize="0.85em",V.style.padding="4px 12px",V.style.flexShrink="0",V.addEventListener("click",()=>{if(!P.value)return;navigator.clipboard.writeText(P.value).then(()=>{let Z=V.textContent;V.textContent="Copied!",setTimeout(()=>{V.textContent=Z},1500)})}),ie.appendChild(P),ie.appendChild(V),se.appendChild(ie);let W=document.createElement("div");W.style.cssText="font-size:0.8em;opacity:0.6;margin-top:2px",W.textContent="Add this loopback URL in Spotify. If it fails on another device, paste the failed callback URL below.",se.appendChild(W);let H=document.createElement("label");H.className="spotify-settings-label",H.textContent="Finish from another device";let g=document.createElement("div");g.className="spotify-settings-row",g.style.gap="6px";let z=document.createElement("input");z.className="spotify-input",z.type="text",z.placeholder="Paste the 127.0.0.1 callback URL here",z.style.flex="1";let _=document.createElement("button");_.className="spotify-btn spotify-btn-primary",_.textContent="Finish",_.style.fontSize="0.85em",_.style.padding="4px 12px",_.style.flexShrink="0",_.addEventListener("click",()=>{let Z=z.value.trim();if(!Z)return;e({type:"complete_auth_callback",callbackUrl:Z})}),g.appendChild(z),g.appendChild(_),H.appendChild(g);let j=document.createElement("div");j.className="spotify-settings-row";let I=document.createElement("button");I.className="spotify-btn spotify-btn-primary",I.textContent="Connect",j.appendChild(I),u.appendChild(d),u.appendChild(y),u.appendChild(se),u.appendChild(H),u.appendChild(L),u.appendChild(k),u.appendChild(x),u.appendChild(j),t.appendChild(c),t.appendChild(u);let G=!1;function ge(Z,ve,J,A,v,S){if(G=Z,ve)p.value=ve;if(v){let O=n();P.value=O+v}if(Z)p.disabled=!0,h.disabled=!0,h.value="",h.placeholder="••••••••",I.textContent="Disconnect",I.className="spotify-btn spotify-btn-danger",I.disabled=!1,a.innerHTML='<span class="spotify-status-dot connected"></span>Connected';else{if(p.disabled=!1,h.disabled=!1,J)h.placeholder="Saved (re-enter to change)";else h.placeholder="Optional for PKCE apps";I.textContent="Connect",I.className="spotify-btn spotify-btn-primary",I.disabled=!1,a.innerHTML='<span class="spotify-status-dot disconnected"></span>Not connected'}if(A)w.value="",w.placeholder="Saved (re-enter to change)";else w.placeholder="Last.fm API Key (for recommendations)";b.checked=!!S}function he(){I.textContent="Connecting...",I.disabled=!0,I.className="spotify-btn spotify-btn-primary",a.innerHTML='<span class="spotify-status-dot disconnected"></span>Waiting for authorization...'}return I.addEventListener("click",()=>{if(G)e({type:"disconnect"});else{let Z=p.value.trim(),ve=h.value.trim();if(!Z){a.innerHTML='<span class="spotify-status-dot disconnected"></span><span style="color:#e74c3c">Client ID is required</span>';return}he(),e({type:"connect",clientId:Z,clientSecret:ve||void 0,serverBaseUrl:n()})}}),b.addEventListener("change",async()=>{let Z=b.checked;b.disabled=!0;try{b.checked=await r(Z)}finally{b.disabled=!1}}),ge(!1,""),{root:t,update:ge,setConnecting:he,destroy(){t.remove()}}}function je(e,n){if(!e)return null;if(!n)return e;try{let r=new URL(e);return r.searchParams.set("track",n),r.toString()}catch{let r=e.includes("?")?"&":"?";return`${e}${r}track=${encodeURIComponent(n)}`}}function Ge(e){let n=document.createElement("div");n.className=`${e} spotify-crossfade-art`,n.style.display="none";let r=document.createElement("img"),t=document.createElement("img");r.className="spotify-crossfade-img",t.className="spotify-crossfade-img",r.alt="",t.alt="",r.loading="eager",t.loading="eager",r.decoding="async",t.decoding="async",r.style.visibility="hidden",t.style.visibility="hidden",r.style.opacity="1",t.style.opacity="0",n.appendChild(r),n.appendChild(t);let c=null,l=r,a=t,u=!1;function d(h){h.onload=null,h.onerror=null,h.removeAttribute("src"),h.style.visibility="hidden"}function p(){n.style.display="none",l.style.opacity="1",a.style.opacity="0"}function y(h){if(h===c)return;if(c=h,!h){d(l),d(a),u=!1,p();return}if(!u){if(n.style.display="",l.onload=()=>{u=!0,l.style.visibility="visible"},l.onerror=()=>{c=null,d(l),p()},l.src=h,l.complete&&l.naturalWidth>0)u=!0,l.style.visibility="visible";return}if(n.style.display="",a.onload=()=>{a.style.visibility="visible",a.style.opacity="1",l.style.opacity="0";let L=l;l=a,a=L},a.onerror=()=>{c=null,d(a),a.style.opacity="0"},a.src=h,a.complete&&a.naturalWidth>0){a.style.visibility="visible",a.style.opacity="1",l.style.opacity="0";let L=l;l=a,a=L}}return{el:n,setUrl:y,destroy(){n.remove()}}}function ct(e,n){let r=!1;function t(x){if(r===x)return;r=x,n.onInteractChange?.(x)}function c(x){if(n.stopPropagation)x.stopPropagation()}function l(){return Number.parseInt(e.value,10)}let a=(x)=>{c(x),t(!0)},u=(x)=>{c(x)},d=(x)=>{c(x),t(!1)},p=(x)=>{c(x),t(!0)},y=(x)=>{c(x)},h=(x)=>{c(x),t(!1)},L=(x)=>{c(x)},w=(x)=>{c(x),t(!0),n.onPreview?.(l())},k=(x)=>{c(x);let U=l();n.onPreview?.(U),n.onCommit(U),t(!1)},E=()=>{t(!1)};return e.addEventListener("pointerdown",a),e.addEventListener("pointermove",u),e.addEventListener("pointerup",d),e.addEventListener("touchstart",p,{passive:!0}),e.addEventListener("touchmove",y,{passive:!0}),e.addEventListener("touchend",h,{passive:!0}),e.addEventListener("click",L),e.addEventListener("input",w),e.addEventListener("change",k),e.addEventListener("blur",E),e.addEventListener("pointercancel",E),e.addEventListener("lostpointercapture",E),()=>{e.removeEventListener("pointerdown",a),e.removeEventListener("pointermove",u),e.removeEventListener("pointerup",d),e.removeEventListener("touchstart",p),e.removeEventListener("touchmove",y),e.removeEventListener("touchend",h),e.removeEventListener("click",L),e.removeEventListener("input",w),e.removeEventListener("change",k),e.removeEventListener("blur",E),e.removeEventListener("pointercancel",E),e.removeEventListener("lostpointercapture",E)}}function pt(e,n){let r=!1,t=null,c=0;function l(b){if(r===b)return;r=b,n.onInteractChange?.(b)}function a(b){if(n.stopPropagation)b.stopPropagation()}function u(b){let N=n.getMaxValue();if(!Number.isFinite(N)||N<=0)return null;let q=e.getBoundingClientRect();if(q.width<=0)return null;let F=Math.max(0,Math.min(1,(b-q.left)/q.width));return Math.round(F*N)}function d(b){let N=u(b);if(N===null)return null;return c=N,n.onPreview(N),N}function p(b){if(t!==null&&e.hasPointerCapture(t))e.releasePointerCapture(t);if(t=null,b)n.onCommit(c);l(!1)}let y=(b)=>{if(a(b),b.button!==0)return;if(d(b.clientX)===null)return;t=b.pointerId,l(!0);try{e.setPointerCapture(b.pointerId)}catch{}},h=(b)=>{if(a(b),b.pointerId!==t)return;d(b.clientX)},L=(b)=>{if(a(b),b.pointerId!==t)return;d(b.clientX),p(!0)},w=(b)=>{if(a(b),b.pointerId!==t)return;p(!1)},k=(b)=>{a(b),b.preventDefault()},E=(b)=>{a(b)},x=(b)=>{a(b)},U=(b)=>{a(b)};return e.addEventListener("pointerdown",y),e.addEventListener("pointermove",h),e.addEventListener("pointerup",L),e.addEventListener("pointercancel",w),e.addEventListener("click",k),e.addEventListener("touchstart",E,{passive:!0}),e.addEventListener("touchmove",x,{passive:!0}),e.addEventListener("touchend",U,{passive:!0}),()=>{e.removeEventListener("pointerdown",y),e.removeEventListener("pointermove",h),e.removeEventListener("pointerup",L),e.removeEventListener("pointercancel",w),e.removeEventListener("click",k),e.removeEventListener("touchstart",E),e.removeEventListener("touchmove",x),e.removeEventListener("touchend",U)}}function mt(e){let n=Math.floor(e/1000),r=Math.floor(n/60),t=n%60;return`${r}:${t.toString().padStart(2,"0")}`}function Kt(e){let n=document.createElement("div");n.className="spotify-section";let r=document.createElement("h3");r.className="spotify-section-title",r.textContent="Now Playing",n.appendChild(r);let t=document.createElement("div");t.className="spotify-now-playing";let c=Ge("spotify-album-art"),l=document.createElement("div");l.className="spotify-track-info";let a=document.createElement("div");a.className="spotify-track-name";let u=document.createElement("div");u.className="spotify-track-artist";let d=document.createElement("div");d.className="spotify-track-album";let p=document.createElement("div");p.className="spotify-track-device",l.appendChild(a),l.appendChild(u),l.appendChild(d),l.appendChild(p),t.appendChild(c.el),t.appendChild(l),n.appendChild(t);let y=document.createElement("div");y.className="spotify-progress-container";let h=document.createElement("span"),L=document.createElement("div");L.className="spotify-progress-bar";let w=document.createElement("div");w.className="spotify-progress-fill",L.appendChild(w);let k=document.createElement("span");y.appendChild(h),y.appendChild(L),y.appendChild(k),n.appendChild(y);let E=document.createElement("div");E.className="spotify-empty";let x=0,U=!1,b=0,N=0,q=!1,F=null;function se(){if(!q||!x){F=null;return}if(U){F=requestAnimationFrame(se);return}let g=Date.now()-N,z=Math.min(b+g,x),_=z/x*100;w.style.width=`${_}%`,h.textContent=mt(z),F=requestAnimationFrame(se)}function ie(){if(F!==null)return;F=requestAnimationFrame(se)}function P(){if(F!==null)cancelAnimationFrame(F),F=null}let V=pt(L,{getMaxValue:()=>x,onInteractChange(g){U=g},onPreview(g){let z=x>0?g/x*100:0;w.style.width=`${z}%`,h.textContent=mt(g)},onCommit(g){if(b=g,N=Date.now(),e(g),q)ie()}});function W(g){if(U=!1,c.setUrl(null),t.style.display="none",y.style.display="none",E.textContent=g,!n.contains(E))n.appendChild(E);x=0,w.style.width="0%",h.textContent=mt(0),k.textContent=mt(0),P()}function H(g,z){if(!z){W("Connect to Spotify to see playback");return}if(!g){W("No active playback — open Spotify on a device to get started");return}if(n.contains(E))n.removeChild(E);if(t.style.display="flex",y.style.display="flex",a.textContent=g.trackName,u.textContent=g.artistName,d.textContent=g.albumName,g.deviceName)p.textContent=`Playing on ${g.deviceName}`,p.style.display="";else p.style.display="none";if(x=g.durationMs,c.setUrl(je(g.albumArtUrl,g.trackUri)),q=g.isPlaying,!U)b=g.progressMs,N=Date.now();if(!U){let _=g.durationMs>0?g.progressMs/g.durationMs*100:0;w.style.width=`${_}%`,h.textContent=mt(g.progressMs)}if(k.textContent=mt(g.durationMs),g.isPlaying)ie();else P()}return H(null,!1),{root:n,update:H,destroy(){V(),P(),c.destroy(),n.remove()}}}var Ln='<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>',Tt='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',kn='<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',Sn='<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',Mn='<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>',zt='<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',Pn='<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>',Nn='<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';function Zt(e){let n=document.createElement("div");n.className="spotify-section";let r=document.createElement("h3");r.className="spotify-section-title",r.textContent="Controls",n.appendChild(r);let t=document.createElement("div");t.className="spotify-controls";function c(N,q=""){let F=document.createElement("button");return F.className=`spotify-ctrl-btn ${q}`.trim(),F.innerHTML=N,F}let l=c(Mn),a=c(Ln),u=c(Tt,"spotify-ctrl-btn-main"),d=c(Sn),p=c(zt);t.appendChild(l),t.appendChild(a),t.appendChild(u),t.appendChild(d),t.appendChild(p),n.appendChild(t);let y=document.createElement("div");y.className="spotify-volume-row";let h=document.createElement("span");h.innerHTML=Nn,h.style.cssText="width:16px;height:16px;display:flex;align-items:center;color:var(--lumiverse-text-muted)",h.querySelector("svg").style.cssText="width:16px;height:16px;fill:currentColor";let L=document.createElement("input");L.type="range",L.className="spotify-volume-slider",L.min="0",L.max="100",L.value="50",y.appendChild(h),y.appendChild(L),n.appendChild(y);let w=!1,k="off";a.addEventListener("click",()=>e({type:"previous"})),d.addEventListener("click",()=>e({type:"next"})),u.addEventListener("click",()=>{e({type:w?"pause":"play"})}),l.addEventListener("click",()=>{e({type:"toggle_shuffle"})}),p.addEventListener("click",()=>{e({type:"set_repeat",mode:k==="off"?"context":k==="context"?"track":"off"})});let E=!1,x=new Set,U=ct(L,{onInteractChange(N){E=N},onPreview(N){for(let q of x)q(N)},onCommit(N){e({type:"set_volume",percent:N})}});function b(N,q){if(!q){E=!1,n.style.display="none";return}if(n.style.display="",!N){E=!1,w=!1,u.innerHTML=Tt,l.classList.remove("active"),p.classList.remove("active"),p.innerHTML=zt;return}if(w=N.isPlaying,u.innerHTML=w?kn:Tt,l.classList.toggle("active",N.shuffleState),k=N.repeatState,p.classList.toggle("active",k!=="off"),p.innerHTML=k==="track"?Pn:zt,N.volume!==null&&!E)L.value=String(N.volume)}return{root:n,update:b,setVolume(N){L.value=String(N)},onVolumeChange(N){x.add(N)},destroy(){U(),x.clear(),n.remove()}}}function Qt(e){let n=document.createElement("div");n.className="spotify-section";let r=document.createElement("h3");r.className="spotify-section-title",r.textContent="Search",n.appendChild(r);let t=document.createElement("input");t.className="spotify-search-input",t.placeholder="Search for tracks...",n.appendChild(t);let c=document.createElement("div");c.className="spotify-search-results",n.appendChild(c);let l=null;t.addEventListener("input",()=>{if(l)clearTimeout(l);l=setTimeout(()=>{let u=t.value.trim();if(u.length>=2)e({type:"search",query:u});else c.innerHTML=""},400)});function a(u){if(c.innerHTML="",u.length===0){let d=document.createElement("div");d.className="spotify-empty",d.textContent="No results found",c.appendChild(d);return}for(let d of u){let p=document.createElement("div");if(p.className="spotify-search-item",d.albumArtUrl){let x=document.createElement("img");x.className="spotify-search-item-art",x.src=d.albumArtUrl,x.alt=d.album,p.appendChild(x)}let y=document.createElement("div");y.className="spotify-search-item-info";let h=document.createElement("div");h.className="spotify-search-item-name",h.textContent=d.name;let L=document.createElement("div");L.className="spotify-search-item-artist",L.textContent=`${d.artist} — ${d.album}`,y.appendChild(h),y.appendChild(L),p.appendChild(y);let w=document.createElement("div");w.className="spotify-search-item-actions";let k=document.createElement("button");k.className="spotify-search-item-btn",k.title="Play",k.innerHTML='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',k.addEventListener("click",()=>{e({type:"play",trackUri:d.uri})});let E=document.createElement("button");E.className="spotify-search-item-btn",E.title="Add to queue",E.innerHTML='<svg viewBox="0 0 24 24"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>',E.addEventListener("click",()=>{e({type:"queue",trackUri:d.uri})}),w.appendChild(k),w.appendChild(E),p.appendChild(w),c.appendChild(p)}}return{root:n,setResults:a,destroy(){if(l)clearTimeout(l);n.remove()}}}function Tn(e){let n=/^(\d+):(\d{2})(?:\.(\d{1,3}))?$/.exec(e);if(!n)return null;let r=Number(n[1]),t=Number(n[2]),c=n[3]?Number(n[3].padEnd(3,"0")):0;if(!Number.isFinite(r)||!Number.isFinite(t)||t>59)return null;return r*60000+t*1000+c}function ut(e){if(!e)return[];let n=[];for(let t of e.split(/\r?\n/)){let c=[...t.matchAll(/\[([^\]]+)\]/g)].map((a)=>Tn(a[1])).filter((a)=>a!==null);if(c.length===0)continue;let l=t.replace(/(?:\[[^\]]+\])+/g,"").trim();for(let a of c)n.push({timeMs:a,text:l})}let r=[];for(let t of n.sort((c,l)=>c.timeMs-l.timeMs)){let c=r[r.length-1];if(c?.timeMs===t.timeMs)c.text=[c.text,t.text].filter(Boolean).join(`
`);else r.push({...t})}return r}function Jt(e){return e||"♪"}function en(e){return!e.includes(`
`)&&e.length>=36}function Lt(e){let n=[],r=null,t=-1;function c(){if(!r)return 0;if(!r.isPlaying)return r.progressMs;return Math.min(r.progressMs+Date.now()-r.updatedAt,r.durationMs||1/0)}function l(){if(n.length===0){let h=t!==-1;return t=-1,h}let d=c(),p=-1;for(let h=0;h<n.length;h++){if(n[h].timeMs>d)break;p=h}let y=p!==t;return t=p,y}function a(){let d=n.map((y,h)=>({...y,index:h,displayText:Jt(y.text),hasText:Boolean(y.text)}));if(!e||d.length<=e)return d;if(t<0)return d.slice(0,e);let p=Math.max(0,Math.min(t-Math.floor(e/2),d.length-e));return d.slice(p,p+e)}function u(){return n.map((d,p)=>({...d,index:p,displayText:Jt(d.text),hasText:Boolean(d.text)}))}return{clear(){n=[],r=null,t=-1},setLyrics(d){n=d,t=-1,l()},setPlayback(d){r=d},refreshActiveLineIndex:l,getActiveLineIndex(){return t},hasLyrics(){return n.length>0},getIndexedLines:u,getSnapshot(){return l(),{activeLineIndex:t,lines:a()}}}}var zn='<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>',tn='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',In='<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',An='<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',_n='<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>',Un='<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',Rn='<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>',Hn='<svg viewBox="0 0 24 24"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>',nn="♪";function ft(e){let n=Math.floor(e/1000),r=Math.floor(n/60),t=n%60;return`${r}:${t.toString().padStart(2,"0")}`}var on=280,On=336,ye=8;function It(e){return e==="modern"?On:on}function Dn(e){if(!e)return[];return e.split(/\r?\n/).map((n)=>n.trim()).filter(Boolean).slice(0,5)}function rn(e,n,r){let t=document.createElement("div");t.className="spotify-mini-player",t.dataset.style="default",t.style.setProperty("--spotify-mini-player-width",`${on}px`);let c=Ge("spotify-mini-art"),l=document.createElement("div");l.className="spotify-mini-info";let a=document.createElement("div");a.className="spotify-mini-track";let u=document.createElement("div");u.className="spotify-mini-artist";let d=document.createElement("div");d.className="spotify-mini-album",l.appendChild(a),l.appendChild(u),l.appendChild(d);let p=document.createElement("button");p.className="spotify-mini-header-btn",p.innerHTML=Un,p.title="Open full player";let y=document.createElement("button");y.className="spotify-mini-header-btn",y.innerHTML=Rn,y.title="Collapse";let h=document.createElement("div");h.className="spotify-mini-header-btns",h.appendChild(p),h.appendChild(y);let L=document.createElement("div");L.className="spotify-mini-progress-row";let w=document.createElement("span");w.className="spotify-mini-time";let k=document.createElement("div");k.className="spotify-mini-progress-bar";let E=document.createElement("div");E.className="spotify-mini-progress-fill",k.appendChild(E);let x=document.createElement("span");x.className="spotify-mini-time",L.appendChild(w),L.appendChild(k),L.appendChild(x);let U=document.createElement("div");U.className="spotify-mini-controls";function b(s,C=""){let R=document.createElement("button");return R.className=`spotify-mini-btn ${C}`.trim(),R.innerHTML=s,R}let N=b(zn),q=b(tn,"spotify-mini-btn-main"),F=b(An);U.appendChild(N),U.appendChild(q),U.appendChild(F);let se=document.createElement("div");se.className="spotify-mini-volume-row";let ie=document.createElement("span");ie.className="spotify-mini-volume-icon",ie.innerHTML=_n;let P=document.createElement("input");P.type="range",P.className="spotify-mini-volume-slider",P.min="0",P.max="100",P.value="50",se.appendChild(ie),se.appendChild(P);let V=document.createElement("div");V.className="spotify-mini-device-row";let W=document.createElement("span");W.className="spotify-mini-device-icon",W.innerHTML=Hn;let H=document.createElement("span");H.className="spotify-mini-device-name";let g=document.createElement("button");g.className="spotify-mini-device-toggle",g.textContent="Switch",V.appendChild(W),V.appendChild(H),V.appendChild(g);let z=document.createElement("div");z.className="spotify-mini-device-list";let _=document.createElement("div");_.className="spotify-mini-empty",_.textContent="No active playback";let j=document.createElement("div");j.className="spotify-mini-header",j.appendChild(c.el),j.appendChild(l),j.appendChild(h),t.appendChild(j),t.appendChild(L);let I=document.createElement("div");I.className="spotify-mini-lyrics-section";let G=document.createElement("div");G.className="spotify-mini-lyrics-header",G.textContent="Lyrics";let ge=document.createElement("div");ge.className="spotify-mini-lyrics-body";let he=document.createElement("div");he.className="spotify-mini-lyrics-status";let Z=Array.from({length:5},()=>{let s=document.createElement("div");return s.className="spotify-mini-lyric-line",ge.appendChild(s),s});ge.appendChild(he),I.appendChild(G),I.appendChild(ge),t.appendChild(I),t.appendChild(U),t.appendChild(se),t.appendChild(V),t.appendChild(z),t.appendChild(_);let ve=!1,J=0,A=!1,v=0,S="default",O=null,D=!1,B=0,Q=0,ee=!1,ce=null,Re=null,me=[],Ce=[],Le=!1,le=!1,pe=-1,xe=!1,ze=!1,ue=!1,Me=null,Xe=null,Ve=null,fe=!1,we=!1;function ke(s,C=!1){he.className=C?"spotify-mini-lyrics-status spotify-mini-lyrics-status-loading":"spotify-mini-lyrics-status",he.textContent=s,he.style.display="";for(let R of Z)R.style.display="none",R.textContent="",R.className="spotify-mini-lyric-line"}function et(){he.style.display="none";for(let s of Z)s.style.display=""}function He(){if(!ze||xe)return;ze=!1,K(!0)}function Oe(){if(ue)return;let s=Me,C=Xe,R=Ve;if(Me=null,Xe=null,Ve=null,s)_e(s.state,s.connected);if(C)ae(C);if(R!==null)ne(R);He()}function Ke(){if(!ee)return B;return Math.min(B+Math.max(0,Date.now()-Q),J||1/0)}function Ee(){if(me.length===0)return[];let C=[];if(pe<0)for(let R=0;R<Math.min(5,me.length);R++){let re=me[R];C.push({text:re.text||nn,index:R})}else{let R=Math.max(0,Math.min(pe-2,me.length-5));for(let re=0;re<5&&R+re<me.length;re++){let be=R+re,Qe=me[be];C.push({text:Qe.text||nn,index:be})}}while(C.length<5)C.push({text:" ",index:-1-C.length});return C}function $e(){if(le){ke("Loading lyrics...",!0);return}if(Le){ke("♪ Instrumental");return}if(me.length>0){et();let s=Ee();Z.forEach((C,R)=>{let re=s[R]??{text:" ",index:-1-R},be=pe<0?re.index:Math.abs(re.index-pe);if(C.className="spotify-mini-lyric-line",re.index===pe)C.classList.add("spotify-mini-lyric-line-active");else if(be===1)C.classList.add("spotify-mini-lyric-line-near");else if(be===2)C.classList.add("spotify-mini-lyric-line-mid");else C.classList.add("spotify-mini-lyric-line-far");C.textContent=re.text});return}if(Ce.length>0){et(),Z.forEach((s,C)=>{s.className="spotify-mini-lyric-line spotify-mini-lyric-line-plain",s.textContent=Ce[C]??" "});return}ke("No lyrics available")}function K(s=!1){if(xe){ze=!0;return}if(S!=="modern"||me.length===0||!O||O.trackUri!==Re){if(s&&S==="modern")$e();return}let C=Ke(),R=-1;for(let re=0;re<me.length;re++){if(me[re].timeMs>C)break;R=re}if(s||R!==pe)pe=R,$e()}function X(s=!1){let C=S==="modern"&&D&&Boolean(O);if(I.style.display=C?"":"none",!C)return;if(xe){ze=!0;return}if(K(!0),s&&A)Ze()}function Fe(){if(ue||!A||!ee||!J){ce=null;return}if(fe){ce=requestAnimationFrame(Fe);return}let s=Date.now()-Q,C=Math.min(B+s,J),R=C/J*100;E.style.width=`${R}%`,w.textContent=ft(C),K(),ce=requestAnimationFrame(Fe)}function Pe(){if(ce!==null)return;ce=requestAnimationFrame(Fe)}function Ne(){if(ce!==null)cancelAnimationFrame(ce),ce=null}N.addEventListener("click",(s)=>{s.stopPropagation(),e({type:"previous"})}),F.addEventListener("click",(s)=>{s.stopPropagation(),e({type:"next"})}),q.addEventListener("click",(s)=>{s.stopPropagation(),e({type:ve?"pause":"play"})}),p.addEventListener("click",(s)=>{s.stopPropagation(),We(),n()}),y.addEventListener("click",(s)=>{s.stopPropagation(),We()});let De=pt(k,{getMaxValue:()=>J,onInteractChange(s){fe=s},onPreview(s){let C=J>0?s/J*100:0;E.style.width=`${C}%`,w.textContent=ft(s)},onCommit(s){if(O)O={...O,progressMs:s};if(B=s,Q=Date.now(),K(!0),e({type:"seek",positionMs:s}),A&&ee)Pe()}}),oe=new Set,Ie=ct(P,{onInteractChange(s){we=s},onPreview(s){for(let C of oe)C(s)},onCommit(s){e({type:"set_volume",percent:s})}}),Be=!1,Ae=null;g.addEventListener("click",(s)=>{if(s.stopPropagation(),Be)z.style.display="none",Be=!1;else e({type:"get_devices"}),z.innerHTML='<div class="spotify-mini-device-loading">Loading devices…</div>',z.style.display="flex",Be=!0}),t.addEventListener("pointerdown",(s)=>s.stopPropagation());function te(s){if(!t.contains(s.target))We()}function Ze(){let{x:s,y:C,w:R,h:re}=r(),{innerWidth:be,innerHeight:Qe}=window,nt=It(S),Te=s+R/2-nt/2;Te=Math.max(ye,Math.min(Te,be-nt-ye)),t.style.left=`${Te}px`,t.style.top="0px",t.style.visibility="hidden",t.style.transform="scale(1)",t.style.display="flex";let Se=t.offsetHeight;v=Se,t.style.visibility="",t.style.transform="",t.style.display="";let Je,qe=!1;if(C-Se-ye>=ye)Je=C-Se-ye;else Je=C+re+ye,qe=!0;Je=Math.max(ye,Math.min(Je,Qe-Se-ye)),t.style.left=`${Te}px`,t.style.top=`${Je}px`;let st=s+R/2-Te,Mt=qe?-ye:Se+ye;t.style.transformOrigin=`${st}px ${Mt}px`}function tt(){if(!A||!v)return;let{x:s,y:C,w:R,h:re}=r(),{innerWidth:be,innerHeight:Qe}=window,nt=It(S),Te=s+R/2-nt/2;Te=Math.max(ye,Math.min(Te,be-nt-ye));let Se,Je=!1;if(C-v-ye>=ye)Se=C-v-ye;else Se=C+re+ye,Je=!0;Se=Math.max(ye,Math.min(Se,Qe-v-ye)),t.style.left=`${Te}px`,t.style.top=`${Se}px`;let qe=s+R/2-Te,st=Je?-ye:v+ye;t.style.transformOrigin=`${qe}px ${st}px`}function it(){if(!document.body.contains(t))document.body.appendChild(t);if(Ze(),t.classList.remove("open","closing"),t.offsetHeight,t.classList.add("open"),A=!0,ee)Pe();setTimeout(()=>document.addEventListener("click",te),0)}function We(){if(!A)return;A=!1,document.removeEventListener("click",te),Ne(),Ze(),t.classList.remove("open"),t.classList.add("closing");let s=()=>{t.classList.remove("closing"),t.removeEventListener("transitionend",s)};t.addEventListener("transitionend",s),setTimeout(s,250)}function _e(s,C){if(O=s,D=C,ue){Me={state:s,connected:C};return}if(!C||!s){fe=!1,we=!1,c.setUrl(null),j.style.display="none",L.style.display="none",I.style.display="none",U.style.display="none",se.style.display="none",V.style.display="none",z.style.display="none",Be=!1,_.style.display="",_.textContent=!C?"Connect to Spotify in Settings":"No active playback",J=0,E.style.width="0%",w.textContent=ft(0),x.textContent=ft(0),Ne();return}if(j.style.display="",L.style.display="",U.style.display="",se.style.display="",_.style.display="none",s.deviceName)H.textContent=s.deviceName,V.style.display="",Ae=s.deviceId;else V.style.display="none";if(a.textContent=s.trackName,u.textContent=s.artistName,d.textContent=s.albumName,J=s.durationMs,c.setUrl(je(s.albumArtUrl,s.trackUri)),ve=s.isPlaying,ee=s.isPlaying,q.innerHTML=ve?In:tn,!fe){B=s.progressMs,Q=Date.now();let R=s.durationMs>0?s.progressMs/s.durationMs*100:0;E.style.width=`${R}%`,w.textContent=ft(s.progressMs)}if(x.textContent=ft(s.durationMs),s.volume!==null&&!we)P.value=String(s.volume);if(A&&ve)Pe();else Ne();X()}function Ue(s,C,R,re){Re=s,me=ut(R),Ce=Dn(C),Le=re,le=!1,pe=-1,X(!0)}function f(s){if(le=s,s)Re=O?.trackUri??null,me=[],Ce=[],Le=!1,pe=-1;X(!0)}function T(s){if(S=s,t.dataset.style=s,t.style.setProperty("--spotify-mini-player-width",`${It(s)}px`),X(!0),A)Ze()}function ae(s){if(ue){Xe=s;return}if(z.innerHTML="",s.length===0){z.innerHTML='<div class="spotify-mini-device-loading">No devices found</div>';return}for(let C of s){let R=document.createElement("div");if(R.className=`spotify-mini-device-item${C.isActive?" active":""}`,R.innerHTML=`<span class="spotify-mini-device-item-name">${C.name}</span><span class="spotify-mini-device-item-type">${C.type}</span>`,!C.isActive)R.addEventListener("click",(re)=>{re.stopPropagation(),e({type:"transfer_playback",deviceId:C.id}),z.style.display="none",Be=!1});z.appendChild(R)}}function ne(s){if(ue){Ve=s;return}P.value=String(s)}return{root:t,update:_e,updateLyrics:Ue,setLyricsLoading:f,setLyricsUpdateSuspended(s){if(xe=s,!s)He()},setUiSuspended(s){if(ue=s,xe=s,s){Ne();return}if(Oe(),A&&ee)Pe()},setStyle:T,setDevices:ae,setVolume:ne,onVolumeChange(s){oe.add(s)},toggle(){if(A)We();else it()},hide:We,isOpen:()=>A,reposition:tt,destroy(){We(),Ne(),De(),Ie(),oe.clear(),t.remove()}}}function kt(e){let n=null,r=null,t=null,c=0,l=!1,a=0;function u(w){let k=e.getBoundingClientRect(),E=w.getBoundingClientRect(),x=Math.max(0,e.scrollHeight-e.clientHeight);return Math.min(Math.max(e.scrollTop+(E.top+E.height/2)-(k.top+e.clientHeight/2),0),x)}function d(){if(n!==null)cancelAnimationFrame(n);n=null,r=null}function p(){d(),t=null,c=Date.now()}function y(){d(),t=null}function h(w){if(n=null,r===null||!r.isConnected||!e.isConnected){d();return}let k=Math.min(Math.max(w-a,0),100);a=w;let E=Math.max(0,e.scrollHeight-e.clientHeight),x=u(r),U=x-e.scrollTop;if(Math.abs(U)<0.5){t=x,e.scrollTop=x,d();return}let b=U*(1-Math.exp(-k/85)),N=1800*(k/1000),q=Math.abs(b)>N?Math.sign(b)*N:b,F=Math.min(Math.max(e.scrollTop+q,0),E);t=F,e.scrollTop=F,n=requestAnimationFrame(h)}e.addEventListener("wheel",p,{passive:!0}),e.addEventListener("touchmove",p,{passive:!0}),e.addEventListener("pointerdown",p,{passive:!0});function L(){if(n!==null||r!==null)return;if(t!==null&&Math.abs(e.scrollTop-t)<=1)return;p()}return e.addEventListener("scroll",L,{passive:!0}),{center(w,k){if(l)return;if(!k?.force&&Date.now()-c<=2500)return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){d(),t=u(w),e.scrollTop=t;return}if(r=w,n===null)a=performance.now(),n=requestAnimationFrame(h)},suspend(w){if(l===w)return!1;if(l=w,l)y();return!0},cancel:y,destroy(){y(),e.removeEventListener("wheel",p),e.removeEventListener("touchmove",p),e.removeEventListener("pointerdown",p),e.removeEventListener("scroll",L)}}}var Bn='<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>',sn='<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',qn='<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',Vn='<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',$n='<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>',Fn='<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',Wn='<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>',At='<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',Yn=4000;function St(e){let n=Math.floor(e/1000),r=Math.floor(n/60),t=n%60;return`${r}:${t.toString().padStart(2,"0")}`}function jn(e){if(!e)return[];return e.split(/\r?\n/).map((n)=>n.trim()).filter(Boolean)}function yt(e){e.addEventListener("pointerdown",(n)=>n.stopPropagation()),e.addEventListener("pointermove",(n)=>n.stopPropagation()),e.addEventListener("pointerup",(n)=>n.stopPropagation()),e.addEventListener("touchstart",(n)=>n.stopPropagation(),{passive:!0}),e.addEventListener("touchmove",(n)=>n.stopPropagation(),{passive:!0}),e.addEventListener("touchend",(n)=>n.stopPropagation(),{passive:!0}),e.addEventListener("click",(n)=>n.stopPropagation())}function _t(e){let n=document.createElement("div");n.className=`${e} spotify-modern-widget-marquee`,n.dataset.marqueePhase="idle";let r=document.createElement("div");r.className=`${e}-content spotify-modern-widget-marquee-content`,n.appendChild(r);let t=null;function c(){if(t)clearTimeout(t),t=null;n.dataset.marqueePhase="idle",r.classList.remove("spotify-modern-widget-marquee-animate")}function l(u){if(n.dataset.marqueePhase="scrolling",r.classList.remove("spotify-modern-widget-marquee-animate"),u)r.offsetWidth;r.classList.add("spotify-modern-widget-marquee-animate")}function a(u){if(t)clearTimeout(t),t=null;n.dataset.marqueePhase="rest",r.classList.remove("spotify-modern-widget-marquee-animate"),t=setTimeout(()=>{t=null,l(u)},Yn)}return r.addEventListener("animationend",(u)=>{if(u.animationName!=="spotify-modern-marquee"||n.dataset.marqueePhase!=="scrolling")return;a(!0)}),{root:n,setText(u){r.textContent=u,n.setAttribute("aria-label",u)},refresh(u,d=!1){if(!u){n.dataset.overflow="false",c(),n.style.removeProperty("--spotify-modern-marquee-distance"),n.style.removeProperty("--spotify-modern-marquee-duration");return}let p=Math.ceil(r.scrollWidth-n.clientWidth);if(p<=6){n.dataset.overflow="false",c(),n.style.removeProperty("--spotify-modern-marquee-distance"),n.style.removeProperty("--spotify-modern-marquee-duration");return}n.dataset.overflow="true",n.style.setProperty("--spotify-modern-marquee-distance",`${p}px`),n.style.setProperty("--spotify-modern-marquee-duration",`${Math.max(8,Math.min(20,8+p/18))}s`);let y=t!==null,h=n.dataset.marqueePhase==="scrolling";if(d||!y&&!h)a(d)}}}function an(e,n,r){let t=document.createElement("div");t.className="spotify-modern-widget-player",t.dataset.expanded="false";let c=document.createElement("div");c.className="spotify-modern-widget-compact";let l=Ge("spotify-modern-widget-compact-art"),a=document.createElement("div");a.className="spotify-modern-widget-compact-fallback",a.innerHTML=At;let u=document.createElement("div");u.className="spotify-modern-widget-compact-overlay";let d=document.createElement("div");d.className="spotify-modern-widget-compact-status";let p=document.createElement("div");p.className="spotify-modern-widget-compact-progress",u.appendChild(d),c.appendChild(l.el),c.appendChild(a),c.appendChild(u),c.appendChild(p);let y=document.createElement("div");y.className="spotify-modern-widget-expanded";let h=document.createElement("div");h.className="spotify-modern-widget-header";let L=document.createElement("div");L.className="spotify-modern-widget-eyebrow",L.textContent="Now Playing";let w=document.createElement("div");w.className="spotify-modern-widget-header-buttons";let k=document.createElement("button");k.className="spotify-modern-widget-icon-btn",k.innerHTML=Fn,k.title="Open full player";let E=document.createElement("button");E.className="spotify-modern-widget-icon-btn",E.innerHTML=Wn,E.title="Collapse",yt(k),yt(E),k.addEventListener("click",()=>n()),E.addEventListener("click",()=>r()),w.appendChild(k),w.appendChild(E),h.appendChild(L),h.appendChild(w);let x=document.createElement("div");x.className="spotify-modern-widget-hero";let U=Ge("spotify-modern-widget-art");U.el.title="Collapse";let b=document.createElement("div");b.className="spotify-modern-widget-art-fallback",b.innerHTML=At,b.title="Collapse",yt(U.el),yt(b),U.el.addEventListener("click",()=>r()),b.addEventListener("click",()=>r());let N=document.createElement("div");N.className="spotify-modern-widget-meta";let q=_t("spotify-modern-widget-track"),F=_t("spotify-modern-widget-artist"),se=_t("spotify-modern-widget-album");N.appendChild(q.root),N.appendChild(F.root),N.appendChild(se.root),x.appendChild(U.el),x.appendChild(b),x.appendChild(N);let ie=document.createElement("div");ie.className="spotify-modern-widget-progress-row";let P=document.createElement("span");P.className="spotify-modern-widget-time";let V=document.createElement("div");V.className="spotify-modern-widget-progress-bar";let W=document.createElement("div");W.className="spotify-modern-widget-progress-fill",V.appendChild(W);let H=document.createElement("span");H.className="spotify-modern-widget-time",ie.appendChild(P),ie.appendChild(V),ie.appendChild(H);let g=document.createElement("div");g.className="spotify-modern-widget-lyrics";let z=document.createElement("div");z.className="spotify-modern-widget-section-label",z.textContent="Lyrics";let _=document.createElement("div");_.className="spotify-modern-widget-lyrics-body";let j=document.createElement("div");j.className="spotify-modern-widget-lyrics-track",_.appendChild(j),g.appendChild(z),g.appendChild(_);let I=document.createElement("div");I.className="spotify-modern-widget-controls";let G=document.createElement("button");G.className="spotify-modern-widget-btn",G.innerHTML=Bn;let ge=document.createElement("button");ge.className="spotify-modern-widget-btn spotify-modern-widget-btn-main",ge.innerHTML=sn;let he=document.createElement("button");he.className="spotify-modern-widget-btn",he.innerHTML=Vn,I.appendChild(G),I.appendChild(ge),I.appendChild(he);let Z=document.createElement("div");Z.className="spotify-modern-widget-volume-row";let ve=document.createElement("span");ve.className="spotify-modern-widget-volume-icon",ve.innerHTML=$n;let J=document.createElement("input");J.type="range",J.min="0",J.max="100",J.value="50",J.className="spotify-modern-widget-volume-slider",Z.appendChild(ve),Z.appendChild(J);let A=document.createElement("div");A.className="spotify-modern-widget-empty";let v=document.createElement("div");v.className="spotify-modern-widget-empty-icon",v.innerHTML=At;let S=document.createElement("div");S.className="spotify-modern-widget-empty-title",S.textContent="No music playing.";let O=document.createElement("div");O.className="spotify-modern-widget-empty-subtitle",O.textContent="Your speakers are enjoying a brief moment of mindfulness.",A.appendChild(v),A.appendChild(S),A.appendChild(O),y.appendChild(h),y.appendChild(x),y.appendChild(ie),y.appendChild(g),y.appendChild(I),y.appendChild(Z),y.appendChild(A),t.appendChild(c),t.appendChild(y),[V,G,ge,he,J].forEach((f)=>yt(f)),yt(_);let D=!1,B=null,Q=!1,ee=0,ce=0,Re=0,me=!1,Ce=null,Le=null,le=Lt(),pe=[],xe=!1,ze=!1,ue="",Me=[],Xe=kt(_),Ve="",fe=null,we=null,ke=!1,et=!1,He=new ResizeObserver(()=>{Ke(!1)});He.observe(N),He.observe(t);let Oe=new ResizeObserver(()=>{if(!Q)return;De(!0)});Oe.observe(_);function Ke(f){requestAnimationFrame(()=>{q.refresh(Q,f),F.refresh(Q,f),se.refresh(Q,f)})}function Ee(f){if(fe)clearTimeout(fe);if(we)clearTimeout(we);Ke(f),fe=setTimeout(()=>Ke(f),180),we=setTimeout(()=>Ke(f),460)}function $e(f){l.setUrl(f),a.style.display=f?"none":"flex"}function K(f){U.setUrl(f),b.style.display=f?"none":"flex"}function X(){if(!me)return ce;return Math.min(ce+Math.max(0,Date.now()-Re),ee||1/0)}function Fe(f,T){p.style.setProperty("--spotify-modern-widget-compact-progress",`${Math.max(0,Math.min(100,f))}%`),p.style.opacity=T?"1":"0"}function Pe(){Xe.cancel(),j.innerHTML="",_.scrollTop=0,Me=[]}function Ne(){Pe(),Me=le.getIndexedLines().map((T,ae)=>{let ne=document.createElement("div");return ne.className="spotify-modern-widget-lyric-line spotify-modern-widget-lyric-line-enter",ne.style.setProperty("--spotify-modern-lyric-enter-delay",`${Math.min(ae*22,110)}ms`),ne.textContent=T.displayText,j.appendChild(ne),ne})}function De(f=!1){if(!le.hasLyrics())return;let T=le.getActiveLineIndex(),ae=T>=0?Me[T]:Me[0];if(ae)Xe.center(ae,{force:f})}function oe(f=!0){let T=le.getActiveLineIndex();if(le.getIndexedLines().forEach((ne,s)=>{let C=Me[s];if(!C)return;if(C.className="spotify-modern-widget-lyric-line",ne.index===T)C.classList.add("active");else if(T>=0){let R=Math.abs(ne.index-T);if(R===1)C.classList.add("near");else if(R===2)C.classList.add("mid");else C.classList.add("far")}else C.classList.add("far")}),!f)return;De()}function Ie(){if(Pe(),!D||!B){ue="";let T=document.createElement("div");T.className="spotify-modern-widget-lyrics-status",T.textContent=D?"Start playback to see lyrics":"Connect Spotify to see lyrics",j.appendChild(T);return}if(ze){ue="loading";let T=document.createElement("div");T.className="spotify-modern-widget-lyrics-status spotify-modern-widget-lyrics-status-loading",T.textContent="Loading lyrics...",j.appendChild(T);return}if(xe){ue="instrumental";let T=document.createElement("div");T.className="spotify-modern-widget-lyrics-status",T.textContent="♪ Instrumental",j.appendChild(T);return}if(le.hasLyrics()&&B.trackUri===Le){ue=le.getIndexedLines().map((ae)=>`${ae.index}:${ae.text}`).join("|"),Ne(),oe(!1);return}if(pe.length>0){let T=pe.join("|"),ae=T!==ue;ue=T,pe.forEach((ne,s)=>{let C=document.createElement("div");if(C.className="spotify-modern-widget-lyric-line plain",ae)C.classList.add("spotify-modern-widget-lyric-line-enter"),C.style.setProperty("--spotify-modern-lyric-enter-delay",`${Math.min(s*20,100)}ms`);C.textContent=ne,j.appendChild(C)});return}ue="empty";let f=document.createElement("div");f.className="spotify-modern-widget-lyrics-status",f.textContent="No lyrics available",j.appendChild(f)}function Be(f=!1){if(!B||B.trackUri!==Le||!le.hasLyrics()){if(f)Ie();return}if(le.setPlayback({trackUri:B.trackUri,progressMs:X(),durationMs:ee,isPlaying:me,updatedAt:Date.now()}),f){Ie();return}if(le.refreshActiveLineIndex())oe(!0)}function Ae(){if(!B||!D||!me||!ee){Ce=null;return}if(ke){Ce=requestAnimationFrame(Ae);return}let f=X(),T=ee>0?f/ee*100:0;W.style.width=`${T}%`,Fe(T,!0),P.textContent=St(f),Be(),Ce=requestAnimationFrame(Ae)}function te(){if(Ce!==null)return;Ce=requestAnimationFrame(Ae)}function Ze(){if(Ce!==null)cancelAnimationFrame(Ce),Ce=null}G.addEventListener("click",()=>e({type:"previous"})),he.addEventListener("click",()=>e({type:"next"})),ge.addEventListener("click",()=>e({type:B?.isPlaying?"pause":"play"}));let tt=pt(V,{getMaxValue:()=>ee,onInteractChange(f){ke=f},onPreview(f){let T=ee>0?f/ee*100:0;W.style.width=`${T}%`,Fe(T,ee>0),P.textContent=St(f)},onCommit(f){if(B)B={...B,progressMs:f};if(ce=f,Re=Date.now(),Be(!0),e({type:"seek",positionMs:f}),me)te()},stopPropagation:!0}),it=ct(J,{onInteractChange(f){et=f},onCommit(f){e({type:"set_volume",percent:f})},stopPropagation:!0});function We(f,T){if(B=f,D=T,t.dataset.empty=!f?"true":"false",!T||!f){ke=!1,et=!1,L.textContent=T?"Standby":"Connect Spotify",d.textContent=T?"No playback":"Connect Spotify",A.style.display="grid",x.style.display="none",ie.style.display="none",g.style.display="none",I.style.display="none",Z.style.display="none",Fe(0,!1),$e(null),K(null),le.setPlayback(null),Ve="",Ze(),Ie();return}L.textContent="Now Playing";let ae=je(f.albumArtUrl,f.trackUri);$e(ae),K(ae),d.textContent=f.isPlaying?"Playing":"Paused";let ne=`${f.trackName}|${f.artistName}|${f.albumName}`,s=ne!==Ve;if(Ve=ne,q.setText(f.trackName),F.setText(f.artistName),se.setText(f.albumName),x.style.display="grid",ie.style.display="grid",g.style.display="grid",I.style.display="flex",Z.style.display="flex",A.style.display="none",ee=f.durationMs,me=f.isPlaying,le.setPlayback({trackUri:f.trackUri,progressMs:ke?ce:f.progressMs,durationMs:f.durationMs,isPlaying:f.isPlaying,updatedAt:ke?Re:Date.now()}),ge.innerHTML=f.isPlaying?qn:sn,!et)J.value=String(f.volume??Number(J.value));if(!ke){ce=f.progressMs,Re=Date.now();let C=f.durationMs>0?f.progressMs/f.durationMs*100:0;W.style.width=`${C}%`,Fe(C,f.durationMs>0),P.textContent=St(f.progressMs)}if(H.textContent=St(f.durationMs),le.hasLyrics()&&f.trackUri===Le)if(Me.length===0)Ie();else Be();else if(j.childElementCount===0)Ie();if(Ee(s),f.isPlaying)te();else Ze()}function _e(f,T,ae,ne){Le=f;let s=ut(ae);le.setLyrics(s),pe=jn(T),xe=ne,ze=!1,Be(!0)}function Ue(f){if(ze=f,f)Le=B?.trackUri??null,le.clear(),pe=[],xe=!1;Ie()}return{root:t,update:We,updateLyrics:_e,setLyricsLoading:Ue,setLyricsBlur(f){if(f)g.style.removeProperty("--spotify-lyrics-enter-blur");else g.style.setProperty("--spotify-lyrics-enter-blur","0px")},setAutoScrollSuspended(f){if(Xe.suspend(f)&&!f&&le.hasLyrics())oe(!0)},setCollapsedSize(f){t.style.setProperty("--spotify-modern-widget-collapsed-size",`${f}px`)},setExpanded(f){if(Q=f,t.dataset.expanded=String(f),Ee(!0),f)requestAnimationFrame(()=>De(!0))},isExpanded(){return Q},destroy(){if(Ze(),Xe.destroy(),tt(),it(),fe)clearTimeout(fe);if(we)clearTimeout(we);He.disconnect(),Oe.disconnect(),l.destroy(),U.destroy(),t.remove()}}}var Gn=180,Xn=1400,Kn=1800;function ln(e,n,r,t){let c=["spotify-lyrics-line"];if(!r)c.push("spotify-lyrics-line-blank");if(e===n)c.push("spotify-lyrics-line-active");else if(e<n)c.push("spotify-lyrics-line-past");else c.push("spotify-lyrics-line-future");if(n>=0){let l=Math.abs(e-n);if(l>=1){let a=Math.min(l,4);if(c.push(`spotify-lyrics-line-tier-${a}`),t&&a>=2)c.push(`spotify-lyrics-line-blur-${a}`)}}return c.join(" ")}function dn(e){let n=document.createElement("div");n.className="spotify-section spotify-lyrics-section";let r=document.createElement("h3");r.className="spotify-section-title",r.textContent="Lyrics",n.appendChild(r);let t=document.createElement("div");t.className="spotify-lyrics-body",n.appendChild(t);let c=null,l=[],a=Lt(),u=kt(t),d=null,p=-1,y=!0,h=null,L=null,w=null,k=0;function E(){if(L)clearTimeout(L),L=null;t.classList.remove("spotify-lyrics-loading")}function x(){if(h)clearInterval(h),h=null}function U(){if(h||l.length===0)return;h=setInterval(F,200)}function b(){l.forEach((g)=>{g.el.className=ln(g.index,p,Boolean(g.text),y)})}function N(){if(y)n.style.removeProperty("--spotify-lyrics-enter-blur");else n.style.setProperty("--spotify-lyrics-enter-blur","0px")}function q(g,z=!1){p=g,b();let _=l.find((j)=>j.index===p);if(_)u.center(_.textEl,{force:z})}function F(){if(l.length===0)return;if(a.refreshActiveLineIndex())q(a.getActiveLineIndex())}function se(){x(),u.cancel(),E(),t.innerHTML="",t.className="spotify-lyrics-body",c=null,l=[],a.clear(),d=null,p=-1,w=null,k=0}function ie(g){if(E(),!g)return;if(g)x(),u.cancel(),t.innerHTML="",t.className="spotify-lyrics-body spotify-lyrics-loading",l=[],a.clear(),p=-1,L=setTimeout(()=>{if(L=null,!t.classList.contains("spotify-lyrics-loading"))return;let z=document.createElement("div");z.className="spotify-lyrics-status spotify-lyrics-status-loading",z.textContent="Loading lyrics...",t.appendChild(z)},Gn)}function P(g){E(),t.className="spotify-lyrics-body spotify-lyrics-has-content spotify-lyrics-synced",a.setLyrics(g);let z=a.getSnapshot();if(p=z.activeLineIndex,l=z.lines.map((_,j)=>{let I=document.createElement("div"),G=document.createElement("div");if(I.className=ln(_.index,p,_.hasText,y),I.classList.add("spotify-lyrics-line-enter"),I.style.setProperty("--spotify-lyrics-enter-delay",`${Math.min(j*28,280)}ms`),G.className="spotify-lyrics-line-text",!_.hasText)G.classList.add("spotify-lyrics-line-symbol");if(en(_.text))G.classList.add("spotify-lyrics-line-text-long");return G.textContent=_.displayText,I.appendChild(G),I.addEventListener("click",()=>{if(w=_.timeMs,k=Date.now()+Kn,d&&d.trackUri===c)d={...d,progressMs:_.timeMs,updatedAt:Date.now()},a.setPlayback(d);q(_.index,!0),e?.(_.timeMs)}),t.appendChild(I),{index:_.index,timeMs:_.timeMs,text:_.text,el:I,textEl:G}}),F(),d?.isPlaying)U()}function V(g){E(),t.className="spotify-lyrics-body spotify-lyrics-has-content";let z=document.createElement("div");z.className="spotify-lyrics-text spotify-lyrics-text-enter",z.textContent=g,t.appendChild(z)}function W(g,z,_,j){if(x(),u.cancel(),E(),c=g,t.innerHTML="",l=[],p=-1,j){t.className="spotify-lyrics-body";let G=document.createElement("div");G.className="spotify-lyrics-status",G.textContent="♪ Instrumental",t.appendChild(G);return}let I=ut(_);if(I.length>0){P(I);return}if(!z){t.className="spotify-lyrics-body";let G=document.createElement("div");G.className="spotify-lyrics-status",G.textContent="No lyrics available",t.appendChild(G);return}V(z)}function H(g){if(!g||g.trackUri!==c){d=null,a.setPlayback(null),w=null,k=0,x();return}if(w!==null)if(Math.abs(g.progressMs-w)<=Xn)w=null,k=0;else if(Date.now()<k)return;else w=null,k=0;if(d={trackUri:g.trackUri,progressMs:g.progressMs,durationMs:g.durationMs,isPlaying:g.isPlaying,updatedAt:Date.now()},a.setPlayback(d),F(),g.isPlaying)U();else x()}return{root:n,update:W,updatePlayback:H,setLoading:ie,setAutoScrollSuspended(g){if(u.suspend(g)&&!g&&l.length)q(p,!0)},setBlurEnabled(g){if(y===g)return;y=g,N(),b()},clear:se,destroy(){x(),u.destroy(),E(),n.remove()}}}var Ut="right",Zn='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',Qn='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',cn='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>',Jn='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zM19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7z"/></svg>';function ei(e){try{return new Date(e).toLocaleString(void 0,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}catch{return""}}function pn(e,n){let r=new Map,t=new Map,c=new Map,l=null,a=null,u=null,d=null,p=null,y=null,h=null,L=null,w=null,k=null,E=null,x=null,U=null;function b(v){let S=r.get(v);if(!S)return null;let O=t.get(v)??0;return S.get(O)??null}function N(v){let S=r.get(v);return!!S&&S.size>0}function q(v){if(!N(v))return;let S=c.get(v);if(!S||!S.isConnected){let O=e.dom.findMessageElement(v);if(!O)return;let D=e.dom.inject(O,`<button type="button" class="spotify-song-badge" aria-label="Song that was playing" title="Song that was playing">${Zn}</button>`,"beforeend");D.classList.add("spotify-song-badge-wrap"),D.dataset.corner=Ut,D.addEventListener("click",(B)=>{B.stopPropagation(),B.preventDefault(),G(v,D)}),c.set(v,D),S=D}F(v)}function F(v){let S=c.get(v);if(!S)return;S.style.display=b(v)?"":"none"}function se(){for(let{messageId:v}of e.dom.listMessageElements())if(N(v))q(v)}function ie(){if(a)return;a=document.createElement("div"),a.className="spotify-song-pop";let v=document.createElement("div");v.className="spotify-song-pop-header",v.textContent="Playing when generated";let S=document.createElement("div");S.className="spotify-song-pop-body",u=Ge("spotify-song-pop-art"),u.el.style.display="";let O=document.createElement("div");O.className="spotify-song-pop-info",d=document.createElement("div"),d.className="spotify-song-pop-track",p=document.createElement("div"),p.className="spotify-song-pop-artist",y=document.createElement("div"),y.className="spotify-song-pop-album",h=document.createElement("div"),h.className="spotify-song-pop-when",O.appendChild(d),O.appendChild(p),O.appendChild(y),O.appendChild(h),S.appendChild(u.el),S.appendChild(O);let D=document.createElement("div");D.className="spotify-song-pop-actions",L=document.createElement("button"),L.type="button",L.className="spotify-song-pop-btn spotify-song-pop-btn-primary",L.innerHTML=`${Qn}<span>Play</span>`,L.addEventListener("click",(B)=>{B.stopPropagation();let Q=E?b(E):null;if(Q?.trackUri)n({type:"play",trackUri:Q.trackUri});I()}),w=document.createElement("button"),w.type="button",w.className="spotify-song-pop-btn",P(),w.addEventListener("click",(B)=>{B.stopPropagation();let Q=E?b(E):null;if(Q)V(Q)}),k=document.createElement("a"),k.className="spotify-song-pop-btn spotify-song-pop-link",k.target="_blank",k.rel="noopener noreferrer",k.innerHTML=`${Jn}<span>Open</span>`,k.addEventListener("click",(B)=>B.stopPropagation()),D.appendChild(L),D.appendChild(w),D.appendChild(k),a.appendChild(v),a.appendChild(S),a.appendChild(D),a.addEventListener("click",(B)=>B.stopPropagation()),document.body.appendChild(a)}function P(){if(!w)return;w.innerHTML=`${cn}<span>Share</span>`}async function V(v){let S=`${v.trackName} — ${v.artistName}`,O=navigator;if(typeof O.share==="function")try{await O.share({title:v.trackName,text:S,url:v.spotifyUrl});return}catch{}try{if(await navigator.clipboard?.writeText(v.spotifyUrl),w){if(w.innerHTML=`${cn}<span>Copied!</span>`,U)clearTimeout(U);U=setTimeout(P,1400)}}catch{}}function W(v){if(ie(),P(),!v){if(u?.setUrl(null),d)d.textContent="No track playing";if(p)p.textContent="";if(y)y.textContent="Nothing was playing when this version was written.";if(h)h.textContent="";if(L)L.style.display="none";if(w)w.style.display="none";if(k)k.style.display="none";return}if(u?.setUrl(je(v.albumArtUrl,v.trackUri)),d)d.textContent=v.trackName;if(p)p.textContent=v.artistName;if(y)y.textContent=v.albumName;if(h)h.textContent=ei(v.capturedAt);if(L)L.style.display="";if(w)w.style.display="";if(k)k.style.display="",k.href=v.spotifyUrl}function H(v){if(!a)return;let S=v.getBoundingClientRect(),O=a.offsetWidth||280,D=a.offsetHeight||200,B=8,Q=S.top-D-8,ee="bottom";if(Q<B)Q=S.bottom+8,ee="top";let ce=S.right-O,Re=Ut==="right"?"right":"left";if(Ut==="left")ce=S.left;ce=Math.max(B,Math.min(ce,window.innerWidth-O-B)),Q=Math.max(B,Math.min(Q,window.innerHeight-D-B)),a.style.left=`${ce}px`,a.style.top=`${Q}px`,a.style.transformOrigin=`${ee} ${Re}`}function g(v){let S=v.target;if(!(S instanceof Node))return;if(a&&a.contains(S))return;if(x&&x.contains(S))return;I()}function z(){I()}function _(v){if(v.key==="Escape")I()}function j(v,S){W(b(v)),E=v,x=S,a.classList.add("open"),H(S),setTimeout(()=>{document.addEventListener("click",g,!0),window.addEventListener("scroll",z,!0),window.addEventListener("resize",z,!0),document.addEventListener("keydown",_,!0)},0)}function I(){if(!a||!E)return;a.classList.remove("open"),E=null,x=null,document.removeEventListener("click",g,!0),window.removeEventListener("scroll",z,!0),window.removeEventListener("resize",z,!0),document.removeEventListener("keydown",_,!0)}function G(v,S){if(E===v)I();else{if(E)I();j(v,S)}}function ge(v,S){if(v!==l)J();l=v;let O=new Set(S.map((D)=>D.messageId));for(let D of[...r.keys()])if(!O.has(D))ve(D);for(let D of S){let B=new Map;for(let[Q,ee]of Object.entries(D.bySwipe))B.set(Number(Q),ee);r.set(D.messageId,B),t.set(D.messageId,D.activeSwipe),q(D.messageId)}}function he(v,S,O,D){if(l&&v!==l)return;l=v;let B=r.get(S)??new Map;if(B.set(O,D),r.set(S,B),t.set(S,O),q(S),E===S)W(b(S))}function Z(v,S){if(t.set(v,S),F(v),E===v){let O=b(v);if(O)W(O);else I()}}function ve(v){if(E===v)I();r.delete(v),t.delete(v);let S=c.get(v);if(S){try{e.dom.uninject(S)}catch{}c.delete(v)}}function J(){I();for(let v of c.values())try{e.dom.uninject(v)}catch{}c.clear(),r.clear(),t.clear(),l=null}function A(){if(J(),U)clearTimeout(U);u?.destroy(),a?.remove(),a=null}return{setChatSongs:ge,setMessageSong:he,decorate:q,decorateMounted:se,setActiveSwipe:Z,removeMessage:ve,reset:J,destroy:A}}var ti={width:320,height:196},ni={width:348,height:520};var mn={width:300,height:420};function un({desktopPopout:e,hasPlayback:n,viewportHeight:r,viewportWidth:t}){let c=n?ni:ti;if(e)return{...c};if(!n)return{width:Math.max(280,Math.min(c.width,t-24)),height:c.height};return{width:Math.max(mn.width,Math.min(c.width,t-24)),height:Math.max(mn.height,Math.min(c.height,r-24))}}var ii='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.224-2.719a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.517.781.781 0 01.517-.972c3.632-1.102 8.147-.568 11.236 1.327a.78.78 0 01.257 1.071zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.936.936 0 11-.543-1.791c3.532-1.072 9.404-.865 13.115 1.338a.936.936 0 01-.954 1.613z"/></svg>',oi='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>',ri=[1,0,6],si=1600,ai=2200,li=1200,di=4200;function ci(e){if(!e)return 0;let n=e.match(/\d+/);return n?Number(n[0]):0}function pi(e,n){let r=e.split(".");for(let t=0;t<n.length;t+=1){let c=ci(r[t]),l=n[t];if(c>l)return!0;if(c<l)return!1}return!0}async function mi(){try{let e=await fetch("/api/v1/system/info",{credentials:"same-origin"});if(!e.ok)return!0;let n=await e.json(),r=typeof n?.backend?.version==="string"?n.backend.version:null;return r?pi(r,ri):!0}catch{return!0}}function ui(e){if(typeof e.deferReady!=="function"||typeof e.ready!=="function")return{dispose(){},release(){}};e.deferReady();let n=mi(),r=!1,t=!1;return{dispose(){r=!0},release(){if(r||t)return;t=!0,n.then((c)=>{if(!r&&c)e.ready()})}}}function fn(e){let n=ui(e),r=[],t="__TAURI_INTERNALS__"in window&&new URLSearchParams(window.location.search).has("desktopWidgetExtension"),c=e.dom.addStyle(Gt);r.push(c);let l=null,a=!1,u={clientId:"",hasSecret:!1,hasLastfmKey:!1,callbackUrl:void 0,promptAudioPreviewEnabled:!1},d=null,p=null,y=null,h={small:36,medium:48,large:64},L={small:112,medium:128,large:144},w=24,k=256,E=96,x=256,U="spotify-controls-widget-prefs";function b(i){return i==="modern"?L:h}function N(i){return i==="modern"?{min:E,max:x}:{min:w,max:k}}function q(i,o){let{min:m,max:M}=N(o);return Math.max(m,Math.min(i,M))}function F(i){return i==="small"||i==="medium"||i==="large"||i==="custom"}function se(i,o){let m=b(o);if(i===m.small)return"small";if(i===m.large)return"large";if(i!==m.medium)return"custom";return"medium"}function ie(i){let o=i?.miniPlayerStyle==="modern"?"modern":"default",m=b(o),M=F(i?.sizeMode)?i.sizeMode:void 0,Y=typeof i?.size==="number"?q(i.size,o):m.medium;if(M&&M!=="custom")Y=m[M];else if(!M)M=se(Y,o);return{size:Y,shape:i?.shape==="squircle"?"squircle":"circle",sizeMode:M,miniPlayerStyle:o,lyricsBlur:i?.lyricsBlur!==!1,x:typeof i?.x==="number"?i.x:void 0,y:typeof i?.y==="number"?i.y:void 0}}let P=48,V="circle",W="medium",H="default",g=!0,z,_;try{let i=ie(JSON.parse(localStorage.getItem(U)||"{}"));P=i.size,V=i.shape,W=i.sizeMode,H=i.miniPlayerStyle,g=i.lyricsBlur!==!1,z=i.x,_=i.y}catch{}let j=null;function I(){let i=j??K.getPosition(),o={size:P,shape:V,sizeMode:W,miniPlayerStyle:H,lyricsBlur:g,x:i.x,y:i.y};localStorage.setItem(U,JSON.stringify(o)),A({type:"save_widget_prefs",prefs:o})}let G=null;function ge(i){if(j=i,G)clearTimeout(G);G=setTimeout(I,500)}function he(i=Date.now()){if(d&&i>d.expiresAt)d=null;if(p&&i>p.expiresAt)p=null;if(y&&i>y.expiresAt)y=null}function Z(i,o=Date.now()){let m=i.isPlaying?Math.max(0,o-i.committedAt):0;return Math.min(i.positionMs+m,i.durationMs||1/0)}function ve(i,o=Date.now()){let m=i;if(p)if(m.volume!==null&&Math.abs(m.volume-p.percent)<=1)p=null;else if(o<=p.expiresAt)m={...m,volume:p.percent};else p=null;if(d)if(d.trackUri&&m.trackUri!==d.trackUri)d=null;else{let M=Math.round(Math.min(Z(d,o),m.durationMs||d.durationMs||1/0));if(Math.abs(m.progressMs-M)<=ai)d=null;else if(o<=d.expiresAt)m={...m,progressMs:M};else d=null}return m}function J(i){let o=Date.now();if(he(o),!i){if(y&&l)return ve(l,o);return null}if(y){if(!y.trackUri||i.trackUri!==y.trackUri||o>y.expiresAt)y=null}return ve(i,o)}function A(i){let o=i,m=Date.now();switch(o.type){case"seek":d={committedAt:m,durationMs:l?.durationMs??o.positionMs,expiresAt:m+si,isPlaying:l?.isPlaying??!1,positionMs:o.positionMs,trackUri:l?.trackUri??null};break;case"set_volume":p={expiresAt:m+li,percent:o.percent};break;case"next":case"previous":y={expiresAt:m+di,trackUri:l?.trackUri??null};break}e.sendToBackend(o)}let v=null,S=0,O=null,D=new Map,B=48;function Q(){if(O)clearTimeout(O),O=null}function ee(){Q(),S+=1,A({type:"album_colors",colors:null})}function ce(i,o){D.delete(i),D.set(i,o);while(D.size>B){let m=D.keys().next().value;if(!m)break;D.delete(m)}}function Re(i=1800){Q(),O=setTimeout(()=>{O=null,ee()},i)}function me(i){return new Promise((o)=>{let m=new Image;m.crossOrigin="anonymous",m.onload=()=>{try{let M=document.createElement("canvas"),Y=32;M.width=32,M.height=32;let de=M.getContext("2d");if(!de){o(null);return}de.drawImage(m,0,0,32,32);let Ye=de.getImageData(0,0,32,32).data,at=0,wt=0,lt=0.5,Ht=-1,Ot=0,Dt=0,Bt=0,Et=0;for(let gt=0;gt<Ye.length;gt+=4){let Ft=Ye[gt],Wt=Ye[gt+1],Yt=Ye[gt+2];Ot+=Ft,Dt+=Wt,Bt+=Yt,Et++;let ht=Ft/255,dt=Wt/255,vt=Yt/255,rt=Math.max(ht,dt,vt),bt=Math.min(ht,dt,vt),Pt=(rt+bt)/2,Ct=0,Nt=0;if(rt!==bt){let xt=rt-bt;if(Nt=Pt>0.5?xt/(2-rt-bt):xt/(rt+bt),rt===ht)Ct=((dt-vt)/xt+(dt<vt?6:0))/6;else if(rt===dt)Ct=((vt-ht)/xt+2)/6;else Ct=((ht-dt)/xt+4)/6}let jt=Nt*(1-Math.abs(Pt-0.5)*1.6);if(jt>Ht)Ht=jt,at=Ct,wt=Nt,lt=Pt}let qt=Math.round(Ot/Et),Vt=Math.round(Dt/Et),$t=Math.round(Bt/Et),Cn=0.299*qt+0.587*Vt+0.114*$t;o({dominant:{r:qt,g:Vt,b:$t},dominantHsl:{h:Math.round(at*360),s:Math.round(wt*100),l:Math.round(lt*100)},isLight:Cn>152})}catch{o(null)}},m.onerror=()=>o(null),m.src=i})}let Ce=e.ui.mount("settings_extensions"),Le=Xt(A,()=>window.location.origin,async(i)=>{if(i){if(!(await e.permissions.getGranted()).includes("interceptor"))try{if(!(await e.permissions.request(["interceptor"],{reason:"Spotify Controls needs the Interceptor permission to attach the current track's preview audio to eligible multimodal model requests."})).includes("interceptor"))return!1}catch{return!1}}return A({type:"set_prompt_audio_preview",enabled:i}),i});Ce.appendChild(Le.root),r.push(()=>Le.destroy());let le=null,pe=null,xe=null;function ze(){let{min:i,max:o}=N(H);if(le)le.textContent=H==="modern"?"Collapsed Modern Player Size (px)":"Custom Widget Size (px)";if(pe)pe.textContent=H==="modern"?`Controls the compact size of the modern player before it expands (${i}–${o}px).`:`Controls the floating widget size (${i}–${o}px).`;if(xe)xe.min=String(i),xe.max=String(o),xe.placeholder=H==="modern"?"e.g. 128":"e.g. 56",xe.value=W==="custom"?String(P):""}let ue=Le.root.querySelector(".spotify-settings-card-body");if(ue){let i=document.createElement("div");i.style.cssText="height:1px;background:var(--lumiverse-border);margin:4px 0",ue.appendChild(i);let o=document.createElement("label");o.className="spotify-settings-label",le=document.createElement("span"),o.appendChild(le),pe=document.createElement("div"),pe.style.cssText="font-size:0.8em;opacity:0.6;margin-top:2px";let m=document.createElement("div");m.className="spotify-settings-row";let M=document.createElement("input");M.className="spotify-input",M.type="number",M.step="1",M.style.width="80px",xe=M;let Y=document.createElement("button");Y.type="button",Y.className="spotify-btn spotify-btn-primary",Y.textContent="Apply",Y.style.fontSize="0.85em",Y.style.padding="4px 12px";let de=()=>{let Ye=M.valueAsNumber;if(!Number.isFinite(Ye))return;W="custom",Te(q(Math.round(Ye),H))};Y.addEventListener("click",de),M.addEventListener("keydown",(Ye)=>{if(Ye.key!=="Enter")return;Ye.preventDefault(),de()}),m.appendChild(M),m.appendChild(Y),o.appendChild(m),o.appendChild(pe),ue.appendChild(o)}ze();let Me=null;function Xe(){if(Me)Me.checked=g}function Ve(){Ee.setBlurEnabled(g),te.setLyricsBlur(g),Xe()}if(ue){let i=document.createElement("div");i.style.cssText="height:1px;background:var(--lumiverse-border);margin:4px 0";let o=document.createElement("label");o.className="spotify-settings-check";let m=document.createElement("input");m.type="checkbox",m.checked=g,Me=m;let M=document.createElement("span");M.textContent="Lyrics blur",o.append(m,M);let Y=document.createElement("div");Y.style.cssText="font-size:0.8em;opacity:0.65;margin-top:4px",Y.textContent="Depth-blurs receding lyric lines and fades new lines in through a blur. Turn off for crisp text.";let de=document.createElement("div");de.append(o,Y),m.addEventListener("change",()=>{g=m.checked,Ve(),I()}),ue.append(i,de)}let fe=e.ui.registerDrawerTab({id:"spotify",title:"Spotify Controls",shortName:"Spotify",description:"Control Spotify playback, search for music, and view lyrics",keywords:["music","player","now playing","song","track","album","lyrics"],headerTitle:"Spotify",iconSvg:ii});r.push(()=>fe.destroy());let we=document.createElement("div");we.className="spotify-panel",fe.root.classList.add("spotify-tab-root"),fe.root.appendChild(we);function ke(){let i=fe.root.getBoundingClientRect().top,o=fe.root.parentElement?.getBoundingClientRect().bottom??window.innerHeight,m=window.visualViewport?.height??window.innerHeight,M=Math.min(o,m);fe.root.style.setProperty("--spotify-tab-height",`${Math.max(240,M-i-2)}px`)}ke();let et=new ResizeObserver(ke);et.observe(fe.root),window.addEventListener("resize",ke),r.push(()=>{et.disconnect(),window.removeEventListener("resize",ke)});let He=Kt((i)=>{A({type:"seek",positionMs:i})}),Oe=Zt(A),Ke=Qt(A),Ee=dn((i)=>{A({type:"seek",positionMs:i})});we.appendChild(He.root),we.appendChild(Oe.root),we.appendChild(Ke.root),we.appendChild(Ee.root),r.push(()=>He.destroy(),()=>Oe.destroy(),()=>Ke.destroy(),()=>Ee.destroy());let $e=null,K=e.ui.createFloatWidget({width:P,height:P,tooltip:"Spotify",chromeless:!0});r.push(()=>K.destroy());let X=document.createElement("div");X.className="spotify-float-widget";function Fe(){X.classList.remove("spotify-float-widget-mounted"),requestAnimationFrame(()=>{requestAnimationFrame(()=>{X.classList.add("spotify-float-widget-mounted")})})}let Pe=document.createElement("div");Pe.className="spotify-float-widget-legacy";let Ne=document.createElement("div");Ne.className="spotify-float-widget-icon",Ne.innerHTML=oi;let De=Ge("spotify-float-widget-art");De.el.style.display="none",Pe.appendChild(Ne),Pe.appendChild(De.el),X.appendChild(Pe);let oe=!1,Ie=12,Be=420,Ae=null,te=an(A,()=>fe.activate(),()=>it(!1));X.appendChild(te.root),K.root.appendChild(X),Fe(),Ve();function Ze(){return un({desktopPopout:t,hasPlayback:Boolean(l),viewportHeight:window.innerHeight,viewportWidth:window.innerWidth})}function tt(i=oe){if(H==="modern")return i?Ze():{width:P,height:P};return{width:P,height:P}}function it(i){let o=oe;oe=i&&H==="modern",T.hide(),Ue(tt(oe)),te.setExpanded(oe),_e({delaySizeRequest:o&&!oe}),requestAnimationFrame(()=>Ue(tt()))}function We(i,o=!1){if(Ae)clearTimeout(Ae),Ae=null;let m=()=>{Ae=null,K.setSize(i.width,i.height)};if(o)Ae=setTimeout(m,Be);else m()}function _e({delaySizeRequest:i=!1}={}){let o=H==="modern"&&oe?"pan-y":"none",m=tt();if(K.root.style.touchAction=o,K.root.style.transition="width 420ms cubic-bezier(0.22, 1, 0.36, 1), height 420ms cubic-bezier(0.22, 1, 0.36, 1)",X.style.transition="width 420ms cubic-bezier(0.22, 1, 0.36, 1), height 420ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 420ms cubic-bezier(0.22, 1, 0.36, 1)",X.style.touchAction=o,te.setCollapsedSize(P),H==="modern"){X.classList.add("spotify-float-widget-modern-mode"),Pe.style.display="none",te.root.style.display="block",K.root.style.width=`${m.width}px`,K.root.style.height=`${m.height}px`,X.style.width=`${m.width}px`,X.style.height=`${m.height}px`,X.style.borderRadius=oe?"30px":`${Math.max(18,Math.round(P*0.28))}px`,We(m,i);return}X.classList.remove("spotify-float-widget-modern-mode"),Pe.style.display="flex",te.root.style.display="none";let M=V==="circle"?"50%":"22%";K.root.style.width=`${P}px`,K.root.style.height=`${P}px`,X.style.width=`${P}px`,X.style.height=`${P}px`,X.style.borderRadius=M;let Y=Math.round(P*0.5),de=Ne.querySelector("svg");if(de)de.style.width=`${Y}px`,de.style.height=`${Y}px`;We(m)}if(_e(),r.push(()=>{if(Ae)clearTimeout(Ae)}),K.onDragEnd((i)=>ge(i)),z!==void 0&&_!==void 0)K.moveTo(z,_);function Ue(i=tt()){let o=K.getPosition(),m=window.innerWidth-i.width-Ie,M=window.innerHeight-i.height-Ie,Y=Math.max(Ie,Math.min(o.x,m)),de=Math.max(Ie,Math.min(o.y,M));if(Y!==o.x||de!==o.y)K.moveTo(Y,de)}function f(){if(H==="modern"&&oe){_e(),requestAnimationFrame(()=>Ue(tt()));return}Ue()}window.addEventListener("resize",f),r.push(()=>window.removeEventListener("resize",f));let T=rn(A,()=>fe.activate(),()=>{let i=K.root.getBoundingClientRect();return{x:i.left,y:i.top,w:i.width,h:i.height}});T.setStyle("default"),r.push(()=>T.destroy()),r.push(()=>te.destroy());function ae(){if(K.root.style.display=a?"":"none",!a)T.hide(),oe=!1,te.setExpanded(!1)}ae(),Oe.onVolumeChange((i)=>T.setVolume(i)),T.onVolumeChange((i)=>Oe.setVolume(i));let ne=!1,s={x:0,y:0},C=5;X.addEventListener("pointerdown",(i)=>{if(ne=!1,s={x:i.clientX,y:i.clientY},T.isOpen()){let o=null,m=()=>{if(ne&&o===null)o=requestAnimationFrame(()=>{T.reposition(),o=null})},M=()=>{if(document.removeEventListener("pointermove",m),o!==null)cancelAnimationFrame(o)};document.addEventListener("pointermove",m),document.addEventListener("pointerup",M,{once:!0})}}),X.addEventListener("pointermove",(i)=>{if(!ne){let o=Math.abs(i.clientX-s.x),m=Math.abs(i.clientY-s.y);if(o>C||m>C)ne=!0}}),X.addEventListener("pointerup",()=>{requestAnimationFrame(()=>Ue())}),X.addEventListener("click",(i)=>{if(ne){i.stopPropagation(),ne=!1;return}if(i.stopPropagation(),H==="modern"){if(!oe)it(!0);return}T.toggle()});let R=0;async function re(i,o){let m=[{key:"small",label:"Small",active:W==="small"},{key:"medium",label:"Medium",active:W==="medium"},{key:"large",label:"Large",active:W==="large"},{key:"custom",label:"Custom…",active:W==="custom"}];if(H!=="modern")m.push({key:"div",label:"",type:"divider"},{key:"circle",label:"Circle",active:V==="circle"},{key:"squircle",label:"Squircle",active:V==="squircle"});m.push({key:H==="modern"?"div":"div2",label:"",type:"divider"},{key:"mini-default",label:"Default Mini Player",active:H==="default"},{key:"mini-modern",label:"Modern Lyrics Mini Player",active:H==="modern"}),R+=1,T.setUiSuspended(!0),te.setAutoScrollSuspended(!0),Ee.setAutoScrollSuspended(!0);let M;try{({selectedKey:M}=await e.ui.showContextMenu({position:{x:i,y:o},items:m}))}finally{if(R=Math.max(0,R-1),R===0)T.setUiSuspended(!1),te.setAutoScrollSuspended(!1),Ee.setAutoScrollSuspended(!1)}if(!M)return;if(M==="small"||M==="medium"||M==="large")W=M,Te(b(H)[M]);else if(M==="custom")e.events.emit("open-settings",{view:"extensions"});else if(M==="circle"||M==="squircle")V=M,I(),_e();else if(M==="mini-default"||M==="mini-modern"){H=M==="mini-modern"?"modern":"default";let Y=b(H);if(W!=="custom")P=Y[W];else P=q(P,H);if(H!=="modern")oe=!1,te.setExpanded(!1);T.hide(),I(),ze(),_e(),Ue()}}let be=null,Qe=!1,nt={x:0,y:0};X.addEventListener("touchstart",(i)=>{Qe=!1;let o=i.touches[0];nt={x:o.clientX,y:o.clientY},be=setTimeout(()=>{Qe=!0,navigator.vibrate?.(50),re(o.clientX,o.clientY)},500)}),X.addEventListener("touchmove",(i)=>{if(!be)return;let o=i.touches[0];if(Math.abs(o.clientX-nt.x)>10||Math.abs(o.clientY-nt.y)>10)clearTimeout(be),be=null}),X.addEventListener("touchend",(i)=>{if(be)clearTimeout(be),be=null;if(Qe){Qe=!1;return}if(H==="modern"&&oe){ne=!1;return}if(!ne){if(i.cancelable)i.preventDefault();if(H==="modern"){if(!oe)it(!0)}else T.toggle()}ne=!1});function Te(i){T.hide(),oe=!1,te.setExpanded(!1);let o=K.getPosition();j=o,K.destroy(),P=q(i,H),ze(),I(),K=e.ui.createFloatWidget({width:P,height:P,tooltip:"Spotify",chromeless:!0}),_e(),K.root.appendChild(X),Fe(),ae(),K.moveTo(o.x,o.y),K.onDragEnd((m)=>ge(m)),Ue()}X.addEventListener("contextmenu",(i)=>{i.preventDefault(),i.stopPropagation(),re(i.clientX,i.clientY)});function Se(i){let o=je(i?.albumArtUrl??null,i?.trackUri);if(o)Ne.style.display="none",De.el.style.display="",De.setUrl(o);else Ne.style.display="",De.el.style.display="none",De.setUrl(null);te.update(i,a)}let Je=e.messages.registerTagInterceptor({tagName:"spotify-search"},(i)=>{let o=i.attrs.query;if(!o)return;A({type:"search",query:o})});r.push(Je);let qe=pn(e,A);r.push(()=>qe.destroy());function st(i){if(i)A({type:"get_chat_songs",chatId:i})}st(e.getActiveChat().chatId);let Mt=e.events.on("CHAT_SWITCHED",(i)=>{let o=i?.chatId??null;qe.reset(),st(o)});r.push(Mt);let gn=e.events.on("CHARACTER_MESSAGE_RENDERED",(i)=>{let o=i?.messageId;if(o)qe.decorate(o)});r.push(gn);let hn=e.events.on("MESSAGE_SWIPED",(i)=>{let o=i,m=o?.message?.id;if(m)qe.setActiveSwipe(m,o.message?.swipe_id??0)});r.push(hn);let vn=e.events.on("MESSAGE_DELETED",(i)=>{let o=i?.messageId;if(o)qe.removeMessage(o)});r.push(vn);let ot=null;function bn(i){if(ot)clearTimeout(ot),ot=null;if(!i||!i.isPlaying||i.durationMs<=0)return;let o=i.durationMs-i.progressMs;if(o<=0)return;ot=setTimeout(()=>{ot=null,A({type:"get_state"})},o+500)}r.push(()=>{if(ot)clearTimeout(ot)});let xn=e.onBackendMessage((i)=>{let o=i;switch(o.type){case"state":{let m=!!l;if(l=J(o.playbackState),a=o.connected,ae(),He.update(l,a),Oe.update(l,a),T.update(l,a),Ee.updatePlayback(l),Se(l),H==="modern"&&oe&&m!==!!l)_e(),requestAnimationFrame(()=>Ue());bn(l);let M=je(l?.albumArtUrl??null,l?.trackUri),Y=l?.albumArtKey||M;if(M!==v)if(v=M,M){Q();let at=Y&&o.albumPalette?.artworkKey===Y?o.albumPalette.colors:D.get(Y||"");if(Y&&at)ce(Y,at),A({type:"album_colors",colors:at,artworkKey:Y});else{let wt=++S;me(M).then((lt)=>{if(wt!==S||M!==v)return;if(lt){if(Y)ce(Y,lt);A({type:"album_colors",colors:lt,artworkKey:Y})}else if(!a)ee()})}}else if(a)Re();else ee();let de=l?.trackUri||null;if(de&&de!==$e)$e=de,Ee.setLoading(!0),te.setLyricsLoading(!0),A({type:"get_lyrics"});else if(!de&&$e)$e=null,Ee.clear(),te.updateLyrics(null,null,null,!1);break}case"config":u={clientId:o.clientId,hasSecret:o.hasSecret,hasLastfmKey:o.hasLastfmKey,callbackUrl:o.callbackUrl,promptAudioPreviewEnabled:o.promptAudioPreviewEnabled},Le.update(o.connected,o.clientId,o.hasSecret,o.hasLastfmKey,o.callbackUrl,o.promptAudioPreviewEnabled),a=o.connected,ae();break;case"search_results":Ke.setResults(o.results);break;case"devices":T.setDevices(o.devices);break;case"widget_prefs":{let m=ie(o.prefs);if(!m)break;let M=m.size!==P,Y=M||m.shape!==V||m.sizeMode!==W||m.miniPlayerStyle!==H||m.lyricsBlur!==g;if(V=m.shape,W=m.sizeMode,H=m.miniPlayerStyle,g=m.lyricsBlur!==!1,Ve(),ze(),H!=="modern")oe=!1,te.setExpanded(!1);if(Y)localStorage.setItem(U,JSON.stringify(m));if(M)requestAnimationFrame(()=>Te(m.size));else _e();if(typeof m.x==="number"&&typeof m.y==="number"){let de=K.getPosition();if(z===void 0&&_===void 0&&(de.x!==m.x||de.y!==m.y))K.moveTo(m.x,m.y),Ue()}break}case"auth_url":{let m=window.open(o.url,"spotify-auth","width=500,height=700,menubar=no,toolbar=no");if(!m||m.closed)window.location.href=o.url;break}case"connected":D.clear(),a=!0,ae(),A({type:"get_config"}),A({type:"get_state"});break;case"disconnected":D.clear(),d=null,p=null,y=null,a=!1,ae(),l=null,v=null,ee(),Le.update(!1,u.clientId,u.hasSecret,u.hasLastfmKey,u.callbackUrl,u.promptAudioPreviewEnabled),He.update(null,!1),Oe.update(null,!1),T.update(null,!1),te.update(null,!1),te.updateLyrics(null,null,null,!1),oe=!1,te.setExpanded(!1),Ee.clear(),Se(null);break;case"lyrics":if(o.trackUri&&o.trackUri!==$e)break;Ee.update(o.trackUri,o.plainLyrics,o.syncedLyrics,o.instrumental),Ee.updatePlayback(l),te.updateLyrics(o.trackUri,o.plainLyrics,o.syncedLyrics,o.instrumental);break;case"chat_songs":qe.setChatSongs(o.chatId,o.entries);break;case"message_song":qe.setMessageSong(o.chatId,o.messageId,o.swipeId,o.snapshot);break;case"error":console.warn("[Spotify Controls]",o.message);break}});r.push(xn);let Rt=(i)=>{if(i.detail?.extensionId!==e.manifest.identifier)return;A({type:"get_config"}),A({type:"get_state"})};window.addEventListener("spindle:desktop-widget-returned",Rt),r.push(()=>window.removeEventListener("spindle:desktop-widget-returned",Rt));let wn=e.events.on("SPINDLE_PERMISSION_CHANGED",(i)=>{let o=i;if(o.extensionId!==e.manifest.identifier)return;if(o.permission!=="cors_proxy")return;if(o.granted)A({type:"get_config"}),A({type:"get_state"});else l=null,a=!1,D.clear(),ae(),ee(),He.update(null,!1),Oe.update(null,!1),T.update(null,!1),te.update(null,!1),oe=!1,te.setExpanded(!1),Se(null)});r.push(wn),e.permissions.getGranted().then((i)=>{let o=[];if(!i.includes("cors_proxy"))o.push("cors_proxy");if(!i.includes("generation"))o.push("generation");if(o.length===0)return;let m=o.includes("cors_proxy")?"Spotify Controls needs the CORS Proxy permission to communicate with the Spotify and Last.fm APIs. The Generation permission additionally lets it remember which song was playing when each reply was generated.":"Let Spotify Controls remember which song was playing when each reply was generated? This needs the Generation permission so it can capture the track the moment a reply begins.";e.ui.showConfirm({title:o.includes("cors_proxy")?"Permission Required":"Enable Song Memory?",message:m,variant:"info",confirmLabel:"Grant Permission",cancelLabel:"Not Now"}).then(({confirmed:M})=>{if(M)e.permissions.request(o)})}),A({type:"get_config"}),A({type:"get_state"}),A({type:"get_widget_prefs"});let En=setTimeout(()=>{A({type:"get_config"}),A({type:"get_state"})},2000);return r.push(()=>clearTimeout(En)),n.release(),()=>{n.dispose();for(let i of r)try{i()}catch{}}}function fi(e,n={}){let r={...n},t={componentId:`desktop-widget-detached-${crypto.randomUUID()}`,element:e instanceof HTMLElement?e:document.createElement("div"),update(c){r={...r,...c}},destroy(){},getValue(){if("checked"in r)return r.checked;return r.value},focus(){},blur(){}};return new Proxy(t,{get(c,l,a){if(l==="then")return;if(Reflect.has(c,l))return Reflect.get(c,l,a);return()=>{return}}})}function yn(e){let n=new Set,r=!1,t=()=>{let u=document.createElement("div");return n.add(u),u},c=(u)=>u instanceof Element&&[...n].some((d)=>d===u||d.contains(u)),l=new Proxy(e.components,{get(u,d,p){let y=Reflect.get(u,d,p);if(typeof y!=="function"||!String(d).startsWith("mount"))return y;return(h,L)=>{if(!r||c(h))return fi(h,L);return Reflect.apply(y,u,[h,L])}}}),a=new Proxy(e.ui,{get(u,d,p){if(d==="mount")return()=>t();if(d==="createFloatWidget"){let y=Reflect.get(u,d,p);return(...h)=>(r=!0,Reflect.apply(y,u,h))}if(d==="registerDrawerTab")return(y)=>({root:t(),tabId:y.id||"desktop-widget-detached",setTitle(){},setShortName(){},setBadge(){},activate(){},destroy(){},onActivate(){return()=>{}}});return Reflect.get(u,d,p)}});return new Proxy(e,{get(u,d,p){if(d==="components")return l;if(d==="ui")return a;return Reflect.get(u,d,p)}})}function io(e,n){return fn(yn(e))}export{io as setupWidget};
