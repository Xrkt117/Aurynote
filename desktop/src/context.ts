import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Profile } from './store';
export type Page = 'studio'|'ear'|'staff'|'explore'|'play'|'progress';
export const StudioContext = createContext<{profile:Profile;setProfile:Dispatch<SetStateAction<Profile>>;go:(page:Page)=>void;notify:(message:string)=>void}>(null!);
export const useStudio = () => useContext(StudioContext);
