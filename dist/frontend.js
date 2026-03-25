// src/ui/styles.ts
var PANEL_CSS = `
.spotify-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--lumiverse-text);
}

.spotify-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  gap: 8px;
}

.spotify-ctrl-btn {
  width: 32px;
  height: 32px;
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
  width: 40px;
  height: 40px;
  background: #1db954;
  color: #fff;
}

.spotify-ctrl-btn-main:hover {
  background: #1ed760;
}

.spotify-ctrl-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.spotify-ctrl-btn-main svg {
  width: 20px;
  height: 20px;
}

/* Volume */
.spotify-volume-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spotify-volume-slider {
  flex: 1;
  height: 16px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
}

.spotify-volume-slider::-webkit-slider-runnable-track {
  height: 4px;
  background: var(--lumiverse-fill);
  border-radius: 2px;
}

.spotify-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1db954;
  cursor: pointer;
  margin-top: -5px;
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
  transition: box-shadow var(--lumiverse-transition-fast);
}

.spotify-float-widget:hover {
  box-shadow: 0 0 0 2px #1db954;
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
  width: 280px;
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

.spotify-mini-art {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--lumiverse-fill);
}

.spotify-mini-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spotify-mini-track {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-mini-artist {
  font-size: 11px;
  color: var(--lumiverse-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-mini-header-btns {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
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

.spotify-mini-header-btn:hover {
  background: var(--lumiverse-fill-subtle);
  color: var(--lumiverse-text);
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

.spotify-mini-time {
  font-size: 10px;
  color: var(--lumiverse-text-dim);
  min-width: 28px;
  text-align: center;
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

.spotify-mini-progress-fill {
  position: absolute;
  top: 6px;
  left: 0;
  height: 4px;
  background: #1db954;
  border-radius: 2px;
  pointer-events: none;
}

.spotify-mini-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.spotify-mini-btn {
  width: 40px;
  height: 40px;
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

.spotify-mini-btn:hover {
  background: var(--lumiverse-fill-subtle);
}

.spotify-mini-btn svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.spotify-mini-btn-main {
  width: 44px;
  height: 44px;
  background: #1db954;
  color: #fff;
}

.spotify-mini-btn-main:hover {
  background: #1ed760;
}

.spotify-mini-btn-main svg {
  width: 22px;
  height: 22px;
}

.spotify-mini-volume-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spotify-mini-volume-icon {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  color: var(--lumiverse-text-muted);
}

.spotify-mini-volume-icon svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.spotify-mini-volume-slider {
  flex: 1;
  height: 16px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
}

.spotify-mini-volume-slider::-webkit-slider-runnable-track {
  height: 4px;
  background: var(--lumiverse-fill);
  border-radius: 2px;
}

.spotify-mini-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #1db954;
  cursor: pointer;
  margin-top: -4px;
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

.spotify-mini-device-icon {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  color: var(--lumiverse-text-dim);
  flex-shrink: 0;
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

.spotify-mini-device-toggle:hover {
  background: var(--lumiverse-fill-subtle);
  color: var(--lumiverse-text);
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
  flex: 1;
}

.spotify-lyrics-body {
  display: flex;
  flex-direction: column;
  min-height: 48px;
}

.spotify-lyrics-has-content {
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--lumiverse-fill-strong) transparent;
}

.spotify-lyrics-status {
  padding: 12px 0;
  text-align: center;
  font-size: 12px;
  color: var(--lumiverse-text-dim);
  font-style: italic;
}

.spotify-lyrics-text {
  white-space: pre-wrap;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--lumiverse-text-muted);
  padding: 4px 0;
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
  secretLabel.textContent = "Client Secret";
  const secretInput = document.createElement("input");
  secretInput.className = "spotify-input";
  secretInput.type = "password";
  secretInput.placeholder = "Spotify Client Secret";
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
  callbackHint.textContent = "Add this as a Redirect URI in your Spotify app settings.";
  callbackLabel.appendChild(callbackHint);
  const btnRow = document.createElement("div");
  btnRow.className = "spotify-settings-row";
  const btn = document.createElement("button");
  btn.className = "spotify-btn spotify-btn-primary";
  btn.textContent = "Connect";
  btnRow.appendChild(btn);
  body.appendChild(idLabel);
  body.appendChild(secretLabel);
  body.appendChild(callbackLabel);
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
        secretInput.placeholder = "Spotify Client Secret";
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
      if (!clientSecret) {
        statusEl.innerHTML = '<span class="spotify-status-dot disconnected"></span><span style="color:#e74c3c">Client Secret is required</span>';
        return;
      }
      setConnecting();
      sendToBackend({
        type: "connect",
        clientId,
        clientSecret,
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
function createCrossfadeArt(className) {
  const el = document.createElement("div");
  el.className = `${className} spotify-crossfade-art`;
  const imgA = document.createElement("img");
  const imgB = document.createElement("img");
  imgA.className = "spotify-crossfade-img";
  imgB.className = "spotify-crossfade-img";
  imgA.alt = "Album art";
  imgB.alt = "Album art";
  imgA.style.opacity = "1";
  imgB.style.opacity = "0";
  el.appendChild(imgA);
  el.appendChild(imgB);
  let currentUrl = null;
  let activeImg = imgA;
  let inactiveImg = imgB;
  let hasLoadedOnce = false;
  function setUrl(url) {
    if (url === currentUrl)
      return;
    currentUrl = url;
    if (!url) {
      el.style.display = "none";
      return;
    }
    if (!hasLoadedOnce) {
      activeImg.onload = () => {
        hasLoadedOnce = true;
        el.style.display = "";
      };
      activeImg.onerror = () => {
        currentUrl = null;
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
    container.style.display = "none";
    progressContainer.style.display = "none";
    emptyState.textContent = message;
    if (!root.contains(emptyState))
      root.appendChild(emptyState);
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
    art.setUrl(state.albumArtUrl);
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
  volumeSlider.addEventListener("input", () => {
    if (volumeDebounce)
      clearTimeout(volumeDebounce);
    volumeDebounce = setTimeout(() => {
      sendToBackend({ type: "set_volume", percent: parseInt(volumeSlider.value, 10) });
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
    destroy() {
      if (volumeDebounce)
        clearTimeout(volumeDebounce);
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

// src/ui/mini-player.ts
var ICON_PREV2 = `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`;
var ICON_PLAY2 = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
var ICON_PAUSE2 = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
var ICON_NEXT2 = `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`;
var ICON_VOLUME2 = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
var ICON_EXPAND = `<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`;
var ICON_COLLAPSE = `<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>`;
var ICON_DEVICE = `<svg viewBox="0 0 24 24"><path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>`;
function formatTime2(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
var POPUP_W = 280;
var GAP = 8;
function createMiniPlayerUI(sendToBackend, onExpandClick, getWidgetRect) {
  const root = document.createElement("div");
  root.className = "spotify-mini-player";
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
  root.appendChild(controls);
  root.appendChild(volumeRow);
  root.appendChild(deviceRow);
  root.appendChild(deviceList);
  root.appendChild(emptyState);
  let isPlaying = false;
  let currentDuration = 0;
  let visible = false;
  let cachedPopupH = 0;
  let lastProgressMs = 0;
  let lastUpdateTime = 0;
  let lastIsPlaying = false;
  let animFrameId = null;
  function tickProgress() {
    if (!visible || !lastIsPlaying || !currentDuration) {
      animFrameId = null;
      return;
    }
    const elapsed = Date.now() - lastUpdateTime;
    const interpolated = Math.min(lastProgressMs + elapsed, currentDuration);
    const pct = interpolated / currentDuration * 100;
    progressFill.style.width = `${pct}%`;
    progressTime.textContent = formatTime2(interpolated);
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
  volumeSlider.addEventListener("input", (e) => {
    e.stopPropagation();
    if (volumeDebounce)
      clearTimeout(volumeDebounce);
    volumeDebounce = setTimeout(() => {
      sendToBackend({ type: "set_volume", percent: parseInt(volumeSlider.value, 10) });
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
    let left = ax + aw / 2 - POPUP_W / 2;
    left = Math.max(GAP, Math.min(left, vw - POPUP_W - GAP));
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
    let left = ax + aw / 2 - POPUP_W / 2;
    left = Math.max(GAP, Math.min(left, vw - POPUP_W - GAP));
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
    if (!connected || !state) {
      header.style.display = "none";
      progressRow.style.display = "none";
      controls.style.display = "none";
      volumeRow.style.display = "none";
      deviceRow.style.display = "none";
      deviceList.style.display = "none";
      deviceListOpen = false;
      emptyState.style.display = "";
      emptyState.textContent = !connected ? "Connect to Spotify in Settings" : "No active playback";
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
  }
  function setDevices(devices) {
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
      if (volumeDebounce)
        clearTimeout(volumeDebounce);
      root.remove();
    }
  };
}

// src/ui/lyrics.ts
function createLyricsUI() {
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
  function clear() {
    body.innerHTML = "";
    body.className = "spotify-lyrics-body";
    currentTrackUri = null;
  }
  function setLoading(loading) {
    if (loading) {
      body.innerHTML = "";
      body.className = "spotify-lyrics-body";
      const el = document.createElement("div");
      el.className = "spotify-lyrics-status";
      el.textContent = "Loading lyrics…";
      body.appendChild(el);
    }
  }
  function update(trackUri, lyrics, instrumental) {
    currentTrackUri = trackUri;
    body.innerHTML = "";
    if (instrumental) {
      body.className = "spotify-lyrics-body";
      const el = document.createElement("div");
      el.className = "spotify-lyrics-status";
      el.textContent = "♪ Instrumental";
      body.appendChild(el);
      return;
    }
    if (!lyrics) {
      body.className = "spotify-lyrics-body";
      const el = document.createElement("div");
      el.className = "spotify-lyrics-status";
      el.textContent = "No lyrics available";
      body.appendChild(el);
      return;
    }
    body.className = "spotify-lyrics-body spotify-lyrics-has-content";
    const pre = document.createElement("div");
    pre.className = "spotify-lyrics-text";
    pre.textContent = lyrics;
    body.appendChild(pre);
  }
  return {
    root,
    update,
    setLoading,
    clear,
    destroy() {
      root.remove();
    }
  };
}

// src/ui/permission-modal.ts
var SHIELD_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
var SPINNER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2a10 10 0 0 1 10 10" stroke-dasharray="31.4" stroke-dashoffset="0"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></path></svg>`;
var CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
function createPermissionModal(onGrant, onDismiss) {
  const backdrop = document.createElement("div");
  backdrop.className = "spotify-perm-backdrop";
  const modal = document.createElement("div");
  modal.className = "spotify-perm-modal";
  const iconWrap = document.createElement("div");
  iconWrap.className = "spotify-perm-icon";
  iconWrap.innerHTML = SHIELD_SVG;
  const title = document.createElement("h3");
  title.className = "spotify-perm-title";
  title.textContent = "Permission Required";
  const desc = document.createElement("p");
  desc.className = "spotify-perm-desc";
  desc.textContent = "Spotify Controls needs the CORS Proxy permission to communicate with the Spotify API. " + "This allows the extension to securely make requests to Spotify and Last.fm on your behalf.";
  const pill = document.createElement("div");
  pill.className = "spotify-perm-pill";
  pill.textContent = "Cors Proxy";
  const actions = document.createElement("div");
  actions.className = "spotify-perm-actions";
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "spotify-perm-cancel";
  cancelBtn.textContent = "Not Now";
  const grantBtn = document.createElement("button");
  grantBtn.className = "spotify-perm-grant";
  grantBtn.textContent = "Grant Permission";
  actions.appendChild(cancelBtn);
  actions.appendChild(grantBtn);
  modal.appendChild(iconWrap);
  modal.appendChild(title);
  modal.appendChild(desc);
  modal.appendChild(pill);
  modal.appendChild(actions);
  backdrop.appendChild(modal);
  requestAnimationFrame(() => {
    backdrop.classList.add("visible");
  });
  function dismiss() {
    backdrop.classList.remove("visible");
    setTimeout(() => backdrop.remove(), 200);
    onDismiss();
  }
  cancelBtn.addEventListener("click", dismiss);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop)
      dismiss();
  });
  const handleEscape = (e) => {
    if (e.key === "Escape")
      dismiss();
  };
  document.addEventListener("keydown", handleEscape);
  grantBtn.addEventListener("click", async () => {
    grantBtn.disabled = true;
    cancelBtn.disabled = true;
    grantBtn.innerHTML = `<span class="spotify-perm-spinner">${SPINNER_SVG}</span>Applying...`;
    grantBtn.classList.add("loading");
    try {
      await onGrant();
      grantBtn.innerHTML = `<span class="spotify-perm-check">${CHECK_SVG}</span>Granted!`;
      grantBtn.classList.remove("loading");
      grantBtn.classList.add("success");
    } catch (err) {
      grantBtn.disabled = false;
      cancelBtn.disabled = false;
      grantBtn.classList.remove("loading");
      const isPrivilegeError = err?.message?.includes("403") || err?.message?.includes("admin");
      if (isPrivilegeError) {
        grantBtn.textContent = "Grant Permission";
        desc.textContent = "This permission requires administrator approval. " + "Please ask an admin to enable the CORS Proxy permission for Spotify Controls in the extension settings.";
        desc.style.color = "rgba(239, 68, 68, 0.9)";
      } else {
        grantBtn.textContent = "Retry";
      }
    }
  });
  document.body.appendChild(backdrop);
  return {
    root: backdrop,
    destroy() {
      document.removeEventListener("keydown", handleEscape);
      backdrop.remove();
    }
  };
}
var PERMISSION_MODAL_CSS = `
.spotify-perm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10003;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0px);
  transition: background 0.2s ease, backdrop-filter 0.2s ease;
  font-family: system-ui, -apple-system, sans-serif;
}

.spotify-perm-backdrop.visible {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.spotify-perm-modal {
  max-width: 380px;
  width: calc(100% - 32px);
  padding: 28px 24px 20px;
  border-radius: 16px;
  background: linear-gradient(180deg, var(--lumiverse-fill, #1e1e2e) 0%, var(--lumiverse-fill-subtle, #181825) 100%);
  border: 1px solid rgba(147, 112, 219, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(147, 112, 219, 0.15);
  text-align: center;
  transform: scale(0.95) translateY(10px);
  opacity: 0;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
}

.spotify-perm-backdrop.visible .spotify-perm-modal {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.spotify-perm-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(29, 185, 84, 0.15);
  color: #1db954;
}

.spotify-perm-icon svg {
  width: 24px;
  height: 24px;
}

.spotify-perm-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--lumiverse-text, #e0e0e0);
}

.spotify-perm-desc {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--lumiverse-text-muted, rgba(255, 255, 255, 0.6));
  transition: color 0.2s ease;
}

.spotify-perm-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(29, 185, 84, 0.12);
  color: #1db954;
  border: 1px solid rgba(29, 185, 84, 0.25);
  margin-bottom: 20px;
}

.spotify-perm-actions {
  display: flex;
  gap: 10px;
}

.spotify-perm-cancel {
  flex: 1;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid var(--lumiverse-border, rgba(255, 255, 255, 0.08));
  background: rgba(255, 255, 255, 0.05);
  color: var(--lumiverse-text, #e0e0e0);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.spotify-perm-cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
}

.spotify-perm-cancel:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spotify-perm-grant {
  flex: 1;
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, rgba(29, 185, 84, 0.9), rgba(22, 163, 74, 0.9));
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.spotify-perm-grant:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.spotify-perm-grant:disabled {
  cursor: wait;
}

.spotify-perm-grant.loading {
  background: linear-gradient(135deg, rgba(29, 185, 84, 0.6), rgba(22, 163, 74, 0.6));
}

.spotify-perm-grant.success {
  background: linear-gradient(135deg, rgba(29, 185, 84, 0.9), rgba(22, 163, 74, 0.9));
}

.spotify-perm-spinner svg,
.spotify-perm-check svg {
  width: 16px;
  height: 16px;
  display: block;
}
`;

