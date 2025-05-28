#!/bin/bash

# Directorio del proyecto
cd ~/academic-app

# Iniciar Docker Compose
echo "Iniciando servicios Docker..."
docker-compose up -d

# Verificar estado del túnel Cloudflare
if ! systemctl --user is-active --quiet cloudflared; then
  echo "Iniciando túnel Cloudflare..."
  systemctl --user start cloudflared
fi

echo "¡Academic App está en ejecución y accesible desde internet!"