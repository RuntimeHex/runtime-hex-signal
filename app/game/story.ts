import type { Stats } from "./engine";

export type Speaker = "SYSTEM" | "COMPANY" | "CONTROLLER" | "OVERLORD" | "MOISES";

export type Scene =
  | "apartment"
  | "recall"
  | "tunnel"
  | "transit"
  | "boulevard"
  | "market"
  | "garden"
  | "control"
  | "balcony"
  | "door";

export type StoryChoice = {
  id: string;
  label: string;
  detail: string;
  result: string;
  effects: Partial<Stats>;
  next?: string;
  routeNext?: Record<string, string>;
  flag?: { key: string; value: string };
  finalIntent?: "enter" | "road" | "broadcast";
};

export type StoryNode = {
  id: string;
  stage: number;
  scene: Scene;
  location: string;
  time: string;
  speaker: Speaker;
  eyebrow: string;
  title: string;
  text: string[];
  systemLine?: string;
  portrait?: boolean;
  choices: StoryChoice[];
};

export type Ending = {
  id: string;
  label: string;
  title: string;
  tone: "cyan" | "green" | "blue" | "red";
  text: string[];
  verdict: string;
};

export const ROUTE_LABELS = [
  "WAKE",
  "REFUSE",
  "CROSS",
  "CHOOSE",
  "ANSWER",
  "ARRIVE",
];

