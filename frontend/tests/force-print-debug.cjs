const puppeteer = require('puppeteer');

/**
 * Force Print CSS Debug - Force print media and inspect exactly what's happening
 */

async function forcePrintDebug() {
  console.log('🔧 Force Print CSS Debug - Inspecting print styles in real-time...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,  // Open DevTools automatically
    slowMo: 100
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    console.log('📍 Navigating to application...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we have a professional report, if not, create some sample content
    const hasReport = await page.evaluate(() => {
      return document.querySelector('.professional-report-container') !== null;
    });
    
    if (!hasReport) {
      console.log('📝 Creating sample content for testing...');
      
      // Inject a sample professional report directly into the page
      await page.evaluate(() => {
        const sampleHTML = `
          <div class="professional-report-container">
            <div class="header">
              <h1>ISEE Upper Level</h1>
              <div class="prompt">Sample essay prompt for testing</div>
            </div>
            
            <div class="essay-container">
              <h2 class="essay-title">Student Essay</h2>
              
              <div class="text-block">
                <div class="text-line essay-text">
                  This is the first paragraph of the sample essay. It contains some text that we can use to test the spacing issues in print mode.
                </div>
                <div class="annotation-section">
                  <div class="annotation-block grammar-block">
                    <div class="annotation-header">Grammar & Mechanics</div>
                    <div>Sample annotation content here.</div>
                  </div>
                </div>
                <div class="paragraph-feedback positive">
                  <strong>Good structure:</strong> This paragraph demonstrates clear organization.
                </div>
              </div>
              
              <div class="text-block">
                <div class="text-line essay-text">
                  This is the second paragraph of the sample essay. We need to see what spacing appears between these paragraphs in print mode.
                </div>
                <div class="annotation-section">
                  <div class="annotation-block word-block">
                    <div class="annotation-header">Advanced Vocabulary</div>
                    <div>Another sample annotation.</div>
                  </div>
                </div>
                <div class="paragraph-feedback needs-improvement">
                  <strong>Development needed:</strong> This paragraph could be expanded.
                </div>
              </div>
              
              <div class="text-block">
                <div class="text-line essay-text">
                  This is the third paragraph to further test spacing between multiple text blocks.
                </div>
              </div>
            </div>
          </div>
        `;
        
        document.body.innerHTML = sampleHTML;
      });
      
      console.log('✅ Sample content created');
    }
    
    console.log('🎨 STEP 1: Analyzing SCREEN styles first...');
    
    // First, analyze screen styles
    const screenStyles = await page.evaluate(() => {
      const results = [];
      const textBlocks = document.querySelectorAll('.text-block');
      
      textBlocks.forEach((block, i) => {
        const computed = getComputedStyle(block);
        results.push({
          element: `text-block-${i + 1}`,
          marginTop: computed.marginTop,
          marginBottom: computed.marginBottom,
          padding: computed.padding,
          display: computed.display
        });
      });
      
      return results;
    });
    
    console.log('📊 Screen Styles:');
    screenStyles.forEach(style => {
      console.log(`   ${style.element}: margin-bottom=${style.marginBottom}, margin-top=${style.marginTop}`);
    });
    
    console.log('\n🖨️  STEP 2: Forcing PRINT media and analyzing...');
    
    // Force print media mode
    await page.emulateMediaType('print');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Now analyze print styles
    const printStyles = await page.evaluate(() => {
      const results = [];
      const textBlocks = document.querySelectorAll('.text-block');
      
      textBlocks.forEach((block, i) => {
        const computed = getComputedStyle(block);
        results.push({
          element: `text-block-${i + 1}`,
          marginTop: computed.marginTop,
          marginBottom: computed.marginBottom,
          padding: computed.padding,
          display: computed.display,
          marginTopPx: parseFloat(computed.marginTop) || 0,
          marginBottomPx: parseFloat(computed.marginBottom) || 0
        });
      });
      
      return results;
    });
    
    console.log('📊 Print Styles:');
    printStyles.forEach(style => {
      console.log(`   ${style.element}: margin-bottom=${style.marginBottom} (${style.marginBottomPx}px), margin-top=${style.marginTop} (${style.marginTopPx}px)`);
    });
    
    console.log('\n🔍 STEP 3: Analyzing CSS rule conflicts...');
    
    // Check which CSS rules are actually being applied
    const cssAnalysis = await page.evaluate(() => {
      const textBlock = document.querySelector('.text-block');
      if (!textBlock) return null;
      
      // Get all CSS rules that might apply to this element
      const matchedRules = [];
      
      // This is a simplified way to check - in real DevTools you'd see more detail
      const computed = getComputedStyle(textBlock);
      
      return {
        marginBottom: {
          value: computed.marginBottom,
          specificity: 'unknown - need DevTools inspection'
        },
        marginTop: {
          value: computed.marginTop,
          specificity: 'unknown - need DevTools inspection'
        },
        element: textBlock.className,
        tagName: textBlock.tagName
      };
    });
    
    console.log('🎯 CSS Analysis for first .text-block:');
    console.log(`   Class: ${cssAnalysis.element}`);
    console.log(`   Tag: ${cssAnalysis.tagName}`);
    console.log(`   Computed margin-bottom: ${cssAnalysis.marginBottom.value}`);
    console.log(`   Computed margin-top: ${cssAnalysis.marginTop.value}`);
    
    console.log('\n🧪 STEP 4: Testing CSS injection in print mode...');
    
    // Test injecting CSS in print mode
    await page.addStyleTag({
      content: `
        @media print {
          /* Ultra-high specificity test */
          .professional-report-container .text-block {
            margin-bottom: 0.05rem !important;
            background: yellow !important; /* Visual indicator */
            border: 2px solid red !important; /* Visual indicator */
          }
        }
      `
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if our injected styles are working
    const injectedStyles = await page.evaluate(() => {
      const textBlock = document.querySelector('.text-block');
      const computed = getComputedStyle(textBlock);
      
      return {
        marginBottom: computed.marginBottom,
        backgroundColor: computed.backgroundColor,
        borderColor: computed.borderColor,
        borderWidth: computed.borderWidth
      };
    });
    
    console.log('🧪 After CSS injection:');
    console.log(`   margin-bottom: ${injectedStyles.marginBottom}`);
    console.log(`   background: ${injectedStyles.backgroundColor}`);
    console.log(`   border: ${injectedStyles.borderWidth} ${injectedStyles.borderColor}`);
    
    if (injectedStyles.backgroundColor.includes('yellow') || injectedStyles.backgroundColor.includes('255, 255, 0')) {
      console.log('✅ CSS injection is working - we can see visual indicators');
    } else {
      console.log('❌ CSS injection may not be working - no visual indicators visible');
    }
    
    if (parseFloat(injectedStyles.marginBottom) < 5) {
      console.log('✅ Margin override is working');
    } else {
      console.log('❌ Margin override is NOT working - large margin still present');
    }
    
    console.log('\n📄 STEP 5: Generating test PDF...');
    
    // Generate PDF to see actual print output
    await page.pdf({
      path: 'tests/force-print-debug.pdf',
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
    });
    
    console.log('✅ PDF generated: frontend/tests/force-print-debug.pdf');
    
    console.log('\n🎯 ANALYSIS COMPLETE!');
    console.log('=====================================');
    
    // Compare screen vs print styles
    console.log('\n📊 COMPARISON:');
    for (let i = 0; i < Math.min(screenStyles.length, printStyles.length); i++) {
      const screen = screenStyles[i];
      const print = printStyles[i];
      
      console.log(`\n${screen.element}:`);
      console.log(`   Screen margin-bottom: ${screen.marginBottom}`);
      console.log(`   Print margin-bottom:  ${print.marginBottom}`);
      
      if (screen.marginBottom !== print.marginBottom) {
        console.log(`   ✅ Print CSS is changing styles`);
      } else {
        console.log(`   ❌ Print CSS is NOT changing styles`);
      }
      
      if (print.marginBottomPx > 20) {
        console.log(`   🚨 Large margin detected: ${print.marginBottomPx}px`);
      }
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    
    const hasLargeMargins = printStyles.some(style => style.marginBottomPx > 20);
    
    if (hasLargeMargins) {
      console.log('🔴 LARGE MARGINS FOUND in print mode');
      console.log('   - The spacing issue is confirmed');
      console.log('   - Our CSS overrides may not be specific enough');
      console.log('   - Check DevTools in print preview mode for conflicting rules');
    } else {
      console.log('🟢 No large margins in computed styles');
      console.log('   - The issue might be in PDF generation');
      console.log('   - Or there might be other spacing elements (padding, line-height, etc.)');
    }
    
    if (injectedStyles.backgroundColor.includes('yellow')) {
      console.log('✅ CSS injection works - we can apply fixes');
    } else {
      console.log('❌ CSS injection not working - deeper investigation needed');
    }
    
    console.log('\n🔧 DEVTOOLS INSTRUCTIONS:');
    console.log('1. The browser DevTools should be open');
    console.log('2. Go to the Elements tab');
    console.log('3. Find a .text-block element');
    console.log('4. In the Styles panel, look for margin-bottom rules');
    console.log('5. See which rules are being applied and which are crossed out');
    console.log('6. Check if print media queries are shown');
    
    console.log('\n⏸️  Browser kept open for manual inspection...');
    console.log('Press Ctrl+C to close when done inspecting');
    
    // Keep browser open for manual inspection
    await new Promise(resolve => {
      process.on('SIGINT', () => {
        console.log('\n👋 Closing browser...');
        browser.close().then(resolve);
      });
    });
    
  } catch (error) {
    console.error('❌ Error during force print debug:', error);
    await browser.close();
  }
}

// Run the analysis
if (require.main === module) {
  forcePrintDebug().catch(console.error);
}

module.exports = { forcePrintDebug };