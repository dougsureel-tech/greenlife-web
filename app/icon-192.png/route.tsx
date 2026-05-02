import { ImageResponse } from "next/og";

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
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 88,
          fontWeight: 900,
          lineHeight: 1,
          color: "#86efac",
          textShadow: "0 2px 12px rgba(0,0,0,0.4)",
        }}
      >
        GL
      </div>
    </div>,
    { width: 192, height: 192 },
  );
}
