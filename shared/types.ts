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
  ideas: {
    background: 'ideas-mark',
    marker: 'marker-ideas',
    block: 'ideas-block',
    color: '#9333ea'
  },
  organization: {
    background: 'organization-mark',
    marker: 'marker-organization',
    block: 'organization-block',
    color: '#22c55e'
  },
  voice: {
    background: 'voice-mark',
    marker: 'marker-voice',
    block: 'voice-block',
    color: '#f97316'
  },
  wordChoice: {
    background: 'word-choice-mark',
    marker: 'marker-word-choice',
    block: 'word-choice-block',
    color: '#3b82f6'
  },
  fluency: {
    background: 'fluency-mark',
    marker: 'marker-fluency',
    block: 'fluency-block',
    color: '#10b981'
  },
  conventions: {
    background: 'conventions-mark',
    marker: 'marker-conventions',
    block: 'conventions-block',
    color: '#ef4444'
  }
};

// Legend items for the report
export const LEGEND_ITEMS = [
  { category: 'ideas', label: 'Ideas & Content', color: 'ideas-mark' },
  { category: 'organization', label: 'Organization', color: 'organization-mark' },
  { category: 'voice', label: 'Voice & Focus', color: 'voice-mark' },
  { category: 'wordChoice', label: 'Word Choice', color: 'word-choice-mark' },
  { category: 'fluency', label: 'Sentence Fluency', color: 'fluency-mark' },
  { category: 'conventions', label: 'Conventions', color: 'conventions-mark' }
];