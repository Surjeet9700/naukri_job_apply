#!/usr/bin/env node
// CLI interface for Naukri job application automation

import { program } from 'commander';
import dotenv from 'dotenv';
import { naukriApply } from './index';

// Load environment variables
dotenv.config();

// Create command line interface
program
  .name('naukri-apply')
  .description('Automate job applications on Naukri.com')
  .version('1.0.0');

program
  .option('-u, --url <url>', 'Naukri job URL to apply for')
  .option('-e, --email <email>', 'Email to login with (overrides .env)')
  .option('-p, --password <password>', 'Password to login with (overrides .env)')
  .option('-k, --key <apikey>', 'Gemini API key (overrides .env)')
  .option('-H, --headless', 'Run in headless mode (invisible browser)')
  .option('-s, --screenshot <dir>', 'Directory to save screenshots', './screenshots')
  .option('-d, --debug', 'Enable debug mode with additional logging');

program.parse();

const options = program.opts();

// Run the application with parsed options
naukriApply({
  jobUrl: options.url,
  email: options.email,
  password: options.password,
  geminiApiKey: options.key,
  headless: options.headless || false,
  screenshotDir: options.screenshot,
  debug: options.debug || false
})
.then((result) => {
  if (result.success) {
    console.log('✅ Job application completed successfully: ' + result.message);
    if (result.chatbotInteraction) {
      console.log(`🤖 Chatbot interaction: ${result.chatbotInteraction.questionsAnswered} questions answered`);
    }
  } else {
    console.error('❌ Job application process failed: ' + result.message);
  }
  
  if (options.debug) {
    console.log('📷 Screenshot paths:');
    result.screenshotPaths.forEach(path => console.log(`  - ${path}`));
  }
  
  process.exit(result.success ? 0 : 1);
})
.catch(err => {
  console.error('💥 Fatal error:', err.message || err);
  process.exit(1);
});
