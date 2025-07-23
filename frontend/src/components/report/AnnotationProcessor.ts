// Advanced annotation processor for professional reports
// Generates color-coded text highlighting and annotation markers matching target design

export interface ProcessedAnnotation {
  id: string
  category: string
  marker: string // ✓1, S1, W1, D1, C1, etc.
  originalText: string
  explanation: string
  suggestion?: string
  colorClass: string
  markerClass: string
  blockClass: string
  startIndex: number
  endIndex: number
  severity: 'minor' | 'moderate' | 'major' | 'positive'
}

export interface AnnotationBlock {
  category: string
  marker: string
  header: string
  content: string
  blockClass: string
  isWide?: boolean
  originalText?: string
  suggestedText?: string
}

// Category color mappings for annotations
export const ANNOTATION_COLORS = {
  // Legacy naming (for backward compatibility)
  grammar: {
    background: 'grammar-mark',
    marker: 'marker-grammar',
    block: 'grammar-block',
    color: '#ef4444',
  },
  vocabulary: {
    background: 'word-mark',
    marker: 'marker-word',
    block: 'word-block',
    color: '#3b82f6',
  },
  structure: {
    background: 'structure-mark',
    marker: 'marker-structure',
    block: 'structure-block',
    color: '#22c55e',
  },
  development: {
    background: 'development-mark',
    marker: 'marker-development',
    block: 'development-block',
    color: '#9333ea',
  },
  clarity: {
    background: 'clarity-mark',
    marker: 'marker-clarity',
    block: 'clarity-block',
    color: '#f97316',
  },
  strengths: {
    background: 'positive-mark',
    marker: 'marker-positive',
    block: 'positive-block',
    color: '#10b981',
  },
  
  // 6+1 Trait naming
  conventions: {
    background: 'conventions-mark',
    marker: 'marker-conventions',
    block: 'conventions-block',
    color: '#ef4444',
  },
  wordChoice: {
    background: 'word-choice-mark',
    marker: 'marker-word-choice',
    block: 'word-choice-block',
    color: '#3b82f6',
  },
  organization: {
    background: 'organization-mark',
    marker: 'marker-organization',
    block: 'organization-block',
    color: '#22c55e',
  },
  ideas: {
    background: 'ideas-mark',
    marker: 'marker-ideas',
    block: 'ideas-block',
    color: '#9333ea',
  },
  voice: {
    background: 'voice-mark',
    marker: 'marker-voice',
    block: 'voice-block',
    color: '#f97316',
  },
  fluency: {
    background: 'fluency-mark',
    marker: 'marker-fluency',
    block: 'fluency-block',
    color: '#10b981',
  },
}

export class AnnotationProcessor {
  private markerCounters: { [category: string]: number } = {}

  constructor() {
    this.resetMarkerCounters()
  }

  private resetMarkerCounters(): void {
    this.markerCounters = {
      grammar: 1,
      vocabulary: 1,
      structure: 1,
      development: 1,
      clarity: 1,
      strengths: 1,
    }
  }

  /**
   * Map specific annotation categories to broad categories for consistent marking
   */
  private mapToBroadCategory(category: string): string {
    const categoryMapping: { [key: string]: string } = {
      // Grammar & Mechanics
      'grammar': 'grammar',
      'spelling': 'grammar',
      'punctuation': 'grammar',
      'capitalization': 'grammar',
      'sentence-structure': 'grammar',
      'sentence-boundary': 'grammar',
      'conventions': 'grammar',
      
      // Content & Development
      'clarify-idea': 'development',
      'add-support': 'development',
      'stay-focused': 'development',
      'strengthen-example': 'development',
      'expand-idea': 'development',
      'ideas': 'development',
      
      // Organization & Structure
      'add-transition': 'structure',
      'strengthen-topic-sentence': 'structure',
      'improve-flow': 'structure',
      'clarify-thesis': 'structure',
      'strengthen-conclusion': 'structure',
      'organization': 'structure',
      
      // Style & Clarity
      'precise-word': 'vocabulary',
      'smooth-phrasing': 'clarity',
      'formal-tone': 'clarity',
      'concise-expression': 'clarity',
      'enhance-clarity': 'clarity',
      'wordChoice': 'vocabulary',
      'voice': 'clarity',
      
      // Sentence Fluency
      'vary-sentences': 'fluency',
      'combine-sentences': 'fluency',
      'simplify-structure': 'fluency',
      'fluency': 'fluency',
      
      // Positive/Strengths
      'strengths': 'strengths',
    }
    
    return categoryMapping[category] || 'grammar'
  }

