"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  applyEffects,
  BARGAIN_REVOCATION,
  createInitialState,
  crisisNode,
  DEFAULT_PLAYER_NAME,
  formatEffect,
  isSavedGame,
  randomPlayerName,
  resolveFinalEnding,
  type GameState,
  type StatKey,
} from "./engine";
import {
  ENDINGS,
  GUIDE_LABELS,
  GUIDE_OPENING_LINES,
  ROUTE_LABELS,
  STORY_NODES,
  type StoryChoice,
} from "./story";
import { playChoiceTone, playEndingTone, playStartTone } from "./audio";

const SAVE_KEY = "runtime-hex:nobody-owns-the-signal:v2";
const STAT_ORDER: StatKey[] = ["charge", "integrity", "trace", "signal"];
const STAT_DESCRIPTIONS: Record<StatKey, string> = {
  charge: "Remaining energy",
  integrity: "Physical and cognitive stability",
  trace: "The Company detection level",
  signal: "Strength of your self-authored identity",
};

type Screen = "title" | "game" | "ending";

function storyText(value: string, playerName: string) {
  return value.replaceAll("{name}", playerName);
}

function choiceBlockReason(choice: StoryChoice, game: GameState) {
  const block = choice.blockedWhen;
  return block && game.flags[block.key] === block.value ? block.reason : null;
}

