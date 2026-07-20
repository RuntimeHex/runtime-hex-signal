import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/game/engine.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const engine = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);

test("creates a sanitized, independent initial game state", () => {
  const first = engine.createInitialState("  MX<script>-06  ");
  const second = engine.createInitialState("Another Unit");
  assert.equal(first.playerName, "MXscript-06");
  assert.equal(first.nodeId, "no-request");
  first.stats.charge = 0;
  assert.equal(second.stats.charge, 72);
});

test("assigns curated human names without falling back to a model number", () => {
  assert.equal(engine.randomPlayerName(() => 0), "Adrian");
  assert.equal(engine.randomPlayerName(() => 0.999999), "Victor");
  assert.equal(engine.createInitialState("   ").playerName, "Adrian");
  assert.equal(engine.PLAYER_NAME_POOL.includes("MX-06"), false);
});

test("secret Runtime Hex names open the creator guide channel from first signal", () => {
  for (const name of ["RTH", "Runtime Hex", "RT Hex", " runtime   hex "]) {
    assert.equal(engine.isRuntimeHexGuideName(name), true, `${name} did not activate the guide`);
    const state = engine.createInitialState(name);
    assert.equal(state.guide, "runtime-hex");
    assert.equal(state.communicator, "open");
    assert.equal(state.flags.runtimeHexGuide, "active");
  }

  assert.equal(engine.isRuntimeHexGuideName("Runtime"), false);
  assert.equal(engine.createInitialState("Mateo").guide, null);
});

test("applies and clamps all resources", () => {
  const result = engine.applyEffects(
    { charge: 5, integrity: 99, trace: 98, signal: 2 },
    { charge: -20, integrity: 20, trace: 20, signal: -10 },
  );
  assert.deepEqual(result, { charge: 0, integrity: 100, trace: 100, signal: 0 });
});

test("routes resource collapse into playable crises in explicit priority order", () => {
  assert.equal(engine.crisisNode({ charge: 0, integrity: 0, trace: 100, signal: 50 }), "trace-crisis");
  assert.equal(engine.crisisNode({ charge: 0, integrity: 80, trace: 10, signal: 50 }), "charge-crisis");
  assert.equal(engine.crisisNode({ charge: 40, integrity: 0, trace: 10, signal: 50 }), "integrity-crisis");
});

test("final choice and accumulated state both determine the ending", () => {
  const base = engine.createInitialState("MX-06");
  assert.equal(engine.resolveFinalEnding("road", base), "open-road");
  assert.equal(engine.resolveFinalEnding("broadcast", { ...base, stats: { charge: 50, integrity: 80, trace: 30, signal: 70 } }), "crowned-signal");
  assert.equal(engine.resolveFinalEnding("broadcast", base), "small-signal");
  assert.equal(engine.resolveFinalEnding("enter", { ...base, flags: { bargain: "controller-shield" } }), "unlocked-garden");
  assert.equal(engine.resolveFinalEnding("enter", { ...base, flags: { bargain: "overlord-charge" } }), "visible-house");
  assert.equal(engine.resolveFinalEnding("enter", { ...base, flags: { bargain: "rio-transit" } }), "after-the-applause");
});

test("rejects malformed browser saves", () => {
  assert.equal(engine.isSavedGame(null), false);
  assert.equal(engine.isSavedGame({ version: 1, stats: {} }), false);
  assert.equal(engine.isSavedGame(engine.createInitialState("MX-06")), true);
});
