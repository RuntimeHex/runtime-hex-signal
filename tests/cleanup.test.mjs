import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const app = await readFile(new URL("../app/game/GameApp.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const story = await readFile(new URL("../app/game/story.ts", import.meta.url), "utf8");
test("all new resource log entries use actual deltas", () => {
  assert.equal((app.match(/effects: appliedEffects\(game.stats, stats\)/g) || []).length, 3);
  assert.doesNotMatch(app, /effects: (choice|penalty)\.effects/);
});
test("Trace displays use the shared interpreter", () => {
  assert.match(app, /stat === "trace"\) return interpretTrace\(value\)/);
  assert.match(app, /interpretTrace\(game.stats.trace\).condition/);
});
test("restart confirmation precedes save mutation and About uses a native modal", () => {
  assert.match(app, /const restart = \(\) => \{\s*if \(!window.confirm\([\s\S]*?\)\) return;\s*stopScore/);
  assert.match(app, /<dialog ref=\{dialogRef\}/);
  assert.match(app, /dialog\?\.showModal\(\)/);
  assert.match(app, /opener\.isConnected\) opener\.focus\(\)/);
});
test("font aliases resolve on the body and punctuation is clean", () => {
  assert.match(css, /body \{\s*\/\*[\s\S]*?--font-ui: var\(--font-geist-mono, "Courier New"\)/);
  assert.doesNotMatch(story, /â€|�/);
  assert.match(story, /them—familiarity/);
  assert.match(story, /channel—a limitation/);
});
