// Core browser controller for Naukri job applications

import { chromium, Page, Browser } from 'playwright';
import fs from 'fs';
import path from 'path';
import { NaukriApplyOptions, ApplicationResult } from './types';
import { SELECTORS, DEFAULT_SCREENSHOT_DIR } from './config';
import { clickApplyButton } from './button-util';
import { handleChatbot } from './chatbot-handler';

export async function initializeBrowser(options: NaukriApplyOptions): Promise<Browser> {
  const headless = options.headless !== undefined ? options.headless : false;
  
  return await chromium.launch({
    headless: headless,
    slowMo: 50, // Slow down Playwright operations by 50ms
    args: ['--disable-blink-features=AutomationControlled'] // Avoid detection
  });
}

export async function setupBrowserContext(browser: Browser): Promise<Page> {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    permissions: ['notifications'],
    deviceScaleFactor: 1.25
  });

  // Add anti-detection script
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // @ts-ignore
    window.navigator.chrome = { runtime: {} };
  });

  return await context.newPage();
}

export async function navigateToJob(
  page: Page, 
  jobUrl: string, 
  screenshotDir: string,
  timestamp: string
): Promise<boolean> {
  try {
    console.log(`Navigating to job URL: ${jobUrl}`);
    
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-job-page.png`) });
    
    // Extended wait for page to stabilize
    await page.waitForTimeout(3000);
    return true;
  } catch (error: any) {
    console.error('Navigation error:', error.message || error);
    return false;
  }
}

export async function performLogin(
  page: Page,
  email: string | undefined,
  password: string | undefined,
  screenshotDir: string,
  timestamp: string
): Promise<boolean> {
  try {
    if (!email || !password) {
      console.error('Email or password not provided');
      return false;
    }
    
    console.log('Looking for login button...');
    
    // Try multiple selectors for the login button
    let loginElement = null;
    for (const selector of SELECTORS.login.buttons) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          loginElement = element;
          console.log(`Found login element with selector: ${selector}`);
          break;
        }
      } catch (e: any) {
        // Continue to next selector
      }
    }
    
    if (!loginElement) {
      // Check if already logged in
      const isLoggedIn = await page.locator('div[class*="profile"], div[class*="user-info"], img[class*="avatar"]').count() > 0;
      if (isLoggedIn) {
        console.log('Already logged in, proceeding...');
        return true;
      } else {
        console.log('Could not find login button and not already logged in');
        return false;
      }
    }
    
    // Click login button and wait for form
    await loginElement.click();
    await page.waitForLoadState('networkidle');
    
    // Fill login credentials
    console.log('Filling login credentials...');
    await page.waitForSelector(SELECTORS.login.emailField, { timeout: 10000 });
    await page.fill(SELECTORS.login.emailField, email);
    await page.fill(SELECTORS.login.passwordField, password);
    
    // Click login button and wait for navigation
    console.log('Submitting login...');
    await page.click(SELECTORS.login.submitButton);
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
      page.waitForTimeout(10000)
    ]);
    
    // Take a screenshot after login
    await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-after-login.png`) });
    return true;
  } catch (error: any) {
    console.error('Login error:', error.message || error);
    return false;
  }
}

export async function checkIfAlreadyApplied(page: Page): Promise<boolean> {
  for (const selector of SELECTORS.alreadyApplied) {
    if (await page.locator(selector).count() > 0) {
      console.log(`Found "already applied" indicator with selector: ${selector}`);
      return true;
    }
  }
  return false;
}

export async function applyToJob(
  options: NaukriApplyOptions
): Promise<ApplicationResult> {
  // Validate and prepare options
  const jobUrl = options.jobUrl || '';
  const screenshotDir = options.screenshotDir || DEFAULT_SCREENSHOT_DIR;
  const debug = !!options.debug;
  
  // Create screenshot directory if it doesn't exist
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  // Generate timestamp for this run
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPaths: string[] = [];
  
  // Debug logging
  if (debug) {
    console.log(`Debug mode enabled`);
    console.log(`Job URL: ${jobUrl}`);
    console.log(`Screenshot directory: ${screenshotDir}`);
  }
  
  let browser: Browser | null = null;
  
  try {
    browser = await initializeBrowser(options);
    const page = await setupBrowserContext(browser);
    
    // Navigate to the job URL
    const navigationSuccess = await navigateToJob(page, jobUrl, screenshotDir, timestamp);
    if (!navigationSuccess) {
      return {
        success: false,
        message: 'Failed to navigate to the job URL',
        screenshotPaths: [path.join(screenshotDir, `${timestamp}-navigation-error.png`)]
      };
    }
    
    // Login if credentials provided
    if (options.email && options.password) {
      const loginSuccess = await performLogin(
        page, 
        options.email, 
        options.password, 
        screenshotDir,
        timestamp
      );
      
      if (!loginSuccess) {
        return {
          success: false,
          message: 'Login failed',
          screenshotPaths: [path.join(screenshotDir, `${timestamp}-login-failed.png`)]
        };
      }
      
      // Re-navigate to job URL after login
      await navigateToJob(page, jobUrl, screenshotDir, timestamp);
    }
    
    // Check if already applied
    const alreadyApplied = await checkIfAlreadyApplied(page);
    if (alreadyApplied) {
      console.log('Already applied to this job!');
      await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-already-applied.png`) });
      return {
        success: true,
        message: 'Already applied to this job',
        screenshotPaths: [path.join(screenshotDir, `${timestamp}-already-applied.png`)]
      };
    }
    
    // Click apply button
    console.log('Attempting to click apply button...');
    const clickResult = await clickApplyButton(
      page, 
      SELECTORS.applyButton, 
      screenshotDir, 
      timestamp, 
      options.debug
    );
    
    if (!clickResult.success) {
      return {
        success: false,
        message: clickResult.message || 'Failed to click apply button',
        screenshotPaths: [path.join(screenshotDir, `${timestamp}-click-failed.png`)]
      };
    }
    
    console.log('Apply button clicked successfully, waiting for response...');
    await page.waitForTimeout(5000);
    
    // Handle chatbot if it appears
    const chatbotResult = await handleChatbot(page, options, screenshotDir, timestamp);
    
    // Take final screenshot
    await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-final-state.png`) });
    
    return {
      success: true,
      message: 'Successfully applied to the job',
      screenshotPaths: [
        path.join(screenshotDir, `${timestamp}-after-click.png`),
        path.join(screenshotDir, `${timestamp}-final-state.png`)
      ],
      chatbotInteraction: chatbotResult
    };
  } catch (error: any) {
    console.error('Error during job application:', error.message || error);
    if (browser) {
      const page = await browser.newPage();
      await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-error-screenshot.png`) });
    }
    return {
      success: false,
      message: `Error: ${error.message || 'Unknown error'}`,
      screenshotPaths: [path.join(screenshotDir, `${timestamp}-error-screenshot.png`)]
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
