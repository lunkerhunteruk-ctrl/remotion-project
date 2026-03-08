import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

export const Thumbnail: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Background image */}
      <Img
        src={staticFile("/images/thumbnail-bg.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Caption */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(45, 45, 45, 0.92)",
            padding: "20px 40px",
            borderRadius: 20,
            border: "4px solid #5A8F7B",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <p
            style={{
              color: "#FFFFFF",
              fontSize: 54,
              fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
              fontWeight: 900,
              margin: 0,
              textAlign: "center",
              letterSpacing: 2,
              whiteSpace: "nowrap",
              textShadow: `
                4px 4px 0 #5A8F7B,
                -2px -2px 0 #2d2d2d,
                2px -2px 0 #2d2d2d,
                -2px 2px 0 #2d2d2d,
                2px 2px 0 #2d2d2d,
                0 6px 12px rgba(0,0,0,0.4)
              `,
            }}
          >
            余り物が、神レシピに！？
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
