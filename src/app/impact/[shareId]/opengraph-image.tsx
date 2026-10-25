import { ImageResponse } from "next/og";
import { impactOf, isShareable } from "@/lib/impact";
import { condensed } from "@/lib/og";
import { getPledgeByShareId } from "@/lib/store";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Second Shift impact card";

// The card LinkedIn shows when a partner shares their impact page.
export default async function Image({ params }: { params: Promise<{ shareId: string }> }) {
  const p = await getPledgeByShareId((await params).shareId);
  const ok = p && isShareable(p);
  const i = ok ? impactOf(p) : undefined;
  const font = await condensed();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#eef1f4", fontFamily: font ? "Barlow Condensed" : "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#123a63", color: "#fff", padding: "28px 56px" }}>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>SECOND SHIFT</div>
          <div style={{ display: "flex", width: 64, height: 64, borderRadius: 32, background: "#e8682a", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 800 }}>2</div>
        </div>
        <div style={{ height: 12, background: "#e8682a" }} />
        <div style={{ display: "flex", flexDirection: "column", padding: "44px 56px", flex: 1 }}>
          <div style={{ fontSize: 24, letterSpacing: 4, color: "#5a6778" }}>PARTNER OF FREE GEEK TORONTO</div>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 76, fontWeight: 700, color: "#0f1d2e", lineHeight: 1, marginTop: 16, textTransform: "uppercase" }}>
            {ok ? `${p.company} gave ${i!.laptops} laptops a second shift.` : "Give your old work laptops a second shift."}
          </div>
          {i && (
            <div style={{ display: "flex", gap: 64, marginTop: "auto" }}>
              {[
                [String(i.laptops), "laptops reused"],
                [String(i.people), "people connected (est.)"],
                [`${i.kg} kg`, "e-waste avoided"],
              ].map(([n, l]) => (
                <div key={l} style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 56, fontWeight: 800, color: "#123a63" }}>{n}</div>
                  <div style={{ fontSize: 22, color: "#5a6778" }}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Barlow Condensed", data: font, weight: 700, style: "normal" }] : undefined },
  );
}
