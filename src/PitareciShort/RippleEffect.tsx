import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface RippleEffectProps {
  x: number;
  y: number;
  triggerFrame: number;
  color?: string;
  maxRadius?: number;
  duration?: number;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({
  x,
  y,
  triggerFrame,
  color = "#A8D5A2",
  maxRadius = 80,
  duration = 25,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - triggerFrame;

  if (relativeFrame < 0 || relativeFrame > duration) {
    return null;
  }

  const progress = relativeFrame / duration;

  // Multiple ripple rings for elegant effect
  const rings = [0, 0.15, 0.3];

  return (
    <>
      {rings.map((delay, index) => {
        const ringProgress = Math.max(0, progress - delay);
        if (ringProgress <= 0) return null;

        const normalizedProgress = Math.min(ringProgress / (1 - delay), 1);

        const radius = interpolate(
          normalizedProgress,
          [0, 1],
          [0, maxRadius],
          { easing: Easing.out(Easing.cubic) }
        );

        const opacity = interpolate(
          normalizedProgress,
          [0, 0.3, 1],
          [0.6, 0.4, 0],
          { easing: Easing.out(Easing.quad) }
        );

        const strokeWidth = interpolate(
          normalizedProgress,
          [0, 1],
          [3, 1],
          { easing: Easing.out(Easing.quad) }
        );

        return (
          <svg
            key={index}
            style={{
              position: "absolute",
              left: x - maxRadius,
              top: y - maxRadius,
              width: maxRadius * 2,
              height: maxRadius * 2,
              pointerEvents: "none",
            }}
          >
            <circle
              cx={maxRadius}
              cy={maxRadius}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          </svg>
        );
      })}
      {/* Center dot */}
      {progress < 0.5 && (
        <div
          style={{
            position: "absolute",
            left: x - 6,
            top: y - 6,
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: color,
            opacity: interpolate(progress, [0, 0.5], [0.8, 0]),
          }}
        />
      )}
    </>
  );
};

// Container for multiple ripple effects
interface RippleContainerProps {
  ripples: Array<{ frame: number; x: number; y: number }>;
  color?: string;
}

export const RippleContainer: React.FC<RippleContainerProps> = ({
  ripples,
  color = "#A8D5A2",
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {ripples.map((ripple, index) => (
        <RippleEffect
          key={index}
          x={ripple.x}
          y={ripple.y}
          triggerFrame={ripple.frame}
          color={color}
        />
      ))}
    </div>
  );
};
