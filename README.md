# Next.js TODOアプリ

このリポジトリは、Next.js + Chakra UI + Prisma + MySQL を用いたTODOアプリのサンプルです。

## 主な特徴
- Next.js 15 (App Router)
- Chakra UIによるモダンなUI
- react-hook-formによるフォームバリデーション
- Prisma ORM + MySQL
- APIルートによるCRUD実装
- テスト（Vitest + Testing Library）
- GitHub ActionsによるCI/CD
- AWS EC2 & pm2による本番運用想定
- react-hot-toastによる通知

---

## セットアップ

1. 依存パッケージのインストール

```bash
yarn install
```

2. 環境変数の設定

`.env.local` にDB接続情報などを記載

```
DATABASE_URL="mysql://user:password@host:3306/dbname"
```

3. DBマイグレーション

```bash
yarn prisma migrate deploy
# または
npx prisma migrate dev
```

4. 開発サーバー起動

```bash
yarn dev
```

---

## テスト

```bash
yarn run test
```

---

## CI/CD（GitHub Actions）

- developブランチ: ビルドのみ実行
- mainブランチ: ビルド＋テスト必須
- タグ（v*）push時: ビルド＋テスト後、AWS EC2へ自動デプロイ

CI/CDの設定は `.github/workflows/ci.yml` を参照

---

## デプロイ（AWS EC2 + pm2）

1. EC2にNode.js, yarn, pm2, git, MySQL等をインストール
2. GitHub SecretsにEC2の接続情報（`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`）を登録
3. `deploy/deploy.sh` に本番デプロイ処理を記述
4. タグ（例: `v1.0.0`）をpushすると自動でデプロイされます

### pm2とは？
Node.jsアプリを常駐・自動再起動・ログ管理できるプロセスマネージャです。

---

## 技術スタック
- Next.js
- Chakra UI
- React Hook Form
- Prisma ORM
- MySQL
- react-hot-toast
- Vitest / Testing Library
- GitHub Actions
- AWS EC2
- pm2

---

## 開発Tips
- 入力欄のref競合やAPIバリデーションはreact-hook-formで吸収
- 通知はreact-hot-toastで統一
- テストは`yarn run test`で全自動
- デプロイはタグ運用で安全に本番反映

---

## ライセンス
MIT
