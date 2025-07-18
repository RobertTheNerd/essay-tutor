import { useState } from 'react'
import type { EvaluationResponse } from '../../types/evaluation'
import ScoreSummary from './ScoreSummary'
import AnnotatedText from './AnnotatedText'
import FeedbackSection from './FeedbackSection'
import { ProfessionalReport } from '../report'

interface EvaluationResultsProps {
  evaluation: EvaluationResponse
  essayText: string  // Need essay text for professional report
  prompt?: string    // Optional prompt for professional report
  onClose?: () => void
  onPrint?: () => void
}

const EvaluationResults = ({ evaluation, essayText, prompt, onClose, onPrint }: EvaluationResultsProps) => {
  const [viewMode, setViewMode] = useState<'detailed' | 'professional'>('detailed')
  if (!evaluation.success || !evaluation.evaluation) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          ❌ Evaluation Failed
        </h2>
        <p className="text-red-700">
          {evaluation.error || 'An error occurred during evaluation.'}
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    )
  }

  const { evaluation: evalData, annotatedText } = evaluation

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📝 ISEE Essay Evaluation
            </h1>
            <p className="text-gray-600 mt-1">
              {evalData.rubric.name} • Score: {evalData.overall.toFixed(1)}/5
            </p>
          </div>
          <div className="flex gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Detailed View
              </button>
              <button
                onClick={() => setViewMode('professional')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'professional'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📄 Professional Report
              </button>
            </div>
            
            {onPrint && (
              <button
                onClick={onPrint}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                🖨️ Print Report
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                ← Back to Editor
              </button>
            )}
          </div>
        </div>

        {/* Evaluation Metadata */}
        <div className="flex flex-wrap gap-6 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
          <div>
            <strong>Processing Time:</strong> {evalData.metadata.processingTime}ms
          </div>
          <div>
            <strong>Confidence:</strong> {(evalData.metadata.confidence * 100).toFixed(1)}%
          </div>
          <div>
            <strong>Generated:</strong> {new Date(evalData.metadata.timestamp).toLocaleString()}
          </div>
          <div>
            <strong>Annotations:</strong> {evalData.annotations.length} found
          </div>
          <div>
            <strong>Feedback Items:</strong> {evalData.feedback.length}
          </div>
        </div>
      </div>

      {/* Conditional Content Based on View Mode */}
      {viewMode === 'detailed' ? (
        <>
          {/* Score Summary */}
          <ScoreSummary 
            scores={evalData.scores} 
            overall={evalData.overall}
            rubricName={evalData.rubric.name}
          />

          {/* Annotated Text */}
          {annotatedText && (
            <AnnotatedText
              segments={annotatedText.segments}
              annotations={annotatedText.annotations}
              legend={annotatedText.legend}
              title="📖 Annotated Essay"
            />
          )}

          {/* Detailed Feedback */}
          <FeedbackSection
            feedbackBlocks={evalData.feedback}
            strengths={evalData.summary.strengths}
            improvements={evalData.summary.improvements}
            nextSteps={evalData.summary.nextSteps}
          />
        </>
      ) : (
        /* Professional Report View */
        <ProfessionalReport
          evaluationData={evalData}
          essayText={essayText}
          prompt={prompt}
          mode="screen"
          onPrint={onPrint}
        />
      )}

      {/* Footer with Additional Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            This evaluation was generated using AI technology. Use this feedback as a guide 
            for improvement and consider seeking additional input from teachers or tutors.
          </p>
          <div className="flex justify-center gap-4">
            {onClose && (
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Evaluate Another Essay
              </button>
            )}
            {onPrint && (
              <button
                onClick={onPrint}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Save/Print Results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EvaluationResults