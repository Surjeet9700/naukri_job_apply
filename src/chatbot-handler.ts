// Chatbot interaction handling

import { Page } from 'playwright';
import path from 'path';
import { getResponseFromGemini } from './gemini-service';
import { SELECTORS } from './config';
import { NaukriApplyOptions, ChatbotResponse } from './types';

export async function handleChatbot(
  page: Page, 
  options: NaukriApplyOptions, 
  screenshotDir: string, 
  timestamp: string
): Promise<ChatbotResponse> {
  try {
    console.log('Checking for chatbot interface...');
    
    // Wait for page to settle
    await page.waitForTimeout(3000);
    
    // Check if any chatbot interface is present
    let hasChatbot = false;
    
    for (const selector of SELECTORS.chatbot.container) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`Chatbot interface found with selector: ${selector}`);
        hasChatbot = true;
        break;
      }
    }
    
    if (!hasChatbot) {
      console.log('No chatbot interface detected');
      return { questionsAnswered: 0, completed: true };
    }
    
    console.log('Chatbot interface detected, preparing to respond...');
    
    // Take screenshot of chatbot
    await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-chatbot-detected.png`) });
    
    // Wait for questions to load
    await page.waitForTimeout(2000);
    
    // Process each question in the chatbot
    let questionsRemaining = true;
    let questionCount = 0;
    
    while (questionsRemaining && questionCount < 10) { // Safety limit
      // Try each question selector
      let questionElement = null;
      
      for (const selector of SELECTORS.chatbot.questions) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          questionElement = element;
          console.log(`Found question with selector: ${selector}`);
          break;
        }
      }
      
      if (!questionElement || await questionElement.count() === 0) {
        console.log('No more questions to answer');
        questionsRemaining = false;
        continue;
      }
      
      // Get the question text
      const questionText = await questionElement.innerText();
      console.log(`Question ${questionCount + 1}: ${questionText}`);
      
      // Get AI response
      const response = await getResponseFromGemini(questionText, options.geminiApiKey);
      console.log(`Response: ${response}`);
      
      // Take screenshot before attempting to answer
      await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-question-${questionCount + 1}.png`) });
      
      // Find input field
      let inputField = null;
      for (const selector of SELECTORS.chatbot.inputFields) {
        const field = page.locator(selector).first();
        if (await field.count() > 0 && await field.isVisible()) {
          inputField = field;
          console.log(`Found input field with selector: ${selector}`);
          break;
        }
      }
      
      if (inputField && await inputField.count() > 0) {
        // Clear any existing text
        await inputField.click();
        await inputField.fill('');
        
        // Type the response with small delays to appear more human-like
        await inputField.focus();
        await page.keyboard.type(response, { delay: 10 });
        
        // Find submit button
        let submitButton = null;
        for (const selector of SELECTORS.chatbot.submitButtons) {
          const button = page.locator(selector).first();
          if (await button.count() > 0 && await button.isVisible()) {
            submitButton = button;
            console.log(`Found submit button with selector: ${selector}`);
            break;
          }
        }
        
        // Submit answer
        if (submitButton && await submitButton.count() > 0) {
          await submitButton.click();
          console.log('Answer submitted successfully');
        } else {
          // If no button found, try pressing Enter key as many chat interfaces accept this
          console.log('No submit button found, trying Enter key');
          await page.keyboard.press('Enter');
        }
        
        // Wait for processing and take a screenshot after submission
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-answer-${questionCount + 1}.png`) });
      } else {
        console.log('Could not find input field to answer question');
        await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-no-input-field-${questionCount + 1}.png`) });
        questionsRemaining = false;
      }
      
      questionCount++;
    }
    
    console.log(`Answered ${questionCount} questions in the chatbot`);
    return { 
      questionsAnswered: questionCount, 
      completed: !questionsRemaining,
      lastMessage: `Completed ${questionCount} interactions with the chatbot`
    };
    
  } catch (error: any) {
    console.error('Error handling chatbot:', error.message || error);
    return { 
      questionsAnswered: 0, 
      completed: false, 
      lastMessage: `Error: ${error.message || 'Unknown error'}`
    };
  }
}