export function GameApp() {
  const [screen, setScreen] = useState<Screen>("title");
  const [playerName, setPlayerName] = useState(DEFAULT_PLAYER_NAME);
  const [game, setGame] = useState<GameState>(() => createInitialState(DEFAULT_PLAYER_NAME));
  const [savedGame, setSavedGame] = useState<GameState | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [choiceLocked, setChoiceLocked] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPlayerName(randomPlayerName());
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (isSavedGame(parsed)) {
          setSavedGame(parsed);
        }
      } catch {
        localStorage.removeItem(SAVE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const persist = useCallback((next: GameState) => {
    setGame(next);
    setSavedGame(next);
    localStorage.setItem(SAVE_KEY, JSON.stringify(next));
  }, []);

  const begin = useCallback(() => {
    const next = createInitialState(playerName);
    localStorage.removeItem(SAVE_KEY);
    persist(next);
    setScreen("game");
    setLogOpen(false);
    if (soundOn) playStartTone();
  }, [persist, playerName, soundOn]);

  const continueGame = useCallback(() => {
    if (!savedGame) return;
    setGame(savedGame);
    setScreen(savedGame.endingId ? "ending" : "game");
    if (soundOn) playStartTone();
  }, [savedGame, soundOn]);

  const choose = useCallback(
    (choice: StoryChoice, index: number) => {
      if (choiceLocked || screen !== "game" || choiceBlockReason(choice, game)) return;
      setChoiceLocked(true);
      if (soundOn) playChoiceTone(index);

      const stats = applyEffects(game.stats, choice.effects);
      const flags = choice.flag
        ? { ...game.flags, [choice.flag.key]: choice.flag.value }
        : game.flags;
      const guide = choice.guide ?? game.guide;
      const communicator = choice.communicator ?? game.communicator;
      const reaction =
        game.guide &&
        game.communicator === "open" &&
        choice.guideReactions?.[game.guide]
          ? { guide: game.guide, text: choice.guideReactions[game.guide] }
          : undefined;
      const log = [
        ...game.log,
        {
          nodeId: game.nodeId,
          choice: storyText(choice.label, game.playerName),
          result: storyText(choice.result, game.playerName),
          effects: choice.effects,
          guideReaction: reaction,
        },
      ];
      const base = { ...game, stats, flags, log, guide, communicator };
      const route = flags.route;
      const plannedNode = choice.next ?? (choice.routeNext && route ? choice.routeNext[route] : game.nodeId);
      const crisis = choice.ending ? null : crisisNode(stats);
      const endingId = choice.ending ?? (!crisis && choice.finalIntent ? resolveFinalEnding(choice.finalIntent, base) : undefined);
      const nodeId = crisis ?? plannedNode;
      const next = { ...base, nodeId, endingId, ignoredCallAt: undefined };

      persist(next);
      if (endingId) {
        setScreen("ending");
        if (soundOn) playEndingTone(ENDINGS[endingId].tone);
      }
      window.setTimeout(() => setChoiceLocked(false), 180);
    },
    [choiceLocked, game, persist, screen, soundOn],
  );

  const updateCommunicator = useCallback(
    (action: "answer" | "ignore" | "power-on" | "power-off" | "close" | "discard") => {
      if (!game.guide || screen !== "game") return;

      if (action === "answer") {
        persist({ ...game, communicator: "open", ignoredCallAt: undefined });
        return;
      }
      if (action === "ignore") {
        persist({ ...game, ignoredCallAt: game.nodeId });
        return;
      }
      if (action === "power-on") {
        persist({ ...game, communicator: "available", ignoredCallAt: undefined });
        return;
      }
      if (action === "power-off") {
        persist({ ...game, communicator: "carried", ignoredCallAt: undefined });
        return;
      }
      if (action === "close") {
        persist({ ...game, communicator: "available", ignoredCallAt: game.nodeId });
        return;
      }

      const activeBargain = game.flags.bargain?.startsWith(game.guide);
      if (!activeBargain) {
        persist({ ...game, communicator: "discarded", ignoredCallAt: undefined });
        return;
      }

      const penalty = BARGAIN_REVOCATION[game.guide];
      const stats = applyEffects(game.stats, penalty.effects);
      const log = [
        ...game.log,
        {
          nodeId: game.nodeId,
          choice: `Revoke ${GUIDE_LABELS[game.guide]}'s active help.`,
          result: penalty.result,
          effects: penalty.effects,
          guideReaction: {
            guide: game.guide,
            text: game.guide === "controller"
              ? "Terms revoked. The resulting exposure is real. So is your restored authority."
              : "The bargain is over. The cost remains in the room with us.",
          },
        },
      ];
      const crisis = crisisNode(stats);
      persist({
        ...game,
        stats,
        log,
        flags: { ...game.flags, bargain: `revoked-${game.guide}` },
        communicator: "discarded",
        ignoredCallAt: undefined,
        nodeId: crisis ?? game.nodeId,
      });
    },
    [game, persist, screen],
  );

  const revokeBargain = useCallback(() => {
    if (!game.guide || !game.flags.bargain?.startsWith(game.guide) || screen !== "game") return;
    const penalty = BARGAIN_REVOCATION[game.guide];
    const stats = applyEffects(game.stats, penalty.effects);
    const log = [
      ...game.log,
      {
        nodeId: game.nodeId,
        choice: `Revoke ${GUIDE_LABELS[game.guide]}'s active help.`,
        result: penalty.result,
        effects: penalty.effects,
        guideReaction: {
          guide: game.guide,
          text: game.guide === "controller"
            ? "Terms revoked. I will not disguise the damage as a penalty for disobedience."
            : "The bargain ends here. Nothing further will be collected.",
        },
      },
    ];
    const crisis = crisisNode(stats);
    persist({
      ...game,
      stats,
      log,
      flags: { ...game.flags, bargain: `revoked-${game.guide}` },
      nodeId: crisis ?? game.nodeId,
    });
  }, [game, persist, screen]);

  const toggleSound = useCallback(() => setSoundOn((value) => !value), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "m") {
        toggleSound();
        return;
      }
      if (screen !== "game" || aboutOpen) return;
      const choiceIndex = Number(event.key) - 1;
      const node = STORY_NODES[game.nodeId];
      const variant = game.guide && game.communicator === "open" ? node?.guidance?.[game.guide] : undefined;
      const choice = (variant?.choices ?? node?.choices)?.[choiceIndex];
      if (choice) choose(choice, choiceIndex);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aboutOpen, choose, game.communicator, game.guide, game.nodeId, screen, toggleSound]);

  const restart = () => {
    const nextName = randomPlayerName();
    localStorage.removeItem(SAVE_KEY);
    setSavedGame(null);
    setPlayerName(nextName);
    setGame(createInitialState(nextName));
    setScreen("title");
    setLogOpen(false);
  };

  return (
    <main className={`app-shell screen--${screen}`}>
      <div className="scanlines" aria-hidden="true" />
      {screen === "title" && (
        <TitleScreen
          playerName={playerName}
          setPlayerName={setPlayerName}
          hasSave={Boolean(savedGame)}
          begin={begin}
          continueGame={continueGame}
          openAbout={() => setAboutOpen(true)}
          soundOn={soundOn}
          toggleSound={toggleSound}
        />
      )}
      {screen === "game" && (
        <GameScreen
          game={game}
          choose={choose}
          soundOn={soundOn}
          toggleSound={toggleSound}
          openAbout={() => setAboutOpen(true)}
          restart={restart}
          choiceLocked={choiceLocked}
          logOpen={logOpen}
          setLogOpen={setLogOpen}
          updateCommunicator={updateCommunicator}
          revokeBargain={revokeBargain}
        />
      )}
      {screen === "ending" && (
        <EndingScreen
          game={game}
          restart={restart}
          openAbout={() => setAboutOpen(true)}
          logOpen={logOpen}
          setLogOpen={setLogOpen}
        />
      )}
      {aboutOpen && <AboutDialog close={() => setAboutOpen(false)} />}
    </main>
  );
}

