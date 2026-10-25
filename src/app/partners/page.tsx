import type { Metadata } from "next";
import Link from "next/link";
import { impactOf, isShareable, tierFor, TIERS } from "@/lib/impact";
import { listPledges } from "@/lib/store";

export const metadata: Metadata = {
  title: "Partner wall",
  description: "Toronto businesses that gave their retired laptops a second shift with Free Geek Toronto.",
};
export const dynamic = "force-dynamic";

const TIER_STYLE: Record<string, string> = {
  Gold: "bg-signal text-signal-ink",
  Silver: "bg-brand text-brand-ink",
  Bronze: "bg-[#8a5a2b] text-white",
  Supporter: "bg-line text-ink",
};

export default async function PartnersPage() {
  const delivered = (await listPledges()).filter(isShareable);

  // Totals count every delivered batch; the wall only names companies that opted in.
  const totals = delivered.reduce(
    (t, p) => {
      const i = impactOf(p);
      return { laptops: t.laptops + i.laptops, people: t.people + i.people, kg: t.kg + i.kg };
    },
    { laptops: 0, people: 0, kg: 0 },
  );
  const byCompany = new Map<string, number>();
  for (const p of delivered.filter((p) => p.listOnWall)) {
    byCompany.set(p.company, (byCompany.get(p.company) ?? 0) + impactOf(p).laptops);
  }
  const partners = [...byCompany].sort((a, b) => b[1] - a[1]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <p className="eyebrow">Free Geek Toronto · Business partners</p>
      <h1 className="display mt-2 text-5xl sm:text-6xl">The partner wall</h1>
      <p className="mt-3 max-w-2xl text-muted">Toronto businesses whose old work laptops are now on their second shift with students, newcomers and families.</p>

      <section className="mt-8 grid grid-cols-3 gap-3">
        {[
          [totals.laptops, "laptops reused"],
          [totals.people, "people connected (est.)"],
          [`${totals.kg} kg`, "kept out of landfill"],
        ].map(([n, l]) => (
          <div key={String(l)} className="ticket p-4 sm:p-5">
            <p className="display text-4xl text-brand sm:text-5xl">{n}</p>
            <p className="text-xs text-muted sm:text-sm">{l}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        {partners.length === 0 ? (
          <div className="ticket p-6 text-muted">The first partners will appear here once their laptops arrive.</div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map(([company, laptops]) => {
              const tier = tierFor(laptops);
              return (
                <li key={company} className="ticket flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{company}</p>
                    <p className="text-sm text-muted">{laptops} laptop{laptops === 1 ? "" : "s"}</p>
                  </div>
                  <span className={`shrink-0 rounded-sm px-2.5 py-1 font-display text-sm font-semibold uppercase tracking-wide ${TIER_STYLE[tier]}`}>{tier}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
        Tiers: {TIERS.filter((t) => t.min > 1).map((t) => `${t.name} ${t.min}+`).join(" · ")} laptops
      </p>
      <Link href="/donate" className="btn mt-8">Join the wall →</Link>
    </main>
  );
}
