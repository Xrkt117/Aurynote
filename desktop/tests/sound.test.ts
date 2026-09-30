import { describe, expect, it } from "vitest";
import { renderTone } from "../src/sound";
import { detectPitch } from "../src/audio";
describe("practice voices", () => {
  for (const instrument of ["piano", "tenor"] as const)
    for (const midi of [46, 60, 69, 81]) {
      it(`${instrument} keeps ${midi} in tune without clipping`, () => {
        const rate = 48000,
          samples = renderTone(midi, instrument, 0.6, rate);
        expect(
          samples.every((n) => Number.isFinite(n) && Math.abs(n) < 1),
        ).toBe(true);
        expect(samples[0]).toBe(0);
        expect(Math.abs(samples[samples.length - 1])).toBeLessThan(0.00001);
        const pitch = detectPitch(samples.slice(4800, 4800 + 4096), rate);
        expect(pitch?.midi).toBe(midi);
        expect(Math.abs(pitch!.cents)).toBeLessThan(8);
      });
    }
  it("piano decays while sax sustains", () => {
    const rms = (a: Float32Array, start: number) =>
      Math.sqrt(
        a.slice(start, start + 4000).reduce((s, n) => s + n * n, 0) / 4000,
      );
    const piano = renderTone(60, "piano", 1, 48000),
      sax = renderTone(60, "tenor", 1, 48000);
    expect(rms(piano, 32000) / rms(piano, 5000)).toBeLessThan(0.5);
    expect(rms(sax, 32000) / rms(sax, 5000)).toBeGreaterThan(0.85);
  });
});
