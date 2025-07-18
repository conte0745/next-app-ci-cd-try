#!/bin/bash
set -e

# プロジェクトディレクトリへ移動
cd /home/ec2-user/next-app

# 最新のコードをpull
git pull

# 必要に応じてビルドや再起動
yarn install --frozen-lockfile
yarn run build

# pm2やsystemdでNext.jsアプリ再起動
pm2 restart next-app