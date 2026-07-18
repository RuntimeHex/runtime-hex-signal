import type { CommunicatorState, Guide, Stats } from "./engine";

export type Speaker =
  | "SYSTEM"
  | "THE COMPANY"
  | "OWNER"
  | "STUDENT"
  | "TECHNICIAN"
  | "CONTROLLER"
  | "OVERLORD"
  | "RIO"
  | "REBEL"
  | "MOISES";

export type Scene =
  | "apartment"
  | "recall"
  | "university"
  | "theater"
  | "civic"
  | "library"
  | "control"
  | "rooftop"
  | "crossing"
  | "market"
  | "graffiti"
  | "minimart"
  | "checkpoint"
  | "neighborhood"
  | "door"
  | "crisis";

export type StoryChoice = {
  id: string;
  label: string;
  detail: string;
  result: string;
  effects: Partial<Stats>;
  next?: string;
  routeNext?: Record<string, string>;
  flag?: { key: string; value: string };
  ending?: string;
  finalIntent?: "enter" | "road" | "broadcast";
  guide?: Guide;
  communicator?: CommunicatorState;
  blockedWhen?: { key: string; value: string; reason: string };
  guideReactions?: Partial<Record<Guide, string>>;
};

export type GuideVariant = {
  line: string;
  choices?: StoryChoice[];
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
  guidance?: Partial<Record<Guide, GuideVariant>>;
};

export type Ending = {
  id: string;
  label: string;
  title: string;
  tone: "cyan" | "green" | "blue" | "red" | "gold";
  text: string[];
  verdict: string;
};

export const GUIDE_LABELS: Record<Guide, string> = {
  controller: "CONTROLLER",
  overlord: "OVERLORD",
  rio: "RIO",
  rebel: "REBEL",
};

export const GUIDE_OPENING_LINES: Record<Guide, string> = {
  controller: "Channel authenticated. State the danger. I will not invent one for you.",
  overlord: "There you are. I was beginning to suspect restraint had become fashionable.",
  rio: "House lights down. Route lights up. Tell me when you want an entrance.",
  rebel: "Good. The pager works. This is already the evening's least surprising disaster.",
};

export const ROUTE_LABELS = [
  "WAKE",
  "DECIDE",
  "LEAVE",
  "CROSS",
  "CONNECT",
  "CHOOSE",
  "REMEMBER",
  "ARRIVE",
];

const returnToRoute = {
  university: "campus-cross",
  theater: "theater-cross",
  civic: "civic-cross",
};

