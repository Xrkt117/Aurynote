import { useEffect, useRef, useState } from 'react';
import { ArrowRight, RotateCcw, Check, X, Volume2, Pause } from 'lucide-react';
import { useStudio } from './context';
import { lessons, noteName, sounding, weightedNote } from './music';
import { record } from './store';
import { voice } from './audio';
import { Piano, Stepper, Wave, Tag } from './components';
type Phase='learn'|'quiz'|'result'|'complete';
export default function Ear() {
  const {profile,setProfile,notify,go}=useStudio();
  const [phase,setPhase]=useState<Phase>('learn'),[busy,setBusy]=useState(false),[target,setTarget]=useState(0),[choice,setChoice]=useState<number|null>(null),[active,setActive]=useState<number[]>([]),[results,setResults]=useState<boolean[]>([]),[degree,setDegree]=useState(false),[paused,setPaused]=useState(false);
  const level=useRef(profile.level).current, pool=degree?[0,2,4,5,7,9,11]:lessons[level].notes, goal=Math.max(10,pool.length*2);
  const generation=useRef(0), queue=useRef<number[]>([]), answerLock=useRef(false);
  useEffect(()=>()=>{generation.current++;voice.stop();},[]);
  useEffect(()=>{ if(phase!=='result'||paused||busy)return; const timer=setTimeout(next,choice===target?1400:3200);return()=>clearTimeout(timer); },[phase,paused,busy]);
  const label=(n:number)=>degree?`${[0,2,4,5,7,9,11].indexOf(n)+1}${n===0?' · root':''}`:noteName(n);
  async function play(values:number[],reveal=false) {
    const token=++generation.current;setBusy(true);
    try { await voice.play(values.map(n=>sounding(n,profile.instrument,profile.written)),profile.instrument,n=>{if(token===generation.current&&reveal)setActive(n===null?[]:[n+(profile.instrument==='tenor'&&profile.written?14:0)]);},false,.5); }
    catch{notify('Audio could not start. Check your output device and try Replay.');}
    finally{if(token===generation.current)setBusy(false);}
  }
  function ask(n:number) {setTarget(n);setChoice(null);setActive([]);setPhase('quiz');setPaused(false);answerLock.current=false;void play(degree?[60,64,67,72,60+n]:profile.reference?[60,60+n]:[60+n]);}
  function begin(){setResults([]);queue.current=[...pool].sort(()=>Math.random()-.5);ask(queue.current.shift()!);}
  function next(){
    generation.current++;voice.stop();setBusy(false);setActive([]);
    if(results.length>=goal){setPhase('complete');const passed=results.filter(Boolean).length/results.length>=.8;
      setProfile(p=>({...p,completed:p.completed+1,level:!degree&&passed?Math.max(p.level,Math.min(4,level+1)):p.level}));return;}
    ask(queue.current.shift()??weightedNote(pool,profile.errors));
  }
  function answer(n:number){if(phase!=='quiz'||busy||answerLock.current)return;answerLock.current=true;setChoice(n);setResults(r=>[...r,n===target]);setProfile(p=>record(p,target,n===target,'ear'));setPhase('result');if(n!==target)void play([60+n,60+target],true);else setActive([target]);}
  function compare(){setPaused(true);void play([60+choice!,60+target],true);}
  const right=choice===target;
  if(phase==='complete')return <div className="page session-complete"><div className="complete-symbol"><Check size={38}/></div><span className="eyebrow">A LITTLE BETTER THAN BEFORE</span><h1>That's a good<br/><em>place to grow.</em></h1><p>You recognized {results.filter(Boolean).length} of {goal} notes.</p><div className="result-dots">{results.map((r,i)=><i key={i} className={r?'right':'wrong'}/>)}</div><p>{results.filter(Boolean).length/goal>=.8&&!degree&&level<4?'Your next lesson is unlocked. A few new notes are waiting.':'Every comparison helps. Missed notes will return more often in your practice.'}</p><div className="button-row"><button className="primary" onClick={()=>go('studio')}>Back to your studio <ArrowRight size={16}/></button><button onClick={()=>{setPhase('learn');setResults([]);}}>Practice again</button></div></div>;
  return <div className="page lesson-page"><div className="page-heading"><div><span className="eyebrow">EAR TRAINING / LESSON {String(level+1).padStart(2,'0')}</span><h1>{degree?'Find the note in the key.':lessons[level].name}</h1><p>{phase==='learn'?'Get to know these sounds. There is no timer and no score yet.':'Trust your ears. You can replay as often as you need.'}</p></div><Tag>{pool.length} notes · {goal} questions</Tag></div>
    <Stepper stage={phase==='learn'?0:phase==='quiz'?1:2}/>
    <div className="lesson-layout"><section className="lesson-main panel"><div className="panel-top"><span className="eyebrow">{phase==='learn'?'01 / MEET YOUR NOTES':`QUESTION ${Math.min(results.length+(phase==='quiz'?1:0),goal)} / ${goal}`}</span>{phase!=='learn'&&<div className="tiny-dots">{Array.from({length:goal},(_,i)=><i key={i} className={i<results.length?(results[i]?'right':'wrong'):''}/>)}</div>}</div>
      <div className="listen-area"><Wave playing={busy}/><h2>{phase==='learn'?'First, just listen.':phase==='result'?(right?'You heard it.':'Listen to the difference.'):'What did you hear?'}</h2><p>{phase==='learn'?'Tap a note below and notice its character.':phase==='result'?`${noteName(choice!)} ${right?'is correct.':`was your answer. The note was ${noteName(target)}.`}`:degree?'A C-major pattern, then one mystery note.':profile.reference?'Reference C first. Name the second note.':'Listen to the mystery note.'}</p></div>
      <div className={`answer-grid ${pool.length>7?'many':''}`}>{pool.map((n,i)=><button key={n} disabled={phase==='result'||(phase==='quiz'&&busy)} className={`note-choice ${phase==='result'&&n===target?'correct-choice':''} ${phase==='result'&&n===choice&&!right?'wrong-choice':''}`} onClick={()=>phase==='learn'?void play([60+n],true):answer(n)}><span>{label(n)}</span><small>{phase==='learn'?<Volume2 size={14}/>:String(i+1).padStart(2,'0')}</small></button>)}</div>
      <Piano active={active} pool={phase==='learn'?pool:[]} onPlay={phase==='learn'?n=>void play([60+n],true):undefined}/>
      {phase==='result'&&<div className={`feedback ${right?'success':'mistake'}`} role="status"><div>{right?<Check size={19}/>:<X size={19}/>}<strong>{right?'Correct':'Not quite'} · {label(target)}</strong></div><span>{paused?'Paused for a closer listen.':busy?'Comparing your note with the answer…':`Next question in ${right?'1.4':'3.2'} seconds`}</span>{!paused&&!busy&&<i className="countdown" style={{animationDuration:`${right?1.4:3.2}s`}}/>}</div>}
      <div className="lesson-actions">{phase==='learn'?<button className="primary" onClick={begin}>I'm ready. Let's listen <ArrowRight size={16}/></button>:phase==='quiz'?<button onClick={()=>ask(target)} disabled={busy}><RotateCcw size={15}/>Replay note</button>:<><button onClick={()=>setPaused(p=>!p)}><Pause size={15}/>{paused?'Resume':'Pause'}</button>{!right&&<button onClick={compare}><Volume2 size={15}/>Compare again</button>}<button className="primary" onClick={next}>Next <ArrowRight size={15}/></button></>}</div>
    </section><aside className="lesson-aside"><div className="tip-card"><span className="eyebrow">A SMALL LISTENING TIP</span><span className="serif-symbol">♪</span><h3>Listen for the distance.</h3><p>Use C as home. Does the next note feel close, or like a bigger step? You are building relationships, not memorizing a sound in isolation.</p></div><div className="settings-card"><span className="eyebrow">MAKE IT YOURS</span><label className="toggle-row">Reference C<input type="checkbox" checked={profile.reference} disabled={phase!=='learn'||degree} onChange={e=>setProfile(p=>({...p,reference:e.target.checked}))}/></label><label className="toggle-row">Scale-degree mode<input type="checkbox" checked={degree} disabled={phase!=='learn'} onChange={e=>{voice.stop();setDegree(e.target.checked);setActive([]);}}/></label><p className="micro muted">Your instrument and pitch notation are in the top bar.</p></div><p className="micro aside-note">Mistakes are useful here. The notes you find difficult come back more often.</p></aside></div>
  </div>;
}
