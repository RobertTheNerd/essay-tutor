import { useEffect, useState } from 'react'

interface TextEditorProps {
  onPromptChange?: (prompt: string) => void
  onEssayChange?: (essay: string) => void
  promptPlaceholder?: string
  essayPlaceholder?: string
}

export default function TextEditor({
  onPromptChange,
  onEssayChange,
  promptPlaceholder,
  essayPlaceholder,
}: TextEditorProps) {
  const [promptText, setPromptText] = useState('')
  const [essayText, setEssayText] = useState('')

  useEffect(() => {
    if (onPromptChange) {
      onPromptChange(promptText)
    }
  }, [promptText, onPromptChange])

  useEffect(() => {
    if (onEssayChange) {
      onEssayChange(essayText)
    }
  }, [essayText, onEssayChange])

  return (
    <div className="space-y-8">
      {/* Modern Writing Prompt Field - Notion inspired */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          Writing prompt <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={promptText}
          onChange={e => setPromptText(e.target.value)}
          placeholder={promptPlaceholder || 'Enter writing prompt...'}
          className="w-full h-20 px-0 py-2 bg-transparent border-0 border-b border-gray-100 focus:border-blue-500 focus:outline-none transition-colors duration-200 resize-none text-base placeholder-gray-400 hover:border-gray-200"
          rows={2}
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        />
      </div>

      {/* Modern Essay Text Field - Clean and spacious */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Essay</label>
          {essayText.trim() && (
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              {essayText.trim().split(/\s+/).length} words
            </span>
          )}
        </div>

        <div className="relative">
          <textarea
            value={essayText}
            onChange={e => setEssayText(e.target.value)}
            placeholder={
              essayPlaceholder ||
              'Start writing your essay...\n\nFocus on:\n• Clear introduction\n• Well-developed body paragraphs\n• Strong conclusion'
            }
            className="w-full h-96 px-0 py-4 bg-transparent border-0 focus:outline-none resize-none text-base leading-relaxed placeholder-gray-400"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: '1.7',
            }}
          />

          {/* Subtle focus indicator */}
          <div className="absolute left-0 top-0 w-0.5 h-full bg-blue-500 scale-y-0 origin-top transition-transform duration-200 focus-within:scale-y-100 opacity-0 focus-within:opacity-100"></div>
        </div>
      </div>
    </div>
  )
}
