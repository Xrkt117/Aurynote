import { describe, expect, it } from 'vitest';
import { arrangement, scales, chords, sounding, spell, staffNote, weightedNote, frequency } from '../src/music';
import { decode, fresh, record } from '../src/store';
import { detectPitch } from '../src/audio';
describe('instrument-aware theory',()=>{
  it('turns concert C major into written D major for tenor',()=>{
    const tenor=arrangement(0,scales[0],'tenor',true);
    expect(tenor.map(n=>n.name)).toEqual(['D','E','F♯','G','A','B','C♯','D']);
    expect(tenor.map(n=>n.midi)).toEqual([62,64,66,67,69,71,73,74]);
    expect(tenor.map(n=>n.sound)).toEqual([48,50,52,53,55,57,59,60]);
  });
  it('preserves the sounding key in both notation modes',()=>{
    for(let root=0;root<12;root++)for(const pattern of [...scales,...chords]){
      const written=arrangement(root,pattern,'tenor',true),concert=arrangement(root,pattern,'tenor',false);
      written.forEach((tone,i)=>expect(sounding(tone.midi,'tenor')).toBe(concert[i].sound));
    }
  });
  it('spells notes by degree, including double accidentals',()=>{
    expect(spell(8,3,'♭3')).toBe('C♭');expect(spell(0,9,'♭♭7')).toBe('B♭♭');expect(spell(0,8,'♯5')).toBe('G♯');
    for(let root=0;root<12;root++)for(const pattern of [...scales,...chords])for(const tone of arrangement(root,pattern,'piano',false)){
      const natural=[0,2,4,5,7,9,11]['CDEFGAB'.indexOf(tone.name[0])];
      const alter=[...tone.name].filter(n=>n==='♯').length-[...tone.name].filter(n=>n==='♭').length;
      expect((natural+alter+12)%12).toBe(tone.midi%12);
    }
  });
  it('keeps tenor scales in their ordinary written range',()=>{for(let root=0;root<12;root++)for(const scale of scales)for(const note of arrangement(root,scale,'tenor',true)){expect(note.midi).toBeGreaterThanOrEqual(58);expect(note.midi).toBeLessThanOrEqual(90);}});
  it('maps staff lines and middle C',()=>{expect(staffNote(28).midi).toBe(60);expect(staffNote(30).name).toBe('E');expect(staffNote(18).midi).toBe(43);});
});
describe('practice memory',()=>{
  it('recovers from corrupt and unexpected saved data',()=>{expect(decode('{bad')).toEqual(fresh());expect(decode('null')).toEqual(fresh());expect(decode(JSON.stringify({version:1,level:900,volume:-1,attempts:[null,{}]})).level).toBe(4);});
  it('records once and raises the priority of a missed note',()=>{const next=record(fresh(),7,false,'ear');expect(next.attempts).toHaveLength(1);expect(next.errors[7]).toBe(2);expect(weightedNote([0,7],next.errors,()=>.5)).toBe(7);});
  it('never returns a note outside the lesson',()=>{for(let i=0;i<100;i++)expect([0,7]).toContain(weightedNote([0,7],Array(12).fill(3)));});
  it('keeps only the most recent 2,000 answers',()=>{let p=fresh();for(let i=0;i<2005;i++)p=record(p,0,true,'ear');expect(p.attempts).toHaveLength(2000);expect(p.learned).toEqual([0]);});
});
describe('local pitch detection',()=>{
  for(const rate of [44100,48000])for(const midi of [36,48,60,69,81])it(`recognizes ${midi} at ${rate}Hz`,()=>{
    const buffer=Float32Array.from({length:4096},(_,i)=>.25*Math.sin(2*Math.PI*frequency(midi)*i/rate)+.08*Math.sin(4*Math.PI*frequency(midi)*i/rate));
    const result=detectPitch(buffer,rate);expect(result?.midi).toBe(midi);expect(Math.abs(result?.cents||0)).toBeLessThan(6);
  });
  it('rejects silence and low-level noise',()=>{expect(detectPitch(new Float32Array(4096),48000)).toBeNull();expect(detectPitch(Float32Array.from({length:4096},()=>Math.random()*.001),48000)).toBeNull();});
});
