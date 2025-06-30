// Annotation Generator
// Creates color-coded annotations and professional reports matching sample_output.html

import type { EvaluationResult, AnnotationMarker, FeedbackBlock } from './types'
import type { StructuredEssay } from '../types'

export interface AnnotatedText {
  segments: TextSegment[]
  annotations: ProcessedAnnotation[]
  feedbackBlocks: ProcessedFeedbackBlock[]
  legend: CategoryLegend[]
}

export interface TextSegment {
  text: string
  startIndex: number
  endIndex: number
  annotations: string[] // Array of annotation IDs
  isAnnotated: boolean
}

export interface ProcessedAnnotation {
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

export interface ProcessedFeedbackBlock {
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

export interface CategoryLegend {
  id: string
  name: string
  color: string
  description: string
}

export class AnnotationGenerator {
  private readonly categoryColors = {
    grammar: '#ef4444',        // Red
    vocabulary: '#3b82f6',     // Blue  
    structure: '#22c55e',      // Green
    development: '#9333ea',    // Purple
    clarity: '#f97316',        // Orange
    strengths: '#10b981'       // Teal
  }

  private readonly categoryNames = {
    grammar: 'Grammar & Mechanics',
    vocabulary: 'Word Choice & Vocabulary',
    structure: 'Structure & Organization', 
    development: 'Development & Support',
    clarity: 'Clarity & Focus',
    strengths: 'Strengths & Excellence'
  }

  generateAnnotatedText(
    essay: StructuredEssay, 
    evaluation: EvaluationResult
  ): AnnotatedText {
    const text = essay.studentEssay.fullText
    
    // Step 1: Process annotations
    const processedAnnotations = this.processAnnotations(evaluation.annotations)
    
    // Step 2: Process feedback blocks
    const processedFeedbackBlocks = this.processFeedbackBlocks(evaluation.feedback)
    
    // Step 3: Generate text segments with annotation mapping
    const segments = this.generateTextSegments(text, processedAnnotations)
    
    // Step 4: Create legend
    const legend = this.generateLegend()
    
    return {
      segments,
      annotations: processedAnnotations,
      feedbackBlocks: processedFeedbackBlocks,
      legend
    }
  }


  private processAnnotations(annotations: AnnotationMarker[]): ProcessedAnnotation[] {
    return annotations.map((annotation, index) => ({
      id: `annotation_${index}`,
      markerId: `${annotation.category.substring(0, 1).toUpperCase()}${index + 1}`,
      category: annotation.category,
      color: this.categoryColors[annotation.category as keyof typeof this.categoryColors] || '#6b7280',
      severity: annotation.severity,
      originalText: annotation.originalText,
      suggestedText: annotation.suggestedText,
      explanation: annotation.explanation,
      feedbackBlockId: `feedback_${annotation.category}_${Math.floor(index / 3)}`
    }))
  }

  private processFeedbackBlocks(feedbackBlocks: FeedbackBlock[]): ProcessedFeedbackBlock[] {
    return feedbackBlocks.map((block, index) => ({
      id: `feedback_${block.category}_${index}`,
      category: block.category,
      categoryName: this.categoryNames[block.category as keyof typeof this.categoryNames] || block.category,
      type: block.type,
      title: block.title,
      content: block.content,
      color: this.categoryColors[block.category as keyof typeof this.categoryColors] || '#6b7280',
      priority: block.priority,
      relatedAnnotations: []
    }))
  }

  private generateTextSegments(text: string, annotations: ProcessedAnnotation[]): TextSegment[] {
    const segments: TextSegment[] = []
    const sortedAnnotations = [...annotations].sort((a, b) => {
      const aStart = text.indexOf(a.originalText)
      const bStart = text.indexOf(b.originalText)
      return aStart - bStart
    })

    let currentIndex = 0
    
    for (const annotation of sortedAnnotations) {
      const startIndex = text.indexOf(annotation.originalText, currentIndex)
      
      if (startIndex === -1) continue
      
      // Add text before annotation if any
      if (startIndex > currentIndex) {
        segments.push({
          text: text.substring(currentIndex, startIndex),
          startIndex: currentIndex,
          endIndex: startIndex,
          annotations: [],
          isAnnotated: false
        })
      }
      
      // Add annotated segment
      const endIndex = startIndex + annotation.originalText.length
      segments.push({
        text: annotation.originalText,
        startIndex,
        endIndex,
        annotations: [annotation.id],
        isAnnotated: true
      })
      
      currentIndex = endIndex
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      segments.push({
        text: text.substring(currentIndex),
        startIndex: currentIndex,
        endIndex: text.length,
        annotations: [],
        isAnnotated: false
      })
    }
    
    return segments
  }

  private generateLegend(): CategoryLegend[] {
    return Object.entries(this.categoryColors).map(([id, color]) => ({
      id,
      name: this.categoryNames[id as keyof typeof this.categoryNames],
      color,
      description: this.getCategoryDescription(id)
    }))
  }

  private getCategoryDescription(categoryId: string): string {
    const descriptions = {
      grammar: 'Grammar, punctuation, spelling, mechanics',
      vocabulary: 'Advanced vocabulary and word choice',
      structure: 'Organization, transitions, essay structure',
      development: 'Ideas development, examples, evidence',
      clarity: 'Clear communication and focus',
      strengths: 'Exceptional techniques and qualities'
    }
    
    return descriptions[categoryId as keyof typeof descriptions] || ''
  }
}