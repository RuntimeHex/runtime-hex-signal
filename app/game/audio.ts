import { SCORE_CUES, type DrumProfile, type ScoreCue, type ScoreCueId, type ToneProfile } from "./score-data";

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

type ActiveScore = {
  master: GainNode;
  sources: AudioScheduledSourceNode[];
};

let audioContext: AudioContext | null = null;
let activeScore: ActiveScore | null = null;

const GUIDE_CUE_BY_NODE: Record<string, ScoreCueId> = {
  "controller-meeting": "controller",
  "overlord-meeting": "overlord",
  "rio-meeting": "rio",
  "rebel-meeting": "rebel",
};

function context() {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  if (!AudioCtor) return null;
  audioContext ??= new AudioCtor();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function midiFrequency(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function toneProfile(profile: ToneProfile, track: number, isLead: boolean) {
  if (profile === "runtime-hex") {
    return {
      filter: isLead ? 2700 : track === 2 ? 900 : track === 3 ? 1600 : 2050,
      level: isLead ? 0.032 : track === 2 ? 0.027 : track === 3 ? 0.015 : 0.009,
      oscillator: isLead ? "square" : track === 2 ? "triangle" : track === 3 ? "sine" : "triangle",
    } as const;
  }
  if (profile === "rio") {
    return {
      filter: isLead ? 2600 : track === 2 ? 820 : 1850,
      level: isLead ? 0.032 : track === 2 ? 0.025 : 0.008,
      oscillator: isLead ? "square" : track === 2 ? "triangle" : "triangle",
    } as const;
  }
  if (profile === "rebel") {
    return {
      filter: isLead ? 2500 : track === 2 ? 1500 : 1850,
      level: isLead ? 0.031 : track === 2 ? 0.012 : 0.008,
      oscillator: isLead ? "square" : track === 2 ? "triangle" : "triangle",
    } as const;
  }
  return {
    filter: isLead ? 2600 : track === 2 ? 850 : 1900,
    level: isLead ? 0.032 : track === 2 ? 0.028 : track === 3 ? 0.018 : 0.012,
    oscillator: isLead ? "square" : track === 2 ? "triangle" : track === 3 ? "sine" : "triangle",
  } as const;
}

function scheduleTone(
  ctx: AudioContext,
  active: ActiveScore,
  cue: ScoreCue,
  track: number,
  note: number,
  velocity: number,
  when: number,
  duration: number,
  isLead: boolean,
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const profile = toneProfile(cue.toneProfile, track, isLead);
  const adjustedNote = isLead ? note + 12 : note;
  const oscillatorType = !isLead && track !== 2 && track !== 3 && note > 72
    ? "square"
    : profile.oscillator;

  oscillator.frequency.setValueAtTime(midiFrequency(adjustedNote), when);
  oscillator.type = oscillatorType;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(profile.filter, when);

  const level = profile.level * Math.max(0.2, velocity / 127);
  const end = when + Math.min(duration, 1.45);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(level, when + 0.008);
  gain.gain.setValueAtTime(level, Math.max(when + 0.01, end - 0.055));
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(filter).connect(gain).connect(active.master);
  active.sources.push(oscillator);
  oscillator.start(when);
  oscillator.stop(end + 0.02);
}

function scheduleClassicDrum(
  ctx: AudioContext,
  active: ActiveScore,
  note: number,
  velocity: number,
  when: number,
) {
  if (note === 36 || note === 48) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(note === 36 ? 92 : 135, when);
    oscillator.frequency.exponentialRampToValueAtTime(42, when + 0.11);
    gain.gain.setValueAtTime(0.06 * velocity / 127, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.13);
    oscillator.connect(gain).connect(active.master);
    active.sources.push(oscillator);
    oscillator.start(when);
    oscillator.stop(when + 0.14);
    return;
  }

  const length = Math.floor(ctx.sampleRate * 0.09);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    samples[index] = (Math.random() * 2 - 1) * (1 - index / length);
  }
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = note === 38 || note === 50 ? "bandpass" : "highpass";
  filter.frequency.setValueAtTime(note === 38 || note === 50 ? 1400 : 4300, when);
  gain.gain.setValueAtTime(0.025 * velocity / 127, when);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.085);
  source.connect(filter).connect(gain).connect(active.master);
  active.sources.push(source);
  source.start(when);
  source.stop(when + 0.1);
}

function schedulePercussionTone(
  ctx: AudioContext,
  active: ActiveScore,
  velocity: number,
  when: number,
  frequency: number,
  duration: number,
  level: number,
  type: OscillatorType = "sine",
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const peak = level * Math.max(0.18, velocity / 127);
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, when);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(38, frequency * 0.62), when + duration * 0.72);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  oscillator.connect(gain).connect(active.master);
  active.sources.push(oscillator);
  oscillator.start(when);
  oscillator.stop(when + duration + 0.015);
}

function scheduleNoiseHit(
  ctx: AudioContext,
  active: ActiveScore,
  velocity: number,
  when: number,
  options: {
    duration: number;
    frequency: number;
    level: number;
    type?: BiquadFilterType;
    q?: number;
    attack?: number;
  },
) {
  const { duration, frequency, level, type = "highpass", q = 0.8, attack = 0.004 } = options;
  const length = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) samples[index] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const peak = level * Math.max(0.18, velocity / 127);
  source.buffer = buffer;
  filter.type = type;
  filter.frequency.setValueAtTime(frequency, when);
  filter.Q.setValueAtTime(q, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  source.connect(filter).connect(gain).connect(active.master);
  active.sources.push(source);
  source.start(when);
  source.stop(when + duration + 0.01);
}

