import { lessons } from "./music";
import type { Profile } from "./store";
export function shuffledNotes(notes: number[], random = Math.random) {
  const result = [...notes];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function resizePool(
  notes: number[],
  count: number,
  allowed = [0, 7, 4, 2, 9, 5, 11, 1, 3, 6, 8, 10],
) {
  return [
    ...notes.filter((n) => allowed.includes(n)),
    ...allowed.filter((n) => !notes.includes(n)),
  ]
    .slice(0, Math.max(2, Math.min(allowed.length, count)))
    .sort((a, b) => a - b);
}
export function finishSession(
  profile: Profile,
  level: number | null,
  results: boolean[],
) {
  const passed =
    results.length > 0 &&
    results.filter(Boolean).length / results.length >= 0.8;
  return {
    ...profile,
    completed: profile.completed + 1,
    level:
      level !== null && passed
        ? Math.max(profile.level, Math.min(lessons.length - 1, level + 1))
        : profile.level,
    passedLessons:
      level !== null && passed
        ? [...new Set([...profile.passedLessons, level])]
        : profile.passedLessons,
  };
}
