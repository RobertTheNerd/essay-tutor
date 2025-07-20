// Evaluation types for frontend components
// Based on backend API response structure

export interface EvaluationResponse {
  success: boolean
  evaluation?: {
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
  grammar: string
  vocabulary: string
  structure: string
  development: string
  clarity: string
  strengths: string
}

export const CATEGORY_COLORS: CategoryColors = {
  grammar: '#ef4444',        // Red
  vocabulary: '#3b82f6',     // Blue
  structure: '#22c55e',      // Green
  development: '#9333ea',    // Purple
  clarity: '#f97316',        // Orange
  strengths: '#10b981'       // Teal
}

export const CATEGORY_NAMES = {
  grammar: 'Grammar & Mechanics',
  vocabulary: 'Word Choice & Vocabulary',
  structure: 'Structure & Organization',
  development: 'Development & Support',
  clarity: 'Clarity & Focus',
  strengths: 'Strengths & Excellence'
}