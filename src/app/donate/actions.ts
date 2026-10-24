"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { assessBatch } from "@/lib/fit";
import { upcomingSlots } from "@/lib/slots";
import { createPledge, newId, takenSlots } from "@/lib/store";
import { BRANDS, CHARGERS, CONDITIONS, type Handover } from "@/lib/types";

const thisYear = new Date().getFullYear();

const schema = z
  .object({
    company: z.string().trim().min(2, "Enter your company name").max(120),
    contactName: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().email("Enter a valid email"),
    postalCode: z
      .string()
      .trim()
      .regex(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, "Enter a Canadian postal code, e.g. M6J 0A8"),
    brand: z.enum(BRANDS),
    model: z.string().trim().min(2, "Enter the model, e.g. Latitude 5320").max(80),
    year: z.coerce.number().int().min(2005).max(thisYear, "Year can't be in the future"),
    quantity: z.coerce.number().int().min(1, "At least 1 laptop").max(500, "For more than 500, contact FGT directly"),
    condition: z.enum(Object.keys(CONDITIONS) as [keyof typeof CONDITIONS]),
    chargers: z.enum(Object.keys(CHARGERS) as [keyof typeof CHARGERS]),
    handover: z.enum(["dropoff", "pickup"]),
    slot: z.string().optional(),
    address: z.string().trim().max(200).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.handover === "dropoff" && !v.slot) ctx.addIssue({ code: "custom", path: ["slot"], message: "Pick a drop-off time" });
    if (v.handover === "pickup") {
      if (v.quantity < 10) ctx.addIssue({ code: "custom", path: ["handover"], message: "Pickups are for 10 or more laptops" });
      if (!v.address || v.address.length < 5) ctx.addIssue({ code: "custom", path: ["address"], message: "Enter the pickup address" });
    }
  });

export type PledgeState = { errors?: Record<string, string>; values?: Record<string, string> };

export async function submitPledge(_prev: PledgeState, form: FormData): Promise<PledgeState> {
  const values = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { errors, values };
  }
  const v = parsed.data;

  let handover: Handover;
  if (v.handover === "dropoff") {
    const slot = upcomingSlots(await takenSlots()).find((s) => s.id === v.slot);
    if (!slot || slot.full) return { errors: { slot: "That time just filled up. Please pick another." }, values };
    handover = { type: "dropoff", slot: slot.id };
  } else {
    handover = { type: "pickup", preferredWeek: "next available", address: v.address! };
  }

  const batch = { brand: v.brand, model: v.model, year: v.year, quantity: v.quantity, condition: v.condition, chargers: v.chargers };
  const now = new Date().toISOString();
  const id = newId();
  await createPledge({
    id,
    createdAt: now,
    company: v.company,
    contactName: v.contactName,
    email: v.email.toLowerCase(),
    postalCode: v.postalCode.toUpperCase().replace(/[ -]?(\d[A-Z]\d)$/, " $1"),
    batch,
    fit: assessBatch(batch),
    handover,
    status: "pledged",
    history: [{ status: "pledged", at: now }],
    serials: [],
  });
  redirect(`/pledge/${id}`);
}
