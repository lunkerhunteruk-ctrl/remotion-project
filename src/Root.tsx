import { Composition, staticFile } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { Pitareci, pitareciSchema } from "./Pitareci";
import { PitareciShort, pitareciShortSchema, PITARECI_SHORT_DURATION } from "./PitareciShort";
import { Thumbnail } from "./Thumbnail";
import { VualEditorial, VUAL_EDITORIAL_DURATION } from "./VualEditorial";
import { VualEditorial02, VUAL_EDITORIAL_02_DURATION } from "./VualEditorial02";
import { TextOverlay } from "./VualEditorial02/TextOverlay";
import { TextOverlayV2 } from "./VualEditorial02/TextOverlayV2";
import { TextOverlayV2Square } from "./VualEditorial02/TextOverlayV2Square";
import { TextOverlay03, VUAL_EDITORIAL_03_DURATION } from "./VualEditorial03";
import { FlatLayIntro, FLATLAY_INTRO_DURATION } from "./VualEditorial03";
import { VualDynamic, calculateDuration } from "./VualDynamic";
import { vualDynamicSchema } from "./VualDynamic/schema";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* VUAL Editorial 02 - Shibuya street editorial */}
      <Composition
        id="VualEditorial02"
        component={VualEditorial02}
        durationInFrames={VUAL_EDITORIAL_02_DURATION}
        fps={24}
        width={1920}
        height={1080}
      />

      {/* Text overlay only (for compositing with ffmpeg) */}
      <Composition
        id="VualEditorial02TextOverlay"
        component={TextOverlay}
        durationInFrames={VUAL_EDITORIAL_02_DURATION}
        fps={24}
        width={1920}
        height={1080}
      />

      {/* Text overlay V2 - cyberpunk style */}
      <Composition
        id="VualEditorial02TextOverlayV2"
        component={TextOverlayV2}
        durationInFrames={VUAL_EDITORIAL_02_DURATION}
        fps={24}
        width={1920}
        height={1080}
      />

      {/* Text overlay V2 - cyberpunk style (1:1 square for Instagram) */}
      <Composition
        id="VualEditorial02TextOverlayV2Square"
        component={TextOverlayV2Square}
        durationInFrames={VUAL_EDITORIAL_02_DURATION}
        fps={24}
        width={1080}
        height={1080}
      />

      {/* VUAL Editorial 03 - Flatlay Intro (items + white flash) */}
      <Composition
        id="VualEditorial03FlatLayIntro"
        component={FlatLayIntro}
        durationInFrames={FLATLAY_INTRO_DURATION}
        fps={24}
        width={1920}
        height={1080}
      />

      {/* VUAL Editorial 03 - Athens Acropolis text overlay */}
      <Composition
        id="VualEditorial03TextOverlay"
        component={TextOverlay03}
        durationInFrames={VUAL_EDITORIAL_03_DURATION}
        fps={24}
        width={1920}
        height={1080}
      />

      {/* VUAL Editorial - Fashion lookbook video */}
      <Composition
        id="VualEditorial"
        component={VualEditorial}
        durationInFrames={VUAL_EDITORIAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Thumbnail */}
      <Composition
        id="Thumbnail"
        component={Thumbnail}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* PitareciShort - YouTube Shorts video (30 seconds) */}
      <Composition
        id="PitareciShort"
        component={PitareciShort}
        durationInFrames={PITARECI_SHORT_DURATION}
        fps={30}
        width={1080}
        height={1920}
        schema={pitareciShortSchema}
        defaultProps={{
          primaryColor: "#5B8C5A",
          backgroundColor: "#F8F6F2",
          textColor: "#333333",
          accentColor: "#A8D5A2",
        }}
      />

      {/* PitareciShort - App Store Preview (886x1920) */}
      <Composition
        id="PitareciShortAppStore"
        component={PitareciShort}
        durationInFrames={PITARECI_SHORT_DURATION}
        fps={30}
        width={886}
        height={1920}
        schema={pitareciShortSchema}
        defaultProps={{
          primaryColor: "#5B8C5A",
          backgroundColor: "#F8F6F2",
          textColor: "#333333",
          accentColor: "#A8D5A2",
        }}
      />

      {/* Pitareci - Recipe video with ElevenLabs audio */}
      <Composition
        id="Pitareci"
        component={Pitareci}
        durationInFrames={360}
        fps={30}
        width={1080}
        height={1920}
        schema={pitareciSchema}
        defaultProps={{
          backgroundColor: "#1a1a2e",
          textColor: "#ffffff",
          accentColor: "#e94560",
        }}
      />

      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* VualDynamic - Data-driven editorial video (for Lambda rendering) */}
      <Composition
        id="VualDynamic"
        component={VualDynamic}
        durationInFrames={24 * 26}
        fps={24}
        width={1920}
        height={1080}
        schema={vualDynamicSchema}
        defaultProps={{
          shots: [],
          textStyle: "slide",
          textFont: "impact",
          whiteFlash: true,
          showIntro: true,
          introStyle: "flatlay",
          introText: "FROM FLATLAY TO RUNWAY",
          locationText: "ACROPOLIS ATHENS",
          dateText: "6TH MARCH 2026",
          showEnding: true,
          brandName: "VUAL",
          tagline: "AI Fashion Editorial",
        }}
        calculateMetadata={async ({ props }) => {
          const AR_MAP: Record<string, { width: number; height: number }> = {
            "16:9": { width: 1920, height: 1080 },
            "9:16": { width: 1080, height: 1920 },
            "1:1": { width: 1080, height: 1080 },
            "4:3": { width: 1440, height: 1080 },
            "3:4": { width: 1080, height: 1440 },
            "4:5": { width: 1080, height: 1350 },
          };
          const ar = props.aspectRatio || "16:9";
          const dimensions = AR_MAP[ar] || AR_MAP["16:9"];
          const durationInFrames = calculateDuration(props);

          // Film Print frame: expand canvas to include border (16:9 only)
          if (props.filmFrame && ar === "16:9") {
            return { durationInFrames, width: 2084, height: 1420 };
          }

          return { durationInFrames, width: dimensions.width, height: dimensions.height };
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
