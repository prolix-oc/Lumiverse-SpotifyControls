export interface SettingsUI {
  root: HTMLElement;
  update(connected: boolean, clientId: string, hasSecret?: boolean, hasLastfmKey?: boolean, callbackPath?: string): void;
  setConnecting(): void;
  destroy(): void;
}

export function createSettingsUI(
  sendToBackend: (msg: unknown) => void,
  getServerBaseUrl: () => string
): SettingsUI {
  // Outer card wrapper (matches SimTracker settings pattern)
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

  // Client ID
  const idLabel = document.createElement("label");
  idLabel.className = "spotify-settings-label";
  idLabel.textContent = "Client ID";

  const idInput = document.createElement("input");
  idInput.className = "spotify-input";
  idInput.type = "text";
  idInput.placeholder = "Spotify Client ID";
  idLabel.appendChild(idInput);

  // Client Secret
  const secretLabel = document.createElement("label");
  secretLabel.className = "spotify-settings-label";
  secretLabel.textContent = "Client Secret (optional)";

  const secretInput = document.createElement("input");
  secretInput.className = "spotify-input";
  secretInput.type = "password";
  secretInput.placeholder = "Optional for PKCE apps";
  secretLabel.appendChild(secretInput);

  // Last.fm API Key
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
    if (!apiKey) return;
    sendToBackend({ type: "save_lastfm_key", apiKey });
  });
  lastfmRow.appendChild(lastfmBtn);

  // Callback URL (copyable)
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
    if (!callbackInput.value) return;
    navigator.clipboard.writeText(callbackInput.value).then(() => {
      const prev = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      setTimeout(() => { copyBtn.textContent = prev; }, 1500);
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
    if (!callbackUrl) return;
    sendToBackend({ type: "complete_auth_callback", callbackUrl });
  });

  forwardRow.appendChild(forwardInput);
  forwardRow.appendChild(forwardBtn);
  forwardLabel.appendChild(forwardRow);

  // Actions row
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

  function updateUI(isConnected: boolean, clientId: string, hasSecret?: boolean, hasLastfmKey?: boolean, callbackPath?: string) {
    connected = isConnected;
    if (clientId) {
      idInput.value = clientId;
    }

    // Assemble full callback URL from the window origin + spindle oauth path
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
        serverBaseUrl: getServerBaseUrl(),
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
    },
  };
}
