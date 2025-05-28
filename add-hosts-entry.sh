#!/bin/bash
# This script adds the academic app to your hosts file

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# The IP address and hostname to add
IP_ADDRESS="192.168.1.15"  # Replace with the actual IP address
HOSTNAME="academic-app.local"

echo -e "${YELLOW}Adding ${HOSTNAME} to your hosts file...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run this script with sudo:${NC}"
    echo -e "${YELLOW}sudo $0${NC}"
    exit 1
fi

# Check if the entry already exists
if grep -q "${HOSTNAME}" /etc/hosts; then
    # Update the existing entry
    echo -e "${YELLOW}Updating existing entry for ${HOSTNAME}...${NC}"
    sed -i "s/^.*${HOSTNAME}$/${IP_ADDRESS} ${HOSTNAME}/" /etc/hosts
else
    # Add a new entry
    echo -e "${YELLOW}Adding new entry for ${HOSTNAME}...${NC}"
    echo "${IP_ADDRESS} ${HOSTNAME}" >> /etc/hosts
fi

echo -e "${GREEN}Done! You can now access the academic app at:${NC}"
echo -e "${YELLOW}http://${HOSTNAME}${NC}"
