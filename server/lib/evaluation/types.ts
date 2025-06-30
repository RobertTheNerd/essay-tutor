// Evaluation system type definitions
// These interfaces define the hierarchical rubric system

export interface EvaluationCategory {
  id: string
  name: string
  description: string
  color: string // Hex color for annotations
  weight: number // Relative weight in overall scoring
}

export interface ScoringScale {
  min: number
  max: number
  type: 'integer' | 'decimal'
  labels?: { [score: number]: string } // Optional labels for scores
}

export interface EvaluationRubric {
  id: string
  name: string
  description: string
  categories: EvaluationCategory[]
  scoringScale: ScoringScale
  gradeLevel: string
  expectations: {
    vocabulary: 'basic' | 'intermediate' | 'advanced' | 'sophisticated'
    complexity: 'simple' | 'moderate' | 'complex' | 'sophisticated'
    analysis: 'basic' | 'developing' | 'proficient' | 'advanced'
  }
}

export interface TestLevel {
  id: string
  name: string
  gradeRange: string
  description: string
  rubric: EvaluationRubric
}

export interface TestFamily {
  id: string
  name: string
  description: string
  levels: TestLevel[]
}

// Evaluation result types
export interface CategoryScore {
  category: string
  score: number
  maxScore: number
  feedback: string[]
  strengths: string[]
  improvements: string[]
}

export interface AnnotationMarker {
  id: string
  type: string // Category ID
  startIndex: number
  endIndex: number
  severity: 'minor' | 'moderate' | 'major' | 'positive'
  originalText: string
  suggestedText?: string
  explanation: string
  category: string
}

export interface FeedbackBlock {
  category: string
  type: 'strength' | 'improvement' | 'suggestion'
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
}

export interface EvaluationResult {
  rubric: {
    family: string
    level: string
    name: string
  }
  scores: {
    [categoryId: string]: number
  }
  overall: number
  annotations: AnnotationMarker[]
  feedback: FeedbackBlock[]
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

// Annotation generation types
export interface AnnotationConfig {
  colors: { [categoryId: string]: string }
  markerStyles: { [categoryId: string]: string }
  feedbackComplexity: 'elementary' | 'middle' | 'upper' | 'high_school'
}