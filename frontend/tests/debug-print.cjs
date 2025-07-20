const puppeteer = require('puppeteer');

/**
 * Debug Print Spacing - Diagnostic tool for print CSS issues
 * 
 * This script analyzes the computed styles of spacing elements in print mode
 * to identify exactly which CSS rules are causing large blank spaces.
 */

async function debugPrintSpacing() {
  console.log('🔍 Starting print spacing diagnostics...');
  
  const browser = await puppeteer.launch({ 
    headless: false,  // Show browser for debugging
    slowMo: 100       // Slow down for visibility
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    console.log('📍 Navigating to application...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Wait for the page to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we can find evaluation results or need to create them
    console.log('🔎 Looking for professional report elements...');
    
    // Try to find existing evaluation results or professional report
    const hasReport = await page.evaluate(() => {
      return document.querySelector('.professional-report-container') !== null;
    });
    
    if (!hasReport) {
      console.log('⚠️  No professional report found on current page');
      console.log('💡 Please navigate to a page with evaluation results and run this script again');
      console.log('   Or modify this script to automate the navigation to a report page');
      await browser.close();
      return;
    }
    
    // Switch to print media mode
    console.log('🖨️  Switching to print media mode...');
    await page.emulateMediaType('print');
    
    // Wait for print styles to apply
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Analyze spacing elements
    console.log('📊 Analyzing spacing elements...');
    
    const spacingAnalysis = await page.evaluate(() => {
      // Helper function to get detailed style info
      function getDetailedStyles(element, selector) {
        const computed = getComputedStyle(element);
        return {
          selector: selector,
          className: element.className,
          tagName: element.tagName,
          marginTop: computed.marginTop,
          marginBottom: computed.marginBottom,
          marginLeft: computed.marginLeft,
          marginRight: computed.marginRight,
          paddingTop: computed.paddingTop,
          paddingBottom: computed.paddingBottom,
          height: computed.height,
          minHeight: computed.minHeight,
          display: computed.display,
          position: computed.position,
          boxSizing: computed.boxSizing
        };
      }
      
      const analysis = {
        container: null,
        textBlocks: [],
        annotationSections: [],
        paragraphFeedbacks: [],
        essayContainer: null,
        allElementsWithMargin: []
      };
      
      // Analyze main container
      const container = document.querySelector('.professional-report-container');
      if (container) {
        analysis.container = getDetailedStyles(container, '.professional-report-container');
      }
      
      // Analyze text blocks
      const textBlocks = document.querySelectorAll('.text-block');
      textBlocks.forEach((el, i) => {
        analysis.textBlocks.push(getDetailedStyles(el, `.text-block:nth-child(${i + 1})`));
      });
      
      // Analyze annotation sections
      const annotationSections = document.querySelectorAll('.annotation-section');
      annotationSections.forEach((el, i) => {
        analysis.annotationSections.push(getDetailedStyles(el, `.annotation-section:nth-child(${i + 1})`));
      });
      
      // Analyze paragraph feedback
      const paragraphFeedbacks = document.querySelectorAll('.paragraph-feedback');
      paragraphFeedbacks.forEach((el, i) => {
        analysis.paragraphFeedbacks.push(getDetailedStyles(el, `.paragraph-feedback:nth-child(${i + 1})`));
      });
      
      // Analyze essay container
      const essayContainer = document.querySelector('.essay-container');
      if (essayContainer) {
        analysis.essayContainer = getDetailedStyles(essayContainer, '.essay-container');
      }
      
      // Find ALL elements with significant margins
      const allElements = document.querySelectorAll('.professional-report-container *');
      allElements.forEach((el, i) => {
        const computed = getComputedStyle(el);
        const marginBottomPx = parseFloat(computed.marginBottom);
        const marginTopPx = parseFloat(computed.marginTop);
        
        // Flag elements with margins > 10px as potentially problematic
        if (marginBottomPx > 10 || marginTopPx > 10) {
          analysis.allElementsWithMargin.push({
            index: i,
            element: el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : ''),
            marginTop: computed.marginTop,
            marginBottom: computed.marginBottom,
            marginTopPx: marginTopPx,
            marginBottomPx: marginBottomPx
          });
        }
      });
      
      return analysis;
    });
    
    // Display results
    console.log('\n📋 PRINT SPACING ANALYSIS RESULTS');
    console.log('=====================================');
    
    if (spacingAnalysis.container) {
      console.log('\n🏠 Container (.professional-report-container):');
      console.log(`   Margin Bottom: ${spacingAnalysis.container.marginBottom}`);
      console.log(`   Padding: ${spacingAnalysis.container.paddingTop} ${spacingAnalysis.container.paddingBottom}`);
    }
    
    console.log('\n📄 Text Blocks (.text-block):');
    spacingAnalysis.textBlocks.forEach((block, i) => {
      console.log(`   Block ${i + 1}:`);
      console.log(`     Margin Bottom: ${block.marginBottom}`);
      console.log(`     Margin Top: ${block.marginTop}`);
      console.log(`     Padding: ${block.paddingTop} / ${block.paddingBottom}`);
    });
    
    console.log('\n📝 Annotation Sections (.annotation-section):');
    spacingAnalysis.annotationSections.forEach((section, i) => {
      console.log(`   Section ${i + 1}:`);
      console.log(`     Margin Bottom: ${section.marginBottom}`);
      console.log(`     Margin Top: ${section.marginTop}`);
    });
    
    console.log('\n💬 Paragraph Feedback (.paragraph-feedback):');
    spacingAnalysis.paragraphFeedbacks.forEach((feedback, i) => {
      console.log(`   Feedback ${i + 1}:`);
      console.log(`     Margin Bottom: ${feedback.marginBottom}`);
      console.log(`     Margin Top: ${feedback.marginTop}`);
    });
    
    console.log('\n🚨 ELEMENTS WITH LARGE MARGINS (>10px):');
    if (spacingAnalysis.allElementsWithMargin.length === 0) {
      console.log('   ✅ No elements found with margins >10px');
    } else {
      spacingAnalysis.allElementsWithMargin.forEach((el, i) => {
        console.log(`   ${i + 1}. ${el.element}:`);
        console.log(`      Margin Top: ${el.marginTop} (${el.marginTopPx}px)`);
        console.log(`      Margin Bottom: ${el.marginBottom} (${el.marginBottomPx}px)`);
      });
    }
    
    // Generate a diagnostic PDF
    console.log('\n📑 Generating diagnostic PDF...');
    await page.pdf({
      path: 'frontend/tests/diagnostic-print.pdf',
      format: 'Letter',
      printBackground: true,
      margin: { 
        top: '0.5in', 
        bottom: '0.5in', 
        left: '0.5in', 
        right: '0.5in' 
      }
    });
    console.log('✅ Diagnostic PDF saved as: frontend/tests/diagnostic-print.pdf');
    
    console.log('\n🎯 RECOMMENDATIONS:');
    
    // Provide specific recommendations based on findings
    const problematicElements = spacingAnalysis.allElementsWithMargin.filter(el => 
      el.marginBottomPx > 20 || el.marginTopPx > 20
    );
    
    if (problematicElements.length > 0) {
      console.log('   🔴 Found elements with large margins that need CSS overrides:');
      problematicElements.forEach(el => {
        console.log(`   - ${el.element}: needs margin reset in print CSS`);
      });
    } else {
      console.log('   🤔 No obvious large margins found. The issue might be:');
      console.log('   - CSS specificity problems');
      console.log('   - Print CSS not loading properly');
      console.log('   - Browser-specific print handling');
    }
    
    return spacingAnalysis;
    
  } catch (error) {
    console.error('❌ Error during print analysis:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 Print spacing analysis complete!');
  }
}

// Run the analysis
if (require.main === module) {
  debugPrintSpacing().catch(console.error);
}

module.exports = { debugPrintSpacing };