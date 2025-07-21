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

  // Simple print function
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
        {/* Header Content */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Essay Evaluation Results</h1>
            </div>
            <div className="flex gap-2">
              {onPrint && (
                <button
                  onClick={handlePrint}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                >
                  🖨️ Print Report
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                >
                  ← Back to Editor
                </button>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-xs text-blue-800 leading-relaxed">
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
        onPrint={handlePrint}
      />

    </div>
  )
}

export default EvaluationResults
