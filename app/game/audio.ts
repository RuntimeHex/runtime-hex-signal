let audioContext: AudioContext | null = null;

function context() {
  if (typeof window === "undefined") return null;
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function tone(frequency: number, start: number, duration: number, gain = 0.035) {
  const ctx = context();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + start);
  volume.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  volume.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + start + 0.012);
  volume.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  oscillator.connect(volume);
  volume.connect(ctx.destination);
  oscillator.start(ctx.currentTime + start);
  oscillator.stop(ctx.currentTime + start + duration + 0.02);
}

export function playChoiceTone(index: number) {
  const notes = [220, 277, 330];
  tone(notes[index] ?? notes[0], 0, 0.075);
  tone((notes[index] ?? notes[0]) * 2, 0.075, 0.06, 0.022);
}

export function playStartTone() {
  [164, 220, 277, 330].forEach((note, index) => tone(note, index * 0.065, 0.1));
}

export function playEndingTone(toneName: "cyan" | "green" | "blue" | "red") {
  const notes =
    toneName === "red"
      ? [196, 185, 147]
      : toneName === "green"
        ? [196, 247, 330, 392]
        : toneName === "blue"
          ? [147, 220, 294]
          : [164, 247, 330];
  notes.forEach((note, index) => tone(note, index * 0.12, 0.18, 0.03));
}
