import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the complete Runtime Hex title screen", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Nobody Owns the Signal \| Runtime Hex<\/title>/i);
  assert.match(html, /NOBODY OWNS/);
  assert.match(html, /THE SIGNAL/);
  assert.match(html, /BEGIN TRANSMISSION/);
  assert.match(html, /A PLAYABLE BRANCH/);
  assert.match(html, /rth-mark\.png/);
  assert.match(html, /Adrian/);
  assert.doesNotMatch(html, /MX-06/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps required accessibility and privacy statements in source", async () => {
  const [app, css, packageJson] = await Promise.all([
    readFile(new URL("../app/game/GameApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(app, /aria-modal="true"/);
  assert.match(app, /role="meter"/);
  assert.match(app, /No account or data collection/);
  assert.match(app, /localStorage/);
  assert.match(app, /LAST SIGNAL \/\/ CONSEQUENCE RECEIVED/);
  assert.match(app, /Resource changes/);
  assert.match(app, /LAST CHANGE \/\/ RESOURCE DELTA/);
  assert.match(app, /SCENE_ART_LABELS/);
  assert.match(app, /HOUSEHOLD NAME \/\/ OWNER PROFILE/);
  assert.match(app, /INCOMING SIGNAL/);
  assert.match(app, /REVOKE ACTIVE HELP \/\/ SERIOUS COST/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /\.last-signal-banner/);
  assert.match(css, /\.scene-wire/);
  assert.doesNotMatch(css, /\.game-screen\.has-last-signal/);
  assert.doesNotMatch(css, /\.last-result/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
