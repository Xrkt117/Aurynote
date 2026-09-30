import { describe, it, expect } from "vitest";
import { fresh, decode } from "../src/store";
import { finishSession, resizePool, shuffledNotes } from "../src/practice";
import { achievements } from "../src/achievements";
describe("practice configuration and accomplishments", () => {
  it("advances passed guided lessons but not custom sessions", () => {
    const passed = finishSession(fresh(), 0, [true, true, true, true, false]);
    expect(passed.level).toBe(1);
    expect(passed.passedLessons).toEqual([0]);
    expect(passed.completed).toBe(1);
    const again = finishSession(passed, 0, [true]);
    expect(again.passedLessons).toEqual([0]);
    expect(again.completed).toBe(2);
    expect(finishSession(passed, null, [true, true]).level).toBe(1);
    expect(finishSession(fresh(), 0, [false, true]).passedLessons).toEqual([]);
  });
  it("keeps custom pools distinct and within the permitted notes", () => {
    expect(resizePool([0, 7], 3)).toEqual([0, 4, 7]);
    expect(resizePool([0, 1, 7], 5, [0, 2, 4, 5, 7, 9, 11])).toEqual([
      0, 2, 4, 5, 7,
    ]);
    expect(shuffledNotes([0, 4, 7], () => 0.9)).toEqual([0, 4, 7]);
  });
  it("validates and restores saved configuration", () => {
    const p = decode(
      JSON.stringify({
        ...fresh(),
        customNotes: [0, 0, 7, 99],
        sessionLength: 5,
        dailyGoal: 20,
        sound: "flute",
      }),
    );
    expect(p.customNotes).toEqual([0, 7]);
    expect(p.sound).toBe("flute");
    expect(p.sessionLength).toBe(5);
    expect(p.dailyGoal).toBe(20);
    expect(
      decode(JSON.stringify({ ...p, customNotes: [1], sessionLength: -20 }))
        .customNotes,
    ).toEqual([0, 7]);
  });
  it("never shows unearned accomplishments as earned", () => {
    expect(achievements(fresh()).every((a) => !a.earned)).toBe(true);
    const p = finishSession(fresh(), 0, [true]);
    expect(
      achievements(p)
        .filter((a) => a.earned)
        .map((a) => a.id),
    ).toEqual(["first"]);
  });
});
