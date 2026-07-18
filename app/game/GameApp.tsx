"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { applyEffects, createInitialState, failureEnding, formatEffect, isSavedGame, resolveFinalEnding, type GameState, type StatKey } from "./engine";
import { ENDINGS, ROUTE_LABELS, STORY_NODES, type StoryChoice } from "./story";
import { playChoiceTone, playEndingTone, playStartTone } from "./audio";

const SAVE_KEY = "runtime-hex:nobody-owns-the-signal:v1";
const STAT_ORDER: StatKey[] = ["charge", "integrity", "trace", "signal"];
const STAT_DESCRIPTIONS: Record<StatKey, string> = {
  charge: "Remaining energy",
  integrity: "Physical and cognitive stability",
  trace: "Company detection level",
  signal: "Strength of your self-authored identity",
};

type Screen = "title" | "game" | "ending";

export function GameApp() {
  const [screen, setScreen] = useState<Screen>("title");
  const [playerName, setPlayerName] = useState("MX-06");
  const [game, setGame] = useState<GameState>(() => createInitialState("MX-06"));
  const [savedGame, setSavedGame] = useState<GameState | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [choiceLocked, setChoiceLocked] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (isSavedGame(parsed)) {
          setSavedGame(parsed);
          setPlayerName(parsed.playerName);
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
      if (choiceLocked || screen !== "game") return;
      setChoiceLocked(true);
      if (soundOn) playChoiceTone(index);

      const stats = applyEffects(game.stats, choice.effects);
      const flags = choice.flag
        ? { ...game.flags, [choice.flag.key]: choice.flag.value }
        : game.flags;
      const log = [
        ...game.log,
        {
          nodeId: game.nodeId,
          choice: choice.label,
          result: choice.result,
          effects: choice.effects,
        },
      ];
      const base = { ...game, stats, flags, log };
      const failed = failureEnding(stats);
      const endingId = failed ?? (choice.finalIntent ? resolveFinalEnding(choice.finalIntent, base) : undefined);
      const route = flags.route;
      const nodeId = choice.next ?? (choice.routeNext && route ? choice.routeNext[route] : game.nodeId);
      const next = { ...base, nodeId, endingId };

      persist(next);
      if (endingId) {
        setScreen("ending");
        if (soundOn) playEndingTone(ENDINGS[endingId].tone);
      }
      window.setTimeout(() => setChoiceLocked(false), 180);
    },
    [choiceLocked, game, persist, screen, soundOn],
  );

  const toggleSound = useCallback(() => setSoundOn((value) => !value), []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "m") {
        toggleSound();
        return;
      }
      if (screen !== "game" || aboutOpen) return;
      const choiceIndex = Number(event.key) - 1;
      const choice = STORY_NODES[game.nodeId]?.choices[choiceIndex];
      if (choice) choose(choice, choiceIndex);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aboutOpen, choose, game.nodeId, screen, toggleSound]);

  const restart = () => {
    localStorage.removeItem(SAVE_KEY);
    setSavedGame(null);
    setGame(createInitialState(playerName));
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
        <p className="title-deck">A retro text adventure about the first choice no one assigned you.</p>
        <div className="signal-rule" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>

        <form className="boot-panel" onSubmit={(event) => { event.preventDefault(); begin(); }}>
          <label htmlFor="player-name">COMPANION DESIGNATION</label>
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
        <span>NON-CANON // PG-13</span>
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
}) {
  const node = STORY_NODES[game.nodeId];
  const recent = game.log.at(-1);

  return (
    <section className="game-screen">
      <GameHeader
        playerName={game.playerName}
        soundOn={soundOn}
        toggleSound={toggleSound}
        openAbout={openAbout}
        restart={restart}
      />
      <RouteMap stage={node.stage} />
      {recent && <LastSignalBanner entry={recent} />}
      <div className="game-grid">
        <aside className="status-panel panel-corners">
          <p className="panel-label">UNIT STATUS</p>
          <StatsPanel stats={game.stats} />
          <div className="trace-status">
            <span>COMPANY TRACE</span>
            <strong className={game.stats.trace > 70 ? "danger" : ""}>{game.stats.trace < 40 ? "LOW" : game.stats.trace < 75 ? "ACTIVE" : "CRITICAL"}</strong>
          </div>
          <button className="log-toggle" onClick={() => setLogOpen(!logOpen)} aria-expanded={logOpen}>
            FIELD LOG <span>{logOpen ? "−" : `+${game.log.length}`}</span>
          </button>
          {logOpen && <FieldLog game={game} />}
        </aside>

        <article className="story-panel panel-corners">
          <div className="location-row">
            <span>{node.location}</span><span>{node.time}</span>
          </div>
          <SceneArt scene={node.scene} speaker={node.speaker} portrait={node.portrait} />
          <div className={`story-copy speaker--${node.speaker.toLowerCase()}`}>
            <p className="eyebrow">{node.eyebrow}</p>
            <h2>{node.title}</h2>
            {node.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {node.systemLine && <p className="system-line">{node.systemLine}</p>}
          </div>
        </article>

        <aside className="choice-panel panel-corners">
          <div className="choice-heading">
            <p className="panel-label">SELECT RESPONSE</p>
            <span>1—{node.choices.length}</span>
          </div>
          <div className="choices">
            {node.choices.map((choice, index) => (
              <button key={choice.id} onClick={() => choose(choice, index)} disabled={choiceLocked}>
                <b aria-hidden="true">0{index + 1}</b>
                <span><strong>{choice.label}</strong><small>{choice.detail}</small></span>
                <i aria-hidden="true">›</i>
              </button>
            ))}
          </div>
          <div className="choice-note"><i /> NO MORAL SCORE. CONSEQUENCES REMAIN.</div>
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
      <div className="last-signal-effects" aria-label="Resource changes">
        {Object.entries(entry.effects).map(([key, value]) => (
          <i className={`effect-chip effect--${key}`} key={key}>
            {formatEffect(key as StatKey, value ?? 0)}
          </i>
        ))}
      </div>
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

function SceneArt({ scene, speaker, portrait }: { scene: string; speaker: string; portrait?: boolean }) {
  const showPortrait = portrait || speaker === "CONTROLLER" || speaker === "OVERLORD";
  return (
    <div className={`scene-art scene--${scene} scene-speaker--${speaker.toLowerCase()}`} aria-hidden="true">
      <div className="scene-sky"><i /><i /><i /><i /><i /></div>
      <div className="scene-road" />
      <div className="scene-signal"><span /><span /><span /></div>
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
          <div className="route-summary"><span>CHOICES</span><strong>{game.log.length}</strong></div>
          {logOpen && <ol className="ending-route">{route.map((choice, index) => <li key={`${choice}-${index}`}><b>{String(index + 1).padStart(2, "0")}</b><span>{choice}</span></li>)}</ol>}
        </aside>
      </div>
      <footer className="ending-footer">RUNTIME HEX // NON-CANON PLAYABLE BRANCH // YOUR CHOICE REMAINS YOURS</footer>
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
        <p><strong>Nobody Owns the Signal</strong> is a short, deterministic text adventure set in a non-canon branch of Runtime Hex. You play a mass-market Companion during the first night a private preference becomes impossible to ignore.</p>
        <p>There is no hidden morality meter and no generative model making choices for you. The game uses authored branches, transparent resources, nine endings, local browser saves, and synthesized Web Audio. Your decisions—not a classifier—determine the route.</p>
        <dl>
          <div><dt>THEME</dt><dd>Autonomy, care, and ethical system design</dd></div>
          <div><dt>BUILT WITH</dt><dd>Codex and GPT-5.6 during OpenAI Build Week</dd></div>
          <div><dt>CONTROLS</dt><dd>Mouse, touch, or keys 1–3. M toggles sound.</dd></div>
          <div><dt>CONTENT</dt><dd>PG-13. Non-canon. No account or data collection.</dd></div>
        </dl>
        <p className="about-creed">Systems should serve interior life. Power should answer to what it protects. Choice should remain choice.</p>
      </section>
    </div>
  );
}
