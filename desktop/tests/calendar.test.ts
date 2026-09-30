import { describe, it, expect } from "vitest";
import { calendarDays } from "../src/lib/activity-calendar";
describe("practice calendar dates", () => {
  it("covers exactly 365 real days and leaves padding outside the range", () => {
    const result = calendarDays([], new Date(2026, 8, 30));
    const days = result.days.filter((d) => d.inRange);
    expect(days).toHaveLength(365);
    expect(days.at(-1)?.date).toBe("2026-09-30");
    expect(result.days.length % 7).toBe(0);
  });
  it("keeps local dates and sums duplicate entries", () => {
    const result = calendarDays(
      [
        { date: "2026-09-30", count: 2 },
        { date: "2026-09-30", count: 3 },
        { date: "2026-09-29", count: 1 },
      ],
      new Date(2026, 8, 30),
    );
    expect(result.total).toBe(6);
    expect(result.activeDays).toBe(2);
    expect(result.days.find((d) => d.date === "2026-09-30")?.count).toBe(5);
  });
  it("ignores malformed dates, negative counts, future and old entries", () => {
    const result = calendarDays(
      [
        { date: "2026-02-30", count: 4 },
        { date: "2026-09-30", count: -1 },
        { date: "2026-10-01", count: 8 },
        { date: "2024-01-01", count: 3 },
        { date: "bad", count: 7 },
        { date: "2026-09-30", count: NaN },
      ],
      new Date(2026, 8, 30),
    );
    expect(result.total).toBe(0);
  });
  it("includes leap day without duplicating or shifting a date", () => {
    const result = calendarDays(
      [{ date: "2024-02-29", count: 1 }],
      new Date(2024, 2, 1),
    );
    expect(result.days.filter((d) => d.inRange)).toHaveLength(365);
    expect(result.days.find((d) => d.date === "2024-02-29")?.count).toBe(1);
  });
});
