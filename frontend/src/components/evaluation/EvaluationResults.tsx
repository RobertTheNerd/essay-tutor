import type { EvaluationResponse } from '../../types/evaluation'
import { ProfessionalReport } from '../report'

interface EvaluationResultsProps {
  evaluation: EvaluationResponse
  essayText: string // Need essay text for professional report
  prompt?: string // Optional prompt for professional report
  onClose?: () => void
  onPrint?: () => void
}

const EvaluationResults = ({
  evaluation,
  essayText,
  prompt,
  onClose,
  onPrint,
}: EvaluationResultsProps) => {
  // Safety check for required data
  if (!evaluation.success || !evaluation.evaluation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">No evaluation data available</h2>
        <p className="text-gray-600 mb-6">There was an issue loading your evaluation results.</p>
        {onClose && (
          <button onClick={onClose} className="btn-primary">
            Back to Editor
          </button>
        )}
      </div>
    )
  }

  const evalData = evaluation.evaluation

  // Additional safety check
  if (!evalData || !evalData.overall) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">No evaluation data available</h2>
        <p className="text-gray-600 mb-6">There was an issue loading your evaluation results.</p>
        {onClose && (
          <button onClick={onClose} className="btn-primary">
            Back to Editor
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-8">
      {/* Clean, Professional Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Content */}
        <div className="px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Essay Evaluation Results</h1>
              <p className="text-lg text-gray-600">
                {evalData.rubric.name} • Overall Score:{' '}
                <span className="font-semibold text-blue-600">{evalData.overall.toFixed(1)}/5</span>
              </p>
            </div>
            <div className="flex gap-3">
              {onPrint && (
                <button
                  onClick={onPrint}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-colors duration-200 flex items-center gap-2 font-medium"
                >
                  🖨️ Print Report
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors duration-200 flex items-center gap-2 font-medium"
                >
                  ← Back to Editor
                </button>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              This evaluation was generated using AI technology. Use this feedback as a guide for
              improvement and consider seeking additional input from teachers or tutors.
            </p>
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

      {/* Simplified Footer */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="flex justify-center gap-4">
            {onClose && (
              <button
                onClick={onClose}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl transition-colors duration-200 font-medium"
              >
                Evaluate Another Essay
              </button>
            )}
            {onPrint && (
              <button
                onClick={onPrint}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl transition-colors duration-200 font-medium"
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
