// ISEE Evaluation Engine
// Analyzes essays using AI and rubric criteria to generate scores and feedback

import { aiClient } from '../ai-client'
import type { StructuredEssay } from '../types'
import type { EvaluationResult, EvaluationRubric, CategoryScore, AnnotationMarker, FeedbackBlock, ParagraphFeedback } from './types'

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
      
      // Step 7: Generate paragraph feedback
      const paragraphFeedback = this.generateParagraphFeedback(aiEvaluation)

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
        paragraphFeedback,
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
    // Use real AI analysis results
    const scores = {
      grammar: analysis.rubricScores.grammarMechanics,
      vocabulary: analysis.rubricScores.wordChoiceVocabulary,
      structure: analysis.rubricScores.structureOrganization,
      development: analysis.rubricScores.developmentSupport,
      clarity: analysis.rubricScores.clarityFocus,
      strengths: Math.round((analysis.rubricScores.grammarMechanics + 
                            analysis.rubricScores.wordChoiceVocabulary + 
                            analysis.rubricScores.structureOrganization + 
                            analysis.rubricScores.developmentSupport + 
                            analysis.rubricScores.clarityFocus) / 5)
    }

    // Convert AI feedback to structured format
    const aiAnnotations = this.convertAIAnnotations(analysis.annotations || [])
    
    return {
      scores,
      detailed_feedback: this.generateDetailedFeedback(analysis),
      annotations: aiAnnotations,
      paragraphFeedback: analysis.paragraphFeedback || [],
      overall_assessment: {
        strengths: analysis.strengths || ["Essay demonstrates effort and understanding"],
        areas_for_improvement: analysis.areasForImprovement || ["Continue developing writing skills"],
        next_steps: analysis.nextSteps || "Focus on continued improvement"
      },
      confidence: 0.85
    }
  }

  /**
   * Convert AI annotations to evaluation format
   */
  private convertAIAnnotations(aiAnnotations: any[]): any[] {
    return aiAnnotations.map((annotation, index) => ({
      text: annotation.originalText,
      category: annotation.category,
      type: this.getCategoryType(annotation.category),
      explanation: annotation.explanation,
      suggestion: annotation.suggestedText || "Consider revising this section",
      severity: this.getSeverityFromCategory(annotation.category)
    }))
  }

  /**
   * Generate detailed feedback from AI analysis
   */
  private generateDetailedFeedback(analysis: any): any {
    const categories = ['grammar', 'vocabulary', 'structure', 'development', 'clarity', 'strengths']
    const feedback: any = {}
    
    categories.forEach(category => {
      const score = this.getScoreForCategory(category, analysis)
      const categoryFeedback = this.extractCategoryFeedback(category, analysis)
      
      feedback[category] = {
        score_justification: `AI-powered ${category} assessment: ${score}/5`,
        strengths: categoryFeedback.strengths,
        improvements: categoryFeedback.improvements,
        evidence: categoryFeedback.evidence
      }
    })
    
    return feedback
  }

  private getCategoryType(category: string): string {
    return category === 'strengths' ? 'strength' : 'improvement'
  }

  private getSeverityFromCategory(category: string): string {
    const severityMap: { [key: string]: string } = {
      grammar: 'moderate',
      vocabulary: 'minor',
      structure: 'major',
      development: 'moderate', 
      clarity: 'major',
      strengths: 'positive'
    }
    return severityMap[category] || 'moderate'
  }

  private getScoreForCategory(category: string, analysis: any): number {
    const scoreMap: { [key: string]: string } = {
      grammar: 'grammarMechanics',
      vocabulary: 'wordChoiceVocabulary',
      structure: 'structureOrganization',
      development: 'developmentSupport',
      clarity: 'clarityFocus'
    }
    
    if (category === 'strengths') {
      return Math.round((analysis.rubricScores.grammarMechanics + 
                        analysis.rubricScores.wordChoiceVocabulary + 
                        analysis.rubricScores.structureOrganization + 
                        analysis.rubricScores.developmentSupport + 
                        analysis.rubricScores.clarityFocus) / 5)
    }
    
    return analysis.rubricScores[scoreMap[category]] || 3
  }

  private extractCategoryFeedback(category: string, analysis: any): any {
    // Extract category-specific feedback from AI analysis
    const generalFeedback = analysis.feedback || []
    const categoryFeedback = generalFeedback.filter((fb: string) => 
      fb.toLowerCase().includes(category.toLowerCase())
    )
    
    return {
      strengths: [`AI identified positive aspects in ${category}`],
      improvements: categoryFeedback.length > 0 ? [categoryFeedback[0]] : [`Consider improving ${category}`],
      evidence: [`Based on AI analysis of the essay content`]
    }
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

  private generateParagraphFeedback(aiEvaluation: any): ParagraphFeedback[] {
    // Extract paragraph feedback from AI evaluation
    // The AI client now returns paragraph feedback in the analysis
    const paragraphFeedback = aiEvaluation.paragraphFeedback || []
    
    // If no paragraph feedback from AI, return empty array
    if (!paragraphFeedback || paragraphFeedback.length === 0) {
      return []
    }
    
    return paragraphFeedback.map((feedback: any) => ({
      paragraphNumber: feedback.paragraphNumber || 1,
      title: feedback.title || 'Paragraph Analysis',
      content: feedback.content || 'Analysis not available',
      type: feedback.type || 'positive',
      priority: feedback.priority || 'medium'
    }))
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