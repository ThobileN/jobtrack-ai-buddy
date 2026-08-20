import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Briefcase, ListChecks, Mail } from "lucide-react";

import { AiDisclaimer } from "@/components/AiDisclaimer";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUSES, statusStyles, useApplications, useTasks } from "@/lib/jobtrack-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JobTrack Dashboard — Track Applications & Plan Your Job Search" },
      {
        name: "description",
        content:
          "JobTrack is an AI-powered workspace to track job applications, write outreach emails, plan tasks, and get job-search advice.",
      },
      { property: "og:title", content: "JobTrack — AI job search workspace" },
      {
        property: "og:description",
        content:
          "Track applications, generate professional emails, plan your week, and chat with the JobTrack Assistant.",
      },
    ],
  }),
  component: Dashboard,
});

const shortcuts = [
  {
    to: "/applications",
    icon: Briefcase,
    title: "Application Tracker",
    text: "Log every role, filter by status, and keep your notes in one place.",
  },
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    text: "Draft follow-ups and outreach in a formal, friendly, or persuasive tone.",
  },
  {
    to: "/planner",
    icon: ListChecks,
    title: "AI Task Planner",
    text: "Turn goals into a prioritised daily or weekly schedule.",
  },
  {
    to: "/assistant",
    icon: Bot,
    title: "JobTrack Assistant",
    text: "Ask anything about interviews, resumes, or staying productive.",
  },
] as const;

function Dashboard() {
  const [apps] = useApplications();
  const [tasks] = useTasks();
  const openTasks = tasks.filter((t) => !t.done);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Welcome back"
        description="Your job search at a glance — applications, drafts, and today's priorities."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="surface-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total applications
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{apps.length}</CardContent>
        </Card>
        {(["Interview", "Offer"] as const).map((status) => (
          <Card key={status} className="surface-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{status}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {apps.filter((a) => a.status === status).length}
            </CardContent>
          </Card>
        ))}
        <Card className="surface-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open tasks</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{openTasks.length}</CardContent>
        </Card>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {shortcuts.map((s) => (
          <Link key={s.to} to={s.to} className="group">
            <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-elevated)]">
              <CardHeader className="flex-row items-center gap-3 pb-2">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/12 text-primary">
                  <s.icon className="size-4" />
                </span>
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{s.text}</CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline by status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {STATUSES.map((status) => {
              const count = apps.filter((a) => a.status === status).length;
              const pct = apps.length ? (count / apps.length) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3 text-sm">
                  <span
                    className={`w-24 rounded-md border px-2 py-0.5 text-center text-xs ${statusStyles[status]}`}
                  >
                    {status}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-gradient-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-6 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {openTasks.length === 0 ? (
              <p className="text-muted-foreground">
                No open tasks yet. Generate a plan in the Task Planner.
              </p>
            ) : (
              openTasks.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <span className="rounded bg-primary/12 px-1.5 py-0.5 text-xs font-semibold text-primary">
                    {t.priority}
                  </span>
                  <span className="flex-1">{t.title}</span>
                  <span className="text-xs text-muted-foreground">{t.when}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <AiDisclaimer className="mt-8" />
    </div>
  );
}
