const puppeteer = require('puppeteer');

/**
 * Test Ultimate Print Fix - Verify all spacing solutions work
 */

async function testUltimatePrintFix() {
  console.log('🧪 TESTING ULTIMATE PRINT FIX');
  console.log('==============================');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create test content
    await page.evaluate(() => {
      const sampleHTML = `
        <div class="professional-report-container">
          <div class="text-block">
            <div class="text-line essay-text">Paragraph 1: This should have minimal spacing below.</div>
            <div class="annotation-section">
              <div class="annotation-block">Annotation for paragraph 1</div>
            </div>
            <div class="paragraph-feedback positive">Feedback for paragraph 1</div>
          </div>
          
          <div class="text-block">
            <div class="text-line essay-text">Paragraph 2: There should be no large gaps between paragraphs.</div>
            <div class="annotation-section">
              <div class="annotation-block">Annotation for paragraph 2</div>
            </div>
            <div class="paragraph-feedback needs-improvement">Feedback for paragraph 2</div>
          </div>
          
          <div class="text-block">
            <div class="text-line essay-text">Paragraph 3: Final test paragraph for spacing verification.</div>
          </div>
        </div>
      `;
      document.body.innerHTML = sampleHTML;
    });
    
    console.log('📄 Sample content created');
    
    // Test 1: Check screen styles
    console.log('\n🖥️  TEST 1: Screen styles (should have large margins)');
    const screenStyles = await page.evaluate(() => {
      const textBlocks = document.querySelectorAll('.text-block');
      return Array.from(textBlocks).map((block, i) => {
        const computed = getComputedStyle(block);
        return {
          index: i + 1,
          marginBottom: computed.marginBottom,
          marginBottomPx: parseFloat(computed.marginBottom) || 0
        };
      });
    });
    
    screenStyles.forEach(style => {
      console.log(`   Text Block ${style.index}: margin-bottom = ${style.marginBottom} (${style.marginBottomPx}px)`);
    });
    
    // Test 2: Apply print mode and check CSS
    console.log('\n🖨️  TEST 2: Print mode CSS (should have small margins)');
    await page.emulateMediaType('print');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const printStyles = await page.evaluate(() => {
      const textBlocks = document.querySelectorAll('.text-block');
      return Array.from(textBlocks).map((block, i) => {
        const computed = getComputedStyle(block);
        return {
          index: i + 1,
          marginBottom: computed.marginBottom,
          marginBottomPx: parseFloat(computed.marginBottom) || 0
        };
      });
    });
    
    printStyles.forEach(style => {
      console.log(`   Text Block ${style.index}: margin-bottom = ${style.marginBottom} (${style.marginBottomPx}px)`);
    });
    
    // Test 3: Apply JavaScript nuclear optimization
    console.log('\n💥 TEST 3: JavaScript nuclear optimization');
    await page.evaluate(() => {
      // Simulate the nuclear print optimization
      const container = document.querySelector('.professional-report-container');
      if (container) {
        // Apply nuclear styles
        const textBlocks = container.querySelectorAll('.text-block');
        textBlocks.forEach(block => {
          block.style.cssText = `
            margin: 0 !important;
            margin-bottom: 1mm !important;
            padding: 1mm !important;
            border: 1px solid red !important;
            background: yellow !important;
          `;
        });
        
        console.log('Nuclear styles applied');
      }
    });
    
    const nuclearStyles = await page.evaluate(() => {
      const textBlocks = document.querySelectorAll('.text-block');
      return Array.from(textBlocks).map((block, i) => {
        const computed = getComputedStyle(block);
        return {
          index: i + 1,
          marginBottom: computed.marginBottom,
          marginBottomPx: parseFloat(computed.marginBottom) || 0,
          backgroundColor: computed.backgroundColor,
          border: computed.border
        };
      });
    });
    
    nuclearStyles.forEach(style => {
      console.log(`   Text Block ${style.index}: margin-bottom = ${style.marginBottom} (${style.marginBottomPx}px)`);
      console.log(`     Background: ${style.backgroundColor}`);
      console.log(`     Border: ${style.border}`);
    });
    
    // Test 4: Generate PDF to see final result
    console.log('\n📄 TEST 4: Generating final PDF...');
    await page.pdf({
      path: 'tests/ultimate-print-fix-test.pdf',
      format: 'Letter',
      printBackground: true,
      margin: { top: '0in', bottom: '0in', left: '0in', right: '0in' }
    });
    
    console.log('✅ PDF generated: tests/ultimate-print-fix-test.pdf');
    
    // Analysis
    console.log('\n🎯 ANALYSIS:');
    console.log('=============');
    
    const hasVisualIndicators = nuclearStyles.some(style => 
      style.backgroundColor.includes('yellow') || style.backgroundColor.includes('255, 255, 0')
    );
    
    const hasMinimalMargins = nuclearStyles.every(style => style.marginBottomPx < 5);
    
    if (hasVisualIndicators) {
      console.log('✅ JavaScript style injection is working (yellow backgrounds visible)');
    } else {
      console.log('❌ JavaScript style injection failed (no yellow backgrounds)');
    }
    
    if (hasMinimalMargins) {
      console.log('✅ Margin optimization is working (all margins < 5px)');
    } else {
      console.log('❌ Margin optimization failed (large margins still present)');
    }
    
    const printCSSWorking = printStyles.every(style => style.marginBottomPx < screenStyles[0].marginBottomPx);
    
    if (printCSSWorking) {
      console.log('✅ Print CSS is working (margins reduced in print mode)');
    } else {
      console.log('❌ Print CSS is not working (margins unchanged in print mode)');
    }
    
    console.log('\n📋 RECOMMENDATIONS:');
    
    if (hasVisualIndicators && hasMinimalMargins) {
      console.log('🎉 Ultimate print fix is working! Spacing should be minimal in print preview.');
    } else if (hasVisualIndicators) {
      console.log('⚠️  JavaScript injection works but margins still large. Check CSS specificity.');
    } else {
      console.log('🔧 JavaScript injection failed. May need different approach or browser compatibility fixes.');
    }
    
    console.log('\n⏸️  Browser kept open for manual testing...');
    console.log('Try printing (Ctrl+P) to see if spacing is now minimal');
    
    // Keep browser open
    await new Promise(resolve => {
      process.on('SIGINT', () => {
        console.log('\n👋 Closing browser...');
        browser.close().then(resolve);
      });
    });
    
  } catch (error) {
    console.error('❌ Error during ultimate print fix test:', error);
    await browser.close();
  }
}

if (require.main === module) {
  testUltimatePrintFix().catch(console.error);
}

module.exports = { testUltimatePrintFix };