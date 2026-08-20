import { Info } from "lucide-react";

export function AiDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground ${className}`}
    >
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <span>
        <strong className="font-semibold text-foreground">Responsible AI:</strong> AI-generated
        content can be inaccurate or incomplete. Always review and edit it before sending, sharing,
        or acting on it.
      </span>
    </p>
  );
}
