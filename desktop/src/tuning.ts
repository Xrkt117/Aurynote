export const tunings = [
  { id: "c", key: "C", examples: "Piano, flute, violin, oboe", offset: 0 },
  {
    id: "c-low",
    key: "C",
    examples: "Guitar, double bass · octave lower",
    offset: 12,
  },
  { id: "c-high", key: "C", examples: "Piccolo · octave higher", offset: -12 },
  {
    id: "bb",
    key: "B♭",
    examples: "Trumpet, clarinet, soprano sax",
    offset: 2,
  },
  {
    id: "tenor",
    key: "B♭",
    examples: "Tenor sax, bass clarinet · octave lower",
    offset: 14,
  },
  { id: "eb", key: "E♭", examples: "Alto sax", offset: 9 },
  {
    id: "baritone",
    key: "E♭",
    examples: "Baritone sax · octave lower",
    offset: 21,
  },
  {
    id: "eb-high",
    key: "E♭",
    examples: "E♭ clarinet · higher register",
    offset: -3,
  },
  { id: "f", key: "F", examples: "Horn, English horn", offset: 7 },
  { id: "a", key: "A", examples: "A clarinet", offset: 3 },
] as const;
export type Tuning = (typeof tunings)[number]["id"];
export function tuningInfo(id: string) {
  return tunings.find((t) => t.id === id) ?? tunings[0];
}
export function writtenOffset(id: string, written = true) {
  return written ? tuningInfo(id).offset : 0;
}
