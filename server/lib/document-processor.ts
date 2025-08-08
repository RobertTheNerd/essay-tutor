// Unified Document Processing Service
// Handles conversion of all input types to MultiPageDocument → StructuredEssay pipeline

import { aiClient } from './ai-client'
import type { 
  MultiPageDocument, 
  DocumentPage, 
  StructuredEssay, 
  WritingPrompt,
  AdvancedTextStatistics,
  EssayStructure,
  EnhancedTopicResult 
} from './types'

/**
 * Convert text input to MultiPageDocument
 */
export async function convertTextToDocument(text: string): Promise<MultiPageDocument> {
  const startTime = Date.now()
  
  const page: DocumentPage = {
    pageNumber: 1,
    content: text,
    confidence: 1.0, // Text input has perfect confidence
    metadata: {
      processingTime: 0
    }
  }

  return {
    pages: [page],
    metadata: {
      source: 'text',
      totalPages: 1,
      processingTime: Date.now() - startTime,
      confidence: 1.0,
      aiProcessed: false
    }
  }
}

/**
 * Convert batch image processing result to MultiPageDocument
 */
export async function convertImagesToDocument(
  imageFiles: { buffer: Buffer; filename: string; mimeType: string }[]
): Promise<MultiPageDocument> {
  const startTime = Date.now()
  
  // Use existing batch processing
  const batchResult = await aiClient.processBatchImages(imageFiles)
  
  const pages: DocumentPage[] = batchResult.orderedPages.map(page => ({
    pageNumber: page.correctOrder,
    content: page.extractedText,
    confidence: page.confidence,
    metadata: {
      originalFilename: page.filename,
      originalIndex: page.originalIndex
    }
  }))

  return {
    pages: pages.sort((a, b) => a.pageNumber - b.pageNumber),
    metadata: {
      source: 'images',
      totalPages: batchResult.totalPages,
      processingTime: Date.now() - startTime,
      confidence: batchResult.orderedPages.reduce((sum, p) => sum + p.confidence, 0) / batchResult.orderedPages.length,
      aiProcessed: batchResult.aiProcessed,
      detectedTopic: batchResult.detectedTopic,
      topicSource: batchResult.topicSource,
      enhancedTopic: batchResult.enhancedTopic
    }
  }
}

/**
 * Extract structured essay from MultiPageDocument
 */
