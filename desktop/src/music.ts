export type Instrument = 'piano' | 'tenor';
export const notes = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
export const mod = (n: number, d = 12) => ((n % d) + d) % d;
export const noteName = (midi: number) => notes[mod(midi)];
export const octaveName = (midi: number) => `${noteName(midi)}${Math.floor(midi / 12) - 1}`;
export const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
export const sounding = (midi: number, instrument: Instrument, written = true) => midi - (instrument === 'tenor' && written ? 14 : 0);
export interface Pattern { name: string; intervals: number[]; degrees: string[]; symbol?: string; description: string }
export const scales: Pattern[] = [
  { name: 'Major', intervals: [0,2,4,5,7,9,11,12], degrees: ['1','2','3','4','5','6','7','8'], description: 'A bright home base. Start with the root, third, and fifth.' },
  { name: 'Natural minor', intervals: [0,2,3,5,7,8,10,12], degrees: ['1','2','♭3','4','5','♭6','♭7','8'], description: 'A darker color, with a lowered third, sixth, and seventh.' },
  { name: 'Harmonic minor', intervals: [0,2,3,5,7,8,11,12], degrees: ['1','2','♭3','4','5','♭6','7','8'], description: 'The raised seventh creates a strong pull back to the root.' },
  { name: 'Melodic minor', intervals: [0,2,3,5,7,9,11,12], degrees: ['1','2','♭3','4','5','6','7','8'], description: 'The ascending form: minor color with a major sixth and seventh.' },
  { name: 'Major pentatonic', intervals: [0,2,4,7,9,12], degrees: ['1','2','3','5','6','8'], description: 'Five open, versatile notes. A friendly starting point for improvising.' },
  { name: 'Minor pentatonic', intervals: [0,3,5,7,10,12], degrees: ['1','♭3','4','5','♭7','8'], description: 'A five-note vocabulary for blues, rock, and melodic improvisation.' },
  { name: 'Blues', intervals: [0,3,5,6,7,10,12], degrees: ['1','♭3','4','♭5','5','♭7','8'], description: 'The blue note adds tension between the fourth and fifth.' },
  { name: 'Dorian', intervals: [0,2,3,5,7,9,10,12], degrees: ['1','2','♭3','4','5','6','♭7','8'], description: 'Minor with a bright sixth. Explore it over a minor seventh chord.' },
  { name: 'Mixolydian', intervals: [0,2,4,5,7,9,10,12], degrees: ['1','2','3','4','5','6','♭7','8'], description: 'Major with a flat seventh, a useful sound over dominant chords.' },
];
export const chords: Pattern[] = [
  { name:'Major', symbol:'', intervals:[0,4,7], degrees:['1','3','5'], description:'Root, major third, perfect fifth.' },
  { name:'Minor', symbol:'m', intervals:[0,3,7], degrees:['1','♭3','5'], description:'Lower the third to hear the major-to-minor contrast.' },
  { name:'Major seventh', symbol:'Δ7', intervals:[0,4,7,11], degrees:['1','3','5','7'], description:'Also written maj7. A major triad with a major seventh.' },
  { name:'Minor seventh', symbol:'m7', intervals:[0,3,7,10], degrees:['1','♭3','5','♭7'], description:'A minor triad with a minor seventh.' },
  { name:'Dominant seventh', symbol:'7', intervals:[0,4,7,10], degrees:['1','3','5','♭7'], description:'The third and flat seventh create a pull toward resolution.' },
  { name:'Dominant ninth', symbol:'9', intervals:[0,4,7,10,14], degrees:['1','3','5','♭7','9'], description:'A dominant seventh with the ninth above the octave.' },
  { name:'Dominant thirteenth', symbol:'13', intervals:[0,4,7,10,14,21], degrees:['1','3','5','♭7','9','13'], description:'A common extended voicing; the eleventh is omitted.' },
  { name:'Suspended fourth', symbol:'sus4', intervals:[0,5,7], degrees:['1','4','5'], description:'The fourth replaces the third, leaving the harmony open.' },
  { name:'Suspended second', symbol:'sus2', intervals:[0,2,7], degrees:['1','2','5'], description:'The second replaces the third.' },
  { name:'Dominant ninth sus4', symbol:'9sus4', intervals:[0,5,7,10,14], degrees:['1','4','5','♭7','9'], description:'Suspended harmony with a flat seventh and ninth.' },
  { name:'Diminished', symbol:'°', intervals:[0,3,6], degrees:['1','♭3','♭5'], description:'Two stacked minor thirds create a tense triad.' },
  { name:'Diminished seventh', symbol:'°7', intervals:[0,3,6,9], degrees:['1','♭3','♭5','♭♭7'], description:'Four notes separated by minor thirds.' },
  { name:'Half-diminished', symbol:'ø7', intervals:[0,3,6,10], degrees:['1','♭3','♭5','♭7'], description:'Also written m7♭5. A diminished triad with a minor seventh.' },
  { name:'Augmented', symbol:'+', intervals:[0,4,8], degrees:['1','3','♯5'], description:'A major triad with a raised fifth.' },
];
export function spell(root: number, interval: number, degree: string) {
  const letter = mod('CDEFGAB'.indexOf(notes[mod(root)][0]) + Number(degree.replace(/[♭♯]/g,'')) - 1, 7);
  const accidental = mod(root + interval - [0,2,4,5,7,9,11][letter] + 6) - 6;
  return 'CDEFGAB'[letter] + (accidental < 0 ? '♭'.repeat(-accidental) : '♯'.repeat(accidental));
}
export function arrangement(root: number, pattern: Pattern, instrument: Instrument, written: boolean) {
  const concert = (instrument === 'tenor' ? 48 : 60) + root;
  const base = concert + (instrument === 'tenor' && written ? 14 : 0);
  return pattern.intervals.map((interval, i) => ({ midi: base + interval, sound: concert + interval, name: spell(base, interval, pattern.degrees[i]), degree: pattern.degrees[i] }));
}
export const lessons = [
  { name:'Find your first two notes', short:'First steps', notes:[0,7], copy:'Meet C and G. Hear the space between them before you name them.' },
  { name:'Hear the major third', short:'Add a little color', notes:[0,4,7], copy:'Add E to your vocabulary. These three notes form a major chord.' },
  { name:'Open up five notes', short:'Your first palette', notes:[0,2,4,7,9], copy:'Meet D and A. You now have a major pentatonic scale.' },
  { name:'Find every natural note', short:'A complete scale', notes:[0,2,4,5,7,9,11], copy:'Add F and B. Listen for the close steps in the major scale.' },
  { name:'Explore all twelve pitches', short:'Every shade', notes:[0,1,2,3,4,5,6,7,8,9,10,11], copy:'Sharps and flats complete the octave. Take your time with neighboring notes.' },
];
export function weightedNote(pool: number[], errors: number[], random = Math.random) {
  let draw = random() * pool.reduce((sum,n) => sum + 1 + Math.min(5, errors[n] || 0), 0);
  for (const n of pool) { draw -= 1 + Math.min(5, errors[n] || 0); if (draw < 0) return n; }
  return pool[pool.length - 1];
}
export function staffNote(step: number, accidental = 0) {
  return { midi: (Math.floor(step / 7) + 1) * 12 + [0,2,4,5,7,9,11][mod(step,7)] + accidental, name: 'CDEFGAB'[mod(step,7)] + (accidental === 1 ? '♯' : accidental === -1 ? '♭' : ''), step, accidental };
}
