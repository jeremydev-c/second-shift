import type { Metadata } from "next";
import Checker from "./Checker";

export const metadata: Metadata = {
  title: "Can I donate this?",
  description: "Check what Free Geek Toronto can use before you bring it in.",
};

export default function CheckPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <p className="eyebrow">Households · Before you drop off</p>
      <h1 className="display mt-2 text-5xl sm:text-6xl">Can I donate this?</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Free Geek Toronto refurbishes computers and computer accessories. Pick your item to see whether to bring it in, or
        where it should go instead.
      </p>
      <Checker />
    </main>
  );
}
