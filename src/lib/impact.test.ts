import { describe, expect, it } from "vitest";
import { assessBatch } from "./fit";
import { impactOf, isShareable, tierFor } from "./impact";
import type { Batch, Pledge } from "./types";

const batch: Batch = { brand: "Dell", model: "Latitude 5320", year: 2022, quantity: 20, condition: "works", chargers: "all" };
const pledge = (over: Partial<Pledge> = {}): Pledge => ({
  id: "x",
  shareId: "s",
  listOnWall: true,
  createdAt: "2026-10-25T00:00:00Z",
  company: "Demo Co",
  contactName: "A",
  email: "a@example.com",
  postalCode: "M5V 2T6",
  batch,
  fit: assessBatch(batch, new Date("2026-10-25")),
  handover: { type: "dropoff", slot: "2026-10-30T12:00" },
  status: "pledged",
  history: [],
  serials: [],
  ...over,
});

describe("impact", () => {
  it("uses the pledged quantity until serials are counted, then the real count", () => {
    expect(impactOf(pledge()).laptops).toBe(20);
    expect(impactOf(pledge({ serials: ["A1B2", "C3D4", "E5F6"] }))).toEqual({ laptops: 3, people: 2, kg: 7 });
  });

  it("only becomes shareable once FGT has received the batch", () => {
    expect(isShareable(pledge())).toBe(false);
    expect(isShareable(pledge({ status: "received" }))).toBe(true);
  });

  it("assigns partner tiers by laptops given", () => {
    expect([1, 5, 20, 49, 50].map(tierFor)).toEqual(["Supporter", "Bronze", "Silver", "Silver", "Gold"]);
  });
});
