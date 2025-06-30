// Vercel serverless function using shared CommonJS Express app
// Now uses the same codebase as local development - no duplication!

import { VercelRequest, VercelResponse } from '@vercel/node'
import { createApp } from '../server/lib/app-factory'

export const runtime = 'nodejs'

// Cache the app instance
let cachedApp: any = null

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize app on first request
    if (!cachedApp) {
      cachedApp = createApp({ isServerless: true })
    }
    
    // Use the Express app to handle the request
    return cachedApp(req, res)
  } catch (error) {
    console.error('Vercel function error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}