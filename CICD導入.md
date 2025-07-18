# CI/CD構成手順

## 最終ゴール

🎯 最終目的まとめ

| 項目                     | 内容                             |
| ---------------------- | ------------------------------ |
| デプロイのトリガー              | Git タグ（例: `v1.0.0`）を push したとき |
| デプロイ先                  | AWS EC2                        |
| develop ブランチの制約        | ビルドが成功すること                     |
| main ブランチの制約           | テストがすべて成功すること                  |
| main / develop 直接 push | ❌ 禁止（PR経由のみ許可）                 |


## ブランチ保護

✅ 1. ブランチ保護ルール（GitHub 側設定）
GitHub のブランチ保護機能を使って以下を設定：

develop ブランチ
✅ プルリクエストのみマージ可

✅ ビルド（lint / 型チェック）に成功していること

❌ テスト結果は検証しなくてよい

main ブランチ
✅ プルリクエストのみマージ可

✅ ビルド + テストに成功していること

👉 設定場所: GitHub リポジトリの Settings > Branches > Branch protection rules

## GitHub Actions ワークフロー構成

✅ 2. GitHub Actions ワークフロー構成

```bash
.github/workflows/
├── validate-develop.yml   # develop 向けのビルド検証
├── validate-main.yml      # main 向けのテスト検証
└── deploy-tag.yml         # Git タグ作成時に EC2 へデプロイ
```

✅ 3. GitHub Secrets に登録する

| キー名        | 内容                                                  |
| ---------- | --------------------------------------------------- |
| `EC2_KEY`  | `.pem` の中身（改行込み）                                    |
| `EC2_HOST` | EC2 のパブリックIP またはホスト名（例: `xx.compute.amazonaws.com`） |


✅ 4. 秘密鍵を GitHub Secrets に登録する


* .pem ファイルの中身を Base64 では エンコードせずそのままコピー
* GitHub のリポジトリ → Settings → Secrets and variables → Actions → New repository secret
* Name: EC2_KEY, Value: -----BEGIN RSA PRIVATE KEY----- 〜 として保存

