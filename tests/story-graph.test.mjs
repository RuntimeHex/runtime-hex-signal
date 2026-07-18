import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/game/story.ts", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const story = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);

test("every authored route is complete and references a valid destination", () => {
  const nodes = story.STORY_NODES;
  assert.ok(Object.keys(nodes).length >= 20);
  assert.equal(story.ROUTE_LABELS.length, 8);

  for (const [id, node] of Object.entries(nodes)) {
    assert.equal(node.id, id);
    assert.ok(node.choices.length >= 2 && node.choices.length <= 3, `${id} has an invalid choice count`);
    for (const choice of node.choices) {
      assert.ok(choice.next || choice.finalIntent || choice.routeNext || choice.ending, `${id}/${choice.id} has no destination`);
      if (choice.next) assert.ok(nodes[choice.next], `${id}/${choice.id} points to missing node ${choice.next}`);
      for (const destination of Object.values(choice.routeNext ?? {})) assert.ok(nodes[destination], `${id}/${choice.id} points to missing route node ${destination}`);
      if (choice.ending) assert.ok(story.ENDINGS[choice.ending], `${id}/${choice.id} points to missing ending ${choice.ending}`);
    }
    for (const variant of Object.values(node.guidance ?? {})) {
      if (!variant.choices) continue;
      assert.ok(variant.choices.length >= 2 && variant.choices.length <= 3, `${id} guide variant has an invalid choice count`);
      for (const choice of variant.choices) {
        assert.ok(choice.next || choice.finalIntent || choice.routeNext || choice.ending, `${id}/${choice.id} has no destination`);
        if (choice.next) assert.ok(nodes[choice.next], `${id}/${choice.id} points to missing node ${choice.next}`);
        for (const destination of Object.values(choice.routeNext ?? {})) assert.ok(nodes[destination], `${id}/${choice.id} points to missing route node ${destination}`);
        if (choice.ending) assert.ok(story.ENDINGS[choice.ending], `${id}/${choice.id} points to missing ending ${choice.ending}`);
      }
    }
  }
});

test("every authored scene is reachable through a normal or crisis route", () => {
  const nodes = story.STORY_NODES;
  const reachable = new Set(["no-request", "trace-crisis", "charge-crisis", "integrity-crisis"]);
  const queue = [...reachable];

  while (queue.length) {
    const id = queue.shift();
    const node = nodes[id];
    const choices = [
      ...node.choices,
      ...Object.values(node.guidance ?? {}).flatMap((variant) => variant.choices ?? []),
    ];
    for (const choice of choices) {
      const destinations = [choice.next, ...Object.values(choice.routeNext ?? {})].filter(Boolean);
      for (const destination of destinations) {
        if (!reachable.has(destination)) {
          reachable.add(destination);
          queue.push(destination);
        }
      }
    }
  }

  assert.deepEqual([...Object.keys(nodes).filter((id) => !reachable.has(id))], []);
});

test("every scene type has a curated wireframe composition", () => {
  const scenes = new Set(Object.values(story.STORY_NODES).map((node) => node.scene));
  assert.ok(scenes.size >= 16);
  for (const scene of scenes) {
    assert.match(css, new RegExp(`\\.scene--${scene} \\.scene-wire`), `${scene} uses only the generic scene art`);
  }
});

test("the game ships the promised distinct endings", () => {
  const endings = Object.values(story.ENDINGS);
  assert.equal(endings.length, 15);
  assert.equal(new Set(endings.map((ending) => ending.id)).size, endings.length);
  assert.ok(endings.every((ending) => ending.text.length >= 2 && ending.verdict.length > 10));
});

test("guide consent stays layered and every shared scene has an Alone version", () => {
  const guideMeetings = {
    rebel: story.STORY_NODES["rebel-meeting"],
    controller: story.STORY_NODES["controller-meeting"],
    rio: story.STORY_NODES["rio-meeting"],
    overlord: story.STORY_NODES["overlord-meeting"],
  };

  for (const [guide, node] of Object.entries(guideMeetings)) {
    assert.ok(node.choices.some((choice) => choice.guide === guide && choice.communicator === "available"));
    assert.ok(node.choices.some((choice) => choice.guide === guide && choice.communicator === "carried"));
    assert.ok(node.choices.some((choice) => !choice.guide), `${guide} cannot be refused`);
  }

  for (const id of ["repair-shop", "graffiti", "minimart", "river-checkpoint", "neighborhood", "door-name", "door"]) {
    const node = story.STORY_NODES[id];
    assert.ok(node.choices.length >= 2, `${id} has no authored Alone route`);
    for (const guide of Object.keys(guideMeetings)) assert.ok(node.guidance?.[guide]?.line, `${id} lacks ${guide} dialogue`);
  }

  const controllerBlock = story.STORY_NODES.neighborhood.choices.find((choice) => choice.blockedWhen?.value === "controller-shield");
  assert.ok(controllerBlock?.blockedWhen.reason.includes("CONTROLLER SHIELD"));
});

test("every guide recommendation points to a choice the player can see", () => {
  for (const [nodeId, node] of Object.entries(story.STORY_NODES)) {
    for (const [guide, variant] of Object.entries(node.guidance ?? {})) {
      assert.ok(variant.preferredChoiceId, `${nodeId} has no preferred choice for ${guide}`);
      const visibleChoices = variant.choices ?? node.choices;
      assert.ok(
        visibleChoices.some((choice) => choice.id === variant.preferredChoiceId),
        `${nodeId} recommends missing choice ${variant.preferredChoiceId} for ${guide}`,
      );
    }
  }
});

test("public narrative preserves the canon language boundary", () => {
  assert.doesNotMatch(source, /\b(?:Robb|Viv)\b/);
  assert.doesNotMatch(source, /\bthe Company\b/);
  assert.match(source, /HIS NAME IS MOISES/);
  assert.match(source, /Two years of sun/);
  assert.match(source, /actual suburban house|ordinary suburban house/);
});
