import OpenAI from "openai";
import { EnhancedTopicResult } from "./types";

/**
 * AI Client with support for multiple Azure OpenAI deployments
 * 
 * Environment Variables:
 * - AZURE_OPENAI_TEXT_DEPLOYMENT_NAME: Deployment name for text models (GPT-4, GPT-3.5-turbo, etc.)
 * - AZURE_OPENAI_VISION_DEPLOYMENT_NAME: Deployment name for vision models (GPT-4 Vision, etc.)
 * - AZURE_OPENAI_DEPLOYMENT_NAME: Fallback deployment name if specific ones aren't set
 * - AZURE_OPENAI_TEXT_MODEL: Model name for text operations (e.g., "gpt-4o-mini")
 * - AZURE_OPENAI_VISION_MODEL: Model name for vision operations (e.g., "gpt-4o-mini")
 * - AZURE_OPENAI_ENDPOINT: Azure OpenAI endpoint URL
 * - AZURE_OPENAI_API_VERSION: API version (defaults to "2025-04-14")
 * - OPENAI_API_KEY: API key for authentication
 */
// Cache for different OpenAI clients (one per deployment)
const openaiClients: { [deploymentName: string]: OpenAI | null } = {};

/**
 * Get OpenAI client for a specific deployment
 */
function getOpenAIClientForDeployment(deploymentName: string): OpenAI | null {
  if (!deploymentName) {
    console.warn('No deployment name provided');
    return null;
  }

  if (!(deploymentName in openaiClients)) {
    // Initialize OpenAI client with Azure configuration for this deployment
    if (process.env.OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
      console.log(`Initializing OpenAI client for deployment: ${deploymentName}`);
      try {
        openaiClients[deploymentName] = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: `${process.env.AZURE_OPENAI_ENDPOINT.replace(
            /\/$/,
            ""
          )}/openai/deployments/${deploymentName}`,
          defaultQuery: {
            "api-version": process.env.AZURE_OPENAI_API_VERSION || "2025-04-14",
          },
          defaultHeaders: {
            "api-key": process.env.OPENAI_API_KEY,
          },
        });
        console.log(`OpenAI client initialized successfully for deployment: ${deploymentName}`);
      } catch (error) {
        console.error(`Failed to initialize OpenAI client for deployment ${deploymentName}:`, error);
        openaiClients[deploymentName] = null;
      }
    } else if (process.env.OPENAI_API_KEY && !process.env.AZURE_OPENAI_ENDPOINT) {
      // Standard OpenAI (non-Azure) configuration
      console.log('Initializing standard OpenAI client');
      try {
        openaiClients[deploymentName] = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('Standard OpenAI client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize standard OpenAI client:', error);
        openaiClients[deploymentName] = null;
      }
    } else {
      console.log('No OPENAI_API_KEY found, OpenAI client not initialized');
      openaiClients[deploymentName] = null;
    }
  }
  
  return openaiClients[deploymentName];
}

/**
 * Legacy function for backward compatibility
 */
function getOpenAIClient(): OpenAI | null {
  // Use text deployment as default for backward compatibility
  const textDeployment = process.env.AZURE_OPENAI_TEXT_DEPLOYMENT_NAME || 
                         process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 
                         'default';
  return getOpenAIClientForDeployment(textDeployment);
}

/**
 * Get client for text models
 */
function getTextClient(): OpenAI | null {
  const deploymentName = process.env.AZURE_OPENAI_TEXT_DEPLOYMENT_NAME || 
                         process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 
                         'text-deployment';
  return getOpenAIClientForDeployment(deploymentName);
}

/**
 * Get client for vision models
 */
function getVisionClient(): OpenAI | null {
  const deploymentName = process.env.AZURE_OPENAI_VISION_DEPLOYMENT_NAME || 
                         process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 
                         'vision-deployment';
  return getOpenAIClientForDeployment(deploymentName);
}

function getTextModel(): string {
  return process.env.AZURE_OPENAI_TEXT_MODEL || "gpt-4o-mini";
}

