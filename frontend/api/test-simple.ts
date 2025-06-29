import type { VercelRequest, VercelResponse } from '@vercel/node';

export const runtime = 'nodejs';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    success: true,
    message: 'Simple test endpoint working',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}