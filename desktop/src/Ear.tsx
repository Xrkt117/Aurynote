import { shuffledNotes, resizePool, finishSession } from "./practice";
import CorrectPopup from "./CorrectPopup";
import { writtenOffset } from "./tuning";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, RotateCcw, Check, X, Volume2, Pause } from "lucide-react";
import { useStudio } from "./context";
import { lessons, noteName, sounding, weightedNote } from "./music";
import { record } from "./store";
import { voice } from "./audio";
import { Piano, Wave, Tag } from "./components";
type Phase = "learn" | "quiz" | "result" | "complete";
export default function Ear() {
  const { profile, setProfile, notify, go, settingsOpen } = useStudio();
  const [phase, setPhase] = useState<Phase>("learn"),
    [busy, setBusy] = useState(false),
    [soundLabel, setSoundLabel] = useState(""),
    [target, setTarget] = useState(0),
    [choice, setChoice] = useState<number | null>(null),
    [active, setActive] = useState<number[]>([]),
    [results, setResults] = useState<boolean[]>([]),
    [degree, setDegree] = useState(false),
    [level, setLevel] = useState(profile.level),
    [custom, setCustom] = useState(false),
    [paused, setPaused] = useState(false);
  const natural = [0, 2, 4, 5, 7, 9, 11];
  const pool = custom
    ? degree
      ? resizePool(profile.customNotes, profile.customNotes.length, natural)
      : profile.customNotes
    : degree
      ? natural
      : lessons[level].notes;
  const goal = Math.max(profile.sessionLength, pool.length);
  const generation = useRef(0),
    queue = useRef<number[]>([]),
    answerLock = useRef(false),
    completedLock = useRef(false);
  useEffect(
    () => () => {
      generation.current++;
      voice.stop();
    },
    [],
  );
  useEffect(() => {
    if (phase !== "result" || paused || busy || settingsOpen) return;
    const timer = setTimeout(next, choice === target ? 850 : 3200);
    return () => clearTimeout(timer);
  }, [phase, paused, busy, settingsOpen]);
  const label = (n: number) =>
    degree
      ? `${[0, 2, 4, 5, 7, 9, 11].indexOf(n) + 1}${n === 0 ? " · root" : ""}`
      : noteName(n);
  async function play(values: number[], reveal = false, labels: string[] = []) {
    const token = ++generation.current;
    setBusy(true);
    let position = 0;
    try {
      await voice.play(
        values.map((n) => sounding(n, profile.tuning, profile.written)),
        profile.sound,
        (n) => {
          if (token === generation.current)
            setSoundLabel(
              n === null ? "" : (labels[position++] ?? "Listen to the note"),
            );
          if (token === generation.current && reveal)
            setActive(
              n === null
                ? []
                : [n + writtenOffset(profile.tuning, profile.written)],
            );
        },
        false,
        0.5,
      );
    } catch {
      notify("Audio could not start. Check your output device and try Replay.");
    } finally {
      if (token === generation.current) {
        setBusy(false);
        setSoundLabel("");
        setActive([]);
      }
    }
  }
  function ask(n: number) {
    setTarget(n);
    setChoice(null);
    setActive([]);
    setPhase("quiz");
    setPaused(false);
    answerLock.current = false;
    void play(
      degree
        ? [60, 64, 67, 72, 60 + n]
        : profile.reference
          ? [60, 60 + n]
          : [60 + n],
      false,
      degree
        ? [
            "Home key · C",
            "Home key · E",
            "Home key · G",
            "Home key · C",
            "Mystery note · your turn",
          ]
        : profile.reference
          ? ["Reference · C", "Mystery note · your turn"]
          : ["Mystery note · your turn"],
    );
  }
  function begin() {
    setResults([]);
    completedLock.current = false;
    queue.current = shuffledNotes(pool);
    ask(queue.current.shift()!);
  }
  function next() {
    generation.current++;
    voice.stop();
    setBusy(false);
    setActive([]);
    if (results.length >= goal) {
      setPhase("complete");
      if (!completedLock.current) {
        completedLock.current = true;
        setProfile((p) =>
          finishSession(p, !degree && !custom ? level : null, results),
        );
      }
      return;
    }
    ask(queue.current.shift() ?? weightedNote(pool, profile.errors));
  }
  function answer(n: number) {
    if (phase !== "quiz" || busy || answerLock.current) return;
    answerLock.current = true;
    setChoice(n);
    setResults((r) => [...r, n === target]);
    setProfile((p) => record(p, target, n === target, "ear"));
    setPhase("result");
    if (n !== target)
      void play([60 + n, 60 + target], true, [
        `Your answer · ${noteName(n)}`,
        `Correct note · ${noteName(target)}`,
      ]);
    else setActive([target]);
  }
  function configure(nextLevel = level) {
    generation.current++;
    voice.stop();
    setBusy(false);
    setActive([]);
    setSoundLabel("");
    setLevel(nextLevel);
    setPhase("learn");
    setResults([]);
    setChoice(null);
    setPaused(false);
  }
  function compare() {
    setPaused(true);
    void play([60 + choice!, 60 + target], true, [
      `Your answer · ${noteName(choice!)}`,
      `Correct note · ${noteName(target)}`,
    ]);
  }
  const right = choice === target;
  if (phase === "complete")
    return (
      <div className="page session-complete">
        <div className="complete-symbol">
          <Check size={38} />
        </div>
        <span className="eyebrow">A LITTLE BETTER THAN BEFORE</span>
        <h1>
          Session <em>complete.</em>
        </h1>
        <p>
          {Math.round((results.filter(Boolean).length / goal) * 100)}% correct ·{" "}
          {results.filter(Boolean).length} of {goal} answers across{" "}
          {pool.length} notes.
        </p>
        <div className="result-dots">
          {results.map((r, i) => (
            <i key={i} className={r ? "right" : "wrong"} />
          ))}
        </div>
        <p>
          {results.filter(Boolean).length / goal >= 0.8 &&
          !degree &&
          !custom &&
          level < 4
            ? "Your next lesson is unlocked. A few new notes are waiting."
            : custom
              ? "Custom session saved. Change your notes or practice this set again."
              : profile.passedLessons.length === 5
                ? "You have passed all five guided lessons. The full octave is yours to practice."
                : "Session saved. Aim for 80% to pass this guided lesson."}
        </p>
        <div className="button-row">
          {!custom &&
            !degree &&
            results.filter(Boolean).length / goal >= 0.8 &&
            level < 4 && (
              <button className="primary" onClick={() => configure(level + 1)}>
                Next lesson · {lessons[level + 1].notes.length} notes{" "}
                <ArrowRight size={16} />
              </button>
            )}
          <button onClick={() => go("studio")}>Back to your studio</button>
          <button
            onClick={() => {
              configure();
            }}
          >
            Choose notes / practice again
          </button>
        </div>
      </div>
    );
  return (
    <div className="page lesson-page">
      {phase === "result" && right && !settingsOpen && <CorrectPopup />}
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            EAR TRAINING /{" "}
            {custom
              ? "CUSTOM PRACTICE"
              : `LESSON ${String(level + 1).padStart(2, "0")}`}
          </span>
          <h1>
            {degree
              ? "Find the note in the key."
              : custom
                ? "Your notes. Your pace."
                : lessons[level].name}
          </h1>
          <p>
            {phase === "learn"
              ? "Get to know these sounds. There is no timer and no score yet."
              : "Trust your ears. You can replay as often as you need."}
          </p>
        </div>
        <Tag>
          {pool.length} notes · {goal} questions
        </Tag>
      </div>

      {phase === "learn" && (
        <section className="practice-config panel" aria-label="Practice setup">
          <div className="config-fields">
            <label>
              Practice mode
              <select
                aria-label="Practice mode"
                value={custom ? "custom" : "guided"}
                onChange={(e) => {
                  configure();
                  setCustom(e.target.value === "custom");
                }}
              >
                <option value="guided">Guided lessons</option>
                <option value="custom">Choose my own notes</option>
              </select>
            </label>
            {!custom && (
              <label>
                Lesson
                <select
                  aria-label="Lesson"
                  value={level}
                  disabled={degree}
                  onChange={(e) => configure(Number(e.target.value))}
                >
                  {lessons.map((lesson, i) => (
                    <option key={i} value={i}>
                      {i + 1}. {lesson.name} · {lesson.notes.length} notes
                    </option>
                  ))}
                </select>
              </label>
            )}
            {custom && (
              <label>
                Number of notes
                <select
                  aria-label="Number of notes"
                  value={pool.length}
                  onChange={(e) => {
                    configure();
                    setProfile((p) => ({
                      ...p,
                      customNotes: resizePool(
                        pool,
                        Number(e.target.value),
                        degree ? natural : undefined,
                      ),
                    }));
                  }}
                >
                  {Array.from({ length: (degree ? 7 : 12) - 1 }, (_, i) => (
                    <option key={i} value={i + 2}>
                      {i + 2} notes
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Session length
              <select
                aria-label="Session length"
                value={profile.sessionLength}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    sessionLength: Number(e.target.value),
                  }))
                }
              >
                {[...new Set([5, 10, 15, 20, 30, 40, profile.sessionLength])]
                  .sort((a, b) => a - b)
                  .map((n) => (
                    <option key={n} value={n}>
                      {n} questions
                    </option>
                  ))}
              </select>
            </label>
          </div>
          {custom && (
            <div className="note-picker" aria-label="Choose practice notes">
              {Array.from({ length: 12 }, (_, n) => (
                <button
                  key={n}
                  aria-pressed={pool.includes(n)}
                  disabled={
                    (degree && !natural.includes(n)) ||
                    (pool.length === 2 && pool.includes(n))
                  }
                  onClick={() => {
                    configure();
                    setProfile((p) => ({
                      ...p,
                      customNotes: pool.includes(n)
                        ? pool.filter((v) => v !== n)
                        : [...pool, n].sort((a, b) => a - b),
                    }));
                  }}
                >
                  {noteName(n)}
                </button>
              ))}
            </div>
          )}
          <p className="micro muted">
            {pool.length} notes: {pool.map(noteName).join(" · ")}. {goal}{" "}
            questions.
            {goal > profile.sessionLength
              ? " The session includes every selected note at least once."
              : ""}
          </p>
        </section>
      )}
      <div className="lesson-layout">
        <section className="lesson-main panel">
          <div className="panel-top">
            <span className="eyebrow">
              {phase === "learn"
                ? "01 / MEET YOUR NOTES"
                : `QUESTION ${Math.min(results.length + (phase === "quiz" ? 1 : 0), goal)} / ${goal}`}
            </span>
            {phase !== "learn" && (
              <div className="tiny-dots">
                {Array.from({ length: goal }, (_, i) => (
                  <i
                    key={i}
                    className={
                      i < results.length ? (results[i] ? "right" : "wrong") : ""
                    }
                  />
                ))}
              </div>
            )}
          </div>
          <div className="listen-area" key={`${phase}-${results.length}`}>
            <div className="listening-status" role="status">
              {busy
                ? soundLabel || "Preparing sound…"
                : phase === "quiz"
                  ? "Your turn · choose a note"
                  : phase === "learn"
                    ? "Explore · tap to listen"
                    : "Review your answer"}
            </div>
            <Wave playing={busy} />
            <h2>
              {phase === "learn"
                ? "First, just listen."
                : phase === "result"
                  ? right
                    ? "You heard it."
                    : "Listen to the difference."
                  : "What did you hear?"}
            </h2>
            <p>
              {phase === "learn"
                ? "Tap a note below and notice its character."
                : phase === "result"
                  ? `${noteName(choice!)} ${right ? "is correct." : `was your answer. The note was ${noteName(target)}.`}`
                  : degree
                    ? "A C-major pattern, then one mystery note."
                    : profile.reference
                      ? "Reference C first. Name the second note."
                      : "Listen to the mystery note."}
            </p>
          </div>
          <div className={`answer-grid ${pool.length > 7 ? "many" : ""}`}>
            {pool.map((n, i) => (
              <button
                key={n}
                disabled={phase === "result" || (phase === "quiz" && busy)}
                className={`note-choice ${phase === "result" && n === target ? "correct-choice" : ""} ${phase === "result" && n === choice && !right ? "wrong-choice" : ""}`}
                onClick={() =>
                  phase === "learn"
                    ? void play([60 + n], true, [`Playing · ${noteName(n)}`])
                    : answer(n)
                }
              >
                <span>{label(n)}</span>
                <small>
                  {phase === "learn" ? (
                    <Volume2 size={14} />
                  ) : phase === "result" && n === target ? (
                    "✓ Correct note"
                  ) : phase === "result" && n === choice ? (
                    "× Your answer"
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </small>
              </button>
            ))}
          </div>
          <Piano
            onlyPool
            active={active}
            pool={phase === "learn" ? pool : []}
            onPlay={
              phase === "learn"
                ? (n) => {
                    if (pool.includes(n))
                      void play([60 + n], true, [`Playing · ${noteName(n)}`]);
                  }
                : undefined
            }
          />
          {phase === "result" && !right && (
            <div
              className={`feedback ${right ? "success" : "mistake"}`}
              role="status"
            >
              <div>
                {right ? <Check size={19} /> : <X size={19} />}
                <strong>
                  {right ? "Correct" : "Not quite"} · {label(target)}
                </strong>
              </div>
              <span>
                {paused
                  ? "Paused for a closer listen."
                  : busy
                    ? "Comparing your note with the answer…"
                    : `Next question in ${right ? "1.4" : "3.2"} seconds`}
              </span>
              {!paused && !busy && (
                <i
                  className="countdown"
                  style={{ animationDuration: `${right ? 1.4 : 3.2}s` }}
                />
              )}
            </div>
          )}
          <div className="lesson-actions">
            {phase !== "learn" && (
              <button onClick={() => configure()}>Change practice</button>
            )}
            {phase === "learn" ? (
              <button className="primary" onClick={begin}>
                I'm ready. Let's listen <ArrowRight size={16} />
              </button>
            ) : phase === "quiz" ? (
              <button onClick={() => ask(target)} disabled={busy}>
                <RotateCcw size={15} />
                Replay note
              </button>
            ) : !right ? (
              <>
                <button onClick={() => setPaused((p) => !p)}>
                  <Pause size={15} />
                  {paused ? "Resume" : "Pause"}
                </button>
                {!right && (
                  <button onClick={compare}>
                    <Volume2 size={15} />
                    Compare again
                  </button>
                )}
                <button className="primary" onClick={next}>
                  Next <ArrowRight size={15} />
                </button>
              </>
            ) : null}
          </div>
        </section>
        <aside className="lesson-aside">
          <div className="settings-card">
            <span className="eyebrow">MAKE IT YOURS</span>
            <label className="toggle-row">
              Reference C
              <input
                type="checkbox"
                checked={profile.reference}
                disabled={phase !== "learn" || degree}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, reference: e.target.checked }))
                }
              />
            </label>
            <label className="toggle-row">
              Scale-degree mode
              <input
                type="checkbox"
                checked={degree}
                disabled={phase !== "learn"}
                onChange={(e) => {
                  configure();
                  setDegree(e.target.checked);
                  setActive([]);
                }}
              />
            </label>
            <p className="micro muted">
              Choose your instrument key above. Sound and notation are in
              Settings.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
