import type { VercelRequest, VercelResponse } from '@vercel/node'

export const runtime = 'nodejs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { handleHello } = await import('../server/lib/simple-handlers.js')
    const { adaptVercelRequest, ResponseAdapter } = await import('../server/lib/types.js')
    
    const platformReq = adaptVercelRequest(req)
    const platformRes = new ResponseAdapter(res, 'vercel')
    
    await handleHello(platformReq, platformRes)
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}