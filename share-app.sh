#!/bin/bash
# This script helps share the academic app on your local network

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Sharing Academic App on Local Network...${NC}"

# Check if Docker containers are running
echo -e "${YELLOW}Checking if application is running...${NC}"
if ! docker ps | grep -q academic-app-frontend; then
    echo -e "${YELLOW}Application is not running. Starting it...${NC}"
    ./start-app.sh
    sleep 3
fi

# Get local IP address (first non-loopback address)
IP_ADDRESS=$(ip addr show | grep -w inet | grep -v 127.0.0.1 | head -n1 | awk '{print $2}' | cut -d/ -f1)

# Generate QR code for easy access
echo -e "${YELLOW}Generating QR code for easy access...${NC}"
if ! command -v qrencode &> /dev/null; then
    echo -e "${YELLOW}Installing qrencode...${NC}"
    sudo apt-get update && sudo apt-get install -y qrencode
fi

# Create QR code image
qrencode -o academic-app-qr.png "http://${IP_ADDRESS}"
echo -e "${GREEN}QR code generated as academic-app-qr.png${NC}"

# Display access information
echo -e "\n${GREEN}=================================================${NC}"
echo -e "${GREEN}         Academic App is now shared!            ${NC}"
echo -e "${GREEN}=================================================${NC}"
echo -e "${BLUE}Your girlfriend can access the app at:${NC}"
echo -e "${YELLOW}http://${IP_ADDRESS}${NC}"
echo -e "\n${BLUE}She can also scan this QR code with her phone:${NC}"
echo -e "${YELLOW}See academic-app-qr.png in this folder${NC}"
echo -e "\n${GREEN}=================================================${NC}"
echo -e "${BLUE}To make it easier to remember, you could add this to her computer's hosts file:${NC}"
echo -e "${YELLOW}${IP_ADDRESS} academic-app.local${NC}"
echo -e "\n${BLUE}On her computer, run the following command as administrator:${NC}"
echo -e "${YELLOW}On Windows: echo ${IP_ADDRESS} academic-app.local >> C:\\Windows\\System32\\drivers\\etc\\hosts${NC}"
echo -e "${YELLOW}On Mac/Linux: echo '${IP_ADDRESS} academic-app.local' | sudo tee -a /etc/hosts${NC}"
echo -e "\n${BLUE}Then she can access it at:${NC}"
echo -e "${YELLOW}http://academic-app.local${NC}"
echo -e "${GREEN}=================================================${NC}"
