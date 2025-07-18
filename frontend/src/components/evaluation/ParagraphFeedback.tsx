import type { ParagraphFeedback as ParagraphFeedbackType } from '../../types/evaluation'

interface ParagraphFeedbackProps {
  paragraphFeedback: ParagraphFeedbackType[]
}

const ParagraphFeedback = ({ paragraphFeedback }: ParagraphFeedbackProps) => {
  // Add defensive checks for undefined/null props
  const safeParagraphFeedback = paragraphFeedback || []

  if (safeParagraphFeedback.length === 0) {
    return null
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'excellent': return '🏆'
      case 'positive': return '👍'
      case 'needs-improvement': return '📝'
      default: return '📄'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'excellent': return 'border-yellow-200 bg-yellow-50'
      case 'positive': return 'border-green-200 bg-green-50'
      case 'needs-improvement': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500'
      case 'medium': return 'border-l-4 border-l-yellow-500'
      case 'low': return 'border-l-4 border-l-green-500'
      default: return 'border-l-4 border-l-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        📄 Paragraph-by-Paragraph Analysis
      </h2>
      
      <div className="space-y-4">
        {safeParagraphFeedback.map((feedback) => (
          <div
            key={`paragraph-${feedback.paragraphNumber}`}
            className={`p-4 rounded-lg border-2 ${getTypeColor(feedback.type)} ${getPriorityBorder(feedback.priority)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-2xl">
                {getTypeIcon(feedback.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {getTypeIcon(feedback.type)} {feedback.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    (Priority: {feedback.priority})
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {feedback.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {safeParagraphFeedback.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Using Paragraph Feedback
          </h3>
          <p className="text-blue-800 text-sm">
            Each paragraph has been analyzed individually to provide targeted feedback. 
            Focus on the high-priority items first, then work through medium and low priority suggestions.
          </p>
        </div>
      )}
    </div>
  )
}

export default ParagraphFeedback