import type { Instrument } from './music';
export interface Attempt { day: string; target: number; right: boolean; mode: string }
export interface Profile { version: 1; instrument: Instrument; written: boolean; volume: number; level: number; attempts: Attempt[]; errors: number[]; learned: number[]; completed: number; reference: boolean }
export const fresh = (): Profile => ({ version:1, instrument:'piano', written:true, volume:0.45, level:0, attempts:[], errors:Array(12).fill(0), learned:[], completed:0, reference:true });
const key = 'aurynote.studio.v1';
export function decode(raw: string | null): Profile {
  try {
    const value = JSON.parse(raw || 'null');
    if (!value || value.version !== 1) return fresh();
    const finite = (n: unknown, min: number, max: number, fallback: number) => typeof n === 'number' && Number.isFinite(n) ? Math.max(min,Math.min(max,n)) : fallback;
    return { ...fresh(), instrument:value.instrument === 'tenor' ? 'tenor' : 'piano', written:value.written !== false, reference:value.reference !== false,
      volume:finite(value.volume,0,1,.45), level:Math.floor(finite(value.level,0,4,0)), completed:Math.floor(finite(value.completed,0,100000,0)),
      errors:Array.from({length:12},(_,i) => finite(value.errors?.[i],0,20,0)), learned:Array.isArray(value.learned) ? value.learned.filter((n: unknown) => Number.isInteger(n) && Number(n)>=0 && Number(n)<12) : [],
      attempts:Array.isArray(value.attempts) ? value.attempts.filter((a: Attempt) => a && /^\d{4}-\d{2}-\d{2}$/.test(a.day) && Number.isInteger(a.target) && a.target>=0 && a.target<12 && typeof a.right==='boolean' && ['ear','staff','play'].includes(a.mode)).slice(-2000) : [] };
  } catch { return fresh(); }
}
export function load(): Profile { try { return decode(localStorage.getItem(key)); } catch { return fresh(); } }
export function save(profile: Profile) { localStorage.setItem(key, JSON.stringify(profile)); }
export function dayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function record(profile: Profile, target: number, right: boolean, mode: string): Profile {
  const errors = [...profile.errors];
  errors[target] = Math.max(0,Math.min(20, errors[target] + (right ? -1 : 2)));
  return { ...profile, errors, attempts:[...profile.attempts,{day:dayKey(),target,right,mode}].slice(-2000), learned:right && mode==='ear' ? [...new Set([...profile.learned,target])] : profile.learned };
}
