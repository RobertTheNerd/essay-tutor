import React from 'react'
import {
  getPerformanceLevel,
  getPerformanceLevelClass,
  getLevelCategoryDescription,
  getLevelPerformanceExpectation,
  ISEE_LEVELS,
  type ISEELevel,
} from '../../types/evaluation'

interface Category {
  name: string
  key: string
  score: number
}

interface CategoryFeedbackSummaryProps {
  categories: Category[]
  iseeLevel: ISEELevel
  categoryFeedback: { [key: string]: string }
}

const CategoryFeedbackSummary: React.FC<CategoryFeedbackSummaryProps> = ({
  categories,
  iseeLevel,
  categoryFeedback,
}) => {
  return (
    <div className="category-feedback-summary">
      <h3>📝 Writing Assessment Feedback</h3>
      <div className="category-feedback-grid">
        {categories.map(category => {
          const levelCategoryDescription = getLevelCategoryDescription(iseeLevel, category.name)
          const levelPerformanceExpectation = getLevelPerformanceExpectation(iseeLevel, category.score)
          const customFeedback = categoryFeedback[category.key]
          
          const feedback = customFeedback || 
            `${levelPerformanceExpectation} Focus area: ${levelCategoryDescription}.`
          
          return (
            <div key={category.key} className="category-feedback-item">
              <div className="category-header">
                <h4>{category.name}</h4>
                <div className="category-level-info">
                  <span className={`performance-badge ${getPerformanceLevelClass(category.score)}`}>
                    {getPerformanceLevel(category.score)}
                  </span>
                </div>
              </div>
              <div className="category-focus-description">
                <strong>Level Focus:</strong> {levelCategoryDescription}
              </div>
              <p className="category-feedback-text">{feedback}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryFeedbackSummary 