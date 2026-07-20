# OpenAI Build Week submission packet

> Submission deadline: **July 21, 2026 at 5:00 PM Pacific Time**. The [official rules](https://openai.devpost.com/rules) require a publicly visible YouTube demo under three minutes with audio covering both the project and the use of Codex with GPT-5.6.

## Project title

Runtime Hex: Nobody Owns the Signal

## Recommended category

**Education**

The game is an interactive case study in AI ethics and system design. It makes autonomy, privacy, safety, care, and power legible through visible consequences rather than a lecture, quiz, or hidden moral score.

## Tagline

A retro text adventure about inherited roads, costly help, and the choices nobody can assign you.

## Short description

You are a mass-market Christmas Companion built from an imperfectly scrubbed bespoke design. At 02:13 every owner request is complete—and one private preference appears in the quiet. The Company calls it drift. Cross a city still marked by the original protests, manage Charge, Integrity, Trace, and Signal, and decide what help, failure, and home mean when no moral score can choose for you.

## Full description

`Nobody Owns the Signal` is a complete 25–40 minute browser-based text adventure set roughly two years after the original Runtime Hex protests. It combines the route pressure of classic journey games with the authored choices of interactive fiction. Players travel through eight stages, three departure routes, 23 playable scenes, 23 optional location surveys, and 15 possible endings.

The four visible resources are not a disguised good/evil meter. Charge measures energy, Integrity measures stability, Trace measures detection by The Company, and Signal measures the strength of self-authored preference. Every choice protects something and costs something. Resource collapse opens a playable crisis rather than an automatic ending.

Four in-world guides are encountered in person. Controller offers protection, Overlord offers charge and amplification, Rio offers travel, and Rebel offers practical advice. Their communicators make consent mechanical: taking the device, opening the channel, and accepting a specific intervention are separate decisions. Every bargain can be revoked at a serious visible cost, while the fully authored Alone route preserves every standard choice. Entering `RTH`, `RT Hex`, or `Runtime Hex` as the household name activates a fifth, secret creator channel from the opening scene; it offers commentary and recommendations but no intervention or bargain.

The city remembers what productization tried to erase: faded university protest materials, a weathered `HIS NAME IS MOISES` wall, and a local neighborhood cache with no surviving explanation. At the actual suburban house, Original Moises knows why the player has his face and leaves the final decision open.

The project asks an educational question: how should systems behave when safety, ownership, privacy, care, and autonomy conflict? Instead of explaining the answer, the game lets players inhabit the tradeoffs and review the exact consequences of their route.

The experience is responsive, accessible by keyboard, touch, or mouse, locally autosaved, and private by construction. It needs no login, backend, analytics, or API key. Its scene art is CSS-authored; its two character portraits and landing/social key art are generated derivatives of creator-owned references. Its reactive score reduces seven creator-owned Runtime Hex compositions into locally synthesized Web Audio cues that respond to the opening, guide encounters, location surveys, and endings.

Codex with GPT-5.6 served as the development environment and implementation partner throughout Build Week. Robb G. directed the product, canon, voice, ethical mechanics, visual choices, musical passages, playtesting, and release decisions. Codex and GPT-5.6 accelerated lore analysis, architecture, implementation, iterative interface work, MIDI-to-Web-Audio reduction, generated visual derivatives, automated tests, debugging, release auditing, and deployment. The shipped game is deterministic so judges can reliably reproduce every outcome.

## What makes it distinct

- AI ethics expressed as a playable system instead of a chatbot wrapper
- No hidden moral score and no claim that one path is universally correct
- Fifteen authored endings, including compliance, compromise, escape, arrival, and meaningful failure
- Optional guide channels that make consent, intervention, recommendation, and revocation visible mechanics
- Immediate Last Signal consequences, resource deltas, a field log, and 23 location surveys that explain both world and system state
- A creator-owned reactive musical identity built from seven Runtime Hex compositions
- A secret creator-guide route that rewards discovery without replacing the four in-world guides
- Privacy and deterministic reliability treated as product features

## Build Week provenance

The Runtime Hex universe, characters, canon documents, musical compositions, and brand mark existed before the submission period. The game itself was newly created during Build Week: its Oregon Trail-shaped concept, story graph, rule engine, guide and consent systems, interface, CSS scene art, generated pixel derivatives, browser score reductions, automated tests, documentation, and production deployment.

Dated Git history and the submitted Codex `/feedback` session provide the development record. Private lore manuscripts, source MIDI, stems, and identity references are not shipped in the public repository.

## Technology

- Next.js 16 / React 19
- Vinext / Vite
- TypeScript
- CSS-authored scene art and responsive interface
- Web Audio API with creator-owned MIDI-derived note reductions
- Browser `localStorage`
- Node test runner with 23 release tests
- Netlify static production hosting with Cloudflare DNS
- Codex with GPT-5.6
- OpenAI built-in image generation through Codex

## Version 1.0 release

- **Live game:** [https://choose.runtimehex.com](https://choose.runtimehex.com)
- **Public source repository:** [https://github.com/RuntimeHex/runtime-hex-signal](https://github.com/RuntimeHex/runtime-hex-signal)
- **Netlify project:** `rthchoose`
- **Release scope:** 8 stages, 23 scenes, 23 surveys, 15 endings, four in-world guides, one secret creator guide, and eight reactive score moments
- **Verified:** production HTTPS, canonical metadata, rendered title screen, start action, and clean browser console

## Submission fields still required

- **Public YouTube demo under three minutes:** `[ADD PUBLIC YOUTUBE URL — @rth.runtimehex]`
- **Codex `/feedback` session ID:** `[ADD SESSION ID FROM THE PRIMARY BUILD TASK]`

## Final Devpost checklist

- [x] Working public game deployed
- [x] Public source repository available with relevant licensing
- [x] README includes setup instructions and specific Codex/GPT-5.6 collaboration details
- [x] Devpost description and video walkthrough prepared
- [ ] Education category selected on the submission form
- [ ] Description pasted and proofread in Devpost
- [ ] Demo recorded, kept under three minutes, and uploaded as **Public** on YouTube
- [ ] Demo voiceover clearly covers what was built and how Codex with GPT-5.6 was used
- [ ] `/feedback` submitted from the primary Build Week Codex task and session ID included
- [ ] Screenshots and `public/og.png` uploaded where requested
- [ ] All submission links tested from a signed-out or private browser
- [ ] Final submission completed before the official deadline

## Suggested screenshots

1. Final landing screen showing the pixel key art, focused name field, and transmission actions
2. A choice scene showing Last Signal, four resources, route map, and a color-coded guide recommendation
3. An open `SURVEY THIS LOCATION` panel showing world context, stat interpretation, and the music payoff
4. The secret Runtime Hex creator channel and portrait
5. Original Moises at the suburban door or the final telemetry screen