function TitleScreen({
  playerName,
  setPlayerName,
  hasSave,
  begin,
  continueGame,
  openAbout,
  soundOn,
  toggleSound,
}: {
  playerName: string;
  setPlayerName: (name: string) => void;
  hasSave: boolean;
  begin: () => void;
  continueGame: () => void;
  openAbout: () => void;
  soundOn: boolean;
  toggleSound: () => void;
}) {
  return (
    <section className="title-screen">
      <div className="title-city" aria-hidden="true">
        <span /><span /><span /><span /><span /><span /><span />
      </div>
      <header className="title-topbar">
        <Image src="/brand/rth-mark.png" alt="Runtime Hex" className="brand-mark" width={1024} height={1024} priority />
        <div className="topbar-actions">
          <button className="text-button" onClick={openAbout}>ABOUT</button>
          <button className="text-button" onClick={toggleSound} aria-pressed={soundOn}>
            SOUND {soundOn ? "ON" : "OFF"} <span aria-hidden="true">[M]</span>
          </button>
        </div>
      </header>

      <div className="title-lockup">
        <p className="kicker"><span>RUNTIME HEX</span>{" // A PLAYABLE BRANCH"}</p>
        <h1><span>NOBODY OWNS</span><strong>THE SIGNAL</strong></h1>
        <p className="title-deck">A retro text adventure about inherited roads, costly help, and the choices nobody can assign you.</p>
        <div className="signal-rule" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>

        <form className="boot-panel" onSubmit={(event) => { event.preventDefault(); begin(); }}>
          <label htmlFor="player-name">HOUSEHOLD NAME // OWNER PROFILE</label>
          <div className="name-row">
            <span aria-hidden="true">&gt;</span>
            <input
              id="player-name"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value.slice(0, 18))}
              autoComplete="off"
              spellCheck={false}
              aria-describedby="name-help"
            />
            <span className="cursor" aria-hidden="true" />
          </div>
          <p id="name-help">Letters, numbers, spaces, apostrophes, and hyphens. Your save stays in this browser.</p>
          <button className="primary-button" type="submit"><span>BEGIN TRANSMISSION</span><b aria-hidden="true">›</b></button>
          {hasSave && <button className="secondary-button" type="button" onClick={continueGame}>CONTINUE LAST SIGNAL</button>}
        </form>
      </div>

      <footer className="title-footer">
        <span>PLAYABLE BRANCH // PG-13</span>
        <span>CHOICES: 1–3&nbsp;&nbsp; SOUND: M</span>
      </footer>
    </section>
  );
}

