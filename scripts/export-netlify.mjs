import { writeFile } from "node:fs/promises";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("netlify-export", `${Date.now()}`);

const { default: worker } = await import(workerUrl.href);
const response = await worker.fetch(
  new Request("https://choose.runtimehex.com/", {
    headers: { accept: "text/html" },
  }),
  {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  },
  {
    waitUntil() {},
    passThroughOnException() {},
  },
);

if (!response.ok) {
  throw new Error(`Static export failed with HTTP ${response.status}.`);
}

const html = await response.text();
if (!html.includes("BEGIN TRANSMISSION") || !html.includes("Nobody Owns the Signal")) {
  throw new Error("Static export did not contain the complete title screen.");
}

await writeFile(new URL("../dist/client/index.html", import.meta.url), html, "utf8");