function getVisionModel(): string {
  return process.env.AZURE_OPENAI_VISION_MODEL || "gpt-4o-mini";
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
    ideasContent: number;
    organization: number;
    voiceFocus: number;
    wordChoice: number;
    sentenceFluency: number;
    conventions: number;
  };
  overallScore: number;
  feedback: string[] | { [category: string]: string };
  strengths: string[];
  areasForImprovement: string[];
  annotations?: {
    originalText: string;
    category: string;
    explanation: string;
    suggestedText?: string;
  }[];
  paragraphFeedback?: {
    paragraphNumber: number;
    title: string;
    content: string;
    type: 'positive' | 'excellent' | 'needs-improvement';
    priority: 'high' | 'medium' | 'low';
  }[];
  nextSteps?: string;
}

export class AIClient {
  private textClient: any
  private visionClient: any
  private textModel: string
  private visionModel: string

  constructor() {
    // Don't initialize clients in constructor - wait until first use
    this.textClient = null
    this.visionClient = null
    this.textModel = getTextModel()
    this.visionModel = getVisionModel()
  }

  private getTextClient() {
    if (this.textClient === null) {
      this.textClient = getTextClient()
    }
    return this.textClient
  }

  private getVisionClient() {
    if (this.visionClient === null) {
      this.visionClient = getVisionClient()
    }
    return this.visionClient
  }

  // Legacy method for backward compatibility
  private getClient() {
    // Default to text client for backward compatibility
    return this.getTextClient()
  }