  /**
   * Generate marker string for annotation (✓1, S1, W1, etc.)
   */
  private generateMarker(category: string): string {
    const broadCategory = this.mapToBroadCategory(category)
    const counter = this.markerCounters[broadCategory] || 1
    this.markerCounters[broadCategory] = counter + 1

    const markerPrefixes: { [key: string]: string } = {
      grammar: 'G',
      vocabulary: 'W',
      structure: 'S',
      development: 'D',
      clarity: 'C',
      fluency: 'F',
      strengths: '✓',
    }

    const prefix = markerPrefixes[broadCategory] || 'A'
    return `${prefix}${counter}`
  }

  /**
   * Convert API annotations to processed format
   */
  convertApiAnnotationsToProcessed(apiAnnotations: any[]): ProcessedAnnotation[] {
    this.resetMarkerCounters()

    return apiAnnotations.map((annotation, index) => {
      const category = annotation.category || 'grammar'
      const broadCategory = this.mapToBroadCategory(category)
      
      // Updated color mapping for broader categories
      const colorMapping: { [key: string]: any } = {
        grammar: ANNOTATION_COLORS.conventions || ANNOTATION_COLORS.grammar,
        vocabulary: ANNOTATION_COLORS.wordChoice || ANNOTATION_COLORS.vocabulary,
        structure: ANNOTATION_COLORS.organization || ANNOTATION_COLORS.structure,
        development: ANNOTATION_COLORS.ideas || ANNOTATION_COLORS.development,
        clarity: ANNOTATION_COLORS.voice || ANNOTATION_COLORS.clarity,
        fluency: ANNOTATION_COLORS.fluency || ANNOTATION_COLORS.fluency,
        strengths: ANNOTATION_COLORS.strengths || { background: 'positive-mark', marker: 'marker-positive', block: 'positive-block' }
      }
      
      const colorConfig = colorMapping[broadCategory] || ANNOTATION_COLORS.conventions || ANNOTATION_COLORS.grammar

      return {
        id: `api-annotation-${index}`,
        category,
        marker: this.generateMarker(category),
        originalText: annotation.originalText || annotation.text || '',
        explanation: annotation.explanation || 'AI-generated annotation',
        suggestion: annotation.suggestedText || annotation.suggestion,
        colorClass: colorConfig.background,
        markerClass: colorConfig.marker,
        blockClass: colorConfig.block,
        startIndex: annotation.startIndex || 0,
        endIndex: annotation.endIndex || annotation.originalText?.length || 0,
        severity: annotation.severity || (broadCategory === 'strengths' ? 'positive' : 'moderate'),
      }
    })
  }

  /**
   * Generate mock annotations for demonstration purposes
   * This creates sophisticated annotations matching the target design
   */
  generateMockAnnotations(text: string): ProcessedAnnotation[] {
    const annotations: ProcessedAnnotation[] = []
    const sentences = this.splitIntoSentences(text)

    // Generate annotations for different categories
    sentences.forEach((sentence, index) => {
      if (index < 8 && sentence.length > 50) {
        // Focus on substantial sentences
        const category = this.selectCategoryForSentence(sentence, index)
        const colorConfig =
          ANNOTATION_COLORS[category as keyof typeof ANNOTATION_COLORS] || ANNOTATION_COLORS.grammar

        // Find a meaningful phrase to highlight (15-50 characters)
        const highlight = this.extractHighlightPhrase(sentence)
        const startIndex = text.indexOf(highlight.text)

        if (startIndex !== -1) {
          annotations.push({
            id: `annotation-${annotations.length + 1}`,
            category,
            marker: this.generateMarker(category),
            originalText: highlight.text,
            explanation: this.generateExplanation(category),
            suggestion: this.generateSuggestion(category),
            colorClass: colorConfig.background,
            markerClass: colorConfig.marker,
            blockClass: colorConfig.block,
            startIndex,
            endIndex: startIndex + highlight.text.length,
            severity: category === 'strengths' ? 'positive' : 'moderate',
          })
        }
      }
    })

    return annotations
  }

