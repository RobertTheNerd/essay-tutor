// Enhanced annotation processor for professional reports
// Generates color-coded markers and rich explanations

import { ANNOTATION_COLORS } from './types';
import type { ProcessedAnnotation, AnnotationBlock } from './types';

export class AnnotationProcessor {
  private markerCounters: { [category: string]: number } = {};

  constructor() {
    this.resetMarkerCounters();
  }

  private resetMarkerCounters(): void {
    this.markerCounters = {
      grammar: 1,
      vocabulary: 1,
      structure: 1,
      development: 1,
      clarity: 1,
      strengths: 1
    };
  }

  /**
   * Generate marker string for annotation (✓1, S1, W1, etc.)
   */
  private generateMarker(category: string): string {
    const counter = this.markerCounters[category] || 1;
    this.markerCounters[category] = counter + 1;

    const markerPrefixes: { [key: string]: string } = {
      grammar: 'G',
      vocabulary: 'W',
      structure: 'S', 
      development: 'D',
      clarity: 'C',
      strengths: '✓'
    };

    const prefix = markerPrefixes[category] || 'A';
    return `${prefix}${counter}`;
  }

  /**
   * Generate sequential marker string for annotation based on text position (C1, W1, W2, etc.)
   */
  private generateSequentialMarker(category: string, sequentialNumber: number): string {
    const markerPrefixes: { [key: string]: string } = {
      grammar: 'G',
      vocabulary: 'W',
      structure: 'S', 
      development: 'D',
      clarity: 'C',
      strengths: '✓'
    };

    const prefix = markerPrefixes[category] || 'A';
    return `${prefix}${sequentialNumber}`;
  }

  /**
   * Process annotations into enhanced format with markers and styling
   */
  processAnnotations(annotations: any[]): ProcessedAnnotation[] {
    this.resetMarkerCounters();
    
    return annotations.map(annotation => {
      const category = this.normalizeCategoryName(annotation.category || annotation.type);
      const colorConfig = ANNOTATION_COLORS[category] || ANNOTATION_COLORS.grammar;
      
      return {
        id: annotation.id || `annotation-${Math.random().toString(36).substr(2, 9)}`,
        category,
        marker: this.generateMarker(category),
        originalText: annotation.originalText || annotation.text || '',
        explanation: annotation.explanation || annotation.feedback || '',
        suggestion: annotation.suggestedText || annotation.suggestion,
        colorClass: colorConfig.background,
        markerClass: colorConfig.marker,
        blockClass: colorConfig.block,
        startIndex: annotation.startIndex || 0,
        endIndex: annotation.endIndex || 0,
        severity: annotation.severity || 'moderate'
      };
    });
  }

  /**
   * Process annotations with proper ordering and sequential numbering
   */
  processAnnotationsSequential(annotations: any[], essayText: string): ProcessedAnnotation[] {
    if (!annotations || annotations.length === 0) {
      return [];
    }

    // Step 1: Calculate text positions for annotations that don't have them
    const annotationsWithPositions = annotations.map((annotation, index) => {
      let startIndex = annotation.startIndex;
      let endIndex = annotation.endIndex;
      const originalText = annotation.originalText || annotation.text || '';

      // If no position data, find it in the text
      if ((startIndex === undefined || startIndex === null) && originalText && essayText) {
        startIndex = essayText.indexOf(originalText);
        endIndex = startIndex !== -1 ? startIndex + originalText.length : 0;
      }

      return {
        ...annotation,
        originalText,
        startIndex: startIndex || 0,
        endIndex: endIndex || originalText.length || 0,
        originalIndex: index
      };
    });

    // Step 2: Sort annotations by their position in the text
    const sortedAnnotations = annotationsWithPositions
      .filter(annotation => annotation.startIndex !== -1)
      .sort((a, b) => a.startIndex - b.startIndex);

    // Step 3: Process annotations with sequential numbering based on text order
    return sortedAnnotations.map((annotation, sequentialIndex) => {
      const category = this.normalizeCategoryName(annotation.category || annotation.type);
      const colorConfig = ANNOTATION_COLORS[category] || ANNOTATION_COLORS.grammar;
      
      return {
        id: annotation.id || `annotation-${annotation.originalIndex}`,
        category,
        marker: this.generateSequentialMarker(category, sequentialIndex + 1),
        originalText: annotation.originalText,
        explanation: annotation.explanation || annotation.feedback || '',
        suggestion: annotation.suggestedText || annotation.suggestion,
        colorClass: colorConfig.background,
        markerClass: colorConfig.marker,
        blockClass: colorConfig.block,
        startIndex: annotation.startIndex,
        endIndex: annotation.endIndex,
        severity: annotation.severity || 'moderate'
      };
    });
  }

