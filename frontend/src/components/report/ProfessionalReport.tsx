import React, { useMemo } from 'react';
import { AnnotationProcessor } from './AnnotationProcessor';
import './professional-report-styles.css';

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
  // Initialize annotation processor
  const annotationProcessor = useMemo(() => new AnnotationProcessor(), []);

  // Generate report content with real API annotations
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

    // Use real API annotations or fallback to empty array
    const apiAnnotations = evaluationData.annotations || [];
    const annotations = apiAnnotations.length > 0 
      ? annotationProcessor.convertApiAnnotationsToProcessed(apiAnnotations)
      : annotationProcessor.generateMockAnnotations(essayText); // Fallback only when no API data
    
    // Split essay into text blocks
    const textBlocks = annotationProcessor.splitIntoTextBlocks(essayText);
    
    // Generate annotation blocks for detailed explanations
    const annotationBlocks = annotationProcessor.generateAnnotationBlocks(annotations);

    // Get paragraph feedback from evaluation data
    const paragraphFeedback = evaluationData.paragraphFeedback || [];

    return {
      score,
      categories,
      legendItems,
      annotations,
      textBlocks,
      annotationBlocks,
      paragraphFeedback,
      feedback: evaluationData.feedback || []
    };
  }, [evaluationData, essayText, annotationProcessor]);

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
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&family=Source+Serif+Pro:wght@400;600&display=swap");
          /* Include professional report styles here */
        </style>
      </head>
      <body class="professional-report-container">
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
      <div className="professional-report-content">
        {/* Header */}
        <div className="header">
          <h1>🏆 ISEE Essay - Score {reportContent.score}/5 Example</h1>
          {prompt && (
            <div className="prompt">
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

        {/* Essay Container with Annotated Text Blocks */}
        <div className="essay-container">
          <h2 className="essay-title">Student Essay</h2>
          
          {reportContent.textBlocks.map((block, blockIndex) => {
            // Find annotations for this block and adjust indices
            const blockAnnotations = reportContent.annotations.filter(annotation => {
              return block.includes(annotation.originalText);
            }).map(annotation => {
              // Adjust indices to be relative to the block, not the full text
              const blockStartIndex = block.indexOf(annotation.originalText);
              if (blockStartIndex !== -1) {
                return {
                  ...annotation,
                  startIndex: blockStartIndex,
                  endIndex: blockStartIndex + annotation.originalText.length
                };
              }
              return annotation;
            });

            // Apply annotations to the text block with corrected indices
            const annotatedBlockText = annotationProcessor.applyAnnotationsToText(block, blockAnnotations);

            // Get annotation blocks for this text block
            const relatedAnnotationBlocks = annotationProcessor.generateAnnotationBlocks(blockAnnotations);

            // Find paragraph feedback for this block (paragraph number = blockIndex + 1)
            const paragraphFeedback = reportContent.paragraphFeedback.find(
              (feedback: any) => feedback.paragraphNumber === blockIndex + 1
            );

            return (
              <div key={blockIndex} className="text-block">
                <div className="text-line essay-text">
                  <div dangerouslySetInnerHTML={{ __html: annotatedBlockText }} />
                </div>
                
                {/* Annotation blocks for this text section */}
                {relatedAnnotationBlocks.length > 0 && (
                  <div className="annotation-section">
                    {relatedAnnotationBlocks.map((annotationBlock, annotationIndex) => (
                      <div 
                        key={annotationIndex}
                        className={`annotation-block ${annotationBlock.blockClass} ${annotationBlock.isWide ? 'wide' : ''}`}
                      >
                        <div className="annotation-header">{annotationBlock.header}</div>
                        <div dangerouslySetInnerHTML={{ __html: annotationBlock.content }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Paragraph Feedback Section */}
                {paragraphFeedback && (
                  <div className={`paragraph-feedback ${paragraphFeedback.type}`}>
                    <strong>
                      {paragraphFeedback.type === 'excellent' ? '🏆' : 
                       paragraphFeedback.type === 'positive' ? '👍' : '📝'} 
                      {paragraphFeedback.title}:
                    </strong> {paragraphFeedback.content}
                  </div>
                )}
              </div>
            );
          })}
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
      </div>
    </div>
  );
};

export default ProfessionalReport;