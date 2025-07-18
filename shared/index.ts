// Shared report generation modules
// Provides unified interface for professional report rendering

export { ProfessionalReportRenderer, reportRenderer } from './report-renderer';
export { AnnotationProcessor } from './annotation-processor';
export { PROFESSIONAL_REPORT_STYLES, getReportStyles } from './report-styles';
export type {
  StudentInfo,
  ReportOptions,
  ReportData,
  RenderedReport,
  ProcessedAnnotation,
  AnnotationBlock,
  RenderConfig
} from './types';
export { ANNOTATION_COLORS, LEGEND_ITEMS } from './types';