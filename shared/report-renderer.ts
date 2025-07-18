// Core professional report renderer for unified report generation
// Platform-agnostic rendering that works in both frontend and future PDF service

import { AnnotationProcessor } from './annotation-processor';
import { getReportStyles } from './report-styles';
import { LEGEND_ITEMS } from './types';
import type { ReportData, RenderedReport, RenderConfig, StudentInfo } from './types';

export class ProfessionalReportRenderer {
  private annotationProcessor: AnnotationProcessor;

  constructor() {
    this.annotationProcessor = new AnnotationProcessor();
  }

  /**
   * Main render method - generates complete professional report
   */
  render(data: ReportData, config: RenderConfig = { target: 'web', colorScheme: 'full' }): RenderedReport {
    const { evaluationData, essayText, prompt, studentInfo, options } = data;
    
    // Process annotations
    const processedAnnotations = this.annotationProcessor.processAnnotations(
      evaluationData.annotations || []
    );
    
    // Generate annotated text
    const annotatedText = this.annotationProcessor.createAnnotatedText(essayText, processedAnnotations);
    
    // Split essay into readable blocks
    const textBlocks = this.annotationProcessor.splitIntoTextBlocks(essayText);
    
    // Generate annotation blocks for detailed explanations
    const annotationBlocks = this.annotationProcessor.generateAnnotationBlocks(processedAnnotations);
    
    // Generate paragraph feedback
    const paragraphFeedback = this.annotationProcessor.generateParagraphFeedback(
      evaluationData.feedback || []
    );

    // Generate HTML content
    const html = this.generateHTML({
      evaluationData,
      annotatedText,
      textBlocks,
      annotationBlocks,
      paragraphFeedback,
      prompt,
      studentInfo,
      options
    });

    // Generate CSS
    const css = getReportStyles(config.target);

    // Create metadata
    const metadata = this.generateMetadata(evaluationData, studentInfo);

    return {
      html,
      css,
      metadata
    };
  }

