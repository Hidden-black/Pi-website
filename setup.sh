#!/bin/bash

NGINX_CONFIG_FILE="/etc/nginx/sites-available/pi-website"
EXPRESS_PORT="5000"
APP_DIR="/var/www/pi-website"
GITHUB_REPO="https://github.com/Hidden-black/Pi-website.git"
lip_address=$(hostname -I | awk '{print $1}')

install_packages() {
    echo "Installing And Checking packages..."
    sudo apt install nginx git nodejs npm -y
    sudo npm install -g pm2
}

clone_app() {
    echo "Cloning from GitHub..."
    
    if [ -d "$APP_DIR" ]; then
        sudo rm -rf "$APP_DIR"
    fi

    sudo git clone $GITHUB_REPO $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
}

install_dependencies() {
    echo "Installing the Dependencies..."
    cd $APP_DIR
    npm install
    chmod +x start.sh
    ./start.sh
}

main() {
    install_packages
    clone_app
    install_dependencies
}

main