import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { impactOf, isShareable } from "@/lib/impact";
import { getPledgeByShareId } from "@/lib/store";
import ShareButtons from "./ShareButtons";

export const dynamic = "force-dynamic";

async function load(shareId: string) {
  const p = await getPledgeByShareId(shareId);
  return p && isShareable(p) ? p : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const p = await load((await params).shareId);
  if (!p) return { title: "Impact" };
  const i = impactOf(p);
  const title = `${p.company} gave ${i.laptops} laptops a second shift`;
  const description = `${i.laptops} work laptops, securely wiped and refurbished by Free Geek Toronto, for students, newcomers and families who need a computer.`;
  return { title, description, openGraph: { title, description, type: "article" }, twitter: { card: "summary_large_image", title, description } };
}

export default async function ImpactPage({ params }: { params: Promise<{ shareId: string }> }) {
  const p = await load((await params).shareId);
  if (!p) notFound();
  const i = impactOf(p);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <article className="ticket overflow-hidden">
        <div className="flex items-center justify-between gap-4 bg-brand px-6 py-4 text-brand-ink">
          <span className="font-display text-xl font-bold uppercase tracking-tight">Second Shift · Impact</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-signal font-display text-xl font-bold">2</span>
        </div>
        <div className="h-1.5 bg-signal" />
        <div className="p-6">
          <p className="eyebrow">Partner of Free Geek Toronto</p>
          <h1 className="display mt-2 text-5xl leading-[0.95] sm:text-6xl">
            {p.company} gave <span className="text-signal">{i.laptops} laptops</span> a second shift.
          </h1>
        </div>
        <div className="ticket-tear" />
        <dl className="grid grid-cols-3 gap-4 p-6">
          <Stat n={String(i.laptops)} l="laptops reused, not dumped" />
          <Stat n={String(i.people)} l="people who could get an affordable computer" />
          <Stat n={`${i.kg} kg`} l="of e-waste kept out of landfill" />
        </dl>
        <div className="ticket-tear" />
        <p className="p-6 text-muted">
          Every drive is securely wiped before refurbishment. Free Geek Toronto sells refurbished computers at low prices to
          students, newcomers, seniors and families, and gives people facing barriers to work hands-on tech skills.
        </p>
      </article>

      <ShareButtons title={`${p.company} gave ${i.laptops} laptops a second shift with Free Geek Toronto`} />
      <p className="mt-8 text-sm text-muted">
        Retiring laptops at your company? <Link href="/donate" className="text-brand underline">Pledge them here.</Link>
      </p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">People-reached figures are estimates</p>
    </main>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <dt className="display text-4xl text-brand sm:text-5xl">{n}</dt>
      <dd className="text-xs text-muted sm:text-sm">{l}</dd>
    </div>
  );
}