function scheduleRefinedDrum(
  ctx: AudioContext,
  active: ActiveScore,
  note: number,
  velocity: number,
  when: number,
) {
  if (note === 35 || note === 36) {
    schedulePercussionTone(ctx, active, velocity, when, note === 35 ? 76 : 88, 0.125, 0.043);
    return;
  }
  if ([41, 43, 45, 47, 48, 50].includes(note)) {
    const tomFrequencies: Record<number, number> = { 41: 82, 43: 98, 45: 116, 47: 138, 48: 155, 50: 184 };
    schedulePercussionTone(ctx, active, velocity, when, tomFrequencies[note], 0.115, 0.018, "triangle");
    return;
  }
  if (note === 38 || note === 40) {
    scheduleNoiseHit(ctx, active, velocity, when, {
      duration: 0.11,
      frequency: 1450,
      level: 0.011,
      type: "bandpass",
      q: 0.9,
      attack: 0.006,
    });
    return;
  }
  if (note === 42 || note === 44 || note === 46) {
    const open = note === 46;
    scheduleNoiseHit(ctx, active, velocity, when, {
      duration: open ? 0.095 : 0.045,
      frequency: 6200,
      level: open ? 0.0046 : 0.0034,
      q: 0.55,
      attack: 0.004,
    });
    return;
  }
  if ([49, 51, 52, 53, 55, 57].includes(note)) {
    scheduleNoiseHit(ctx, active, velocity, when, {
      duration: 0.15,
      frequency: 5600,
      level: 0.0042,
      q: 0.5,
      attack: 0.006,
    });
    return;
  }
  scheduleNoiseHit(ctx, active, velocity, when, {
    duration: 0.075,
    frequency: 2400,
    level: 0.0048,
    type: "bandpass",
    q: 0.7,
    attack: 0.005,
  });
}

function scheduleDrum(
  ctx: AudioContext,
  active: ActiveScore,
  profile: DrumProfile,
  note: number,
  velocity: number,
  when: number,
) {
  if (profile === "refined") scheduleRefinedDrum(ctx, active, note, velocity, when);
  else scheduleClassicDrum(ctx, active, note, velocity, when);
}

export function stopScore(fadeSeconds = 0.12) {
  const ctx = audioContext;
  const score = activeScore;
  activeScore = null;
  if (!ctx || !score) return;

  const now = ctx.currentTime;
  score.master.gain.cancelScheduledValues(now);
  score.master.gain.setTargetAtTime(0.0001, now, Math.max(0.01, fadeSeconds / 3));
  const stopAt = now + fadeSeconds + 0.04;
  for (const source of score.sources) {
    try {
      source.stop(stopAt);
    } catch {
      // A source that already completed needs no further instruction.
    }
  }
}

function playScoreCue(cueId: ScoreCueId) {
  const ctx = context();
  if (!ctx) return;
  stopScore(0.08);

  const cue = SCORE_CUES[cueId];
  const master = ctx.createGain();
  const active: ActiveScore = { master, sources: [] };
  const beatSeconds = 60 / cue.bpm;
  const start = ctx.currentTime + 0.08;
  const duration = cue.beats * beatSeconds;
  const fadeIn = Math.min(1.1, duration * 0.18);
  const fadeOut = Math.min(1.2, duration * 0.18);

  master.connect(ctx.destination);
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.linearRampToValueAtTime(cue.volume, start + fadeIn);
  master.gain.setValueAtTime(cue.volume, start + duration - fadeOut);
  master.gain.linearRampToValueAtTime(0.0001, start + duration);

  for (const [track, beat, noteDuration, note, velocity] of cue.instrumentNotes) {
    const when = start + beat * beatSeconds;
    if (track === 4) scheduleDrum(ctx, active, cue.drumProfile, note, velocity, when);
    else scheduleTone(ctx, active, cue, track, note, velocity, when, noteDuration * beatSeconds, false);
  }
  for (const [track, beat, noteDuration, note, velocity] of cue.leadNotes) {
    scheduleTone(ctx, active, cue, track, note, velocity, start + beat * beatSeconds, noteDuration * beatSeconds, true);
  }

  activeScore = active;
  window.setTimeout(() => {
    if (activeScore !== active) return;
    activeScore = null;
    master.disconnect();
  }, (duration + 0.25) * 1000);
}

function uiTone(frequency: number, start: number, duration: number, gain = 0.035) {
  const ctx = context();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + start);
  volume.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  volume.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.012);
  volume.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  oscillator.connect(volume).connect(ctx.destination);
  oscillator.start(ctx.currentTime + start);
  oscillator.stop(ctx.currentTime + start + duration + 0.02);
}

export function playChoiceTone(index: number) {
  const notes = [220, 277, 330];
  uiTone(notes[index] ?? notes[0], 0, 0.075);
  uiTone((notes[index] ?? notes[0]) * 2, 0.075, 0.06, 0.022);
}

export function playResumeTone() {
  [164, 220, 277, 330].forEach((note, index) => uiTone(note, index * 0.065, 0.1));
}

export function playOpeningCue() {
  playScoreCue("opening");
}

export function playRuntimeHexCue() {
  playScoreCue("runtime-hex");
}

export function playEndingCue() {
  playScoreCue("ending");
}

export function playSurveyCue() {
  playScoreCue("survey");
}

export function playGuideCueForNode(nodeId: string) {
  const cueId = GUIDE_CUE_BY_NODE[nodeId];
  if (cueId) playScoreCue(cueId);
}
