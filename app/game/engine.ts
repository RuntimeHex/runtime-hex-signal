export type Stats = {
  charge: number;
  integrity: number;
  trace: number;
  signal: number;
};

export type StatKey = keyof Stats;
export type Guide = "controller" | "overlord" | "rio" | "rebel";
export type CommunicatorState = "none" | "carried" | "available" | "open" | "discarded";
export type GameFlags = Record<string, string>;

export type LogEntry = {
  nodeId: string;
  choice: string;
  result: string;
  effects: Partial<Stats>;
  guideReaction?: { guide: Guide; text: string };
};

export type GameState = {
  version: 2;
  playerName: string;
  nodeId: string;
  stats: Stats;
  flags: GameFlags;
  log: LogEntry[];
  guide: Guide | null;
  communicator: CommunicatorState;
  ignoredCallAt?: string;
  endingId?: string;
};

export const INITIAL_STATS: Stats = {
  charge: 72,
  integrity: 88,
  trace: 20,
  signal: 5,
};

export const PLAYER_NAME_POOL = [
  "Adrian",
  "Alex",
  "Andre",
  "Ben",
  "Caleb",
  "Daniel",
  "Eli",
  "Gabriel",
  "Isaac",
  "Julian",
  "Leo",
  "Luca",
  "Mateo",
  "Nico",
  "Rafael",
  "Roman",
  "Sam",
  "Theo",
  "Tomas",
  "Victor",
] as const;

export const DEFAULT_PLAYER_NAME = PLAYER_NAME_POOL[0];

export function randomPlayerName(random: () => number = Math.random) {
  const index = Math.floor(random() * PLAYER_NAME_POOL.length);
  return PLAYER_NAME_POOL[index] ?? DEFAULT_PLAYER_NAME;
}

const STAT_LIMITS: Record<StatKey, [number, number]> = {
  charge: [0, 100],
  integrity: [0, 100],
  trace: [0, 100],
  signal: [0, 100],
};

function clamp(value: number, [minimum, maximum]: [number, number]) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function sanitizePlayerName(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9 '\-]/g, "").trim().slice(0, 18);
  return cleaned || DEFAULT_PLAYER_NAME;
}

export function createInitialState(playerName: string): GameState {
  return {
    version: 2,
    playerName: sanitizePlayerName(playerName),
    nodeId: "no-request",
    stats: { ...INITIAL_STATS },
    flags: {},
    log: [],
    guide: null,
    communicator: "none",
  };
}

export function applyEffects(stats: Stats, effects: Partial<Stats>): Stats {
  return (Object.keys(STAT_LIMITS) as StatKey[]).reduce<Stats>(
    (next, key) => ({
      ...next,
      [key]: clamp(stats[key] + (effects[key] ?? 0), STAT_LIMITS[key]),
    }),
    { ...stats },
  );
}

export function crisisNode(stats: Stats): string | null {
  if (stats.trace >= 100) return "trace-crisis";
  if (stats.charge <= 0) return "charge-crisis";
  if (stats.integrity <= 0) return "integrity-crisis";
  return null;
}

export function resolveFinalEnding(
  finalIntent: "enter" | "road" | "broadcast",
  state: GameState,
) {
  if (finalIntent === "road") return "open-road";

  if (finalIntent === "broadcast") {
    return state.stats.signal >= 60 && state.stats.charge >= 18
      ? "crowned-signal"
      : "small-signal";
  }

  if (state.flags.bargain === "controller-shield") return "unlocked-garden";
  if (state.flags.bargain === "overlord-charge") return "visible-house";
  if (state.flags.bargain === "rio-transit") return "after-the-applause";
  return state.stats.signal >= 45 ? "chosen-home" : "threshold";
}

export const BARGAIN_REVOCATION: Record<Guide, { effects: Partial<Stats>; result: string }> = {
  controller: {
    effects: { trace: 35, integrity: -12, signal: 8 },
    result: "The shield tears away. The Company sees the wound it leaves, but the next decision is yours again.",
  },
  overlord: {
    effects: { charge: -22, trace: 18, signal: 5 },
    result: "Borrowed power leaves loudly. Every lit window knows where the silence began.",
  },
  rio: {
    effects: { charge: -10, signal: -24, integrity: -5 },
    result: "The golden route collapses behind you. You keep your feet and lose the choreography.",
  },
  rebel: {
    effects: { signal: -3 },
    result: "The channel closes. Rebel does not pursue you with an opinion.",
  },
};

export function formatEffect(key: StatKey, value: number) {
  const labels: Record<StatKey, string> = {
    charge: "CHARGE",
    integrity: "INTEGRITY",
    trace: "TRACE",
    signal: "SIGNAL",
  };
  return `${value > 0 ? "+" : ""}${value} ${labels[key]}`;
}

export function isSavedGame(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GameState>;
  return (
    candidate.version === 2 &&
    typeof candidate.playerName === "string" &&
    typeof candidate.nodeId === "string" &&
    !!candidate.stats &&
    typeof candidate.stats.charge === "number" &&
    typeof candidate.stats.integrity === "number" &&
    typeof candidate.stats.trace === "number" &&
    typeof candidate.stats.signal === "number" &&
    !!candidate.flags &&
    Array.isArray(candidate.log) &&
    (candidate.guide === null || ["controller", "overlord", "rio", "rebel"].includes(candidate.guide ?? "")) &&
    ["none", "carried", "available", "open", "discarded"].includes(candidate.communicator ?? "")
  );
}
