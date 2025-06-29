import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleUploadMultiple } from './lib/handlers'
import { adaptVercelRequest, ResponseAdapter } from './lib/types'

export const runtime = 'nodejs';

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const platformReq = adaptVercelRequest(req)
  const platformRes = new ResponseAdapter(res, 'vercel')
  
  await handleUploadMultiple(platformReq, platformRes, req) // Pass raw req for formidable
}