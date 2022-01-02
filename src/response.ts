export enum MimeTypes {
  html = 'text/html',
  plaintext = 'text/plain',
  json = 'application/json',
  ico = 'image/vnd.microsoft.icon',
  octetStream = 'application/octet-stream',
}

export const default_security_headers: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin',
}

export interface PreResponse {
  status?: number
  body: string | ReadableStream | ArrayBuffer
  mime_type: MimeTypes | string
  headers?: Record<string, string>
}

export function json_response(obj: Record<string, any>, status = 200): PreResponse {
  return {
    status,
    body: JSON.stringify(obj, null, 2),
    mime_type: MimeTypes.json,
  }
}

export class HttpError extends Error {
  status: number
  body: string
  headers: Record<string, string>

  constructor(status: number, body: string, headers: Record<string, string> | undefined = undefined) {
    if (headers) {
      super(`HTTP Error ${status}: ${body}, headers=${JSON.stringify(headers)}`)
    } else {
      super(`HTTP Error ${status}: ${body}`)
    }
    this.status = status
    this.body = body
    this.headers = headers || {}
  }

  response(request: Request): PreResponse {
    if (this.status > 300 && this.status < 400) {
      const {location} = this.headers
      if (location && !/^https?:\/\//.test(location)) {
        const {origin, pathname} = new URL(request.url)
        let path: string
        if (location.startsWith('/')) {
          path = location
        } else if (location.startsWith('.')) {
          // special case where double slashes are common
          if (pathname.endsWith('/') && location.startsWith('./')) {
            path = `${pathname}${location.slice(2)}`
          } else {
            path = `${pathname}${location.slice(1)}`
          }
        } else {
          path = `${pathname}${location}`
        }
        this.headers.location = `${origin}${path}`
      }
    }
    return {
      body: `${this.status}: ${this.body}`,
      mime_type: MimeTypes.plaintext,
      status: this.status,
      headers: this.headers,
    }
  }
}

export class Redirect extends HttpError {
  constructor(location: string, status: 301 | 302 | 303 | 307 | 308 = 307, body: string | null = null) {
    super(status, body || `Redirecting to "${location}"`, {location})
  }
}
