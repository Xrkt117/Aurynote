import PracticeActivity from "./PracticeActivity";
import Milestones from "./Milestones";
import { ArrowUpRight, Download } from "lucide-react";
import { useStudio } from "./context";
import { notes, lessons } from "./music";
import { dayKey } from "./store";
import { Empty, SectionTitle } from "./components";
export default function Progress() {
  const { profile, go, notify } = useStudio();
  const attempts = profile.attempts;
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return {
      date: dayKey(d),
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
    };
  });
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(profile, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "aurynote-progress.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Your practice data has been exported.");
  }
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Saved locally</span>
          <h1>Your progress</h1>
          <p>Review practice volume, accuracy, pitch results, and lessons.</p>
        </div>
        <button onClick={exportData}>
          <Download size={16} />
          Export progress
        </button>
      </div>
      <PracticeActivity/>
      <Milestones />
      {!attempts.length ? (
        <Empty
          title="No practice recorded"
          copy="Complete a question to add data to this page."
          action={() => go("ear")}
        />
      ) : (
        <>
          <div className="stats-row">
            <div>
              <span className="eyebrow">Answers</span>
              <strong>{attempts.length}</strong>
            </div>
            <div>
              <span className="eyebrow">Accuracy</span>
              <strong>
                {Math.round(
                  (attempts.filter((a) => a.right).length / attempts.length) *
                    100,
                )}
                %
              </strong>
            </div>
            <div>
              <span className="eyebrow">Completed sessions</span>
              <strong>{profile.completed}</strong>
            </div>
          </div>
          <section className="panel weekly">
            <SectionTitle
              eyebrow="Recent activity"
              title="Last seven days"
            />
            <div className="week-chart">
              {days.map((day) => {
                const count = attempts.filter((a) => a.day === day.date).length;
                const max = Math.max(
                  10,
                  ...days.map(
                    (d) => attempts.filter((a) => a.day === d.date).length,
                  ),
                );
                return (
                  <div key={day.date}>
                    <span>{count}</span>
                    <div>
                      <i
                        style={{
                          height: `${Math.max(2, (count / max) * 100)}%`,
                        }}
                      />
                    </div>
                    <small>{day.label}</small>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
      <SectionTitle
        eyebrow="Ear-training results"
        title="Pitch accuracy"
      />
      <div className="pitch-map">
        {notes.map((n, i) => {
          const history = attempts.filter(
            (a) => a.target === i && a.mode === "ear",
          );
          const percent = history.length
            ? Math.round(
                (history.filter((a) => a.right).length / history.length) * 100,
              )
            : null;
          return (
            <div
              key={n}
              className={
                percent === null
                  ? "unheard"
                  : percent >= 80
                    ? "familiar"
                    : "growing"
              }
            >
              <strong>{n}</strong>
              <span>{percent === null ? "Not yet" : `${percent}%`}</span>
              <small>{history.length} tries</small>
            </div>
          );
        })}
      </div>
      <SectionTitle
        eyebrow="Guided lessons"
        title="Lesson progress"
      />
      <div className="journey-list">
        {lessons.map((lesson, i) => (
          <div
            key={lesson.name}
            className={i === profile.level ? "current" : ""}
          >
            <span className="journey-number">0{i + 1}</span>
            <div>
              <h3>{lesson.short}</h3>
              <p>{lesson.notes.map((n) => notes[n]).join(" · ")}</p>
            </div>
            <span className="micro">
              {profile.passedLessons.includes(i)
                ? "Passed · 80% or higher"
                : i === profile.level
                  ? "Current lesson"
                  : "Available to practice"}
            </span>
          </div>
        ))}
      </div>
      <button className="text-button" onClick={() => go("ear")}>
        Open ear training <ArrowUpRight size={16} />
      </button>
      <p className="micro muted">
        Progress is saved on this device. History keeps your most recent 2,000
        answers.
      </p>
    </div>
  );
}
