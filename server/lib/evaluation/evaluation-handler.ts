// Evaluation Handler
// Integrates evaluation engine and annotation generator with the existing API

import type {
  PlatformRequest,
  PlatformResponse,
  StructuredEssay,
} from "../types";
import { AnnotationGenerator } from "./annotation-generator";
import { EvaluationEngine } from "./evaluation-engine";
import { iseeUpperLevelRubric } from "./rubrics/isee/upper-level";

export interface EvaluationRequest {
  text?: string;
  rubric?: {
    family: string;
    level: string;
  };
  studentInfo?: {
    name?: string;
    grade?: string;
    date?: string;
  };
}

export interface EvaluationResponse {
  success: boolean;
  evaluation?: {
    rubric: {
      family: string;
      level: string;
      name: string;
    };
    scores: { [categoryId: string]: number };
    overall: number;
    annotations: any[];
    feedback: any[];
    summary: {
      strengths: string[];
      improvements: string[];
      nextSteps: string;
    };
    metadata: {
      processingTime: number;
      timestamp: string;
      confidence: number;
    };
  };
  annotatedText?: any;
  error?: string;
}

export async function handleEvaluation(
  req: PlatformRequest,
  res: PlatformResponse
): Promise<void> {
  try {
    const body = req.body as EvaluationRequest;

    // Validation
    if (!body.text) {
      return res.status(400).json({
        success: false,
        error: "Text content is required for evaluation",
      });
    }

    // For now, default to ISEE Upper Level
    // TODO: Support multiple rubrics when we implement the full hierarchy
    const rubricConfig = body.rubric || { family: "isee", level: "upper" };

    if (rubricConfig.family !== "isee" || rubricConfig.level !== "upper") {
      return res.status(400).json({
        success: false,
        error: "Currently only ISEE Upper Level is supported",
      });
    }

    // Convert text to StructuredEssay format (simplified for now)
    const structuredEssay: StructuredEssay = {
      writingPrompt: {
        text: "Writing prompt (auto-detected or provided)",
        source: "summarized" as const,
        confidence: 0.8,
        iseeCategory: "creative",
        promptType: "narrative",
      },
      studentEssay: {
        fullText: body.text,
        structure: {
          hasIntroduction: true,
          hasBodyParagraphs: true,
          hasConclusion: true,
          paragraphCount: body.text.split("\n\n").length,
          estimatedWordCount: body.text.trim().split(/\s+/).length,
        },
        statistics: {
          normalizedText: body.text,
          paragraphs: body.text.split("\n\n").length,
          sentences: body.text.split(/[.!?]+/).length - 1,
          words: body.text.trim().split(/\s+/).length,
          characters: body.text.length,
          charactersNoSpaces: body.text.replace(/\s/g, "").length,
          averageWordsPerSentence: 0,
          averageSentencesPerParagraph: 0,
          averageCharactersPerWord: 0,
          longSentences: 0,
          shortSentences: 0,
          complexWords: 0,
          complexityScore: 0,
        },
        enhancedTopic: {
          detectedTopic: "Auto-detected topic",
          confidence: 0.8,
          topicSource: "summarized" as const,
          iseeCategory: "creative",
          promptType: "narrative",
          keywords: [],
          suggestedStructure: [],
          relatedTopics: [],
        },
      },
      metadata: {
        originalDocument: {
          pages: [
            {
              pageNumber: 1,
              content: body.text,
              confidence: 1.0,
              metadata: {},
            },
          ],
          metadata: {
            source: "text",
            totalPages: 1,
            processingTime: 0,
            confidence: 1.0,
            aiProcessed: false,
          },
        },
        processingTime: 0,
        timestamp: new Date().toISOString(),
      },
    };

    // Initialize evaluation engine with ISEE Upper Level rubric
    const evaluationEngine = new EvaluationEngine(iseeUpperLevelRubric);

    // Perform evaluation
    const evaluation = await evaluationEngine.evaluateEssay(structuredEssay);

    // Generate annotated text for frontend consumption
    const annotationGenerator = new AnnotationGenerator();
    const annotatedText = annotationGenerator.generateAnnotatedText(
      structuredEssay,
      evaluation
    );

    // Prepare clean response
    const response: EvaluationResponse = {
      success: true,
      evaluation,
      annotatedText,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Evaluation error:", error);

    return res.status(500).json({
      success: false,
      error: "Evaluation failed",
      details: error instanceof Error ? error.message : "Unknown error",
    } as EvaluationResponse);
  }
}

// Helper function to integrate with existing unified processing
export async function enhanceProcessingWithEvaluation(
  structuredEssay: StructuredEssay,
  options: { evaluateWithISEE?: boolean } = {}
): Promise<StructuredEssay & { evaluation?: any }> {
  if (!options.evaluateWithISEE) {
    return structuredEssay;
  }

  try {
    const evaluationEngine = new EvaluationEngine(iseeUpperLevelRubric);
    const evaluation = await evaluationEngine.evaluateEssay(structuredEssay);

    return {
      ...structuredEssay,
      evaluation,
    };
  } catch (error) {
    console.error("Evaluation enhancement failed:", error);
    return structuredEssay;
  }
}
