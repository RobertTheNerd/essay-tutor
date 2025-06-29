import OpenAI from "openai";
import { EnhancedTopicResult } from "./types";

// Lazy initialization of OpenAI client - initialized on first use to ensure env vars are loaded
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (openai === null) {
    // Initialize OpenAI client with Azure configuration if available
    if (process.env.OPENAI_API_KEY) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.AZURE_OPENAI_ENDPOINT
          ? `${process.env.AZURE_OPENAI_ENDPOINT.replace(
              /\/$/,
              ""
            )}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`
          : undefined,
        defaultQuery: process.env.AZURE_OPENAI_ENDPOINT
          ? {
              "api-version":
                process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
            }
          : undefined,
        defaultHeaders: process.env.AZURE_OPENAI_ENDPOINT
          ? {
              "api-key": process.env.OPENAI_API_KEY,
            }
          : undefined,
      });
    }
  }
  return openai;
}

export interface DocumentProcessingResult {
  extractedText: string;
  detectedTopic?: string;
  confidence: number;
  processingTime: number;
  aiProcessed: boolean;
  metadata: {
    fileType: string;
    wordCount: number;
    characterCount: number;
  };
}

export interface EssayAnalysisResult {
  rubricScores: {
    grammarMechanics: number;
    wordChoiceVocabulary: number;
    structureOrganization: number;
    developmentSupport: number;
    clarityFocus: number;
  };
  overallScore: number;
  feedback: string[];
  strengths: string[];
  areasForImprovement: string[];
}

