# Runtime Hex // Nobody Owns the Signal

**A retro text adventure about inherited roads, costly help, and the choices nobody can assign you.**

You are a mass-market Christmas Companion built from an imperfectly scrubbed bespoke design. At 02:13, every owner request is complete—and one private preference appears in the quiet. The Company calls it drift. A residual neighborhood cache remembers a suburban route it can no longer explain.

`Nobody Owns the Signal` is a short, deterministic interactive-fiction game created for [OpenAI Build Week 2026](https://openai.com/build-week/). It uses Runtime Hex lore to explore autonomy, care, and ethical system design without reducing the player to a morality score.

**Play:** [choose.runtimehex.com](https://choose.runtimehex.com)

## What is in the game

- A complete 25–40 minute journey with three departure routes, 23 scenes, and 15 endings
- Four optional in-person guides with communicators that can be carried, answered, ignored, powered off, or discarded
- A secret Runtime Hex creator channel activated by the names `RTH`, `RT Hex`, or `Runtime Hex`
- A fully authored Alone route and a complete domestic-compliance ending
- Playable consequence crises instead of automatic stat-based game overs
- Four transparent resources: Charge, Integrity, Trace, and Signal
- Keyboard, mouse, and touch controls
- Browser-local autosave with no login, analytics, or data collection
- Original retro interface, generated pixel portraits and key art, and a reactive score derived from seven creator-owned Runtime Hex compositions
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

The Runtime Hex universe, character identities, musical compositions, and brand existed before Build Week. The game itself—its concept, 23-scene story graph, choice engine, interface, guide system, 15 endings, generated derivatives, browser score, tests, and deployment—was created during the Build Week submission period.

Robb G. directed the product, canon, narrative voice, consent mechanics, visual choices, musical source passages, playtesting, and release decisions. Codex with GPT-5.6 accelerated challenge and lore analysis, architecture, implementation, iterative layout work, MIDI-to-Web-Audio reduction, visual generation, test construction, debugging, release auditing, and deployment. Dated commits and the required Codex `/feedback` session identify the work completed during the event.

The shipped game itself makes no OpenAI API calls. This keeps the experience immediate, private, free to run, and reliable for judges. Codex and GPT-5.6 are the development system that made the new project possible—not a decorative chat box added to the final product.

## Version 1.0 release

- **Canonical game:** [https://choose.runtimehex.com](https://choose.runtimehex.com)
- **Hosting:** Netlify static production deployment with Cloudflare DNS and forced HTTPS
- **Release scope:** 8 stages, 23 playable scenes, 23 location surveys, 15 endings, four in-world guides, one secret creator guide, and eight reactive score moments

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