  /**
   * Generate complete HTML structure
   */
  private generateHTML(context: {
    evaluationData: any;
    annotatedText: string;
    textBlocks: string[];
    annotationBlocks: any[];
    paragraphFeedback: string;
    prompt?: string;
    studentInfo?: StudentInfo;
    options?: any;
  }): string {
    const { evaluationData, textBlocks, annotationBlocks, paragraphFeedback, prompt, studentInfo } = context;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ISEE Essay Evaluation Report</title>
      </head>
      <body class="professional-report">
        ${this.generateHeader(evaluationData, prompt, studentInfo)}
        ${this.generateLegend()}
        ${this.generateEssayContainer(textBlocks, annotationBlocks)}
        ${this.generateScoreSummary(evaluationData)}
        ${paragraphFeedback ? `<div class="feedback-section">${paragraphFeedback}</div>` : ''}
      </body>
      </html>
    `;
  }

  /**
   * Generate report header with gradient background
   */
  private generateHeader(evaluationData: any, prompt?: string, studentInfo?: StudentInfo): string {
    const score = evaluationData.overallScore || evaluationData.scores?.overall || 'N/A';
    const maxScore = 5;
    
    return `
      <div class="report-header">
        <h1>🏆 ISEE Essay Evaluation Report - Score ${score}/${maxScore}</h1>
        ${prompt ? `<div class="report-prompt"><strong>Prompt:</strong> ${this.escapeHtml(prompt)}</div>` : ''}
        ${this.generateStudentInfo(studentInfo)}
      </div>
    `;
  }

  /**
   * Generate student information section
   */
  private generateStudentInfo(studentInfo?: StudentInfo): string {
    if (!studentInfo || Object.keys(studentInfo).length === 0) {
      return `
        <div class="student-info">
          <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
          <div><strong>Test:</strong> ISEE Essay</div>
          <div><strong>Level:</strong> Upper Level</div>
        </div>
      `;
    }

    return `
      <div class="student-info">
        ${studentInfo.name ? `<div><strong>Student:</strong> ${this.escapeHtml(studentInfo.name)}</div>` : ''}
        <div><strong>Date:</strong> ${studentInfo.date || new Date().toLocaleDateString()}</div>
        <div><strong>Test:</strong> ISEE Essay</div>
        <div><strong>Level:</strong> ${studentInfo.gradeLevel || 'Upper Level'}</div>
      </div>
    `;
  }

  /**
   * Generate color-coded legend
   */
  private generateLegend(): string {
    const legendItems = LEGEND_ITEMS.map(item => `
      <div class="legend-item">
        <div class="legend-color ${item.color}"></div>
        <span>${item.label}</span>
      </div>
    `).join('');

    return `
      <div class="legend">
        ${legendItems}
      </div>
    `;
  }

  /**
   * Generate essay container with annotated text
   */
  private generateEssayContainer(textBlocks: string[], annotationBlocks: any[]): string {
    // Generate text blocks with annotations
    const textBlocksHtml = textBlocks.map((block, index) => {
      // Find annotations for this block
      const blockAnnotations = annotationBlocks.filter(annotation => {
        // Simple heuristic: annotations belong to blocks based on text content
        return block.includes(annotation.originalText?.substring(0, 20) || '');
      });

      const blockAnnotationsHtml = blockAnnotations.map(annotation => `
        <div class="annotation-block ${annotation.blockClass}">
          <div class="annotation-header">${annotation.header}</div>
          ${annotation.content}
        </div>
      `).join('');

      return `
        <div class="text-block">
          <div class="text-line essay-text">
            ${this.annotationProcessor.createAnnotatedText(block, [])}
          </div>
          ${blockAnnotationsHtml ? `<div class="annotation-section">${blockAnnotationsHtml}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="essay-container">
        <h2 class="essay-title">Student Essay</h2>
        ${textBlocksHtml}
      </div>
    `;
  }

  /**
   * Generate comprehensive score summary
   */
  private generateScoreSummary(evaluationData: any): string {
    const scores = evaluationData.scores || {};
    const overallScore = evaluationData.overallScore || scores.overall || 0;
    
    // Extract individual category scores
    const categories = [
      { name: 'Grammar & Mechanics', key: 'grammar', score: scores.grammar || 0 },
      { name: 'Vocabulary', key: 'vocabulary', score: scores.vocabulary || 0 },
      { name: 'Structure', key: 'structure', score: scores.structure || 0 },
      { name: 'Development', key: 'development', score: scores.development || 0 },
      { name: 'Clarity', key: 'clarity', score: scores.clarity || 0 },
      { name: 'Strengths', key: 'strengths', score: scores.strengths || 0 }
    ];

    const scoreItems = categories.map(category => `
      <div class="score-item">
        <span>${category.name}</span>
        <span class="score-badge">${category.score}/5</span>
      </div>
    `).join('');

    return `
      <div class="score-summary">
        <h3>📊 Evaluation Summary</h3>
        <div class="score-grid">
          ${scoreItems}
        </div>
        <div class="average-score">
          Overall Score: ${overallScore.toFixed(1)}/5.0
        </div>
      </div>
    `;
  }

  /**
   * Generate metadata for the report
   */
  private generateMetadata(evaluationData: any, studentInfo?: StudentInfo): {
    title: string;
    filename: string;
    generatedAt: string;
  } {
    const score = evaluationData.overallScore || evaluationData.scores?.overall || 'N/A';
    const studentName = studentInfo?.name || 'Student';
    const date = new Date().toISOString().split('T')[0];
    
    return {
      title: `ISEE Essay Report - ${studentName} - Score ${score}/5`,
      filename: `isee-essay-report-${studentName.toLowerCase().replace(/\s+/g, '-')}-${date}.html`,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Escape HTML to prevent XSS
   */
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

  /**
   * Generate standalone HTML file with embedded CSS
   */
  generateStandaloneHTML(data: ReportData, config: RenderConfig = { target: 'web', colorScheme: 'full' }): string {
    const report = this.render(data, config);
    
    return report.html.replace(
      '</head>',
      `<style>${report.css}</style></head>`
    );
  }

  /**
   * Generate print-optimized version
   */
  generatePrintVersion(data: ReportData): string {
    return this.generateStandaloneHTML(data, { target: 'print', colorScheme: 'full' });
  }
}

// Export singleton instance for convenience
export const reportRenderer = new ProfessionalReportRenderer();