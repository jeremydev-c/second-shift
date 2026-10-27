"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { assessBatch, VERDICT_COPY } from "@/lib/fit";
import type { Slot } from "@/lib/slots";
import { BRANDS, CHARGERS, CONDITIONS, type Batch } from "@/lib/types";
import { submitPledge, type PledgeState } from "./actions";

const thisYear = new Date().getFullYear();
const VERDICT_COLOR = { great: "text-great", good: "text-good", recycle: "text-recycle" };
const VERDICT_BAR = { great: "bg-great", good: "bg-good", recycle: "bg-recycle" };

export default function PledgeForm({ slots }: { slots: Slot[] }) {
  const [state, action, pending] = useActionState<PledgeState, FormData>(submitPledge, {});
  const v = state.values ?? {};
  const e = state.errors ?? {};

  const [batch, setBatch] = useState<Batch>({
    brand: (v.brand as Batch["brand"]) ?? "Dell",
    model: v.model ?? "",
    year: Number(v.year) || thisYear - 4,
    quantity: Number(v.quantity) || 10,
    condition: (v.condition as Batch["condition"]) ?? "works",
    chargers: (v.chargers as Batch["chargers"]) ?? "all",
  });
  const [chosenHandover, setHandover] = useState(v.handover ?? "dropoff");
  const fit = useMemo(() => assessBatch(batch), [batch]);
  const set = <K extends keyof Batch>(k: K, val: Batch[K]) => setBatch((b) => ({ ...b, [k]: val }));
  const canPickup = batch.quantity >= 10;
  const handover = canPickup ? chosenHandover : "dropoff";

  return (
    <form action={action} className="mt-8 grid gap-8 pb-24 lg:grid-cols-[1fr_340px] lg:pb-0">
      <div className="space-y-8">
        <fieldset className="ticket space-y-4 p-5" aria-labelledby="step-1">
          <h2 id="step-1" className="flex items-center gap-3"><span className="route-dot">1</span><span className="display text-2xl">The laptops</span></h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="brand">Brand</label>
              <select id="brand" name="brand" className="field" value={batch.brand} onChange={(ev) => set("brand", ev.target.value as Batch["brand"])}>
                {BRANDS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="model">Model</label>
              <input id="model" name="model" className="field" placeholder="e.g. Latitude 5320" value={batch.model} onChange={(ev) => set("model", ev.target.value)} />
              <Err msg={e.model} />
            </div>
            <div>
              <label className="label" htmlFor="year">Year bought</label>
              <input id="year" name="year" type="number" min={2005} max={thisYear} className="field" value={batch.year} onChange={(ev) => set("year", Number(ev.target.value))} />
              <Err msg={e.year} />
            </div>
            <div>
              <label className="label" htmlFor="quantity">How many?</label>
              <input id="quantity" name="quantity" type="number" min={1} max={500} className="field" value={batch.quantity} onChange={(ev) => set("quantity", Number(ev.target.value))} />
              <Err msg={e.quantity} />
            </div>
            <div>
              <label className="label" htmlFor="condition">Condition (most of them)</label>
              <select id="condition" name="condition" className="field" value={batch.condition} onChange={(ev) => set("condition", ev.target.value as Batch["condition"])}>
                {Object.entries(CONDITIONS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="chargers">Chargers included?</label>
              <select id="chargers" name="chargers" className="field" value={batch.chargers} onChange={(ev) => set("chargers", ev.target.value as Batch["chargers"])}>
                {Object.entries(CHARGERS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="ticket space-y-4 p-5" aria-labelledby="step-2">
          <h2 id="step-2" className="flex items-center gap-3"><span className="route-dot">2</span><span className="display text-2xl">Getting them to Free Geek</span></h2>
          <div className="flex flex-wrap gap-3">
            <Choice name="handover" value="dropoff" checked={handover === "dropoff"} onChange={setHandover} label="Drop off (Fri/Sat, 12–5pm)" />
            <Choice name="handover" value="pickup" checked={handover === "pickup"} onChange={setHandover} label="Request a pickup (10+ laptops)" disabled={!canPickup} />
          </div>
          <Err msg={e.handover} />
          {handover === "dropoff" ? (
            <div>
              <label className="label" htmlFor="slot">Drop-off time</label>
              <select id="slot" name="slot" className="field" defaultValue={v.slot ?? ""}>
                <option value="" disabled>Choose a time</option>
                {slots.map((s) => (
                  <option key={s.id} value={s.id} disabled={s.full}>{s.label}{s.full ? " (full)" : ""}</option>
                ))}
              </select>
              <Err msg={e.slot} />
              <p className="mt-1 text-sm text-muted">180 Sudbury St, Unit C3, Toronto</p>
            </div>
          ) : (
            <div>
              <label className="label" htmlFor="address">Pickup address</label>
              <input id="address" name="address" className="field" defaultValue={v.address} placeholder="Street, unit, city" />
              <Err msg={e.address} />
            </div>
          )}
        </fieldset>

        <fieldset className="ticket space-y-4 p-5" aria-labelledby="step-3">
          <h2 id="step-3" className="flex items-center gap-3"><span className="route-dot">3</span><span className="display text-2xl">Your company</span></h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Text id="company" label="Company name" e={e} v={v} />
            <Text id="contactName" label="Your name" e={e} v={v} />
            <Text id="email" label="Work email" type="email" e={e} v={v} />
            <Text id="postalCode" label="Postal code" e={e} v={v} placeholder="M6J 0A8" />
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="listOnWall" value="yes" defaultChecked={v.listOnWall === "yes"} className="mt-1 h-4 w-4 accent-[var(--brand)]" />
            <span>Show our company name on the public <strong>partner wall</strong> once Free Geek receives our laptops.</span>
          </label>
        </fieldset>

        <div className="space-y-3">
          <button className="btn w-full sm:w-auto" disabled={pending}>{pending ? "Sending…" : "Pledge these laptops"}</button>
          <p className="text-xs text-muted">
            By pledging you agree to the <Link href="/terms" className="underline">terms</Link> and{" "}
            <Link href="/privacy" className="underline">privacy policy</Link>.
          </p>
        </div>
      </div>

      {/* On phones the full ticket would sit below the form, so a compact live bar stays in view instead. */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface shadow-[0_-8px_24px_-12px_rgb(15_29_46/0.25)] lg:hidden" aria-live="polite">
        <div className={`h-1.5 ${VERDICT_BAR[fit.verdict]}`} />
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="eyebrow">Fit check · live</p>
            <p className={`display text-2xl ${VERDICT_COLOR[fit.verdict]}`}>{VERDICT_COPY[fit.verdict].title}</p>
          </div>
          <div className="text-right">
            <p className="display text-2xl text-brand">{fit.peopleConnected}</p>
            <p className="text-xs text-muted">people could get a computer</p>
          </div>
        </div>
      </div>

      <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
        <div className="ticket overflow-hidden" aria-live="polite">
          <div className={`h-2 ${VERDICT_BAR[fit.verdict]}`} />
          <div className="p-5">
            <p className="eyebrow">Fit check · live</p>
            <p className={`display mt-1 text-4xl ${VERDICT_COLOR[fit.verdict]}`}>{VERDICT_COPY[fit.verdict].title}</p>
            <p className="mt-2 text-sm">{VERDICT_COPY[fit.verdict].body}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {fit.reasons.map((r) => <li key={r} className="flex gap-2"><span className="text-signal">▸</span>{r}</li>)}
            </ul>
          </div>
          <div className="ticket-tear" />
          <dl className="grid grid-cols-2 gap-3 p-5">
            <Stat n={fit.peopleConnected} l="people could get a computer" />
            <Stat n={`${fit.ewasteKg} kg`} l="kept out of landfill" />
          </dl>
          <p className="px-5 pb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Estimate · FGT confirms on inspection</p>
        </div>
      </aside>
    </form>
  );
}

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-sm text-red-700">{msg}</p> : null;
}

function Text({ id, label, e, v, type = "text", placeholder }: { id: string; label: string; e: Record<string, string>; v: Record<string, string>; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} name={id} type={type} className="field" defaultValue={v[id]} placeholder={placeholder} />
      <Err msg={e[id]} />
    </div>
  );
}

function Choice({ name, value, checked, onChange, label, disabled }: { name: string; value: string; checked: boolean; onChange: (v: string) => void; label: string; disabled?: boolean }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 rounded-sm border-2 px-3 py-2 font-medium ${checked ? "border-brand bg-brand/5" : "border-line"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={() => onChange(value)} />
      {label}
    </label>
  );
}

function Stat({ n, l }: { n: number | string; l: string }) {
  return (
    <div>
      <dt className="display text-4xl text-brand">{n}</dt>
      <dd className="text-xs text-muted">{l}</dd>
    </div>
  );
}
