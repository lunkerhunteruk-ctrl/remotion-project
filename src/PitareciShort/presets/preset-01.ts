// Preset 01: ピタレシ ショート動画 - 冷蔵庫の余り物篇
// 作成日: 2024

import { SceneConfig } from "../types";

export const PRESET_NAME = "冷蔵庫の余り物篇";
export const PRESET_DESCRIPTION = "余り物が極上の主役に変わるストーリー";

export const scenes: SceneConfig[] = [
  {
    id: "scene_01",
    video: "/videos/01/01.mp4", // フック
    durationFrames: 90, // 3秒（開始に余白追加）
    captionDelay: 15, // テロップ開始を遅らせる
    narrationDelay: 15, // ナレーション開始を遅らせる
    caption: "冷蔵庫の余り物が、極上の主役に。",
    narrationFile: "/audio/short/narration_01.mp3",
    isHook: true,
  },
  {
    id: "scene_02",
    video: "/videos/01/02.mp4",
    durationFrames: 100, // 3.3秒（余白追加）
    narrationDelay: 18, // 0.6秒の間
    caption: "今日の献立、どうしよう。",
    narrationFile: "/audio/short/narration_02.mp3",
  },
  {
    id: "scene_03",
    video: "/videos/01/ss01.mov",
    durationFrames: 150, // 5秒（ナレーション最後まで入るように）
    narrationDelay: 9, // 0.3秒の間
    playbackRate: 3.0, // 少しゆっくり
    caption: "今の気分と、手持ちの具材を選ぶだけ。",
    narrationFile: "/audio/short/narration_03.mp3",
    captionPosition: "top", // 上部に配置
    ripples: [
      { frame: 15, x: 540, y: 800 },
      { frame: 30, x: 540, y: 1000 },
      { frame: 45, x: 540, y: 1200 },
      { frame: 60, x: 540, y: 900 },
      { frame: 75, x: 540, y: 1100 },
      { frame: 90, x: 540, y: 850 },
      { frame: 105, x: 540, y: 950 },
    ],
  },
  {
    id: "scene_04",
    video: "/videos/01/03.mp4", // 調理シーン
    durationFrames: 100, // 3.3秒（余白追加）
    narrationDelay: 9, // 0.3秒の間
    caption: "いつもの食材と、丁寧に向き合う時間。",
    narrationFile: "/audio/short/narration_04.mp3",
  },
  {
    id: "scene_05",
    video: "/videos/01/01.mp4", // 完成シーン
    durationFrames: 100, // 3.3秒（余白追加）
    narrationDelay: 9, // 0.3秒の間
    caption: "プロのひと手間で、心満たされる一品に。",
    narrationFile: "/audio/short/narration_05.mp3",
  },
  {
    id: "scene_06",
    video: "/videos/01/04.mp4",
    durationFrames: 200, // 6.7秒（最後に余白追加）
    narrationDelay: 9, // 0.3秒の間
    caption: "何気ない食卓も、物語になる。\nおいしいを記録する ピタレシ",
    narrationFile: "/audio/short/narration_06.mp3",
    isEndCard: true,
    clickFrame: 120, // 検索クリックのタイミング（22秒）
  },
];

// プリセットの合計フレーム数
export const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationFrames, 0);
