import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const scoreData = await readFile(new URL("../app/game/score-data.ts", import.meta.url), "utf8");
const audio = await readFile(new URL("../app/game/audio.ts", import.meta.url), "utf8");
const app = await readFile(new URL("../app/game/GameApp.tsx", import.meta.url), "utf8");

test("the approved Runtime Hex cue ledger is encoded exactly", () => {
  const expected = [
    ["Ready by Christmas", "0:59", "opening"],
    ["Nobody Owns the Signal", "1:03", "ending"],
    ["Total Control", "1:29", "controller"],
    ["Welcome to Your Overlord", "1:00", "overlord"],
    ["Our Creed in Lights", "1:02", "rio"],
    ["Homesick for Nowhere", "1:09", "rebel"],
    ["Runtime Hex", "3:00", "runtime-hex"],
  ];

  for (const [title, timestamp, cueId] of expected) {
    assert.match(scoreData, new RegExp(`title: ${JSON.stringify(title).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    assert.match(scoreData, new RegExp(`sourceStart: ${JSON.stringify(timestamp).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    const cueKey = cueId === "runtime-hex" ? '"runtime-hex"' : cueId;
    assert.match(scoreData, new RegExp(`${cueKey}: \\{[\\s\\S]*?treatment: "Lead Memory"`));
  }

  assert.match(scoreData, /survey: \{[\s\S]*?treatment: "Factory Pulse"[\s\S]*?beats: 48/);
  assert.match(scoreData, /survey: \{[\s\S]*?volume: 0\.28/);
});

test("score playback reacts to the approved story moments", () => {
  for (const [nodeId, cueId] of [
    ["controller-meeting", "controller"],
    ["overlord-meeting", "overlord"],
    ["rio-meeting", "rio"],
    ["rebel-meeting", "rebel"],
  ]) {
    assert.match(audio, new RegExp(`${JSON.stringify(nodeId)}: ${JSON.stringify(cueId)}`));
  }

  assert.match(app, /playOpeningCue\(\)/);
  assert.match(app, /next\.guide === "runtime-hex"\) playRuntimeHexCue\(\)/);
  assert.match(audio, /playScoreCue\("runtime-hex"\)/);
  assert.match(app, /playEndingCue\(\)/);
  assert.match(app, /playGuideCueForNode\(nodeId\)/);
  assert.match(app, /if \(opening\) playSurveyCue\(\)/);
  assert.match(app, /if \(value\) stopScore\(0\.05\)/);
});

test("every musical cue fades in and out through the shared score bus", () => {
  assert.match(audio, /linearRampToValueAtTime\(cue\.volume, start \+ fadeIn\)/);
  assert.match(audio, /linearRampToValueAtTime\(0\.0001, start \+ duration\)/);
  assert.match(audio, /stopScore\(0\.08\)/);
});
