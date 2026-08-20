import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/AiDisclaimer";
import { Markdown } from "@/components/Markdown";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — JobTrack" },
      {
        name: "description",
        content:
          "Generate professional job-search emails in a formal, friendly, or persuasive tone, then edit the draft before sending.",
      },
      { property: "og:title", content: "Smart Email Generator — JobTrack" },
      {
        property: "og:description",
        content: "AI-drafted follow-ups, thank-you notes, and outreach emails you can edit.",
      },
    ],
  }),
  component: EmailPage,
});

type Tone = "Formal" | "Friendly" | "Persuasive";

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const [output, setOutput] = useState("");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!purpose.trim()) {
      toast.error("Describe what the email is about first.");
      return;
    }
    setLoading(true);
    try {
      const res = await run({ data: { purpose, recipient, tone, details } });
      setOutput(res.text);
      setPreview(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate the email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Smart Email Generator"
        description="Describe the situation and get a polished draft you can edit before sending."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="surface-panel">
          <CardHeader>
            <CardTitle className="text-base">Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="purpose">What is the email about?</Label>
              <Textarea
                id="purpose"
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Follow up on my Product Designer application at Northwind, submitted 2 weeks ago."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Sarah Kim, Talent Partner"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="details">Details to include</Label>
              <Textarea
                id="details"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="5 years experience, available immediately, portfolio link…"
              />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Tabs value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <TabsList className="w-full">
                  {(["Formal", "Friendly", "Persuasive"] as const).map((t) => (
                    <TabsTrigger key={t} value={t} className="flex-1">
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <Button onClick={generate} disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {loading ? "Writing…" : "Generate email"}
            </Button>
            <AiDisclaimer />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Editable draft</CardTitle>
            {output && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPreview((p) => !p)}>
                  {preview ? "Edit" : "Preview"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Copy"
                  onClick={() => {
                    void navigator.clipboard.writeText(output);
                    toast.success("Copied to clipboard");
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!output ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Your generated email will appear here, ready to edit.
              </p>
            ) : preview ? (
              <Markdown>{output}</Markdown>
            ) : (
              <Textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                rows={20}
                className="font-mono text-sm"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
