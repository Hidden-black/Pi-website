#!/bin/bash

NGINX_CONFIG_FILE="/etc/nginx/sites-available/pi-website"
EXPRESS_PORT="5000"
APP_DIR="/var/www/pi-website"
GITHUB_REPO="https://github.com/Hidden-black/Pi-website.git"
lip=$(hostname -I | awk '{print $1}')

get_public_ip() {
    PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
    echo "Public IP: $PUBLIC_IP"
}

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
}

configure_nginx() {
    echo "Configuring Nginx..."
    sudo tee $NGINX_CONFIG_FILE > /dev/null <<EOL
server {
    listen 80;
    server_name $PUBLIC_IP;

    location / {
        proxy_pass http://$lip:$EXPRESS_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL
    sudo ln -s $NGINX_CONFIG_FILE /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    sudo systemctl enable nginx
}

start_app_with_pm2() {
    echo "Starting the Express app with PM2..."
    cd $APP_DIR
    pm2 start server.js --name "Pi-website"
    pm2 save
    pm2 startup | sudo tee /dev/null
}

main() {
    get_public_ip
    install_packages
    clone_app
    install_dependencies
    configure_nginx
    start_app_with_pm2
    echo "Complete! Website should be Live at $PUBLIC_IP"
    echo "Remember to enable port forwarding in your router!"
}

main