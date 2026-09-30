import { type Instrument } from "./music";
import { renderTone } from "./sound";
class Voice {
  context?: AudioContext;
  nodes = new Map<AudioBufferSourceNode, GainNode>();
  epoch = 0;
  volume = 0.45;
  async ready() {
    this.context ??= new AudioContext();
    if (this.context.state !== "running") await this.context.resume();
    return this.context;
  }
  stop() {
    this.epoch++;
    const now = this.context?.currentTime ?? 0;
    for (const [node, gain] of this.nodes) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.015);
      try {
        node.stop(now + 0.02);
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
    const token = this.epoch,
      ctx = await this.ready();
    if (token !== this.epoch || !notes.length) return false;
    const start = ctx.currentTime + 0.015,
      spacing = duration + 0.26;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const ended: Promise<void>[] = [];
    notes.forEach((midi, index) => {
      const data = renderTone(midi, instrument, duration, ctx.sampleRate),
        buffer = ctx.createBuffer(1, data.length, ctx.sampleRate);
      buffer.copyToChannel(data, 0);
      const source = ctx.createBufferSource(),
        gain = ctx.createGain();
      source.buffer = buffer;
      gain.gain.value = this.volume / (together ? notes.length : 1);
      source.connect(gain);
      gain.connect(ctx.destination);
      this.nodes.set(source, gain);
      ended.push(
        new Promise((resolve) => {
          source.onended = () => {
            this.nodes.delete(source);
            source.disconnect();
            gain.disconnect();
            resolve();
          };
        }),
      );
      const delay = together ? 0 : index * spacing;
      source.start(start + delay);
      timers.push(
        setTimeout(
          () => {
            if (token === this.epoch) onNote(midi);
          },
          (delay + 0.015) * 1000,
        ),
      );
    });
    await Promise.all(ended);
    timers.forEach(clearTimeout);
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
