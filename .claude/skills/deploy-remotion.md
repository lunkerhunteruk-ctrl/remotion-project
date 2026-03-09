---
name: deploy-remotion
description: Remotion LambdaへVualDynamicコンポジションをデプロイする
user_invocable: true
---

# Deploy Remotion to Lambda

VualDynamicコンポジションをAWS Lambda用のRemotionサイトにデプロイする。

## 手順

1. remotion-projectディレクトリに移動
2. TypeScriptビルドチェック（`npx tsc --noEmit`）
3. Lambda サイトを作成・更新

```bash
cd /Users/mari/Desktop/remotion-project
npx tsc --noEmit
npx remotion lambda sites create src/index.ts --site-name=vual-dynamic
```

## 重要な注意事項

- **サイト名は必ず `vual-dynamic`** を使うこと。VUAL側の環境変数 `REMOTION_SERVE_URL` がこのサイト名を参照している
- `vual-editorial` や他の名前でデプロイすると、VUAL側のレンダリングに反映されない
- デプロイ後、出力されるServe URLが `sites/vual-dynamic/` を含んでいることを確認する
- ビルドエラーがある場合はデプロイせず、エラーを修正してから再実行する
