// FGT accepts technology drop-offs Friday and Saturday, 12:00–17:00 Toronto time (freegeektoronto.org).
export const DROPOFF_DAYS = [5, 6];
export const DROPOFF_HOURS = [12, 13, 14, 15, 16];
export const BATCHES_PER_SLOT = 2;

export type Slot = { id: string; label: string; taken: number; full: boolean };

// Slot ids are Toronto wall-clock times ("2026-10-30T12:00"), so they mean the same thing for every viewer.
export function upcomingSlots(taken: Record<string, number>, from = new Date(), weeks = 2): Slot[] {
  const slots: Slot[] = [];
  const start = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + 1));
  for (let d = 0; d < weeks * 7; d++) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + d);
    if (!DROPOFF_DAYS.includes(day.getUTCDay())) continue;
    const date = day.toISOString().slice(0, 10);
    const dayLabel = day.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
    for (const h of DROPOFF_HOURS) {
      const id = `${date}T${String(h).padStart(2, "0")}:00`;
      const n = taken[id] ?? 0;
      slots.push({ id, label: `${dayLabel}, ${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "pm" : "am"}`, taken: n, full: n >= BATCHES_PER_SLOT });
    }
  }
  return slots;
}

export function formatSlot(id: string): string {
  const [date, time] = id.split("T");
  const d = new Date(`${date}T00:00:00Z`);
  const h = Number(time.slice(0, 2));
  return `${d.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })} at ${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "pm" : "am"}`;
}
