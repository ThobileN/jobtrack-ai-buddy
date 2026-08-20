import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uid } from "@/lib/local-storage";
import {
  STATUSES,
  statusStyles,
  useApplications,
  type Application,
  type Status,
} from "@/lib/jobtrack-store";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Job Application Tracker — JobTrack" },
      {
        name: "description",
        content:
          "Add, edit, search, and filter your job applications. Track company, role, date, location, notes, and status.",
      },
      { property: "og:title", content: "Job Application Tracker — JobTrack" },
      {
        property: "og:description",
        content: "Keep every application organised by status, company, and role.",
      },
    ],
  }),
  component: ApplicationsPage,
});

const empty = (): Application => ({
  id: "",
  company: "",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  location: "",
  notes: "",
  status: "Applied",
});

function ApplicationsPage() {
  const [apps, setApps] = useApplications();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Status | "All">("All");
  const [draft, setDraft] = useState<Application | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps
      .filter((a) => (filter === "All" ? true : a.status === filter))
      .filter((a) =>
        q
          ? [a.company, a.title, a.location, a.notes].join(" ").toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [apps, query, filter]);

  function save() {
    if (!draft) return;
    if (!draft.company.trim() || !draft.title.trim()) {
      toast.error("Company and job title are required.");
      return;
    }
    if (draft.id) {
      setApps((prev) => prev.map((a) => (a.id === draft.id ? draft : a)));
      toast.success("Application updated");
    } else {
      setApps((prev) => [{ ...draft, id: uid() }, ...prev]);
      toast.success("Application added");
    }
    setDraft(null);
  }

  function remove(id: string) {
    setApps((prev) => prev.filter((a) => a.id !== id));
    toast.success("Application deleted");
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Job Applications"
        description="Every role you've applied to, with status, notes, and dates saved in your browser."
        action={
          <Button onClick={() => setDraft(empty())}>
            <Plus className="size-4" /> Add application
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company, role, location, notes…"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as Status | "All")}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visible.length === 0 ? (
        <Card className="surface-panel">
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            No applications match yet — add your first one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {visible.map((a) => (
            <Card key={a.id} className="surface-panel">
              <CardContent className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">{a.title}</h2>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-xs font-medium ${statusStyles[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {a.company}
                    {a.location ? ` · ${a.location}` : ""} · applied {a.date}
                  </p>
                  {a.notes && <p className="mt-2 text-sm">{a.notes}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setDraft(a)} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(a.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit application" : "Add application"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={draft.company}
                    onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="title">Job title</Label>
                  <Input
                    id="title"
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date">Application date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={draft.location}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                    placeholder="Remote, Cape Town…"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={draft.status}
                  onValueChange={(v) => setDraft({ ...draft, status: v as Status })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={draft.notes}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  placeholder="Recruiter name, salary range, next steps…"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