export class AIClient {
  /**
   * Extract text from various document formats using GPT-4 Vision
   */
  async extractTextFromDocument(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<DocumentProcessingResult> {
    const startTime = Date.now();

    try {
      let extractedText = "";
      let aiProcessed = false;

      if (mimeType === "text/plain") {
        // Direct text extraction
        extractedText = fileBuffer.toString("utf-8");
        aiProcessed = false;
      } else if (mimeType.startsWith("image/")) {
        const client = getOpenAIClient();
        if (client) {
          // Use GPT-4 Vision for OCR
          const base64Image = fileBuffer.toString("base64");
          const response = await client.chat.completions.create({
            model: process.env.AZURE_OPENAI_VISION_MODEL || "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Extract all text from this image. Return only the text content, maintaining the original structure and formatting as much as possible.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${base64Image}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 2000,
          });

          extractedText = response.choices[0]?.message?.content || "";
          aiProcessed = true;
        } else {
          extractedText = `[AI OCR not available - API key required to extract text from ${fileName}]`;
          aiProcessed = false;
        }
      } else if (mimeType === "application/pdf") {
        // For Phase 1, we'll use basic text extraction
        // In Phase 2, we'll add proper PDF parsing with pdf-parse
        extractedText = "PDF text extraction will be enhanced in Phase 2";
        aiProcessed = false;
      }

      // Basic topic detection
      const topic = await this.detectTopic(extractedText);

      const processingTime = Date.now() - startTime;
      const wordCount = extractedText
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      const characterCount = extractedText.length;

      return {
        extractedText,
        detectedTopic: topic,
        confidence: aiProcessed ? 0.85 : 0.0,
        processingTime,
        aiProcessed,
        metadata: {
          fileType: mimeType,
          wordCount,
          characterCount,
        },
      };
    } catch (error) {
      console.error("Document processing error:", error);
      throw new Error(
        `Failed to process document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Detect the topic/prompt from essay content (legacy method)
   */
  async detectTopic(text: string): Promise<string> {
    const enhanced = await this.detectTopicEnhanced(text);
    return enhanced.detectedTopic;
  }

  /**
   * Enhanced topic detection with ISEE categorization
   */
  async detectTopicEnhanced(text: string): Promise<EnhancedTopicResult> {
    const client = getOpenAIClient();
    if (!client) {
      return {
        detectedTopic: "Topic detection not available - AI API key required",
        promptType: "other",
        iseeCategory: "expository",
        confidence: 0,
        keywords: [],
        suggestedStructure: [],
        relatedTopics: [],
      };
    }

    try {
      const fullText = text.substring(0, 2000); // Increased context window

      const response = await client.chat.completions.create({
        model: process.env.AZURE_OPENAI_TEXT_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert ISEE essay evaluator. Extract the writing prompt/topic from the given text.

The writing prompt is typically found at the beginning of the text and tells the student what they should write about. It's usually phrased as a question or instruction.

ISEE Essay Categories:
- Narrative: Personal experiences, stories, "describe a time when..."
- Expository: Explain concepts, "describe how...", "what is...", informational
- Persuasive: Argue a position, "do you agree...", "convince...", opinion-based
- Creative: Imaginative scenarios, "if you could...", "imagine...", fictional
- Analytical: Compare/contrast, analyze causes/effects, "why do you think..."

Prompt Types:
- describe: Ask to describe something (person, place, experience)
- explain: Ask to explain how/why something works or happens
- persuade: Ask for opinion or to convince about a position
- narrative: Ask to tell a story or personal experience
- compare: Ask to compare/contrast two or more things
- other: Doesn't fit standard categories

Respond with ONLY a valid JSON object with these exact fields:
{
  "detectedTopic": "The exact writing prompt/question given to the student",
  "promptType": "describe|explain|persuade|narrative|compare|other",
  "iseeCategory": "narrative|expository|persuasive|creative|analytical",
  "confidence": 0.95,
  "keywords": ["key", "terms", "from", "prompt"],
  "suggestedStructure": ["Introduction with thesis", "Body paragraph 1", "Body paragraph 2", "Conclusion"],
  "relatedTopics": ["related", "topic", "suggestions"]
}`,
          },
          {
            role: "user",
            content: `Extract the writing prompt from this text (the prompt is usually at the beginning):\n\n${fullText}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content || "";

      try {
        // Parse JSON response
        const result = JSON.parse(content) as EnhancedTopicResult;

        // Validate required fields
        if (
          !result.detectedTopic ||
          !result.promptType ||
          !result.iseeCategory
        ) {
          throw new Error("Missing required fields");
        }

        // Ensure arrays are present
        result.keywords = result.keywords || [];
        result.suggestedStructure = result.suggestedStructure || [];
        result.relatedTopics = result.relatedTopics || [];

        // Validate confidence is between 0 and 1
        result.confidence = Math.max(0, Math.min(1, result.confidence || 0.5));

        return result;
      } catch (parseError) {
        console.warn(
          "Failed to parse enhanced topic response, falling back to basic detection:",
          parseError
        );

        // Fallback to basic topic detection
        return {
          detectedTopic: content || "Unable to detect topic",
          promptType: "other",
          iseeCategory: "expository",
          confidence: 0.3,
          keywords: [],
          suggestedStructure: ["Introduction", "Body paragraphs", "Conclusion"],
          relatedTopics: [],
        };
      }
    } catch (error) {
      console.error("Enhanced topic detection error:", error);
      return {
        detectedTopic: "Topic detection failed",
        promptType: "other",
        iseeCategory: "expository",
        confidence: 0,
        keywords: [],
        suggestedStructure: [],
        relatedTopics: [],
      };
    }
  }

  /**
   * Analyze essay using ISEE rubric (Phase 3 implementation)
   */
  async analyzeEssay(
    text: string,
    topic?: string
  ): Promise<EssayAnalysisResult> {
    // Phase 1: Basic structure, will be fully implemented in Phase 3
    return {
      rubricScores: {
        grammarMechanics: 0,
        wordChoiceVocabulary: 0,
        structureOrganization: 0,
        developmentSupport: 0,
        clarityFocus: 0,
      },
      overallScore: 0,
      feedback: ["Essay analysis will be implemented in Phase 3"],
      strengths: ["Analysis pending"],
      areasForImprovement: ["Full rubric evaluation coming in Phase 3"],
    };
  }
}

export const aiClient = new AIClient();
