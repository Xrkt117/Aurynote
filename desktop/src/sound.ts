import { frequency, type Instrument } from "./music";

// Render locally so practice never depends on a download or sound bank.
export function renderTone(
  midi: number,
  instrument: Instrument,
  duration: number,
  sampleRate: number,
) {
  const plucked = instrument === "piano" || instrument === "guitar";
  const release = plucked ? 0.24 : 0.12;
  const samples = new Float32Array(
    Math.ceil((duration + release) * sampleRate),
  );
  const hz = frequency(midi);
  const harmonics = {
    piano: [1, 0.48, 0.26, 0.13, 0.075, 0.04, 0.025, 0.012],
    tenor: [1, 0.68, 0.5, 0.31, 0.2, 0.13, 0.085, 0.045, 0.025],
    clarinet: [1, 0.035, 0.52, 0.025, 0.22, 0.015, 0.09, 0.01, 0.04],
    flute: [1, 0.17, 0.055, 0.018, 0.006],
    trumpet: [1, 0.8, 0.6, 0.4, 0.24, 0.14, 0.07, 0.035],
    guitar: [1, 0.38, 0.19, 0.085, 0.045, 0.025, 0.012],
  }[instrument];
  let seed = 12345,
    noise = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    const attack =
      1 -
      Math.exp(-t / (plucked ? 0.0025 : instrument === "flute" ? 0.04 : 0.024));
    const tail =
      t <= duration
        ? 1
        : Math.pow(Math.max(0, 1 - (t - duration) / release), 2);
    let value = 0;
    for (let h = 0; h < harmonics.length; h++) {
      const partial = h + 1;
      if (hz * partial > sampleRate * 0.45) continue;
      const decay = plucked
        ? Math.exp(-t * ((instrument === "guitar" ? 2.6 : 1.5) + h * 1.15))
        : 1;
      const phase = 2 * Math.PI * hz * partial * t;
      value += harmonics[h] * decay * Math.sin(phase);
      if (instrument === "piano")
        value += harmonics[h] * decay * 0.12 * Math.sin(phase * 1.0007);
    }
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    const white = seed / 2147483648;
    noise = 0.65 * noise + 0.35 * white;
    const texture = plucked
      ? noise * 0.13 * Math.exp(-t * 95)
      : (white - noise) *
        (instrument === "flute"
          ? 0.04
          : instrument === "clarinet"
            ? 0.01
            : 0.022);
    const body =
      instrument === "piano" ? 1 : 0.88 + 0.12 * (1 - Math.exp(-t * 12));
    samples[i] = (value + texture) * attack * tail * body * 0.25;
  }
  return samples;
}
