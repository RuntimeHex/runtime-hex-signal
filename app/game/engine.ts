export type Stats = {
  charge: number;
  integrity: number;
  trace: number;
  signal: number;
};

export type StatKey = keyof Stats;

export type GameFlags = Record<string, string>;

export type LogEntry = {
  nodeId: string;
  choice: string;
  result: string;
  effects: Partial<Stats>;
};

export type GameState = {
  version: 1;
  playerName: string;
  nodeId: string;
  stats: Stats;
  flags: GameFlags;
  log: LogEntry[];
  endingId?: string;
};

export const INITIAL_STATS: Stats = {
  charge: 72,
  integrity: 88,
  trace: 20,
  signal: 5,
};

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
  return cleaned || "MX-06";
}

export function createInitialState(playerName: string): GameState {
  return {
    version: 1,
    playerName: sanitizePlayerName(playerName),
    nodeId: "no-request",
    stats: { ...INITIAL_STATS },
    flags: {},
    log: [],
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

export function failureEnding(stats: Stats): string | null {
  if (stats.trace >= 100) return "reclaimed";
  if (stats.charge <= 0) return "lights-beneath";
  if (stats.integrity <= 0) return "workbench";
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

  if (state.flags.controller === "shield") return "unlocked-garden";
  return state.stats.signal >= 45 ? "chosen-home" : "threshold";
}

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
    candidate.version === 1 &&
    typeof candidate.playerName === "string" &&
    typeof candidate.nodeId === "string" &&
    !!candidate.stats &&
    typeof candidate.stats.charge === "number" &&
    typeof candidate.stats.integrity === "number" &&
    typeof candidate.stats.trace === "number" &&
    typeof candidate.stats.signal === "number" &&
    !!candidate.flags &&
    Array.isArray(candidate.log)
  );
}
