import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/AiDisclaimer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { generatePlan } from "@/lib/ai.functions";
import { uid } from "@/lib/local-storage";
import { parseTaskLines, useTasks, type Task } from "@/lib/jobtrack-store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — JobTrack" },
      {
        name: "description",
        content:
          "Enter your goals and get a prioritised daily or weekly job-search schedule you can edit and check off.",
      },
      { property: "og:title", content: "AI Task Planner — JobTrack" },
      {
        property: "og:description",
        content: "Turn job-search goals into a prioritised, editable schedule.",
      },
    ],
  }),
  component: PlannerPage,
});

const priorityStyles: Record<Task["priority"], string> = {
  P1: "bg-destructive/15 text-destructive",
  P2: "bg-warning/15 text-warning",
  P3: "bg-info/15 text-info",
};

function PlannerPage() {
  const run = useServerFn(generatePlan);
  const [tasks, setTasks] = useTasks();
  const [goals, setGoals] = useState("");
  const [extra, setExtra] = useState("");
  const [horizon, setHorizon] = useState<"daily" | "weekly">("daily");
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState("");

  async function generate() {
    if (!goals.trim()) {
      toast.error("Add at least one goal.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { goals, tasks: extra, horizon } });
      const parsed = parseTaskLines(res.text);
      if (parsed.length === 0) {
        toast.error("The plan came back empty — try rephrasing your goals.");
        return;
      }
      setTasks((prev) => [...parsed.map((t) => ({ ...t, id: uid(), done: false })), ...prev]);
      toast.success(`Added ${parsed.length} tasks to your plan`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate a plan.");
    } finally {
      setLoading(false);
    }
  }

  function addManual() {
    if (!manual.trim()) return;
    setTasks((prev) => [
      { id: uid(), title: manual.trim(), priority: "P2", when: "Unscheduled", done: false },
      ...prev,
    ]);
    setManual("");
  }

  const sorted = [...tasks].sort(
    (a, b) => Number(a.done) - Number(b.done) || a.priority.localeCompare(b.priority),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="AI Task Planner"
        description="Describe your goals and get a prioritised schedule. Every task stays editable."
      />

      <div className="grid gap-5 lg:grid-cols-[24rem_1fr]">
        <Card className="surface-panel h-fit">
          <CardHeader>
            <CardTitle className="text-base">Your goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="goals">Goals</Label>
              <Textarea
                id="goals"
                rows={4}
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Apply to 10 backend roles, prep for a system design interview, refresh my CV."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="extra">Tasks you already know about</Label>
              <Textarea
                id="extra"
                rows={3}
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Call recruiter Thursday, finish portfolio case study…"
              />
            </div>
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Tabs value={horizon} onValueChange={(v) => setHorizon(v as "daily" | "weekly")}>
                <TabsList className="w-full">
                  <TabsTrigger value="daily" className="flex-1">
                    Daily
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="flex-1">
                    Weekly
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {loading ? "Planning…" : "Generate schedule"}
            </Button>
            <AiDisclaimer />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addManual()}
                placeholder="Add a task manually…"
              />
              <Button variant="secondary" onClick={addManual}>
                <Plus className="size-4" />
              </Button>
            </div>

            {sorted.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No tasks yet. Generate a schedule or add one manually.
              </p>
            ) : (
              <ul className="space-y-2">
                {sorted.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-3 py-2"
                  >
                    <Checkbox
                      checked={task.done}
                      onCheckedChange={(checked) =>
                        setTasks((prev) =>
                          prev.map((t) => (t.id === task.id ? { ...t, done: checked === true } : t)),
                        )
                      }
                      aria-label="Mark complete"
                    />
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-semibold ${priorityStyles[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                    <Input
                      value={task.title}
                      onChange={(e) =>
                        setTasks((prev) =>
                          prev.map((t) => (t.id === task.id ? { ...t, title: e.target.value } : t)),
                        )
                      }
                      className={`h-8 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-1 ${
                        task.done ? "text-muted-foreground line-through" : ""
                      }`}
                    />
                    {task.when && (
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {task.when}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete task"
                      onClick={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
