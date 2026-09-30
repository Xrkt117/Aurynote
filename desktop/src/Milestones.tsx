import { Check, Trophy, Target } from "lucide-react";
import { useStudio } from "./context";
import { dayKey } from "./store";
import { achievements } from "./achievements";
export default function Milestones({ compact = false }: { compact?: boolean }) {
  const { profile, setProfile, go } = useStudio();
  const today = profile.attempts.filter((a) => a.day === dayKey()).length;
  const earned = achievements(profile);
  const remaining = Math.max(0, profile.dailyGoal - today);
  return (
    <section className="milestones" aria-label="Goals and achievements">
      <div className="goal-card panel">
        <div>
          <span className="eyebrow">
            <Target size={14} /> DAILY PRACTICE GOAL
          </span>
          <h2>
            {remaining === 0
              ? "Today’s goal reached"
              : `${remaining} answers to go`}
          </h2>
          <p>
            {today} of {profile.dailyGoal} questions answered today · all
            practice modes count.
          </p>
          <progress
            aria-label="Daily goal progress"
            value={Math.min(today, profile.dailyGoal)}
            max={profile.dailyGoal}
          />
        </div>
        <label>
          Daily goal
          <select
            aria-label="Daily goal"
            value={profile.dailyGoal}
            onChange={(e) =>
              setProfile((p) => ({ ...p, dailyGoal: Number(e.target.value) }))
            }
          >
            {[...new Set([5, 10, 15, 20, 30, 50, profile.dailyGoal])]
              .sort((a, b) => a - b)
              .map((n) => (
                <option key={n} value={n}>
                  {n} answers
                </option>
              ))}
          </select>
        </label>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR ACCOMPLISHMENTS</span>
          <h2>
            Achievements{" "}
            <small>
              {earned.filter((a) => a.earned).length} / {earned.length} earned
            </small>
          </h2>
        </div>
        {compact && (
          <button className="text-button" onClick={() => go("progress")}>
            View all progress
          </button>
        )}
      </div>
      <div className="achievement-grid">
        {earned.map((a) => (
          <article
            className={`achievement ${a.earned ? "earned" : ""}`}
            key={a.id}
          >
            {a.earned ? <Check size={20} /> : <Trophy size={20} />}
            <span className="achievement-state">
              {a.earned ? "Earned" : "In progress"}
            </span>
            <h3>{a.name}</h3>
            <p>{a.detail}</p>
            <strong>
              {Math.min(a.value, a.target)} / {a.target}
            </strong>
            <progress
              aria-label={a.name}
              value={Math.min(a.value, a.target)}
              max={a.target}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
