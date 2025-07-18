#!/bin/bash

set -e

APP_DIR="/home/ec2-user/my-app"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="$APP_DIR/db_backup_$TIMESTAMP.sql"

# .env ファイルを読み込む
source /home/ec2-user/my-app/.env


cd $APP_DIR

echo "📦 バックアップ開始..."
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_FILE
echo "✅ バックアップ完了: $BACKUP_FILE"

echo "🔍 マイグレーションチェック..."
if git diff --quiet HEAD^ -- prisma/migrations; then
  echo "🟢 マイグレーションに差分なし"
else
  echo "🚀 Prisma マイグレーションを実行します"
  yarn prisma migrate deploy
fi

echo "♻️ アプリを再起動します"
pm2 restart my-app