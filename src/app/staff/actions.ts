"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff, signIn, signOut } from "@/lib/auth";
import { getPledge, updatePledge } from "@/lib/store";
import { STATUSES, WIPE_METHODS, type Status, type WipeMethod } from "@/lib/types";

export async function login(_prev: { error?: string }, form: FormData): Promise<{ error?: string }> {
  const result = await signIn(String(form.get("password") ?? ""));
  if (result === "locked") return { error: "Too many wrong attempts. Try again in 15 minutes." };
  if (result === "wrong") return { error: "That password isn't right." };
  redirect("/staff");
}

export async function logout() {
  await signOut();
  redirect("/staff/login");
}

const intake = z.object({
  id: z.string(),
  serials: z.string(),
  wipeMethod: z.enum(Object.keys(WIPE_METHODS) as [WipeMethod]).or(z.literal("")),
  wipedBy: z.string().trim().max(60),
});

export type IntakeState = { error?: string; saved?: boolean };

export async function saveIntake(_prev: IntakeState, form: FormData): Promise<IntakeState> {
  await requireStaff();
  const v = intake.parse(Object.fromEntries(form));
  const serials = [...new Set(v.serials.split(/[\s,;]+/).map((s) => s.trim().toUpperCase()).filter(Boolean))];
  if (serials.some((s) => !/^[A-Z0-9-]{4,30}$/.test(s))) return { error: "Serial numbers can only use letters, digits and dashes (4–30 characters)." };
  await updatePledge(v.id, { serials, wipeMethod: v.wipeMethod || undefined, wipedBy: v.wipedBy });
  revalidatePath(`/staff/${v.id}`);
  return { saved: true };
}

// Moves a batch one stop along the route. A batch can only be marked "wiped" once FGT has recorded
// every serial number, the method and who did it, because the certificate is built from those.
export async function advance(id: string): Promise<{ error?: string }> {
  await requireStaff();
  const p = await getPledge(id);
  if (!p) return { error: "Batch not found" };
  const next = STATUSES[STATUSES.indexOf(p.status) + 1] as Status | undefined;
  if (!next) return { error: "This batch has finished its route" };
  if (next === "wiped") {
    if (p.serials.length === 0) return { error: "Record the serial numbers first" };
    if (!p.wipeMethod || !p.wipedBy) return { error: "Record the wipe method and who did it first" };
  }
  try {
    await updatePledge(id, { status: next });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/staff");
  revalidatePath(`/staff/${id}`);
  revalidatePath(`/pledge/${id}`);
  return {};
}
