// Evaluation types for frontend components
// Based on backend API response structure

export interface EvaluationData {
  rubric: {
    family: string
    level: string
    name: string
  }
  scores: { [categoryId: string]: number }
  overall: number
  annotations: AnnotationMarker[]
  feedback: FeedbackBlock[]
  paragraphFeedback?: ParagraphFeedback[]
  summary: {
    strengths: string[]
    improvements: string[]
    nextSteps: string
  }
  metadata: {
    processingTime: number
    timestamp: string
    confidence: number
  }
}

export interface EvaluationResponse {
  success: boolean
  evaluation?: EvaluationData
  error?: string
}

export interface AnnotationMarker {
  id: string
  markerId: string
  category: string
  color: string
  severity: 'minor' | 'moderate' | 'major' | 'positive'
  originalText: string
  suggestedText?: string
  explanation: string
  feedbackBlockId?: string
}

export interface FeedbackBlock {
  id: string
  category: string
  categoryName: string
  type: 'strength' | 'improvement' | 'suggestion'
  title: string
  content: string
  color: string
  priority: 'high' | 'medium' | 'low'
  relatedAnnotations: string[]
}

export interface ParagraphFeedback {
  paragraphNumber: number
  title: string
  content: string
  type: 'positive' | 'excellent' | 'needs-improvement'
  priority: 'high' | 'medium' | 'low'
}

export interface CategoryLegend {
  id: string
  name: string
  color: string
  description?: string
}

export interface CategoryColors {
  ideas: string
  organization: string
  voice: string
  wordChoice: string
  fluency: string
  conventions: string
}

export const CATEGORY_COLORS: CategoryColors = {
  ideas: '#9333ea',          // Purple
  organization: '#22c55e',   // Green
  voice: '#f97316',          // Orange
  wordChoice: '#3b82f6',     // Blue
  fluency: '#10b981',        // Teal
  conventions: '#ef4444'     // Red
}

export const CATEGORY_NAMES = {
  ideas: 'Ideas & Content',
  organization: 'Organization',
  voice: 'Voice & Focus',
  wordChoice: 'Word Choice',
  fluency: 'Sentence Fluency',
  conventions: 'Conventions'
}

// Performance level labels for 6+1 Trait scoring
export const PERFORMANCE_LEVELS = {
  1: 'Beginning',
  2: 'Developing', 
  3: 'Proficient',
  4: 'Advanced'
} as const

export type PerformanceLevel = keyof typeof PERFORMANCE_LEVELS

// Helper function to get performance level from score
export function getPerformanceLevel(score: number): string {
  const roundedScore = Math.max(1, Math.min(4, Math.round(score))) as PerformanceLevel
  return PERFORMANCE_LEVELS[roundedScore]
}

// Helper function to get performance level color class
export function getPerformanceLevelClass(score: number): string {
  const roundedScore = Math.max(1, Math.min(4, Math.round(score)))
  switch (roundedScore) {
    case 1: return 'performance-beginning'
    case 2: return 'performance-developing'
    case 3: return 'performance-proficient'
    case 4: return 'performance-advanced'
    default: return 'performance-developing'
  }
}

// ISEE Level Configuration
export const ISEE_LEVELS = {
  'elementary': {
    id: 'elementary',
    name: 'Elementary Level',
    grades: 'Grades 2-4',
    color: '#22c55e',
    gradient: 'from-green-400 to-green-600'
  },
  'middle': {
    id: 'middle', 
    name: 'Middle Level',
    grades: 'Grades 5-6',
    color: '#3b82f6',
    gradient: 'from-blue-400 to-blue-600'
  },
  'upper': {
    id: 'upper',
    name: 'Upper Level', 
    grades: 'Grades 7-8',
    color: '#8b5cf6',
    gradient: 'from-violet-400 to-violet-600'
  },
  'high': {
    id: 'high',
    name: 'High School Level',
    grades: 'Grades 9-12', 
    color: '#f59e0b',
    gradient: 'from-amber-400 to-amber-600'
  }
} as const

export type ISEELevel = keyof typeof ISEE_LEVELS

// Level progression gradient for visual indicators
export const LEVEL_PROGRESSION_GRADIENT = 'bg-gradient-to-r from-green-400 via-blue-500 via-violet-500 to-amber-400'

// Helper function to get performance level description with level context
export function getPerformanceDescription(score: number, level?: ISEELevel): string {
  const roundedScore = Math.max(1, Math.min(4, Math.round(score))) as PerformanceLevel
  const levelInfo = level ? ISEE_LEVELS[level] : null
  const gradeContext = levelInfo ? ` for ${levelInfo.grades.toLowerCase()}` : ''
  
  switch (roundedScore) {
    case 1: return `Writing shows beginning skills and needs significant support to meet expectations${gradeContext}.`
    case 2: return `Writing shows emerging skills with clear areas for growth and development${gradeContext}.`
    case 3: return `Writing meets expectations with solid skills and good understanding${gradeContext}.`
    case 4: return `Writing exceeds expectations with sophisticated skills and exceptional quality${gradeContext}.`
    default: return `Writing shows emerging skills with clear areas for growth and development${gradeContext}.`
  }
}

