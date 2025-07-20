const puppeteer = require('puppeteer');

/**
 * Create Sample Evaluation - Automate the creation of a professional report for testing
 */

async function createSampleEvaluation() {
  console.log('🎭 Creating sample evaluation for print testing...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    console.log('📍 Navigating to application...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fill in sample essay text
    console.log('✍️  Filling in sample essay...');
    
    const samplePrompt = "Describe a person who has impacted you and explain how they influenced you.";
    const sampleEssay = `One person who impacted me is my 7th grade science teacher called Mrs. Glover. She has helped me grow both as a student and a person. She helped me find my passion for science and helped me out in tough situations.

One example of when she helped me was during a science experiment where we had to combine Calcium Oxide and Calcium Chloride with water to generate heat and then mix potassium Chlorate and boiling soda to get the correct answers. However if we mixed Potassium chloride on its own, not doing that sounded simple there were no labels to tell us which one was which. When I asked her how we were supposed to tell us which one was which, she told me we were struggling and had issues figuring out which one was which. This helped me figure out which was which.

Mrs. Glover also understood why I was struggling and helped me to see that other students were still figuring out which was which too. Where another student and I were arguing, Mrs. Glover pulled us aside once set us down to ask why we were fighting over something trivial. I additionally realized that I respect and calmness were important for getting respect.`;

    // Wait for text areas to be available
    await page.waitForSelector('textarea');
    
    // Fill prompt field (optional field)
    const promptTextarea = await page.$('textarea[placeholder*="prompt"]');
    if (promptTextarea) {
      await promptTextarea.click();
      await promptTextarea.type(samplePrompt, { delay: 10 });
    }
    
    // Fill essay field
    const essayTextarea = await page.$('textarea[placeholder*="essay"]');
    if (essayTextarea) {
      await essayTextarea.click();
      await essayTextarea.type(sampleEssay, { delay: 5 });
    } else {
      // Try alternative selector
      const textareas = await page.$$('textarea');
      if (textareas.length > 1) {
        await textareas[1].click();
        await textareas[1].type(sampleEssay, { delay: 5 });
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Look for evaluate button
    console.log('🔍 Looking for evaluate button...');
    
    // Try different possible selectors for the evaluate button
    const buttonSelectors = [
      'button:contains("Evaluate")',
      'button[class*="evaluate"]',
      'button[class*="btn-primary"]',
      'button:has-text("Evaluate")',
      'text=Evaluate',
      'button >> text=Evaluate'
    ];
    
    let evaluateButton = null;
    for (const selector of buttonSelectors) {
      try {
        evaluateButton = await page.$(selector);
        if (evaluateButton) break;
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // If we can't find evaluate button, look for any button that might trigger evaluation
    if (!evaluateButton) {
      console.log('🔎 Looking for any evaluation-related buttons...');
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent?.toLowerCase() || '');
        if (text.includes('evaluat') || text.includes('analyz') || text.includes('submit')) {
          evaluateButton = button;
          console.log(`📍 Found potential button: "${text}"`);
          break;
        }
      }
    }
    
    if (evaluateButton) {
      console.log('🚀 Clicking evaluate button...');
      await evaluateButton.click();
      
      // Wait for evaluation to complete (this might take a while)
      console.log('⏳ Waiting for evaluation to complete...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Check if we have evaluation results
      const hasResults = await page.evaluate(() => {
        return document.querySelector('.professional-report-container') !== null ||
               document.querySelector('[class*="evaluation"]') !== null ||
               document.querySelector('[class*="result"]') !== null;
      });
      
      if (hasResults) {
        console.log('✅ Evaluation results generated successfully!');
        console.log('🎯 Professional report should now be available for print testing');
        
        // Keep browser open for manual inspection
        console.log('🔍 Browser kept open for inspection. Close manually when done.');
        console.log('💡 You can now run: npm run test:print-debug');
        
        // Don't close the browser - let user inspect
        return { success: true, browser };
      } else {
        console.log('❌ No evaluation results found after clicking evaluate');
        console.log('💡 You may need to manually navigate to create evaluation results');
      }
    } else {
      console.log('❌ Could not find evaluate button');
      console.log('💡 You may need to manually trigger evaluation and then run print tests');
    }
    
    return { success: false, browser };
    
  } catch (error) {
    console.error('❌ Error creating sample evaluation:', error);
    return { success: false, browser };
  }
}

// Run the sample creation
if (require.main === module) {
  createSampleEvaluation().catch(console.error);
}

module.exports = { createSampleEvaluation };