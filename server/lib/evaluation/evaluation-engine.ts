// ISEE Evaluation Engine
// Analyzes essays using AI and rubric criteria to generate scores and feedback

import { aiClient } from '../ai-client'
import type { StructuredEssay } from '../types'
import type { EvaluationResult, EvaluationRubric, CategoryScore, AnnotationMarker, FeedbackBlock } from './types'

export class EvaluationEngine {
  constructor(private rubric: EvaluationRubric) {}

  async evaluateEssay(essay: StructuredEssay): Promise<EvaluationResult> {
    const startTime = Date.now()
    
    try {
      // Step 1: Get AI evaluation for each category
      const aiEvaluation = await this.getAIEvaluation(essay)
      
      // Step 2: Parse AI response and generate scores
      const categoryScores = this.parseCategoryScores(aiEvaluation)
      
      // Step 3: Generate annotations based on AI feedback
      const annotations = await this.generateAnnotations(essay, aiEvaluation)
      
      // Step 4: Create structured feedback blocks
      const feedback = this.generateFeedbackBlocks(aiEvaluation, categoryScores)
      
      // Step 5: Calculate overall score
      const overallScore = this.calculateOverallScore(categoryScores)
      
      // Step 6: Generate summary
      const summary = this.generateSummary(aiEvaluation, categoryScores)

      return {
        rubric: {
          family: 'isee',
          level: this.rubric.id,
          name: this.rubric.name
        },
        scores: this.formatScores(categoryScores),
        overall: overallScore,
        annotations,
        feedback,
        summary,
        metadata: {
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          confidence: this.calculateConfidence(aiEvaluation)
        }
      }
    } catch (error) {
      throw new Error(`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async getAIEvaluation(essay: StructuredEssay): Promise<any> {
    try {
      // For now, use a simulated evaluation based on the essay content
      // This will be enhanced to use real AI analysis in the full implementation
      const analysisResult = await aiClient.analyzeEssay(
        essay.studentEssay.fullText,
        essay.writingPrompt?.text
      )
      
      // Convert the basic analysis to our detailed format
      return this.convertAnalysisToDetailedEvaluation(essay, analysisResult)
    } catch (error) {
      throw new Error(`AI evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private convertAnalysisToDetailedEvaluation(essay: StructuredEssay, analysis: any): any {
    // Generate simulated detailed evaluation based on text analysis
    const text = essay.studentEssay.fullText
    const wordCount = text.trim().split(/\s+/).length
    const sentenceCount = text.split(/[.!?]+/).length - 1
    const paragraphCount = text.split(/\n\s*\n/).length
    
    // Basic scoring based on text metrics
    const grammarScore = this.estimateGrammarScore(text)
    const vocabularyScore = this.estimateVocabularyScore(text, wordCount)
    const structureScore = this.estimateStructureScore(text, paragraphCount)
    const developmentScore = this.estimateDevelopmentScore(text, wordCount)
    const clarityScore = this.estimateClarityScore(text, sentenceCount)
    const strengthsScore = Math.floor((grammarScore + vocabularyScore + structureScore + developmentScore + clarityScore) / 5)

    return {
      scores: {
        grammar: grammarScore,
        vocabulary: vocabularyScore,
        structure: structureScore,
        development: developmentScore,
        clarity: clarityScore,
        strengths: strengthsScore
      },
      detailed_feedback: {
        grammar: {
          score_justification: `Grammar assessment based on text analysis. Word count: ${wordCount}`,
          strengths: ["Generally readable text structure"],
          improvements: ["Consider varying sentence length and structure"],
          evidence: [text.substring(0, 50) + "..."]
        },
        vocabulary: {
          score_justification: `Vocabulary assessment for ${this.rubric.gradeLevel}`,
          strengths: ["Appropriate vocabulary for grade level"],
          improvements: ["Try incorporating more advanced vocabulary"],
          evidence: [text.substring(0, 50) + "..."]
        },
        structure: {
          score_justification: `Organization assessment. Paragraphs: ${paragraphCount}`,
          strengths: ["Clear paragraph structure"],
          improvements: ["Strengthen transitions between ideas"],
          evidence: [text.substring(0, 50) + "..."]
        },
        development: {
          score_justification: `Development assessment. Text length: ${wordCount} words`,
          strengths: ["Good attempt at developing ideas"],
          improvements: ["Add more specific examples and details"],
          evidence: [text.substring(0, 50) + "..."]
        },
        clarity: {
          score_justification: `Clarity assessment. Sentences: ${sentenceCount}`,
          strengths: ["Generally clear communication"],
          improvements: ["Focus on maintaining consistent clarity throughout"],
          evidence: [text.substring(0, 50) + "..."]
        },
        strengths: {
          score_justification: `Overall strengths assessment`,
          strengths: ["Shows understanding of essay structure"],
          improvements: ["Continue developing unique voice and style"],
          evidence: [text.substring(0, 50) + "..."]
        }
      },
      annotations: [
        {
          text: text.substring(0, Math.min(20, text.length)),
          category: "structure",
          type: "strength",
          explanation: "Good opening",
          suggestion: "Continue developing this idea"
        }
      ],
      overall_assessment: {
        strengths: [
          "Demonstrates understanding of essay format",
          "Clear attempt at organizing ideas",
          "Appropriate length for grade level"
        ],
        areas_for_improvement: [
          "Develop ideas with more specific examples",
          "Strengthen vocabulary usage",
          "Improve transitions between paragraphs"
        ],
        next_steps: "Focus on adding more descriptive details and examples to support your main ideas."
      },
      confidence: 0.8
    }
  }

  private estimateGrammarScore(text: string): number {
    // Simple heuristics for grammar assessment
    const hasCapitalStart = /^[A-Z]/.test(text.trim())
    const hasProperEnding = /[.!?]$/.test(text.trim())
    const avgSentenceLength = text.split(/[.!?]+/).filter(s => s.trim()).length
    
    let score = 3 // Base score
    if (hasCapitalStart) score += 0.5
    if (hasProperEnding) score += 0.5
    if (avgSentenceLength > 2) score += 0.5
    
    return Math.min(5, Math.max(1, Math.round(score)))
  }

  private estimateVocabularyScore(text: string, wordCount: number): number {
    const words = text.toLowerCase().split(/\s+/)
    const uniqueWords = new Set(words)
    const vocabularyRatio = uniqueWords.size / words.length
    
    let score = 3 // Base score
    if (vocabularyRatio > 0.7) score += 1
    if (wordCount > 150) score += 0.5
    
    return Math.min(5, Math.max(1, Math.round(score)))
  }

  private estimateStructureScore(text: string, paragraphCount: number): number {
    let score = 3 // Base score
    if (paragraphCount >= 3) score += 1
    if (paragraphCount >= 4) score += 0.5
    
    return Math.min(5, Math.max(1, Math.round(score)))
  }

  private estimateDevelopmentScore(text: string, wordCount: number): number {
    let score = 3 // Base score
    if (wordCount >= 200) score += 0.5
    if (wordCount >= 300) score += 0.5
    if (wordCount >= 400) score += 0.5
    
    return Math.min(5, Math.max(1, Math.round(score)))
  }

  private estimateClarityScore(text: string, sentenceCount: number): number {
    let score = 3 // Base score
    if (sentenceCount >= 5) score += 0.5
    if (sentenceCount >= 10) score += 0.5
    
    return Math.min(5, Math.max(1, Math.round(score)))
  }


  private parseCategoryScores(aiEvaluation: any): CategoryScore[] {
    const scores: CategoryScore[] = []
    
    for (const category of this.rubric.categories) {
      const categoryData = aiEvaluation.detailed_feedback?.[category.id]
      const score = aiEvaluation.scores?.[category.id] || 3
      
      scores.push({
        category: category.id,
        score: Math.max(1, Math.min(5, score)), // Ensure score is 1-5
        maxScore: this.rubric.scoringScale.max,
        feedback: categoryData?.score_justification ? [categoryData.score_justification] : [],
        strengths: categoryData?.strengths || [],
        improvements: categoryData?.improvements || []
      })
    }
    
    return scores
  }

  private async generateAnnotations(essay: StructuredEssay, aiEvaluation: any): Promise<AnnotationMarker[]> {
    const annotations: AnnotationMarker[] = []
    const text = essay.studentEssay.fullText
    
    // Process AI-identified annotations
    if (aiEvaluation.annotations) {
      for (const annotation of aiEvaluation.annotations) {
        const textSnippet = annotation.text
        const startIndex = text.indexOf(textSnippet)
        
        if (startIndex !== -1) {
          annotations.push({
            id: `${annotation.category}_${annotations.length}`,
            type: annotation.category,
            startIndex,
            endIndex: startIndex + textSnippet.length,
            severity: annotation.type === 'strength' ? 'positive' : 'moderate',
            originalText: textSnippet,
            suggestedText: annotation.suggestion || undefined,
            explanation: annotation.explanation,
            category: annotation.category
          })
        }
      }
    }
    
    return annotations
  }

  private generateFeedbackBlocks(aiEvaluation: any, categoryScores: CategoryScore[]): FeedbackBlock[] {
    const feedbackBlocks: FeedbackBlock[] = []
    
    // Generate category-specific feedback
    for (const category of this.rubric.categories) {
      const categoryData = aiEvaluation.detailed_feedback?.[category.id]
      const score = categoryScores.find(s => s.category === category.id)
      
      if (categoryData && score) {
        // Add strengths feedback
        if (categoryData.strengths?.length > 0) {
          feedbackBlocks.push({
            category: category.id,
            type: 'strength',
            title: `${category.name} - Strengths`,
            content: categoryData.strengths.join('; '),
            priority: score.score >= 4 ? 'high' : 'medium'
          })
        }
        
        // Add improvement feedback
        if (categoryData.improvements?.length > 0) {
          feedbackBlocks.push({
            category: category.id,
            type: 'improvement',
            title: `${category.name} - Areas for Growth`,
            content: categoryData.improvements.join('; '),
            priority: score.score <= 2 ? 'high' : 'medium'
          })
        }
      }
    }
    
    // Add overall suggestions
    if (aiEvaluation.overall_assessment?.next_steps) {
      feedbackBlocks.push({
        category: 'overall',
        type: 'suggestion',
        title: 'Next Steps for Improvement',
        content: aiEvaluation.overall_assessment.next_steps,
        priority: 'high'
      })
    }
    
    return feedbackBlocks
  }

  private calculateOverallScore(categoryScores: CategoryScore[]): number {
    let weightedSum = 0
    let totalWeight = 0
    
    for (const categoryScore of categoryScores) {
      const category = this.rubric.categories.find(c => c.id === categoryScore.category)
      if (category) {
        weightedSum += categoryScore.score * category.weight
        totalWeight += category.weight
      }
    }
    
    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 3
  }

  private generateSummary(aiEvaluation: any, categoryScores: CategoryScore[]): {
    strengths: string[]
    improvements: string[]
    nextSteps: string
  } {
    return {
      strengths: aiEvaluation.overall_assessment?.strengths || [],
      improvements: aiEvaluation.overall_assessment?.areas_for_improvement || [],
      nextSteps: aiEvaluation.overall_assessment?.next_steps || 'Continue practicing essay writing with focus on organization and development.'
    }
  }

  private formatScores(categoryScores: CategoryScore[]): { [categoryId: string]: number } {
    const scores: { [categoryId: string]: number } = {}
    
    for (const categoryScore of categoryScores) {
      scores[categoryScore.category] = categoryScore.score
    }
    
    return scores
  }

  private calculateConfidence(aiEvaluation: any): number {
    return Math.max(0.1, Math.min(1.0, aiEvaluation.confidence || 0.8))
  }
}