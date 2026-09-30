import type { Profile } from "./store";
export function achievements(profile: Profile) {
  return [
    {
      id: "first",
      name: "First session",
      detail: "Finish one ear-training session.",
      value: profile.completed,
      target: 1,
    },
    {
      id: "five",
      name: "Five sessions",
      detail: "Finish five ear-training sessions.",
      value: profile.completed,
      target: 5,
    },
    {
      id: "notes",
      name: "Five familiar notes",
      detail: "Recognize five different pitches correctly.",
      value: profile.learned.length,
      target: 5,
    },
    {
      id: "twelve",
      name: "The full octave",
      detail: "Recognize all twelve pitches correctly.",
      value: profile.learned.length,
      target: 12,
    },
    {
      id: "path",
      name: "Guided path complete",
      detail: "Score at least 80% in all five guided lessons.",
      value: profile.passedLessons.length,
      target: 5,
    },
  ].map((a) => ({ ...a, earned: a.value >= a.target }));
}