  /**
   * Apply annotations to text, creating color-coded highlights with markers
   */
  applyAnnotationsToText(text: string, annotations: ProcessedAnnotation[]): string {
    if (!annotations || annotations.length === 0) {
      return this.escapeHtml(text)
    }

    // Sort annotations by start index (descending) to avoid index shifting
    const sortedAnnotations = [...annotations].sort((a, b) => b.startIndex - a.startIndex)

    let annotatedText = text

    for (const annotation of sortedAnnotations) {
      // Skip annotations with invalid indices
      if (
        annotation.startIndex >= annotation.endIndex ||
        annotation.startIndex < 0 ||
        annotation.endIndex > annotatedText.length
      ) {
        continue
      }

      const beforeText = annotatedText.substring(0, annotation.startIndex)
      const highlightedText = annotatedText.substring(annotation.startIndex, annotation.endIndex)
      const afterText = annotatedText.substring(annotation.endIndex)

      const markerHtml = `<span class="annotation-marker ${annotation.markerClass}">${annotation.marker}</span>`
      const wrappedText = `<span class="marked-text ${annotation.colorClass}">${this.escapeHtml(highlightedText)}${markerHtml}</span>`

      annotatedText = beforeText + wrappedText + afterText
    }

    return annotatedText
  }

  /**
   * Generate annotation blocks for detailed explanations
   */
  generateAnnotationBlocks(annotations: ProcessedAnnotation[]): AnnotationBlock[] {
    return annotations.map(annotation => ({
      category: annotation.category,
      marker: annotation.marker,
      header: this.generateBlockHeader(annotation),
      content: this.generateBlockContent(annotation),
      blockClass: annotation.blockClass,
      isWide: annotation.severity === 'positive' || annotation.explanation.length > 200,
      originalText: annotation.originalText,
      suggestedText: annotation.suggestion,
    }))
  }

  /**
   * Split text into logical blocks for better presentation
   */
  splitIntoTextBlocks(text: string): string[] {
    if (!text || text.trim().length === 0) {
      return ['']
    }

    // Split by paragraphs, then group related sentences
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim())

    if (paragraphs.length <= 1) {
      // If no clear paragraphs, split by sentences and group
      const sentences = text.split(/[.!?]+/).filter(s => s.trim())
      const blocks: string[] = []

      for (let i = 0; i < sentences.length; i += 3) {
        const block = sentences
          .slice(i, i + 3)
          .join('. ')
          .trim()
        if (block) blocks.push(block + '.')
      }

      return blocks.length > 0 ? blocks : [text]
    }

