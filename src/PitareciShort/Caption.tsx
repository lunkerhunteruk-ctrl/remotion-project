import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface CaptionProps {
  text: string;
  textColor?: string;
  backgroundColor?: string;
  position?: "bottom" | "center" | "top";
  fadeInDuration?: number;
  style?: "elegant" | "simple" | "endcard";
}

export const Caption: React.FC<CaptionProps> = ({
  text,
  textColor = "#333333",
  backgroundColor = "rgba(248, 246, 242, 0.85)",
  position = "bottom",
  fadeInDuration = 20,
  style = "elegant",
}) => {
  const frame = useCurrentFrame();

  // Gentle fade in and slight slide up
  const opacity = interpolate(frame, [0, fadeInDuration], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const translateY = interpolate(frame, [0, fadeInDuration], [15, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const positionStyles: Record<string, React.CSSProperties> = {
    bottom: { bottom: 180, left: 0, right: 0 },
    center: { top: "50%", left: 0, right: 0, transform: `translateY(-50%) translateY(${translateY}px)` },
    top: { top: 120, left: 0, right: 0 },
  };

  // Split text by newlines for multi-line support
  const lines = text.split("\n");

  if (style === "simple") {
    return (
      <div
        style={{
          position: "absolute",
          ...positionStyles[position],
          display: "flex",
          justifyContent: "center",
          padding: "0 60px",
          opacity,
          transform: position !== "center" ? `translateY(${translateY}px)` : undefined,
        }}
      >
        <p
          style={{
            color: textColor,
            fontSize: 42,
            fontFamily: "'Noto Serif JP', 'Yu Mincho', 'Hiragino Mincho ProN', serif",
            fontWeight: 400,
            margin: 0,
            textAlign: "center",
            lineHeight: 1.6,
            letterSpacing: 2,
            textShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {lines.map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyles[position],
        display: "flex",
        justifyContent: "center",
        padding: "0 40px",
        opacity,
        transform: position !== "center" ? `translateY(${translateY}px)` : undefined,
      }}
    >
      <div
        style={{
          backgroundColor,
          padding: "24px 48px",
          borderRadius: 4,
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <p
          style={{
            color: textColor,
            fontSize: 40,
            fontFamily: "'Noto Serif JP', 'Yu Mincho', 'Hiragino Mincho ProN', serif",
            fontWeight: 500,
            margin: 0,
            textAlign: "center",
            lineHeight: 1.7,
            letterSpacing: 3,
          }}
        >
          {lines.map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
};

// End card component with CTA
interface EndCardProps {
  tagline: string;
  appName: string;
  cta: string;
  primaryColor?: string;
  accentColor?: string;
}

export const EndCard: React.FC<EndCardProps> = ({
  tagline,
  appName,
  cta,
  primaryColor = "#5B8C5A",
  accentColor = "#A8D5A2",
}) => {
  const frame = useCurrentFrame();

  const taglineOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const appNameOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const appNameScale = interpolate(frame, [15, 35], [0.9, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  const ctaOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const ctaTranslateY = interpolate(frame, [40, 60], [10, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 200,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      {/* Tagline */}
      <p
        style={{
          color: "#666666",
          fontSize: 28,
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 300,
          margin: 0,
          letterSpacing: 4,
          opacity: taglineOpacity,
        }}
      >
        {tagline}
      </p>

      {/* App Name */}
      <h2
        style={{
          color: primaryColor,
          fontSize: 64,
          fontFamily: "'Noto Serif JP', serif",
          fontWeight: 700,
          margin: 0,
          letterSpacing: 8,
          opacity: appNameOpacity,
          transform: `scale(${appNameScale})`,
        }}
      >
        {appName}
      </h2>

      {/* CTA Button */}
      <div
        style={{
          marginTop: 20,
          opacity: ctaOpacity,
          transform: `translateY(${ctaTranslateY}px)`,
        }}
      >
        <div
          style={{
            backgroundColor: primaryColor,
            padding: "16px 48px",
            borderRadius: 30,
            boxShadow: "0 4px 16px rgba(91, 140, 90, 0.3)",
          }}
        >
          <span
            style={{
              color: "#FFFFFF",
              fontSize: 24,
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            {cta}
          </span>
        </div>
      </div>
    </div>
  );
};
