"use client";

import Link from "next/link";
import { useState } from "react";
import { ItemIcon, type IconName } from "./icons";

type Answer = "yes" | "no";
type Item = { name: string; icon: IconName; answer: Answer; note: string };

// FGT wants household donations limited to computers and accessories (case brief); everything else goes to recycling.
const ITEMS: Item[] = [
  { name: "Laptop", icon: "laptop", answer: "yes", note: "Bring the charger if you have it. The drive is wiped before anything else happens." },
  { name: "Desktop computer", icon: "desktop", answer: "yes", note: "Towers and all-in-ones are both welcome." },
  { name: "Flat-screen monitor", icon: "monitor", answer: "yes", note: "LCD or LED monitors with their power cable." },
  { name: "Keyboard or mouse", icon: "keyboard", answer: "yes", note: "Wired or wireless (bring the receiver)." },
  { name: "Webcam or headset", icon: "headset", answer: "yes", note: "USB accessories in working order." },
  { name: "Computer parts", icon: "chip", answer: "yes", note: "RAM, drives, graphics cards, power supplies: hobbyists buy these." },
  { name: "Chargers and cables", icon: "plug", answer: "yes", note: "Laptop chargers are always needed." },
  { name: "Printer or scanner", icon: "printer", answer: "no", note: "Not refurbished here. Use an electronics recycling drop-off." },
  { name: "TV", icon: "tv", answer: "no", note: "Not refurbished here. Use an electronics recycling drop-off." },
  { name: "Old tube (CRT) monitor", icon: "crt", answer: "no", note: "Contains lead glass: take it to an electronics recycling drop-off." },
  { name: "Phone", icon: "phone", answer: "no", note: "Use a phone trade-in or an electronics recycling drop-off." },
  { name: "Kitchen appliance", icon: "pan", answer: "no", note: "Not electronics FGT can reuse. Check the City of Toronto's Waste Wizard." },
];

export default function Checker() {
  const [picked, setPicked] = useState<Item>();
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ITEMS.map((it) => (
          <li key={it.name}>
            <button
              type="button"
              onClick={() => setPicked(it)}
              aria-pressed={picked?.name === it.name}
              className={`ticket flex w-full flex-col items-start gap-2 p-4 text-left transition ${picked?.name === it.name ? "ring-2 ring-signal" : "hover:ring-2 hover:ring-line"}`}
            >
              <span className="text-brand"><ItemIcon name={it.icon} /></span>
              <span className="font-semibold leading-tight">{it.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-6 lg:self-start" aria-live="polite">
        {picked ? (
          <div className="ticket overflow-hidden">
            <div className={`h-2 ${picked.answer === "yes" ? "bg-great" : "bg-recycle"}`} />
            <div className="p-5">
              <p className="eyebrow">{picked.name}</p>
              <p className={`display mt-1 text-4xl ${picked.answer === "yes" ? "text-great" : "text-recycle"}`}>
                {picked.answer === "yes" ? "Yes, bring it" : "Not here"}
              </p>
              <p className="mt-2 text-sm">{picked.note}</p>
            </div>
            <div className="ticket-tear" />
            <p className="p-5 text-sm text-muted">
              {picked.answer === "yes"
                ? "Drop-offs: Friday and Saturday, 12–5pm, 180 Sudbury St, Unit C3."
                : "Thank you for recycling responsibly. It keeps the drop-off line clear for computers."}
            </p>
          </div>
        ) : (
          <div className="ticket p-5 text-muted">Pick an item to check it.</div>
        )}
        <p className="mt-4 text-sm text-muted">
          Retiring laptops at work? <Link href="/donate" className="text-brand underline">Pledge a business batch.</Link>
        </p>
      </aside>
    </div>
  );
}
