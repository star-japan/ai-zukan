# 読者向け注記の整理：2026年11月6日

更新：2026-11-06 20:44 JST

文学112作品の本文データと表示処理を調査し、50作品の制作注記・画像注記・挿絵番号を削除または簡略化。『侏儒の言葉』は先行コミット1b0866fef57d08f0cd5ebc9999f3a4444efcf087で修正済み。

## 方針

- 作者肖像・実景の再現性、図の制作方法、内部検証状況の長い注記を整理。
- 文学記事の「公開画面の表示は確認中です」「表示確認中」を非表示化。検証済みという表示には変更しない。
- 出典リンク、版情報、人物の区別、物語の解釈に必要な説明を保持。
- 画像参照、あらすじ・要約データ、公開・非公開状態を保持。
- 確認範囲は本文データ・表示処理。全112作品のブラウザー操作確認ではない。

## 修正作品

|作品|変更フィールド|
|---|---|
|よだかの星|characterGalleryNote|
|檸檬|characterGalleryNote|
|夢十夜|characterGalleryNote|
|舞姫|characterGalleryNote|
|人間失格|characterGalleryNote|
|やまなし|characterGalleryNote|
|一房の葡萄|characterGalleryNote|
|フランケンシュタイン|characterGalleryNote|
|枕草子|characterGalleryNote|
|赤毛のアン|characterGalleryNote|
|学問のすゝめ|characterGalleryNote|
|歌よみに与ふる書|characterGalleryNote|
|おくのほそ道|characterGalleryNote|
|武士道|characterGalleryNote|
|一握の砂|characterGalleryNote|
|悲しき玩具|characterGalleryNote|
|雨ニモマケズ|characterGalleryNote|
|蜜柑|sourceNote、characterGalleryNote|
|富嶽百景|sourceNote、characterGalleryNote|
|芋粥|characterGalleryNote|
|女生徒|characterGalleryNote|
|桜の樹の下には|characterGalleryNote|
|風立ちぬ|characterGalleryNote|
|二銭銅貨|characterGalleryNote|
|山羊の歌|characterGalleryNote|
|魔術|characterGalleryNote|
|「女らしさ」とは何か|inlineIllustrations|
|犬と笛|characterGalleryNote、inlineIllustrations|
|大つごもり|characterGalleryNote、inlineIllustrations|
|去年の木|characterGalleryNote|
|斜陽|characterGalleryNote|
|風の又三郎|characterGalleryNote、inlineIllustrations|
|蟹工船|characterGalleryNote|
|人間椅子|characterGalleryNote、inlineIllustrations|
|地獄変|characterGalleryNote|
|草枕|characterGalleryNote、inlineIllustrations|
|藪の中|characterGalleryNote|
|三四郎|characterGalleryNote|
|黒猫|inlineIllustrations|
|黄金虫|sub、headerCaption|
|怪人二十面相|headerCaption、portraitNote、sourceNote|
|少年探偵団|headerCaption、portraitNote、sourceNote|
|駈込み訴え|inlineIllustrations|
|セメント樽の中の手紙|savedPreviewSections、inlineIllustrations|
|三銃士|checkedDate、sourceNote|
|オツベルと象|savedPreviewSections|
|『今昔物語集』羅城門の上で出会った盗人と老婆|savedPreviewSections、reviewNotice|
|舌切りすずめ|characterGalleryNote|
|春と修羅|characterGallery、characterGalleryNote、sourceNote、inlineIllustrations|
|黒死館殺人事件|inlineIllustrations|

## 検証

- 174件の項目データ（文学112作品）を解析。
- 変更対象の画像参照・要約データを変更前と比較。
- 日付表示関数のJavaScript構文チェック。
- 公開反映はGitHub Pagesのワークフローで確認。
