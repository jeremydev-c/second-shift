"use client";

import { useActionState } from "react";
import { WIPE_METHODS, type Pledge } from "@/lib/types";
import { saveIntake, type IntakeState } from "../actions";

export default function IntakeForm({ p }: { p: Pledge }) {
  const [state, action, pending] = useActionState<IntakeState, FormData>(saveIntake, {});
  const locked = ["wiped", "refurbished", "placed"].includes(p.status);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={p.id} />
      <div>
        <label className="label" htmlFor="serials">Serial numbers ({p.serials.length} recorded, {p.batch.quantity} pledged)</label>
        <textarea id="serials" name="serials" rows={6} className="field font-mono text-sm" defaultValue={p.serials.join("\n")} disabled={locked} placeholder={"One per line, or scan each barcode\ne.g. 7HKQ2M3"} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="wipeMethod">Wipe method</label>
          <select id="wipeMethod" name="wipeMethod" className="field" defaultValue={p.wipeMethod ?? ""} disabled={locked}>
            <option value="">Not wiped yet</option>
            {Object.entries(WIPE_METHODS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="wipedBy">Wiped by (staff or volunteer)</label>
          <input id="wipedBy" name="wipedBy" className="field" defaultValue={p.wipedBy} disabled={locked} />
        </div>
      </div>
      {locked ? (
        <p className="text-sm text-muted">Locked: the certificate has been issued from these records.</p>
      ) : (
        <div className="flex items-center gap-3">
          <button className="btn" disabled={pending}>{pending ? "Saving…" : "Save intake"}</button>
          {state.saved && <span className="text-sm text-great">Saved</span>}
          {state.error && <span className="text-sm text-red-700">{state.error}</span>}
        </div>
      )}
    </form>
  );
}
