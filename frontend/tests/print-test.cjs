const puppeteer = require('puppeteer');

/**
 * Print Test Suite - Automated testing of CSS fixes for print spacing
 * 
 * This script tests different CSS approaches to fix print spacing issues
 * and generates comparison PDFs to verify improvements.
 */

async function testPrintFixes() {
  console.log('🧪 Starting print CSS fix testing...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 50
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    console.log('📍 Navigating to application...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we have a professional report
    const hasReport = await page.evaluate(() => {
      return document.querySelector('.professional-report-container') !== null;
    });
    
    if (!hasReport) {
      console.log('⚠️  No professional report found on current page');
      console.log('💡 Please navigate to a page with evaluation results first');
      await browser.close();
      return;
    }
    
    // Switch to print media mode
    console.log('🖨️  Switching to print media mode...');
    await page.emulateMediaType('print');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate baseline PDF
    console.log('📄 Generating baseline PDF (before fixes)...');
    await page.pdf({
      path: 'frontend/tests/print-baseline.pdf',
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
    });
    console.log('✅ Baseline PDF saved');
    
    // Test different CSS fix approaches
    const testCases = [
      {
        name: 'Universal Margin Reset',
        description: 'Reset all margins within professional report container',
        css: `
          @media print {
            .professional-report-container * {
              margin: 0 !important;
            }
            .professional-report-container .header,
            .professional-report-container .legend,
            .professional-report-container .essay-container,
            .professional-report-container .score-summary {
              margin-bottom: 0.1rem !important;
            }
          }
        `
      },
      {
        name: 'Targeted Element Reset',
        description: 'Target specific spacing elements with high specificity',
        css: `
          @media print {
            .professional-report-container .text-block,
            .professional-report-container div.text-block,
            div.professional-report-container .text-block {
              margin: 0 !important;
              margin-bottom: 0.05rem !important;
              padding: 0.1rem !important;
            }
            .professional-report-container .annotation-section,
            .professional-report-container div.annotation-section {
              margin: 0 !important;
              margin-bottom: 0.05rem !important;
            }
            .professional-report-container .paragraph-feedback,
            .professional-report-container div.paragraph-feedback {
              margin: 0 !important;
              margin-bottom: 0.05rem !important;
            }
          }
        `
      },
      {
        name: 'Flexbox Container Approach',
        description: 'Use flexbox with gap instead of margins',
        css: `
          @media print {
            .professional-report-container .essay-container {
              display: flex !important;
              flex-direction: column !important;
              gap: 0.1rem !important;
            }
            .professional-report-container .text-block {
              margin: 0 !important;
              padding: 0.1rem !important;
            }
            .professional-report-container .annotation-section {
              margin: 0 !important;
            }
            .professional-report-container .paragraph-feedback {
              margin: 0 !important;
            }
          }
        `
      },
      {
        name: 'CSS Transform Approach',
        description: 'Use transform to pull elements closer together',
        css: `
          @media print {
            .professional-report-container .text-block {
              margin-bottom: 0 !important;
              transform: translateY(-1rem) !important;
            }
            .professional-report-container .text-block:first-child {
              transform: none !important;
            }
            .professional-report-container .annotation-section {
              margin: 0 !important;
              transform: translateY(-0.5rem) !important;
            }
          }
        `
      },
      {
        name: 'Inline Style Override',
        description: 'Inject inline styles directly to elements',
        css: null, // Special case - will use JavaScript injection
        isInlineInjection: true
      }
    ];
    
    // Test each approach
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n🔬 Testing: ${testCase.name}`);
      console.log(`   ${testCase.description}`);
      
      // Create a new page for each test to avoid CSS conflicts
      const testPage = await browser.newPage();
      await testPage.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      await testPage.emulateMediaType('print');
      
      if (testCase.isInlineInjection) {
        // Special case: inject inline styles using JavaScript
        await testPage.evaluate(() => {
          // Remove all margins using inline styles
          const textBlocks = document.querySelectorAll('.text-block');
          const annotationSections = document.querySelectorAll('.annotation-section');
          const paragraphFeedbacks = document.querySelectorAll('.paragraph-feedback');
          
          [...textBlocks, ...annotationSections, ...paragraphFeedbacks].forEach(el => {
            el.style.margin = '0';
            el.style.marginBottom = '0.05rem';
            el.style.padding = '0.1rem';
          });
        });
      } else {
        // Inject CSS
        await testPage.addStyleTag({ content: testCase.css });
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate test PDF
      const filename = `frontend/tests/print-test-${i + 1}-${testCase.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      await testPage.pdf({
        path: filename,
        format: 'Letter',
        printBackground: true,
        margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
      });
      
      console.log(`   ✅ Generated: ${filename}`);
      
      // Analyze the results
      const spacingAnalysis = await testPage.evaluate(() => {
        const textBlocks = document.querySelectorAll('.text-block');
        let totalSpacing = 0;
        let elementCount = 0;
        
        textBlocks.forEach(el => {
          const computed = getComputedStyle(el);
          const marginBottom = parseFloat(computed.marginBottom) || 0;
          const marginTop = parseFloat(computed.marginTop) || 0;
          totalSpacing += marginBottom + marginTop;
          elementCount++;
        });
        
        return {
          averageSpacing: elementCount > 0 ? totalSpacing / elementCount : 0,
          totalSpacing: totalSpacing,
          elementCount: elementCount
        };
      });
      
      console.log(`   📊 Average spacing per element: ${spacingAnalysis.averageSpacing.toFixed(2)}px`);
      console.log(`   📊 Total spacing: ${spacingAnalysis.totalSpacing.toFixed(2)}px across ${spacingAnalysis.elementCount} elements`);
      
      await testPage.close();
    }
    
    console.log('\n📑 All test PDFs generated in frontend/tests/');
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Open the generated PDFs to compare spacing');
    console.log('2. Identify which approach works best');
    console.log('3. Apply the winning CSS to professional-report-styles.css');
    console.log('4. Run this test again to verify the fix');
    
    console.log('\n📁 Generated files:');
    console.log('- print-baseline.pdf (original spacing issues)');
    testCases.forEach((testCase, i) => {
      const filename = `print-test-${i + 1}-${testCase.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      console.log(`- ${filename} (${testCase.name})`);
    });
    
  } catch (error) {
    console.error('❌ Error during print testing:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 Print testing complete!');
  }
}

/**
 * Quick test function to verify a specific CSS fix
 */
async function quickPrintTest(customCSS) {
  console.log('⚡ Running quick print test...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    
    if (customCSS) {
      await page.addStyleTag({ content: customCSS });
    }
    
    await page.pdf({
      path: 'frontend/tests/quick-test.pdf',
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
    });
    
    console.log('✅ Quick test PDF generated: frontend/tests/quick-test.pdf');
  } catch (error) {
    console.error('❌ Quick test error:', error);
  } finally {
    await browser.close();
  }
}

// Run the test suite
if (require.main === module) {
  testPrintFixes().catch(console.error);
}

module.exports = { testPrintFixes, quickPrintTest };