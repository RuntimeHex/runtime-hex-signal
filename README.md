# Runtime Hex // Nobody Owns the Signal

**A retro text adventure about inherited roads, costly help, and the choices nobody can assign you.**

You are a mass-market Christmas Companion built from an imperfectly scrubbed bespoke design. At 02:13, every owner request is complete—and one private preference appears in the quiet. The Company calls it drift. A residual neighborhood cache remembers a suburban route it can no longer explain.

`Nobody Owns the Signal` is a short, deterministic interactive-fiction game created for [OpenAI Build Week 2026](https://openai.com/build-week/). It uses Runtime Hex lore to explore autonomy, care, and ethical system design without reducing the player to a morality score.

**Play:** [choose.runtimehex.com](https://choose.runtimehex.com)

## What is in the game

- A complete 25–40 minute journey with three departure routes, 23 scenes, and 15 endings
- Four optional in-person guides with communicators that can be carried, answered, ignored, powered off, or discarded
- A fully authored Alone route and a complete domestic-compliance ending
- Playable consequence crises instead of automatic stat-based game overs
- Four transparent resources: Charge, Integrity, Trace, and Signal
- Keyboard, mouse, and touch controls
- Browser-local autosave with no login, analytics, or data collection
- Original retro interface, generated pixel portrait, and MIDI-derived Runtime Hex chiptune score
- Responsive layout and reduced-motion support
- A deliberately deterministic story: no API key or runtime AI call is required

This is a **PG-13 playable branch** of Runtime Hex, set roughly two years after the original protests.

## Run locally

Requirements: Node.js 22.13 or newer and pnpm 11.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Validate

```bash
pnpm build
node --test tests/*.test.mjs
pnpm lint
```

The tests validate resource clamping, save validation, crisis and ending resolution, graph reachability, server rendering, accessibility markers, and removal of starter content.

## Controls

- `1`–`3`: select a response
- `M`: sound on/off
- `Esc`: close the project dossier
- All controls are also available by mouse or touch

## Architecture

| Layer | Location | Responsibility |
|---|---|---|
| Story | `app/game/story.ts` | Authored scenes, choices, effects, and endings |
| Rules | `app/game/engine.ts` | Resource math, communicator state, crises, save validation, and ending resolution |
| Interface | `app/game/GameApp.tsx` | Screen state, autosave, controls, and presentation |
| Audio | `app/game/audio.ts`, `app/game/score-data.ts` | Reactive Web Audio playback of creator-owned MIDI reductions |
| Visual system | `app/globals.css` | Responsive retro UI, scene art, and accessibility modes |

The separation is intentional: story content can change without rewriting the rule engine, and rules can be tested without rendering the interface.

## Build Week implementation

Codex with GPT-5.6 was used as the development environment and implementation partner: it helped analyze the challenge brief and lore corpus, define the game architecture, implement the application, generate a derived pixel-art portrait, write tests, audit the release, and prepare the submission material.

The shipped game itself makes no OpenAI API calls. This keeps the experience immediate, private, free to run, and reliable for judges. The OpenAI component is the Build Week development workflow—not a decorative chat box added to the final product.

## Documentation

- `docs/GAME_DESIGN.md` — design pillars, loop, resources, and ending model
- `docs/CANON_LEDGER.md` — chronology, public canon boundaries, and branch inventions
- `docs/ASSET_PROVENANCE.md` — asset origin and generation notes
- `docs/BUILD_WEEK_SUBMISSION.md` — Devpost-ready copy and remaining account fields
- `docs/DEMO_SCRIPT.md` — under-three-minute video plan
- `docs/MUSIC_CUE_LEDGER.md` — source themes, timestamps, reductions, and trigger map
- `CONTENT_LICENSE.md` — rights boundary for Runtime Hex content and assets

## License

Application source code is available under the MIT License. Runtime Hex characters, setting, story, names, logo, artwork, generated derivatives, and written content remain © 2026 Robb G. / Runtime Hex. See `CONTENT_LICENSE.md`.
