import CorrectPopup from "./CorrectPopup";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Volume2 } from "lucide-react";
import { useStudio } from "./context";
import { staffNote, sounding } from "./music";
import { record } from "./store";
import { voice } from "./audio";
import { Staff, Tag } from "./components";
export default function StaffPractice() {
  const { profile, setProfile, notify, settingsOpen } = useStudio();
  const [bass, setBass] = useState(false),
    [accidentals, setAccidentals] = useState(false),
    [typing, setTyping] = useState(false),
    [text, setText] = useState(""),
    [choice, setChoice] = useState<string | null>(null),
    [question, setQuestion] = useState(() => staffNote(30)),
    [options, setOptions] = useState(["E", "C", "G", "B"]),
    [result, setResult] = useState<boolean | null>(null),
    [round, setRound] = useState(1),
    [score, setScore] = useState({ correct: 0, total: 0 });
  const locked = useRef(false);
  useEffect(() => () => voice.stop(), []);
  useEffect(() => {
    if (result === null || settingsOpen) return;
    const timer = setTimeout(() => next(), result ? 850 : 3200);
    return () => clearTimeout(timer);
  }, [result, settingsOpen]);
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
    setChoice(null);
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
    setChoice(normalized);
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
      {result === true && !settingsOpen && <CorrectPopup />}
      <div className="page-heading">
        <div>
          <span className="eyebrow">Notation</span>
          <h1>Staff reading</h1>
          <p>Identify the displayed note by name.</p>
        </div>
        <Tag>
          {score.correct} / {score.total} correct
        </Tag>
      </div>
      <section className="panel staff-panel">
        <div className="staff-toolbar">
          <div>
            <span className="eyebrow">
              Question {String(round).padStart(2, "0")}
            </span>
            <span className="micro muted">Set the notation challenge</span>
          </div>
          <div className="staff-toolbar-controls">
            <div className="staff-control-group">
              <span>Clef</span>
              <div className="segmented" role="group" aria-label="Clef">
                <button
                  aria-pressed={!bass}
                  className={!bass ? "selected" : ""}
                  onClick={() => {
                    setBass(false);
                    next(false);
                  }}
                >
                  Treble
                </button>
                <button
                  aria-pressed={bass}
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
            <div className="staff-control-group">
              <span>Notes</span>
              <div className="segmented" role="group" aria-label="Notes">
                <button
                  aria-pressed={!accidentals}
                  className={!accidentals ? "selected" : ""}
                  onClick={() => {
                    setAccidentals(false);
                    next(bass, false);
                  }}
                >
                  Natural
                </button>
                <button
                  aria-pressed={accidentals}
                  className={accidentals ? "selected" : ""}
                  onClick={() => {
                    setAccidentals(true);
                    next(bass, true);
                  }}
                >
                  ♯ / ♭
                </button>
              </div>
            </div>
            <div className="staff-control-group">
              <span>Answer</span>
              <div className="segmented" role="group" aria-label="Answer input">
                <button
                  aria-pressed={!typing}
                  className={!typing ? "selected" : ""}
                  onClick={() => {
                    setTyping(false);
                    next();
                  }}
                >
                  Choices
                </button>
                <button
                  aria-pressed={typing}
                  className={typing ? "selected" : ""}
                  onClick={() => {
                    setTyping(true);
                    next();
                  }}
                >
                  Type
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="staff-stage">
          <div className="staff-stage-meta" aria-hidden="true">
            <span>{bass ? "Bass clef" : "Treble clef"}</span>
            <span>{accidentals ? "Accidentals included" : "Natural notes"}</span>
          </div>
          <div
            className="staff-sheet"
            key={`${round}-${question.step}-${question.accidental}`}
          >
            <Staff
              step={question.step}
              accidental={question.accidental}
              bass={bass}
            />
          </div>
        </div>
        <div className="staff-answer-area">
          <div className="staff-answer-heading">
            <div>
              <span className="eyebrow">Your answer</span>
              <h2>What note is shown?</h2>
              <p>Include the sharp or flat. No octave number needed.</p>
            </div>
            <button
              className="staff-listen"
              onClick={() =>
                void voice
                  .play(
                    [sounding(question.midi, profile.tuning, profile.written)],
                    profile.sound,
                  )
                  .catch(() =>
                    notify("Audio unavailable. Check your output device."),
                  )
              }
            >
              <Volume2 size={16} />
              Hear note
            </button>
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
            <div className="answer-grid four staff-answers">
              {options.map((n) => (
                <button
                  className={`note-choice ${result !== null && n === question.name ? "correct-choice" : ""} ${result === false && n === choice ? "wrong-choice" : ""}`}
                  key={n}
                  disabled={result !== null}
                  onClick={() => answer(n)}
                >
                  <span>{n}</span>
                  {result === false && n === choice && <small>Your answer</small>}
                  {result !== null && n === question.name && <small>Correct note</small>}
                </button>
              ))}
            </div>
          )}
          {result === false && (
            <div className="feedback mistake" role="status">
              <strong>Answer: {question.name}</strong>
              <span>Next note in 3.2 seconds</span>
              <i className="countdown" style={{ animationDuration: "3.2s" }} />
            </div>
          )}
          <div className="staff-footer-actions">
            <button className="text-button" onClick={() => next()}>
              Skip note <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
