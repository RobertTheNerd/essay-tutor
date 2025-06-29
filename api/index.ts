// Vercel serverless function wrapper for Express app
// Uses shared app factory to eliminate code duplication

import { VercelRequest, VercelResponse } from '@vercel/node'

export const runtime = 'nodejs'

// Dynamic import of shared app factory to avoid ES module issues
async function getApp() {
  const { createApp } = await import('../server/lib/app-factory.js')
  return createApp({ isServerless: true })
}

// Cache the app instance
let cachedApp: any = null

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize app on first request
    if (!cachedApp) {
      cachedApp = await getApp()
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