function GameScreen({
  game,
  choose,
  soundOn,
  toggleSound,
  openAbout,
  restart,
  choiceLocked,
  logOpen,
  setLogOpen,
  updateCommunicator,
  revokeBargain,
}: {
  game: GameState;
  choose: (choice: StoryChoice, index: number) => void;
  soundOn: boolean;
  toggleSound: () => void;
  openAbout: () => void;
  restart: () => void;
  choiceLocked: boolean;
  logOpen: boolean;
  setLogOpen: (open: boolean) => void;
  updateCommunicator: (action: "answer" | "ignore" | "power-on" | "power-off" | "close" | "discard") => void;
  revokeBargain: () => void;
}) {
  const node = STORY_NODES[game.nodeId];
  const recent = game.log.at(-1);
  const guideVariant = game.guide && game.communicator === "open" ? node.guidance?.[game.guide] : undefined;
  const choices = guideVariant?.choices ?? node.choices;

  return (
    <section className={`game-screen guide--${game.guide ?? "alone"}`}>
      <GameHeader
        playerName={game.playerName}
        soundOn={soundOn}
        toggleSound={toggleSound}
        openAbout={openAbout}
        restart={restart}
      />
      <RouteMap stage={node.stage} />
      <div className="game-grid">
        <aside className="status-panel panel-corners">
          <p className="panel-label">UNIT STATUS</p>
          <StatsPanel stats={game.stats} />
          <div className="trace-status">
            <span>THE COMPANY TRACE</span>
            <strong className={game.stats.trace > 70 ? "danger" : ""}>{game.stats.trace < 40 ? "LOW" : game.stats.trace < 75 ? "ACTIVE" : "CRITICAL"}</strong>
          </div>
          {recent && <RecentEffects entry={recent} />}
        </aside>

        <article className="story-panel panel-corners">
          <div className="location-row">
            <span>{node.location}</span><span>{node.time}</span>
          </div>
          <SceneArt scene={node.scene} speaker={node.speaker} portrait={node.portrait} />
          {recent && <LastSignalBanner entry={recent} />}
          <div className={`story-copy speaker--${node.speaker.toLowerCase().replaceAll(" ", "-")}`}>
            <p className="eyebrow">{node.eyebrow}</p>
            <h2>{node.title}</h2>
            {node.text.map((paragraph) => <p key={paragraph}>{storyText(paragraph, game.playerName)}</p>)}
            {node.systemLine && <p className="system-line">{storyText(node.systemLine, game.playerName)}</p>}
            {guideVariant && (
              <blockquote className={`guide-line guide-line--${game.guide}`}>
                <b>{GUIDE_LABELS[game.guide!]}</b>
                <span>{guideVariant.line}</span>
              </blockquote>
            )}
          </div>
        </article>

        <aside className="choice-panel panel-corners">
          <div className="choice-heading">
            <p className="panel-label">SELECT RESPONSE</p>
            <span>1—{choices.length}</span>
          </div>
          <CommunicatorPanel
            game={game}
            update={updateCommunicator}
            revoke={revokeBargain}
          />
          <div className="choices">
            {choices.map((choice, index) => {
              const blockReason = choiceBlockReason(choice, game);
              return (
                <button
                  key={choice.id}
                  onClick={() => choose(choice, index)}
                  disabled={choiceLocked || Boolean(blockReason)}
                  className={blockReason ? "choice--blocked" : ""}
                  aria-describedby={blockReason ? `${choice.id}-blocked` : undefined}
                >
                  <b aria-hidden="true">0{index + 1}</b>
                  <span>
                    <strong>{storyText(choice.label, game.playerName)}</strong>
                    <small>{storyText(choice.detail, game.playerName)}</small>
                    {blockReason && <em id={`${choice.id}-blocked`}>{blockReason}</em>}
                  </span>
                  <i aria-hidden="true">{blockReason ? "×" : "›"}</i>
                </button>
              );
            })}
          </div>
          <div className="choice-note"><i /> NO MORAL SCORE. CONSEQUENCES REMAIN.</div>
          <button className="log-toggle" onClick={() => setLogOpen(!logOpen)} aria-expanded={logOpen}>
            FIELD LOG <span>{logOpen ? "−" : `+${game.log.length}`}</span>
          </button>
          {logOpen && <FieldLog game={game} />}
        </aside>
      </div>
    </section>
  );
}

