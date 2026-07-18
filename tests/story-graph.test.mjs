import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/game/story.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const story = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);

test("every authored route is complete and references a valid destination", () => {
  const nodes = story.STORY_NODES;
  assert.ok(Object.keys(nodes).length >= 10);
  assert.equal(story.ROUTE_LABELS.length, 6);

  for (const [id, node] of Object.entries(nodes)) {
    assert.equal(node.id, id);
    assert.ok(node.choices.length >= 2 && node.choices.length <= 3, `${id} has an invalid choice count`);
    for (const choice of node.choices) {
      assert.ok(choice.next || choice.finalIntent || choice.routeNext, `${id}/${choice.id} has no destination`);
      if (choice.next) assert.ok(nodes[choice.next], `${id}/${choice.id} points to missing node ${choice.next}`);
    }
  }
});

test("the game ships the promised distinct endings", () => {
  const endings = Object.values(story.ENDINGS);
  assert.equal(endings.length, 9);
  assert.equal(new Set(endings.map((ending) => ending.id)).size, endings.length);
  assert.ok(endings.every((ending) => ending.text.length >= 2 && ending.verdict.length > 10));
});