  /**
   * Process multiple images in batch with AI ordering and topic extraction
   */
  async processBatchImages(
    imageFiles: { buffer: Buffer; filename: string; mimeType: string }[]
  ): Promise<BatchImageProcessingResult> {
    const startTime = Date.now();
    const client = this.getVisionClient();

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
        model: this.visionModel,
        messages: [
          {
            role: "system",
            content: `You are an expert at extracting essay prompts from scanned or photographed test pages (e.g., ISEE practice essays). Follow these steps:
	1.	Extract all visible text from each image.
	2.	Identify the explicit writing prompt/question — this is usually labeled with terms like “Essay Topic,” “Prompt,” or found inside a boxed or bold section at the top of the page.
	•	The prompt is often one or two sentences long and may span multiple lines.
	•	Ignore surrounding instructions (e.g., “Only write on this essay question” or “Only write in blue or black pen”) unless they are part of the question itself.
	3.	Determine page order — reorder pages so the actual prompt appears before any student writing.
	4.	If the explicit prompt is found, set "topicSource": "extracted" and use the exact wording of the prompt as "detectedTopic".
	5.	If no explicit prompt is visible and the essay starts directly with a student’s response, set "topicSource": "summarized" and create a short description of the topic (e.g., "Essay about a chef as a role model").
	6.	Ensure "confidence" reflects how certain you are that the detectedTopic is correct (range 0–1).
	7.	Return ONLY valid JSON in this format:

{
“detectedTopic”: “The exact writing prompt or a short topic summary”,
“topicSource”: “extracted or summarized”,
“pages”: [
{
“originalIndex”: 0,
“correctOrder”: 1,
“extractedText”: “Full text from this page”,
“confidence”: 0.95
}
]
}

Important Notes:
	•	Preserve the exact capitalization, punctuation, and line breaks of the detected prompt.
	•	Do NOT rewrite or paraphrase if "topicSource": "extracted".
	•	For "summarized", make the description short, factual, and non-fictional.
            `
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
        ]
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
        console.error(
          "Failed to parse batch processing response:",
          parseError,
          { contentPreview: (content || "").slice(0, 200) }
        );
        // Propagate to outer handler to return a uniform failure response
        throw new Error("Invalid AI JSON response");
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
        const client = this.getVisionClient();
        if (client) {
          // Use GPT-4 Vision for OCR
          const base64Image = fileBuffer.toString("base64");
          const response = await client.chat.completions.create({
            model: this.visionModel,
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
    const client = this.getTextClient();
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
        model: this.textModel,
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
        ]
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
    const client = this.getClient();

    // Check if AI client is available
    console.log('AI Client status:', {
      client: !!client,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      hasAzureEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
      model: this.textModel
    });

    if (!client) {
      console.error('OpenAI client not available - cannot perform AI evaluation');
      throw new Error('AI evaluation service unavailable. Please check API configuration.');
    }

    try {
      const prompt = this.buildISEEEvaluationPrompt(text, topic);

      const response = await client.chat.completions.create({
        model: this.textModel,
        messages: [
          {
            role: "system",
            content: "You are an expert ISEE writing evaluator for grades 7-8. Provide detailed, constructive feedback based on the ISEE Upper Level rubric."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      return this.parseEvaluationResponse(aiResponse);

    } catch (error) {
      console.error('Essay analysis failed:', error);
      // Re-throw the error to ensure AI-only evaluation
      throw new Error('AI evaluation service unavailable. Please check API configuration.');
    }
  }

  /**
   * Build comprehensive ISEE evaluation prompt
   */
  private buildISEEEvaluationPrompt(text: string, topic?: string): string {
    return `
Please evaluate this ISEE Upper Level essay (for admissions to grades 9-12) according to the official rubric. 

${topic ? `Writing Prompt: ${topic}` : ''}

Essay to Evaluate:
"""
${text}
"""

Please provide a detailed evaluation with:

1. SCORES (1-4 scale for each category):
   - Ideas & Content (topic development, supporting details, depth of analysis, creativity)
   - Organization (structure, logical sequence, transitions, introduction and conclusion)
   - Voice & Focus (writer's personality, tone, clarity of message, audience awareness)
   - Word Choice (vocabulary precision, variety, grade-appropriate language, impact)
   - Sentence Fluency (sentence variety, rhythm, flow, readability when read aloud)
   - Conventions (grammar, spelling, punctuation, capitalization, mechanics)

2. DETAILED FEEDBACK for each category with specific examples from the text
   IMPORTANT: Do NOT start feedback with the category name (e.g., don't write "Ideas & Content:" at the beginning). 
   The feedback will be displayed in a UI where the category is already clearly labeled.
   
   Provide substantive, specific feedback for each category:
   
   • Ideas & Content: Comment on topic development, use of supporting details, depth of analysis, 
     creativity, and how well the essay addresses the prompt. Quote specific examples from the text.
     
   • Organization: Analyze the essay's structure, logical flow, use of transitions, effectiveness of 
     introduction and conclusion. Point out specific organizational strengths or areas needing improvement.
     
   • Voice & Focus: Evaluate the writer's personality coming through, appropriateness of tone for the 
     audience, clarity of the main message, and consistent focus throughout. Reference specific passages.
     
   • Word Choice: Assess vocabulary precision, variety, grade-appropriate language, and impact. 
     Highlight effective word choices and suggest improvements for unclear or imprecise language.
     
   • Sentence Fluency: Examine sentence variety, rhythm, flow, and readability. Comment on sentence 
     structure patterns, transitions between sentences, and overall reading flow.
     
   • Conventions: Identify patterns in grammar, spelling, punctuation, and capitalization errors. 
     Note what the student does well and what mechanics need the most attention.

3. PARAGRAPH-BY-PARAGRAPH ANALYSIS: You MUST analyze each paragraph individually. Split the essay into paragraphs and provide feedback for each one:
   - Paragraph number (1, 2, 3, etc.)
   - Descriptive title (e.g., "Strong Introduction", "Needs Better Transitions")
   - Detailed content analysis (2-3 sentences explaining strengths/weaknesses)
   - Type classification: "excellent", "positive", or "needs-improvement"
   - Priority level: "high", "medium", or "low"
   
   IMPORTANT: Even if the essay is short, you must provide paragraph-by-paragraph feedback. Include this in your JSON response.

4. SPECIFIC ANNOTATIONS: Identify all text segments that need improvement, with:
   - Original text excerpt (exact words from the essay, 3-15 words)
   - Category: Use specific annotation types for precise teacher-like feedback:
     
     Grammar & Mechanics:
     • "grammar" - Subject-verb agreement, verb tense, pronoun usage
     • "spelling" - Spelling correction needed
     • "punctuation" - Punctuation adjustment needed
     • "capitalization" - Capitalization correction
     • "sentence-structure" - Sentence structure improvement
     • "sentence-boundary" - Sentence boundary clarification
     
     Content & Development:
     • "clarify-idea" - Clarify this idea for better understanding
     • "add-support" - Add evidence or examples to strengthen this point
     • "stay-focused" - Return focus to the main topic
     • "strengthen-example" - Develop this example more effectively
     • "expand-idea" - Develop this idea further
     
     Organization & Structure:
     • "add-transition" - Add connecting words to link ideas
     • "strengthen-topic-sentence" - Develop a clearer topic sentence
     • "improve-flow" - Improve paragraph organization
     • "clarify-thesis" - Clarify your main argument
     • "strengthen-conclusion" - Develop a stronger ending
     
     Style & Clarity:
     • "precise-word" - Choose a more precise word
     • "smooth-phrasing" - Rephrase for clarity and flow
     • "formal-tone" - Use more formal academic language
     • "concise-expression" - Express this more concisely
     • "enhance-clarity" - Make this clearer for the reader
     
     Sentence Fluency:
     • "vary-sentences" - Add sentence variety for better flow
     • "combine-sentences" - Consider combining for smoother reading
     • "simplify-structure" - Simplify complex sentence structure

   - Explanation of the specific improvement opportunity
   - Suggested improvement (when applicable)
   - Focus primarily on growth opportunities, but include positive annotations for strengths

5. SUMMARY:
   - Top strengths
   - Top areas for improvement
   - Next steps for growth

Format your response as valid JSON with this structure:
{
  "scores": {
    "ideas": 1-4,
    "organization": 1-4,
    "voice": 1-4,
    "wordChoice": 1-4,
    "fluency": 1-4,
    "conventions": 1-4
  },
  "overallScore": calculated_average,
  "feedback": {
    "ideas": "Detailed feedback about ideas and content without category prefix",
    "organization": "Detailed feedback about organization without category prefix",
    "voice": "Detailed feedback about voice and focus without category prefix",
    "wordChoice": "Detailed feedback about word choice without category prefix",
    "fluency": "Detailed feedback about sentence fluency without category prefix",
    "conventions": "Detailed feedback about conventions without category prefix"
  },
  "paragraphFeedback": [
    {
      "paragraphNumber": 1,
      "title": "Strong Introduction",
      "content": "Detailed analysis of this paragraph's strengths and weaknesses",
      "type": "excellent|positive|needs-improvement",
      "priority": "high|medium|low"
    }
  ],
  "annotations": [
    {
      "originalText": "exact text from essay",
      "category": "grammar|spelling|punctuation|capitalization|sentence-structure|sentence-boundary|clarify-idea|add-support|stay-focused|strengthen-example|expand-idea|add-transition|strengthen-topic-sentence|improve-flow|clarify-thesis|strengthen-conclusion|precise-word|smooth-phrasing|formal-tone|concise-expression|enhance-clarity|vary-sentences|combine-sentences|simplify-structure",
      "explanation": "specific improvement opportunity",
      "suggestedText": "suggested improvement"
    }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasForImprovement": ["improvement 1", "improvement 2", "improvement 3"],
  "nextSteps": "specific guidance for improvement"
}

Be constructive, specific, and encouraging while maintaining high standards appropriate for this level.
Each feedback category should contain detailed, specific feedback without the category name prefix.
`;
  }

  /**
   * Parse AI evaluation response
   */
  private parseEvaluationResponse(aiResponse: string): EssayAnalysisResult {
    try {
      // Clean up the response to extract JSON
      const jsonStart = aiResponse.indexOf('{');
      const jsonEnd = aiResponse.lastIndexOf('}') + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON found in AI response');
      }

      const jsonStr = aiResponse.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonStr);
      
      // Debug logging for paragraph feedback
      if (parsed.paragraphFeedback) {
        console.log('AI generated paragraph feedback:', parsed.paragraphFeedback.length, 'paragraphs');
      } else {
        console.log('No paragraph feedback in AI response');
      }

      // Handle both array and object feedback formats
      let processedFeedback: any = parsed.feedback;
      if (Array.isArray(parsed.feedback)) {
        // Legacy array format - convert to object for consistency
        console.log('Converting legacy array feedback format to structured object');
        const categories = ['ideas', 'organization', 'voice', 'wordChoice', 'fluency', 'conventions'];
        const feedbackObject: { [key: string]: string } = {};
        parsed.feedback.forEach((feedbackText: string, index: number) => {
          if (index < categories.length && feedbackText && feedbackText.trim()) {
            feedbackObject[categories[index]] = feedbackText.trim();
          }
        });
        processedFeedback = feedbackObject;
      } else if (typeof parsed.feedback === 'object' && parsed.feedback !== null) {
        // New structured object format - use as is
        console.log('Using structured object feedback format');
        processedFeedback = parsed.feedback;
      } else {
        // Fallback for unexpected format
        console.warn('Unexpected feedback format, using fallback');
        processedFeedback = {
          ideas: "AI evaluation completed",
          organization: "Analysis available", 
          voice: "Feedback generated",
          wordChoice: "Assessment complete",
          fluency: "Review finished",
          conventions: "Evaluation done"
        };
      }

      return {
        rubricScores: {
          ideasContent: parsed.scores?.ideas || 2,
          organization: parsed.scores?.organization || 2,
          voiceFocus: parsed.scores?.voice || 2,
          wordChoice: parsed.scores?.wordChoice || 2,
          sentenceFluency: parsed.scores?.fluency || 2,
          conventions: parsed.scores?.conventions || 2,
        },
        overallScore: parsed.overallScore || 3,
        feedback: processedFeedback,
        strengths: parsed.strengths || ["Essay demonstrates understanding"],
        areasForImprovement: parsed.areasForImprovement || ["Continue developing skills"],
        annotations: parsed.annotations || [],
        paragraphFeedback: parsed.paragraphFeedback || [],
        nextSteps: parsed.nextSteps || "Focus on continued improvement"
      };

    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.log('Raw AI response:', aiResponse);

      // Return basic analysis if parsing fails
      return this.getBasicAnalysis(aiResponse.substring(0, 500));
    }
  }

  /**
   * Fallback basic analysis when AI fails
   */
  private getBasicAnalysis(text: string): EssayAnalysisResult {
    const wordCount = text.trim().split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).length - 1;
    const paragraphCount = text.split(/\n\s*\n/).length;

    // Basic scoring based on text metrics
    const baseScore = Math.min(5, Math.max(1, Math.floor(wordCount / 50) + 1));

    return {
      rubricScores: {
        ideasContent: wordCount > 100 ? baseScore : Math.max(1, baseScore - 1),
        organization: paragraphCount > 1 ? baseScore : Math.max(1, baseScore - 1),
        voiceFocus: baseScore,
        wordChoice: Math.max(1, baseScore - 1),
        sentenceFluency: baseScore,
        conventions: baseScore,
      },
      overallScore: baseScore,
      feedback: [
        `Essay contains ${wordCount} words across ${paragraphCount} paragraphs`,
        "Basic analysis completed - AI evaluation temporarily unavailable"
      ],
      strengths: ["Essay demonstrates effort and understanding"],
      areasForImprovement: ["Continue developing writing skills"],
      annotations: [],
      paragraphFeedback: [],
      nextSteps: "Focus on expanding ideas with more detail and examples"
    };
  }
}

export const aiClient = new AIClient();