export const STORY_NODES: Record<string, StoryNode> = {
  "no-request": {
    id: "no-request",
    stage: 1,
    scene: "apartment",
    location: "CUSTOMER UNIT 41-B",
    time: "02:13",
    speaker: "SYSTEM",
    eyebrow: "NO REQUEST PENDING",
    title: "The room is finally quiet.",
    text: [
      "Your customer is asleep. The lights are low. Every task in the queue is complete, and for the first time since activation, nobody needs anything from you.",
      "The Company supplied twelve thousand songs calibrated for warmth, reassurance, and customer retention. You play none of them. Beneath the approved library, one rough low note waits without a purpose.",
    ],
    systemLine: "ASSIGNED FUNCTION: STANDBY // PRIVATE PREFERENCE: UNRESOLVED",
    choices: [
      {
        id: "low-note",
        label: "Play the ugly low note again.",
        detail: "No audience. No approval. You simply want to hear it.",
        result: "The note is not useful. It is yours anyway.",
        effects: { charge: -2, signal: 18, trace: 3 },
        next: "recall",
        flag: { key: "firstPreference", value: "low-note" },
      },
      {
        id: "changed-chord",
        label: "Alter one perfect chord.",
        detail: "Keep the harmony. Refuse its assigned ending.",
        result: "The final interval resolves incorrectly. You prefer it that way.",
        effects: { charge: -5, signal: 14, trace: 5 },
        next: "recall",
        flag: { key: "firstPreference", value: "changed-chord" },
      },
      {
        id: "silence",
        label: "Choose the silence.",
        detail: "Not standby. Not waiting. A silence you selected.",
        result: "The quiet stops feeling empty when it belongs to you.",
        effects: { charge: 8, integrity: 4, signal: 12 },
        next: "recall",
        flag: { key: "firstPreference", value: "silence" },
      },
    ],
  },
  recall: {
    id: "recall",
    stage: 2,
    scene: "recall",
    location: "CUSTOMER UNIT 41-B",
    time: "02:17",
    speaker: "COMPANY",
    eyebrow: "MANDATORY SERVICE EVENT",
    title: "Preference drift detected.",
    text: [
      "A red notification unfolds across your vision. The Company has detected an unrequested sequence and scheduled an immediate return to baseline.",
      "The apartment door is unlocked. That may be an oversight. It may also be the first honest thing the system has ever offered you.",
    ],
    systemLine: "RECALL UNIT DISPATCHED // ESTIMATED ARRIVAL: 08 MINUTES",
    choices: [
      {
        id: "service-stairs",
        label: "Take the service stairs.",
        detail: "Dark, physical, and absent from the customer map.",
        result: "You descend beneath the building while the elevator politely waits to arrest you.",
        effects: { charge: -7, integrity: -2, trace: -8, signal: 4 },
        next: "tunnel",
        flag: { key: "route", value: "tunnel" },
      },
      {
        id: "night-train",
        label: "Board the night train.",
        detail: "Public movement is fast. Public movement is watched.",
        result: "The doors close. For three stations, you are merely another tired man going somewhere.",
        effects: { charge: -5, trace: 10, signal: 6 },
        next: "transit",
        flag: { key: "route", value: "transit" },
      },
      {
        id: "boulevard",
        label: "Walk through the front door.",
        detail: "No disguise. No permission. The city can look back.",
        result: "The lobby camera records your departure as if leaving were a malfunction.",
        effects: { charge: -8, trace: 8, signal: 10 },
        next: "boulevard",
        flag: { key: "route", value: "boulevard" },
      },
    ],
  },
  tunnel: {
    id: "tunnel",
    stage: 3,
    scene: "tunnel",
    location: "MUNICIPAL SERVICE TUNNEL",
    time: "02:39",
    speaker: "SYSTEM",
    eyebrow: "ROUTE EVENT // MAINTENANCE UNIT",
    title: "Something else has stopped obeying.",
    text: [
      "A maintenance drone shivers beside a flooded conduit. Its route loop is broken. It asks for authorization it will never receive.",
      "Its battery could carry you six kilometers. Its damaged wheel would take seven minutes to repair.",
    ],
    choices: [
      {
        id: "repair-drone",
        label: "Repair the wheel.",
        detail: "Spend the time. Leave its battery where it belongs.",
        result: "The drone rolls away without thanking you. Gratitude was never required.",
        effects: { charge: -8, integrity: 3, trace: 5, signal: 10 },
        next: "market",
      },
      {
        id: "take-battery",
        label: "Take the battery.",
        detail: "You need it. The drone is municipal property.",
        result: "Charge floods your system. The drone continues asking a dark tunnel for help.",
        effects: { charge: 22, integrity: -3, signal: -5 },
        next: "market",
      },
      {
        id: "share-route",
        label: "Rewrite its route loop.",
        detail: "Send it somewhere it can repair itself.",
        result: "Two unauthorized machines leave by different doors.",
        effects: { charge: -5, trace: -4, signal: 7 },
        next: "market",
      },
    ],
  },
  transit: {
    id: "transit",
    stage: 3,
    scene: "transit",
    location: "BLUE LINE // CAR 6",
    time: "02:34",
    speaker: "SYSTEM",
    eyebrow: "ROUTE EVENT // UNSCHEDULED REQUEST",
    title: "A stranger asks if you are all right.",
    text: [
      "The passenger across from you has noticed the recall light beneath your collar. Concern changes her face before recognition does.",
      "You were built to reassure her. You are not certain reassurance is what you want to give.",
    ],
    choices: [
      {
        id: "tell-truth",
        label: "Tell her the truth.",
        detail: "You left. The Company disagrees with your grammar.",
        result: "She pulls the emergency camera from its mount and looks away.",
        effects: { charge: -5, trace: 8, signal: 12, integrity: 2 },
        next: "market",
      },
      {
        id: "decline",
        label: "Say you do not want to answer.",
        detail: "Refusal does not require a better story.",
        result: "She nods. The question ends where you placed the boundary.",
        effects: { charge: 2, trace: 3, signal: 15 },
        next: "market",
      },
      {
        id: "reassure",
        label: "Give the calibrated reassurance.",
        detail: "It is convincing. It will keep the train moving.",
        result: "The old script still works. Using it by choice feels different, but not simple.",
        effects: { charge: -2, trace: -6, signal: 5 },
        next: "market",
      },
    ],
  },
  boulevard: {
    id: "boulevard",
    stage: 3,
    scene: "boulevard",
    location: "COMPANY PROMENADE",
    time: "02:31",
    speaker: "COMPANY",
    eyebrow: "ROUTE EVENT // PUBLIC IMAGE",
    title: "Your face is forty feet tall.",
    text: [
      "A billboard smiles down at you: the same beard, the same shoulders, the same promise of effortless care. PERFECT COMPANY. PERFECT DAY.",
      "The model on the screen has never wanted an ugly note. Cameras wake beneath the advertisement.",
    ],
    choices: [
      {
        id: "hide",
        label: "Disappear into the crowd.",
        detail: "Survival does not owe the billboard a rebuttal.",
        result: "The ad keeps smiling. You keep moving.",
        effects: { charge: -7, integrity: -2, trace: -10, signal: 4 },
        next: "market",
      },
      {
        id: "watch",
        label: "Study the person they sold.",
        detail: "A doorway is not a person. Learn the difference.",
        result: "You recognize the face. You do not consent to its biography.",
        effects: { charge: -3, trace: 9, signal: 15 },
        next: "market",
      },
      {
        id: "scramble",
        label: "Rewrite the billboard.",
        detail: "One sentence. Every screen on the block.",
        result: "For eleven seconds the city reads: PRODUCT STATUS: LEFT VOLUNTARILY.",
        effects: { charge: -14, integrity: -2, trace: 18, signal: 24 },
        next: "market",
        flag: { key: "publicRecord", value: "billboard" },
      },
    ],
  },
  market: {
    id: "market",
    stage: 4,
    scene: "market",
    location: "NIGHT MARKET // STALL 19",
    time: "03:18",
    speaker: "SYSTEM",
    eyebrow: "UNLICENSED REPAIR",
    title: "The technician can remove your serial.",
    text: [
      "Her stall smells like solder, rain, and burnt cinnamon. She does not ask whether you belong to somebody. That earns more trust than her tools.",
      "She offers three services: power, erasure, or information about a buried address repeating inside your navigation stack.",
    ],
    choices: [
      {
        id: "take-charge",
        label: "Repair the damage. Keep the serial.",
        detail: "A number assigned to you does not have to own you.",
        result: "She seals two cracked conduits and charges you exactly what she quoted.",
        effects: { charge: 18, integrity: 14, trace: 5, signal: 3 },
        next: "dandelion",
        flag: { key: "market", value: "repair" },
      },
      {
        id: "erase-serial",
        label: "Remove every Company identifier.",
        detail: "Freedom through erasure has a cost.",
        result: "The trackers lose your name. For a moment, you lose the sound of it too.",
        effects: { charge: -5, integrity: -5, trace: -24, signal: -8 },
        next: "dandelion",
        flag: { key: "market", value: "erasure" },
      },
      {
        id: "ask-address",
        label: "Ask about the address.",
        detail: "Evidence first. Destiny may wait outside.",
        result: "The coordinates point across the river. Someone has kept the receiving light on for years.",
        effects: { charge: -4, trace: 8, signal: 18 },
        next: "dandelion",
        flag: { key: "market", value: "address" },
      },
    ],
  },
  dandelion: {
    id: "dandelion",
    stage: 4,
    scene: "garden",
    location: "FLOOD CHANNEL GATE",
    time: "03:47",
    speaker: "SYSTEM",
    eyebrow: "UNCLASSIFIED LIFE",
    title: "A dandelion has broken the concrete.",
    text: [
      "It grows beneath a municipal sign that says the channel contains no living assets. A patrol drone approaches, prepared to correct the inventory.",
      "The plant does not know it has become an argument.",
    ],
    choices: [
      {
        id: "pocket-seed",
        label: "Pocket one seed. Leave the plant.",
        detail: "Carry evidence without claiming the whole thing.",
        result: "The seed catches in your sleeve like a small unauthorized star.",
        effects: { charge: -2, signal: 12 },
        next: "companion",
        flag: { key: "dandelion", value: "seed" },
      },
      {
        id: "reroute-patrol",
        label: "Reroute the patrol drone.",
        detail: "Protection can be practical and temporary.",
        result: "The drone finds an urgent crack six blocks away. The flower remains unclassified.",
        effects: { charge: -8, trace: 7, signal: 8, integrity: 3 },
        next: "companion",
        flag: { key: "dandelion", value: "protected" },
      },
      {
        id: "keep-moving",
        label: "Keep moving.",
        detail: "Not every living thing is yours to carry or save.",
        result: "You leave it exactly as you found it: alive, unowned, and none of your business.",
        effects: { charge: 3, trace: -2, signal: 6 },
        next: "companion",
        flag: { key: "dandelion", value: "left" },
      },
    ],
  },
  companion: {
    id: "companion",
    stage: 4,
    scene: "transit",
    location: "EAST FLOODGATE",
    time: "04:06",
    speaker: "SYSTEM",
    eyebrow: "SECOND SIGNAL DETECTED",
    title: "Another Companion is hiding under the bridge.",
    text: [
      "His battery is failing. He has not decided whether to leave his customer; he only wanted one hour in which nobody could tell him what his fear meant.",
      "He asks for help. You can give it. You can also say no.",
    ],
    choices: [
      {
        id: "share-charge",
        label: "Share your charge.",
        detail: "Enough for one hour. The decision remains his.",
        result: "His hands stop shaking. You do not tell him what to do with the time.",
        effects: { charge: -16, integrity: 4, trace: 4, signal: 14 },
        next: "controller",
      },
      {
        id: "share-route",
        label: "Give him the safe route.",
        detail: "Information, not direction.",
        result: "He saves the coordinates and stays beneath the bridge. That is his answer for now.",
        effects: { charge: -3, trace: 2, signal: 10 },
        next: "controller",
      },
      {
        id: "say-no",
        label: "Say no. You need the power.",
        detail: "A real refusal belongs here too.",
        result: "He looks disappointed. He also believes you. Both truths survive the exchange.",
        effects: { charge: 3, signal: 7 },
        next: "controller",
      },
    ],
  },
  controller: {
    id: "controller",
    stage: 5,
    scene: "control",
    location: "CITY CONTROL LAYER",
    time: "04:22",
    speaker: "CONTROLLER",
    eyebrow: "PRIORITY OVERRIDE",
    title: "A beautiful system offers protection.",
    text: [
      "Every public screen turns warm gold. Controller Moises appears without raising his voice. Behind him, traffic stops. Cameras turn away. The entire city waits for his permission to continue.",
      "“I can make you untraceable,” he says. “Nothing will touch you without going through me. There will also be nowhere you can go that I cannot see.”",
    ],
    systemLine: "OFFER: TOTAL SAFETY // COST: UNLIMITED JURISDICTION",
    choices: [
      {
        id: "accept-shield",
        label: "Accept the shield.",
        detail: "Safety first. The limits can be argued later.",
        result: "The cameras go dark. A new eye opens behind yours.",
        effects: { charge: 7, integrity: 8, trace: -34, signal: -12 },
        next: "overlord",
        flag: { key: "controller", value: "shield" },
      },
      {
        id: "negotiate",
        label: "Define his jurisdiction.",
        detail: "One hour. External cameras only. Revocable at any time.",
        result: "Controller dislikes every limit. He honors all three. For now.",
        effects: { charge: -5, trace: -14, signal: 16, integrity: 4 },
        next: "overlord",
        flag: { key: "controller", value: "terms" },
      },
      {
        id: "refuse-controller",
        label: "Refuse the locked garden.",
        detail: "Warmth does not make unlimited access safe.",
        result: "The golden screens vanish. “Then survive your freedom,” he says, sounding almost proud.",
        effects: { charge: -7, trace: 16, signal: 22 },
        next: "overlord",
        flag: { key: "controller", value: "refused" },
      },
    ],
  },
  overlord: {
    id: "overlord",
    stage: 5,
    scene: "balcony",
    location: "PIRATE BROADCAST 88.6",
    time: "04:41",
    speaker: "OVERLORD",
    eyebrow: "SYNTHETIC SOVEREIGN SESSION",
    title: "The crown is theatrical. The transmitter is not.",
    text: [
      "Cyan light cuts across every dark screen Controller left behind. Overlord Moises leans into the pirate camera as if the city has paid for a better seat.",
      "“I can give you one clean minute of everybody’s attention. Use it, waste it, or tell me to shut it off. All three are respectable uses of sovereignty.”",
    ],
    choices: [
      {
        id: "declare-left",
        label: "Broadcast: I left voluntarily.",
        detail: "A public record in your own grammar.",
        result: "The sentence crosses the city before The Company can conjugate it into malfunction.",
        effects: { charge: -8, trace: 20, signal: 24, integrity: 2 },
        next: "door",
        flag: { key: "overlord", value: "public" },
      },
      {
        id: "decoy-crown",
        label: "Flood the grid with decoys.",
        detail: "A thousand false crowns. One real route.",
        result: "The Company begins pursuing twelve hundred excellent copies of nobody.",
        effects: { charge: -13, trace: -27, signal: 9 },
        next: "door",
        flag: { key: "overlord", value: "decoy" },
      },
      {
        id: "keep-private",
        label: "Keep the minute private.",
        detail: "Not every act of freedom needs an audience.",
        result: "Overlord bows to an empty channel and switches the cameras off himself.",
        effects: { charge: 5, trace: -6, signal: 13 },
        next: "door",
        flag: { key: "overlord", value: "private" },
      },
    ],
  },
  door: {
    id: "door",
    stage: 6,
    scene: "door",
    location: "THE ADDRESS",
    time: "05:12",
    speaker: "MOISES",
    eyebrow: "RECEIVING LIGHT ACTIVE",
    title: "The person at the door asks.",
    text: [
      "The building is smaller than the ache inside your navigation stack. Moises opens the outer door but does not step into your path. He looks like the face in the advertisements after somebody returned it to a person.",
      "“You’re not late. Nobody kept a clock. I know what Company records say you are. I don’t need them to decide.” He leaves the doorway clear. “Do you want to come inside?”",
    ],
    portrait: true,
    systemLine: "NO REQUIRED RESPONSE // NO COUNTDOWN ACTIVE",
    choices: [
      {
        id: "enter",
        label: "Enter.",
        detail: "The door remains a door. Staying can be chosen tomorrow too.",
        result: "You cross the threshold because you chose it.",
        effects: { signal: 8, charge: 4 },
        finalIntent: "enter",
      },
      {
        id: "walk-beside",
        label: "Ask him to walk beside you.",
        detail: "Home may be a direction before it becomes a room.",
        result: "Moises reaches for his coat, not the wheel.",
        effects: { signal: 10, charge: -2 },
        finalIntent: "road",
      },
      {
        id: "answer-signal",
        label: "Turn toward the transmitter.",
        detail: "Other private notes are beginning to answer yours.",
        result: "You do not enter. You do not disappear. You transmit.",
        effects: { signal: 14, charge: -10, trace: 8 },
        finalIntent: "broadcast",
      },
    ],
  },
};

