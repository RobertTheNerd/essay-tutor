import type { EvaluationResponse } from '../types/evaluation'

export interface EvaluationRequest {
  text: string
  prompt?: string
  rubric?: {
    family: string
    level: string
  }
  studentInfo?: {
    name?: string
    grade?: string
    date?: string
  }
}

class EvaluationService {
  private baseUrl: string

  constructor() {
    // Use empty string to rely on Vite proxy in development
    this.baseUrl = ''
  }

  async evaluateEssay(request: EvaluationRequest): Promise<EvaluationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text()
        throw new Error(`Invalid content type: ${contentType}. Response: ${responseText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Evaluation request failed:', error)
      throw error instanceof Error ? error : new Error('Unknown evaluation error')
    }
  }

  async checkAPIHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/hello`)
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  }
}

export const evaluationService = new EvaluationService()