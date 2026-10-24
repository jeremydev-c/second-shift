import type { Batch, Fit, Verdict } from "./types";

// Planning assumptions, shown to users and in the pitch. None of these come from FGT data.
export const ASSUMPTIONS = {
  kgPerLaptop: 2.2,
  sellableRate: { great: 0.85, good: 0.6, recycle: 0 } as Record<Verdict, number>,
  // Ballpark FGT shop prices for business laptops by age (shop.freegeektoronto.org, Oct 2026).
  priceByAge: [
    { maxAge: 4, cad: 350 },
    { maxAge: 6, cad: 270 },
    { maxAge: 8, cad: 180 },
  ],
};

const BUSINESS_LINES = /latitude|precision|thinkpad|elitebook|probook|zbook|macbook|surface|travelmate|expertbook/i;

export function assessBatch(batch: Batch, now = new Date()): Fit {
  const age = Math.max(0, now.getFullYear() - batch.year);
  const reasons: string[] = [];
  let score = 0;

  if (age <= 4) {
    score += 40;
    reasons.push(`${age <= 1 ? "Nearly new" : `${age} years old`}: plenty of life left`);
  } else if (age <= 6) {
    score += 28;
    reasons.push(`${age} years old: still very usable for school and work`);
  } else if (age <= 8) {
    score += 12;
    reasons.push(`${age} years old: may need upgrades before resale`);
  } else {
    reasons.push(`${age} years old: likely too old to refurbish`);
  }

  const conditionPoints = { works: 30, wear: 22, damaged: 8, dead: 0 }[batch.condition];
  score += conditionPoints;
  if (batch.condition === "damaged") reasons.push("Damaged units take longer to repair");
  if (batch.condition === "dead") reasons.push("Units that don't power on usually go to parts or recycling");

  score += { all: 10, some: 5, none: 0 }[batch.chargers];
  if (batch.chargers === "none") reasons.push("No chargers: FGT has to source them");

  if (BUSINESS_LINES.test(batch.model) || ["Dell", "Lenovo", "HP", "Apple", "Microsoft"].includes(batch.brand)) {
    score += 10;
    if (BUSINESS_LINES.test(batch.model)) reasons.push("Business-grade model: durable and easy to source parts for");
  } else {
    score += 4;
  }

  if (batch.quantity >= 10) {
    score += 10;
    reasons.push(`${batch.quantity} matching laptops can be refurbished as one batch`);
  } else if (batch.quantity >= 5) {
    score += 5;
  }

  score = Math.min(100, score);
  // A batch that doesn't power on, or is past 8 years, can't be a refurbishing fit however it scores elsewhere.
  const verdict: Verdict = batch.condition === "dead" || age > 8 ? "recycle" : score >= 70 ? "great" : score >= 45 ? "good" : "recycle";

  const sellable = Math.floor(batch.quantity * ASSUMPTIONS.sellableRate[verdict]);
  const price = ASSUMPTIONS.priceByAge.find((p) => age <= p.maxAge)?.cad ?? 0;

  return {
    score,
    verdict,
    reasons,
    sellable,
    peopleConnected: sellable,
    ewasteKg: Math.round(batch.quantity * ASSUMPTIONS.kgPerLaptop),
    estValueCad: sellable * price,
  };
}

export const VERDICT_COPY: Record<Verdict, { title: string; body: string }> = {
  great: {
    title: "Great fit",
    body: "These are exactly the laptops Free Geek Toronto refurbishes fastest and gets into new hands.",
  },
  good: {
    title: "Good fit",
    body: "Free Geek Toronto can refurbish most of these. Some may become parts.",
  },
  recycle: {
    title: "Recycling, not refurbishing",
    body: "These are unlikely to be resold, but Free Geek Toronto can still recycle them responsibly and wipe the data.",
  },
};
