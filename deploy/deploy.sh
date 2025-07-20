#!/bin/bash
set -euo pipefail

echo "===== 🚀 デプロイ開始: $(date) ====="

APP_DIR="/opt/next-app"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="$APP_DIR/backup/db_backup_$TIMESTAMP.sql"

# アプリのディレクトリへ移動
cd $APP_DIR

# ユーザーとディレクトリの所有権を確認
echo "現在のユーザは: $(whoami)"
echo "現在のディレクトリは: $(pwd)"
echo "現在のディレクトリの所有者は: $(ls -ld $APP_DIR | awk '{print $3}')"
echo "現在のディレクトリのグループは: $(ls -ld $APP_DIR | awk '{print $4}')"

# キャッシュディレクトリの設定
export YARN_CACHE_FOLDER=/var/cache/yarn
export TMPDIR=/var/tmp
mkdir -p $YARN_CACHE_FOLDER $TMPDIR

# Git所有権確認（所有者統一後は原則不要）
echo "🔧 Git状態確認"
if [ -d ".git" ]; then
  echo "Gitリポジトリを検出しました。"
else
  echo "Gitリポジトリが見つかりません。"
fi

echo "Pulling latest code..."
# 最新のコードを取得（main ブランチ）
echo "📦 Git Pull"
git pull origin main

# パッケージインストール
echo "📦 yarn install"
yarn install --immutable --cache-folder $YARN_CACHE_FOLDER

# Prisma migration の実行
echo "🧩 Prisma Migration"
yarn prisma:migrate:deploy

# ビルド
echo "🔨 Next.js Build"
yarn build

# pm2 でアプリを再起動 or 初回起動
export PM2_HOME="/opt/next-app/.pm2"
echo "🟢 PM2 Restart"
pm2 describe next-app > /dev/null \
  && pm2 restart next-app \
  || pm2 start yarn --name next-app -- start

# pm2の設定を保存
pm2 save

# pm2の起動設定を保存
pm2 startup

echo "===== ✅ デプロイ完了: $(date) ====="
