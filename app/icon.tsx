import { ImageResponse } from "next/og";

// Favicon-tier 32×32 icon — Next 16 file convention. Generates /icon and
// auto-emits `<link rel="icon" type="image/png" sizes="32x32">` site-wide.
// Pre-v15.X only public/favicon.ico existed → browsers without strong .ico
// support, RSS readers, and high-DPI tab strips fell back to a downscaled
// 256×256 .ico (decode quality varies). With this route, modern Chrome /
// Safari / Firefox prefer the crisp PNG.
//
// Cross-stack port of GW src/app/icon.tsx — sister scc app/icon.tsx same
// shape (different brand color). Caught 2026-05-10 by /loop tick 37
// favicon-completeness audit (cross-stack `<link rel="icon">` comparison —
// glw + scc were the lone outliers across the 6-site stack).

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#022c22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a3e635",
          fontSize: 22,
          fontFamily: "Georgia, serif",
          fontWeight: 700,
        }}
      >
        G
      </div>
    ),
    { ...size }
  );
}
