// Simple handlers for basic endpoints
// Only contains handlers that are still needed

import type { PlatformRequest, PlatformResponse } from './types'

export async function handleHello(
  req: PlatformRequest,
  res: PlatformResponse
): Promise<void> {
  const name = (req.query.name as string) || 'World'

  const response = {
    message: `Hello ${name}! Essay Tutor API is running.`,
    timestamp: new Date().toISOString(),
    method: req.method,
    platform: process.env.VERCEL ? 'Vercel' : 'Self-hosted',
    version: '2.0.0' // Updated to reflect unified architecture
  }

  return res.status(200).json(response)
}
