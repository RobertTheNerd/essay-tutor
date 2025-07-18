import React, { useMemo } from 'react';

interface StudentInfo {
  name?: string;
  date?: string;
  gradeLevel?: string;
  score?: string;
}

interface ProfessionalReportProps {
  evaluationData: any; // EvaluationResult from evaluation types
  essayText: string;
  prompt?: string;
  studentInfo?: StudentInfo;
  mode?: 'screen' | 'print';
  onPrint?: () => void;
}

const ProfessionalReport: React.FC<ProfessionalReportProps> = ({
  evaluationData,
  essayText,
  prompt,
  studentInfo,
  mode = 'screen',
  onPrint
}) => {
  // Professional report styles (embedded)
  const reportStyles = `
    @import url("https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&family=Source+Serif+Pro:wght@400;600&display=swap");

    .professional-report {
      font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 1rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      color: #1e293b;
      font-size: 14px;
    }

    .report-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      border-radius: 12px;
      padding: 2rem 1.5rem 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      position: relative;
      overflow: hidden;
    }

    .report-header h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      font-family: "Source Serif Pro", serif;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .report-prompt {
      margin-top: 1rem;
      font-size: 1rem;
      font-style: italic;
      opacity: 0.95;
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
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      border: 1px solid #e2e8f0;
    }

    .student-info > div {
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
    }

    .student-info strong {
      color: #1e293b;
      font-weight: 600;
    }

    .legend {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
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
      color: #64748b;
    }

    .legend-color {
      width: 12px;
      height: 8px;
      border-radius: 2px;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    .grammar-mark { background: linear-gradient(120deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.15) 100%); }
    .word-mark { background: linear-gradient(120deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%); }
    .structure-mark { background: linear-gradient(120deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.15) 100%); }
    .clarity-mark { background: linear-gradient(120deg, rgba(249, 115, 22, 0.25) 0%, rgba(249, 115, 22, 0.15) 100%); }
    .development-mark { background: linear-gradient(120deg, rgba(147, 51, 234, 0.25) 0%, rgba(147, 51, 234, 0.15) 100%); }
    .positive-mark { background: linear-gradient(120deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.15) 100%); }

    .essay-container {
      width: 100%;
      max-width: 8in;
      margin: 0 auto;
      background: #fefefe;
      border-radius: 12px;
      box-shadow: inset 0 0 0 1px #e2e8f0, 0 2px 4px -1px rgb(0 0 0 / 0.05);
      padding: 2rem;
      position: relative;
    }

    .essay-title {
      font-size: 1.25rem;
      font-weight: 600;
      text-align: center;
      margin-bottom: 1.5rem;
      color: #1e293b;
      font-family: "Source Serif Pro", serif;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .essay-text {
      font-family: "Space Mono", "Courier New", "Monaco", monospace;
      font-size: 14px;
      line-height: 1.6;
      color: #2d3748;
      text-align: left;
      font-weight: 400;
      letter-spacing: 0.01em;
      white-space: pre-wrap;
      margin-bottom: 2rem;
    }

    .score-summary {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 2rem;
      background: white;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      font-family: "Inter", sans-serif;
    }

    .score-summary h3 {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
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
      border-bottom: 1px solid #e2e8f0;
    }

    .score-badge {
      font-weight: 700;
      padding: 0.25rem 0.75rem;
      background: linear-gradient(135deg, #059669, #047857);
      color: white;
      border-radius: 20px;
      font-size: 0.8rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      min-width: 45px;
      text-align: center;
    }

    .average-score {
      text-align: center;
      font-weight: 700;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 2px solid #cbd5e1;
      font-size: 1.1rem;
      color: #059669;
    }

    .annotation-summary {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 1.5rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }

    .annotation-summary h3 {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .feedback-item {
      background: linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%);
      border: 1px solid #93c5fd;
      border-left: 4px solid #3b82f6;
      padding: 1rem;
      margin: 1rem 0;
      font-size: 0.9rem;
      border-radius: 6px;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      font-family: "Inter", sans-serif;
      line-height: 1.5;
    }

    .feedback-item.positive {
      background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%);
      border-color: #86efac;
      border-left-color: #22c55e;
    }

    .feedback-item strong {
      font-weight: 600;
      color: #1e293b;
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

  // Generate report content
  const reportContent = useMemo(() => {
    const score = evaluationData.overall || evaluationData.scores?.overall || 'N/A';
    const scores = evaluationData.scores || {};
    
    const categories = [
      { name: 'Grammar & Mechanics', key: 'grammar', score: scores.grammar || 0 },
      { name: 'Vocabulary', key: 'vocabulary', score: scores.vocabulary || 0 },
      { name: 'Structure', key: 'structure', score: scores.structure || 0 },
      { name: 'Development', key: 'development', score: scores.development || 0 },
      { name: 'Clarity', key: 'clarity', score: scores.clarity || 0 },
      { name: 'Strengths', key: 'strengths', score: scores.strengths || 0 }
    ];

    const legendItems = [
      { category: 'grammar', label: 'Grammar', color: 'grammar-mark' },
      { category: 'vocabulary', label: 'Advanced Vocabulary', color: 'word-mark' },
      { category: 'structure', label: 'Sophisticated Structure', color: 'structure-mark' },
      { category: 'development', label: 'Rich Development', color: 'development-mark' },
      { category: 'clarity', label: 'Complex Ideas', color: 'clarity-mark' },
      { category: 'strengths', label: 'Exceptional Techniques', color: 'positive-mark' }
    ];

    return {
      score,
      categories,
      legendItems,
      feedback: evaluationData.feedback || [],
      annotations: evaluationData.annotations || []
    };
  }, [evaluationData]);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }
    window.print();
  };

  const handleDownloadHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ISEE Essay Evaluation Report</title>
        <style>${reportStyles}</style>
      </head>
      <body class="professional-report">
        ${document.querySelector('.professional-report-content')?.innerHTML || ''}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `isee-essay-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="professional-report-container">
      {/* Embedded Styles */}
      <style>{reportStyles}</style>
      
      {/* Action buttons for screen mode */}
      {mode === 'screen' && (
        <div className="flex justify-end gap-2 mb-4 px-4">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            🖨️ Print Report
          </button>
          <button
            onClick={handleDownloadHTML}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            💾 Download HTML
          </button>
        </div>
      )}

      {/* Report Content */}
      <div className="professional-report professional-report-content">
        {/* Header */}
        <div className="report-header">
          <h1>🏆 ISEE Essay Evaluation Report - Score {reportContent.score}/5</h1>
          {prompt && (
            <div className="report-prompt">
              <strong>Prompt:</strong> {prompt}
            </div>
          )}
          
          {/* Student Info */}
          <div className="student-info">
            {studentInfo?.name && <div><strong>Student:</strong> {studentInfo.name}</div>}
            <div><strong>Date:</strong> {studentInfo?.date || new Date().toLocaleDateString()}</div>
            <div><strong>Test:</strong> ISEE Essay</div>
            <div><strong>Level:</strong> {studentInfo?.gradeLevel || 'Upper Level'}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="legend">
          {reportContent.legendItems.map(item => (
            <div key={item.category} className="legend-item">
              <div className={`legend-color ${item.color}`}></div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Essay Container */}
        <div className="essay-container">
          <h2 className="essay-title">Student Essay</h2>
          <div className="essay-text">{essayText}</div>
        </div>

        {/* Score Summary */}
        <div className="score-summary">
          <h3>📊 Evaluation Summary</h3>
          <div className="score-grid">
            {reportContent.categories.map(category => (
              <div key={category.key} className="score-item">
                <span>{category.name}</span>
                <span className="score-badge">{category.score}/5</span>
              </div>
            ))}
          </div>
          <div className="average-score">
            Overall Score: {Number(reportContent.score).toFixed(1)}/5.0
          </div>
        </div>

        {/* Feedback Section */}
        {reportContent.feedback.length > 0 && (
          <div className="annotation-summary">
            <h3>📝 Detailed Feedback</h3>
            {reportContent.feedback.map((item: any, index: number) => (
              <div 
                key={index} 
                className={`feedback-item ${item.type === 'strength' ? 'positive' : ''}`}
              >
                <strong>{item.title}:</strong> {item.content}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalReport;