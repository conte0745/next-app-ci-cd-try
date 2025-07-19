#!/bin/bash
set -euxo pipefail
exec >> /var/log/deploy.log 2>&1

echo "===== 🚀 デプロイ開始: $(date) ====="

exec >> /var/log/deploy_$(date +%F_%H-%M-%S).log 2>&1

APP_DIR="/var/www/next-app"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="$APP_DIR/db_backup_$TIMESTAMP.sql"

# 環境変数（.env）読み込み（必要に応じて）
export NODE_ENV=production

# アプリのディレクトリへ移動
cd $APP_DIR


echo "Pulling latest code..."
# 最新のコードを取得（main ブランチ）
echo "📦 Git Pull"
git pull origin main

# パッケージインストール
echo "📦 yarn install"
yarn install

# Prisma migration の実行
echo "🧩 Prisma Migration"
npx prisma generate
npx prisma migrate deploy

# ビルド
echo "🔨 Next.js Build"
yarn build

# pm2 でアプリを再起動 or 初回起動
echo "🟢 PM2 Restart"
pm2 describe next-app > /dev/null \
  && pm2 restart next-app \
  || pm2 start yarn --name next-app -- start

echo "===== ✅ デプロイ完了: $(date) ====="
