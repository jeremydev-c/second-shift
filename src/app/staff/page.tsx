import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { formatSlot } from "@/lib/slots";
import { listPledges } from "@/lib/store";
import { STATUSES, STATUS_LABELS, type Pledge } from "@/lib/types";
import AdvanceButton from "./AdvanceButton";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Depot board", robots: { index: false } };
export const dynamic = "force-dynamic";

const VERDICT_DOT = { great: "bg-great", good: "bg-good", recycle: "bg-recycle" };

export default async function StaffBoard() {
  await requireStaff();
  const pledges = await listPledges();
  const incoming = pledges.filter((p) => p.status === "pledged");

  // Group incoming laptops by model so staff can plan one refurbishing run per model.
  const byModel = new Map<string, number>();
  for (const p of incoming) {
    const key = `${p.batch.brand} ${p.batch.model}`;
    byModel.set(key, (byModel.get(key) ?? 0) + p.batch.quantity);
  }
  const models = [...byModel].sort((a, b) => b[1] - a[1]);
  const laptops = (s: (typeof STATUSES)[number]) => pledges.filter((p) => p.status === s).reduce((n, p) => n + p.batch.quantity, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Free Geek Toronto · Staff</p>
          <h1 className="display mt-1 text-5xl">Depot board</h1>
        </div>
        <form action={logout}><button className="font-mono text-xs uppercase tracking-widest text-muted hover:text-ink">Sign out</button></form>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUSES.map((s) => (
          <div key={s} className="ticket p-4">
            <p className="eyebrow">{STATUS_LABELS[s]}</p>
            <p className="display mt-1 text-4xl text-brand">{laptops(s)}</p>
            <p className="text-xs text-muted">laptops</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="ticket self-start p-5">
          <p className="eyebrow">Coming in · by model</p>
          {models.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No pledges waiting.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {models.map(([m, n]) => (
                <li key={m} className="flex justify-between gap-3 text-sm">
                  <span>{m}</span>
                  <span className="font-display text-lg font-semibold">{n}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted">Same-model batches can be refurbished in one run.</p>
        </div>

        <div className="ticket overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-brand text-brand-ink">
              <tr className="font-mono text-[11px] uppercase tracking-[0.14em]">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Arrives</th>
                <th className="px-4 py-3">Stop</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {pledges.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-muted">No pledges yet.</td></tr>
              )}
              {pledges.map((p) => (
                <tr key={p.id} className="border-t border-line align-top">
                  <td className="px-4 py-3">
                    <Link href={`/staff/${p.id}`} className="font-semibold text-brand underline-offset-2 hover:underline">{p.company}</Link>
                    <p className="text-xs text-muted">{p.contactName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${VERDICT_DOT[p.fit.verdict]}`} />
                    {p.batch.quantity} × {p.batch.brand} {p.batch.model}
                    <p className="text-xs text-muted">{p.batch.year}</p>
                  </td>
                  <td className="px-4 py-3">{arrival(p)}</td>
                  <td className="px-4 py-3 font-medium">{STATUS_LABELS[p.status]}</td>
                  <td className="px-4 py-3">
                    <AdvanceButton id={p.id} next={STATUSES[STATUSES.indexOf(p.status) + 1]} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function arrival(p: Pledge) {
  return p.handover.type === "dropoff" ? formatSlot(p.handover.slot).replace(/^(\w+), /, "") : "Pickup to arrange";
}
