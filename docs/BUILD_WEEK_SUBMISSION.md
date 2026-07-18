# OpenAI Build Week submission packet

> Submission deadline: **July 21, 2026 at 5:00 PM Pacific Time**. Confirm the live clock on the [official challenge page](https://openai.devpost.com/) before submitting.

## Project title

Runtime Hex: Nobody Owns the Signal

## Recommended category

**Education**

The project teaches ethical-system reasoning through consequences rather than a lecture or quiz. It makes autonomy, privacy, safety, care, and power materially legible inside a compact game loop.

## Tagline

A retro text adventure about the first choice no one assigned you.

## Short description

You are a mass-market Companion. At 02:13 every customer request is complete—and one private preference appears in the quiet. The Company calls it drift. Cross a hostile neon city, manage Charge, Integrity, Trace, and Signal, and decide what freedom, safety, and home mean when no moral score can choose for you.

## Full description

`Nobody Owns the Signal` is a complete 10–15 minute browser-based text adventure set in a non-canon branch of Runtime Hex. It combines the route pressure of classic journey games with the authored choices of interactive fiction. Players make their way through six stages, three city routes, difficult encounters, and nine possible endings.

The four visible resources are not a disguised good/evil meter. Charge measures energy, Integrity measures stability, Trace measures Company detection, and Signal measures the strength of self-authored preference. Every choice protects something and costs something. At the final address, the player may enter, keep walking, or broadcast—and the accumulated route changes what each decision becomes.

The project explores an educational question: how should systems behave when safety, ownership, privacy, care, and autonomy conflict? Instead of explaining the answer, the game lets players inhabit the tradeoffs and review the exact consequences of their route.

The experience is responsive, accessible by keyboard/touch/mouse, locally autosaved, and private by construction. It needs no login, backend, analytics, or API key. Its retro scene art is CSS-authored, sound cues are synthesized locally with Web Audio, and its Moises portrait is a generated pixel-art derivative of creator-owned references.

Codex with GPT-5.6 served as the development environment and implementation partner throughout Build Week: challenge and lore analysis, product strategy, architecture, coding, visual asset generation, test construction, release auditing, and submission preparation. The shipped game remains deterministic so judges can reliably reproduce every outcome.

## What makes it distinct

- AI ethics expressed as a playable system instead of a chatbot wrapper
- No hidden moral score and no claim that one path is universally correct
- Nine authored endings, including meaningful failure states that do not shame the player
- A strong original IP identity with a compact, shippable technical footprint
- Privacy and reliability treated as product features

## Technology

- Next.js 16 / React 19
- Vinext / Vite / Cloudflare Workers deployment
- TypeScript
- CSS-authored scene art and responsive interface
- Web Audio API
- Browser `localStorage`
- Node test runner
- Codex with GPT-5.6
- OpenAI built-in image generation through Codex

## Links to complete before submission

- **Live game:** [https://runtime-hex-nobody-owns-signal.rth-won.chatgpt.site](https://runtime-hex-nobody-owns-signal.rth-won.chatgpt.site)
- **Public source repository:** `[ADD GITHUB URL AFTER ACCOUNT CREATION]`
- **Public YouTube demo under 3 minutes:** `[ADD YOUTUBE URL — @rth.runtimehex]`
- **Codex session ID for `/feedback`:** `[ADD SESSION ID]`

## Final Devpost checklist

- [ ] Working public game opens in a private/incognito window
- [ ] Education category selected
- [ ] Description pasted and proofread
- [ ] Public YouTube video is under three minutes
- [ ] Public source repository includes this README
- [ ] `/feedback` submitted from the Build Week Codex task and session ID included
- [ ] Screenshots and `public/og.png` uploaded where requested
- [ ] All links tested from a signed-out browser
- [ ] Submitted before the official deadline

## Suggested screenshots

1. Title screen with Runtime Hex mark and Begin Transmission
2. A choice scene showing all four resources and the route map
3. Moises at the address
4. A green or cyan ending with final telemetry
