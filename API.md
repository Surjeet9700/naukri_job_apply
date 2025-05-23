# Naukri Job Application Automation API

This API provides endpoints for automating job applications on Naukri.com.

## API Endpoints

### GET /

Base endpoint that returns API information and usage instructions.

**Response Example:**
```json
{
  "status": "ok",
  "message": "Naukri Job Application Automation API",
  "usage": "/apply?email=your-email&password=your-password&jobUrl=job-url"
}
```

### GET /apply

Automates the job application process for a specified job URL.

**Query Parameters:**
- `email` (required): Your Naukri.com login email
- `password` (required): Your Naukri.com login password
- `jobUrl` (required): The complete URL of the job you want to apply for
- `headless` (optional): Set to "true" or "false" to run the browser in headless mode (default: "true")
- `debug` (optional): Set to "true" or "false" to enable debug mode with additional logging (default: "false")

**Example Request:**
```
GET /apply?email=your-email@example.com&password=your-password&jobUrl=https://www.naukri.com/job-listings-123456
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully applied to the job",
  "screenshot_count": 3,
  "chatbot": {
    "questionsAnswered": 5,
    "completed": true
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Missing required parameters: email, password, and jobUrl are required"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "Login failed"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Each IP is limited to 10 requests per minute.

## Security Recommendations

- Use HTTPS when deploying this API in production
- Consider implementing authentication for the API endpoints in production
- Never expose this API on a public server without proper security measures

## Example Usage with cURL

```bash
curl "http://localhost:4002/apply?email=your-email@example.com&password=your-password&jobUrl=https://www.naukri.com/job-listings-123456"
```

## Example Usage with JavaScript

```javascript
const response = await fetch('http://localhost:4002/apply?email=your-email@example.com&password=your-password&jobUrl=https://www.naukri.com/job-listings-123456');
const data = await response.json();
console.log(data);
```

## Web-based API Tester

A user-friendly HTML interface is provided for testing the API without writing code:

1. Start the API server:
   ```bash
   npm start
   ```

2. Open the `api-tester.html` file in your web browser
3. Fill in your credentials and the job URL
4. Click "Apply for Job" to test the API
