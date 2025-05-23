# Quick Start Guide for Naukri Job Application Automator

This guide will help you get started with the Naukri Job Application Automator quickly.

## Prerequisites

- Node.js v16 or higher
- A Naukri.com account
- Google Gemini API key (optional but recommended)

## Setup in 5 Minutes

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Your Credentials**

   Copy the example .env file and edit it:

   ```bash
   cp .env.example .env
   ```

   Then edit the `.env` file with your credentials:
   
   ```
   EMAIL=your_naukri_email@example.com
   PASSWORD=your_naukri_password
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Build the Project**

   ```bash
   npm run build
   ```

4. **Run the Application**

   ### Command Line Interface

   Simple usage (uses default job URL in the code):
   ```bash
   npm run start:cli
   ```

   With a specific job URL:
   ```bash
   npm run apply -- --url "https://www.naukri.com/job-listings-your-job-url"
   ```

### API Server

   Start the API server:
   ```bash
   npm start
   ```

   Access the API at http://localhost:3000
   
   Example API usage:
   ```
   http://localhost:3000/apply?email=your_email&password=your_password&jobUrl=https://www.naukri.com/job-listings-your-job-url
   ```
   
   See [API.md](./API.md) for complete documentation.

## Troubleshooting

- **Browser Not Opening**: Make sure you have Chrome installed
- **Login Issues**: Verify your credentials in the .env file
- **Chatbot Not Working**: Check that you have a valid Gemini API key

## Common Commands

1. **Apply with Custom Credentials**:
   ```bash
   npm run cli -- -u "https://www.naukri.com/job-url" -e "email@example.com" -p "password"
   ```

2. **Run in Headless Mode** (browser not visible):
   ```bash
   npm run cli -- -u "https://www.naukri.com/job-url" -H
   ```

3. **Debug Mode with Detailed Logs**:
   ```bash
   npm run cli -- -u "https://www.naukri.com/job-url" -d
   ```

4. **View All Available Options**:
   ```bash
   npm run cli -- --help
   ```

## Screenshots

All screenshots are saved in the `./screenshots` directory with timestamps to help with debugging.
