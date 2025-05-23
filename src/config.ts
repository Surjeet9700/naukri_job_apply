// Configuration settings for the Naukri job application automation

import path from 'path';

// Default configuration
export const DEFAULT_JOB_URL = "https://www.naukri.com/job-listings-fresher-graduate-sairam-global-technologies-hyderabad-chennai-bengaluru-0-to-0-years-270325025564";
export const DEFAULT_SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');

// Selectors for targeting Naukri page elements
export const SELECTORS = {
  // Apply button selectors - prioritized in order
  applyButton: [
    // Exact match from the provided HTML
    'button#apply-button.styles_apply-button__uJI3A.apply-button', 
    'button#apply-button.apply-button',
    'button.styles_apply-button__uJI3A',
    'button#apply-button',
    '.apply-button'
  ],
  
  // Login related selectors
  login: {
    buttons: [
      '#login_Layer',
      'a.login',
      'a[href*="login"]',
      'button[class*="login"]',
      'div[class*="login"]'
    ],
    emailField: 'input[placeholder="Enter your active Email ID / Username"], input[type="email"], input[name="email"]',
    passwordField: 'input[placeholder="Enter your password"], input[type="password"], input[name="password"]',
    submitButton: 'button.loginButton, button[type="submit"], button[class*="submit"]'
  },
  
  // Chatbot related selectors
  chatbot: {
    container: [
      'div.chat-container', 
      'div.chatbot-interface', 
      'div[class*="chatbot"]',
      'div.bot-container',
      'div.naukri-chat',
      'div[class*="chat-window"]',
      'div[aria-label*="chat"]',
      'div[class*="assessment"]'
    ],
    questions: [
      'div.question-text', 
      'div.chatbot-question', 
      'div[class*="question"]:not([class*="answered"])',
      'div.bot-message:not(.answered)',
      'div[class*="message"][class*="bot"]',
      'div[class*="query"]',
      'div[role="heading"][aria-level="3"]',
      'div.assessment-question'
    ],
    inputFields: [
      'input[type="text"]', 
      'textarea', 
      'div[contenteditable="true"]',
      'input.chat-input',
      'textarea.message-input',
      'div.chat-textarea',
      'div[role="textbox"]',
      'input[placeholder*="type"]',
      'input[placeholder*="message"]',
      'input[placeholder*="answer"]'
    ],
    submitButtons: [
      'button[type="submit"]', 
      'button.send-button', 
      'button[class*="submit"]',
      'button.chat-send',
      'button[aria-label*="send"]',
      'button[aria-label*="submit"]',
      'button svg[class*="send"]',
      'button[title*="send"]',
      'button.send',
      'button[class*="continue"]',
      'button[class*="next"]'
    ]
  },
  
  // Already applied indicators
  alreadyApplied: [
    'span#already-applied.already-applied',
    'div[class*="already-applied"]',
    'button[disabled][class*="apply"]',
    'span[class*="applied"]'
  ]
};
