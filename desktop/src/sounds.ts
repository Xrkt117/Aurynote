export const sounds = [
  { id: "piano", name: "Piano", description: "Percussive, fading strings" },
  { id: "tenor", name: "Sax", description: "Full, sustained reed tone" },
  { id: "clarinet", name: "Clarinet", description: "Warm, hollow reed tone" },
  { id: "flute", name: "Flute", description: "Soft, airy tone" },
  { id: "trumpet", name: "Trumpet", description: "Bright brass tone" },
  { id: "guitar", name: "Guitar", description: "Gentle plucked strings" },
] as const;
export type Sound = (typeof sounds)[number]["id"];
