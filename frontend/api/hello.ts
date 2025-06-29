import type { VercelRequest, VercelResponse } from '@vercel/node';

export const runtime = 'nodejs';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { name = 'World' } = req.query;
  
  res.status(200).json({
    message: `Hello ${name}! Essay Tutor API is running.`,
    timestamp: new Date().toISOString(),
    method: req.method
  });
}