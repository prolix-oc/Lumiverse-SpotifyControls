export interface LyricsUI {
  root: HTMLElement;
  update(trackUri: string | null, lyrics: string | null, instrumental: boolean): void;
  setLoading(loading: boolean): void;
  clear(): void;
  destroy(): void;
}

export function createLyricsUI(): LyricsUI {
  const root = document.createElement("div");
  root.className = "spotify-section spotify-lyrics-section";

  const title = document.createElement("h3");
  title.className = "spotify-section-title";
  title.textContent = "Lyrics";
  root.appendChild(title);

  const body = document.createElement("div");
  body.className = "spotify-lyrics-body";
  root.appendChild(body);

  let currentTrackUri: string | null = null;

  function clear() {
    body.innerHTML = "";
    body.className = "spotify-lyrics-body";
    currentTrackUri = null;
  }

  function setLoading(loading: boolean) {
    if (loading) {
      body.innerHTML = "";
      body.className = "spotify-lyrics-body";
      const el = document.createElement("div");
      el.className = "spotify-lyrics-status";
      el.textContent = "Loading lyrics…";
      body.appendChild(el);
    }
  }

  function update(trackUri: string | null, lyrics: string | null, instrumental: boolean) {
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
    },
  };
}
