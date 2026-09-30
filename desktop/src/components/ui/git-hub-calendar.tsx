"use client";
import { useRef, useState } from "react";
import { format } from "date-fns";
import { calendarDays, type ContributionDay } from "@/lib/activity-calendar";
export type { ContributionDay } from "@/lib/activity-calendar";
interface GitHubCalendarProps {
  data: ContributionDay[];
  colors?: string[];
  today?: Date;
  activityLabel?: string;
}
const defaultColors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
export function GitHubCalendar({
  data,
  colors = defaultColors,
  today = new Date(),
  activityLabel = "contributions",
}: GitHubCalendarProps) {
  const calendar = calendarDays(data, today),
    grid = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const current =
    calendar.days.find((d) => d.date === selected && d.inRange) ??
    calendar.days.find((d) => d.date === format(calendar.end, "yyyy-MM-dd"))!;
  const scale = defaultColors.map((fallback, i) => colors[i] || fallback);
  const weeks = Array.from({ length: calendar.days.length / 7 }, (_, i) =>
    calendar.days.slice(i * 7, i * 7 + 7),
  );
  function move(date: string, delta: number) {
    const valid = calendar.days.filter((d) => d.inRange);
    const index = valid.findIndex((d) => d.date === date);
    const next = valid[Math.max(0, Math.min(valid.length - 1, index + delta))];
    setSelected(next.date);
    grid.current
      ?.querySelector<HTMLButtonElement>(`[data-date="${next.date}"]`)
      ?.focus();
  }
  let lastMonth = "";
  const months = weeks.map((week) => {
    const first = week.find((d) => d.inRange);
    if (!first) return "";
    const month = format(first.day, "yyyy-MM");
    if (month === lastMonth) return "";
    lastMonth = month;
    return format(first.day, "MMM");
  });
  return (
    <div className="activity-calendar">
      <div
        className="calendar-scroll"
        aria-label="Practice activity calendar"
        ref={grid}
      >
        <div className="calendar-body">
          <div className="calendar-weekdays" aria-hidden="true">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div>
            <div
              className="calendar-months"
              aria-hidden="true"
              style={{ gridTemplateColumns: `repeat(${weeks.length},12px)` }}
            >
              {months.map((month, i) => (
                <span key={i}>{month}</span>
              ))}
            </div>
            <div className="flex gap-1">
              {weeks.map((week, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {week.map((d) =>
                    d.inRange ? (
                      <button
                        key={d.date}
                        type="button"
                        className="calendar-day"
                        style={{ backgroundColor: scale[Math.min(d.count, 4)] }}
                        data-date={d.date}
                        title={`${format(d.day, "PPP")}: ${d.count} ${activityLabel}`}
                        aria-label={`${format(d.day, "PPP")}: ${d.count} ${activityLabel}`}
                        tabIndex={current.date === d.date ? 0 : -1}
                        onFocus={() => setSelected(d.date)}
                        onClick={() => setSelected(d.date)}
                        onKeyDown={(e) => {
                          const delta = (
                            {
                              ArrowLeft: -7,
                              ArrowRight: 7,
                              ArrowUp: -1,
                              ArrowDown: 1,
                              Home: -400,
                              End: 400,
                            } as Record<string, number>
                          )[e.key];
                          if (delta !== undefined) {
                            e.preventDefault();
                            move(d.date, delta);
                          }
                        }}
                      />
                    ) : (
                      <span key={d.date} className="calendar-spacer" />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="calendar-footer flex flex-wrap items-center justify-between gap-3 mt-4">
        <span role="status">
          {format(current.day, "MMM d, yyyy")} · {current.count} {activityLabel}
        </span>
        <div
          className="flex items-center gap-2"
          aria-label="Activity intensity: zero, one, two, three, four or more"
        >
          <span>Less</span>
          {scale.map((color, i) => (
            <span
              key={i}
              className="calendar-legend"
              style={{ backgroundColor: color }}
              title={i === 4 ? "4 or more" : String(i)}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
