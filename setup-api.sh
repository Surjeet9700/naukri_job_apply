#!/bin/bash
# Setup and run the Naukri Job Application API

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for Node.js
if ! command_exists node; then
  echo -e "${RED}Node.js is required but not installed. Please install Node.js first.${NC}"
  echo "Visit https://nodejs.org/ to download and install."
  exit 1
fi

# Check node version
NODE_VERSION=$(node -v | cut -d "v" -f 2 | cut -d "." -f 1)
if [[ $NODE_VERSION -lt 16 ]]; then
  echo -e "${RED}Node.js 16 or higher is required. You have version $NODE_VERSION.${NC}"
  echo "Please upgrade your Node.js installation."
  exit 1
fi

# Print welcome message
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}Naukri Job Application API Installer${NC}"
echo -e "${GREEN}====================================${NC}"

# Check if .env file exists
if [[ ! -f ".env" ]]; then
  echo -e "${YELLOW}Creating .env file from example...${NC}"
  if [[ -f ".env.example" ]]; then
    cp .env.example .env
    echo -e "${GREEN}.env file created successfully.${NC}"
    echo -e "${YELLOW}Please edit the .env file with your credentials before running the API.${NC}"
  else
    echo -e "${RED}.env.example file not found. Creating empty .env file...${NC}"
    touch .env
    echo "EMAIL=your_email@example.com" >> .env
    echo "PASSWORD=your_password" >> .env
    echo "GEMINI_API_KEY=your_gemini_api_key" >> .env
    echo "PORT=3000" >> .env
    echo -e "${YELLOW}Please edit the .env file with your credentials before running the API.${NC}"
  fi
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build the project
echo -e "${YELLOW}Building the project...${NC}"
npm run build

# Check if build was successful
if [[ $? -ne 0 ]]; then
  echo -e "${RED}Build failed. Please check for errors above.${NC}"
  exit 1
fi

# Ask if user wants to start the API server
read -p "Do you want to start the API server now? (y/n): " START_SERVER
if [[ $START_SERVER == "y" || $START_SERVER == "Y" ]]; then
  echo -e "${GREEN}Starting API server...${NC}"
  echo -e "${YELLOW}Press Ctrl+C to stop the server.${NC}"
  npm start
else
  echo -e "${GREEN}Installation complete!${NC}"
  echo -e "${YELLOW}To start the API server later, run:${NC}"
  echo -e "npm start"
fi
