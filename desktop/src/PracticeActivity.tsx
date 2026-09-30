import { useEffect, useState } from "react";
import { GitHubCalendar } from "@/components/ui/git-hub-calendar";
import { calendarDays } from "@/lib/activity-calendar";
import { useStudio } from "./context";
export default function PracticeActivity() {
  const { profile } = useStudio();
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const counts = new Map<string, number>();
  for (const a of profile.attempts)
    counts.set(a.day, (counts.get(a.day) ?? 0) + 1);
  const data = [...counts].map(([date, count]) => ({ date, count }));
  const summary = calendarDays(data, today);
  return (
    <section
      className="panel practice-activity"
      aria-labelledby="activity-heading"
    >
      <div className="activity-heading">
        <div>
          <span className="eyebrow">A LITTLE PRACTICE, OFTEN</span>
          <h2 id="activity-heading">Your practice year</h2>
        </div>
        <span>
          {summary.total} answers · {summary.activeDays} active days
        </span>
      </div>
      <GitHubCalendar
        colors={["#edf0e7", "#cbd8b7", "#a1b782", "#738f50", "#405c31"]}
        data={data}
        today={today}
        activityLabel="practice answers"
      />
      <p className="micro muted">
        Last 365 days · based on your saved history of up to 2,000 answers.{" "}
        {summary.total === 0
          ? "Answer your first question to fill your first square."
          : "Use arrow keys to explore each day."}
      </p>
    </section>
  );
}
