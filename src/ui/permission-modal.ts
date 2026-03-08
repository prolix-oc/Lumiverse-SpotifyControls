export interface PermissionModalUI {
  root: HTMLElement;
  destroy(): void;
}

const SHIELD_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;

const SPINNER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2a10 10 0 0 1 10 10" stroke-dasharray="31.4" stroke-dashoffset="0"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></path></svg>`;

const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

export function createPermissionModal(
  onGrant: () => Promise<void>,
  onDismiss: () => void
): PermissionModalUI {
  const backdrop = document.createElement("div");
  backdrop.className = "spotify-perm-backdrop";

  const modal = document.createElement("div");
  modal.className = "spotify-perm-modal";

  // Icon
  const iconWrap = document.createElement("div");
  iconWrap.className = "spotify-perm-icon";
  iconWrap.innerHTML = SHIELD_SVG;

  // Title
  const title = document.createElement("h3");
  title.className = "spotify-perm-title";
  title.textContent = "Permission Required";

  // Description
  const desc = document.createElement("p");
  desc.className = "spotify-perm-desc";
  desc.textContent =
    "Spotify Controls needs the CORS Proxy permission to communicate with the Spotify API. " +
    "This allows the extension to securely make requests to Spotify and Last.fm on your behalf.";

  // Permission pill preview
  const pill = document.createElement("div");
  pill.className = "spotify-perm-pill";
  pill.textContent = "Cors Proxy";

  // Actions
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

  // Animate in
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
    if (e.target === backdrop) dismiss();
  });

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") dismiss();
  };
  document.addEventListener("keydown", handleEscape);

  grantBtn.addEventListener("click", async () => {
    // Transition to loading state
    grantBtn.disabled = true;
    cancelBtn.disabled = true;
    grantBtn.innerHTML = `<span class="spotify-perm-spinner">${SPINNER_SVG}</span>Applying...`;
    grantBtn.classList.add("loading");

    try {
      await onGrant();
      // Show success briefly before the extension restarts
      grantBtn.innerHTML = `<span class="spotify-perm-check">${CHECK_SVG}</span>Granted!`;
      grantBtn.classList.remove("loading");
      grantBtn.classList.add("success");
    } catch (err: any) {
      grantBtn.disabled = false;
      cancelBtn.disabled = false;
      grantBtn.classList.remove("loading");

      const isPrivilegeError =
        err?.message?.includes("403") || err?.message?.includes("admin");
      if (isPrivilegeError) {
        grantBtn.textContent = "Grant Permission";
        desc.textContent =
          "This permission requires administrator approval. " +
          "Please ask an admin to enable the CORS Proxy permission for Spotify Controls in the extension settings.";
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
    },
  };
}

export const PERMISSION_MODAL_CSS = `
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
