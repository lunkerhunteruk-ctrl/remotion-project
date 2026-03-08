// プリセット一覧
// 新しいプリセットを追加したらここにもエクスポートを追加

export * as preset01 from "./preset-01";

// 使い方:
// 1. 新しいプリセットファイルを作成 (例: preset-02.ts)
// 2. ここにエクスポートを追加: export * as preset02 from "./preset-02";
// 3. index.tsx のインポートを変更:
//    import { scenes, totalDuration } from "./presets/preset-02";
