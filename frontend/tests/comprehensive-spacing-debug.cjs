const puppeteer = require('puppeteer');

/**
 * Comprehensive Spacing Debug - Check ALL elements that could cause spacing
 */

async function comprehensiveSpacingDebug() {
  console.log('🔍 COMPREHENSIVE SPACING DEBUG');
  console.log('===============================');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create comprehensive sample content
    await page.evaluate(() => {
      const sampleHTML = `
        <div class="professional-report-container">
          <div class="text-block">
            <div class="text-line essay-text">First paragraph text here.</div>
            <div class="annotation-section">
              <div class="annotation-block">Annotation content</div>
            </div>
            <div class="paragraph-feedback positive">
              <strong>Feedback:</strong> Good work.
            </div>
          </div>
          
          <div class="text-block">
            <div class="text-line essay-text">Second paragraph text here.</div>
            <div class="annotation-section">
              <div class="annotation-block">More annotation content</div>
            </div>
            <div class="paragraph-feedback needs-improvement">
              <strong>Needs work:</strong> Could improve.
            </div>
          </div>
          
          <div class="text-block">
            <div class="text-line essay-text">Third paragraph text here.</div>
          </div>
        </div>
      `;
      document.body.innerHTML = sampleHTML;
    });
    
    await page.emulateMediaType('print');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('📊 ANALYZING ALL SPACING ELEMENTS IN PRINT MODE:');
    console.log('================================================');
    
    const allSpacingData = await page.evaluate(() => {
      const results = {};
      
      // Helper function to get spacing info
      function getSpacingInfo(selector, description) {
        const elements = document.querySelectorAll(selector);
        const data = [];
        
        elements.forEach((el, i) => {
          const computed = getComputedStyle(el);
          data.push({
            index: i + 1,
            marginTop: computed.marginTop,
            marginBottom: computed.marginBottom,
            marginTopPx: parseFloat(computed.marginTop) || 0,
            marginBottomPx: parseFloat(computed.marginBottom) || 0,
            paddingTop: computed.paddingTop,
            paddingBottom: computed.paddingBottom,
            paddingTopPx: parseFloat(computed.paddingTop) || 0,
            paddingBottomPx: parseFloat(computed.paddingBottom) || 0,
            lineHeight: computed.lineHeight,
            height: computed.height,
            className: el.className
          });
        });
        
        return { description, selector, data };
      }
      
      // Check all potentially problematic elements
      results.textBlocks = getSpacingInfo('.text-block', 'Text Blocks');
      results.annotationSections = getSpacingInfo('.annotation-section', 'Annotation Sections');
      results.paragraphFeedbacks = getSpacingInfo('.paragraph-feedback', 'Paragraph Feedbacks');
      results.annotationBlocks = getSpacingInfo('.annotation-block', 'Annotation Blocks');
      results.textLines = getSpacingInfo('.text-line', 'Text Lines');
      results.essayText = getSpacingInfo('.essay-text', 'Essay Text');
      
      // Also check the container
      results.container = getSpacingInfo('.professional-report-container', 'Report Container');
      
      return results;
    });
    
    // Display comprehensive analysis
    Object.values(allSpacingData).forEach(category => {
      console.log(`\n📋 ${category.description} (${category.selector}):`);
      
      if (category.data.length === 0) {
        console.log('   ❌ No elements found');
        return;
      }
      
      category.data.forEach(item => {
        console.log(`\n   Element ${item.index}:`);
        console.log(`     Margins: top=${item.marginTop} (${item.marginTopPx}px), bottom=${item.marginBottom} (${item.marginBottomPx}px)`);
        console.log(`     Padding: top=${item.paddingTop} (${item.paddingTopPx}px), bottom=${item.paddingBottom} (${item.paddingBottomPx}px)`);
        console.log(`     Line Height: ${item.lineHeight}`);
        console.log(`     Height: ${item.height}`);
        
        // Flag problematic spacing
        const totalVerticalSpacing = item.marginTopPx + item.marginBottomPx + item.paddingTopPx + item.paddingBottomPx;
        if (totalVerticalSpacing > 15) {
          console.log(`     🚨 LARGE SPACING: ${totalVerticalSpacing}px total vertical space`);
        }
        
        if (item.marginBottomPx > 10 || item.marginTopPx > 10) {
          console.log(`     🔴 LARGE MARGINS detected`);
        }
        
        if (item.paddingBottomPx > 10 || item.paddingTopPx > 10) {
          console.log(`     🟡 LARGE PADDING detected`);
        }
      });
    });
    
    // Find the worst offenders
    console.log('\n🎯 WORST SPACING OFFENDERS:');
    console.log('===========================');
    
    const allElements = [];
    Object.values(allSpacingData).forEach(category => {
      category.data.forEach(item => {
        const totalSpacing = item.marginTopPx + item.marginBottomPx + item.paddingTopPx + item.paddingBottomPx;
        allElements.push({
          category: category.description,
          selector: category.selector,
          index: item.index,
          totalSpacing,
          marginBottom: item.marginBottomPx,
          marginTop: item.marginTopPx,
          paddingBottom: item.paddingBottomPx,
          paddingTop: item.paddingTopPx,
          className: item.className
        });
      });
    });
    
    // Sort by total spacing
    allElements.sort((a, b) => b.totalSpacing - a.totalSpacing);
    
    const topOffenders = allElements.slice(0, 5);
    
    topOffenders.forEach((offender, i) => {
      console.log(`\n${i + 1}. ${offender.category} #${offender.index} (${offender.selector})`);
      console.log(`   Total Spacing: ${offender.totalSpacing}px`);
      console.log(`   Breakdown: margin-top=${offender.marginTop}px, margin-bottom=${offender.marginBottom}px`);
      console.log(`              padding-top=${offender.paddingTop}px, padding-bottom=${offender.paddingBottom}px`);
      console.log(`   Class: ${offender.className}`);
    });
    
    // Generate analysis PDF
    await page.pdf({
      path: 'tests/comprehensive-spacing-debug.pdf',
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
    });
    
    console.log('\n✅ PDF generated: tests/comprehensive-spacing-debug.pdf');
    
    // Provide specific CSS fix recommendations
    console.log('\n💡 RECOMMENDED CSS FIXES:');
    console.log('=========================');
    
    const hasLargeSpacing = topOffenders.some(o => o.totalSpacing > 20);
    
    if (hasLargeSpacing) {
      console.log('Based on the analysis, add these CSS rules to your print styles:');
      console.log('\n@media print {');
      
      topOffenders.forEach(offender => {
        if (offender.totalSpacing > 15) {
          console.log(`  /* Fix ${offender.category} spacing */`);
          console.log(`  ${offender.selector} {`);
          console.log(`    margin: 0 !important;`);
          console.log(`    margin-bottom: 0.05rem !important;`);
          console.log(`    padding-top: 0.1rem !important;`);
          console.log(`    padding-bottom: 0.1rem !important;`);
          console.log(`  }`);
          console.log('');
        }
      });
      
      console.log('}');
    } else {
      console.log('🟢 No major spacing issues found in computed styles');
      console.log('🤔 The print preview spacing might be caused by:');
      console.log('   - Browser print preview rendering differences');
      console.log('   - CSS that only applies during actual PDF generation');
      console.log('   - Elements not included in this analysis');
    }
    
    console.log('\n⏸️  Browser kept open for manual inspection...');
    console.log('Check the DevTools to see the actual DOM structure and styles');
    
    // Keep browser open
    await new Promise(resolve => {
      process.on('SIGINT', () => {
        console.log('\n👋 Closing browser...');
        browser.close().then(resolve);
      });
    });
    
  } catch (error) {
    console.error('❌ Error during comprehensive spacing debug:', error);
    await browser.close();
  }
}

if (require.main === module) {
  comprehensiveSpacingDebug().catch(console.error);
}

module.exports = { comprehensiveSpacingDebug };