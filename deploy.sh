#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_NAME="paudhi"
DOMAIN="paudhi.kemenkopmk.go.id"
BACKEND_PORT="5000"
WEB_ROOT="/var/www/html"
SERVICE_USER="www-data"
DEPLOY_ROOT="/srv/paudhi"

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT="$SCRIPT_DIR"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Run as root"
        exit 1
    fi
}

install_dependencies() {
    log_info "Installing dependencies..."

    apt update && apt upgrade -y

    apt install -y \
        curl wget git rsync build-essential \
        apache2 apache2-utils \
        certbot python3-certbot-apache \
        postgresql postgresql-contrib

    a2enmod rewrite ssl proxy proxy_http headers expires deflate

    log_success "Dependencies installed"
}

install_nodejs() {
    log_info "Installing Node.js..."

    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt install -y nodejs

    npm install -g pm2

    log_success "Node.js ready"
}

setup_postgresql() {
    log_info "Ensuring PostgreSQL is running..."

    systemctl start postgresql
    systemctl enable postgresql

    log_success "PostgreSQL running"
}

kill_old_process() {
    log_info "Cleaning old Node processes..."

    pkill -f server.js || true

    # kill old pm2 (user digi)
    sudo -u digi pm2 kill 2>/dev/null || true

    log_success "Old processes cleaned"
}

deploy_backend() {
    log_info "Deploying backend..."

    BACKEND_DIR="$DEPLOY_ROOT/backend"

    mkdir -p "$BACKEND_DIR"

    rsync -a --delete \
        --exclude 'node_modules' \
        --exclude '.git' \
        "$PROJECT_ROOT/backend/" "$BACKEND_DIR/"

    rm -rf "$BACKEND_DIR/node_modules"

    chown -R $SERVICE_USER:$SERVICE_USER "$DEPLOY_ROOT"

    cd "$BACKEND_DIR"

    sudo -u $SERVICE_USER -H npm ci --omit=dev --no-audit --no-fund

    sudo -u $SERVICE_USER -H node scripts/createUploadDirs.js || true

    mkdir -p /var/www/.pm2
    chown -R $SERVICE_USER:$SERVICE_USER /var/www/.pm2

    if sudo -u $SERVICE_USER -H pm2 describe paudhi-backend >/dev/null 2>&1; then
        sudo -u $SERVICE_USER -H pm2 reload paudhi-backend --update-env
    else
        sudo -u $SERVICE_USER -H pm2 start server.js --name paudhi-backend
    fi

    sudo -u $SERVICE_USER -H pm2 save

    env PATH=$PATH:/usr/bin pm2 startup systemd -u $SERVICE_USER --hp /var/www

    log_success "Backend deployed"
}

deploy_frontend() {
    log_info "Deploying frontend..."

    cd "$PROJECT_ROOT"

    npm ci || npm install
    npm run build

    rm -rf $WEB_ROOT/*
    cp -r dist/* $WEB_ROOT/

    chown -R $SERVICE_USER:$SERVICE_USER $WEB_ROOT

    log_success "Frontend deployed"
}

setup_apache() {
    log_info "Configuring Apache..."

    cp srv/conf/paudhi.conf /etc/apache2/sites-available/

    a2dissite 000-default
    a2ensite paudhi

    apache2ctl configtest

    systemctl restart apache2
    systemctl enable apache2

    log_success "Apache ready"
}

verify_deployment() {
    log_info "Verifying..."

    services=("apache2" "postgresql")

    for s in "${services[@]}"; do
        if systemctl is-active --quiet $s; then
            log_success "$s running"
        else
            log_error "$s NOT running"
        fi
    done

    sleep 5

    if curl -f -s http://localhost:$BACKEND_PORT/api/health > /dev/null; then
        log_success "API OK"
    else
        log_error "API ERROR"
    fi
}

main() {
    check_root
    install_dependencies
    install_nodejs
    setup_postgresql
    kill_old_process
    deploy_backend
    deploy_frontend
    setup_apache
    verify_deployment

    log_success "🚀 DEPLOY SUCCESS"
}

main