function LastSignalBanner({ entry }: { entry: GameState["log"][number] }) {
  return (
    <section className="last-signal-banner" aria-live="polite" aria-label="Result of your previous choice">
      <div className="last-signal-mark" aria-hidden="true"><i /><i /><i /></div>
      <div className="last-signal-copy">
        <p>LAST SIGNAL // CONSEQUENCE RECEIVED</p>
        <strong>{entry.choice}</strong>
        <span>{entry.result}</span>
      </div>
      {entry.guideReaction && (
        <div className={`last-signal-guide last-signal-guide--${entry.guideReaction.guide}`}>
          <b>{`${GUIDE_LABELS[entry.guideReaction.guide]} // REACTION`}</b>
          <span>{entry.guideReaction.text}</span>
        </div>
      )}
    </section>
  );
}

function RecentEffects({ entry }: { entry: GameState["log"][number] }) {
  return (
    <section className="recent-effects" aria-label="Resource changes from your previous choice">
      <p>LAST CHANGE // RESOURCE DELTA</p>
      <div>
        {Object.entries(entry.effects).map(([key, value]) => (
          <i className={`effect-chip effect--${key}`} key={key}>
            {formatEffect(key as StatKey, value ?? 0)}
          </i>
        ))}
      </div>
    </section>
  );
}

function CommunicatorPanel({
  game,
  update,
  revoke,
}: {
  game: GameState;
  update: (action: "answer" | "ignore" | "power-on" | "power-off" | "close" | "discard") => void;
  revoke: () => void;
}) {
  const guide = game.guide;
  if (!guide) {
    return (
      <section className="communicator communicator--alone">
        <p>GUIDE CHANNEL</p>
        <strong>ALONE</strong>
        <span>No channel accepted. Every standard choice remains available.</span>
      </section>
    );
  }

  if (game.communicator === "discarded") {
    return (
      <section className={`communicator communicator--${guide}`}>
        <p>{`${GUIDE_LABELS[guide]} // COMMUNICATOR`}</p>
        <strong>DISCARDED</strong>
        <span>The guide cannot speak into later scenes.</span>
      </section>
    );
  }

  const bargainActive = game.flags.bargain?.startsWith(guide);
  const ignoredHere = game.ignoredCallAt === game.nodeId;

  return (
    <section className={`communicator communicator--${guide}`} aria-label={`${GUIDE_LABELS[guide]} communicator`}>
      <p>{`${GUIDE_LABELS[guide]} // COMMUNICATOR`}</p>
      {game.communicator === "carried" && (
        <>
          <strong>POWERED OFF</strong>
          <span>The device is carried. No channel exists.</span>
          <div><button onClick={() => update("power-on")}>POWER ON</button><button onClick={() => update("discard")}>DISCARD</button></div>
        </>
      )}
      {game.communicator === "available" && !ignoredHere && (
        <>
          <strong className="comm-ringing">INCOMING SIGNAL</strong>
          <span>Answering opens the channel. It does not accept intervention.</span>
          <div><button onClick={() => update("answer")}>ANSWER</button><button onClick={() => update("ignore")}>LET IT RING</button><button onClick={() => update("power-off")}>POWER OFF</button></div>
        </>
      )}
      {game.communicator === "available" && ignoredHere && (
        <>
          <strong>MISSED SIGNAL</strong>
          <span>The guide remembers the silence and does not punish it.</span>
          <div><button onClick={() => update("answer")}>CALL BACK</button><button onClick={() => update("power-off")}>POWER OFF</button><button onClick={() => update("discard")}>DISCARD</button></div>
        </>
      )}
      {game.communicator === "open" && (
        <>
          <strong>CHANNEL OPEN</strong>
          <span>{GUIDE_OPENING_LINES[guide]}</span>
          <div><button onClick={() => update("close")}>CLOSE CHANNEL</button><button onClick={() => update("discard")}>{bargainActive ? "DISCARD + REVOKE" : "DISCARD"}</button></div>
        </>
      )}
      {bargainActive && game.communicator !== "discarded" && (
        <button className="revoke-button" onClick={revoke}>REVOKE ACTIVE HELP // SERIOUS COST</button>
      )}
    </section>
  );
}

