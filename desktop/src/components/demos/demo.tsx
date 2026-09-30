import { GitHubCalendar } from "@/components/ui/git-hub-calendar";
export default function DemoOne() {
  return (
    <GitHubCalendar
      data={[
        { date: "2025-09-10", count: 5 },
        { date: "2025-09-11", count: 2 },
        { date: "2025-09-13", count: 1 },
      ]}
      today={new Date(2025, 8, 13)}
    />
  );
}
