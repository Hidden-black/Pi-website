#!/bin/bash

NGINX_CONFIG_FILE="/etc/nginx/sites-available/pi-website-1"
EXPRESS_PORT="5000"
APP_DIR="/var/www/pi-website"
GITHUB_REPO="https://github.com/Hidden-black/Pi-website.git"
lip_address=$(hostname -I | awk '{print $1}')

get_public_ip() {
    PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
    echo "Public IP: $PUBLIC_IP"
}

pull_git() {
    echo "Syncing from GitHub..."
    sudo git pull $GITHUB_REPO $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
}

start() {
    echo "Starting the Express app with PM2..."
    cd $APP_DIR
    pm2 start server.js --name "Pi-website"
    pm2 save
}

main() {
    get_public_ip
    pull_git
    start

    echo "Complete! Website should be Live at $PUBLIC_IP"
    echo "Remember to enable port forwarding in your router!"
}
main