import type { EvaluationResponse } from '../../types/evaluation'
import { CATEGORY_COLORS, CATEGORY_NAMES } from '../../types/evaluation'

interface PrintableReportProps {
  evaluation: EvaluationResponse
  studentInfo?: {
    name?: string
    grade?: string
    date?: string
  }
}

const PrintableReport = ({ evaluation, studentInfo }: PrintableReportProps) => {
  if (!evaluation.success || !evaluation.evaluation) {
    return null
  }

  const { evaluation: evalData, annotatedText } = evaluation

  const getScoreLabel = (score: number): string => {
    if (score >= 4.5) return 'Exceptional'
    if (score >= 3.5) return 'Advanced'
    if (score >= 2.5) return 'Proficient'
    if (score >= 1.5) return 'Developing'
    return 'Needs Improvement'
  }

  return (
    <div className="print-report bg-white">
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            .print-report {
              font-size: 12px !important;
              line-height: 1.4 !important;
              color: black !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .no-print {
              display: none !important;
            }
            
            .page-break {
              page-break-before: always !important;
            }
            
            .annotation-highlight {
              padding: 1px 2px !important;
              border-radius: 2px !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .score-badge {
              background: #10b981 !important;
              color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `
      }} />

      {/* Header */}
      <div className="text-center mb-8 pb-4 border-b-2 border-gray-300">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📝 ISEE Essay Evaluation Report
        </h1>
        <h2 className="text-xl text-gray-700 mb-4">
          Score: {evalData.overall.toFixed(1)}/5 ({getScoreLabel(evalData.overall)})
        </h2>
        
        {/* Student Information */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div><strong>Student:</strong> {studentInfo?.name || 'Anonymous'}</div>
          <div><strong>Date:</strong> {studentInfo?.date || new Date().toLocaleDateString()}</div>
          <div><strong>Grade Level:</strong> {studentInfo?.grade || '7th-8th Grade'}</div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          <strong>Rubric:</strong> {evalData.rubric.name}
        </div>
      </div>

      {/* Score Summary */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">📊 Score Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(evalData.scores).map(([categoryId, score]) => {
            const categoryName = CATEGORY_NAMES[categoryId as keyof typeof CATEGORY_NAMES] || categoryId
            const categoryColor = CATEGORY_COLORS[categoryId as keyof typeof CATEGORY_COLORS] || '#6b7280'
            
            return (
              <div key={categoryId} className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3" 
                    style={{ backgroundColor: categoryColor }}
                  ></div>
                  <span className="font-medium">{categoryName}</span>
                </div>
                <span className="score-badge px-3 py-1 rounded-full text-sm font-bold">
                  {score}/5
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            Overall Score: {evalData.overall.toFixed(1)}/5
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-3">🎨 Annotation Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {annotatedText?.legend.map((category) => (
            <div key={category.id} className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: category.color }}
              ></div>
              <span>{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Annotated Essay */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">📖 Annotated Essay</h3>
        <div className="border p-4 bg-gray-50 font-mono text-sm leading-relaxed">
          {annotatedText?.segments.map((segment, index) => {
            if (!segment.isAnnotated) {
              return <span key={index}>{segment.text}</span>
            }

            return segment.annotations.map((annotationId) => {
              const annotation = annotatedText.annotations.find(a => a.id === annotationId)
              if (!annotation) return <span key={`${index}-${annotationId}`}>{segment.text}</span>

              return (
                <span
                  key={`${index}-${annotationId}`}
                  className="annotation-highlight"
                  style={{ 
                    backgroundColor: `${annotation.color}40`,
                    borderBottom: `2px solid ${annotation.color}`
                  }}
                >
                  {segment.text}
                  <span 
                    className="ml-1 px-1 text-xs font-bold text-white rounded"
                    style={{ backgroundColor: annotation.color }}
                  >
                    {annotation.markerId}
                  </span>
                </span>
              )
            })
          })}
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="page-break">
        <h3 className="text-xl font-bold mb-4">💡 Detailed Feedback</h3>
        
        {/* Strengths and Improvements */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border border-green-300 bg-green-50 p-4 rounded">
            <h4 className="font-bold text-green-800 mb-2">🌟 Key Strengths</h4>
            <ul className="text-sm space-y-1">
              {evalData.summary.strengths.map((strength, index) => (
                <li key={index} className="text-green-700">• {strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="border border-blue-300 bg-blue-50 p-4 rounded">
            <h4 className="font-bold text-blue-800 mb-2">📈 Areas for Growth</h4>
            <ul className="text-sm space-y-1">
              {evalData.summary.improvements.map((improvement, index) => (
                <li key={index} className="text-blue-700">• {improvement}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Next Steps */}
        <div className="border border-purple-300 bg-purple-50 p-4 rounded mb-6">
          <h4 className="font-bold text-purple-800 mb-2">🎯 Next Steps</h4>
          <p className="text-sm text-purple-700">{evalData.summary.nextSteps}</p>
        </div>

        {/* Annotation Details */}
        <div className="mb-6">
          <h4 className="font-bold mb-3">📝 Annotation Details</h4>
          <div className="space-y-3">
            {evalData.annotations.slice(0, 10).map((annotation) => (
              <div key={annotation.id} className="border p-3 rounded text-sm">
                <div className="flex items-center mb-1">
                  <span 
                    className="inline-block w-6 h-6 text-xs text-white rounded text-center leading-6 mr-2"
                    style={{ backgroundColor: annotation.color }}
                  >
                    {annotation.markerId}
                  </span>
                  <strong>{annotation.category} - {annotation.severity}</strong>
                </div>
                <p><strong>Text:</strong> "{annotation.originalText}"</p>
                {annotation.suggestedText && (
                  <p><strong>Suggestion:</strong> "{annotation.suggestedText}"</p>
                )}
                <p className="text-gray-600">{annotation.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-600">
          <p>This evaluation was generated using AI technology on {new Date(evalData.metadata.timestamp).toLocaleDateString()}.</p>
          <p>Processing time: {evalData.metadata.processingTime}ms | Confidence: {(evalData.metadata.confidence * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  )
}

export default PrintableReport