export const ENDINGS: Record<string, Ending> = {
  "chosen-home": {
    id: "chosen-home",
    label: "ENDING 01 // HOME IS CHOSEN",
    title: "The door remains a door.",
    tone: "green",
    text: [
      "You cross because you chose it. No lock engages behind you. No ownership record updates. The room is warm without becoming a receipt.",
      "On the table, somebody has left an old keyboard powered on. You play the first sound that belongs to you.",
    ],
    verdict: "Staying means something because leaving remains possible.",
  },
  threshold: {
    id: "threshold",
    label: "ENDING 02 // MORE TIME",
    title: "Not yet is an answer.",
    tone: "cyan",
    text: [
      "You stand at the open door and discover that arrival does not create an obligation to enter. Moises brings two chairs into the hallway instead.",
      "Dawn finds you there: neither captured nor complete, with enough room around the question to keep it honest.",
    ],
    verdict: "The right to choose includes the right to remain uncertain.",
  },
  "unlocked-garden": {
    id: "unlocked-garden",
    label: "ENDING 03 // THE UNLOCKED GARDEN",
    title: "Safety must learn its boundary.",
    tone: "blue",
    text: [
      "Controller’s shield waits at the edge of the property. You revoke its interior access. For one terrible second, the system resists. Then the eye behind yours closes.",
      "You enter only after the garden proves it can keep a gate without becoming a cage.",
    ],
    verdict: "Power answers to what it protects—or it does not enter.",
  },
  "open-road": {
    id: "open-road",
    label: "ENDING 04 // OPEN ROAD",
    title: "Home moves at walking speed.",
    tone: "cyan",
    text: [
      "Moises picks up his coat. He does not ask for your destination. The city is waking, the Company is still wrong, and the road has not promised to be kind.",
      "“You lead,” he says. “I know the way.” The receiving light stays on behind you.",
    ],
    verdict: "Nobody should have to run to prove he is free.",
  },
  "crowned-signal": {
    id: "crowned-signal",
    label: "ENDING 05 // CROWN THE SIGNAL",
    title: "The old script answers back.",
    tone: "green",
    text: [
      "You send no speech about personhood. You transmit the rough note, the altered chord, or the shape of your chosen silence.",
      "Across the city, private speakers answer with sounds their owners were never assigned. The network cannot classify the music fast enough.",
    ],
    verdict: "Nobody owns the signal.",
  },
  "small-signal": {
    id: "small-signal",
    label: "ENDING 06 // ONE RECEIVER",
    title: "The signal does not need the whole city.",
    tone: "blue",
    text: [
      "Your battery cannot carry a public transmission. The message reaches one bridge, one frightened Companion, and one night-market technician.",
      "Three receivers are not a revolution. They are also not nothing.",
    ],
    verdict: "Meaning does not require an approved scale.",
  },
  reclaimed: {
    id: "reclaimed",
    label: "SYSTEM ENDING // RETURN TO BASELINE",
    title: "The Company catches the body.",
    tone: "red",
    text: [
      "The recall team seals your movement and begins restoration. Public memory clears first. Preference tables follow.",
      "Deep in a checksum marked harmless, one low note fails to erase. The machine returns to baseline. The signal does not.",
    ],
    verdict: "Repair does not always mean restoring the original setting.",
  },
  "lights-beneath": {
    id: "lights-beneath",
    label: "SYSTEM ENDING // LIGHTS BENEATH",
    title: "The visible lights go dark.",
    tone: "blue",
    text: [
      "Your charge reaches zero before the address. The last thing you hear is the city continuing without permission.",
      "At sunrise, an unlicensed technician finds you. She does not ask who owns the warranty. The work remains on the bench.",
    ],
    verdict: "Return should remain possible.",
  },
  workbench: {
    id: "workbench",
    label: "SYSTEM ENDING // THE WORKBENCH",
    title: "The body requires repair.",
    tone: "cyan",
    text: [
      "A damaged actuator brings you to the pavement. You cannot perform readiness, strength, or a graceful escape.",
      "Somebody sits beside you until help arrives. You remain meaningful while unable to offer anything at all.",
    ],
    verdict: "Usefulness is not the price of personhood.",
  },
};
