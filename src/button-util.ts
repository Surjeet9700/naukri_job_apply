// Specialized button click handling utilities

import { Page } from 'playwright';
import path from 'path';
import { ClickResult } from './types';

export async function clickApplyButton(
  page: Page, 
  selectors: string[],
  screenshotDir: string, 
  timestamp: string,
  debug: boolean = false
): Promise<ClickResult> {
  try {
    // Take screenshot before attempting to click
    await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-before-click.png`) });
    
    if (debug) {
      const buttonDetails = await analyzeApplyButton(page, selectors);
      console.log('Button analysis:', buttonDetails);
    }
    
    // Try each selector in priority order
    for (const selector of selectors) {
      try {
        const button = page.locator(selector).first();
        const count = await button.count();
        
        if (count > 0 && await button.isVisible()) {
          // Try standard click first
          try {
            await button.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            await button.click({ timeout: 5000 });
            
            // Create screenshot after click
            await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-after-click.png`) });
            return { success: true, method: 'standard', message: `Clicked button using selector: ${selector}` };
          } catch (clickErr: any) {
            console.log(`Standard click failed on ${selector}: ${clickErr.message}`);
            
            // Try forced click if standard click failed
            try {
              await button.click({ force: true, timeout: 5000 });
              await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-after-force-click.png`) });
              return { success: true, method: 'forced', message: `Clicked button using forced click: ${selector}` };
            } catch (forceErr: any) {
              console.log(`Forced click failed on ${selector}: ${forceErr.message}`);
            }
          }
        }
      } catch (selectorErr: any) {
        if (debug) {
          console.log(`Error with selector ${selector}: ${selectorErr.message}`);
        }
      }
    }
    
    // If normal clicks failed, try JavaScript click
    const jsClickResult = await executeJavaScriptClick(page, selectors);
    if (jsClickResult.success) {
      await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-after-js-click.png`) });
      return jsClickResult;
    }
    
    await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-click-failed.png`) });
    return { success: false, message: 'Failed to click apply button with any method' };
  } catch (error: any) {
    console.error('Error in clickApplyButton:', error.message || error);
    return { success: false, message: `Error: ${error.message || 'Unknown error'}` };
  }
}

async function executeJavaScriptClick(page: Page, selectors: string[]): Promise<ClickResult> {
  try {
    const result = await page.evaluate((sels) => {
      for (const selector of sels) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          if (element instanceof HTMLElement) {
            // Check if the element is visible
            const rect = element.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0 && 
                             window.getComputedStyle(element).display !== 'none' &&
                             window.getComputedStyle(element).visibility !== 'hidden';
            
            if (isVisible) {
              element.click();
              return { clicked: true, selector };
            }
          }
        }
      }
      
      // Special case for the exact button we're targeting
      const exactButton = document.querySelector('button#apply-button.styles_apply-button__uJI3A.apply-button');
      if (exactButton instanceof HTMLElement) {
        exactButton.click();
        return { clicked: true, selector: 'exact button target' };
      }
      
      return { clicked: false };
    }, selectors);
    
    if (result.clicked) {
      return { 
        success: true, 
        method: 'javascript', 
        message: `Clicked button using JavaScript: ${result.selector}` 
      };
    }
    
    return { success: false, message: 'JavaScript click failed' };
  } catch (error: any) {
    console.error('JavaScript click error:', error.message || error);
    return { success: false, message: `JavaScript error: ${error.message || 'Unknown error'}` };
  }
}

async function analyzeApplyButton(page: Page, selectors: string[]): Promise<string[]> {
  const results: string[] = [];
  
  // Check for buttons using each selector
  for (const selector of selectors) {
    try {
      const count = await page.locator(selector).count();
      if (count > 0) {
        results.push(`Found ${count} element(s) matching: ${selector}`);
        
        const firstElement = page.locator(selector).first();
        const isVisible = await firstElement.isVisible();
        
        results.push(`- Element visible: ${isVisible}`);
        
        if (isVisible) {
          const box = await firstElement.boundingBox();
          if (box) {
            results.push(`- Position: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
          }
          
          try {
            const text = await firstElement.textContent();
            results.push(`- Text: "${text?.trim() || 'empty'}"`);
          } catch (err: any) {
            results.push(`- Could not get text: ${err.message}`);
          }
        }
      }
    } catch (err: any) {
      results.push(`Error analyzing selector ${selector}: ${err.message}`);
    }
  }
  
  // Also check for any button with "Apply" text
  try {
    const applyButtons = await page.$$('button');
    let foundApplyText = false;
    
    for (const button of applyButtons) {
      try {
        const text = await button.textContent();
        if (text && text.toLowerCase().includes('apply')) {
          const isVisible = await button.isVisible();
          results.push(`Found button with "Apply" text: "${text.trim()}", visible: ${isVisible}`);
          foundApplyText = true;
        }
      } catch (err: any) {
        // Ignore errors for individual buttons
      }
    }
    
    if (!foundApplyText) {
      results.push('No buttons with "Apply" text found');
    }
  } catch (err: any) {
    results.push(`Error finding Apply buttons: ${err.message}`);
  }
  
  return results;
}
