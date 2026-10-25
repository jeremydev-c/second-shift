import { ImageResponse } from "next/og";
import { condensed } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Second Shift: give your old work laptops a second shift with Free Geek Toronto";

// The preview card for links to the site itself (Devpost, LinkedIn, chats).
export default async function Image() {
  const font = await condensed();
  const stops = ["Pledge", "Drop off", "Wiped", "Second shift"];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#eef1f4", fontFamily: font ? "Barlow Condensed" : "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#123a63", color: "#fff", padding: "28px 56px" }}>
          <div style={{ display: "flex", width: 64, height: 64, borderRadius: 32, background: "#e8682a", alignItems: "center", justifyContent: "center", fontSize: 40 }}>2</div>
          <div style={{ fontSize: 44, letterSpacing: -1 }}>SECOND SHIFT</div>
        </div>
        <div style={{ height: 12, background: "#e8682a" }} />
        <div style={{ display: "flex", flexDirection: "column", padding: "44px 56px", flex: 1 }}>
          <div style={{ fontSize: 24, letterSpacing: 4, color: "#5a6778" }}>FREE GEEK TORONTO · BUSINESS PARTNER PROGRAMME</div>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 84, color: "#0f1d2e", lineHeight: 0.95, marginTop: 18, textTransform: "uppercase" }}>
            <span>Your old work laptops have&nbsp;</span>
            <span style={{ color: "#e8682a" }}>one more shift</span>
            <span>&nbsp;in them.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: "auto", position: "relative" }}>
            <div style={{ position: "absolute", left: 16, right: 16, top: 15, height: 6, background: "#e8682a" }} />
            {stops.map((s, i) => (
              <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1 }}>
                <div style={{ display: "flex", width: 36, height: 36, borderRadius: 18, border: "6px solid #e8682a", background: "#fff", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#123a63" }}>{i + 1}</div>
                <div style={{ fontSize: 30, color: "#0f1d2e", marginTop: 8, textTransform: "uppercase" }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Barlow Condensed", data: font, weight: 700, style: "normal" }] : undefined },
  );
}
