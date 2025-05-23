// Enhanced apply button detection and clicking for Naukri job application
import { Page } from 'playwright';
import path from 'path';

// This function detects and provides information about apply buttons on the page
export async function detectApplyButton(page: Page): Promise<string[]> {
  console.log('Scanning for apply buttons on the page...');
  
  const detectionResults: string[] = [];
  
  try {
    // Check for the specific button structure
    const specificSelectors = [
      'button#apply-button.styles_apply-button__uJI3A.apply-button',
      'button#apply-button.apply-button',
      'button#apply-button',
      '.apply-button',
      'button[id="apply-button"]',
    ];
    
    for (const selector of specificSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        detectionResults.push(`Found ${count} button(s) matching selector: ${selector}`);
        
        // For the first element, get some details
        const firstElement = page.locator(selector).first();
        if (await firstElement.isVisible()) {
          detectionResults.push(`- First match is visible`);
        } else {
          detectionResults.push(`- First match is not visible`);
        }
        
        try {
          const box = await firstElement.boundingBox();
          if (box) {
            detectionResults.push(`- Position: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
          } else {
            detectionResults.push(`- No bounding box available`);
          }
        } catch (e: any) {
          detectionResults.push(`- Error getting bounding box: ${e.message}`);
        }
      }
    }
    
    // Check all buttons on page for those containing "Apply" text
    const allButtons = await page.$$('button');
    let applyTextButtons = 0;
    
    for (const button of allButtons) {
      try {
        const buttonText = await button.textContent();
        if (buttonText && buttonText.toLowerCase().includes('apply')) {
          applyTextButtons++;
          const isVisible = await button.isVisible();
          detectionResults.push(`Found button with Apply text: "${buttonText.trim()}", visible: ${isVisible}`);
        }
      } catch (e: any) {
        // Skip button on error
      }
    }
    
    if (applyTextButtons === 0) {
      detectionResults.push('No buttons with "Apply" text found on the page');
    }
    
    // Check using JavaScript evaluation
    const jsEvalResults = await page.evaluate(() => {
      const results: string[] = [];
      
      // Check for exact button structure
      const exactButton = document.querySelector('button#apply-button.styles_apply-button__uJI3A.apply-button');
      if (exactButton) {
        results.push('✓ Found exact button structure with DOM query');
        
        // Check if it's visible
        const rect = (exactButton as HTMLElement).getBoundingClientRect();
        if (rect.height > 0 && rect.width > 0) {
          results.push('✓ Button has non-zero dimensions in DOM');
        } else {
          results.push('✗ Button has zero dimensions in DOM');
        }
        
        // Check computed style
        const style = window.getComputedStyle(exactButton);
        if (style.display === 'none' || style.visibility === 'hidden') {
          results.push('✗ Button is hidden via CSS');
        } else {
          results.push('✓ Button appears to be visible via CSS');
        }
      } else {
        results.push('✗ Could not find exact button structure with DOM query');
      }
      
      return results;
    });
    
    detectionResults.push(...jsEvalResults);
    
  } catch (error: any) {
    detectionResults.push(`Error during button detection: ${error.message}`);
  }
  
  return detectionResults;
}

// This function specifically targets the apply button with the exact structure provided
export async function enhancedApplyButtonClick(
  page: Page,
  screenshotDir: string,
  timestamp: string
): Promise<boolean> {
  console.log('Using enhanced apply button detection...');
  await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-enhanced-apply-start.png`) });
  // Target specific selectors based on the exact HTML structure found on Naukri
  const specificSelectors = [
    // Exact match from the user's input - highest priority
    'button#apply-button.styles_apply-button__uJI3A.apply-button',
    // Direct combinations of ID and key classes
    'button#apply-button.apply-button',
    'button.styles_apply-button__uJI3A.apply-button', 
    // Specific parts of the selector
    'button.styles_apply-button__uJI3A',
    'button#apply-button',
    '.apply-button',
    // Generic apply button selectors as fallbacks
    'button[id="apply-button"]',
    'button:has-text("Apply")',
    'button:has-text("I am interested")'
  ];

  let clickResult = false;

  // Step 1: Try direct selector match
  for (const selector of specificSelectors) {
    try {
      console.log(`Trying selector: ${selector}`);
      const button = page.locator(selector).first();
      
      if (await button.count() > 0) {
        const isVisible = await button.isVisible();
        console.log(`Found button with selector: ${selector}, visible: ${isVisible}`);
        
        if (isVisible) {
          // Scroll button into view
          await button.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          
          // Take screenshot with button in view
          await page.screenshot({ 
            path: path.join(screenshotDir, `${timestamp}-button-found-${selector.replace(/[^\w-]/g, '-')}.png`)
          });
            try {
            // Try standard click
            console.log(`Attempting standard click on ${selector}`);
            await button.click({ force: true, timeout: 10000 });
            console.log(`Successfully clicked button with selector: ${selector}`);
            clickResult = true;
            break;
          } catch (clickError: any) {
            console.log(`Standard click failed on ${selector}: ${clickError.message}`);
            
            // Try JavaScript click as fallback
            try {
              console.log(`Trying JavaScript click for ${selector}`);
              await page.evaluate((sel) => {
                const elements = document.querySelectorAll(sel);
                if (elements.length > 0) {
                  (elements[0] as HTMLElement).click();
                  return true;
                }
                return false;
              }, selector);
              console.log(`JavaScript click executed for ${selector}`);
              clickResult = true;
              break;            } catch (jsClickError: any) {
              console.log(`JavaScript click failed for ${selector}: ${jsClickError.message}`);
            }
          }
        }
      }    } catch (error: any) {
      console.log(`Error trying selector ${selector}: ${error.message}`);
    }
  }

  // Special case: Try a direct, specific approach for the exact button structure
  // provided by the user if other methods failed
  if (!clickResult) {
    console.log('Trying direct DOM manipulation for the exact Naukri button structure...');
    
    try {
      // Execute a targeted script that specifically looks for this button structure
      const exactMatchResult = await page.evaluate(() => {
        // Look specifically for the button with this exact class and id structure
        const exactApplyButton = document.querySelector('button#apply-button.styles_apply-button__uJI3A.apply-button');
        
        if (exactApplyButton) {
          console.log('Found exact apply button match through direct DOM query');
          (exactApplyButton as HTMLElement).click();
          return { clicked: true, method: 'exact-dom-match' };
        }
        
        // Also try a broader approach with just ID and basic apply-button class
        const secondaryMatch = document.querySelector('button#apply-button.apply-button');
        if (secondaryMatch) {
          console.log('Found secondary apply button match');
          (secondaryMatch as HTMLElement).click();
          return { clicked: true, method: 'secondary-dom-match' };
        }
        
        return { clicked: false, method: 'none' };
      });
      
      if (exactMatchResult.clicked) {
        console.log(`Direct DOM manipulation successful with method: ${exactMatchResult.method}`);
        clickResult = true;
        
        // Take a screenshot to verify
        await page.screenshot({ 
          path: path.join(screenshotDir, `${timestamp}-exact-dom-match-success.png`)
        });
      }
    } catch (exactMatchError: any) {
      console.log(`Direct DOM manipulation failed: ${exactMatchError.message}`);
    }
  }

  // Step 2: If direct selectors fail, try a more aggressive approach
  if (!clickResult) {
    console.log('Direct selectors failed, trying more aggressive approaches...');
    
    // Try clicking any button with "Apply" text
    try {
      // Use a raw evaluation to find any apply button
      const result = await page.evaluate(() => {
        // Find all buttons on the page
        const buttons = Array.from(document.querySelectorAll('button'));
        
        // First try to find the exact button structure for the Naukri apply button
        const exactButton = buttons.find(btn => 
          btn.id === 'apply-button' && 
          (btn.className.includes('apply-button') || 
           btn.className.includes('styles_apply-button__uJI3A'))
        );
        
        if (exactButton) {
          (exactButton as HTMLElement).click();
          return { success: true, method: 'exact-match' };
        }
        
        // Try buttons with "Apply" text
        for (const button of buttons) {
          if (button.textContent && 
              button.textContent.toLowerCase().includes('apply') && 
              button.offsetParent !== null) {
            (button as HTMLElement).click();
            return { success: true, method: 'text-match' };
          }
        }
        
        // Try any button with apply-related classes
        for (const button of buttons) {
          if ((button.className.includes('apply') || 
               button.id.includes('apply')) && 
              button.offsetParent !== null) {
            (button as HTMLElement).click();
            return { success: true, method: 'class-match' };
          }
        }
        
        return { success: false, method: 'none' };
      });
      
      console.log(`JavaScript direct manipulation result: ${JSON.stringify(result)}`);
      if (result.success) {
        clickResult = true;
      }    } catch (evalError: any) {
      console.log(`JavaScript evaluation error: ${evalError.message}`);
    }
  }

  // Take screenshot after all attempts
  await page.screenshot({ path: path.join(screenshotDir, `${timestamp}-enhanced-apply-end.png`) });
  
  // Return whether any click attempt succeeded
  return clickResult;
}
