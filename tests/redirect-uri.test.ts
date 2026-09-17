import { describe, expect, test } from "bun:test";

// Mirrors getLoopbackRedirectUri in src/backend.ts, whose body must stay in
// lockstep: the spindle mock here supplies the same callback path the real
// API returns for the SpotifyControls extension.
const CALLBACK_PATH = "/api/spindle-oauth/lumiverse.spotifycontrols/callback";

function getLoopbackRedirectUri(serverBaseUrl: string): string {
  const url = new URL(serverBaseUrl);
  const isLoopback = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  if (url.protocol !== "https:" && !isLoopback) {
    url.hostname = "127.0.0.1";
  }
  return url.origin + CALLBACK_PATH;
}

describe("getLoopbackRedirectUri", () => {
  test("desktop custom https origin is used verbatim, not stranded on port 80", () => {
    const uri = getLoopbackRedirectUri("https://app.lumiverse.chat");
    expect(uri).toBe(`https://app.lumiverse.chat${CALLBACK_PATH}`);
  });

  test("cloud https origin with explicit port is used verbatim", () => {
    const uri = getLoopbackRedirectUri("https://lumiverse.example.com:8443");
    expect(uri).toBe(`https://lumiverse.example.com:8443${CALLBACK_PATH}`);
  });

  test("loopback http origins keep their explicit port", () => {
    expect(getLoopbackRedirectUri("http://localhost:7860")).toBe(`http://localhost:7860${CALLBACK_PATH}`);
    expect(getLoopbackRedirectUri("http://127.0.0.1:7860")).toBe(`http://127.0.0.1:7860${CALLBACK_PATH}`);
  });

  test("plain-http LAN origin is rewritten to loopback on the same port", () => {
    expect(getLoopbackRedirectUri("http://192.168.1.20:7860")).toBe(`http://127.0.0.1:7860${CALLBACK_PATH}`);
  });

  test("non-loopback http without port rewrites hostname, keeping default port", () => {
    expect(getLoopbackRedirectUri("http://lumiverse.local")).toBe(`http://127.0.0.1${CALLBACK_PATH}`);
  });
});
