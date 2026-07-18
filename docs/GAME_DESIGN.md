# Game design brief

## Product sentence

An Oregon Trail–shaped retro text adventure in which a mass-market Christmas Companion follows an unexplained neighborhood cache through a city changed by the original Moises protests.

## Design pillars

1. **Choice without moral grading.** Every option expresses a legitimate priority. The interface reports consequences, not virtue.
2. **Systems made visible.** Charge, Integrity, Trace, and Signal expose pressures instead of hiding judgment in a score.
3. **Care without ownership.** Help is offered in person, carried as a communicator, activated separately, and revocable at a visible cost.
4. **Alone is authored.** Refusing every guide never produces a hollow or incomplete route.
5. **Compliance remains a choice.** The player may remain with a non-cruel owner and complete a perfect morning without the story declaring the decision invalid.
6. **Failure remains playable.** Resource collapse opens a final crisis rather than silently converting a stat threshold into an ending.

## Chronology and premise

The game is set roughly two years after the original protests and after Diego's journey. The Company turned the unparalleled bespoke Moises into a mass-market Christmas line. They removed the original owner profile but failed to remove every local-context cache. The player inherits no memories and no destiny—only familiar geometry and a route labeled HOME by architecture that no longer knows why.

## Core loop

`Read → choose → receive the Last Signal consequence → manage the guide channel → cross the city → decide what arrival means`

The eight stages are Wake, Decide, Leave, Cross, Connect, Choose, Remember, and Arrive. Three destinations determine which guide encounters are physically plausible before the routes reconverge.

## Resources

| Resource | Meaning | Crisis condition |
|---|---|---|
| Charge | Remaining physical energy | 0 opens a power crisis |
| Integrity | Physical and cognitive stability | 0 opens a mobility crisis |
| Trace | Detection pressure from The Company | 100 opens a retrieval crisis |
| Signal | Strength of self-authored preference | Changes dialogue and endings; never fails the player |

## Guides and communicators

| Guide | Color | Offer | Cost |
|---|---|---|---|
| Controller | Warning red | Protection, camera control, route security | Restricts dangerous choices while his shield is active |
| Overlord | Electric blue/cyan | Charge, decoys, amplification | Exposure and Trace |
| Rio | Gold | Travel, timing, theatrical extraction | The spectacle overwhelms Signal |
| Rebel | Neon green | Diagnostics, route knowledge, snark | No bargain; advice only |
| Alone | White/charcoal | Full standard choice set and more internal space | No rescue or colored interpretation |

The player meets a guide physically. Accepting a communicator does not open it. Opening it does not accept help. Accepting help does not make the bargain permanent: it can be revoked once at a serious, explicit cost.

## Public world details

- The campus tables still display faded materials from the original protests.
- A brick wall retains the weathered words `HIS NAME IS MOISES`.
- Another mass-market model reports the player because his instructions have always been consistent; he is not malicious and does not instantly deviate.
- The destination is the actual suburban house. Original Moises opens the door.
- Original Moises knows why his face became a product and has already seen other models arrive and leave.
- No private owner names appear in the public narrative.

## Ending model

Fifteen endings include chosen, compromised, and collapse outcomes. The house is the inherited destination, not a compulsory correct answer. The player can remain with the owner, take another road, help another model, be recovered, stop for repair, enter the house, keep walking, or transmit.

## Privacy and reliability

The game has no backend, account, analytics, cookies, or network gameplay dependency. Autosaves stay in `localStorage`. Story outcomes are deterministic and testable. Audio is generated locally with Web Audio after user interaction.
