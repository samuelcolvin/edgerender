export enum MimeTypes {
  html = 'text/html',
  plaintext = 'text/html',
  ico = 'image/vnd.microsoft.icon',
  octetStream = 'application/octet-stream',
  json = 'application/json',
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
  mime_type: MimeTypes
  extra_headers?: Record<string, string>
}

export function json_response(obj: Record<string, any>): PreResponse {
  return {
    body: JSON.stringify(obj, null, 2),
    mime_type: MimeTypes.json,
  }
}

export class HttpError extends Error {
  status: number
  body: string
  headers: Record<string, string>

  constructor(status: number, body: string, headers: Record<string, string> | undefined = undefined) {
    super(`HTTP Error ${status}: ${body}, headers=${JSON.stringify(headers || {})}`)
    this.status = status
    this.body = body
    this.headers = headers || {}
  }

  response(): PreResponse {
    return {
      body: `${this.status}: ${this.body}`,
      mime_type: MimeTypes.plaintext,
      status: this.status,
      extra_headers: this.headers,
    }
  }
}

export interface FileMetadata {
  content_type?: string
  hash?: string
  size?: number
}

export interface KVFile {
  value: ReadableStream | null
  metadata: FileMetadata | null
}

export function response_from_kv(cache_value: KVFile, expires: number | null = null, status = 200): Response {
  const metadata: FileMetadata = cache_value.metadata || {}
  return new Response(cache_value.value, {status, headers: build_headers(metadata.content_type, expires)})
}

function build_headers(content_type: string | undefined, expires_in: number | null): Record<string, string> {
  const headers: Record<string, string> = {}
  headers['content-type'] = content_type || 'application/octet-stream'
  if (expires_in != null) {
    headers['expires'] = new Date(Date.now() + expires_in * 1000).toUTCString()
  }
  return headers
}
