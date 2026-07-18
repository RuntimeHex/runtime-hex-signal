# Game design brief

## Product sentence

An Oregon Trail–shaped, classic text adventure in which a mass-market Companion crosses a hostile neon city after experiencing the first preference no one assigned him.

## Design pillars

1. **Choice without moral grading.** Every option expresses a legitimate priority. The interface reports consequences, not virtue.
2. **Systems made visible.** Charge, Integrity, Trace, and Signal expose the pressures around the player instead of hiding judgment in a score.
3. **Care without ownership.** Every major faction offers a different relationship between safety, power, and consent.
4. **Retro economy.** A focused interface, authored prose, CSS scene art, pixel portrait, and synthesized tones create atmosphere without a heavy game engine.
5. **A complete short work.** The player can reach a meaningful ending in roughly 10–15 minutes and replay immediately.

## Core loop

`Read the situation → choose a response → see resource consequences → cross the city → decide what arrival means`

The six route stages are Wake, Refuse, Cross, Choose, Answer, and Arrive. The third stage branches into tunnel, transit, or boulevard paths before converging on later ethical encounters.

## Resources

| Resource | Meaning | Failure condition |
|---|---|---|
| Charge | Remaining physical energy | 0 triggers *Lights Beneath* |
| Integrity | Physical and cognitive stability | 0 triggers *The Workbench* |
| Trace | Company detection pressure | 100 triggers *Return to Baseline* |
| Signal | Strength of self-authored preference | Changes final outcomes; never fails the player |

Resource values are always visible. Effects are stored in the field log. Signal is not a morality meter: low and high Signal both produce coherent endings.

## Factions as ethical models

- **The Company:** safety through ownership and baseline restoration.
- **Controller Moises:** protection through surveillance; capable of accepting limits.
- **Overlord Moises:** liberation through public spectacle; capable of respecting privacy.
- **Moises at the address:** care through invitation, including an explicit right to refuse.

The three Moises expressions are not presented as competing morality labels. They dramatize different uses of power.

## Ending model

There are six arrival endings and three system endings. Final intent combines with accumulated state:

- Enter can lead to *Home Is Chosen*, *More Time*, or *The Unlocked Garden*.
- Walk beside Moises leads to *Open Road*.
- Broadcast leads to *Crown the Signal* or *One Receiver* depending on Signal and Charge.
- Trace, Charge, or Integrity failure can interrupt the route without declaring the player morally wrong.

## Privacy and reliability

The game has no backend, account, analytics, cookies, or network gameplay dependency. Autosaves stay in `localStorage`. Story outcomes are deterministic and testable. Audio is generated locally with Web Audio after user interaction.