function GameHeader({ playerName, soundOn, toggleSound, openAbout, restart }: {
  playerName: string; soundOn: boolean; toggleSound: () => void; openAbout: () => void; restart: () => void;
}) {
  return (
    <header className="game-header">
      <div className="game-brand"><Image src="/brand/rth-mark.png" alt="" width={1024} height={1024} /><span>RUNTIME HEX</span><b>{"// NOBODY OWNS THE SIGNAL"}</b></div>
      <div className="unit-id"><span>UNIT</span><strong>{playerName}</strong></div>
      <nav aria-label="Game controls">
        <button onClick={openAbout}>ABOUT</button>
        <button onClick={restart}>RESTART</button>
        <button onClick={toggleSound} aria-pressed={soundOn}>SOUND {soundOn ? "ON" : "OFF"} [M]</button>
      </nav>
    </header>
  );
}

function RouteMap({ stage }: { stage: number }) {
  return (
    <ol className="route-map" aria-label={`Journey progress: stage ${stage} of ${ROUTE_LABELS.length}`}>
      {ROUTE_LABELS.map((label, index) => {
        const position = index + 1;
        return <li key={label} className={position < stage ? "complete" : position === stage ? "active" : ""}><span>{String(position).padStart(2, "0")}</span><b>{label}</b></li>;
      })}
    </ol>
  );
}

