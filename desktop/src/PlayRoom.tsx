import { writtenOffset } from "./tuning";
import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Check,
  ShieldCheck,
} from "lucide-react";
import { useStudio } from "./context";
import { detectPitch, voice } from "./audio";
import { sounding, octaveName, noteName, frequency } from "./music";
import { record } from "./store";
import { Piano, Tag } from "./components";
export default function PlayRoom() {
  const { profile, setProfile, notify, settingsOpen } = useStudio();
  const [target, setTarget] = useState(60),
    [listening, setListening] = useState(false),
    [requesting, setRequesting] = useState(false),
    [heard, setHeard] = useState<ReturnType<typeof detectPitch>>(null),
    [matched, setMatched] = useState(false),
    [busy, setBusy] = useState(false);
  const stream = useRef<MediaStream | null>(null),
    context = useRef<AudioContext | null>(null),
    raf = useRef(0),
    generation = useRef(0),
    hold = useRef(0);
  const sound = sounding(target, profile.tuning, profile.written);
  const targetNotes = Array.from({ length: 12 }, (_, pitchClass) => 60 + pitchClass);
  function stop() {
    generation.current++;
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    void context.current?.close();
    context.current = null;
    hold.current = 0;
    setListening(false);
    setRequesting(false);
  }
  useEffect(
    () => () => {
      generation.current++;
      cancelAnimationFrame(raf.current);
      stream.current?.getTracks().forEach((t) => t.stop());
      void context.current?.close();
      voice.stop();
    },
    [],
  );
  useEffect(() => {
    if (settingsOpen) stop();
  }, [settingsOpen]);
  async function start() {
    stop();
    voice.stop();
    setMatched(false);
    setHeard(null);
    setRequesting(true);
    const token = generation.current;
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });
      if (token !== generation.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      const ctx = new AudioContext();
      context.current = ctx;
      await ctx.resume();
      if (token !== generation.current) return;
      const source = ctx.createMediaStreamSource(media),
        analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      const buffer = new Float32Array(analyser.fftSize);
      setListening(true);
      setRequesting(false);
      let previous = 0;
      function tick(now: number) {
        if (token !== generation.current) return;
        if (now - previous > 80) {
          previous = now;
          analyser.getFloatTimeDomainData(buffer);
          const pitch = detectPitch(buffer, ctx.sampleRate);
          setHeard(pitch);
          if (pitch?.midi === sound && Math.abs(pitch.cents) < 35) {
            if (!hold.current) hold.current = now;
            if (now - hold.current > 650) {
              setMatched(true);
              setProfile((p) => record(p, target % 12, true, "play"));
              stop();
              return;
            }
          } else hold.current = 0;
        }
        raf.current = requestAnimationFrame(tick);
      }
      raf.current = requestAnimationFrame(tick);
    } catch (error) {
      if (token !== generation.current) return;
      stop();
      notify(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone access was declined. Allow it in your device settings, then try again."
          : "No microphone could be opened. Connect an input device and try again.",
      );
    }
  }
  async function reference() {
    stop();
    setBusy(true);
    try {
      await voice.play([sound], profile.sound);
    } catch {
      notify("Audio output unavailable.");
    } finally {
      setBusy(false);
    }
  }
  function chooseTarget(next: number) {
    stop();
    voice.stop();
    setMatched(false);
    setHeard(null);
    setTarget(next);
  }
  function randomTarget() {
    const choices = targetNotes.filter((note) => note !== target);
    chooseTarget(choices[Math.floor(Math.random() * choices.length)]);
  }
  const displayHeard = heard
    ? heard.midi + writtenOffset(profile.tuning, profile.written)
    : null;
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Microphone practice</span>
          <h1>Pitch matching</h1>
          <p>Listen to the target, then play or sing one steady note.</p>
        </div>
        <Tag>Live pitch feedback</Tag>
      </div>
      <div className="play-room-grid">
        <section className="panel pitch-panel">
          <div className="panel-top">
            <span className="eyebrow">Target note</span>
            <span className={`live-status ${listening ? "on" : ""}`}>
              <i />
              {listening
                ? "Listening on device"
                : requesting
                  ? "Waiting for permission"
                  : "Microphone off"}
            </span>
          </div>
          <div className="target-picker">
            <label>
              Choose a note
              <select
                aria-label="Pitch matching target"
                value={target}
                onChange={(event) => chooseTarget(Number(event.target.value))}
              >
                {targetNotes.map((note) => (
                  <option key={note} value={note}>
                    {octaveName(note)}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={randomTarget}>Random target</button>
          </div>
          <div className="target-note">
            <span>{noteName(target)}</span>
            <small>{Math.floor(target / 12) - 1}</small>
          </div>
          <p className="centered muted">
            {writtenOffset(profile.tuning, profile.written) !== 0
              ? `Written ${octaveName(target)} · sounds ${octaveName(sound)}`
              : `Concert ${octaveName(sound)}`}{" "}
            · {frequency(sound).toFixed(1)} Hz
          </p>
          <div className="button-row">
            <button
              onClick={() => void reference()}
              disabled={busy || requesting}
            >
              <Volume2 size={16} />
              Hear target
            </button>
            <button
              className="primary"
              disabled={busy || requesting}
              onClick={() => (listening ? stop() : void start())}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}{" "}
              {listening
                ? "Stop listening"
                : requesting
                  ? "Opening microphone…"
                  : "Start microphone"}
            </button>
          </div>
          <div
            className={`pitch-feedback ${matched ? "matched" : ""}`}
            role="status"
          >
            {matched ? (
              <>
                <Check size={20} />
                <strong>That's it. You found the note.</strong>
              </>
            ) : (
              <>
                <strong>
                  {heard
                    ? `Hearing ${octaveName(displayHeard!)} · ${heard.cents > 0 ? "+" : ""}${heard.cents.toFixed(0)} cents`
                    : "Your sound will appear here"}
                </strong>
                <span>
                  {listening
                    ? "Play one note and hold it gently."
                    : "Use headphones so the microphone hears your instrument."}
                </span>
              </>
            )}
          </div>
          <div className="tuning-meter">
            <span>FLAT</span>
            <div>
              <i
                style={{
                  left: `${50 + Math.max(-48, Math.min(48, heard?.cents || 0))}%`,
                }}
              />
              <b />
            </div>
            <span>SHARP</span>
          </div>
          <Piano
            active={displayHeard === null ? [] : [displayHeard]}
            pool={[target]}
            root={target}
          />
        </section>
        <aside className="lesson-aside">
          <div className="privacy-card">
            <ShieldCheck size={20} />
            <h3>Microphone privacy</h3>
            <p>
              Pitch is calculated locally. Microphone audio is never stored or
              sent anywhere.
            </p>
          </div>
          <p className="micro muted">
            Best with a quiet room and one note at a time. Chords, background
            noise, and very short piano notes may not register reliably.
          </p>
        </aside>
      </div>
    </div>
  );
}
