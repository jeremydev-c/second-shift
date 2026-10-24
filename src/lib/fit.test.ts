import { describe, expect, it } from "vitest";
import { assessBatch } from "./fit";
import { upcomingSlots } from "./slots";
import type { Batch } from "./types";

const now = new Date("2026-10-24T12:00:00Z");
const base: Batch = { brand: "Dell", model: "Latitude 5320", year: 2022, quantity: 20, condition: "works", chargers: "all" };

describe("assessBatch", () => {
  it("rates a recent, working batch of business laptops as a great fit", () => {
    const fit = assessBatch(base, now);
    expect(fit.verdict).toBe("great");
    expect(fit.score).toBe(100);
    expect(fit.sellable).toBe(17);
    expect(fit.estValueCad).toBe(17 * 350);
    expect(fit.ewasteKg).toBe(44);
  });

  it("sends laptops that don't power on to recycling", () => {
    const fit = assessBatch({ ...base, condition: "dead" }, now);
    expect(fit.verdict).toBe("recycle");
    expect(fit.sellable).toBe(0);
    expect(fit.estValueCad).toBe(0);
  });

  it("sends laptops older than 8 years to recycling even in good condition", () => {
    expect(assessBatch({ ...base, year: 2015 }, now).verdict).toBe("recycle");
  });

  it("rates mid-age, worn laptops without chargers as a good fit", () => {
    const fit = assessBatch({ ...base, year: 2020, condition: "wear", chargers: "none", quantity: 3 }, now);
    expect(fit.verdict).toBe("good");
    expect(fit.sellable).toBe(1);
  });
});

describe("upcomingSlots", () => {
  it("only offers Friday and Saturday afternoons and marks full slots", () => {
    const slots = upcomingSlots({ "2026-10-30T12:00": 2 }, now, 1);
    expect(slots).toHaveLength(10);
    expect(slots[0]).toMatchObject({ id: "2026-10-30T12:00", full: true });
    expect(slots.every((s) => /^2026-10-3[01]T1[2-6]:00$/.test(s.id))).toBe(true);
  });
});
