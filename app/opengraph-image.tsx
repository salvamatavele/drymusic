import { ImageResponse } from "next/og";

export const alt = "DryMusic — Música e vídeos em streaming";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #121212 0%, #1a1a1a 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 160,
            height: 160,
            borderRadius: "9999px",
            background: "#1db954",
            color: "#000000",
            fontSize: 90,
            marginBottom: 40,
          }}
        >
          ♪
        </div>
        <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>
          DryMusic
        </div>
        <div style={{ fontSize: 36, color: "#b3b3b3", marginTop: 12 }}>
          Música e vídeos em streaming
        </div>
      </div>
    ),
    { ...size },
  );
}
