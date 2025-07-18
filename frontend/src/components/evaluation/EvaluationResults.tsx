import type { EvaluationResponse } from '../../types/evaluation'
import { ProfessionalReport } from '../report'

interface EvaluationResultsProps {
  evaluation: EvaluationResponse
  essayText: string  // Need essay text for professional report
  prompt?: string    // Optional prompt for professional report
  onClose?: () => void
  onPrint?: () => void
}

const EvaluationResults = ({ evaluation, essayText, prompt, onClose, onPrint }: EvaluationResultsProps) => {
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

  const { evaluation: evalData } = evaluation

  return (
    <div className="space-y-6 pt-8">
      {/* Professional Header with Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">📝</span>
                ISEE Essay Evaluation
              </h1>
              <p className="text-blue-100 mt-2 text-lg">
                {evalData.rubric.name} • Score: {evalData.overall.toFixed(1)}/5
              </p>
            </div>
            <div className="flex gap-3">
              {onPrint && (
                <button
                  onClick={onPrint}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center gap-2 font-semibold border border-white/30"
                >
                  🖨️ Print Report
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center gap-2 font-semibold border border-white/30"
                >
                  ← Back to Editor
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Evaluation Metadata */}
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-800">Processing Time</div>
              <div className="text-blue-600 font-bold">{evalData.metadata.processingTime}ms</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">Confidence</div>
              <div className="text-green-600 font-bold">{(evalData.metadata.confidence * 100).toFixed(1)}%</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">Generated</div>
              <div className="text-gray-600 font-bold">{new Date(evalData.metadata.timestamp).toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">Annotations</div>
              <div className="text-orange-600 font-bold">{evalData.annotations.length} found</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">Feedback Items</div>
              <div className="text-purple-600 font-bold">{evalData.feedback.length}</div>
            </div>
            {evalData.paragraphFeedback && evalData.paragraphFeedback.length > 0 && (
              <div className="text-center">
                <div className="font-semibold text-gray-800">Paragraph Analysis</div>
                <div className="text-indigo-600 font-bold">{evalData.paragraphFeedback.length} paragraphs</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Report View */}
      <ProfessionalReport
        evaluationData={evalData}
        essayText={essayText}
        prompt={prompt}
        mode="screen"
        onPrint={onPrint}
      />

      {/* Footer with Additional Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center">
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            This evaluation was generated using AI technology. Use this feedback as a guide 
            for improvement and consider seeking additional input from teachers or tutors.
          </p>
          <div className="flex justify-center gap-4">
            {onClose && (
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Evaluate Another Essay
              </button>
            )}
            {onPrint && (
              <button
                onClick={onPrint}
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
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