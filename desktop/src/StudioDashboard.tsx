import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Flame,
  Headphones,
  Mic,
  Music2,
  Play,
  ScanLine,
  Target,
  Volume2,
} from "lucide-react";
import { voice } from "./audio";
import { useStudio, type Page } from "./context";
import { lessons, noteName, sounding } from "./music";
import { dayKey } from "./store";

const waveform = [
  16, 29, 22, 43, 30, 52, 25, 34, 18, 12, 15, 31, 48, 28, 67, 38, 24,
  42, 20, 14, 18, 36, 53, 31, 45, 23,
];

function practiceStreak(days: Set<string>) {
  if (!days.size) return 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function MiniStaff({ position }: { position: number }) {
  const y = 31 - (position % 7) * 3;
  return (
    <svg className="studio-note-staff" viewBox="0 0 86 48" aria-hidden="true">
      {[12, 18, 24, 30, 36].map((line) => (
        <line key={line} x1="4" x2="82" y1={line} y2={line} />
      ))}
      <ellipse cx="47" cy={y} rx="5" ry="3.3" />
      <line className="note-stem" x1="52" x2="52" y1={y} y2={y - 18} />
    </svg>
  );
}

function Metric({
  icon: Icon,
  value,
  suffix,
  label,
  detail,
  children,
}: {
  icon: ComponentType<{ size?: number }>;
  value: string;
  suffix?: string;
  label: string;
  detail: string;
  children?: ReactNode;
}) {
  return (
    <div className="studio-metric">
      <span className="studio-metric-icon" aria-hidden="true">
        <Icon size={20} />
      </span>
      <div>
        <strong>
          {value}
          {suffix && <small>{suffix}</small>}
        </strong>
        <span>{label}</span>
        <small>{detail}</small>
        {children}
      </div>
    </div>
  );
}

export default function StudioDashboard() {
  const { profile, go, notify } = useStudio();
  const lesson = lessons[profile.level];
  const earlierNotes = profile.level ? lessons[profile.level - 1].notes : [];
  const newNotes = lesson.notes.filter((note) => !earlierNotes.includes(note));
  const today = profile.attempts.filter((attempt) => attempt.day === dayKey());
  const accuracy = profile.attempts.length
    ? Math.round(
        (profile.attempts.filter((attempt) => attempt.right).length /
          profile.attempts.length) *
          100,
      )
    : null;
  const streak = practiceStreak(
    new Set(profile.attempts.map((attempt) => attempt.day)),
  );
  const [playing, setPlaying] = useState<number | "all" | null>(null);
  const playback = useRef(0);

  useEffect(
    () => () => {
      playback.current += 1;
      voice.stop();
    },
    [],
  );

  async function preview(notes: number[], marker: number | "all") {
    const token = ++playback.current;
    setPlaying(marker);
    try {
      await voice.play(
        notes.map((note) => sounding(60 + note, profile.tuning, profile.written)),
        profile.sound,
        undefined,
        false,
        0.5,
      );
    } catch {
      notify("Audio could not start. Check your output device and try again.");
    } finally {
      if (token === playback.current) setPlaying(null);
    }
  }

  const exercises: Array<{
    icon: ComponentType<{ size?: number }>;
    title: string;
    copy: string;
    page: Page;
    art: string;
  }> = [
    {
      icon: Headphones,
      title: "Ear training",
      copy: "Identify notes by sound and build recognition with confidence.",
      page: "ear",
      art: "waves",
    },
    {
      icon: ScanLine,
      title: "Read the staff",
      copy: "Identify written notes and connect what you see with what you hear.",
      page: "staff",
      art: "staff",
    },
    {
      icon: Music2,
      title: "Explore harmony",
      copy: "Review scales and chords, then hear how their notes work together.",
      page: "explore",
      art: "harmony",
    },
    {
      icon: BarChart3,
      title: "Play it back",
      copy: "Match a pitch on your instrument with private, live feedback.",
      page: "play",
      art: "bars",
    },
  ];

  return (
    <div className="page dashboard">
      <header className="studio-intro">
        <div>
          <span className="eyebrow">PRACTICE</span>
          <h1>Train your ear</h1>
          <p>Practice pitch recognition, notation, harmony, and playback.</p>
        </div>
        <div className="studio-score" aria-hidden="true">
          <span>♪</span><span>♩</span><span>♪</span><span>♩</span>
        </div>
      </header>

      <div className="studio-feature-grid">
        <section className="studio-lesson-card">
          <div className="studio-card-heading">
            <div>
              <span className="tag">NEXT LESSON</span>
              <span>Ear training · Level {profile.level + 1}</span>
            </div>
            <span>{lesson.notes.length} notes · {newNotes.length} new</span>
          </div>
          <div className="studio-lesson-title">
            <span className="studio-lesson-number">
              {String(profile.level + 1).padStart(2, "0")}
              <small>/ {String(lessons.length).padStart(2, "0")}</small>
            </span>
            <div><h2>{lesson.name}</h2><p>{lesson.copy}</p></div>
          </div>
          <div
            className={`studio-lesson-notes ${lesson.notes.length > 6 ? "compact" : ""}`}
            role="region"
            aria-label="Notes in your next lesson"
          >
            {lesson.notes.map((note, index) => (
              <div className={`studio-note ${newNotes.includes(note) ? "introduced" : ""}`} key={note}>
                <div><strong>{noteName(note)}</strong><span>{newNotes.includes(note) ? "New" : "Review"}</span></div>
                <MiniStaff position={index} />
                <button
                  type="button"
                  className="studio-note-play"
                  aria-label={`Preview ${noteName(note)}`}
                  aria-pressed={playing === note}
                  onClick={() => void preview([note], note)}
                ><Volume2 size={16} /></button>
              </div>
            ))}
          </div>
          <div className="studio-lesson-actions">
            <button
              className="primary"
              aria-label={profile.attempts.length ? "Continue lesson" : "Start first lesson"}
              onClick={() => go("ear")}
            >
              {profile.attempts.length ? "Continue lesson" : "Start first lesson"}
              <ArrowRight size={17} />
            </button>
            <button className="studio-preview-button" onClick={() => void preview(lesson.notes, "all")} aria-pressed={playing === "all"}>
              <span className="studio-play-circle"><Play size={14} fill="currentColor" /></span>
              <span>Preview the notes<small>Hear {lesson.notes.map(noteName).join(" and ")}</small></span>
            </button>
            <button className="text-button studio-details" onClick={() => go("ear")}>
              View lesson details <ArrowRight size={15} />
            </button>
          </div>
        </section>

        <section className="studio-mic-card">
          <div className="studio-mic-heading">
            <span className="studio-round-icon"><Mic size={20} /></span>
            <span className="eyebrow">MICROPHONE PRACTICE</span>
          </div>
          <h2>Match a note on your instrument</h2>
          <p>Hear a target note, then use live pitch feedback to match it.</p>
          <button onClick={() => go("play")}>Start pitch matching <ArrowRight size={16} /></button>
          <div className="studio-wave-preview" aria-hidden="true">
            <div className="studio-wave-bars">
              {waveform.map((height, index) => <i key={index} style={{ height }} />)}
            </div>
            <span className="studio-wave-cursor" />
            <div className="studio-pitch-preview">
              <strong>G</strong><span>listen · play · match</span>
              <i><b /><b /><b /><b /><b /></i>
            </div>
          </div>
          <div className="studio-mic-footer">
            <span><i /> Microphone audio stays on your device</span>
            <button className="text-button" onClick={() => go("play")}>How it works <ArrowRight size={14} /></button>
          </div>
        </section>
      </div>

      <section className="studio-stats" aria-label="Today's practice">
        <span className="studio-stats-label">Today&apos;s practice</span>
        <div className="studio-metrics">
          <Metric icon={Target} value={String(today.length).padStart(2, "0")} suffix={` / ${profile.dailyGoal}`} label="Daily goal" detail={today.length >= profile.dailyGoal ? "Goal reached" : `${profile.dailyGoal - today.length} answers to go`}>
            <span className="studio-progress" aria-hidden="true"><i style={{ width: `${Math.min(100, (today.length / profile.dailyGoal) * 100)}%` }} /></span>
          </Metric>
          <Metric icon={BarChart3} value={accuracy === null ? "—" : `${accuracy}%`} label="Accuracy" detail={accuracy === null ? "No answers yet" : "Across saved practice"} />
          <Metric icon={Music2} value={String(profile.learned.length).padStart(2, "0")} suffix=" / 12" label="Pitches recognized" detail="Correct in ear training">
            <span className="studio-note-progress" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} className={index < profile.learned.length ? "filled" : ""} />)}</span>
          </Metric>
          <Metric icon={Flame} value={`${streak} ${streak === 1 ? "day" : "days"}`} label="Practice streak" detail={streak ? "Keep listening" : "Start today"} />
          <Metric icon={CheckCircle2} value={String(profile.completed).padStart(2, "0")} label="Sessions complete" detail="All time" />
        </div>
      </section>

      <section className="studio-exercises">
        <div className="studio-section-heading">
          <div><span className="eyebrow">PRACTICE MODES</span><h2>Choose an exercise</h2></div>
          <button className="text-button" onClick={() => go("progress")}>View your progress <ArrowRight size={15} /></button>
        </div>
        <div className="studio-exercise-grid">
          {exercises.map((exercise) => (
            <button className="studio-exercise-card" key={exercise.title} onClick={() => go(exercise.page)}>
              <span className="studio-exercise-icon"><exercise.icon size={21} /></span>
              <span className="studio-card-arrow"><ArrowRight size={16} /></span>
              <strong>{exercise.title}</strong>
              <span>{exercise.copy}</span>
              <i className={`studio-card-art ${exercise.art}`} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