    return paragraphs
  }

  // Private helper methods for generating mock data

  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 20)
  }

  private selectCategoryForSentence(sentence: string, index: number): string {
    const categories = ['grammar', 'vocabulary', 'structure', 'development', 'clarity', 'strengths']

    // Distribute categories evenly with some logic
    if (
      sentence.includes('because') ||
      sentence.includes('therefore') ||
      sentence.includes('however')
    ) {
      return 'structure'
    }
    if (sentence.length > 100) {
      return 'development'
    }
    if (/[A-Z][a-z]{8,}/.test(sentence)) {
      // Long words
      return 'vocabulary'
    }
    if (index === 0 || sentence.includes('excellent') || sentence.includes('outstanding')) {
      return 'strengths'
    }

    return categories[index % categories.length]
  }

  private extractHighlightPhrase(sentence: string): { text: string } {
    const words = sentence.trim().split(/\s+/)

    // Extract a meaningful phrase (3-8 words)
    if (words.length > 8) {
      const start = Math.floor(words.length * 0.2)
      const length = Math.min(6, words.length - start - 2)
      return { text: words.slice(start, start + length).join(' ') }
    } else if (words.length > 3) {
      return { text: words.slice(0, Math.min(4, words.length)).join(' ') }
    }

    return { text: sentence.substring(0, Math.min(50, sentence.length)) }
  }

  private generateExplanation(category: string): string {
    const explanations: { [key: string]: string[] } = {
      grammar: [
        'Shows mastery of complex sentence structures and proper punctuation.',
        'Demonstrates advanced understanding of grammatical conventions.',
        'Uses sophisticated syntax to enhance meaning and flow.',
      ],
      vocabulary: [
        'Employs sophisticated vocabulary that elevates the writing.',
        'Uses precise word choice that enhances meaning and sophistication.',
        'Demonstrates advanced vocabulary appropriate for academic writing.',
      ],
      structure: [
        'Creates sophisticated organizational structure that guides the reader.',
        'Uses advanced transitional techniques to connect ideas seamlessly.',
        'Demonstrates mastery of essay organization and logical flow.',
      ],
      development: [
        'Provides rich, detailed development that enhances understanding.',
        'Uses specific examples and elaboration to support main ideas.',
        'Demonstrates sophisticated thinking through detailed explanation.',
      ],
      clarity: [
        'Expresses complex ideas with remarkable clarity and precision.',
        'Maintains focus while exploring sophisticated concepts.',
        'Demonstrates mature understanding of abstract concepts.',
      ],
      strengths: [
        'Shows exceptional technique that elevates the entire essay.',
        'Demonstrates sophisticated understanding beyond grade level.',
        'Uses advanced literary or rhetorical techniques effectively.',
      ],
    }

    const categoryExplanations = explanations[category] || explanations.grammar
    return categoryExplanations[Math.floor(Math.random() * categoryExplanations.length)]
  }

  private generateSuggestion(category: string): string {
    // Generate contextual suggestions based on the highlighted text
    const suggestions: { [key: string]: string } = {
      grammar: `Consider varying sentence length and structure for even greater sophistication`,
      vocabulary: `Excellent word choice - continue building academic vocabulary`,
      structure: `Strong organization - consider adding transitional phrases to enhance flow`,
      development: `Rich detail - consider expanding with additional specific examples`,
      clarity: `Clear expression - maintain this precision throughout the essay`,
      strengths: `Exceptional technique - this demonstrates advanced writing skills`,
    }

    return suggestions[category] || suggestions.strengths
  }

  private generateBlockHeader(annotation: ProcessedAnnotation): string {
    const headerMap: { [key: string]: string } = {
      grammar: 'Grammar & Mechanics',
      vocabulary: 'Advanced Vocabulary',
      structure: 'Sophisticated Structure',
      development: 'Rich Development',
      clarity: 'Complex Ideas',
      strengths: 'Exceptional Techniques',
      spelling: 'Spelling & Mechanics',
      tone: 'Tone & Style',
      // Compound categories
      'clarity/vocabulary': 'Clarity & Vocabulary',
      'spelling/grammar': 'Spelling & Grammar',
      'tone/structure': 'Tone & Structure',
      'clarity/strengths': 'Clarity & Excellence',
    }

    // Get the header name, fallback to primary category if compound category not found
    let headerName = headerMap[annotation.category]

    if (!headerName && annotation.category.includes('/')) {
      // For compound categories, try the first part as fallback
      const primaryCategory = annotation.category.split('/')[0]
      headerName = headerMap[primaryCategory]
    }

    // Final fallback
    if (!headerName) {
      headerName = annotation.category.charAt(0).toUpperCase() + annotation.category.slice(1)
    }

    return `${headerName} (${annotation.marker})`
  }

  private generateBlockContent(annotation: ProcessedAnnotation): string {
    let content = ''

    if (annotation.originalText && annotation.suggestion) {
      content += `
        <div class="annotation-label">Highlighted text:</div>
        <span class="original-text">${this.escapeHtml(annotation.originalText)}</span><br>
        <div class="annotation-label">Improvement:</div>
        <span class="suggested-text">${this.escapeHtml(annotation.suggestion)}</span><br>
      `
    }

    content += `
      <div class="annotation-label">Explanation:</div>
      ${this.escapeHtml(annotation.explanation)}
    `

    return content
  }

  private escapeHtml(text: string): string {
    if (!text) return ''

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
}
