import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleHello } from './lib/handlers'
import { adaptVercelRequest, ResponseAdapter } from './lib/types'

export const runtime = 'nodejs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const platformReq = adaptVercelRequest(req)
  const platformRes = new ResponseAdapter(res, 'vercel')
  
  await handleHello(platformReq, platformRes)
}