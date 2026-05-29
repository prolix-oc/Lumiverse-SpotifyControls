import type { SpindleFrontendContext } from "lumiverse-spindle-types";
import type { SongSnapshot, MessageSongEntry } from "../types";
import { createCrossfadeArt, getTrackScopedArtUrl } from "./crossfade-art";

// Which corner of the message bubble the badge sits in.
const BADGE_CORNER: "left" | "right" = "right";

const ICON_NOTE = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
const ICON_PLAY = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const ICON_SHARE = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>`;
const ICON_OPEN = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zM19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7z"/></svg>`;

export interface SongBadgeManager {
  /** Replace the cache for a chat with a full set of stored snapshots. */
  setChatSongs(chatId: string, entries: MessageSongEntry[]): void;
  /** Record (or update) a single captured snapshot pushed live from the backend. */
  setMessageSong(chatId: string, messageId: string, swipeId: number, snapshot: SongSnapshot): void;
  /** Inject the badge for one message if it has any snapshot and its bubble is mounted. */
  decorate(messageId: string): void;
  /** Decorate every currently-mounted message bubble. */
  decorateMounted(): void;
  /** Whether we already hold at least one snapshot for a message. */
  hasSnapshots(messageId: string): boolean;
  /** Track which swipe a message is showing so the popover/badge follow it. */
  setActiveSwipe(messageId: string, swipeId: number): void;
  /** Forget a deleted message. */
  removeMessage(messageId: string): void;
  /** Clear all state (e.g. on chat switch). */
  reset(): void;
  destroy(): void;
}

