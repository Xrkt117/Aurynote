import Milestones from "./Milestones";
import {
  ArrowUpRight,
  ArrowRight,
  Headphones,
  Music2,
  Mic,
  ScanLine,
  Check,
  Clock3,
} from "lucide-react";
import { useStudio } from "./context";
import { lessons, noteName } from "./music";
import { dayKey } from "./store";
import { SectionTitle, Tag } from "./components";
export default function Dashboard() {
  const { profile, go } = useStudio();
  const lesson = lessons[profile.level];
  const earlierNotes = profile.level ? lessons[profile.level - 1].notes : [];
  const newNotes = lesson.notes.filter(n => !earlierNotes.includes(n));
  const today = profile.attempts.filter((a) => a.day === dayKey());
  const accuracy = profile.attempts.length
    ? Math.round(
        (profile.attempts.filter((a) => a.right).length /
          profile.attempts.length) *
          100,
      )
    : 0;
  return (
    <div className="page dashboard">
      <div className="page-intro">
        <span className="eyebrow">YOUR EVERYDAY PRACTICE STUDIO</span>
        <h1>
          A little listening.
          <br />A lot of <em>possibility.</em>
        </h1>
        <p>
          Build the connection between what you hear and what you play.
          <br className="wide-only" /> One note, one small discovery at a time.
        </p>
      </div>
      <div className="hero-grid">
        <section className="hero-card">
          <div className="hero-card-top">
            <Tag>YOUR NEXT STEP</Tag>
            <span className="muted micro">
              <Clock3 size={13} /> A few focused minutes
            </span>
          </div>
          <div className="hero-body">
            <span className="big-number">
              0{profile.level + 1}
              <span>/ 05</span>
            </span>
            <div>
              <h2>{lessons[profile.level].name}</h2>
              <p>{lessons[profile.level].copy}</p>
            </div>
          </div>
          <section className="lesson-preview" aria-label="Notes in your next lesson">
            <div className="lesson-preview-heading"><span>IN THIS LESSON</span><span>{lesson.notes.length} notes · {newNotes.length} new</span></div>
            <div className="lesson-preview-notes" style={{gridTemplateColumns: `repeat(${lesson.notes.length > 6 ? Math.ceil(lesson.notes.length / 2) : lesson.notes.length}, minmax(0, 1fr))`}}>
              {lesson.notes.map(n => <div className={newNotes.includes(n) ? "preview-note introduced" : "preview-note"} key={n}><strong>{noteName(n)}</strong><span>{newNotes.includes(n) ? "New" : "Review"}</span></div>)}
            </div>
          </section>
          <div className="hero-bottom">
            <button className="primary" onClick={() => go("ear")}>
              {profile.attempts.length
                ? "Continue learning"
                : "Begin your first lesson"}{" "}
              <ArrowRight size={17} />
            </button>
            <span className="micro muted">
              Listen first. No perfect pitch needed.
            </span>
          </div>
        </section>
        <section className="play-card">
          <div className="round-icon">
            <Mic size={23} />
          </div>
          <span className="eyebrow">FROM EAR TO INSTRUMENT</span>
          <h2>
            Don't just name it.
            <br />
            <em>Play it back.</em>
          </h2>
          <p>
            Hear a note, then play it on your instrument. See your pitch respond
            in real time.
          </p>
          <button className="text-button" onClick={() => go("play")}>
            Open the listening room <ArrowUpRight size={18} />
          </button>
          <div className="local-note">
            <span className="status-dot" /> Microphone audio stays on your
            device
          </div>
        </section>
      </div>
      <div className="stats-row">
        <div>
          <span className="eyebrow">TODAY'S NOTES</span>
          <strong>
            {today.length.toString().padStart(2, "0")}
            <small> / {profile.dailyGoal} daily goal</small>
          </strong>
          <div className="thin-progress">
            <i
              style={{
                width: `${Math.min(100, (today.length / profile.dailyGoal) * 100)}%`,
              }}
            />
          </div>
        </div>
        <div>
          <span className="eyebrow">PRACTICE ACCURACY</span>
          <strong>
            {profile.attempts.length ? `${accuracy}%` : "—"}
            <small>
              {profile.attempts.length
                ? " across your practice"
                : " your story starts here"}
            </small>
          </strong>
        </div>
        <div>
          <span className="eyebrow">NOTES DISCOVERED</span>
          <strong>
            {profile.learned.length.toString().padStart(2, "0")}
            <small> / 12 pitches</small>
          </strong>
          <div className="mini-notes">
            {Array.from({ length: 12 }, (_, n) => (
              <i
                key={n}
                title={noteName(n)}
                className={profile.learned.includes(n) ? "filled" : ""}
              />
            ))}
          </div>
        </div>
      </div>
      <Milestones compact />
      <SectionTitle
        eyebrow="MAKE YOURSELF AT HOME"
        title="More ways to find your sound"
      >
        <button className="text-button" onClick={() => go("progress")}>
          Your progress <ArrowUpRight size={16} />
        </button>
      </SectionTitle>
      <div className="practice-grid">
        {[
          {
            icon: Headphones,
            title: "Train your ear",
            copy: "Small lessons that grow with you.",
            page: "ear" as const,
          },
          {
            icon: ScanLine,
            title: "Read the staff",
            copy: "Turn symbols into familiar notes.",
            page: "staff" as const,
          },
          {
            icon: Music2,
            title: "Explore harmony",
            copy: "Scales, chords, and your next idea.",
            page: "explore" as const,
          },
        ].map((card) => (
          <button
            className="practice-card"
            key={card.title}
            onClick={() => go(card.page)}
          >
            <card.icon size={23} />
            <ArrowUpRight className="card-arrow" size={17} />
            <h3>{card.title}</h3>
            <p>{card.copy}</p>
          </button>
        ))}
      </div>
      <div className="quiet-footer">
        <Check size={14} /> No account. No pressure. Just practice.
      </div>
    </div>
  );
}
