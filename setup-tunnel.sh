#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Instalando cloudflared en EndeavorOS...${NC}"
yay -S --noconfirm cloudflared

echo -e "${BLUE}Iniciando sesión en Cloudflare (se abrirá tu navegador)...${NC}"
cloudflared tunnel login

echo -e "${BLUE}Creando túnel para academic-app...${NC}"
TUNNEL_ID=$(cloudflared tunnel create academic-app | grep -oP "(?<=Created tunnel ).*" | tr -d ' ')
echo -e "${GREEN}¡Túnel creado con ID: ${TUNNEL_ID}!${NC}"

echo -e "${BLUE}Ahora, ingresa el subdominio DuckDNS que vas a usar:${NC}"
read DOMAIN

# Crear directorio para configs si no existe
mkdir -p ~/.cloudflared

# Configurar archivo de túnel
cat > ~/.cloudflared/config.yml << EOF
tunnel: ${TUNNEL_ID}
credentials-file: /home/$(whoami)/.cloudflared/${TUNNEL_ID}.json

ingress:
  - hostname: ${DOMAIN}
    service: http://localhost:80
  - service: http_status:404
EOF

echo -e "${GREEN}Configurando DNS para el túnel...${NC}"
cloudflared tunnel route dns ${TUNNEL_ID} ${DOMAIN}

# Crear servicio systemd para usuario
mkdir -p ~/.config/systemd/user/
cat > ~/.config/systemd/user/cloudflared.service << EOF
[Unit]
Description=Cloudflare Tunnel for Academic App
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/bin/cloudflared tunnel --config /home/$(whoami)/.cloudflared/config.yml run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=default.target
EOF

# Habilitar e iniciar servicio
systemctl --user daemon-reload
systemctl --user enable cloudflared
systemctl --user start cloudflared

echo -e "${GREEN}¡Configuración completada! Tu aplicación estará accesible en https://${DOMAIN}${NC}"
echo -e "Puedes verificar el estado del túnel con: ${BLUE}systemctl --user status cloudflared${NC}"