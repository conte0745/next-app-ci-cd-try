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

### develop ブランチ
✅ プルリクエストのみマージ可

✅ ビルド（lint / 型チェック）に成功していること

❌ テスト結果は検証しなくてよい

### main ブランチ
✅ プルリクエストのみマージ可

✅ ビルド + テストに成功していること

✅ タグの作成は main ブランチのみ許可(今後はreleaseブランチのみ許可になるかも)

👉 設定場所: GitHub リポジトリの Settings > Branches > Branch protection rules

## GitHub Actions ワークフロー構成

✅ 2. GitHub Actions ワークフロー構成

```bash
.github/workflows/
├── validate-develop.yml   # develop 向けのビルド検証
├── validate-main.yml      # main 向けのテスト検証
└── release.yml           # Git タグ作成時に EC2 へ SSM 経由デプロイ
```

### 2-1. develop ブランチ検証ワークフロー

ファイル: `.github/workflows/validate-develop.yml`


### 2-2. main ブランチ検証ワークフロー

ファイル: `.github/workflows/validate-main.yml`


### 2-3. デプロイワークフロー（SSM 経由）

ファイル: `.github/workflows/release.yml`

## AWS SSM 経由デプロイ設定

### 必要な AWS 設定

#### 1. EC2 インスタンス設定

- SSM Agent: EC2 インスタンスに SSM Agent がインストール済みであること
- IAM Role: EC2 インスタンスに SSM 用の IAM ロールをアタッチ
  - `AmazonSSMManagedInstanceCore` ポリシーを含む

#### 2. GitHub Secrets 設定

| キー名                      | 内容                           |
| ------------------------ | ---------------------------- |
| `AWS_ACCESS_KEY_ID`      | AWS アクセスキー ID                |
| `AWS_SECRET_ACCESS_KEY`  | AWS シークレットアクセスキー             |
| `AWS_REGION`             | AWS リージョン（例: ap-northeast-1） |
| `INSTANCE_ID`            | デプロイ先 EC2 インスタンス ID（例: i-xxx） |

### デプロイスクリプト詳細

ファイル: `deploy/deploy.sh`

### デプロイフロー

1. 開発者がタグを作成
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

2. GitHub Actions が自動実行
   - タグプッシュを検知
   - AWS 認証情報を設定
   - SSM 経由で EC2 にコマンド送信
   - デプロイ結果をコミットにコメント

3. EC2 でデプロイスクリプト実行
   - 最新コードを取得
   - 依存関係をインストール
   - DB マイグレーション実行
   - アプリケーションビルド
   - PM2 でサービス再起動

### セキュリティ考慮事項

- SSM 使用: SSH キーの管理が不要
- IAM ロール: 最小権限の原則に従った権限設定
- Secrets 管理: GitHub Secrets で機密情報を安全に管理
- 実行ユーザー: `ssm-user` ユーザでスクリプト実行

## GitHub Secrets 設定手順

### AWS 認証情報の設定

1. GitHub リポジトリ → Settings → Secrets and variables → Actions
2. New repository secret をクリック
3. 以下の Secrets を追加:

```
AWS_ACCESS_KEY_ID: AKIA...
AWS_SECRET_ACCESS_KEY: xxx...
AWS_REGION: ap-northeast-1
INSTANCE_ID: i-0123456789abcdef0
```

