// Shared layout for the privacy policy and terms pages.
export default function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display mt-2 text-5xl">{title}</h1>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">Last updated {updated}</p>
      <div className="ticket mt-8 space-y-6 p-6 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:mb-1 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </main>
  );
}
