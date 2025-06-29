import type { VercelRequest, VercelResponse } from '@vercel/node'

export const runtime = 'nodejs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const name = (req.query.name as string) || 'World'
  
  const response = {
    message: `Hello ${name}! Essay Tutor API is running.`,
    timestamp: new Date().toISOString(),
    method: req.method,
    platform: 'Vercel',
    version: '2.0.0'
  }

  return res.status(200).json(response)
}