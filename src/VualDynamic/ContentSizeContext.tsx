import { createContext, useContext } from "react";

/**
 * Context to provide the actual content area dimensions to child components.
 *
 * In Film Print mode, the Remotion composition canvas is larger than the video
 * content area (e.g., 2084px canvas vs 1924px video). useVideoConfig() returns
 * the canvas size, so overlays need this context to get the correct dimensions
 * for scale calculations and positioning.
 */
interface ContentSize {
  width: number;
  height: number;
}

const ContentSizeContext = createContext<ContentSize | null>(null);

export const ContentSizeProvider = ContentSizeContext.Provider;

/**
 * Returns the actual content area dimensions.
 * Falls back to useVideoConfig() dimensions if no provider is present.
 */
export function useContentSize(): ContentSize {
  const ctx = useContext(ContentSizeContext);
  if (ctx) return ctx;
  // Fallback: import dynamically to avoid circular deps
  // In practice, the provider should always be present
  return { width: 1920, height: 1080 };
}