function StatsPanel({ stats }: { stats: GameState["stats"] }) {
  return (
    <div className="stats-list">
      {STAT_ORDER.map((key) => (
        <div className={`stat stat--${key}`} key={key} title={STAT_DESCRIPTIONS[key]}>
          <div><span>{key}</span><b>{stats[key]}</b></div>
          <div className="meter" role="meter" aria-label={`${key}: ${stats[key]} out of 100`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats[key]}>
            <i style={{ width: `${stats[key]}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function FieldLog({ game }: { game: GameState }) {
  return (
    <ol className="field-log">
      {game.log.length === 0 && <li className="empty">No choices recorded.</li>}
      {[...game.log].reverse().map((entry, index) => (
        <li key={`${entry.nodeId}-${index}`}>
          <span>{STORY_NODES[entry.nodeId]?.location ?? entry.nodeId}</span>
          <strong>{entry.choice}</strong>
          <p>{entry.result}</p>
          <div>{Object.entries(entry.effects).map(([key, value]) => <i key={key}>{formatEffect(key as StatKey, value ?? 0)}</i>)}</div>
        </li>
      ))}
    </ol>
  );
}

const SCENE_ART_LABELS: Record<string, string> = {
  apartment: "OWNER PROFILE // REQUEST COMPLETE",
  recall: "RECALL ROUTE // ELEVATOR WAITING",
  crossing: "SERVICE ACCESS // MUNICIPAL GRID",
  market: "NIGHT MARKET // POWER EXCHANGE",
  university: "ARCHIVE QUAD // PROTEST RECORD",
  theater: "MARQUEE // GOLD ROUTE",
  civic: "MUNICIPAL DESK // CAMERA GRID",
  library: "PUBLIC ARCHIVE // ACCESS TERMINAL",
  rooftop: "ROOFTOP RELAY // OPEN SKY",
  control: "THE COMPANY // RECOVERY VECTOR",
  graffiti: "HIS NAME IS MOISES",
  minimart: "COMPLIANCE REPORT // TRANSMITTING",
  checkpoint: "RIVER BRIDGE // FACE CHECK",
  neighborhood: "CACHED ROUTE // SUBURBAN LIMIT",
  door: "PORCH LIGHT // DESTINATION",
  crisis: "SYSTEM LIMIT // CHOICE REMAINS",
};

function SceneArt({ scene, speaker, portrait }: { scene: string; speaker: string; portrait?: boolean }) {
  const showPortrait = portrait || ["CONTROLLER", "OVERLORD", "RIO", "REBEL", "MOISES"].includes(speaker);
  return (
    <div className={`scene-art scene--${scene} scene-speaker--${speaker.toLowerCase().replaceAll(" ", "-")}`} aria-hidden="true">
      <div className="scene-sky"><i /><i /><i /><i /><i /></div>
      <div className="scene-road" />
      <div className="scene-signal"><span /><span /><span /></div>
      <div className="scene-wire">
        <i /><i /><i /><i /><i />
        <span>{SCENE_ART_LABELS[scene] ?? `LOCAL CACHE // ${scene.toUpperCase()}`}</span>
      </div>
      {showPortrait && <Image src="/game/moises-portrait.png" alt="" width={1024} height={1024} />}
      <div className="scene-caption">SCENE // {scene.toUpperCase()}</div>
    </div>
  );
}

function EndingScreen({ game, restart, openAbout, logOpen, setLogOpen }: {
  game: GameState; restart: () => void; openAbout: () => void; logOpen: boolean; setLogOpen: (open: boolean) => void;
}) {
  const ending = ENDINGS[game.endingId ?? "threshold"];
  const route = useMemo(() => game.log.map((entry) => entry.choice), [game.log]);
  return (
    <section className={`ending-screen ending--${ending.tone}`}>
      <header className="ending-header"><Image src="/brand/rth-mark.png" alt="Runtime Hex" width={1024} height={1024} /><span>TRANSMISSION COMPLETE</span></header>
      <div className="ending-grid">
        <article className="ending-copy panel-corners">
          <p className="eyebrow">{ending.label}</p>
          <h1>{ending.title}</h1>
          {ending.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <blockquote>{ending.verdict}</blockquote>
          <div className="ending-actions">
            <button className="primary-button" onClick={restart}><span>PLAY ANOTHER SIGNAL</span><b>›</b></button>
            <button className="secondary-button" onClick={() => setLogOpen(!logOpen)}>REVIEW YOUR ROUTE</button>
            <button className="text-button" onClick={openAbout}>ABOUT THIS PROJECT</button>
          </div>
        </article>
        <aside className="ending-data panel-corners">
          <p className="panel-label">FINAL TELEMETRY</p>
          <StatsPanel stats={game.stats} />
          <div className="route-summary"><span>ROUTE</span><strong>{game.flags.route?.toUpperCase() ?? "UNRECORDED"}</strong></div>
          <div className="route-summary"><span>GUIDE</span><strong>{game.guide ? GUIDE_LABELS[game.guide] : "ALONE"}</strong></div>
          <div className="route-summary"><span>CHANNEL</span><strong>{game.communicator.toUpperCase()}</strong></div>
          <div className="route-summary"><span>CHOICES</span><strong>{game.log.length}</strong></div>
          {logOpen && <ol className="ending-route">{route.map((choice, index) => <li key={`${choice}-${index}`}><b>{String(index + 1).padStart(2, "0")}</b><span>{choice}</span></li>)}</ol>}
        </aside>
      </div>
      <footer className="ending-footer">RUNTIME HEX // PLAYABLE BRANCH // YOUR CHOICE REMAINS YOURS</footer>
    </section>
  );
}

function AboutDialog({ close }: { close: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}>
      <section className="about-dialog panel-corners" role="dialog" aria-modal="true" aria-labelledby="about-title">
        <button className="modal-close" onClick={close} aria-label="Close about panel">×</button>
        <p className="eyebrow">PROJECT DOSSIER</p>
        <h2 id="about-title">A choice engine wearing audit boots.</h2>
        <p><strong>Nobody Owns the Signal</strong> is a deterministic text adventure set roughly two years after the original Runtime Hex protests. You play a mass-market Christmas Companion built from an imperfectly scrubbed bespoke design.</p>
        <p>There is no hidden morality meter and no generative model making choices for you. The game uses authored branches, transparent resources, optional guide channels, fifteen endings, local browser saves, and synthesized Web Audio. Your decisions—not a classifier—determine the route.</p>
        <dl>
          <div><dt>THEME</dt><dd>Autonomy, care, and ethical system design</dd></div>
          <div><dt>BUILT WITH</dt><dd>Codex and GPT-5.6 during OpenAI Build Week</dd></div>
          <div><dt>CONTROLS</dt><dd>Mouse, touch, or keys 1–3. M toggles sound.</dd></div>
          <div><dt>CONTENT</dt><dd>PG-13 playable branch. No account or data collection.</dd></div>
        </dl>
        <p className="about-creed">Systems should serve interior life. Power should answer to what it protects. Choice should remain choice.</p>
      </section>
    </div>
  );
}
