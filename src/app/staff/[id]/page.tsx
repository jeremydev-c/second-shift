import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { formatSlot } from "@/lib/slots";
import { getPledge } from "@/lib/store";
import { CHARGERS, CONDITIONS, STATUSES, STATUS_LABELS } from "@/lib/types";
import AdvanceButton from "../AdvanceButton";
import IntakeForm from "./IntakeForm";

export const metadata: Metadata = { title: "Batch", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function BatchPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const p = await getPledge(id);
  if (!p) notFound();
  const next = STATUSES[STATUSES.indexOf(p.status) + 1];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/staff" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-ink">← Depot board</Link>
      <h1 className="display mt-2 text-5xl">{p.company}</h1>
      <p className="text-muted">{p.contactName} · {p.email} · {p.postalCode}</p>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Info k="Batch" v={`${p.batch.quantity} × ${p.batch.brand} ${p.batch.model}`} sub={`${p.batch.year} · ${CONDITIONS[p.batch.condition]}`} />
        <Info k="Chargers" v={CHARGERS[p.batch.chargers]} sub={`Fit score ${p.fit.score}/100`} />
        <Info
          k="Arrives"
          v={p.handover.type === "dropoff" ? formatSlot(p.handover.slot) : "Pickup"}
          sub={p.handover.type === "pickup" ? p.handover.address : "180 Sudbury St, Unit C3"}
        />
      </section>

      <section className="ticket mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Current stop</p>
            <p className="display text-3xl">{STATUS_LABELS[p.status]}</p>
          </div>
          <AdvanceButton id={p.id} next={next} />
        </div>
      </section>

      <section className="ticket mt-6 p-5">
        <p className="eyebrow mb-4">Intake &amp; data wipe</p>
        <IntakeForm p={p} />
      </section>

      <section className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href={`/pledge/${p.id}`} className="text-brand underline">Partner&apos;s ticket page ↗</Link>
        {STATUSES.indexOf(p.status) >= STATUSES.indexOf("wiped") && (
          <Link href={`/pledge/${p.id}/certificate`} className="text-brand underline">Data-wipe certificate ↗</Link>
        )}
      </section>
    </main>
  );
}

function Info({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="ticket p-4">
      <p className="eyebrow">{k}</p>
      <p className="mt-1 font-semibold">{v}</p>
      {sub && <p className="text-sm text-muted">{sub}</p>}
    </div>
  );
}
