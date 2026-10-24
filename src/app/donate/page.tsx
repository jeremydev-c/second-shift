import type { Metadata } from "next";
import { upcomingSlots } from "@/lib/slots";
import { takenSlots } from "@/lib/store";
import PledgeForm from "./PledgeForm";

export const metadata: Metadata = { title: "Pledge your laptops" };
export const dynamic = "force-dynamic";

export default async function DonatePage() {
  const slots = upcomingSlots(await takenSlots());
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="eyebrow">Business partners · Toronto</p>
      <h1 className="display mt-1 text-5xl">Pledge your company&apos;s laptops</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Tell us what you&apos;re retiring. You&apos;ll see straight away whether Free Geek Toronto can refurbish it, then
        book a drop-off or a pickup. Every device is securely wiped, and you get a certificate.
      </p>
      <PledgeForm slots={slots} />
    </main>
  );
}
