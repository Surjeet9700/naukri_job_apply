// Main API entry point for Naukri job application automation

import dotenv from 'dotenv';
import { DEFAULT_JOB_URL, DEFAULT_SCREENSHOT_DIR } from './config';
import { applyToJob } from './browser-controller';
import { NaukriApplyOptions, ApplicationResult } from './types';

// Load environment variables
dotenv.config();

/**
 * Apply to a Naukri job listing
 * 
 * @param options Configuration options for the job application
 * @returns Application result with success status and message
 */
export async function naukriApply(options: NaukriApplyOptions = {}): Promise<ApplicationResult> {
  // Get configuration values, prioritizing passed options, then environment variables, then defaults
  const email = options.email || process.env.EMAIL;
  const password = options.password || process.env.PASSWORD;
  const geminiApiKey = options.geminiApiKey || process.env.GEMINI_API_KEY;
  const jobUrl = options.jobUrl || process.env.JOB_URL || DEFAULT_JOB_URL;
  const headless = options.headless !== undefined ? options.headless : false;
  const screenshotDir = options.screenshotDir || DEFAULT_SCREENSHOT_DIR;
  const debug = options.debug || false;
  
  console.log(`Starting job application process with options:
  - Job URL: ${jobUrl}
  - Headless mode: ${headless}
  - Debug mode: ${debug}
  - Screenshot directory: ${screenshotDir}`);
  
  // Validate required fields
  if (!email || !password) {
    return {
      success: false,
      message: 'Email or password not provided. Please check your .env file or pass them as options.',
      screenshotPaths: []
    };
  }
  
  if (!geminiApiKey) {
    console.warn('Gemini API key not provided. Chatbot responses will use fallback text.');
  }

  try {
    return await applyToJob({
      jobUrl,
      email,
      password,
      geminiApiKey,
      headless,
      screenshotDir,
      debug
    });
  } catch (error: any) {
    return {
      success: false,
      message: `Uncaught error: ${error.message || 'Unknown error'}`,
      screenshotPaths: []
    };
  }
}

// Export types for API consumers
export { NaukriApplyOptions, ApplicationResult } from './types';
