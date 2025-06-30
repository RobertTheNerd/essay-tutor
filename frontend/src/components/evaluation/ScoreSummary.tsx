import { CATEGORY_COLORS, CATEGORY_NAMES } from '../../types/evaluation'

interface ScoreSummaryProps {
  scores: { [categoryId: string]: number }
  overall: number
  rubricName?: string
}

const ScoreSummary = ({ scores, overall, rubricName }: ScoreSummaryProps) => {
  const getScoreColor = (score: number): string => {
    if (score >= 4.5) return 'text-green-600 bg-green-100'
    if (score >= 3.5) return 'text-blue-600 bg-blue-100'
    if (score >= 2.5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 4.5) return 'Exceptional'
    if (score >= 3.5) return 'Advanced'
    if (score >= 2.5) return 'Proficient'
    if (score >= 1.5) return 'Developing'
    return 'Needs Improvement'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📊 Evaluation Results
        </h2>
        {rubricName && (
          <p className="text-gray-600 text-sm">{rubricName}</p>
        )}
        <div className="mt-4">
          <div className="text-4xl font-bold text-blue-600 mb-1">
            {overall.toFixed(1)}/5
          </div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(overall)}`}>
            {getScoreLabel(overall)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(scores).map(([categoryId, score]) => {
          const categoryName = CATEGORY_NAMES[categoryId as keyof typeof CATEGORY_NAMES] || categoryId
          const categoryColor = CATEGORY_COLORS[categoryId as keyof typeof CATEGORY_COLORS] || '#6b7280'
          
          return (
            <div key={categoryId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: categoryColor }}
                  ></div>
                  <h3 className="font-medium text-gray-900 text-sm">{categoryName}</h3>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(score).split(' ')[0]}`}>
                  {score}/5
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    backgroundColor: categoryColor, 
                    width: `${(score / 5) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="mt-1">
                <span className={`text-xs px-2 py-1 rounded ${getScoreColor(score)}`}>
                  {getScoreLabel(score)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ScoreSummary