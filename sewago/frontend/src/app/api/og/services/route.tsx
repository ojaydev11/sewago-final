import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  const size = { width: 1200, height: 630 } as const;
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ef4444",
          color: "white",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 800, fontFamily: "Inter, system-ui, Arial" }}>
          SewaGo Services
        </div>
      </div>
    ),
    { ...size }
  );
}


