import type { FeedbackBlock } from '../../types/evaluation'

interface FeedbackSectionProps {
  feedbackBlocks: FeedbackBlock[]
  strengths: string[]
  improvements: string[]
  nextSteps: string
}

const FeedbackSection = ({ feedbackBlocks, strengths, improvements, nextSteps }: FeedbackSectionProps) => {
  // Add defensive checks for undefined/null props
  const safeFeedbackBlocks = feedbackBlocks || []
  const safeStrengths = strengths || []
  const safeImprovements = improvements || []
  const safeNextSteps = nextSteps || 'No specific next steps provided.'

  // Group feedback blocks by category
  const groupedFeedback = safeFeedbackBlocks.reduce((groups, block) => {
    if (!block || !block.category) {
      console.warn('Invalid feedback block:', block)
      return groups
    }
    if (!groups[block.category]) {
      groups[block.category] = []
    }
    groups[block.category].push(block)
    return groups
  }, {} as Record<string, FeedbackBlock[]>)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return '✅'
      case 'improvement': return '📈'
      case 'suggestion': return '💡'
      default: return '📝'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        💡 Detailed Feedback & Recommendations
      </h2>

      {/* Overall Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Strengths */}
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center">
            <span className="mr-2">🌟</span>
            Key Strengths
          </h3>
          <ul className="space-y-2">
            {safeStrengths.map((strength, index) => (
              <li key={index} className="text-green-700 text-sm flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <span className="mr-2">📈</span>
            Areas for Growth
          </h3>
          <ul className="space-y-2">
            {safeImprovements.map((improvement, index) => (
              <li key={index} className="text-blue-700 text-sm flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Category-Specific Feedback */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Category-Specific Feedback
        </h3>
        
        {Object.entries(groupedFeedback).map(([category, blocks]) => (
          <div key={`category-${category}`} className="space-y-3">
            <h4 className="font-medium text-gray-700 capitalize flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: blocks[0]?.color || '#6b7280' }}
              ></div>
              {blocks[0]?.categoryName || category}
            </h4>
            
            <div className="grid gap-3 md:grid-cols-2">
              {blocks.map((block, index) => (
                <div 
                  key={block.id || `block-${category}-${index}`} 
                  className={`border rounded-lg p-4 ${getPriorityColor(block.priority || 'medium')}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <span className="mr-2">{getTypeIcon(block.type || 'default')}</span>
                      <h5 className="font-medium text-gray-800 text-sm">{block.title || 'Untitled'}</h5>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      block.priority === 'high' ? 'bg-red-100 text-red-700' :
                      block.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {block.priority || 'medium'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {block.content || 'No content provided'}
                  </p>
                  {block.relatedAnnotations && block.relatedAnnotations.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Related annotations: {block.relatedAnnotations.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="mt-8 border border-purple-200 bg-purple-50 rounded-lg p-4">
        <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
          <span className="mr-2">🎯</span>
          Next Steps for Improvement
        </h3>
        <p className="text-purple-700 text-sm leading-relaxed">
          {safeNextSteps}
        </p>
      </div>

      {/* Feedback Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{safeStrengths.length}</div>
            <div className="text-xs text-gray-600">Strengths</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{safeImprovements.length}</div>
            <div className="text-xs text-gray-600">Improvements</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{safeFeedbackBlocks.length}</div>
            <div className="text-xs text-gray-600">Feedback Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {safeFeedbackBlocks.filter(b => b.priority === 'high').length}
            </div>
            <div className="text-xs text-gray-600">High Priority</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedbackSection