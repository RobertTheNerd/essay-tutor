// Professional report styling system matching sample_output.html design
// Platform-agnostic CSS that works in both browser and PDF generation

export const PROFESSIONAL_REPORT_STYLES = `
  @import url("https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&family=Source+Serif+Pro:wght@400;600&display=swap");

  :root {
    --primary-blue: #2563eb;
    --primary-gray: #374151;
    --light-gray: #f8fafc;
    --border-light: #e2e8f0;
    --border-medium: #cbd5e1;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
    --gradient-header: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --essay-bg: #fefefe;
    --essay-shadow: inset 0 0 0 1px #e2e8f0,
      0 2px 4px -1px rgb(0 0 0 / 0.05);
  }

  .professional-report {
    font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 1rem;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    color: var(--text-primary);
    font-size: 14px;
    min-height: 100vh;
  }

  .report-header {
    background: var(--gradient-header);
    color: white;
    text-align: center;
    border-radius: 12px;
    padding: 2rem 1.5rem 1.5rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow-lg);
    position: relative;
    overflow: hidden;
  }

  .report-header::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }

  .report-header h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    font-family: "Source Serif Pro", serif;
    position: relative;
    z-index: 1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .report-prompt {
    margin-top: 1rem;
    font-size: 1rem;
    font-style: italic;
    opacity: 0.95;
    position: relative;
    z-index: 1;
    font-weight: 400;
  }

  .student-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
  }

  .student-info > div {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .student-info strong {
    color: var(--text-primary);
    font-weight: 600;
  }

  .legend {
    background: white;
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-sm);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
    font-size: 0.85rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .legend-color {
    width: 12px;
    height: 8px;
    border-radius: 2px;
    box-shadow: var(--shadow-sm);
  }

  .essay-container {
    width: 100%;
    max-width: 8in;
    margin: 0 auto;
    background: var(--essay-bg);
    border-radius: 12px;
    box-shadow: var(--essay-shadow);
    padding: 2rem;
    position: relative;
  }

  .essay-title {
    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    font-family: "Source Serif Pro", serif;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--border-light);
  }

  .essay-text {
    font-family: "Space Mono", "Courier New", "Monaco", monospace;
    font-size: 14px;
    line-height: 1.6;
    color: #2d3748;
    text-align: left;
    font-weight: 400;
    letter-spacing: 0.01em;
  }

  .text-block {
    margin-bottom: 2.5rem;
    position: relative;
    padding: 1.5rem;
    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
    border-radius: 8px;
    border-left: 4px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .text-block:nth-child(odd) {
    border-left-color: #3b82f6;
  }

  .text-block:nth-child(even) {
    border-left-color: #10b981;
  }

  .text-line {
    margin-bottom: 0.75rem;
    padding: 0.25rem 0;
  }

  .marked-text {
    position: relative;
    display: inline;
    border-radius: 2px;
    padding: 1px 2px;
    transition: all 0.2s ease;
  }

  .grammar-mark {
    background: linear-gradient(
      120deg,
      rgba(239, 68, 68, 0.25) 0%,
      rgba(239, 68, 68, 0.15) 100%
    );
  }

  .word-mark {
    background: linear-gradient(
      120deg,
      rgba(59, 130, 246, 0.25) 0%,
      rgba(59, 130, 246, 0.15) 100%
    );
  }

  .structure-mark {
    background: linear-gradient(
      120deg,
      rgba(34, 197, 94, 0.25) 0%,
      rgba(34, 197, 94, 0.15) 100%
    );
  }

  .clarity-mark {
    background: linear-gradient(
      120deg,
      rgba(249, 115, 22, 0.25) 0%,
      rgba(249, 115, 22, 0.15) 100%
    );
  }

  .development-mark {
    background: linear-gradient(
      120deg,
      rgba(147, 51, 234, 0.25) 0%,
      rgba(147, 51, 234, 0.15) 100%
    );
  }

  .positive-mark {
    background: linear-gradient(
      120deg,
      rgba(16, 185, 129, 0.25) 0%,
      rgba(16, 185, 129, 0.15) 100%
    );
    font-weight: 600;
  }

  .annotation-marker {
    display: inline;
    color: white;
    font-size: 0.65rem;
    padding: 2px 5px;
    border-radius: 10px;
    margin-left: 3px;
    font-weight: 700;
    vertical-align: super;
    font-family: "Inter", sans-serif;
    box-shadow: var(--shadow-sm);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .marker-grammar {
    background: linear-gradient(135deg, #ef4444, #dc2626);
  }
  .marker-word {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }
  .marker-structure {
    background: linear-gradient(135deg, #22c55e, #16a34a);
  }
  .marker-clarity {
    background: linear-gradient(135deg, #f97316, #ea580c);
  }
  .marker-development {
    background: linear-gradient(135deg, #9333ea, #7c3aed);
  }
  .marker-positive {
    background: linear-gradient(135deg, #10b981, #059669);
  }

  .annotation-section {
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-start;
  }

  .annotation-block {
    background: white;
    border: 1px solid var(--border-light);
    border-radius: 6px;
    padding: 1rem;
    font-size: 0.82rem;
    line-height: 1.4;
    flex: 1 1 calc(50% - 0.5rem);
    min-width: 280px;
    max-width: 100%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    font-family: "Inter", sans-serif;
    transition: all 0.15s ease;
    box-sizing: border-box;
  }

  .annotation-block * {
    font-size: 0.82rem;
    line-height: 1.4;
    font-family: "Inter", sans-serif;
  }

  .annotation-block br + * {
    margin-top: 0.3rem;
  }

  .annotation-block:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    transform: translateY(-0.5px);
  }

  .annotation-block.wide {
    flex: 1 1 100%;
    min-width: 100%;
  }
  .annotation-block.full {
    flex: 1 1 100%;
    min-width: 100%;
  }

  .annotation-header {
    font-weight: 600;
    font-size: 0.72rem;
    text-transform: uppercase;
    margin-bottom: 0.6rem;
    padding-bottom: 0.3rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    letter-spacing: 0.3px;
    opacity: 0.9;
  }

  .grammar-block {
    border-left: 3px solid #ef4444;
  }
  .grammar-block .annotation-header {
    color: #dc2626;
  }

  .word-block {
    border-left: 3px solid #3b82f6;
  }
  .word-block .annotation-header {
    color: #2563eb;
  }

  .structure-block {
    border-left: 3px solid #22c55e;
  }
  .structure-block .annotation-header {
    color: #16a34a;
  }

  .clarity-block {
    border-left: 3px solid #f97316;
  }
  .clarity-block .annotation-header {
    color: #ea580c;
  }

  .development-block {
    border-left: 3px solid #9333ea;
  }
  .development-block .annotation-header {
    color: #7c3aed;
  }

  .positive-block {
    border-left: 3px solid #10b981;
    background: rgba(240, 253, 250, 0.3);
  }
  .positive-block .annotation-header {
    color: #059669;
  }

  .original-text {
    background: linear-gradient(120deg, #fecaca, #fca5a5);
    padding: 4px 8px;
    font-style: italic;
    border-radius: 4px;
    font-size: 0.82rem;
    display: inline-block;
    font-family: "Inter", sans-serif;
    box-shadow: var(--shadow-sm);
    margin: 2px 0;
    max-width: 100%;
    word-wrap: break-word;
    line-height: 1.4;
  }

  .suggested-text {
    background: linear-gradient(120deg, #bbf7d0, #86efac);
    padding: 4px 8px;
    font-weight: 500;
    border-radius: 4px;
    font-size: 0.82rem;
    display: inline-block;
    font-family: "Inter", sans-serif;
    box-shadow: var(--shadow-sm);
    margin: 2px 0;
    max-width: 100%;
    word-wrap: break-word;
    line-height: 1.4;
  }

  .annotation-label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.82rem;
    margin-top: 0.4rem;
    margin-bottom: 0.2rem;
    display: block;
    font-family: "Inter", sans-serif;
  }

  .paragraph-feedback {
    background: linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%);
    border: 1px solid #93c5fd;
    border-left: 4px solid #3b82f6;
    padding: 1.2rem;
    margin: 1.5rem 0;
    font-size: 1rem;
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
    font-family: "Inter", sans-serif;
    line-height: 1.5;
  }

  .paragraph-feedback.positive {
    background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%);
    border-color: #86efac;
    border-left-color: #22c55e;
  }

  .paragraph-feedback.excellent {
    background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
    border-color: #fbbf24;
    border-left-color: #f59e0b;
  }

  .paragraph-feedback strong {
    font-weight: 600;
    color: var(--text-primary);
  }

  .score-summary {
    border: 1px solid var(--border-medium);
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 2rem;
    background: white;
    box-shadow: var(--shadow-md);
    font-family: "Inter", sans-serif;
  }

  .score-summary h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .score-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .score-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-light);
  }

  .score-badge {
    font-weight: 700;
    padding: 0.25rem 0.75rem;
    background: linear-gradient(135deg, #059669, #047857);
    color: white;
    border-radius: 20px;
    font-size: 0.8rem;
    box-shadow: var(--shadow-sm);
    min-width: 45px;
    text-align: center;
  }

  .average-score {
    text-align: center;
    font-weight: 700;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid var(--border-medium);
    font-size: 1.1rem;
    color: #059669;
  }

  .priority-section {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .priority-excellence {
    background: linear-gradient(135deg, #f0fdf4 0%, #fefefe 100%);
    border-left: 4px solid #22c55e;
  }

  .priority-techniques {
    background: linear-gradient(135deg, #faf5ff 0%, #fefefe 100%);
    border-left: 4px solid #9333ea;
  }

  .priority-advanced {
    background: linear-gradient(135deg, #eff6ff 0%, #fefefe 100%);
    border-left: 4px solid #3b82f6;
  }

  /* Print optimization */
  @media print {
    .professional-report {
      background: white !important;
      color: black !important;
      font-size: 12px !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .report-header, .legend, .essay-container, .score-summary {
      box-shadow: none !important;
      border: 1px solid #ccc !important;
    }

    .annotation-marker, .suggested-text, .original-text {
      print-color-adjust: exact !important;
      -webkit-print-color-adjust: exact !important;
    }

    .grammar-mark, .word-mark, .structure-mark, .clarity-mark, .development-mark, .positive-mark {
      print-color-adjust: exact !important;
      -webkit-print-color-adjust: exact !important;
    }

    .text-block {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .annotation-section {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Force color printing */
    * {
      print-color-adjust: exact !important;
      -webkit-print-color-adjust: exact !important;
    }

    @page {
      margin: 0.75in;
      size: letter;
    }
  }
`;

export function getReportStyles(target: 'web' | 'print' | 'pdf' = 'web'): string {
  // Base styles that work everywhere
  let styles = PROFESSIONAL_REPORT_STYLES;
  
  // Add target-specific optimizations
  if (target === 'print' || target === 'pdf') {
    styles += `
      /* Additional print/PDF optimizations */
      body { background: white !important; }
      .professional-report { 
        background: white !important; 
        min-height: auto !important;
      }
    `;
  }
  
  return styles;
}