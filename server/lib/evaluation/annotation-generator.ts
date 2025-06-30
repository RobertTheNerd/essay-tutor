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

  generateHTMLReport(
    essay: StructuredEssay,
    evaluation: EvaluationResult,
    studentInfo?: {
      name?: string
      grade?: string
      date?: string
    }
  ): string {
    const annotatedText = this.generateAnnotatedText(essay, evaluation)
    
    return this.buildHTMLReport(
      essay,
      evaluation,
      annotatedText,
      studentInfo
    )
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

  private buildHTMLReport(
    essay: StructuredEssay,
    evaluation: EvaluationResult,
    annotatedText: AnnotatedText,
    studentInfo?: {
      name?: string
      grade?: string
      date?: string
    }
  ): string {
    const studentName = studentInfo?.name || 'Student'
    const grade = studentInfo?.grade || evaluation.rubric.name
    const date = studentInfo?.date || new Date().toLocaleDateString()
    
    const overallScoreText = this.getScoreDescription(evaluation.overall)
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ISEE Essay Evaluation - ${studentName}</title>
    <style>
        ${this.getReportCSS()}
    </style>
</head>
<body>
    <div class="header">
        <h1>📝 ISEE Essay Evaluation - Score ${evaluation.overall}/5</h1>
        <div class="prompt">
            <strong>Prompt:</strong> ${essay.writingPrompt?.text || 'Essay writing prompt'}
        </div>
    </div>

    <div class="student-info">
        <div><strong>Student:</strong> ${studentName}</div>
        <div><strong>Date:</strong> ${date}</div>
        <div><strong>Grade Level:</strong> ${grade}</div>
        <div><strong>Score:</strong> ${evaluation.overall}/5 (${overallScoreText})</div>
    </div>

    <div class="legend">
        ${annotatedText.legend.map(item => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${item.color}"></div>
                <span>${item.name}</span>
            </div>
        `).join('')}
    </div>

    <div class="essay-container">
        <div class="essay-title">
            ${evaluation.rubric.name} Essay with Professional Annotations
        </div>

        <div class="essay-text">
            ${this.generateAnnotatedHTML(annotatedText)}
        </div>
    </div>

    ${this.generateScoreSummaryHTML(evaluation)}
    ${this.generateFeedbackHTML(annotatedText.feedbackBlocks)}

</body>
</html>`
  }

  private generateAnnotatedHTML(annotatedText: AnnotatedText): string {
    return annotatedText.segments.map(segment => {
      if (!segment.isAnnotated) {
        return this.escapeHtml(segment.text)
      }
      
      const annotation = annotatedText.annotations.find(a => 
        segment.annotations.includes(a.id)
      )
      
      if (!annotation) {
        return this.escapeHtml(segment.text)
      }
      
      const colorClass = this.getCSSColorClass(annotation.category)
      const markerClass = this.getCSSMarkerClass(annotation.category)
      
      return `<span class="marked-text ${colorClass}">${this.escapeHtml(segment.text)}<span class="annotation-marker ${markerClass}">${annotation.markerId}</span></span>`
    }).join('')
  }

  private generateScoreSummaryHTML(evaluation: EvaluationResult): string {
    const scoreItems = Object.entries(evaluation.scores).map(([category, score]) => {
      const categoryName = this.categoryNames[category as keyof typeof this.categoryNames] || category
      return `
        <div class="score-item">
            <span>${categoryName}</span>
            <span class="score-badge">${score}/5</span>
        </div>
      `
    }).join('')

    return `
    <div class="score-summary">
        <h3>📊 Detailed Score Breakdown</h3>
        <div class="score-grid">
            ${scoreItems}
        </div>
        <div class="average-score">Overall Score: ${evaluation.overall}/5</div>
    </div>
    `
  }

  private generateFeedbackHTML(feedbackBlocks: ProcessedFeedbackBlock[]): string {
    const feedbackHTML = feedbackBlocks.map(block => `
      <div class="feedback-block ${block.category}-block">
          <div class="feedback-header">${block.title}</div>
          <div class="feedback-content">${this.escapeHtml(block.content)}</div>
      </div>
    `).join('')

    return `
    <div class="feedback-section">
        <h3>💡 Detailed Feedback & Recommendations</h3>
        ${feedbackHTML}
    </div>
    `
  }

  private getCSSColorClass(category: string): string {
    const classMap = {
      grammar: 'grammar-mark',
      vocabulary: 'vocabulary-mark', 
      structure: 'structure-mark',
      development: 'development-mark',
      clarity: 'clarity-mark',
      strengths: 'strengths-mark'
    }
    
    return classMap[category as keyof typeof classMap] || 'default-mark'
  }

  private getCSSMarkerClass(category: string): string {
    const classMap = {
      grammar: 'marker-grammar',
      vocabulary: 'marker-vocabulary',
      structure: 'marker-structure', 
      development: 'marker-development',
      clarity: 'marker-clarity',
      strengths: 'marker-strengths'
    }
    
    return classMap[category as keyof typeof classMap] || 'marker-default'
  }

  private getScoreDescription(score: number): string {
    if (score >= 4.5) return 'Exceptional'
    if (score >= 3.5) return 'Advanced'
    if (score >= 2.5) return 'Proficient'
    if (score >= 1.5) return 'Developing'
    return 'Needs Improvement'
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  private getReportCSS(): string {
    // This would contain the full CSS from sample_output.html
    // For brevity, returning a simplified version
    return `
      body {
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 1rem;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        color: #1e293b;
        font-size: 14px;
      }
      
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        border-radius: 12px;
        padding: 2rem 1.5rem 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      }
      
      .marked-text {
        position: relative;
        padding: 1px 2px;
        border-radius: 2px;
      }
      
      .grammar-mark { background: linear-gradient(120deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.15) 100%); }
      .vocabulary-mark { background: linear-gradient(120deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%); }
      .structure-mark { background: linear-gradient(120deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.15) 100%); }
      .development-mark { background: linear-gradient(120deg, rgba(147, 51, 234, 0.25) 0%, rgba(147, 51, 234, 0.15) 100%); }
      .clarity-mark { background: linear-gradient(120deg, rgba(249, 115, 22, 0.25) 0%, rgba(249, 115, 22, 0.15) 100%); }
      .strengths-mark { background: linear-gradient(120deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.15) 100%); }
      
      .annotation-marker {
        display: inline;
        color: white;
        font-size: 0.65rem;
        padding: 2px 5px;
        border-radius: 10px;
        margin-left: 3px;
        font-weight: 700;
        vertical-align: super;
      }
      
      .marker-grammar { background: linear-gradient(135deg, #ef4444, #dc2626); }
      .marker-vocabulary { background: linear-gradient(135deg, #3b82f6, #2563eb); }
      .marker-structure { background: linear-gradient(135deg, #22c55e, #16a34a); }
      .marker-development { background: linear-gradient(135deg, #9333ea, #7c3aed); }
      .marker-clarity { background: linear-gradient(135deg, #f97316, #ea580c); }
      .marker-strengths { background: linear-gradient(135deg, #10b981, #059669); }
      
      .score-summary {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        margin: 2rem 0;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }
      
      .score-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .score-badge {
        background: linear-gradient(135deg, #059669, #047857);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.8rem;
      }
    `
  }
}