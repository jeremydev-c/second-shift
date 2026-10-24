import Link from "next/link";

const STOPS = [
  { n: "1", t: "Pledge", d: "Tell us what you're retiring. See the fit straight away." },
  { n: "2", t: "Drop off", d: "Fri or Sat afternoon, or a pickup for 10+ laptops." },
  { n: "3", t: "Wiped", d: "Every drive is securely erased. You get a certificate." },
  { n: "4", t: "Second shift", d: "Refurbished and sold affordably to people who need a computer." },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-14">
        <p className="eyebrow">Free Geek Toronto · Business partner programme</p>
        <h1 className="display mt-3 max-w-3xl text-6xl leading-[0.95] sm:text-7xl">
          Your old work laptops have <span className="text-signal">one more shift</span> in them.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Retiring a batch of company laptops? Free Geek Toronto securely wipes them, refurbishes them, and gets them to
          students, newcomers and families who can&apos;t afford a new computer. You get a data-wipe certificate and an
          impact report to share.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/donate" className="btn">Pledge your laptops →</Link>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <p className="eyebrow">The route</p>
          <ol className="relative mt-6 grid gap-8 sm:grid-cols-4 sm:gap-4">
            <li className="absolute left-4 right-4 top-[15px] hidden h-1 rounded bg-signal sm:block" aria-hidden />
            {STOPS.map((s) => (
              <li key={s.n} className="relative flex gap-4 sm:block">
                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-signal bg-surface font-display font-bold text-brand">
                  {s.n}
                </span>
                <div>
                  <p className="display mt-0 text-2xl sm:mt-3">{s.t}</p>
                  <p className="text-sm text-muted">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
