#!/bin/bash
set -euxo pipefail

echo "===== 🚀 デプロイ開始: $(date) ====="

APP_DIR="/var/www/next-app"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="$APP_DIR/backup/db_backup_$TIMESTAMP.sql"

# アプリのディレクトリへ移動
cd $APP_DIR

# ユーザーとディレクトリの所有権を確認
echo "現在のユーザは: $(whoami)"
echo "現在のディレクトリは: $(pwd)"
echo "現在のディレクトリの所有者は: $(ls -ld $APP_DIR | awk '{print $3}')"
echo "現在のディレクトリのグループは: $(ls -ld $APP_DIR | awk '{print $4}')"

# Git所有権エラーを回避するための設定
echo "🔧 Git設定の初期化"
git config --add safe.directory /var/www/next-app

echo "Pulling latest code..."
# 最新のコードを取得（main ブランチ）
echo "📦 Git Pull"
git pull origin main

# パッケージインストール
echo "📦 yarn install"
yarn install --immutable

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
