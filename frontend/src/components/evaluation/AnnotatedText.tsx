import { useState } from 'react'
import type { TextSegment, AnnotationMarker, CategoryLegend } from '../../types/evaluation'

interface AnnotatedTextProps {
  segments: TextSegment[]
  annotations: AnnotationMarker[]
  legend: CategoryLegend[]
  title?: string
}

const AnnotatedText = ({ segments, annotations, legend, title }: AnnotatedTextProps) => {
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)

  // Create a lookup map for annotations by ID
  const annotationMap = annotations.reduce((map, annotation) => {
    map[annotation.id] = annotation
    return map
  }, {} as Record<string, AnnotationMarker>)

  const handleAnnotationClick = (annotationId: string) => {
    setSelectedAnnotation(selectedAnnotation === annotationId ? null : annotationId)
  }

  const getAnnotationStyle = (annotation: AnnotationMarker, isSelected: boolean) => {
    const baseStyle = {
      backgroundColor: `${annotation.color}30`, // 30% opacity
      borderBottom: `2px solid ${annotation.color}`,
      cursor: 'pointer',
      position: 'relative' as const
    }

    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: `${annotation.color}50`, // 50% opacity when selected
        boxShadow: `0 0 0 2px ${annotation.color}`
      }
    }

    return baseStyle
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      )}
      
      {/* Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Annotation Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {legend.map((category) => (
            <div key={category.id} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="text-gray-600">{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Annotated Essay Text */}
      <div className="prose max-w-none">
        <div className="font-mono text-sm leading-relaxed bg-gray-50 p-6 rounded-lg border">
          {segments.map((segment, index) => {
            if (!segment.isAnnotated) {
              return <span key={index}>{segment.text}</span>
            }

            // Handle annotated segments
            return segment.annotations.map((annotationId) => {
              const annotation = annotationMap[annotationId]
              if (!annotation) return <span key={`${index}-${annotationId}`}>{segment.text}</span>

              const isSelected = selectedAnnotation === annotationId

              return (
                <span
                  key={`${index}-${annotationId}`}
                  style={getAnnotationStyle(annotation, isSelected)}
                  onClick={() => handleAnnotationClick(annotationId)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${annotation.color}40`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected 
                      ? `${annotation.color}50` 
                      : `${annotation.color}30`
                  }}
                  className="inline-block transition-all duration-200"
                  title={`${annotation.category}: ${annotation.explanation}`}
                >
                  {segment.text}
                  <span 
                    className="inline-block ml-1 px-1 py-0.5 text-xs font-bold text-white rounded"
                    style={{ backgroundColor: annotation.color }}
                  >
                    {annotation.markerId}
                  </span>
                </span>
              )
            })
          })}
        </div>
      </div>

      {/* Selected Annotation Details */}
      {selectedAnnotation && annotationMap[selectedAnnotation] && (
        <div className="mt-6 p-4 border-l-4 bg-blue-50 rounded-r-lg" 
             style={{ borderLeftColor: annotationMap[selectedAnnotation].color }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">
                <span 
                  className="inline-block w-6 h-6 text-xs text-white rounded text-center leading-6 mr-2"
                  style={{ backgroundColor: annotationMap[selectedAnnotation].color }}
                >
                  {annotationMap[selectedAnnotation].markerId}
                </span>
                {annotationMap[selectedAnnotation].category.charAt(0).toUpperCase() + 
                 annotationMap[selectedAnnotation].category.slice(1)} - {annotationMap[selectedAnnotation].severity}
              </h4>
              <p className="text-gray-700 mb-2">
                <strong>Original:</strong> "{annotationMap[selectedAnnotation].originalText}"
              </p>
              {annotationMap[selectedAnnotation].suggestedText && (
                <p className="text-gray-700 mb-2">
                  <strong>Suggested:</strong> "{annotationMap[selectedAnnotation].suggestedText}"
                </p>
              )}
              <p className="text-gray-600">
                <strong>Explanation:</strong> {annotationMap[selectedAnnotation].explanation}
              </p>
            </div>
            <button
              onClick={() => setSelectedAnnotation(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Annotation Summary */}
      <div className="mt-6 text-sm text-gray-600">
        <p>
          <strong>{annotations.length}</strong> annotations found. 
          Click on highlighted text to see detailed feedback.
        </p>
      </div>
    </div>
  )
}

export default AnnotatedText