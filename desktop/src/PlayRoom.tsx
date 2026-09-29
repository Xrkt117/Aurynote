import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  ArrowRight,
  Check,
  ShieldCheck,
} from "lucide-react";
import { useStudio } from "./context";
import { detectPitch, voice } from "./audio";
import { sounding, octaveName, noteName, frequency } from "./music";
import { record } from "./store";
import { Piano, Tag } from "./components";
export default function PlayRoom() {
  const { profile, setProfile, notify } = useStudio();
  const [target, setTarget] = useState(
      profile.instrument === "tenor" ? 62 : 60,
    ),
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
  const sound = sounding(target, profile.instrument, profile.written);
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
      await voice.play([sound], profile.instrument);
    } catch {
      notify("Audio output unavailable.");
    } finally {
      setBusy(false);
    }
  }
  const displayHeard = heard
    ? heard.midi + (profile.instrument === "tenor" && profile.written ? 14 : 0)
    : null;
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE LISTENING ROOM</span>
          <h1>
            From hearing it
            <br />
            to <em>playing it.</em>
          </h1>
          <p>
            Listen to the target. Play or sing one steady note. Watch it come
            into focus.
          </p>
        </div>
        <Tag>Live pitch feedback</Tag>
      </div>
      <div className="play-room-grid">
        <section className="panel pitch-panel">
          <div className="panel-top">
            <span className="eyebrow">YOUR NOTE TO PLAY</span>
            <span className={`live-status ${listening ? "on" : ""}`}>
              <i />
              {listening
                ? "Listening on device"
                : requesting
                  ? "Waiting for permission"
                  : "Microphone off"}
            </span>
          </div>
          <div className="target-note">
            <span>{noteName(target)}</span>
            <small>{Math.floor(target / 12) - 1}</small>
          </div>
          <p className="centered muted">
            {profile.instrument === "tenor" && profile.written
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
          <div className="lesson-actions">
            <button
              className="text-button"
              onClick={() => {
                stop();
                voice.stop();
                setMatched(false);
                setHeard(null);
                const pool =
                  profile.instrument === "tenor"
                    ? [62, 64, 66, 67, 69]
                    : [60, 62, 64, 67, 69];
                setTarget(
                  pool.filter((n) => n !== target)[
                    Math.floor(Math.random() * 4)
                  ],
                );
              }}
            >
              Try another note <ArrowRight size={16} />
            </button>
          </div>
        </section>
        <aside className="lesson-aside">
          <div className="tip-card">
            <span className="eyebrow">A BRIDGE TO REAL PLAYING</span>
            <span className="serif-symbol">♩</span>
            <h3>Slow is a good tempo.</h3>
            <p>1. Hear the target with your headphones.</p>
            <p>2. Start the microphone.</p>
            <p>
              3. Play a single, sustained note. Hold it in tune for a moment.
            </p>
          </div>
          <div className="privacy-card">
            <ShieldCheck size={20} />
            <h3>
              Only your ears.
              <br />
              Only your device.
            </h3>
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
