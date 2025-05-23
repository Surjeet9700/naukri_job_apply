// Types for the Naukri job application automation

import { Page } from 'playwright';

export interface NaukriApplyOptions {
  jobUrl?: string;
  email?: string;
  password?: string;
  geminiApiKey?: string;
  headless?: boolean;
  screenshotDir?: string;
  debug?: boolean;
}

export interface ClickResult {
  success: boolean;
  method?: string;
  message?: string;
}

export interface ChatbotResponse {
  questionsAnswered: number;
  completed: boolean;
  lastMessage?: string;
}

export interface ApplicationResult {
  success: boolean;
  message: string;
  screenshotPaths: string[];
  chatbotInteraction?: ChatbotResponse;
}
