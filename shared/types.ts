// Shared types for professional report generation
// Used by both frontend components and future PDF service

export interface StudentInfo {
  name?: string;
  date?: string;
  gradeLevel?: string;
  score?: string;
}

export interface ReportOptions {
  includeAnnotations?: boolean;
  includeScore?: boolean;
  colorScheme?: 'full' | 'print' | 'accessible';
  format?: 'web' | 'print';
}

export interface ReportData {
  evaluationData: any; // EvaluationResult from evaluation types
  essayText: string;
  prompt?: string;
  studentInfo?: StudentInfo;
  options?: ReportOptions;
}

export interface RenderedReport {
  html: string;
  css: string;
  metadata: {
    title: string;
    filename: string;
    generatedAt: string;
  };
}

export interface ProcessedAnnotation {
  id: string;
  category: string;
  marker: string; // ✓1, S1, W1, etc.
  originalText: string;
  explanation: string;
  suggestion?: string;
  colorClass: string;
  markerClass: string;
  blockClass: string;
  startIndex: number;
  endIndex: number;
  severity: 'minor' | 'moderate' | 'major' | 'positive';
}

export interface AnnotationBlock {
  category: string;
  marker: string;
  header: string;
  content: string;
  blockClass: string;
  isWide?: boolean;
  originalText?: string;
  suggestedText?: string;
}

export interface RenderConfig {
  target: 'web' | 'print' | 'pdf';
  colorScheme: 'full' | 'print' | 'accessible';
  includeInteractive?: boolean;
}

// Category color mappings for annotations
export const ANNOTATION_COLORS = {
  grammar: {
    background: 'grammar-mark',
    marker: 'marker-grammar',
    block: 'grammar-block',
    color: '#ef4444'
  },
  vocabulary: {
    background: 'word-mark',
    marker: 'marker-word', 
    block: 'word-block',
    color: '#3b82f6'
  },
  structure: {
    background: 'structure-mark',
    marker: 'marker-structure',
    block: 'structure-block',
    color: '#22c55e'
  },
  development: {
    background: 'development-mark',
    marker: 'marker-development',
    block: 'development-block',
    color: '#9333ea'
  },
  clarity: {
    background: 'clarity-mark',
    marker: 'marker-clarity',
    block: 'clarity-block',
    color: '#f97316'
  },
  strengths: {
    background: 'positive-mark',
    marker: 'marker-positive',
    block: 'positive-block',
    color: '#10b981'
  }
};

// Legend items for the report
export const LEGEND_ITEMS = [
  { category: 'grammar', label: 'Grammar', color: 'grammar-mark' },
  { category: 'vocabulary', label: 'Advanced Vocabulary', color: 'word-mark' },
  { category: 'structure', label: 'Sophisticated Structure', color: 'structure-mark' },
  { category: 'development', label: 'Rich Development', color: 'development-mark' },
  { category: 'clarity', label: 'Complex Ideas', color: 'clarity-mark' },
  { category: 'strengths', label: 'Exceptional Techniques', color: 'positive-mark' }
];