import { useLocalStorage } from "./local-storage";

export const STATUSES = ["Applied", "Interview", "Offer", "Rejected", "Withdrawn"] as const;
export type Status = (typeof STATUSES)[number];

export type Application = {
  id: string;
  company: string;
  title: string;
  date: string;
  location: string;
  notes: string;
  status: Status;
};

export type Task = {
  id: string;
  title: string;
  priority: "P1" | "P2" | "P3";
  when: string;
  done: boolean;
};

export function useApplications() {
  return useLocalStorage<Application[]>("jobtrack.applications", []);
}

export function useTasks() {
  return useLocalStorage<Task[]>("jobtrack.tasks", []);
}

export const statusStyles: Record<Status, string> = {
  Applied: "bg-info/15 text-info border-info/30",
  Interview: "bg-warning/15 text-warning border-warning/30",
  Offer: "bg-success/15 text-success border-success/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
  Withdrawn: "bg-muted text-muted-foreground border-border",
};

export function parseTaskLines(markdown: string): Omit<Task, "id" | "done">[] {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-") || line.startsWith("*"))
    .map((line) => {
      const body = line.replace(/^[-*]\s*/, "");
      const priorityMatch = body.match(/\[?(P[123])\]?/i);
      const priority = (priorityMatch?.[1]?.toUpperCase() ?? "P2") as Task["priority"];
      const rest = body.replace(/\[?(P[123])\]?/i, "").trim();
      const parts = rest.split(/\s+[—–-]\s+/);
      const title = (parts[0] ?? rest).replace(/^[:\-–—\s]+/, "").trim();
      const when = parts.slice(1).join(" · ").trim();
      return { title, priority, when };
    })
    .filter((task) => task.title.length > 0);
}
