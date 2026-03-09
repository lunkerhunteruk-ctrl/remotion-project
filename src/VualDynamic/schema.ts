import { z } from "zod";

export const shotSchema = z.object({
  clipUrl: z.string(),
  durationSec: z.number(),
  telopText: z.string().optional(),
  telopPosition: z.enum(["top-left", "top-right", "bottom-left", "bottom-right", "center"]).optional(),
});

export const effectLevelSchema = z.enum(["off", "weak", "medium", "strong"]).default("off");

export const filmEffectsSchema = z.object({
  vignette: effectLevelSchema,
  colorChrome: effectLevelSchema,
  colorChromeBlue: effectLevelSchema,
  grain: effectLevelSchema,
  colorShift: effectLevelSchema,
}).default({
  vignette: "off",
  colorChrome: "off",
  colorChromeBlue: "off",
  grain: "off",
  colorShift: "off",
});

export const vualDynamicSchema = z.object({
  shots: z.array(shotSchema),
  textStyle: z.enum(["slide", "shuffle", "minimal"]).default("slide"),
  textFont: z.enum(["impact", "noto-sans", "montserrat", "playfair-display", "cormorant-garamond", "dm-serif-display"]).default("impact"),
  bgmUrl: z.string().optional(),
  showIntro: z.boolean().default(false),
  introStyle: z.enum(["flatlay", "text-only"]).default("flatlay"),
  introText: z.string().optional(),
  flatLayImageUrls: z.array(z.string()).optional(),
  locationText: z.string().optional(),
  dateText: z.string().optional(),
  showEnding: z.boolean().default(false),
  whiteFlash: z.boolean().default(true),
  brandName: z.string().optional(),
  tagline: z.string().optional(),
  credits: z.array(z.object({
    category: z.string(),
    name: z.string(),
    brand: z.string(),
    price: z.string(),
  })).optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:3", "3:4", "4:5"]).default("16:9"),
  filmFrame: z.boolean().default(false),
  filmEffects: filmEffectsSchema,
});

export type EffectLevel = z.infer<typeof effectLevelSchema>;
export type FilmEffects = z.infer<typeof filmEffectsSchema>;
export type VualDynamicProps = z.infer<typeof vualDynamicSchema>;
export type ShotConfig = z.infer<typeof shotSchema>;
