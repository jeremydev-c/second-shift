"use client";

import { useState, useTransition } from "react";
import { STATUS_LABELS, type Status } from "@/lib/types";
import { advance } from "./actions";

export default function AdvanceButton({ id, next, compact }: { id: string; next?: Status; compact?: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  if (!next) return <span className="font-mono text-xs uppercase tracking-widest text-great">Route complete</span>;
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setError((await advance(id)).error))}
        className={compact ? "rounded-sm bg-brand px-3 py-1.5 text-sm font-medium text-brand-ink hover:opacity-90 disabled:opacity-50" : "btn"}
      >
        {pending ? "Moving…" : `→ ${STATUS_LABELS[next]}`}
      </button>
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}
