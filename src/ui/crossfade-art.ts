/**
 * Creates a crossfading album art container.
 * Two stacked <img> elements alternate — when the URL changes,
 * the new image loads underneath, then opacity is swapped.
 */
export interface CrossfadeArt {
  el: HTMLElement;
  setUrl(url: string | null): void;
  destroy(): void;
}

export function createCrossfadeArt(className: string): CrossfadeArt {
  const el = document.createElement("div");
  el.className = `${className} spotify-crossfade-art`;

  const imgA = document.createElement("img");
  const imgB = document.createElement("img");
  imgA.className = "spotify-crossfade-img";
  imgB.className = "spotify-crossfade-img";
  imgA.alt = "Album art";
  imgB.alt = "Album art";

  // A starts visible
  imgA.style.opacity = "1";
  imgB.style.opacity = "0";

  el.appendChild(imgA);
  el.appendChild(imgB);

  let currentUrl: string | null = null;
  let activeImg = imgA;
  let inactiveImg = imgB;
  let hasLoadedOnce = false;

  function setUrl(url: string | null) {
    if (url === currentUrl) return;
    currentUrl = url;

    if (!url) {
      el.style.display = "none";
      return;
    }

    // First load: set directly on the active (visible) layer so there's no
    // empty image showing alt text. Keep container hidden until loaded.
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

    // Subsequent loads: crossfade via the inactive layer
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
    },
  };
}
