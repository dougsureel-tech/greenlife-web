import { ImageResponse } from "next/og";

// iOS home-screen icons. Apple applies its own rounded-corner mask so the icon
// should fill the canvas to the edge with the logo centered.
export const runtime = "nodejs";
export const dynamic = "force-static";
export const contentType = "image/png";

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #022c22 0%, #047857 100%)",
        color: "#86efac",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ fontSize: 80, fontWeight: 900 }}>GL</div>
    </div>,
    { width: 180, height: 180 },
  );
}
