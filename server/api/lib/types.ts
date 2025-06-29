// Platform-agnostic request/response interfaces
// These work with both Vercel functions and Express.js

export interface PlatformRequest {
  method?: string
  body: any
  query: { [key: string]: string | string[] | undefined }
  headers: { [key: string]: string | string[] | undefined }
  // For file uploads
  files?: { [key: string]: any }
}

export interface PlatformResponse {
  status(code: number): PlatformResponse
  json(data: any): void | Promise<void>
  send(data: string): void | Promise<void>
  setHeader(name: string, value: string): void
}

// Adapter functions to convert between platforms
export function adaptVercelRequest(req: any): PlatformRequest {
  return {
    method: req.method,
    body: req.body,
    query: req.query || {},
    headers: req.headers || {},
  }
}

export function adaptExpressRequest(req: any): PlatformRequest {
  return {
    method: req.method,
    body: req.body,
    query: req.query || {},
    headers: req.headers || {},
    files: req.files,
  }
}

// Response adapter wrapper
export class ResponseAdapter {
  constructor(private res: any, private platform: 'vercel' | 'express') {}

  status(code: number): ResponseAdapter {
    this.res.status(code)
    return this
  }

  json(data: any): void {
    this.res.json(data)
  }

  send(data: string): void {
    this.res.send(data)
  }

  setHeader(name: string, value: string): void {
    this.res.setHeader(name, value)
  }
}