import { useState } from 'react'

interface ProcessingReviewProps {
  extractedPrompt: string
  extractedEssay: string
  promptSource: 'extracted' | 'summarized'
  onConfirm: (prompt: string, essay: string) => void
  onCancel: () => void
}

export default function ProcessingReview({ 
  extractedPrompt, 
  extractedEssay, 
  promptSource,
  onConfirm,
  onCancel
}: ProcessingReviewProps) {
  const [promptText, setPromptText] = useState(extractedPrompt)
  const [essayText, setEssayText] = useState(extractedEssay)

  const handleConfirm = () => {
    onConfirm(promptText, essayText)
  }

  const isExtracted = promptSource === 'extracted'

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          📋 Review Extracted Content
        </h2>
        <p className="text-gray-600">
          {isExtracted 
            ? "AI successfully extracted the writing prompt and essay from your images."
            : "AI could only infer the writing prompt. Please review and edit before evaluation."
          }
        </p>
      </div>

      {/* Status Indicator */}
      <div className={`p-4 rounded-lg border ${
        isExtracted 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center">
          <span className={`text-2xl mr-3 ${
            isExtracted ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {isExtracted ? '✅' : '⚠️'}
          </span>
          <div>
            <p className={`font-medium ${
              isExtracted ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {isExtracted ? 'Writing Prompt: Extracted' : 'Writing Prompt: Summarized'}
            </p>
            <p className={`text-sm ${
              isExtracted ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {isExtracted 
                ? 'High confidence - ready for evaluation'
                : 'Please review and edit the prompt for better evaluation'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Writing Prompt Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Writing Prompt
          {!isExtracted && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Enter or edit the writing prompt here..."
          className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          rows={3}
        />
        {!isExtracted && (
          <p className="text-xs text-red-600">
            The prompt was inferred from context. Please edit for accuracy.
          </p>
        )}
      </div>

      {/* Essay Text Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Essay Text
        </label>
        <textarea
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          placeholder="Review and edit the extracted essay text..."
          className="w-full h-96 p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
          style={{ fontFamily: 'Space Mono, monospace' }}
        />
        <p className="text-xs text-gray-500">
          Review the extracted text for accuracy. You can edit any OCR errors.
        </p>
      </div>

      {/* Statistics */}
      <div className="flex space-x-6 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
        <span>
          <strong>Words:</strong> {essayText.trim().split(/\s+/).filter(word => word.length > 0).length}
        </span>
        <span>
          <strong>Characters:</strong> {essayText.length}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!promptText.trim() || !essayText.trim()}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            promptText.trim() && essayText.trim()
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isExtracted ? '🎯 Evaluate Essay' : '📝 Proceed to Evaluation'}
        </button>
      </div>
    </div>
  )
}