  /**
   * Create annotated text with color-coded highlights and markers
   */
  createAnnotatedText(text: string, annotations: ProcessedAnnotation[]): string {
    if (!annotations || annotations.length === 0) {
      return this.escapeHtml(text);
    }

    // Sort annotations by start index (descending) to avoid index shifting
    const sortedAnnotations = [...annotations].sort((a, b) => b.startIndex - a.startIndex);
    
    let annotatedText = this.escapeHtml(text);
    
    for (const annotation of sortedAnnotations) {
      // Skip annotations with invalid indices
      if (annotation.startIndex >= annotation.endIndex || 
          annotation.startIndex < 0 || 
          annotation.endIndex > annotatedText.length) {
        continue;
      }

      const beforeText = annotatedText.substring(0, annotation.startIndex);
      const highlightedText = annotatedText.substring(annotation.startIndex, annotation.endIndex);
      const afterText = annotatedText.substring(annotation.endIndex);
      
      const markerHtml = `<span class="annotation-marker ${annotation.markerClass}">${annotation.marker}</span>`;
      const wrappedText = `<span class="marked-text ${annotation.colorClass}">${highlightedText}${markerHtml}</span>`;
      
      annotatedText = beforeText + wrappedText + afterText;
    }
    
    return annotatedText;
  }

  /**
   * Generate annotation blocks for detailed explanations
   */
  generateAnnotationBlocks(annotations: ProcessedAnnotation[]): AnnotationBlock[] {
    const blocks: AnnotationBlock[] = [];
    
    for (const annotation of annotations) {
      const header = this.generateBlockHeader(annotation);
      const content = this.generateBlockContent(annotation);
      
      blocks.push({
        category: annotation.category,
        marker: annotation.marker,
        header,
        content,
        blockClass: annotation.blockClass,
        isWide: annotation.severity === 'positive' || annotation.explanation.length > 200,
        originalText: annotation.originalText,
        suggestedText: annotation.suggestion
      });
    }
    
    return blocks;
  }

  /**
   * Generate paragraph feedback blocks from feedback data
   */
  generateParagraphFeedback(feedback: any[]): string {
    if (!feedback || feedback.length === 0) return '';

    return feedback.map(block => {
      const feedbackClass = this.getFeedbackClass(block.type, block.priority);
      const icon = this.getFeedbackIcon(block.type);
      
      return `
        <div class="paragraph-feedback ${feedbackClass}">
          <strong>${icon} ${this.escapeHtml(block.title)}:</strong> ${this.escapeHtml(block.content)}
        </div>
      `;
    }).join('');
  }

  private normalizeCategoryName(category: string): string {
    if (!category) return 'grammar';
    
    const normalizedMap: { [key: string]: string } = {
      'grammar': 'grammar',
      'mechanics': 'grammar',
      'vocabulary': 'vocabulary', 
      'word choice': 'vocabulary',
      'structure': 'structure',
      'organization': 'structure',
      'development': 'development',
      'support': 'development',
      'clarity': 'clarity',
      'focus': 'clarity',
      'strengths': 'strengths',
      'positive': 'strengths'
    };
    
    return normalizedMap[category.toLowerCase()] || 'grammar';
  }

  private generateBlockHeader(annotation: ProcessedAnnotation): string {
    const headerMap: { [key: string]: string } = {
      grammar: 'Grammar & Mechanics',
      vocabulary: 'Advanced Vocabulary',
      structure: 'Sophisticated Structure', 
      development: 'Rich Development',
      clarity: 'Complex Ideas',
      strengths: 'Exceptional Techniques'
    };
    
    return `${headerMap[annotation.category]} (${annotation.marker})`;
  }

  private generateBlockContent(annotation: ProcessedAnnotation): string {
    let content = '';
    
    if (annotation.originalText && annotation.suggestion) {
      content += `
        <div class="annotation-label">Original text:</div>
        <span class="original-text">${this.escapeHtml(annotation.originalText)}</span><br>
        <div class="annotation-label">Suggested improvement:</div>
        <span class="suggested-text">${this.escapeHtml(annotation.suggestion)}</span><br>
      `;
    }
    
    content += `
      <div class="annotation-label">Explanation:</div>
      ${this.escapeHtml(annotation.explanation)}
    `;
    
    return content;
  }

  private getFeedbackClass(type: string, priority: string): string {
    if (type === 'strength') return 'positive';
    if (priority === 'high') return 'excellent';
    return '';
  }

  private getFeedbackIcon(type: string): string {
    const icons: { [key: string]: string } = {
      strength: '🏆',
      improvement: '📈',
      suggestion: '💡'
    };
    
    return icons[type] || '📝';
  }

  /**
   * Split text into logical blocks for better presentation
   */
  splitIntoTextBlocks(text: string): string[] {
    if (!text || text.trim().length === 0) {
      return [''];
    }

    // Split by paragraphs, then group related sentences
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    if (paragraphs.length <= 1) {
      // If no clear paragraphs, split by sentences and group
      const sentences = text.split(/[.!?]+/).filter(s => s.trim());
      const blocks: string[] = [];
      
      for (let i = 0; i < sentences.length; i += 3) {
        const block = sentences.slice(i, i + 3).join('. ').trim();
        if (block) blocks.push(block + '.');
      }
      
      return blocks.length > 0 ? blocks : [text];
    }
    
    return paragraphs;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    
    // Platform-agnostic HTML escaping
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // Fallback for server-side environments
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}