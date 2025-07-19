import { useState } from 'react'

interface ProcessingReviewProps {
  extractedPrompt: string
  extractedEssay: string
  promptSource: 'extracted' | 'summarized' | 'user_provided'
  onConfirm: (prompt: string, essay: string) => void
  onCancel: () => void
  isEvaluating?: boolean
}

export default function ProcessingReview({
  extractedPrompt,
  extractedEssay,
  promptSource,
  onConfirm,
  onCancel,
  isEvaluating = false,
}: ProcessingReviewProps) {
  const [promptText, setPromptText] = useState(extractedPrompt)
  const [essayText, setEssayText] = useState(extractedEssay)

  const handleConfirm = () => {
    onConfirm(promptText, essayText)
  }

  const isExtracted = promptSource === 'extracted'
  const isUserProvided = promptSource === 'user_provided'

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6 space-y-6 mt-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">✨ Review Your Essay</h2>
        <p className="text-gray-600">
          {isExtracted
            ? 'AI successfully extracted the writing prompt and essay from your images.'
            : isUserProvided
            ? 'Please review the extracted essay text and ensure the writing prompt is correct.'
            : 'We\'ve analyzed your essay and suggested a writing prompt based on the content. You can edit it or leave it blank - both work great for evaluation!'}
        </p>
      </div>


      {/* Writing Prompt Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Writing Prompt (Optional)
        </label>
        <textarea
          value={promptText}
          onChange={e => setPromptText(e.target.value)}
          placeholder="Enter or edit the writing prompt here..."
          className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          rows={3}
        />
      </div>

      {/* Essay Text Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Essay Text</label>
        <textarea
          value={essayText}
          onChange={e => setEssayText(e.target.value)}
          placeholder="Review and edit the extracted essay text..."
          className="w-full h-96 p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
          style={{ fontFamily: 'Space Mono, monospace' }}
        />
        <p className="text-xs text-gray-500">
          Review the extracted text for accuracy. You can edit any OCR errors.
        </p>
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
          disabled={!essayText.trim() || isEvaluating}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            !essayText.trim() || isEvaluating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isEvaluating ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
              Evaluating...
            </span>
          ) : (
            isExtracted ? '🎯 Evaluate Essay' : '📝 Proceed to Evaluation'
          )}
        </button>
      </div>
    </div>
  )
}
