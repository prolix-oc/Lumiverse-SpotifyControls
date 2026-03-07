import type { SearchResult } from "../types";

const ICON_PLAY_SMALL = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
const ICON_QUEUE = `<svg viewBox="0 0 24 24"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>`;

export interface SearchUI {
  root: HTMLElement;
  setResults(results: SearchResult[]): void;
  destroy(): void;
}

export function createSearchUI(
  sendToBackend: (msg: unknown) => void
): SearchUI {
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

  let debounce: ReturnType<typeof setTimeout> | null = null;

  input.addEventListener("input", () => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      const query = input.value.trim();
      if (query.length >= 2) {
        sendToBackend({ type: "search", query });
      } else {
        resultsList.innerHTML = "";
      }
    }, 400);
  });

  function setResults(results: SearchResult[]) {
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
      if (debounce) clearTimeout(debounce);
      root.remove();
    },
  };
}
