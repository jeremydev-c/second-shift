import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const body = Barlow({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600"] });
const display = Barlow_Condensed({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700"] });
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "Second Shift · Free Geek Toronto", template: "%s · Second Shift" },
  description: "Give your company's retired laptops a second shift with Free Geek Toronto: data wiped, refurbished, and put back to work in the community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} ${mono.variable} flex min-h-screen flex-col font-sans antialiased`}>
        <header className="bg-brand text-brand-ink print:hidden">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-signal font-display text-lg font-bold leading-none">2</span>
              <span className="font-display text-2xl font-bold uppercase tracking-tight">Second Shift</span>
            </Link>
            <nav className="flex items-center gap-5 font-display text-lg font-semibold uppercase tracking-wide">
              <Link href="/donate" className="hover:text-signal">Pledge</Link>
            </nav>
          </div>
          <div className="h-1.5 bg-signal" />
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-line print:hidden">
          <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-2 px-4 py-6 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            <span>A partner programme for Free Geek Toronto</span>
            <span>180 Sudbury St, Unit C3 · Drop-offs Fri–Sat 12–5pm</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
