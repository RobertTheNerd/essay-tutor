import React, { useMemo } from 'react'
import { AnnotationProcessor } from './AnnotationProcessor'
import './professional-report-styles.css'

interface StudentInfo {
  name?: string
  date?: string
  gradeLevel?: string
  score?: string
}

interface ProfessionalReportProps {
  evaluationData: any // EvaluationResult from evaluation types
  essayText: string
  prompt?: string
  studentInfo?: StudentInfo
  mode?: 'screen' | 'print'
  onPrint?: () => void
}

const ProfessionalReport: React.FC<ProfessionalReportProps> = ({
  evaluationData,
  essayText,
  prompt,
  studentInfo,
}) => {
  // Initialize annotation processor
  const annotationProcessor = useMemo(() => new AnnotationProcessor(), [])

  // Generate report content with real API annotations
  const reportContent = useMemo(() => {
    const score = evaluationData.overall || evaluationData.scores?.overall || 'N/A'
    const scores = evaluationData.scores || {}

    const categories = [
      { name: 'Grammar & Mechanics', key: 'grammar', score: scores.grammar || 0 },
      { name: 'Vocabulary', key: 'vocabulary', score: scores.vocabulary || 0 },
      { name: 'Structure', key: 'structure', score: scores.structure || 0 },
      { name: 'Development', key: 'development', score: scores.development || 0 },
      { name: 'Clarity', key: 'clarity', score: scores.clarity || 0 },
      { name: 'Strengths', key: 'strengths', score: scores.strengths || 0 },
    ]

    const legendItems = [
      { category: 'grammar', label: 'Grammar', color: 'grammar-mark' },
      { category: 'vocabulary', label: 'Advanced Vocabulary', color: 'word-mark' },
      { category: 'structure', label: 'Sophisticated Structure', color: 'structure-mark' },
      { category: 'development', label: 'Rich Development', color: 'development-mark' },
      { category: 'clarity', label: 'Complex Ideas', color: 'clarity-mark' },
      { category: 'strengths', label: 'Exceptional Techniques', color: 'positive-mark' },
    ]

    // Use real API annotations or fallback to empty array
    const apiAnnotations = evaluationData.annotations || []
    const annotations =
      apiAnnotations.length > 0
        ? annotationProcessor.convertApiAnnotationsToProcessed(apiAnnotations)
        : annotationProcessor.generateMockAnnotations(essayText) // Fallback only when no API data

    // Split essay into text blocks
    const textBlocks = annotationProcessor.splitIntoTextBlocks(essayText)

    // Generate annotation blocks for detailed explanations
    const annotationBlocks = annotationProcessor.generateAnnotationBlocks(annotations)

    // Get paragraph feedback from evaluation data
    const paragraphFeedback = evaluationData.paragraphFeedback || []

    return {
      score,
      categories,
      legendItems,
      annotations,
      textBlocks,
      annotationBlocks,
      paragraphFeedback,
      feedback: evaluationData.feedback || [],
    }
  }, [evaluationData, essayText, annotationProcessor])

  return (
    <div className="professional-report-container">
      {/* Report Content */}
      <div className="professional-report-content">
        {/* Header */}
        <div className="header">
          {/* Two-column layout: Info column + Score column */}
          <div className="header-columns">
            {/* Left Column: Test info, date, prompt */}
            <div className="info-column">
              <div className="test-name">{evaluationData.rubric?.name || 'Essay Evaluation'}</div>
              <div className="test-date">
                {studentInfo?.date || new Date().toLocaleDateString()}
              </div>
              {prompt && (
                <div className="prompt-section">
                  <div className="prompt-label">Essay Prompt</div>
                  <div className="prompt-text">{prompt}</div>
                </div>
              )}
            </div>

            {/* Right Column: Score */}
            <div className="score-column">
              <div className="score-display">
                <div className="score-number">{reportContent.score}</div>
                <div className="score-label">/ 5</div>
              </div>
            </div>
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
            const blockAnnotations = reportContent.annotations
              .filter(annotation => {
                return block.includes(annotation.originalText)
              })
              .map(annotation => {
                // Adjust indices to be relative to the block, not the full text
                const blockStartIndex = block.indexOf(annotation.originalText)
                if (blockStartIndex !== -1) {
                  return {
                    ...annotation,
                    startIndex: blockStartIndex,
                    endIndex: blockStartIndex + annotation.originalText.length,
                  }
                }
                return annotation
              })

            // Apply annotations to the text block with corrected indices
            const annotatedBlockText = annotationProcessor.applyAnnotationsToText(
              block,
              blockAnnotations
            )

            // Get annotation blocks for this text block
            const relatedAnnotationBlocks =
              annotationProcessor.generateAnnotationBlocks(blockAnnotations)

            // Find paragraph feedback for this block (paragraph number = blockIndex + 1)
            const paragraphFeedback = reportContent.paragraphFeedback.find(
              (feedback: any) => feedback.paragraphNumber === blockIndex + 1
            )

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
                      {paragraphFeedback.type === 'excellent'
                        ? '🏆'
                        : paragraphFeedback.type === 'positive'
                          ? '👍'
                          : '📝'}
                      {paragraphFeedback.title}:
                    </strong>{' '}
                    {paragraphFeedback.content}
                  </div>
                )}
              </div>
            )
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
  )
}

export default ProfessionalReport
