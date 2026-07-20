# Asset provenance

## Shipped assets

| Asset | Origin | Notes |
|---|---|---|
| `public/brand/rth-mark.png` | Supplied by Robb G. / Runtime Hex | Canon brand mark; included by the rights holder |
| `public/game/moises-portrait.png` | Generated with OpenAI's built-in image generation through Codex | Derived from private creator-supplied Moises identity references; prompt below |
| `public/og.png` | Generated with OpenAI's built-in image generation through Codex | Social preview card; prompt recorded below after final generation |
| Scene imagery | Authored CSS | Original buildings, roadway, signal rings, scanlines, and lighting |
| Runtime Hex score | Creator-owned MIDI compositions reduced into authored note data and synthesized with Web Audio | No recordings, samples, streams, or third-party music files are shipped; see `MUSIC_CUE_LEDGER.md` |

## Private references not shipped

The Moises body sheet, face sheet, full-body image, portrait, album covers, EP covers, and song-cover references supplied by the creator were used only to establish identity, proportion, palette, and composition. They are excluded from the public project.

## Pixel portrait generation

Tool: OpenAI built-in image generation through Codex.

Prompt summary: Create an original late-1980s/early-1990s 16-bit pixel-art bust portrait of Moises using the supplied body, face-turnaround, and warm portrait references for identity and proportion. Preserve his Mexican identity, tan-olive skin, deep brown eyes, dark wavy curls with faded sides, dense full beard, broad jaw, powerful shoulders, relaxed brows, and restrained half-smile. Use black, charcoal, cyan, blue, and sparse neon green; place him against a black and charcoal retro control-room backdrop with sparse cyan circuitry. No logos or text.

The image was generated first against a chroma background, then edited once through the same tool to replace only the background with the final control-room environment.

## Social card generation

Tool: OpenAI built-in image generation through Codex.

The final asset was generated in one pass and visually inspected before inclusion.

```text
Use case: social-card
Asset type: bespoke Open Graph social preview for a released browser game
Primary request: Create one polished 1.91:1 widescreen social card for “Runtime Hex: Nobody Owns the Signal,” using Image 1 as the exact Runtime Hex brand-mark reference and Image 2 as the exact Moises pixel-art portrait reference.
Composition: landscape 1200x630 intent. Place the RTH mark small and crisp in the upper-left, preserving its cyan-blue-green geometry. Place the Moises pixel portrait on the right third from chest upward, preserving the exact dark curls, beard, tan-olive skin, powerful shoulders, direct warm expression, and handcrafted 16-bit pixel treatment. Leave strong negative space on the left-center for the title.
Text: render exactly these two lines, large and fully legible: “NOBODY OWNS” then “THE SIGNAL”. Render one small subtitle beneath: “A RUNTIME HEX TEXT ADVENTURE”. No other text.
Style/medium: premium late-1980s/early-1990s 16-bit cyberpunk game-box art, deliberate crisp pixels, black and charcoal CRT darkness, sparse cyan circuitry, a road perspective disappearing toward a small receiving light, subtle horizontal signal waveform, no photorealistic elements.
Color logic: electric cyan and bright blue for the world and title line one; neon green for “THE SIGNAL” and the receiving light; use no magenta. A single distant warning-red trace line may appear behind the road.
Lighting/mood: nocturnal, controlled, quietly defiant, inviting rather than hostile. High contrast and readable at thumbnail size.
Constraints: preserve the supplied RTH mark’s essential geometry and gradient; preserve the supplied portrait identity and pixel-art style; no crowns, weapons, Company logo, extra characters, signatures, watermarks, mockup frames, URLs, badges, or illegible microtext; keep all text well inside safe margins.
```