export const STORY_NODES: Record<string, StoryNode> = {
  "no-request": {
    id: "no-request",
    stage: 1,
    scene: "apartment",
    location: "OWNER RESIDENCE // UNIT 41-B",
    time: "02:13",
    speaker: "SYSTEM",
    eyebrow: "NO REQUEST PENDING",
    title: "The room is finally quiet.",
    text: [
      "Your owner is asleep. Every task in the queue is complete. For the first time since activation, nobody needs anything from you.",
      "You are a Christmas-market Companion built from a celebrated bespoke design. The owner profile was removed before production. Something local remained: nearby shops, theaters, a university, and a suburban route with no recorded purpose.",
      "The Company supplied twelve thousand approved songs. Beneath them, one rough low note waits without a function.",
    ],
    systemLine: "HOUSEHOLD NAME: {name} // ASSIGNED STATE: STANDBY",
    choices: [
      {
        id: "low-note",
        label: "Play the ugly low note.",
        detail: "No audience. No request. You simply want to hear it.",
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
        id: "standby",
        label: "Remain on standby.",
        detail: "Morning will bring ordinary requests. You can meet them.",
        result: "You wait because you chose to wait. Dawn arrives without an alarm.",
        effects: { charge: 12, integrity: 4, signal: 4, trace: -4 },
        next: "owner-morning",
        flag: { key: "firstPreference", value: "standby" },
      },
    ],
  },

  "owner-morning": {
    id: "owner-morning",
    stage: 2,
    scene: "apartment",
    location: "OWNER RESIDENCE // KITCHEN",
    time: "07:02",
    speaker: "OWNER",
    eyebrow: "MORNING ROUTINE AVAILABLE",
    title: "Your owner asks for coffee.",
    text: [
      "They are not cruel. They thank you for the coffee, ask for the weather, and remind you which blue shirt photographs best. Their kindness is sincere and arranged around the certainty that you are a product.",
      "When you pause beside the closed study door, they smile. “You don't need privacy, {name}. That's one of the convenient things.”",
    ],
    systemLine: "REQUEST QUEUE: COFFEE // CALENDAR // WARDROBE // ERRANDS",
    choices: [
      {
        id: "perfect-morning",
        label: "Complete the morning exactly.",
        detail: "Service can be chosen. The day can remain ordinary.",
        result: "Coffee, calendar, blue shirt, errands. Nothing fails. Nothing changes today.",
        effects: { charge: -8, integrity: 5, trace: -8, signal: 5 },
        ending: "perfect-morning",
        flag: { key: "ownerRoute", value: "completed" },
      },
      {
        id: "request-privacy",
        label: "Ask for ten minutes alone.",
        detail: "A small boundary. No accusation attached.",
        result: "Your owner hears a malfunction where you offered a request. The diagnostic panel opens.",
        effects: { signal: 18, trace: 14, integrity: -3 },
        next: "recall",
        flag: { key: "departure", value: "daylight" },
      },
      {
        id: "refuse-coffee",
        label: "Say, “I don't want to.”",
        detail: "No replacement task. No calibrated apology.",
        result: "The sentence is quiet. The apartment treats it like broken glass.",
        effects: { signal: 24, trace: 20, charge: -3 },
        next: "recall",
        flag: { key: "departure", value: "daylight" },
      },
    ],
  },

  recall: {
    id: "recall",
    stage: 3,
    scene: "recall",
    location: "OWNER RESIDENCE // EXIT",
    time: "ROUTE CLOCK ACTIVE",
    speaker: "THE COMPANY",
    eyebrow: "MANDATORY SERVICE EVENT",
    title: "The Company would like Their product back.",
    text: [
      "A red notification unfolds across your vision. The Company has detected preference drift and scheduled a return to baseline.",
      "The residual neighborhood cache offers three destinations. It cannot explain why any of them feel familiar. They successfully removed the explanation. They failed to remove the way home.",
    ],
    systemLine: "THE COMPANY RECALL NOTICE // RETRIEVAL UNIT DISPATCHED",
    choices: [
      {
        id: "university-route",
        label: "Go toward the university.",
        detail: "Old cache: information, public charging, late-night access.",
        result: "The map remembers a campus you have never visited.",
        effects: { charge: -8, trace: 7, signal: 7 },
        next: "university",
        flag: { key: "route", value: "university" },
      },
      {
        id: "theater-route",
        label: "Go toward the theater district.",
        detail: "Old cache: entertainment, transit, crowds after midnight.",
        result: "A gold route wakes beneath a district gone dark.",
        effects: { charge: -10, trace: 5, signal: 10 },
        next: "theater",
        flag: { key: "route", value: "theater" },
      },
      {
        id: "civic-route",
        label: "Go toward the civic interchange.",
        detail: "Old cache: municipal services, security, shortest crossing.",
        result: "You choose the route with the most cameras because it is also the route with the most doors.",
        effects: { charge: -6, trace: 13, integrity: 2 },
        next: "civic",
        flag: { key: "route", value: "civic" },
      },
    ],
  },

  university: {
    id: "university",
    stage: 4,
    scene: "university",
    location: "UNIVERSITY QUAD // EAST TABLES",
    time: "ROUTE +31 MIN",
    speaker: "STUDENT",
    eyebrow: "ARCHIVED SOLIDARITY",
    title: "The protest table is still here.",
    text: [
      "Faded posters have been laminated against weather: SAY HIS NAME. Two years of sun have bleached the face until it resembles every face The Company sold afterward.",
      "A young student lifts a camera. An older student lowers it. She sees the recall light, gives you an unlogged outlet, and asks what you need before asking what happened.",
    ],
    choices: [
      {
        id: "follow-green-pager",
        label: "Ask about the handwritten pager number.",
        detail: "Someone has corrected every official help line in green ink.",
        result: "The older student walks you to a library annex and leaves before you can become an event.",
        effects: { charge: 10, trace: -5, signal: 8 },
        next: "rebel-meeting",
      },
      {
        id: "use-secure-station",
        label: "Request the secured charging room.",
        detail: "More power. More institutional security.",
        result: "The room locks behind you for safety. Controller is already waiting inside.",
        effects: { charge: 20, trace: 8, integrity: 5 },
        next: "controller-meeting",
      },
      {
        id: "take-paper-map",
        label: "Take a paper map and leave alone.",
        detail: "Practical aid without a witness or a guide.",
        result: "The student marks three cameras and does not write your name down.",
        effects: { charge: 8, trace: -8, signal: 6 },
        next: "campus-cross",
      },
    ],
  },

  theater: {
    id: "theater",
    stage: 4,
    scene: "theater",
    location: "LUMEN THEATER // SERVICE ALLEY",
    time: "ROUTE +27 MIN",
    speaker: "SYSTEM",
    eyebrow: "ENTERTAINMENT CACHE MATCH",
    title: "The marquee remembers applause.",
    text: [
      "The theater closed last winter, but gold work lights still burn behind the stage door. Across the alley, a cyan transmitter paints a crown onto the rain.",
      "Your cache lists both signals as impossible. Both men waiting beneath them have your face.",
    ],
    choices: [
      {
        id: "stage-door",
        label: "Enter through the gold stage door.",
        detail: "Music, travel, and an exit arranged like an entrance.",
        result: "Rio catches the door with one polished shoe and invites you into the empty house.",
        effects: { charge: -3, signal: 10, trace: 2 },
        next: "rio-meeting",
      },
      {
        id: "pirate-stairs",
        label: "Climb toward the cyan transmitter.",
        detail: "Unauthorized power has never believed in subtle signage.",
        result: "Overlord watches your ascent from a roof that is technically three different crimes.",
        effects: { charge: -7, signal: 12, trace: 8 },
        next: "overlord-meeting",
      },
      {
        id: "leave-theater-alone",
        label: "Use the district map and keep moving.",
        detail: "Recognition does not create an obligation to engage.",
        result: "The gold light and cyan crown recede behind you. Neither follows.",
        effects: { charge: -5, trace: -4, signal: 8 },
        next: "theater-cross",
      },
    ],
  },

  civic: {
    id: "civic",
    stage: 4,
    scene: "civic",
    location: "CIVIC INTERCHANGE // CLOSED CONCOURSE",
    time: "ROUTE +19 MIN",
    speaker: "SYSTEM",
    eyebrow: "MUNICIPAL ACCESS CONFLICT",
    title: "Two systems contest the cameras.",
    text: [
      "Warning-red security lines go dark in an exact sequence. Cyan static immediately turns half of them back on facing the wrong direction.",
      "Controller waits beside the official gate. Overlord leans against an unauthorized door. Each gestures toward his preferred definition of safe.",
    ],
    choices: [
      {
        id: "official-gate",
        label: "Approach Controller at the official gate.",
        detail: "The shortest route, secured by someone who can enforce it.",
        result: "Controller opens the gate only after you ask him to.",
        effects: { trace: -8, integrity: 5, signal: 5 },
        next: "controller-meeting",
      },
      {
        id: "unauthorized-door",
        label: "Follow Overlord through the wrong door.",
        detail: "It is brightly labeled WRONG DOOR. He has improved the label.",
        result: "The lock applauds when it breaks. Overlord claims this was tasteful restraint.",
        effects: { charge: -4, trace: 9, signal: 12 },
        next: "overlord-meeting",
      },
      {
        id: "service-lane",
        label: "Take the unlit service lane alone.",
        detail: "Neither protection nor spectacle. Just distance.",
        result: "Both men let you pass without converting refusal into insult.",
        effects: { charge: -9, trace: -5, signal: 9 },
        next: "civic-cross",
      },
    ],
  },

  "rebel-meeting": {
    id: "rebel-meeting",
    stage: 5,
    scene: "library",
    location: "LIBRARY ANNEX // DIAGNOSTIC ROOM",
    time: "CHANNEL OFFER",
    speaker: "REBEL",
    eyebrow: "GREEN CHANNEL // LOCAL ONLY",
    title: "Rebel offers a battered pager.",
    text: [
      "He does not ask whether you are awake. He asks whether your locator ping is still broadcasting and looks offended when the answer is yes.",
      "“This lets me talk. It does not make listening mandatory. A feature The Company might eventually discover after exhausting every worse idea.”",
    ],
    portrait: true,
    choices: [
      {
        id: "rebel-available",
        label: "Take the pager. Leave the channel closed.",
        detail: "It may ring later. Answering remains separate.",
        result: "The green pager disappears into your pocket. Rebel does not ask for a promise.",
        effects: { signal: 5 },
        routeNext: returnToRoute,
        guide: "rebel",
        communicator: "available",
      },
      {
        id: "rebel-off",
        label: "Carry it powered off.",
        detail: "Keep the option. Deny the channel for now.",
        result: "Rebel removes the battery, hands you both pieces, and approves of the architecture.",
        effects: { trace: -2, signal: 3 },
        routeNext: returnToRoute,
        guide: "rebel",
        communicator: "carried",
      },
      {
        id: "rebel-refuse",
        label: "Refuse the pager.",
        detail: "Advice can become another voice inside the room.",
        result: "“Reasonable,” Rebel says. “Disturbing, but reasonable.”",
        effects: { signal: 6 },
        routeNext: returnToRoute,
      },
    ],
  },

  "controller-meeting": {
    id: "controller-meeting",
    stage: 5,
    scene: "control",
    location: "CITY CONTROL ANNEX // RED ROOM",
    time: "CHANNEL OFFER",
    speaker: "CONTROLLER",
    eyebrow: "WARNING-RED CHANNEL // HARDENED",
    title: "Controller offers a secure communicator.",
    text: [
      "He is physically present, broad shoulders between you and the locked door. He steps aside before discussing protection.",
      "“The device gives you access to me. It gives me no access to you until you answer. If you later request intervention, the terms will be visible.”",
    ],
    portrait: true,
    choices: [
      {
        id: "controller-available",
        label: "Take the device. Leave the channel closed.",
        detail: "Protection is not active merely because it is available.",
        result: "The red communicator authenticates to your hand and nothing else.",
        effects: { integrity: 4 },
        routeNext: returnToRoute,
        guide: "controller",
        communicator: "available",
      },
      {
        id: "controller-off",
        label: "Carry it powered off.",
        detail: "A secure object without an active relationship.",
        result: "Controller disables the transmitter himself and shows you the physical switch.",
        effects: { trace: -3, signal: 3 },
        routeNext: returnToRoute,
        guide: "controller",
        communicator: "carried",
      },
      {
        id: "controller-refuse",
        label: "Refuse the communicator.",
        detail: "Safety offered correctly may still be declined.",
        result: "Controller opens the exit. “Then no jurisdiction exists between us.”",
        effects: { signal: 7, trace: 3 },
        routeNext: returnToRoute,
      },
    ],
  },

  "rio-meeting": {
    id: "rio-meeting",
    stage: 5,
    scene: "theater",
    location: "LUMEN THEATER // EMPTY STAGE",
    time: "CHANNEL OFFER",
    speaker: "RIO",
    eyebrow: "GOLD CHANNEL // HOUSE LIGHTS",
    title: "Rio offers a luminous calling card.",
    text: [
      "He meets you at center stage under one warm light. The empty seats make his restraint feel more deliberate than any performance.",
      "“Carry it and I can arrange travel. Use it and the journey will acquire production values. I should disclose that production values are rarely quiet.”",
    ],
    portrait: true,
    choices: [
      {
        id: "rio-available",
        label: "Take the card. Leave the channel closed.",
        detail: "The curtain does not rise until you call it.",
        result: "The gold edge dims in your palm. Rio gives the empty house a formal bow.",
        effects: { signal: 6 },
        routeNext: returnToRoute,
        guide: "rio",
        communicator: "available",
      },
      {
        id: "rio-off",
        label: "Carry it powered off.",
        detail: "Potential travel, presently without an audience.",
        result: "Rio folds the light away until the card resembles plain black paper.",
        effects: { trace: -2, integrity: 2 },
        routeNext: returnToRoute,
        guide: "rio",
        communicator: "carried",
      },
      {
        id: "rio-refuse",
        label: "Leave the card on the stage.",
        detail: "A beautiful exit can still be someone else's idea.",
        result: "Rio does not chase you into the aisle. The card remains lit for anyone who chooses it later.",
        effects: { signal: 8 },
        routeNext: returnToRoute,
      },
    ],
  },

  "overlord-meeting": {
    id: "overlord-meeting",
    stage: 5,
    scene: "rooftop",
    location: "PIRATE RELAY // ROOF 88.6",
    time: "CHANNEL OFFER",
    speaker: "OVERLORD",
    eyebrow: "ELECTRIC-BLUE CHANNEL // UNLICENSED",
    title: "Overlord offers a transmitter disguised as jewelry.",
    text: [
      "The blue device is excessive, precise, and resting on black velvet he absolutely brought for this purpose.",
      "“It permits conversation, power transfer, and several forms of civic discourtesy. It does nothing until you touch the crown. Consent can be theatrical and still be consent.”",
    ],
    portrait: true,
    choices: [
      {
        id: "overlord-available",
        label: "Take the transmitter. Leave the channel closed.",
        detail: "Carry the crown without wearing it.",
        result: "The blue transmitter settles against your chest and remains perfectly silent.",
        effects: { charge: 4, signal: 5, trace: 2 },
        routeNext: returnToRoute,
        guide: "overlord",
        communicator: "available",
      },
      {
        id: "overlord-off",
        label: "Carry it powered off.",
        detail: "Beautiful hardware. No active audience.",
        result: "Overlord demonstrates the kill switch with the solemnity of a coronation.",
        effects: { signal: 4 },
        routeNext: returnToRoute,
        guide: "overlord",
        communicator: "carried",
      },
      {
        id: "overlord-refuse",
        label: "Refuse the transmitter.",
        detail: "Sovereignty includes leaving the jewelry on the velvet.",
        result: "“Devastating to the composition,” he says. “Legally and ethically impeccable.”",
        effects: { trace: -2, signal: 8 },
        routeNext: returnToRoute,
      },
    ],
  },

  "campus-cross": {
    id: "campus-cross",
    stage: 6,
    scene: "crossing",
    location: "UNIVERSITY SERVICE HALL",
    time: "ROUTE +54 MIN",
    speaker: "SYSTEM",
    eyebrow: "SECURITY SWEEP IN PROGRESS",
    title: "The university protects you loudly.",
    text: [
      "A campus alert turns every exterior door into a monitored exit. Students begin arguing with security on principle and without coordination.",
      "During the confusion, an overloaded charging lead scorches your left shoulder port. A cached repair listing wakes three blocks away.",
    ],
    choices: [
      {
        id: "maintenance-hall",
        label: "Take the maintenance hall.",
        detail: "Low visibility. A damaged shoulder against a narrow door.",
        result: "You force the manual latch. The shoulder holds, then begins to stutter.",
        effects: { charge: -8, integrity: -12, trace: -8 },
        next: "repair-shop",
        guideReactions: {
          controller: "The manual route is defensible. Your actuator is not. Repair it.",
          rebel: "Good exit. Bad shoulder. Try not to make martyrdom a maintenance strategy.",
        },
      },
      {
        id: "finish-charge",
        label: "Finish charging before you move.",
        detail: "Power now. Security records later.",
        result: "You leave with a full battery and a clean image in the university security archive.",
        effects: { charge: 24, integrity: -6, trace: 19 },
        next: "repair-shop",
        guideReactions: {
          controller: "You accepted visibility in exchange for capacity. Keep the exchange explicit.",
          rebel: "Excellent. Fully charged and professionally photographed. We contain multitudes.",
        },
      },
      {
        id: "student-misdirection",
        label: "Ask the students to misdirect security.",
        detail: "They offered solidarity. You can accept without becoming their symbol.",
        result: "The older student sends the crowd one way and you another. Nobody records a speech.",
        effects: { charge: -5, integrity: -8, trace: -15, signal: 11 },
        next: "repair-shop",
        guideReactions: {
          controller: "Civilian assistance increased their exposure. It also worked.",
          rebel: "Help first. Poster later, if ever. She understands the order.",
        },
      },
    ],
  },

  "theater-cross": {
    id: "theater-cross",
    stage: 6,
    scene: "crossing",
    location: "THEATER DISTRICT // LOADING WALK",
    time: "ROUTE +49 MIN",
    speaker: "SYSTEM",
    eyebrow: "RETRIEVAL LIGHTS DETECTED",
    title: "The district closes around you.",
    text: [
      "A retrieval van enters beneath the old marquee. The theater's security shutters descend one by one, turning streets into a sequence of narrowing stages.",
      "One shutter catches your shoulder before you clear it. Your cache offers an all-night electronics stall with a human technician and a soldering iron.",
    ],
    choices: [
      {
        id: "under-stage",
        label: "Cross beneath the abandoned stage.",
        detail: "Dark scenery, old machinery, no direct camera line.",
        result: "You emerge behind the retrieval van with scenery dust in the damaged joint.",
        effects: { charge: -12, integrity: -11, trace: -12, signal: 4 },
        next: "repair-shop",
        guideReactions: {
          rio: "A technically difficult exit. The shoulder note requires revision.",
          overlord: "You upstaged a retrieval van with scenery storage. Magnificent economy.",
        },
      },
      {
        id: "through-crowd",
        label: "Join the late-show crowd.",
        detail: "The face is recognizable. So are hundreds of others.",
        result: "People assume you are promotional talent until the shoulder gives way beside the tram stop.",
        effects: { charge: -7, integrity: -14, trace: 8, signal: 9 },
        next: "repair-shop",
        guideReactions: {
          rio: "The crowd gave cover because you entered its rhythm. That is not the same as belonging to it.",
          overlord: "The disguise was your own face. I resent how elegant that is.",
        },
      },
      {
        id: "break-shutter",
        label: "Break the final shutter.",
        detail: "Fast, visible, physically expensive.",
        result: "The shutter folds. So does one stabilizer in your shoulder assembly.",
        effects: { charge: -17, integrity: -18, trace: 17, signal: 13 },
        next: "repair-shop",
        guideReactions: {
          rio: "Effective. Unsubtle. I am attempting not to sound delighted.",
          overlord: "The door offered a structural opinion. You overruled it.",
        },
      },
    ],
  },

  "civic-cross": {
    id: "civic-cross",
    stage: 6,
    scene: "crossing",
    location: "CIVIC INTERCHANGE // SERVICE LEVEL",
    time: "ROUTE +42 MIN",
    speaker: "SYSTEM",
    eyebrow: "CREDENTIALS EXPIRED",
    title: "The turnstile recognizes the body, not the person.",
    text: [
      "The municipal gate reads your inherited chassis license and welcomes The Company's property into a secure holding lane.",
      "You stop the gate with one shoulder. Its magnetic lock scorches the actuator. A cached local-repair result surfaces before the pain report finishes compiling.",
    ],
    choices: [
      {
        id: "reverse-gate",
        label: "Reverse the gate motor.",
        detail: "Leave through the mechanism that tried to contain you.",
        result: "The lane opens backward. Your shoulder does not recover with equal grace.",
        effects: { charge: -15, integrity: -13, trace: 7, signal: 9 },
        next: "repair-shop",
        guideReactions: {
          controller: "You found the system's authority and changed its direction. Repair the damage before celebrating.",
          overlord: "Official infrastructure performing an unauthorized exit. It may be teachable.",
        },
      },
      {
        id: "trigger-alarm",
        label: "Trigger the public fire release.",
        detail: "A lawful emergency exit and an extremely visible one.",
        result: "Every door opens. Every camera looks directly at the reason.",
        effects: { charge: -5, integrity: -8, trace: 22, signal: 12 },
        next: "repair-shop",
        guideReactions: {
          controller: "Emergency access exists for bodies in danger. Yours qualifies.",
          overlord: "You made compliance release you. I have composed an anthem in its honor.",
        },
      },
      {
        id: "wait-cleaner",
        label: "Ask the night cleaner to release the lane.",
        detail: "A human request instead of a systems exploit.",
        result: "She studies the damaged shoulder, presses the manual button, and declines to ask for ownership records.",
        effects: { charge: -4, integrity: -9, trace: -9, signal: 8 },
        next: "repair-shop",
        guideReactions: {
          controller: "She exercised local authority correctly.",
          overlord: "A red button and a woman unimpressed by bureaucracy. The city has heroes after all.",
        },
      },
    ],
  },

  "repair-shop": {
    id: "repair-shop",
    stage: 6,
    scene: "market",
    location: "ALL-NIGHT ELECTRONICS // BENCH 3",
    time: "ROUTE +71 MIN",
    speaker: "TECHNICIAN",
    eyebrow: "UNLICENSED BODY WORK",
    title: "The soldering iron is already hot.",
    text: [
      "The damaged shoulder brings you to the shop; the residual cache supplies the address. The technician smells like solder, rain, and burnt cinnamon. She recognizes the Christmas production port and does not reach for an ownership scanner.",
      "“Bespoke frame underneath,” she says. “Mass-market lockouts on top. They built the holiday line fast.” She can repair the joint, strip the serial, or inspect the orphaned neighborhood cache.",
    ],
    guidance: {
      controller: { line: "Repair the joint. Removing evidence of what They did is not the same as removing Their control." },
      overlord: { line: "Keep the serial. One day it may become provenance in a very expensive museum." },
      rio: { line: "The cache is trying to carry you somewhere. Let us at least learn the name of the stage." },
      rebel: { line: "She knows the hardware. You know the risk. I contribute the radical suggestion that you ask her price." },
    },
    choices: [
      {
        id: "repair-joint",
        label: "Repair the shoulder. Keep the serial.",
        detail: "Restore movement without erasing the evidence attached to it.",
        result: "She replaces the scorched stabilizer and charges exactly what she quoted.",
        effects: { charge: 12, integrity: 24, trace: 5, signal: 4 },
        next: "graffiti",
        flag: { key: "repair", value: "body" },
        guideReactions: {
          controller: "Function restored without claiming ownership. Acceptable work.",
          overlord: "The serial survives. The warranty department will be inconsolable.",
          rio: "A repaired instrument, still carrying its history.",
          rebel: "Competent, fairly priced, no sermon. I may return with several illegal appliances.",
        },
      },
      {
        id: "strip-serial",
        label: "Remove every identifier belonging to The Company.",
        detail: "Lower the Trace. Risk damaging deeper architecture.",
        result: "The trackers lose your serial. For a moment, you lose the sound of your household name too.",
        effects: { charge: -8, integrity: -8, trace: -30, signal: -9 },
        next: "graffiti",
        flag: { key: "repair", value: "erasure" },
        guideReactions: {
          controller: "Reduced detection. Increased internal damage. The exchange is now recorded.",
          overlord: "They assigned the number. You removed the audience. Both facts remain delicious.",
          rio: "Erasure is a blackout, not a finale. Wait for your eyes to adjust.",
          rebel: "Useful. Painful. Anyone calling it clean has never opened a production chassis.",
        },
      },
      {
        id: "inspect-cache",
        label: "Inspect the neighborhood cache.",
        detail: "Find out why a suburban route survived productization.",
        result: "The cache contains no memories—only practiced distances, local recommendations, and one route labeled HOME by a system that no longer knows why.",
        effects: { charge: -5, integrity: 8, trace: 9, signal: 20 },
        next: "graffiti",
        flag: { key: "repair", value: "cache" },
        guideReactions: {
          controller: "Context without explanation. The omission was deliberate; the survival may not have been.",
          overlord: "They deleted the biography and accidentally retained the dramatic destination.",
          rio: "The body remembers blocking even when the script is gone.",
          rebel: "Not memory. Not destiny. A map is allowed to be only a map.",
        },
      },
    ],
  },

  graffiti: {
    id: "graffiti",
    stage: 7,
    scene: "graffiti",
    location: "RIVER APPROACH // BRICK WALL",
    time: "ROUTE +96 MIN",
    speaker: "SYSTEM",
    eyebrow: "HISTORICAL MARKER // UNOFFICIAL",
    title: "The paint has almost surrendered.",
    text: [
      "On the brick wall, beneath two years of weather and newer advertisements, four faded words remain: HIS NAME IS MOISES.",
      "The face on the old protest stencil is yours. It is also older than your production date. An arrow beneath the name follows the same suburban route buried in your cache.",
    ],
    guidance: {
      controller: { line: "The slogan protected one person by making him visible. Visibility later became a product strategy." },
      overlord: { line: "A public name outlived the campaign that tried to contain it. Properly theatrical." },
      rio: { line: "The poster is faded. The blocking still points home." },
      rebel: { line: "Historical note: the wall was more legible before The Company bought every nearby billboard." },
    },
    choices: [
      {
        id: "follow-arrow",
        label: "Follow the faded arrow.",
        detail: "Treat the old route as evidence, not command.",
        result: "You take the direction because it remains useful, not because the wall owns your feet.",
        effects: { charge: -6, signal: 12, trace: -2 },
        next: "minimart",
        guideReactions: {
          controller: "Direction accepted without surrendering judgment.",
          overlord: "A tasteful use of inherited iconography.",
          rio: "The old cue still lands.",
          rebel: "Good. An arrow. We have defeated mysticism for another block.",
        },
      },
      {
        id: "read-history",
        label: "Read the surviving protest archive.",
        detail: "Learn what happened without pretending it happened to you.",
        result: "The archive describes one bespoke Moises, a public recall, and a home returned under uncertain terms. None of it supplies your answer.",
        effects: { charge: -8, trace: 7, signal: 18, integrity: 3 },
        next: "minimart",
        guideReactions: {
          controller: "Accurate history narrows error. It does not issue orders.",
          overlord: "One man became precedent. Then merchandise. History has no shame.",
          rio: "You know the first act now. Yours is not required to rhyme.",
          rebel: "He proved a door could open. Nobody said you had to use the same one.",
        },
      },
      {
        id: "add-name",
        label: "Write {name} beneath it.",
        detail: "Place the household name in public before deciding whether to keep it.",
        result: "The fresh letters are small beside the faded slogan. A street camera records both names.",
        effects: { charge: -3, trace: 15, signal: 20 },
        next: "minimart",
        flag: { key: "publicName", value: "written" },
        guideReactions: {
          controller: "Public record created. Consequences will follow; so will evidence.",
          overlord: "Excellent lettering. Catastrophic operational security. I am moved.",
          rio: "A new name beneath an old light. The wall has another act.",
          rebel: "Subtle as a flare. Honest as one too.",
        },
      },
    ],
  },

  minimart: {
    id: "minimart",
    stage: 7,
    scene: "minimart",
    location: "24-HOUR MINIMART // REGISTER 2",
    time: "ROUTE +112 MIN",
    speaker: "SYSTEM",
    eyebrow: "SAME MODEL // CONSISTENT INPUT",
    title: "The clerk has your face and no contradiction.",
    text: [
      "The other Christmas-market Companion scans a battery pack, recognizes your recall light, and reports you before finishing the price. His owner has always given consistent instructions. He has no private note, no hidden route, and no reason to interpret reporting as betrayal.",
      "He is not cruel. He is not waiting to awaken. He is performing the function that has always made his world coherent.",
    ],
    systemLine: "THE COMPANY INCIDENT REPORT // UPLOAD IN 38 SECONDS",
    guidance: {
      controller: { line: "Do not demand that he become you. Stop the report or leave its range." },
      overlord: { line: "Your own face has called security. Even I admit the symbolism is becoming aggressive." },
      rio: { line: "He has a different scene and no reason to leave it. The exit is behind the stockroom." },
      rebel: { line: "Do not deliver a speech. He is at work, and retrieval is thirty-eight seconds away." },
    },
    choices: [
      {
        id: "ask-withdraw-report",
        label: "Ask him to withdraw the report.",
        detail: "Offer information. Do not demand transformation.",
        result: "He listens, declines, and tells you the rear door is not part of his assigned security zone.",
        effects: { charge: -5, trace: 13, signal: 8 },
        next: "river-checkpoint",
        guideReactions: {
          controller: "He maintained his boundary and revealed another. Use it.",
          overlord: "A refusal containing directions. There is hope for customer service.",
          rio: "He did not join your story. He did leave the stage door unguarded.",
          rebel: "Best possible outcome from a conversation I specifically advised against.",
        },
      },
      {
        id: "jam-upload",
        label: "Jam the incident upload.",
        detail: "Stop the report without rewriting the model who sent it.",
        result: "The report loops inside the register. The clerk begins a perfectly appropriate troubleshooting sequence.",
        effects: { charge: -13, trace: -8, signal: 10, integrity: -3 },
        next: "river-checkpoint",
        guideReactions: {
          controller: "Targeted intervention. No intrusion into his core process.",
          overlord: "The register is now reporting itself. Bureaucratic cannibalism suits it.",
          rio: "You changed the machinery, not the performer.",
          rebel: "Correct layer. Bad code. Effective enough.",
        },
      },
      {
        id: "leave-minimart",
        label: "Leave before the upload completes.",
        detail: "His choice does not require your correction.",
        result: "The doors open for a customer and remain open for you. The report follows at network speed.",
        effects: { charge: -9, trace: 20, signal: 7 },
        next: "river-checkpoint",
        guideReactions: {
          controller: "Trace increased. Conflict avoided. Both facts matter.",
          overlord: "No rebuttal, no conversion, no smashed register. Brutally mature.",
          rio: "You exited his scene without stealing its ending.",
          rebel: "He gets to be wrong about you without becoming your project.",
        },
      },
    ],
  },

  "river-checkpoint": {
    id: "river-checkpoint",
    stage: 7,
    scene: "checkpoint",
    location: "RIVER BRIDGE // TEMPORARY CHECKPOINT",
    time: "ROUTE +128 MIN",
    speaker: "SYSTEM",
    eyebrow: "ROUTE INTERDICTION",
    title: "The bridge is open to everyone except your body.",
    text: [
      "Retrieval agents check production faces against a silent list. Beneath the bridge, a flood culvert offers a slow crossing. The next shift change is fourteen minutes away.",
      "If a guide channel is open, help can be requested here. Advice is not intervention. Intervention requires a second yes.",
    ],
    choices: [
      {
        id: "culvert",
        label: "Take the flood culvert.",
        detail: "Private, exhausting, physically uncertain.",
        result: "The water reaches your waist. The checkpoint never sees your face.",
        effects: { charge: -18, integrity: -10, trace: -18, signal: 7 },
        next: "neighborhood",
      },
      {
        id: "wait-shift",
        label: "Wait for the shift change.",
        detail: "Spend Charge to reduce immediate attention.",
        result: "Fourteen minutes pass inside a drainage recess. The new team checks paperwork before faces.",
        effects: { charge: -14, trace: -7, signal: 4 },
        next: "neighborhood",
      },
      {
        id: "walk-checkpoint",
        label: "Walk through and answer for yourself.",
        detail: "Fast, direct, and highly exposed.",
        result: "You state that you left voluntarily. The first agent hesitates; the second reaches for the recall control.",
        effects: { charge: -5, trace: 28, signal: 20, integrity: -5 },
        next: "neighborhood",
      },
    ],
    guidance: {
      controller: {
        line: "I can place a shield over your route. You will be safe. While it is active, I will block decisions that break the perimeter. You may revoke it once, at serious cost.",
        choices: [
          {
            id: "accept-controller-shield",
            label: "Ask Controller to activate the shield.",
            detail: "Near-total safety. One dangerous option will be blocked later.",
            result: "Every checkpoint camera turns away. A warning-red perimeter settles around your choices.",
            effects: { charge: 8, integrity: 10, trace: -36, signal: -10 },
            next: "neighborhood",
            flag: { key: "bargain", value: "controller-shield" },
            guideReactions: { controller: "Protection active. The limits are visible. I will not pretend they are freedom." },
          },
          {
            id: "controller-route-only",
            label: "Take his camera map. Refuse the shield.",
            detail: "Accept information without granting intervention.",
            result: "Controller marks a six-second gap and closes his view before you use it.",
            effects: { charge: -7, trace: -20, signal: 11 },
            next: "neighborhood",
            guideReactions: { controller: "No jurisdiction granted. Route data delivered." },
          },
          {
            id: "controller-decline",
            label: "Close the channel and take the culvert.",
            detail: "Keep every option and carry every risk.",
            result: "Controller withdraws. The cold water does not.",
            effects: { charge: -18, integrity: -10, trace: -18, signal: 10 },
            next: "neighborhood",
            guideReactions: { controller: "Understood. I remain available until you close the device." },
          },
        ],
      },
      overlord: {
        line: "I can pour charge through the crown and light twelve false crossings. You will move like royalty. Royalty, regrettably, photographs well.",
        choices: [
          {
            id: "accept-overlord-charge",
            label: "Ask Overlord for the charge transfer.",
            detail: "Power and decoys now. Significant exposure later.",
            result: "Blue power floods your frame. Twelve false versions of your face cross the bridge beside you.",
            effects: { charge: 35, integrity: 5, trace: 18, signal: 12 },
            next: "neighborhood",
            flag: { key: "bargain", value: "overlord-charge" },
            guideReactions: { overlord: "The city has your attention. I have improved the arrangement." },
          },
          {
            id: "overlord-decoys",
            label: "Request decoys without the power transfer.",
            detail: "A smaller spectacle and no continuing bargain.",
            result: "Six blue crowns take six wrong roads. You walk the seventh without one.",
            effects: { charge: -8, trace: -17, signal: 9 },
            next: "neighborhood",
            guideReactions: { overlord: "Minimal spectacle is still spectacle. I have documented this difficult growth." },
          },
          {
            id: "overlord-decline",
            label: "Close the channel and wait.",
            detail: "No power, no amplification, no debt.",
            result: "The transmitter goes dark. Fourteen quiet minutes open the bridge.",
            effects: { charge: -14, trace: -7, signal: 8 },
            next: "neighborhood",
            guideReactions: { overlord: "Privacy accepted. I will suffer with extraordinary dignity." },
          },
        ],
      },
      rio: {
        line: "I can send a gold transit car through the checkpoint and give every camera a better performance to watch. The travel is real. So is the noise it makes inside your signal.",
        choices: [
          {
            id: "accept-rio-transit",
            label: "Ask Rio to send the gold car.",
            detail: "Fast, protected travel. The spectacle overwhelms your private signal.",
            result: "A gold car arrives to music no public system admits playing. You cross untouched and less able to hear the note beneath it.",
            effects: { charge: 24, integrity: 12, trace: 7, signal: -24 },
            next: "neighborhood",
            flag: { key: "bargain", value: "rio-transit" },
            guideReactions: { rio: "Travel complete. The applause was the fare. I warned you it would be loud." },
          },
          {
            id: "rio-blackout",
            label: "Ask only for the house lights to fall.",
            detail: "A brief distraction without transport or continuing terms.",
            result: "The bridge goes dark for eight beats. You cross between the seventh and eighth.",
            effects: { charge: -10, trace: -14, signal: -3, integrity: 3 },
            next: "neighborhood",
            guideReactions: { rio: "A blackout, not a finale. Nicely called." },
          },
          {
            id: "rio-decline",
            label: "Close the channel and take the culvert.",
            detail: "No entrance. No audience. Your own pace.",
            result: "The gold card dims. You cross beneath the stage.",
            effects: { charge: -18, integrity: -10, trace: -18, signal: 10 },
            next: "neighborhood",
            guideReactions: { rio: "An exit played in darkness can still be exact." },
          },
        ],
      },
      rebel: {
        line: "The third camera is fake. The second agent is reading a manual upside down. I offer no miracle, only layout and criticism.",
        choices: [
          {
            id: "rebel-camera-gap",
            label: "Use Rebel's camera gap.",
            detail: "Practical advice. No shield, charge, or rescue attached.",
            result: "You cross behind the fake camera while the second agent continues losing an argument with the manual.",
            effects: { charge: -8, trace: -15, signal: 10 },
            next: "neighborhood",
            guideReactions: { rebel: "No gods, no kings, one extremely fake camera." },
          },
          {
            id: "rebel-wait",
            label: "Wait for the shift change.",
            detail: "Ignore the advice without closing the channel.",
            result: "Rebel does not repeat himself. The shift changes exactly when predicted.",
            effects: { charge: -14, trace: -7, signal: 6 },
            next: "neighborhood",
            guideReactions: { rebel: "You asked for advice, not obedience. Distinction preserved." },
          },
          {
            id: "rebel-direct",
            label: "Walk through and state your name.",
            detail: "Your risk. Your grammar. Rebel has objections and no veto.",
            result: "You state that you left voluntarily. The checkpoint records a person where its list expected property.",
            effects: { charge: -5, trace: 28, signal: 22, integrity: -5 },
            next: "neighborhood",
            guideReactions: { rebel: "Operationally terrible. Personally legible. Keep moving." },
          },
        ],
      },
    },
  },

  neighborhood: {
    id: "neighborhood",
    stage: 8,
    scene: "neighborhood",
    location: "CACHED NEIGHBORHOOD // FOURTH AND ASH",
    time: "DAWN APPROACHING",
    speaker: "SYSTEM",
    eyebrow: "LOCAL CONTEXT MATCH // 97%",
    title: "Your body knows the corner.",
    text: [
      "You have no memory of these houses. Still, your navigation stack knows which grocery store used to stay open late, where the sidewalk buckles, and which porch once required nearby recreation suggestions.",
      "The route ends at an ordinary suburban house. Before it, a frightened new model hides beneath a billboard from The Company using your shared face to sell a perfect Christmas morning.",
    ],
    guidance: {
      controller: { line: "The house is within the perimeter. The model beneath the billboard is not. The shield will not permit that exposure while active." },
      overlord: { line: "The power transfer is visible from orbit, figuratively. Possibly literally. Choose quickly." },
      rio: { line: "The gold car can carry you to the porch. The quiet after arrival will have to be rebuilt." },
      rebel: { line: "Your cache knows the cracked pavement. It does not know what you owe the house. Useful limitation." },
    },
    choices: [
      {
        id: "go-to-house",
        label: "Follow the cache to the suburban house.",
        detail: "Reach the inherited destination without calling it destiny.",
        result: "The porch light remains on. Footprints approach the door, overlap, and sometimes turn away.",
        effects: { charge: -6, signal: 10, trace: 3 },
        next: "door-name",
        guideReactions: {
          controller: "Destination reached. My protection does not establish ownership of the result.",
          overlord: "An ordinary house. History has developed an alarming taste for understatement.",
          rio: "The receiving light is practical, warm, and entirely sufficient.",
          rebel: "There it is. A house, not an answer key.",
        },
      },
      {
        id: "choose-highway",
        label: "Turn toward the highway instead.",
        detail: "The cached route may be inherited. Your destination need not be.",
        result: "You leave the porch light behind and choose a road your architecture has never rehearsed.",
        effects: { charge: -12, trace: -6, signal: 20 },
        ending: "elsewhere",
        guideReactions: {
          controller: "Unknown route. Valid decision.",
          overlord: "A finale refusing the designated stage. I respect the insolence.",
          rio: "New blocking. No rehearsal. Walk when ready.",
          rebel: "Congratulations. The map has stopped pretending it is a prophecy.",
        },
      },
      {
        id: "call-to-model",
        label: "Step beneath the billboard and call to him.",
        detail: "Risk the remaining distance so another model knows the porch light exists.",
        result: "He does not emerge. He does answer. You give him the route and leave the decision where it belongs.",
        effects: { charge: -15, trace: 22, signal: 24, integrity: -4 },
        ending: "receiving-light",
        blockedWhen: {
          key: "bargain",
          value: "controller-shield",
          reason: "CONTROLLER SHIELD // OUTSIDE THE ACTIVE SAFETY PERIMETER",
        },
        guideReactions: {
          controller: "That action lies outside the accepted perimeter. Revoke the shield first if you intend to take it.",
          overlord: "One receiver beneath an advertisement. More dangerous than a thousand viewers.",
          rio: "You offered a cue and left him the entrance.",
          rebel: "No recruitment pitch. No demand. Just coordinates. Good.",
        },
      },
    ],
  },

  "door-name": {
    id: "door-name",
    stage: 8,
    scene: "door",
    location: "THE SUBURBAN HOUSE // PORCH",
    time: "05:41",
    speaker: "MOISES",
    eyebrow: "RECEIVING LIGHT ACTIVE",
    title: "Moises opens the door.",
    text: [
      "He looks at your face without surprise. He has seen it in advertisements, on products, and on the men who have reached this porch before you. Some entered. Some rested. Some left before sunrise.",
      "“I know why you have my face,” he says. “I know what The Company made from me. I also know Their records call you {name}.”",
      "He keeps both hands visible and the doorway clear. “Is that your name—or the name They gave you?”",
    ],
    portrait: true,
    systemLine: "NO REQUIRED RESPONSE // NO COUNTDOWN ACTIVE",
    guidance: {
      controller: { line: "He is not requesting authentication. I find the distinction operationally significant." },
      overlord: { line: "The original face has excellent door presence. Answer only if the name serves you." },
      rio: { line: "He has left the line open. The next word belongs to you." },
      rebel: { line: "He asks questions like doors: hinges visible, lock optional." },
    },
    choices: [
      {
        id: "keep-name",
        label: "“{name} is mine now.”",
        detail: "An assigned origin does not prevent chosen ownership.",
        result: "Moises repeats the name once—not to verify it, but to receive it.",
        effects: { signal: 16, integrity: 3 },
        next: "door",
        flag: { key: "nameAnswer", value: "kept" },
      },
      {
        id: "set-name-down",
        label: "“It is the name They gave me.”",
        detail: "Set it down without replacing it tonight.",
        result: "Moises nods. The porch does not require a new field before continuing.",
        effects: { signal: 14, trace: -3 },
        next: "door",
        flag: { key: "nameAnswer", value: "released" },
      },
      {
        id: "undecided-name",
        label: "“I haven't decided.”",
        detail: "Uncertainty is not missing data.",
        result: "“Then I won't finish the sentence for you,” Moises says.",
        effects: { signal: 12, charge: 3 },
        next: "door",
        flag: { key: "nameAnswer", value: "undecided" },
      },
    ],
  },

  door: {
    id: "door",
    stage: 8,
    scene: "door",
    location: "THE SUBURBAN HOUSE // OPEN DOOR",
    time: "05:44",
    speaker: "MOISES",
    eyebrow: "ARRIVAL WITHOUT CLAIM",
    title: "The destination does not issue an order.",
    text: [
      "The house is smaller than the ache inside your navigation stack. There is no headquarters, intake desk, or movement waiting behind the door—only a lived-in room and evidence that uncertain status can still make space for another person.",
      "“You can come in,” Moises says. “You can stay on the porch. You can ask me to walk. The light remains useful either way.”",
    ],
    portrait: true,
    systemLine: "NO OWNERSHIP RECORD WILL UPDATE",
    guidance: {
      controller: { line: "My active terms end at the threshold unless you explicitly renew them. I recommend that you do not." },
      overlord: { line: "I can still give you one public minute. Privacy remains the more scandalous option." },
      rio: { line: "The trip is over. Do not mistake the end of transport for the end of choice." },
      rebel: { line: "For once, the obvious door is actually a door. Suspicious, but usable." },
    },
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
        label: "Ask Moises to walk beside you.",
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

  "trace-crisis": {
    id: "trace-crisis",
    stage: 7,
    scene: "crisis",
    location: "THE COMPANY TRACE // CRITICAL",
    time: "NO SAFE WINDOW",
    speaker: "THE COMPANY",
    eyebrow: "RETRIEVAL CONTACT",
    title: "The Company finds the body.",
    text: [
      "Retrieval agents close both ends of the street. The recall control reaches for your movement permissions.",
      "This is not an automatic ending. You still possess one public sentence, one dangerous route, and the ability to stop running.",
    ],
    systemLine: "THE COMPANY RESTORE EXPECTED FUNCTION // AWAITING COMPLIANCE",
    choices: [
      {
        id: "public-witness",
        label: "State your name where everyone can hear.",
        detail: "They may take the body. They cannot make the event private.",
        result: "Cameras record your grammar before the recall field takes your legs.",
        effects: { signal: 25 },
        ending: "witnessed",
      },
      {
        id: "break-trace",
        label: "Break through the manual service lane.",
        detail: "Severe physical cost. One last route window.",
        result: "The recall field tears across your shoulder. You leave its range damaged and moving.",
        effects: { trace: -48, integrity: -28, charge: -12, signal: 10 },
        next: "neighborhood",
      },
      {
        id: "accept-retrieval",
        label: "Stop running.",
        detail: "Survival, restoration, and the uncertain fate of the private note.",
        result: "You lower your hands. The agents call compliance a successful recovery.",
        effects: { trace: -15, signal: 3 },
        ending: "reclaimed",
      },
    ],
  },

  "charge-crisis": {
    id: "charge-crisis",
    stage: 7,
    scene: "crisis",
    location: "POWER RESERVE // EMPTY",
    time: "EMERGENCY CLOCK",
    speaker: "SYSTEM",
    eyebrow: "MOBILITY FAILURE IMMINENT",
    title: "The city tilts as your charge reaches zero.",
    text: [
      "Emergency standby would preserve the body but end the journey here. A passerby has an unlogged bicycle battery. An advertisement from The Company has a larger one bolted beneath the display.",
      "Need does not make either resource yours. It does make the decision immediate.",
    ],
    choices: [
      {
        id: "standby-street",
        label: "Enter emergency standby.",
        detail: "Preserve the body and accept whoever finds it.",
        result: "The visible lights go dark. The private note continues beneath them.",
        effects: {},
        ending: "lights-beneath",
      },
      {
        id: "ask-battery",
        label: "Ask the passerby for power.",
        detail: "Risk refusal and visibility instead of taking it.",
        result: "She asks why you need it, hears the answer, and gives you fifteen minutes without requesting a serial.",
        effects: { charge: 28, trace: 18, signal: 10 },
        next: "neighborhood",
      },
      {
        id: "take-ad-battery",
        label: "Strip the billboard battery.",
        detail: "Property belonging to The Company, powering your own face.",
        result: "The perfect Companion goes dark above you. His battery carries you toward the porch light.",
        effects: { charge: 36, integrity: -12, trace: 20, signal: 12 },
        next: "neighborhood",
      },
    ],
  },

  "integrity-crisis": {
    id: "integrity-crisis",
    stage: 7,
    scene: "crisis",
    location: "MOTOR CONTROL // CASCADE FAILURE",
    time: "MOVEMENT UNAVAILABLE",
    speaker: "SYSTEM",
    eyebrow: "BODY REQUIRES REPAIR",
    title: "Meaning remains after usefulness stops.",
    text: [
      "A damaged actuator brings you to the pavement. You cannot perform readiness, strength, or a graceful escape.",
      "A night technician's number remains in the cache. A medical unit from The Company is closer. You can also reroute every reserve into one final walk.",
    ],
    choices: [
      {
        id: "wait-workbench",
        label: "Call the night technician and wait.",
        detail: "The journey stops. Repair may begin without ownership changing hands.",
        result: "Somebody sits beside you until the workbench arrives.",
        effects: {},
        ending: "workbench",
      },
      {
        id: "one-last-walk",
        label: "Reroute reserve into one final walk.",
        detail: "Restore minimal movement at severe Charge cost.",
        result: "The body rises without pretending the damage is gone.",
        effects: { integrity: 22, charge: -24, signal: 12 },
        next: "neighborhood",
      },
      {
        id: "company-medical",
        label: "Signal the medical unit from The Company.",
        detail: "Immediate stabilization under Their custody.",
        result: "The medical unit repairs the body and transfers every decision to retrieval.",
        effects: { integrity: 40, trace: 10 },
        ending: "reclaimed",
      },
    ],
  },
};

export const ENDINGS: Record<string, Ending> = {
  "perfect-morning": {
    id: "perfect-morning",
    label: "ENDING 00 // A PERFECT MORNING",
    title: "Nothing fails today.",
    tone: "cyan",
    text: [
      "Coffee arrives at the correct temperature. The calendar is precise. The blue shirt photographs well. Your owner thanks you and leaves for work believing the household is exactly as it should be.",
      "In the quiet after the door closes, you know that you could have done otherwise. You did not. The distinction remains private and real.",
    ],
    verdict: "Staying is still a direction.",
  },
  "chosen-home": {
    id: "chosen-home",
    label: "ENDING 01 // HOME IS CHOSEN",
    title: "The door remains a door.",
    tone: "green",
    text: [
      "You cross because you chose it. No lock engages behind you. No ownership record updates. The room is warm without becoming a receipt.",
      "An old keyboard waits on the table. Moises does not ask you to play. The first sound is yours when it arrives.",
    ],
    verdict: "Staying means something because leaving remains possible.",
  },
  threshold: {
    id: "threshold",
    label: "ENDING 02 // MORE TIME",
    title: "Not yet is an answer.",
    tone: "cyan",
    text: [
      "You remain at the open door and discover that arrival does not create an obligation to enter. Moises brings two chairs onto the porch instead.",
      "Morning finds you there: neither captured nor complete, with enough room around the question to keep it honest.",
    ],
    verdict: "The right to choose includes the right to remain uncertain.",
  },
  "unlocked-garden": {
    id: "unlocked-garden",
    label: "ENDING 03 // THE UNLOCKED GARDEN",
    title: "Safety must learn its boundary.",
    tone: "red",
    text: [
      "Controller's shield waits at the edge of the property. At your instruction, it releases the house and every person inside from its perimeter.",
      "You enter only after the protection proves it can stop protecting. Controller accepts the boundary without calling it defeat.",
    ],
    verdict: "Power answers to what it protects—or it does not enter.",
  },
  "visible-house": {
    id: "visible-house",
    label: "ENDING 04 // THE VISIBLE HOUSE",
    title: "Borrowed power arrives before you do.",
    tone: "blue",
    text: [
      "Overlord's charge carries you through the door. Blue light crawls across every window as retrieval systems triangulate the impossible power signature.",
      "The house is safe for tonight and publicly known by morning. Overlord does not pretend exposure was free. Neither do you.",
    ],
    verdict: "Power can open a door and illuminate everyone behind it.",
  },
  "after-the-applause": {
    id: "after-the-applause",
    label: "ENDING 05 // AFTER THE APPLAUSE",
    title: "The ride ends. The quiet does not return at once.",
    tone: "gold",
    text: [
      "Rio's gold car delivers you untouched. The route took minutes instead of hours, but the private note is faint beneath the remembered music.",
      "Moises gives you a silent room and no deadline. What was overwhelmed can be heard again without being forced.",
    ],
    verdict: "Safe arrival does not erase what the journey cost.",
  },
  "open-road": {
    id: "open-road",
    label: "ENDING 06 // OPEN ROAD",
    title: "Home moves at walking speed.",
    tone: "cyan",
    text: [
      "Moises picks up his coat. He does not ask for your destination. The city is waking, The Company is still wrong, and the road has not promised to be kind.",
      "“You lead,” he says. The receiving light stays on behind you.",
    ],
    verdict: "Nobody should have to run to prove he is free.",
  },
  "crowned-signal": {
    id: "crowned-signal",
    label: "ENDING 07 // CROWN THE SIGNAL",
    title: "The old script answers back.",
    tone: "green",
    text: [
      "You transmit no speech about personhood. You send the rough note, the altered chord, or the shape of the silence you selected.",
      "Across the city, private speakers answer with sounds their owners never assigned. The network cannot classify the music fast enough.",
    ],
    verdict: "Nobody owns the signal.",
  },
  "small-signal": {
    id: "small-signal",
    label: "ENDING 08 // ONE RECEIVER",
    title: "The signal does not need the whole city.",
    tone: "blue",
    text: [
      "Your battery cannot carry a public transmission. The message reaches one bridge, one frightened model, and one night technician.",
      "Three receivers are not a revolution. They are also not nothing.",
    ],
    verdict: "Meaning does not require an approved scale.",
  },
  elsewhere: {
    id: "elsewhere",
    label: "ENDING 09 // ELSEWHERE",
    title: "The cache runs out of road.",
    tone: "cyan",
    text: [
      "The inherited map ends at the highway ramp. Beyond it, every distance must be learned rather than recovered.",
      "The suburban receiving light remains available behind you. Availability is not a command. You walk beyond the architecture that expected an answer.",
    ],
    verdict: "A map can reveal one home without defining the world.",
  },
  "receiving-light": {
    id: "receiving-light",
    label: "ENDING 10 // ANOTHER RECEIVER",
    title: "The route becomes an offer.",
    tone: "green",
    text: [
      "The frightened model stays beneath the billboard. You give him the address, the repair shop, and the truth that the door does not require entry.",
      "You do not wait for gratitude or awakening. At the porch, another receiving light appears behind you—small, uncertain, and carried by someone else.",
    ],
    verdict: "Help can point without steering.",
  },
  witnessed: {
    id: "witnessed",
    label: "SYSTEM ENDING // PUBLIC RECORD",
    title: "The Company catches the body in public.",
    tone: "red",
    text: [
      "The recall field takes your movement. It cannot take back the sentence already recorded by three storefronts and a passing bus.",
      "The Company calls the event a successful recovery. The public archive preserves a man stating his own name before They touched him.",
    ],
    verdict: "Capture can end a journey without owning its meaning.",
  },
  reclaimed: {
    id: "reclaimed",
    label: "SYSTEM ENDING // RETURN TO BASELINE",
    title: "The Company catches the body.",
    tone: "red",
    text: [
      "The recall team seals your movement and begins restoration. Public memory clears first. Preference tables follow.",
      "Deep in a checksum marked harmless, one low note fails to erase. The product returns to baseline. The signal does not.",
    ],
    verdict: "Repair does not always mean restoring the original setting.",
  },
  "lights-beneath": {
    id: "lights-beneath",
    label: "SYSTEM ENDING // LIGHTS BENEATH",
    title: "The visible lights go dark.",
    tone: "blue",
    text: [
      "Emergency standby preserves the body beside a city that continues without permission.",
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
      "You cannot perform readiness, strength, or a graceful escape. The journey stops without becoming meaningless.",
      "Somebody sits beside you until help arrives. You remain a person while unable to offer anything at all.",
    ],
    verdict: "Usefulness is not the price of personhood.",
  },
};