function formatCaptured(ms: number): string {
  try {
    const d = new Date(ms);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function createSongBadgeManager(
  ctx: SpindleFrontendContext,
  sendToBackend: (msg: unknown) => void,
): SongBadgeManager {
  // messageId -> swipeId -> snapshot
  const cache = new Map<string, Map<number, SongSnapshot>>();
  // messageId -> active swipe index
  const activeSwipe = new Map<string, number>();
  // messageId -> injected badge wrapper element
  const badges = new Map<string, Element>();

  let currentChatId: string | null = null;

  // ─── Popover (single shared element, built lazily on first open) ───────
  let pop: HTMLElement | null = null;
  let popArt: ReturnType<typeof createCrossfadeArt> | null = null;
  let popTrack: HTMLElement | null = null;
  let popArtist: HTMLElement | null = null;
  let popAlbum: HTMLElement | null = null;
  let popWhen: HTMLElement | null = null;
  let popPlayBtn: HTMLButtonElement | null = null;
  let popShareBtn: HTMLButtonElement | null = null;
  let popOpenLink: HTMLAnchorElement | null = null;
  let openForMessageId: string | null = null;
  let openAnchor: HTMLElement | null = null;
  let shareResetTimer: ReturnType<typeof setTimeout> | null = null;

  function snapshotFor(messageId: string): SongSnapshot | null {
    const entry = cache.get(messageId);
    if (!entry) return null;
    const sw = activeSwipe.get(messageId) ?? 0;
    return entry.get(sw) ?? null;
  }

  function hasAnySnapshot(messageId: string): boolean {
    const entry = cache.get(messageId);
    return !!entry && entry.size > 0;
  }

  // ─── Badge injection ───────────────────────────────────────────────────

  function decorate(messageId: string): void {
    if (!hasAnySnapshot(messageId)) return;

    let wrapper = badges.get(messageId);
    if (!wrapper || !wrapper.isConnected) {
      const bubble = ctx.dom.findMessageElement(messageId);
      if (!bubble) return; // not mounted right now — re-decorated on render event

      const injected = ctx.dom.inject(
        bubble,
        `<button type="button" class="spotify-song-badge" aria-label="Song that was playing" title="Song that was playing">${ICON_NOTE}</button>`,
        "beforeend",
      );
      injected.classList.add("spotify-song-badge-wrap");
      (injected as HTMLElement).dataset.corner = BADGE_CORNER;
      injected.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFor(messageId, injected as HTMLElement);
      });
      badges.set(messageId, injected);
      wrapper = injected;
    }

    refreshBadge(messageId);
  }

  function refreshBadge(messageId: string): void {
    const wrapper = badges.get(messageId) as HTMLElement | undefined;
    if (!wrapper) return;
    wrapper.style.display = snapshotFor(messageId) ? "" : "none";
  }

  function decorateMounted(): void {
    for (const { messageId } of ctx.dom.listMessageElements()) {
      if (hasAnySnapshot(messageId)) decorate(messageId);
    }
  }

  // ─── Popover construction + lifecycle ──────────────────────────────────

  function ensurePopover(): void {
    if (pop) return;

    pop = document.createElement("div");
    pop.className = "spotify-song-pop";

    const header = document.createElement("div");
    header.className = "spotify-song-pop-header";
    header.textContent = "Playing when generated";

    const body = document.createElement("div");
    body.className = "spotify-song-pop-body";

    popArt = createCrossfadeArt("spotify-song-pop-art");
    // Crossfade art hides itself until a URL loads; keep the slot visible so the
    // layout doesn't jump while art is loading.
    popArt.el.style.display = "";

    const info = document.createElement("div");
    info.className = "spotify-song-pop-info";

    popTrack = document.createElement("div");
    popTrack.className = "spotify-song-pop-track";
    popArtist = document.createElement("div");
    popArtist.className = "spotify-song-pop-artist";
    popAlbum = document.createElement("div");
    popAlbum.className = "spotify-song-pop-album";
    popWhen = document.createElement("div");
    popWhen.className = "spotify-song-pop-when";

    info.appendChild(popTrack);
    info.appendChild(popArtist);
    info.appendChild(popAlbum);
    info.appendChild(popWhen);

    body.appendChild(popArt.el);
    body.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "spotify-song-pop-actions";

    popPlayBtn = document.createElement("button");
    popPlayBtn.type = "button";
    popPlayBtn.className = "spotify-song-pop-btn spotify-song-pop-btn-primary";
    popPlayBtn.innerHTML = `${ICON_PLAY}<span>Play</span>`;
    popPlayBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const snap = openForMessageId ? snapshotFor(openForMessageId) : null;
      if (snap?.trackUri) sendToBackend({ type: "play", trackUri: snap.trackUri });
      closePopover();
    });

    popShareBtn = document.createElement("button");
    popShareBtn.type = "button";
    popShareBtn.className = "spotify-song-pop-btn";
    resetShareBtn();
    popShareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const snap = openForMessageId ? snapshotFor(openForMessageId) : null;
      if (snap) void shareSnapshot(snap);
    });

    popOpenLink = document.createElement("a");
    popOpenLink.className = "spotify-song-pop-btn spotify-song-pop-link";
    popOpenLink.target = "_blank";
    popOpenLink.rel = "noopener noreferrer";
    popOpenLink.innerHTML = `${ICON_OPEN}<span>Open</span>`;
    popOpenLink.addEventListener("click", (e) => e.stopPropagation());

    actions.appendChild(popPlayBtn);
    actions.appendChild(popShareBtn);
    actions.appendChild(popOpenLink);

    pop.appendChild(header);
    pop.appendChild(body);
    pop.appendChild(actions);

    // Don't let clicks inside the popover bubble out to the outside-click closer.
    pop.addEventListener("click", (e) => e.stopPropagation());

    document.body.appendChild(pop);
  }

  function resetShareBtn(): void {
    if (!popShareBtn) return;
    popShareBtn.innerHTML = `${ICON_SHARE}<span>Share</span>`;
  }

  async function shareSnapshot(snap: SongSnapshot): Promise<void> {
    const text = `${snap.trackName} — ${snap.artistName}`;
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: snap.trackName, text, url: snap.spotifyUrl });
        return;
      } catch {
        // user cancelled or unsupported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard?.writeText(snap.spotifyUrl);
      if (popShareBtn) {
        popShareBtn.innerHTML = `${ICON_SHARE}<span>Copied!</span>`;
        if (shareResetTimer) clearTimeout(shareResetTimer);
        shareResetTimer = setTimeout(resetShareBtn, 1400);
      }
    } catch {
      // clipboard blocked — nothing else we can do silently
    }
  }

  function renderPopover(snap: SongSnapshot | null): void {
    ensurePopover();
    resetShareBtn();
    if (!snap) {
      popArt?.setUrl(null);
      if (popTrack) popTrack.textContent = "No track playing";
      if (popArtist) popArtist.textContent = "";
      if (popAlbum) popAlbum.textContent = "Nothing was playing when this version was written.";
      if (popWhen) popWhen.textContent = "";
      if (popPlayBtn) popPlayBtn.style.display = "none";
      if (popShareBtn) popShareBtn.style.display = "none";
      if (popOpenLink) popOpenLink.style.display = "none";
      return;
    }
    popArt?.setUrl(getTrackScopedArtUrl(snap.albumArtUrl, snap.trackUri));
    if (popTrack) popTrack.textContent = snap.trackName;
    if (popArtist) popArtist.textContent = snap.artistName;
    if (popAlbum) popAlbum.textContent = snap.albumName;
    if (popWhen) popWhen.textContent = formatCaptured(snap.capturedAt);
    if (popPlayBtn) popPlayBtn.style.display = "";
    if (popShareBtn) popShareBtn.style.display = "";
    if (popOpenLink) {
      popOpenLink.style.display = "";
      popOpenLink.href = snap.spotifyUrl;
    }
  }

  function positionPopover(anchor: HTMLElement): void {
    if (!pop) return;
    const r = anchor.getBoundingClientRect();
    const pw = pop.offsetWidth || 280;
    const ph = pop.offsetHeight || 200;
    const pad = 8;

    let top = r.top - ph - 8; // prefer above the badge
    let originY = "bottom";
    if (top < pad) {
      top = r.bottom + 8; // not enough room above → drop below
      originY = "top";
    }

    let left = r.right - pw; // align popover's right edge with the badge
    const originX = BADGE_CORNER === "right" ? "right" : "left";
    if (BADGE_CORNER === "left") left = r.left;
    left = Math.max(pad, Math.min(left, window.innerWidth - pw - pad));
    top = Math.max(pad, Math.min(top, window.innerHeight - ph - pad));

    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    pop.style.transformOrigin = `${originY} ${originX}`;
  }

  function onOutsidePointer(e: Event): void {
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (pop && pop.contains(target)) return;
    // Ignore clicks on the open badge itself — its own handler toggles us shut,
    // so closing here too would let the badge handler immediately reopen us.
    if (openAnchor && openAnchor.contains(target)) return;
    closePopover();
  }
  function onScroll(): void {
    closePopover();
  }
  function onKey(e: KeyboardEvent): void {
    if (e.key === "Escape") closePopover();
  }

  function openPopover(messageId: string, anchor: HTMLElement): void {
    renderPopover(snapshotFor(messageId));
    openForMessageId = messageId;
    openAnchor = anchor;
    pop!.classList.add("open");
    positionPopover(anchor);
    // Defer listener registration so the click that opened us doesn't close us.
    setTimeout(() => {
      document.addEventListener("click", onOutsidePointer, true);
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onScroll, true);
      document.addEventListener("keydown", onKey, true);
    }, 0);
  }

  function closePopover(): void {
    if (!pop || !openForMessageId) return;
    pop.classList.remove("open");
    openForMessageId = null;
    openAnchor = null;
    document.removeEventListener("click", onOutsidePointer, true);
    window.removeEventListener("scroll", onScroll, true);
    window.removeEventListener("resize", onScroll, true);
    document.removeEventListener("keydown", onKey, true);
  }

  function toggleFor(messageId: string, anchor: HTMLElement): void {
    if (openForMessageId === messageId) {
      closePopover();
    } else {
      if (openForMessageId) closePopover();
      openPopover(messageId, anchor);
    }
  }

  // ─── Public API ────────────────────────────────────────────────────────

  function setChatSongs(chatId: string, entries: MessageSongEntry[]): void {
    if (chatId !== currentChatId) reset();
    currentChatId = chatId;

    // This is the authoritative full set for the chat — drop messages that no
    // longer carry a snapshot (e.g. after a swipe-delete realignment).
    const incoming = new Set(entries.map((e) => e.messageId));
    for (const messageId of [...cache.keys()]) {
      if (!incoming.has(messageId)) removeMessage(messageId);
    }

    for (const entry of entries) {
      const map = new Map<number, SongSnapshot>();
      for (const [k, snap] of Object.entries(entry.bySwipe)) {
        map.set(Number(k), snap);
      }
      cache.set(entry.messageId, map);
      activeSwipe.set(entry.messageId, entry.activeSwipe);
      decorate(entry.messageId);
    }
  }

  function setMessageSong(chatId: string, messageId: string, swipeId: number, snapshot: SongSnapshot): void {
    if (currentChatId && chatId !== currentChatId) return;
    currentChatId = chatId;
    const map = cache.get(messageId) ?? new Map<number, SongSnapshot>();
    map.set(swipeId, snapshot);
    cache.set(messageId, map);
    // A freshly captured snapshot belongs to the swipe currently being shown.
    activeSwipe.set(messageId, swipeId);
    decorate(messageId);
    if (openForMessageId === messageId) renderPopover(snapshotFor(messageId));
  }

  function setActiveSwipe(messageId: string, swipeId: number): void {
    activeSwipe.set(messageId, swipeId);
    refreshBadge(messageId);
    if (openForMessageId === messageId) {
      const snap = snapshotFor(messageId);
      if (snap) renderPopover(snap);
      else closePopover();
    }
  }

  function removeMessage(messageId: string): void {
    if (openForMessageId === messageId) closePopover();
    cache.delete(messageId);
    activeSwipe.delete(messageId);
    const wrapper = badges.get(messageId);
    if (wrapper) {
      try {
        ctx.dom.uninject(wrapper);
      } catch {
        // best-effort
      }
      badges.delete(messageId);
    }
  }

  function reset(): void {
    closePopover();
    for (const wrapper of badges.values()) {
      try {
        ctx.dom.uninject(wrapper);
      } catch {
        // best-effort
      }
    }
    badges.clear();
    cache.clear();
    activeSwipe.clear();
    currentChatId = null;
  }

  function destroy(): void {
    reset();
    if (shareResetTimer) clearTimeout(shareResetTimer);
    popArt?.destroy();
    pop?.remove();
    pop = null;
  }

  return {
    setChatSongs,
    setMessageSong,
    decorate,
    decorateMounted,
    hasSnapshots: hasAnySnapshot,
    setActiveSwipe,
    removeMessage,
    reset,
    destroy,
  };
}
