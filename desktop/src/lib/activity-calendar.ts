import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";
export interface ContributionDay {
  date: string;
  count: number;
}
export function calendarDays(data: ContributionDay[], today = new Date()) {
  const end = startOfDay(today),
    start = subDays(end, 364),
    counts = new Map<string, number>();
  for (const item of data) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(item.date) ||
      !Number.isFinite(item.count) ||
      item.count < 0
    )
      continue;
    const date = parseISO(item.date);
    if (
      !isValid(date) ||
      format(date, "yyyy-MM-dd") !== item.date ||
      date < start ||
      date > end
    )
      continue;
    counts.set(
      item.date,
      (counts.get(item.date) ?? 0) + Math.floor(item.count),
    );
  }
  const days = eachDayOfInterval({
    start: startOfWeek(start),
    end: endOfWeek(end),
  }).map((day) => ({
    date: format(day, "yyyy-MM-dd"),
    day,
    count: counts.get(format(day, "yyyy-MM-dd")) ?? 0,
    inRange: day >= start && day <= end,
  }));
  return {
    days,
    start,
    end,
    total: [...counts.values()].reduce((a, b) => a + b, 0),
    activeDays: [...counts.values()].filter((n) => n > 0).length,
  };
}
