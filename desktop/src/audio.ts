import { frequency, type Instrument } from "./music";
class Voice {
  context?: AudioContext;
  nodes = new Set<OscillatorNode>();
  epoch = 0;
  volume = 0.45;
  async ready() {
    this.context ??= new AudioContext();
    if (this.context.state !== "running") await this.context.resume();
    return this.context;
  }
  stop() {
    this.epoch++;
    for (const node of this.nodes) {
      try {
        node.stop();
      } catch {}
    }
    this.nodes.clear();
  }
  async play(
    notes: number[],
    instrument: Instrument,
    onNote: (midi: number | null) => void = () => {},
    together = false,
    duration = 0.6,
  ) {
    this.stop();
    const token = this.epoch;
    const ctx = await this.ready();
    if (token !== this.epoch) return false;
    const output = ctx.createGain();
    output.gain.value =
      this.volume * (together ? 0.7 / Math.sqrt(notes.length) : 0.7);
    output.connect(ctx.destination);
    for (let index = 0; index < notes.length; index++) {
      if (token !== this.epoch) {
        output.disconnect();
        return false;
      }
      const midi = notes[index],
        time = ctx.currentTime;
      onNote(midi);
      const partials =
        instrument === "piano"
          ? [1, 0.35, 0.14, 0.06, 0.03]
          : [1, 0.58, 0.38, 0.24, 0.13, 0.06];
      partials.forEach((amplitude, i) => {
        const osc = ctx.createOscillator(),
          env = ctx.createGain();
        osc.frequency.value = frequency(midi) * (i + 1);
        osc.type = "sine";
        env.gain.setValueAtTime(0.0001, time);
        env.gain.exponentialRampToValueAtTime(
          amplitude * 0.16,
          time + (instrument === "piano" ? 0.012 : 0.055),
        );
        env.gain.exponentialRampToValueAtTime(
          amplitude * (instrument === "piano" ? 0.025 : 0.105),
          time + duration * 0.75,
        );
        env.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.06);
        osc.connect(env);
        env.connect(output);
        osc.start(time);
        osc.stop(time + duration + 0.08);
        this.nodes.add(osc);
        osc.onended = () => {
          this.nodes.delete(osc);
          osc.disconnect();
          env.disconnect();
        };
      });
      if (!together)
        await new Promise((resolve) =>
          setTimeout(resolve, (duration + 0.12) * 1000),
        );
    }
    if (together)
      await new Promise((resolve) =>
        setTimeout(resolve, (duration + 0.15) * 1000),
      );
    output.disconnect();
    if (token !== this.epoch) return false;
    onNote(null);
    return true;
  }
}
export const voice = new Voice();

// Difference-function pitch estimation; quiet or ambiguous frames have no result.
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
): { frequency: number; midi: number; cents: number } | null {
  let energy = 0;
  for (const sample of buffer) energy += sample * sample;
  if (Math.sqrt(energy / buffer.length) < 0.012) return null;
  const maxLag = Math.min(
      Math.floor(sampleRate / 65),
      Math.floor(buffer.length / 2) - 1,
    ),
    minLag = Math.floor(sampleRate / 1400);
  const difference = new Float32Array(maxLag + 1);
  let total = 0;
  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < buffer.length / 2; i++) {
      const delta = buffer[i] - buffer[i + lag];
      sum += delta * delta;
    }
    total += sum;
    difference[lag] = total > 0 ? (sum * lag) / total : 1;
  }
  for (let lag = minLag; lag < maxLag - 1; lag++) {
    if (difference[lag] < 0.12) {
      while (lag + 1 < maxLag && difference[lag + 1] < difference[lag]) lag++;
      const left = difference[lag - 1],
        middle = difference[lag],
        right = difference[lag + 1];
      const denominator = 2 * (2 * middle - right - left);
      const refined = lag + (denominator ? (right - left) / denominator : 0);
      const hz = sampleRate / refined,
        exact = 69 + 12 * Math.log2(hz / 440),
        midi = Math.round(exact);
      return { frequency: hz, midi, cents: 100 * (exact - midi) };
    }
  }
  return null;
}
