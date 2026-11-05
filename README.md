# GIF Stamp Studio

GIFから動くLINEスタンプ用APNG（拡張子.png）を作成する叩き台です。画像は端末内で処理します。

## 起動
Node.js 22以降で `npm start` を実行し、http://127.0.0.1:4317 をChromeまたはEdgeで開きます。`npm test` でAPNG構造・CRC・画像の復元・再生時間を検証できます。

## 実装済み
GIF読み込みとドロップ（20MB・200フレーム・1600万画素まで）、元のフレーム時間に応じたサンプリング、5〜20フレーム、合計1〜4秒、1〜4ループ、大きさ調整、単色背景の透過、フレーム一覧、会話プレビュー、320×270のAPNG生成と容量チェック。

出力は指定した合計再生時間にリタイミングします。編集プレビューは確認用に繰り返します。背景の色除去は被写体の同色も消す単純な処理です。GIF展開に同梱のomggif（MIT）、圧縮にCompressionStreamを使用。iPhone/iPadはiOS/iPadOS 16.4以降のSafariが必要です。

## 次の開発候補
複数GIFとZIP出力、240×240メインAPNGと96×74タブ画像、トリミングと開始終了位置、文字入れ、容量の自動最適化、プロジェクト保存。現在はスタンプ画像1個ずつの書き出しです。

## 仕様参照
2026-11-05確認：https://creator.line.me/ja/guideline/animationsticker/
320×270以内、幅か高さ270以上、5〜20フレーム、1〜4ループ、合計4秒以内、各画像1MB以下。申請には8/16/24個のセットとメイン・タブ画像が必要です。技術的なチェックは審査通過を保証しません。

## インストールなしで開く
`GIF-Stamp-Studio.html` をダブルクリックし、ChromeまたはEdgeで開いてください。CSSとJavaScriptを内蔵しているため、サーバー起動や依存パッケージのインストールは不要です。分割ソースを修正した後は `node build-standalone.mjs` でHTML版を更新します。

## 検証状況
APNGの画像復元、CRC、フレーム構造、ループ時間、無動作・不正設定の検出について6件の自動テストが成功。ローカルHTTP応答200を確認。ブラウザー自動操作環境が応答せず、画面の目視および実GIFのブラウザー操作試験は未完了です。

## GitHub Pagesでスマホから開く
リポジトリの Settings → Pages で、Source を Deploy from a branch、Branch を main、フォルダーを / (root) に設定して Save を押します。公開処理完了後のURLは https://coronsky.github.io/gif-stamp-studio/ です。

公開用の `index.html` は単体HTMLと同じ内容です。編集後は `node build-standalone.mjs` を実行し、生成された両HTMLもコミットしてください。GitHub Pagesで提供される画面はインターネットに公開されます。読み込んだ画像は端末内で処理され、GitHubには送信されません。

iPhone/iPadを含むブラウザー共通のGIFデコーダーを同梱しています。GIFの透過・フレーム合成・disposal 2/3を処理します。実機での保存操作は未検証です。

## iPhone/iPad読み込み修正
ImageDecoderへの依存を取り除き、同梱のJavaScript GIFデコーダーに切り替えました。読み込み状態とエラーは素材欄にも表示します。透過、差分合成、disposal 2/3、ローカルパレット、入力制限を含む自動テスト12件が成功しています。iPhone/iPad実機の操作検証は未完了です。
