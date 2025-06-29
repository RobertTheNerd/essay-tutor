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

export interface BatchImageProcessingResult {
  fullText: string;
  detectedTopic: string;
  enhancedTopic: EnhancedTopicResult;
  orderedPages: {
    originalIndex: number;
    correctOrder: number;
    filename: string;
    extractedText: string;
    confidence: number;
  }[];
  processingTime: number;
  totalPages: number;
  aiProcessed: boolean;
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
   * Process multiple images in batch with AI ordering and topic extraction
   */
  async processBatchImages(
    imageFiles: { buffer: Buffer; filename: string; mimeType: string }[]
  ): Promise<BatchImageProcessingResult> {
    const startTime = Date.now();
    const client = getOpenAIClient();

    if (!client) {
      return {
        fullText: "AI processing not available - API key required",
        detectedTopic: "Topic detection not available - AI API key required",
        enhancedTopic: {
          detectedTopic: "Topic detection not available - AI API key required",
          promptType: "other",
          iseeCategory: "expository",
          confidence: 0,
          keywords: [],
          suggestedStructure: [],
          relatedTopics: [],
          topicSource: "extracted"
        },
        orderedPages: imageFiles.map((file, index) => ({
          originalIndex: index,
          correctOrder: index + 1,
          filename: file.filename,
          extractedText: "AI processing not available",
          confidence: 0
        })),
        processingTime: Date.now() - startTime,
        totalPages: imageFiles.length,
        aiProcessed: false
      };
    }

    try {
      // Prepare images for AI processing
      const imageContent = imageFiles.map((file, index) => ({
        type: "image_url" as const,
        image_url: {
          url: `data:${file.mimeType};base64,${file.buffer.toString("base64")}`,
          detail: "high" as const
        }
      }));

      // Single AI request to process all images, extract text, and determine order
      const response = await client.chat.completions.create({
        model: process.env.AZURE_OPENAI_VISION_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert at processing essay images. You need to:

1. Extract all text from each image
2. Look for an EXPLICIT writing prompt/question (usually at the beginning)
3. Determine the correct page order (images may be uploaded out of order)
4. Combine all text in the correct order

IMPORTANT: Only use "extracted" if you find an ACTUAL writing prompt/question in the text. If the essay starts directly with the student's response (no prompt visible), use "summarized".

Respond with ONLY a valid JSON object:
{
  "detectedTopic": "The writing prompt OR topic summary",
  "topicSource": "extracted or summarized",
  "pages": [
    {
      "originalIndex": 0,
      "correctOrder": 1,
      "extractedText": "Full text from this page",
      "confidence": 0.95
    }
  ]
}

Use topicSource: "extracted" ONLY if you find explicit prompts like:
- "What is your favorite hobby?"
- "Describe a time when you overcame a challenge"
- "Do you agree that students should wear uniforms?"

Use topicSource: "summarized" if the essay starts directly with the student's response like:
- "One person who impacted me is..."
- "My favorite hobby is basketball because..."
- "Last summer I faced a challenge..."

For summarized topics, create a brief description like "Essay about a teacher's impact" not a fictional prompt.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Process these ${imageFiles.length} essay images. Extract text, identify the writing prompt, and determine correct page order. Images are provided in upload order (may not be correct order).`
              },
              ...imageContent
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      });

      const content = response.choices[0]?.message?.content || "";
      
      try {
        const aiResult = JSON.parse(content);
        
        // Validate and process AI response
        const orderedPages = (aiResult.pages || []).map((page: any, index: number) => ({
          originalIndex: page.originalIndex || index,
          correctOrder: page.correctOrder || index + 1,
          filename: imageFiles[page.originalIndex || index]?.filename || `page-${index + 1}`,
          extractedText: page.extractedText || "",
          confidence: Math.max(0, Math.min(1, page.confidence || 0.8))
        }));

        // Sort by correct order and combine text
        const sortedPages = [...orderedPages].sort((a, b) => a.correctOrder - b.correctOrder);
        const fullText = sortedPages.map(page => page.extractedText).join('\n\n');
        
        // Extract topic and source from AI response 
        let detectedTopic = aiResult.detectedTopic || "";
        let topicSource = aiResult.topicSource || "summarized";
        
        // Get enhanced topic analysis
        const enhancedTopic = await this.detectTopicEnhanced(fullText);
        enhancedTopic.topicSource = topicSource;
        
        // Use enhanced topic if AI didn't provide a good topic
        if (!detectedTopic || detectedTopic.length < 10) {
          detectedTopic = enhancedTopic.detectedTopic;
          topicSource = "summarized"; // Default to summarized if we fall back
          enhancedTopic.topicSource = "summarized";
        }

        return {
          fullText,
          detectedTopic,
          enhancedTopic,
          orderedPages,
          processingTime: Date.now() - startTime,
          totalPages: imageFiles.length,
          aiProcessed: true
        };

      } catch (parseError) {
        console.warn("Failed to parse batch processing response, falling back to individual processing:", parseError);
        
        // Fallback: process images individually
        const fallbackResults = [];
        let combinedText = "";
        
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          try {
            const result = await this.extractTextFromDocument(
              file.buffer,
              file.mimeType,
              file.filename
            );
            
            fallbackResults.push({
              originalIndex: i,
              correctOrder: i + 1,
              filename: file.filename,
              extractedText: result.extractedText,
              confidence: result.confidence
            });
            
            combinedText += result.extractedText + "\n\n";
          } catch (error) {
            fallbackResults.push({
              originalIndex: i,
              correctOrder: i + 1,
              filename: file.filename,
              extractedText: `Error processing ${file.filename}`,
              confidence: 0
            });
          }
        }
        
        const enhancedTopic = await this.detectTopicEnhanced(combinedText);
        
        return {
          fullText: combinedText,
          detectedTopic: enhancedTopic.detectedTopic,
          enhancedTopic,
          orderedPages: fallbackResults,
          processingTime: Date.now() - startTime,
          totalPages: imageFiles.length,
          aiProcessed: true
        };
      }

    } catch (error) {
      console.error("Batch image processing error:", error);
      
      return {
        fullText: "Batch processing failed",
        detectedTopic: "Topic detection failed",
        enhancedTopic: {
          detectedTopic: "Topic detection failed",
          promptType: "other",
          iseeCategory: "expository",
          confidence: 0,
          keywords: [],
          suggestedStructure: [],
          relatedTopics: [],
          topicSource: "summarized"
        },
        orderedPages: imageFiles.map((file, index) => ({
          originalIndex: index,
          correctOrder: index + 1,
          filename: file.filename,
          extractedText: "Processing failed",
          confidence: 0
        })),
        processingTime: Date.now() - startTime,
        totalPages: imageFiles.length,
        aiProcessed: false
      };
    }
  }

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
        topicSource: "extracted"
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
  "detectedTopic": "The writing prompt OR topic summary",
  "promptType": "describe|explain|persuade|narrative|compare|other",
  "iseeCategory": "narrative|expository|persuasive|creative|analytical",
  "confidence": 0.95,
  "keywords": ["key", "terms", "from", "prompt"],
  "suggestedStructure": ["Introduction with thesis", "Body paragraph 1", "Body paragraph 2", "Conclusion"],
  "relatedTopics": ["related", "topic", "suggestions"],
  "topicSource": "extracted or summarized"
}

If you find an explicit writing prompt/question in the text (like "What is your favorite..." or "Describe a time when..."), use topicSource: "extracted" and include the exact prompt.

If no explicit prompt is found, use topicSource: "summarized" and create a concise topic summary based on what the essay is about.`,
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
        
        // Ensure topicSource is valid
        result.topicSource = result.topicSource === "extracted" ? "extracted" : "summarized";

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
          topicSource: "summarized"
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
        topicSource: "summarized"
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
