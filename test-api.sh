#!/bin/bash
# Test script for Naukri API server

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load variables from .env file if it exists
if [ -f .env ]; then
  echo -e "${GREEN}Loading credentials from .env file${NC}"
  source .env
fi

# Set default port
PORT=${PORT:-3000}
API_URL="http://localhost:${PORT}"

# Check if server is running
echo -e "${YELLOW}Checking if API server is running on port ${PORT}...${NC}"
curl -s "$API_URL" > /dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}API server is not running. Start it with 'npm start' in another terminal.${NC}"
  exit 1
fi

echo -e "${GREEN}API server is running!${NC}"

# Prompt for credentials if not set in .env
if [ -z "$EMAIL" ]; then
  read -p "Enter your Naukri email: " EMAIL
fi

if [ -z "$PASSWORD" ]; then
  read -s -p "Enter your Naukri password: " PASSWORD
  echo
fi

# Prompt for job URL
read -p "Enter the job URL to apply for: " JOB_URL

if [ -z "$JOB_URL" ]; then
  echo -e "${RED}Job URL is required${NC}"
  exit 1
fi

# Encode parameters for URL
EMAIL_ENCODED=$(echo -n "$EMAIL" | jq -s -R -r @uri)
PASSWORD_ENCODED=$(echo -n "$PASSWORD" | jq -s -R -r @uri)
JOB_URL_ENCODED=$(echo -n "$JOB_URL" | jq -s -R -r @uri)

# Show request details
echo -e "${YELLOW}Making request to:${NC}"
echo -e "${API_URL}/apply?email=${EMAIL_ENCODED}&password=********&jobUrl=${JOB_URL_ENCODED}"

# Make the request
echo -e "${YELLOW}Processing...${NC}"
curl -s "${API_URL}/apply?email=${EMAIL_ENCODED}&password=${PASSWORD_ENCODED}&jobUrl=${JOB_URL_ENCODED}" | jq .

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Test completed!${NC}"
else
  echo -e "${RED}Request failed!${NC}"
fi
