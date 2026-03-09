import React from "react";
import { Img, staticFile } from "remotion";

/**
 * FilmFrameOverlay: Renders an instant-film-style frame on top of the composition.
 * The frame image has a transparent center where the video content shows through.
 * Canvas: 2084x1420, video area: 1924x1086 at offset (78, 81).
 */
export const FilmFrameOverlay: React.FC = () => {
  return (
    <Img
      src={staticFile("film-frame.png")}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
};

/** Offset and size of the video area within the film frame canvas.
 *  The video div intentionally overlaps the semi-transparent frame edges
 *  by ~2 px on each side so no black background peeks through.
 */
export const FILM_FRAME = {
  canvasWidth: 2084,
  canvasHeight: 1420,
  videoLeft: 78,
  videoTop: 81,
  videoWidth: 1924,
  videoHeight: 1086,
} as const;
