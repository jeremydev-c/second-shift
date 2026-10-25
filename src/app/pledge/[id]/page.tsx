import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VERDICT_COPY } from "@/lib/fit";
import { isShareable } from "@/lib/impact";
import { formatSlot } from "@/lib/slots";
import { getPledge } from "@/lib/store";
import { CONDITIONS, STATUSES, STATUS_LABELS } from "@/lib/types";

export const metadata: Metadata = { title: "Your shift ticket", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPledge(id);
  if (!p) notFound();
  const step = STATUSES.indexOf(p.status);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="eyebrow">Your shift ticket</p>
      <h1 className="display mt-1 text-5xl">Thank you, {p.company}!</h1>
      <p className="mt-2 text-muted">
        Keep this link. It&apos;s your private tracker, and it&apos;s where your data-wipe certificate will appear.
      </p>

      <article className="ticket mt-8 overflow-hidden">
        <div className="flex items-center justify-between gap-4 bg-brand px-5 py-3 text-brand-ink">
          <span className="font-display text-xl font-bold uppercase tracking-tight">Second Shift</span>
          <span className="font-mono text-sm tracking-widest">#{p.id}</span>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-3">
          <Cell k="Passengers" v={`${p.batch.quantity} laptops`} sub={`${p.batch.brand} ${p.batch.model} · ${p.batch.year}`} />
          {p.handover.type === "dropoff" ? (
            <Cell k="Departs" v={formatSlot(p.handover.slot).replace(/ at .*/, "")} sub={formatSlot(p.handover.slot).replace(/.* at /, "")} />
          ) : (
            <Cell k="Departs" v="Pickup" sub="FGT will call to arrange" />
          )}
          <Cell
            k={p.handover.type === "dropoff" ? "Platform" : "From"}
            v={p.handover.type === "dropoff" ? "180 Sudbury St" : p.handover.address}
            sub={p.handover.type === "dropoff" ? "Unit C3, Toronto" : `Contact: ${p.contactName}`}
          />
        </div>

        <div className="ticket-tear" />

        <div className="p-5">
          <p className="eyebrow">Route</p>
          <ol className="relative mt-4 grid grid-cols-5">
            <li className="absolute left-[10%] right-[10%] top-[9px] h-1 rounded bg-line" aria-hidden />
            <li
              className="absolute left-[10%] top-[9px] h-1 rounded bg-signal"
              style={{ width: `${(step / (STATUSES.length - 1)) * 80}%` }}
              aria-hidden
            />
            {STATUSES.map((s, i) => (
              <li key={s} className="relative flex flex-col items-center text-center" aria-current={i === step ? "step" : undefined}>
                <span
                  className={`h-[22px] w-[22px] rounded-full border-4 ${
                    i < step ? "border-signal bg-signal" : i === step ? "border-signal bg-surface" : "border-line bg-surface"
                  }`}
                />
                <span className={`mt-2 text-xs sm:text-sm ${i <= step ? "font-semibold" : "text-muted"}`}>{STATUS_LABELS[s]}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="ticket-tear" />

        <div className="grid gap-5 p-5 sm:grid-cols-3">
          <Cell k="Fit" v={VERDICT_COPY[p.fit.verdict].title} sub={CONDITIONS[p.batch.condition]} />
          <Cell k="Could connect" v={`${p.fit.peopleConnected} people`} sub="with an affordable computer" />
          <Cell k="Landfill avoided" v={`${p.fit.ewasteKg} kg`} sub="of e-waste" />
        </div>
      </article>

      <div className="mt-6 flex flex-wrap gap-3">
        {step >= STATUSES.indexOf("wiped") && (
          <Link href={`/pledge/${p.id}/certificate`} className="btn">Download your data-wipe certificate</Link>
        )}
        {isShareable(p) && p.shareId && (
          <Link href={`/impact/${p.shareId}`} className="btn-ghost">Share your impact</Link>
        )}
      </div>
      {p.handover.type === "dropoff" && step === 0 && (
        <p className="mt-6 text-sm text-muted">Please bring chargers if you have them. Data is wiped before anything else happens to your laptops.</p>
      )}
      <Link href="/donate" className="btn-ghost mt-8">Pledge another batch</Link>
    </main>
  );
}

function Cell({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div>
      <p className="eyebrow">{k}</p>
      <p className="display mt-1 text-2xl leading-tight">{v}</p>
      {sub && <p className="text-sm text-muted">{sub}</p>}
    </div>
  );
}
