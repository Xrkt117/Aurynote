import { describe, it, expect } from "vitest";
import { tunings } from "../src/tuning";
import { arrangement, scales, chords, sounding } from "../src/music";
import { decode, record, fresh } from "../src/store";
describe("instrument keys", () => {
  it("maps written C to the correct sounding octave", () => {
    const expected = {
      c: 60,
      "c-low": 48,
      "c-high": 72,
      bb: 58,
      tenor: 46,
      eb: 51,
      baritone: 39,
      "eb-high": 63,
      f: 53,
      a: 57,
    };
    for (const tuning of tunings) {
      expect(sounding(60, tuning.id)).toBe(expected[tuning.id]);
      expect(sounding(60, tuning.id, false)).toBe(60);
    }
  });
  it("preserves concert pitches and note spelling across all families", () => {
    for (const tuning of tunings)
      for (let root = 0; root < 12; root++)
        for (const pattern of [...scales, ...chords]) {
          const written = arrangement(root, pattern, tuning.id, true),
            concert = arrangement(root, pattern, tuning.id, false);
          written.forEach((tone, i) => {
            expect(sounding(tone.midi, tuning.id)).toBe(concert[i].sound);
            expect(tone.sound).toBe(concert[i].sound);
            const natural = [0, 2, 4, 5, 7, 9, 11][
              "CDEFGAB".indexOf(tone.name[0])
            ];
            const alter =
              [...tone.name].filter((n) => n === "♯").length -
              [...tone.name].filter((n) => n === "♭").length;
            expect((natural + alter + 12) % 12).toBe(tone.midi % 12);
          });
        }
  });
  it("migrates tenor preferences without losing progress", () => {
    const old = {
      ...record(fresh(), 7, true, "ear"),
      version: 1,
      instrument: "tenor",
    };
    const migrated = decode(JSON.stringify(old));
    expect(migrated.tuning).toBe("tenor");
    expect(migrated.sound).toBe("tenor");
    expect(migrated.attempts).toEqual(old.attempts);
    expect(migrated.learned).toEqual([7]);
  });
  it("stores sound independently of instrument key", () => {
    const profile = decode(
      JSON.stringify({ ...fresh(), tuning: "eb", sound: "piano" }),
    );
    expect(profile.tuning).toBe("eb");
    expect(profile.sound).toBe("piano");
    expect(
      decode(JSON.stringify({ ...profile, tuning: "bad", sound: "bad" }))
        .tuning,
    ).toBe("c");
  });
});
