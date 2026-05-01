import { ImageResponse } from "next/og";

// Maskable icons must keep the logo within the inner 80% safe-zone — Android
// home screens crop edges depending on launcher style. Solid-color background
// with the logo centered + sized down satisfies the spec.
export const runtime = "nodejs";
export const dynamic = "force-static";
export const contentType = "image/png";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#022c22",
          color: "#86efac",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 180,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          GL
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
