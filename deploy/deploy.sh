#!/bin/bash
set -euxo pipefail

echo "===== 🚀 デプロイ開始: $(date) ====="

APP_DIR="/var/www/next-app"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="$APP_DIR/backup/db_backup_$TIMESTAMP.sql"

# アプリのディレクトリへ移動
cd $APP_DIR

# Git所有権エラーを回避するための設定
echo "🔧 Git設定の初期化"
git config --global --add safe.directory /var/www/next-app

echo "Pulling latest code..."
# 最新のコードを取得（main ブランチ）
echo "📦 Git Pull"
git pull origin main

# パッケージインストール
echo "📦 yarn install"
yarn install

# Prisma migration の実行
echo "🧩 Prisma Migration"
yarn prisma:migrate:deploy

# ビルド
echo "🔨 Next.js Build"
yarn build

# pm2 でアプリを再起動 or 初回起動
echo "🟢 PM2 Restart"
pm2 describe next-app > /dev/null \
  && pm2 restart next-app \
  || pm2 start yarn --name next-app -- start

echo "===== ✅ デプロイ完了: $(date) ====="
