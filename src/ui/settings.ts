export interface SettingsUI {
  root: HTMLElement;
  update(connected: boolean, clientId: string, hasSecret?: boolean, hasLastfmKey?: boolean): void;
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
  secretLabel.textContent = "Client Secret";

  const secretInput = document.createElement("input");
  secretInput.className = "spotify-input";
  secretInput.type = "password";
  secretInput.placeholder = "Spotify Client Secret";
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

  // Actions row
  const btnRow = document.createElement("div");
  btnRow.className = "spotify-settings-row";

  const btn = document.createElement("button");
  btn.className = "spotify-btn spotify-btn-primary";
  btn.textContent = "Connect";

  btnRow.appendChild(btn);

  body.appendChild(idLabel);
  body.appendChild(secretLabel);
  body.appendChild(lastfmLabel);
  body.appendChild(lastfmRow);
  body.appendChild(btnRow);

  root.appendChild(header);
  root.appendChild(body);

  let connected = false;

  function updateUI(isConnected: boolean, clientId: string, hasSecret?: boolean, hasLastfmKey?: boolean) {
    connected = isConnected;
    if (clientId) {
      idInput.value = clientId;
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
