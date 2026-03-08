/**
 * Font loading and mapping for VualDynamic compositions.
 * Uses @remotion/google-fonts to load fonts at render time.
 */

import { loadFont as loadPlayfairDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadCormorantGaramond } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadDMSerifDisplay } from "@remotion/google-fonts/DMSerifDisplay";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadNotoSansJP } from "@remotion/google-fonts/NotoSansJP";

// Load all fonts
const { fontFamily: playfairFamily } = loadPlayfairDisplay();
const { fontFamily: cormorantFamily } = loadCormorantGaramond();
const { fontFamily: dmSerifFamily } = loadDMSerifDisplay();
const { fontFamily: montserratFamily } = loadMontserrat();
const { fontFamily: notoSansFamily } = loadNotoSansJP();

/**
 * Font family map keyed by textFont prop value.
 */
export const FONT_MAP: Record<string, string> = {
  impact: "'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif",
  "noto-sans": notoSansFamily,
  montserrat: montserratFamily,
  "playfair-display": playfairFamily,
  "cormorant-garamond": cormorantFamily,
  "dm-serif-display": dmSerifFamily,
};

/**
 * Get font family string for a given textFont key.
 */
export function getFontFamily(textFont: string): string {
  return FONT_MAP[textFont] || FONT_MAP.impact;
}