// Level-specific performance expectations
export const LEVEL_PERFORMANCE_EXPECTATIONS = {
  'elementary': {
    1: 'Writing shows beginning skills typical for grades 2-4. Ideas are simple and may need adult support to organize thoughts clearly.',
    2: 'Writing shows developing skills for elementary level. Shows emerging ability to express ideas with some organization and basic vocabulary.',
    3: 'Writing meets grade-level expectations for grades 2-4. Shows solid foundational skills with clear ideas and age-appropriate expression.',
    4: 'Writing exceeds expectations for elementary level. Demonstrates advanced vocabulary, creativity, and sophisticated thinking for young learners.'
  },
  'middle': {
    1: 'Writing shows beginning skills for grades 5-6. Ideas may be unclear and organization needs significant development for this level.',
    2: 'Writing shows developing skills for middle school level. Emerging ability to develop ideas with improved structure and vocabulary.',
    3: 'Writing meets expectations for grades 5-6. Shows good control of ideas, organization, and age-appropriate language conventions.',
    4: 'Writing exceeds expectations for middle school. Demonstrates mature thinking, strong organization, and advanced language skills.'
  },
  'upper': {
    1: 'Writing shows beginning skills for grades 7-8. Ideas and organization need significant development for high school readiness.',
    2: 'Writing shows developing skills for upper level. Emerging mastery of complex ideas with improving structure and expression.',
    3: 'Writing meets expectations for grades 7-8. Shows strong analytical thinking and solid preparation for high school writing.',
    4: 'Writing exceeds expectations for upper level. Demonstrates sophisticated analysis, mature voice, and exceptional writing skills.'
  },
  'high': {
    1: 'Writing shows beginning skills for grades 9-12. Significant development needed to meet college and career readiness standards.',
    2: 'Writing shows developing skills for high school level. Emerging ability to handle complex topics with improving critical thinking.',
    3: 'Writing meets expectations for grades 9-12. Shows college-ready skills with strong analysis and sophisticated expression.',
    4: 'Writing exceeds expectations for high school. Demonstrates exceptional critical thinking and advanced writing mastery.'
  }
} as const

// Category-specific level adaptations
export const LEVEL_CATEGORY_FOCUS = {
  'elementary': {
    'ideas': 'Creative thinking and basic topic development',
    'organization': 'Simple structure with beginning, middle, end',
    'voice': 'Personal expression and enthusiasm',
    'wordChoice': 'Descriptive words and expanding vocabulary',
    'fluency': 'Sentence variety and rhythm',
    'conventions': 'Basic spelling, punctuation, and capitalization'
  },
  'middle': {
    'ideas': 'Topic development with supporting details',
    'organization': 'Clear paragraphs with logical flow',
    'voice': 'Audience awareness and appropriate tone',
    'wordChoice': 'Precise vocabulary and varied expression',
    'fluency': 'Sentence combining and transitions',
    'conventions': 'Grammar accuracy and editing skills'
  },
  'upper': {
    'ideas': 'Analysis and critical thinking development',
    'organization': 'Complex structure with effective transitions',
    'voice': 'Strong perspective and engaging style',
    'wordChoice': 'Academic vocabulary and nuanced language',
    'fluency': 'Sophisticated sentence construction',
    'conventions': 'Advanced grammar and formatting'
  },
  'high': {
    'ideas': 'Deep analysis and original critical thinking',
    'organization': 'Sophisticated structure and coherent argument',
    'voice': 'Mature, compelling, and authentic expression',
    'wordChoice': 'Precise, powerful, and context-appropriate language',
    'fluency': 'Complex syntax and seamless flow',
    'conventions': 'Mastery of standard written English'
  }
} as const

// Helper function to get ISEE level from rubric data
export function getISEELevelFromRubric(rubric: any): ISEELevel {
  if (!rubric?.level) return 'upper' // Default to upper level
  const levelKey = rubric.level.toLowerCase()
  if (levelKey in ISEE_LEVELS) {
    return levelKey as ISEELevel
  }
  return 'upper' // Fallback to upper level
}

// Helper function to get level-specific category description
export function getLevelCategoryDescription(level: ISEELevel, category: string): string {
  const categoryKey = category.toLowerCase()
  const levelFocus = LEVEL_CATEGORY_FOCUS[level]
  
  // Map common category variations to our standard keys
  const categoryMap: { [key: string]: keyof typeof levelFocus } = {
    'ideas': 'ideas',
    'content': 'ideas',
    'organization': 'organization',
    'structure': 'organization',
    'voice': 'voice',
    'focus': 'voice',
    'word choice': 'wordChoice',
    'wordchoice': 'wordChoice',
    'vocabulary': 'wordChoice',
    'sentence fluency': 'fluency',
    'fluency': 'fluency',
    'conventions': 'conventions',
    'grammar': 'conventions'
  }
  
  const mappedCategory = categoryMap[categoryKey] || 'ideas'
  return levelFocus[mappedCategory] || levelFocus.ideas
}

// Helper function to get level-specific performance expectations
export function getLevelPerformanceExpectation(level: ISEELevel, score: number): string {
  const roundedScore = Math.max(1, Math.min(4, Math.round(score))) as 1 | 2 | 3 | 4
  return LEVEL_PERFORMANCE_EXPECTATIONS[level][roundedScore]
}