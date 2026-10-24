import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPledge } from "@/lib/store";
import { STATUSES, WIPE_METHODS } from "@/lib/types";
import PrintButton from "./PrintButton";

export const metadata: Metadata = { title: "Data-wipe certificate", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Certificate({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPledge(id);
  if (!p || STATUSES.indexOf(p.status) < STATUSES.indexOf("wiped") || !p.wipeMethod) notFound();
  const wipedAt = p.history.find((h) => h.status === "wiped")?.at ?? p.createdAt;
  const date = new Date(wipedAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "America/Toronto" });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 print:max-w-none print:p-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <article className="ticket overflow-hidden print:shadow-none">
        <header className="flex items-center justify-between gap-4 bg-brand px-6 py-4 text-brand-ink print:bg-brand">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-80">Free Geek Toronto · Second Shift</p>
            <h1 className="display text-3xl">Certificate of data sanitisation</h1>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-signal font-display text-2xl font-bold">2</span>
        </header>
        <div className="h-1.5 bg-signal" />

        <div className="space-y-5 p-6">
          <p>
            This certifies that the storage in the <strong>{p.serials.length}</strong> laptop{p.serials.length === 1 ? "" : "s"} listed below,
            donated by <strong>{p.company}</strong>, was sanitised by Free Geek Toronto on <strong>{date}</strong> before any refurbishment
            or reuse.
          </p>
          <dl className="grid gap-4 sm:grid-cols-3">
            <Cell k="Certificate no." v={`SS-${p.id}`} mono />
            <Cell k="Method" v={WIPE_METHODS[p.wipeMethod]} />
            <Cell k="Performed by" v={p.wipedBy ?? "Free Geek Toronto"} />
          </dl>
        </div>

        <div className="ticket-tear" />

        <div className="p-6">
          <p className="eyebrow">Devices · {p.batch.brand} {p.batch.model}</p>
          <ol className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm sm:grid-cols-3">
            {p.serials.map((s, i) => (
              <li key={s}><span className="text-muted">{String(i + 1).padStart(2, "0")}</span> {s}</li>
            ))}
          </ol>
        </div>

        <div className="ticket-tear" />

        <footer className="flex flex-wrap items-end justify-between gap-4 p-6 text-sm">
          <div>
            <p className="eyebrow">Issued to</p>
            <p className="font-semibold">{p.company}</p>
            <p className="text-muted">{p.contactName}</p>
          </div>
          <p className="max-w-xs text-right text-xs text-muted">
            Free Geek Toronto · C3-180 Sudbury St, Toronto ON M6J 0A8.
            <br />Prototype built for the FUSE Blueprint 2026 case. Not an official Free Geek Toronto document.
          </p>
        </footer>
      </article>
    </main>
  );
}

function Cell({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <dt className="eyebrow">{k}</dt>
      <dd className={`mt-1 font-semibold ${mono ? "font-mono" : ""}`}>{v}</dd>
    </div>
  );
}