export async function extractStructuredEssay(document: MultiPageDocument): Promise<StructuredEssay> {
  const startTime = Date.now()
  
  // Combine all pages into full text
  const fullText = document.pages.map(page => page.content).join('\n\n')
  
  // Use topic inferred during image processing when available; otherwise create a basic fallback
  const enhancedTopic: EnhancedTopicResult = document.metadata.enhancedTopic ?? {
    detectedTopic: document.metadata.detectedTopic || 'Topic not found',
    promptType: 'other',
    iseeCategory: 'expository',
    confidence: 0.5,
    keywords: [],
    suggestedStructure: [],
    relatedTopics: [],
    topicSource: document.metadata.topicSource || 'summarized'
  }
  
  // Extract writing prompt vs student essay
  const { writingPrompt, studentEssayText } = await extractPromptAndEssay(fullText, enhancedTopic)
  
  // Generate advanced statistics and structure analysis
  const statistics = getAdvancedTextStatistics(studentEssayText)
  const structure = analyzeEssayStructure(studentEssayText)

  return {
    writingPrompt,
    studentEssay: {
      fullText: studentEssayText,
      structure,
      statistics,
      enhancedTopic
    },
    metadata: {
      originalDocument: document,
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Extract writing prompt from essay text (internal helper)
 */
async function extractPromptAndEssay(
  fullText: string, 
  enhancedTopic: EnhancedTopicResult
): Promise<{ writingPrompt: WritingPrompt; studentEssayText: string }> {
  
  let writingPrompt: WritingPrompt
  let studentEssayText: string

  if (enhancedTopic.topicSource === 'extracted') {
    // Try to find the actual prompt in the text
    const lines = fullText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    // Look for prompt patterns in first few lines
    const promptPatterns = [
      /^(what|describe|explain|do you|why|how|if you|imagine|compare)/i,
      /\?$/,
      /^[A-Z][^.]*[?]/
    ]
    
    let promptLine = ''
    let essayStartIndex = 0
    
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i]
      if (promptPatterns.some(pattern => pattern.test(line))) {
        promptLine = line
        essayStartIndex = i + 1
        break
      }
    }
    
    if (promptLine) {
      writingPrompt = {
        text: promptLine,
        source: 'extracted',
        confidence: enhancedTopic.confidence,
        iseeCategory: enhancedTopic.iseeCategory,
        promptType: enhancedTopic.promptType
      }
      studentEssayText = lines.slice(essayStartIndex).join('\n\n')
    } else {
      // Fallback: treat detected topic as prompt, full text as essay
      writingPrompt = {
        text: enhancedTopic.detectedTopic,
        source: 'extracted',
        confidence: enhancedTopic.confidence * 0.7, // Lower confidence since we couldn't find explicit prompt
        iseeCategory: enhancedTopic.iseeCategory,
        promptType: enhancedTopic.promptType
      }
      studentEssayText = fullText
    }
  } else {
    // Summarized topic
    writingPrompt = {
      text: enhancedTopic.detectedTopic,
      source: 'summarized',
      confidence: enhancedTopic.confidence,
      iseeCategory: enhancedTopic.iseeCategory,
      promptType: enhancedTopic.promptType
    }
    studentEssayText = fullText
  }

  return { writingPrompt, studentEssayText }
}

// Import existing helper functions
function getAdvancedTextStatistics(text: string): AdvancedTextStatistics {
  const normalizedText = normalizeText(text)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const sentences = normalizedText.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = normalizedText.trim().split(/\s+/).filter(word => word.length > 0)
  
  // Advanced statistics
  const averageWordsPerSentence = sentences.length > 0 ? (words.length / sentences.length) : 0
  const averageSentencesPerParagraph = paragraphs.length > 0 ? (sentences.length / paragraphs.length) : 0
  const averageCharactersPerWord = words.length > 0 ? (words.join('').length / words.length) : 0
  
  // Complexity indicators
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 20).length
  const shortSentences = sentences.filter(s => s.split(/\s+/).length < 8).length
  const complexWords = words.filter(w => w.length > 6).length
  
  return {
    normalizedText,
    paragraphs: paragraphs.length,
    sentences: sentences.length,
    words: words.length,
    characters: normalizedText.length,
    charactersNoSpaces: normalizedText.replace(/\s+/g, '').length,
    averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
    averageSentencesPerParagraph: Math.round(averageSentencesPerParagraph * 10) / 10,
    averageCharactersPerWord: Math.round(averageCharactersPerWord * 10) / 10,
    longSentences,
    shortSentences,
    complexWords,
    complexityScore: Math.round(((complexWords / words.length) * 100) * 10) / 10
  }
}

function normalizeText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove extra spaces around punctuation
    .replace(/\s+([.!?,:;])/g, '$1')
    // Ensure space after punctuation
    .replace(/([.!?])([A-Z])/g, '$1 $2')
    // Clean up quotes
    .replace(/``/g, '"')
    .replace(/''/g, '"')
    // Trim
    .trim()
}

function analyzeEssayStructure(text: string): EssayStructure {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.trim().split(/\s+/).filter(word => word.length > 0)
  
  // Simple heuristics for structure detection
  const hasIntroduction = paragraphs.length > 0 && paragraphs[0].length > 50
  const hasConclusion = paragraphs.length > 1 && paragraphs[paragraphs.length - 1].length > 30
  const hasBodyParagraphs = paragraphs.length >= 3

  return {
    hasIntroduction,
    hasBodyParagraphs,
    hasConclusion,
    paragraphCount: paragraphs.length,
    estimatedWordCount: words.length
  }
}