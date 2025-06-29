import { useState, useEffect } from 'react'

interface TextEditorProps {
  onTextChange?: (text: string) => void
  placeholder?: string
}

export default function TextEditor({ onTextChange, placeholder }: TextEditorProps) {
  const [text, setText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
    setCharCount(text.length)
    
    if (onTextChange) {
      onTextChange(text)
    }
  }, [text, onTextChange])

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter your essay text before submitting.')
      return
    }

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim()
        }),
      })

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text()
        alert(`HTTP Error ${response.status}: ${errorText.substring(0, 200)}`)
        return
      }
      
      // Check content type
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text()
        alert(`Invalid content type: ${contentType}\nResponse: ${responseText.substring(0, 200)}`)
        return
      }

      const result = await response.json()
      console.log('Text processing result:', result)
      
      // TODO: Handle the response (show results, etc.)
      alert('Essay submitted successfully! Processing results will be shown here.')
      
    } catch (error) {
      console.error('Error submitting essay:', error)
      alert('Error submitting essay. Please try again.')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Write Your Essay</h2>
      
      <div className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder || "Start typing your essay here..."}
          className="w-full h-96 p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
          style={{ fontFamily: 'Space Mono, monospace' }}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-6 text-sm text-gray-600">
          <span>
            <strong>Words:</strong> {wordCount}
          </span>
          <span>
            <strong>Characters:</strong> {charCount}
          </span>
          <span className={`${wordCount > 600 ? 'text-red-600' : wordCount > 400 ? 'text-orange-600' : 'text-green-600'}`}>
            <strong>Length:</strong> {
              wordCount < 200 ? 'Too short' :
              wordCount <= 400 ? 'Good' :
              wordCount <= 600 ? 'Long' :
              'Very long'
            }
          </span>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className={`
            px-6 py-2 rounded-md font-medium transition-colors
            ${text.trim() 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Submit Essay
        </button>
      </div>

      <div className="text-xs text-gray-500">
        <p><strong>Tip:</strong> ISEE essays typically range from 200-400 words. Focus on clear structure with introduction, body, and conclusion.</p>
      </div>
    </div>
  )
}