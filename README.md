# Naukri Job Application Automator

This TypeScript automation tool streamlines the job application process on Naukri.com. It handles login, job application, and uses Google's Gemini AI to automatically respond to chatbot interview questions.

## Key Features

- **Automated Login**: Securely logs into your Naukri account
- **One-Click Applications**: Automatically clicks apply buttons on job listings
- **AI-Powered Chat Responses**: Uses Google's Gemini AI to generate professional responses to chatbot questions
- **Comprehensive Screenshot Logs**: Captures the entire process for troubleshooting
- **Robust Selector System**: Handles various UI scenarios with multiple selector fallbacks
- **Command Line Interface**: Easy to use with customizable options

## Prerequisites

- Node.js (v16 or higher)
- TypeScript
- Google Gemini API Key (optional but recommended for chatbot handling)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your credentials:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` file with your credentials:
     ```
     EMAIL=your_naukri_email@example.com
     PASSWORD=your_naukri_password
     GEMINI_API_KEY=your_gemini_api_key
     ```

3. Build the TypeScript code:
   ```bash
   npm run build
   ```

## Usage

There are several ways to run the application:

### Command Line Interface

Run with the default job URL specified in the code:

```bash
npm start
```

### Specifying a Job URL

Apply to a specific job URL:

```bash
npm run apply -- --url "https://www.naukri.com/job-listings-your-job-url"
```

Or using the shorthand option:

```bash
npm run apply -- -u "https://www.naukri.com/job-listings-your-job-url"
```

### Command Line Options

The CLI provides several options for customization:

```bash
npm run cli -- --help
```

### Examples

Apply with custom credentials:

```bash
npm run cli -- -u "https://www.naukri.com/job-url" -e "myemail@example.com" -p "mypassword"
```

### REST API

The application provides a REST API that you can use to integrate with other systems or create web interfaces:

```bash
# Start the API server
npm start
```

Access the API at http://localhost:3000

#### API Endpoints

- **GET /** - Documentation endpoint that shows usage info
- **GET /apply** - Main endpoint to apply for a job

#### Example API Usage

```
http://localhost:3000/apply?email=your_email&password=your_password&jobUrl=https://www.naukri.com/job-listings-123456
```

For complete API documentation, see [API.md](./API.md)

#### Testing the API

You can use the included test scripts to try the API:

```bash
# For Linux/macOS
chmod +x test-api.sh
./test-api.sh

# For Windows
test-api.bat
```

## Troubleshooting

- **Login Issues**: Check your credentials in the .env file
- **Selector Problems**: Check the screenshots in the screenshots directory
- **Chatbot Not Detected**: The script may need updated selectors for new chatbot interfaces

## Technical Notes

- The script runs with browser visibility enabled to help you monitor the process
- Screenshots are saved in the `screenshots` directory with timestamps
- Selectors are regularly updated but may need adjustment as Naukri's website changes
- The Gemini AI API is used to generate responses to chatbot questions
