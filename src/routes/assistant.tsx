import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Loader2, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/AiDisclaimer";
import { Markdown } from "@/components/Markdown";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { chatWithAssistant } from "@/lib/ai.functions";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "JobTrack Assistant — AI Job Search Chat" },
      {
        name: "description",
        content:
          "Chat with the JobTrack Assistant for help with interviews, resumes, salary talks, and workplace productivity.",
      },
      { property: "og:title", content: "JobTrack Assistant — AI Job Search Chat" },
      {
        property: "og:description",
        content: "Ask anything about job searching and staying productive at work.",
      },
    ],
  }),
  component: AssistantPage,
});

type Message = { role: "user" | "assistant"; content: string };

const suggestions = [
  "How do I follow up after an interview?",
  "Rewrite my summary for a data analyst role",
  "How should I answer 'what's your salary expectation'?",
  "Help me plan a focused work day",
];

function AssistantPage() {
  const run = useServerFn(chatWithAssistant);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the **JobTrack Assistant**. Ask me about applications, interviews, resumes, or staying productive at work.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await run({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: res.text }]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The assistant could not reply.");
      setMessages(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col">
      <PageHeader
        title="JobTrack Assistant"
        description="Practical answers for your job search and workday, powered by AI."
      />

      <Card className="surface-panel flex min-h-[60vh] flex-col">
        <CardContent className="flex-1 space-y-4 overflow-y-auto py-5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse text-right" : ""}`}
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                  m.role === "user"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-gradient-primary text-primary-foreground"
                }`}
              >
                {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
              </span>
              <div
                className={`max-w-[85%] rounded-xl border border-border px-4 py-2.5 text-left ${
                  m.role === "user" ? "bg-secondary/60" : "bg-card"
                }`}
              >
                <Markdown>{m.content}</Markdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Thinking…
            </div>
          )}
          <div ref={endRef} />
        </CardContent>

        <div className="space-y-3 border-t border-border p-4">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <Button key={s} variant="secondary" size="sm" onClick={() => send(s)}>
                  {s}
                </Button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={2}
              placeholder="Ask about interviews, resumes, follow-ups, productivity…"
              className="resize-none"
            />
            <Button onClick={() => send(input)} disabled={loading} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </div>
          <AiDisclaimer />
        </div>
      </Card>
    </div>
  );
}
