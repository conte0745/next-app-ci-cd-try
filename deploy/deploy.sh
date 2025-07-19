#!/bin/bash
set -euxo pipefail
exec >> /var/log/deploy.log 2>&1

echo "===== 🚀 デプロイ開始: $(date) ====="

# 環境変数（.env）読み込み（必要に応じて）
export NODE_ENV=production

# アプリのディレクトリへ移動
cd /home/ec2-user/myapp

# 最新のコードを取得（main ブランチ）
echo "📦 Git Pull"
git pull origin main

# パッケージインストール
echo "📦 yarn install"
yarn install --frozen-lockfile

# Prisma migration の実行
echo "🧩 Prisma Migration"
npx prisma generate
npx prisma migrate deploy

# ビルド
echo "🔨 Next.js Build"
yarn build

# pm2 でアプリを再起動 or 初回起動
echo "🟢 PM2 Restart"
pm2 describe myapp > /dev/null \
  && pm2 restart myapp \
  || pm2 start yarn --name myapp -- start

echo "===== ✅ デプロイ完了: $(date) ====="
