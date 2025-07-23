import React, { useMemo } from 'react'
import { AnnotationProcessor } from './AnnotationProcessor'
import {
  getISEELevelFromRubric,
  type EvaluationData,
} from '../../types/evaluation'
import ISEELevelProgression from './ISEELevelProgression'
import EnhancedPerformanceMeter from './EnhancedPerformanceMeter'
import CategoryFeedbackSummary from './CategoryFeedbackSummary'
import './professional-report-styles.css'

interface StudentInfo {
  name?: string
  date?: string
  gradeLevel?: string
  score?: string
}

interface ProfessionalReportProps {
  evaluationData: EvaluationData // EvaluationResult from evaluation types
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
  
  // Determine ISEE level from evaluation data
  const iseeLevel = useMemo(() => 
    getISEELevelFromRubric(evaluationData.rubric), [evaluationData.rubric]
  )

  // Generate report content with real API annotations
  const reportContent = useMemo(() => {
    const score = evaluationData.overall || evaluationData.scores?.overall || 'N/A'
    const scores = evaluationData.scores || {}

    const categories = [
      { name: 'Ideas & Content', key: 'ideas', score: scores.ideas || 2 },
      { name: 'Organization', key: 'organization', score: scores.organization || 2 },
      { name: 'Voice & Focus', key: 'voice', score: scores.voice || 2 },
      { name: 'Word Choice', key: 'wordChoice', score: scores.wordChoice || 2 },
      { name: 'Sentence Fluency', key: 'fluency', score: scores.fluency || 2 },
      { name: 'Conventions', key: 'conventions', score: scores.conventions || 2 },
    ]

    const legendItems = [
      { category: 'ideas', label: 'Ideas & Content', color: 'ideas-mark' },
      { category: 'organization', label: 'Organization', color: 'organization-mark' },
      { category: 'voice', label: 'Voice & Focus', color: 'voice-mark' },
      { category: 'wordChoice', label: 'Word Choice', color: 'word-choice-mark' },
      { category: 'fluency', label: 'Sentence Fluency', color: 'fluency-mark' },
      { category: 'conventions', label: 'Conventions', color: 'conventions-mark' },
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

    // Extract category-specific feedback from API response
    const categoryFeedback: { [key: string]: string } = {}
    if (evaluationData.feedback && Array.isArray(evaluationData.feedback)) {
      evaluationData.feedback.forEach((fb: any) => {
        if (fb.category && fb.content) {
          categoryFeedback[fb.category] = fb.content
        }
      })
    }

    return {
      score,
      categories,
      legendItems,
      annotations,
      textBlocks,
      annotationBlocks,
      paragraphFeedback,
      feedback: evaluationData.feedback || [],
      categoryFeedback,
    }
  }, [evaluationData, essayText, annotationProcessor])


  return (
    <div className="professional-report-container">
      {/* Report Content */}
      <div className="professional-report-content">
        {/* Header - Test Information */}
        <div className="header-info">
          <div className="test-info-block">
            <div className="test-name-date">
              <div className="test-name">{evaluationData.rubric?.name || 'Essay Evaluation'}</div>
              <div className="test-date">
                {studentInfo?.date || new Date().toLocaleDateString()}
              </div>
            </div>
            {prompt && (
              <div className="prompt-section">
                <div className="prompt-label">Essay Prompt</div>
                <div className="prompt-text">{prompt}</div>
              </div>
            )}
          </div>
        </div>


        
        {/* Enhanced Performance Meter */}
        <EnhancedPerformanceMeter 
          score={typeof reportContent.score === 'string' ? parseFloat(reportContent.score) : reportContent.score}
          level={iseeLevel}
          className="mb-6"
        />
        {/* Category Feedback Summary */}
        <CategoryFeedbackSummary 
          categories={reportContent.categories}
          iseeLevel={iseeLevel}
          categoryFeedback={reportContent.categoryFeedback}
        />

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

      </div>
    </div>
  )
}

export default ProfessionalReport
