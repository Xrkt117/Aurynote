import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Volume2 } from "lucide-react";
import { useStudio } from "./context";
import { staffNote, sounding } from "./music";
import { record } from "./store";
import { voice } from "./audio";
import { Staff, Tag } from "./components";
export default function StaffPractice() {
  const { profile, setProfile, notify } = useStudio();
  const [bass, setBass] = useState(false),
    [accidentals, setAccidentals] = useState(false),
    [typing, setTyping] = useState(false),
    [text, setText] = useState(""),
    [question, setQuestion] = useState(() => staffNote(30)),
    [options, setOptions] = useState(["E", "C", "G", "B"]),
    [result, setResult] = useState<boolean | null>(null),
    [round, setRound] = useState(1),
    [score, setScore] = useState({ correct: 0, total: 0 });
  const locked = useRef(false);
  useEffect(() => () => voice.stop(), []);
  useEffect(() => {
    if (result === null) return;
    const timer = setTimeout(() => next(), result ? 1400 : 3200);
    return () => clearTimeout(timer);
  }, [result]);
  function next(newBass = bass, newAcc = accidentals) {
    voice.stop();
    const q = staffNote(
      (newBass ? 14 : 28) + Math.floor(Math.random() * 13),
      newAcc ? Math.floor(Math.random() * 3) - 1 : 0,
    );
    setQuestion(q);
    const names = new Set([q.name]);
    while (names.size < 4)
      names.add(
        staffNote(28 + Math.floor(Math.random() * 7), q.accidental).name,
      );
    setOptions([...names].sort(() => Math.random() - 0.5));
    setText("");
    setResult(null);
    setRound((n) => n + 1);
    locked.current = false;
  }
  function answer(value: string) {
    if (locked.current || !value.trim()) return;
    locked.current = true;
    const normalized =
      value.trim()[0].toUpperCase() +
      value.trim().slice(1).replaceAll("#", "♯").replaceAll("b", "♭");
    const right = normalized === question.name;
    setResult(right);
    setScore((s) => ({
      correct: s.correct + (right ? 1 : 0),
      total: s.total + 1,
    }));
    setProfile((p) =>
      record(p, ((question.midi % 12) + 12) % 12, right, "staff"),
    );
  }
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">READ THE STAFF</span>
          <h1>
            Make the page <em>sing.</em>
          </h1>
          <p>One symbol at a time. Connect the written note to its sound.</p>
        </div>
        <Tag>
          {score.correct} / {score.total} correct
        </Tag>
      </div>
      <div className="lesson-layout">
        <section className="panel staff-panel">
          <div className="panel-top">
            <span className="eyebrow">
              QUESTION {String(round).padStart(2, "0")}
            </span>
            <div className="segmented">
              <button
                className={!bass ? "selected" : ""}
                onClick={() => {
                  setBass(false);
                  next(false);
                }}
              >
                Treble
              </button>
              <button
                className={bass ? "selected" : ""}
                onClick={() => {
                  setBass(true);
                  next(true);
                }}
              >
                Bass
              </button>
            </div>
          </div>
          <Staff
            step={question.step}
            accidental={question.accidental}
            bass={bass}
          />
          <div className="centered">
            <h2>What note is on the staff?</h2>
            <p className="muted">
              Include the sharp or flat. An octave number isn't needed.
            </p>
          </div>
          {typing ? (
            <form
              className="typing-answer"
              onSubmit={(e) => {
                e.preventDefault();
                answer(text);
              }}
            >
              <input
                aria-label="Your note answer"
                placeholder="For example, F#"
                value={text}
                disabled={result !== null}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                className="primary"
                disabled={result !== null || !text.trim()}
              >
                Check answer <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <div className="answer-grid four">
              {options.map((n) => (
                <button
                  className={`note-choice ${result !== null && n === question.name ? "correct-choice" : ""}`}
                  key={n}
                  disabled={result !== null}
                  onClick={() => answer(n)}
                >
                  <span>{n}</span>
                </button>
              ))}
            </div>
          )}
          {result !== null ? (
            <div
              className={`feedback ${result ? "success" : "mistake"}`}
              role="status"
            >
              <strong>
                {result ? "Correct" : "Not quite"} · {question.name}
              </strong>
              <span>Next note in {result ? "1.4" : "3.2"} seconds</span>
              <i
                className="countdown"
                style={{ animationDuration: `${result ? 1.4 : 3.2}s` }}
              />
            </div>
          ) : (
            <div className="feedback neutral">
              <span>Take a breath. Count from a note you already know.</span>
            </div>
          )}
          <div className="lesson-actions">
            <button
              onClick={() =>
                void voice
                  .play(
                    [
                      sounding(
                        question.midi,
                        profile.instrument,
                        profile.written,
                      ),
                    ],
                    profile.instrument,
                  )
                  .catch(() =>
                    notify("Audio unavailable. Check your output device."),
                  )
              }
            >
              <Volume2 size={16} />
              Hear this note
            </button>
            <button className="text-button" onClick={() => next()}>
              Skip note <ArrowRight size={16} />
            </button>
          </div>
        </section>
        <aside className="lesson-aside">
          <div className="tip-card">
            <span className="eyebrow">YOUR LANDMARKS</span>
            <span className="serif-symbol">{bass ? "𝄢" : "𝄞"}</span>
            <h3>{bass ? "Bass clef" : "Treble clef"}</h3>
            <p>From the bottom up:</p>
            <div className="landmarks">
              <small>LINES</small>
              <strong>
                {bass ? "G · B · D · F · A" : "E · G · B · D · F"}
              </strong>
              <small>SPACES</small>
              <strong>{bass ? "A · C · E · G" : "F · A · C · E"}</strong>
            </div>
          </div>
          <div className="settings-card">
            <span className="eyebrow">CHALLENGE SETTINGS</span>
            <label className="toggle-row">
              Sharps & flats
              <input
                type="checkbox"
                checked={accidentals}
                onChange={(e) => {
                  setAccidentals(e.target.checked);
                  next(bass, e.target.checked);
                }}
              />
            </label>
            <label className="toggle-row">
              Type your answer
              <input
                type="checkbox"
                checked={typing}
                onChange={(e) => {
                  setTyping(e.target.checked);
                  next();
                }}
              />
            </label>
          </div>
        </aside>
      </div>
    </div>
  );
}