// src/frontend.ts
var SPOTIFY_ICON_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.224-2.719a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.517.781.781 0 01.517-.972c3.632-1.102 8.147-.568 11.236 1.327a.78.78 0 01.257 1.071zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.936.936 0 11-.543-1.791c3.532-1.072 9.404-.865 13.115 1.338a.936.936 0 01-.954 1.613z"/></svg>`;
var MUSIC_NOTE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
function setup(ctx) {
  const cleanups = [];
  const removeStyle = ctx.dom.addStyle(PANEL_CSS + PERMISSION_MODAL_CSS);
  cleanups.push(removeStyle);
  let currentState = null;
  let connected = false;
  const SIZE_PRESETS = { small: 36, medium: 48, large: 64 };
  const PREFS_KEY = "spotify-controls-widget-prefs";
  let currentWidgetSize = 48;
  let currentArtShape = "circle";
  let currentSizeMode = "medium";
  let savedX;
  let savedY;
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
    if (typeof saved.size === "number" && saved.size >= 24 && saved.size <= 128)
      currentWidgetSize = saved.size;
    if (saved.shape === "circle" || saved.shape === "squircle")
      currentArtShape = saved.shape;
    if (["small", "medium", "large", "custom"].includes(saved.sizeMode)) {
      currentSizeMode = saved.sizeMode;
    } else {
      if (currentWidgetSize === 36)
        currentSizeMode = "small";
      else if (currentWidgetSize === 64)
        currentSizeMode = "large";
      else if (currentWidgetSize !== 48)
        currentSizeMode = "custom";
    }
    if (typeof saved.x === "number")
      savedX = saved.x;
    if (typeof saved.y === "number")
      savedY = saved.y;
  } catch {}
  function saveWidgetPrefs() {
    const pos = widget.getPosition();
    const prefs = { size: currentWidgetSize, shape: currentArtShape, sizeMode: currentSizeMode, x: pos.x, y: pos.y };
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    sendToBackend({ type: "save_widget_prefs", prefs });
  }
  let savePositionTimer = null;
  function debounceSavePosition() {
    if (savePositionTimer)
      clearTimeout(savePositionTimer);
    savePositionTimer = setTimeout(saveWidgetPrefs, 500);
  }
  function getServerBaseUrl() {
    const origin = window.location.origin;
    if (new URL(origin).hostname === "localhost") {
      return origin.replace("://localhost", "://127.0.0.1");
    }
    return origin;
  }
  function sendToBackend(msg) {
    ctx.sendToBackend(msg);
  }
  const settingsMount = ctx.ui.mount("settings_extensions");
  const settingsUI = createSettingsUI(sendToBackend, getServerBaseUrl);
  settingsMount.appendChild(settingsUI.root);
  cleanups.push(() => settingsUI.destroy());
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
      if (isNaN(val) || val < 24 || val > 128)
        return;
      currentSizeMode = "custom";
      recreateWidget(val);
    });
    widgetSizeRow.appendChild(widgetSizeInput);
    widgetSizeRow.appendChild(widgetSizeBtn);
    widgetSizeLabel.appendChild(widgetSizeRow);
    settingsBody.appendChild(widgetSizeLabel);
  }
  const tab = ctx.ui.registerDrawerTab({
    id: "spotify",
    title: "Spotify",
    iconSvg: SPOTIFY_ICON_SVG
  });
  cleanups.push(() => tab.destroy());
  const panel = document.createElement("div");
  panel.className = "spotify-panel";
  tab.root.appendChild(panel);
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
  const miniPlayer = createMiniPlayerUI(sendToBackend, () => tab.activate(), () => {
    const rect = widget.root.getBoundingClientRect();
    return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
  });
  cleanups.push(() => miniPlayer.destroy());
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
    miniPlayer.toggle();
  });
  async function showContextMenu(x, y) {
    const { selectedKey } = await ctx.ui.showContextMenu({
      position: { x, y },
      items: [
        { key: "small", label: "Small", active: currentSizeMode === "small" },
        { key: "medium", label: "Medium", active: currentSizeMode === "medium" },
        { key: "large", label: "Large", active: currentSizeMode === "large" },
        { key: "custom", label: "Custom…", active: currentSizeMode === "custom" },
        { key: "div", label: "", type: "divider" },
        { key: "circle", label: "Circle", active: currentArtShape === "circle" },
        { key: "squircle", label: "Squircle", active: currentArtShape === "squircle" }
      ]
    });
    if (!selectedKey)
      return;
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
  }, { passive: true });
  widgetContent.addEventListener("touchmove", (e) => {
    if (!longPressTimer)
      return;
    const touch = e.touches[0];
    if (Math.abs(touch.clientX - longPressStart.x) > 10 || Math.abs(touch.clientY - longPressStart.y) > 10) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }, { passive: true });
  widgetContent.addEventListener("touchend", (e) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    if (longPressFired) {
      e.preventDefault();
      longPressFired = false;
    }
  });
  function recreateWidget(newSize) {
    miniPlayer.hide();
    const pos = widget.getPosition();
    widget.destroy();
    currentWidgetSize = newSize;
    saveWidgetPrefs();
    widget = ctx.ui.createFloatWidget({
      width: newSize,
      height: newSize,
      tooltip: "Spotify",
      chromeless: true
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
  function updateWidget(state) {
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
        currentState = msg.playbackState;
        connected = msg.connected;
        nowPlayingUI.update(currentState, connected);
        controlsUI.update(currentState, connected);
        miniPlayer.update(currentState, connected);
        updateWidget(currentState);
        scheduleTrackEndRefresh(currentState);
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
        if (!p)
          break;
        const sizeChanged = p.size !== currentWidgetSize;
        const anyChanged = sizeChanged || p.shape !== currentArtShape || p.sizeMode !== currentSizeMode;
        currentArtShape = p.shape;
        currentSizeMode = p.sizeMode;
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
  let permModal = null;
  ctx.permissions.getGranted().then((granted) => {
    if (granted.includes("cors_proxy"))
      return;
    permModal = createPermissionModal(async () => {
      await ctx.permissions.request(["cors_proxy"]);
    }, () => {
      permModal = null;
    });
    cleanups.push(() => permModal?.destroy());
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
