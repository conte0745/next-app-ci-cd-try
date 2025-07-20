# ec2 のユーザデータです。初回起動時に実行されます。
su - ec2-user
set -euxo pipefail

# システムをアップデート
sudo dnf update -y
sudo dnf upgrade -y --releasever=2023.8.20250715

# gitをインストール
sudo dnf install -y git
sudo git config --global user.name "conte0745" 
sudo git config --global user.email "ryoya15662@gmail.com"
mkdir -p /var/www
cd /var/www
git clone https://github.com/conte0745/next-app-ci-cd-try.git next-app

# ユーザ/グループ作成（存在しない場合）
sudo sudo useradd -m ssm-user
sudo groupadd deploy-group

# ユーザーをグループに追加
sudo usermod -aG deploy-group ec2-user
sudo usermod -aG deploy-group ssm-user

# next-app 配下のグループ所有者を変更
sudo chown -R :deploy-group /var/www
sudo chown -R :deploy-group /var/www/next-app

# グループに書き込み権限を付与
sudo chmod -R g+rw /var/www/next-app

# ディレクトリに「setgid」ビットを設定（以後作られるファイルもグループ継承）
sudo find /var/www/next-app -type d -exec chmod g+s {} \;

# nodejsをインストール
sudo curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
sudo npm install -g npm@latest

# pm2/yarnをグローバルインストール
sudo npm install -g pm2
sudo npm install -g yarn

# MySQL 8.0をインストール
sudo dnf -y install https://dev.mysql.com/get/mysql84-community-release-el9-1.noarch.rpm
sudo dnf -y install mysql mysql-community-client
sudo dnf -y install mysql-community-server

# MySQLを起動
sudo systemctl enable mysqld
sudo systemctl start mysqld

# MySQLのrootパスワードを設定して next_db や appuser を作成して下さい(初回のみ手動)
sudo grep 'temporary password' /var/log/mysqld.log
temp_pass=$(grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')
echo "MySQL temporary password: $temp_pass"

# swap領域を作成
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab  

# システムパッケージを更新
sudo dnf update -y
# システムパッケージをアップグレード
sudo dnf upgrade -y

# .envファイルを編集して設定情報を更新して下さい
sudo cp /var/www/next-app/.env.example /var/www/next-app/.env