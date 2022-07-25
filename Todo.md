# 機能実装案　
- Twitterへの共有機能
<details><summary>必要なこと</summary>
Oauth認証<br>
楽曲情報(アートワーク等)
</details>
<details><summary>モジュール案</summary>

[twitter-api-v2](https://www.npmjs.com/package/twitter-api-v2)<br>
[oauth-electron-twitter](https://www.npmjs.com/package/oauth-electron-twitter)
</details>
<br>

***

- 検索機能

❗ファイル名で検索するか、曲のタグを全検索するかで負荷が変わります。<br>
事前検証が必要です。(単体チェック、組み込みチェック)
***

- テーマ変更機能
<details><summary>カラー</summary>

- ブラック<br>
- ホワイト<br>
- グレー
</details>

***

- 設定保存
<details><summary>保存内容</summary>

- テーマ<br>
- ウィンドウサイズ<br>
- 再生中の楽曲
</details>

プレイリスト編集
キュー更新(削除、追加)