import type { VercelRequest, VercelResponse } from '@vercel/node'

export const runtime = 'nodejs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { handleUnifiedProcessing } = await import('../server/lib/unified-handlers.js')
    const { adaptVercelRequest, ResponseAdapter } = await import('../server/lib/types.js')
    
    const platformReq = adaptVercelRequest(req)
    const platformRes = new ResponseAdapter(res, 'vercel')
    
    await handleUnifiedProcessing(platformReq, platformRes, req)
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}