import { ASSUMPTIONS } from "./fit";
import { STATUSES, type Pledge } from "./types";

export const SHAREABLE_FROM = STATUSES.indexOf("received");

export function isShareable(p: Pledge) {
  return STATUSES.indexOf(p.status) >= SHAREABLE_FROM;
}

// Once FGT has counted the batch, the serial list is the real number; before that, the pledge is.
export function impactOf(p: Pledge) {
  const laptops = p.serials.length || p.batch.quantity;
  const rate = ASSUMPTIONS.sellableRate[p.fit.verdict];
  return {
    laptops,
    people: Math.floor(laptops * rate),
    kg: Math.round(laptops * ASSUMPTIONS.kgPerLaptop),
  };
}

export const TIERS = [
  { name: "Gold", min: 50 },
  { name: "Silver", min: 20 },
  { name: "Bronze", min: 5 },
  { name: "Supporter", min: 1 },
] as const;

export function tierFor(laptops: number) {
  return TIERS.find((t) => laptops >= t.min)!.name;
}
