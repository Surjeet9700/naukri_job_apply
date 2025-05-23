// API server for Naukri job application automation
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { naukriApply } from './index';
import { NaukriApplyOptions } from './types';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Apply middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiting - 10 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again after a minute'
});

app.use(limiter);

// Home route
app.get('/', function(req, res) {
  res.json({
    status: 'ok',
    message: 'Naukri Job Application Automation API',
    usage: '/apply?email=your-email&password=your-password&jobUrl=job-url'
  });
});

// Apply route
app.get('/apply', function(req, res) {
  const queryParams = req.query;  const email = queryParams.email as string | undefined;
  const password = queryParams.password as string | undefined;
  const jobUrl = queryParams.jobUrl as string | undefined;
  const headless = queryParams.headless === 'true'; // Default to false
  const debug = queryParams.debug === 'true'; // Default to false

  // Validate required parameters
  if (!email || !password || !jobUrl) {
    res.status(400).json({
      success: false,
      message: 'Missing required parameters: email, password, and jobUrl are required'
    });
    return;
  }

  // Run the automation
  const options: NaukriApplyOptions = {
    email,
    password,
    jobUrl,
    headless,
    debug
  };

  console.log(`Starting job application for URL: ${jobUrl}`);

  naukriApply(options)
    .then(result => {
      res.status(result.success ? 200 : 500).json({
        success: result.success,
        message: result.message,
        screenshot_count: result.screenshotPaths.length,
        chatbot: result.chatbotInteraction ? {
          questionsAnswered: result.chatbotInteraction.questionsAnswered,
          completed: result.chatbotInteraction.completed
        } : null
      });
    })
    .catch(error => {
      console.error('API error:', error);
      res.status(500).json({
        success: false,
        message: `Server error: ${error.message || 'Unknown error'}`
      });
    });
});

// 404 handler
app.use(function(req, res) {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    usage: '/apply?email=your-email&password=your-password&jobUrl=job-url'
  });
});

// Export for testing
export { app };

// Start the server if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 4002;
  app.listen(PORT, () => {
    console.log('\n\x1b[32m%s\x1b[0m', '='.repeat(50));
    console.log('\x1b[32m%s\x1b[0m', `Naukri Job Application API Server running on port ${PORT}`);
    console.log('\x1b[32m%s\x1b[0m', '='.repeat(50));
    console.log('\nAvailable endpoints:');
    console.log('\x1b[36m%s\x1b[0m', '- GET /');
    console.log('\x1b[36m%s\x1b[0m', '- GET /apply?email=your-email&password=your-password&jobUrl=job-url');
    console.log('\nAPI Documentation: \x1b[36m%s\x1b[0m', 'http://localhost:' + PORT);
    console.log('\nPress Ctrl+C to stop the server\n');
  });
}
