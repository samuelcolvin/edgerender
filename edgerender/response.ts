
export enum MimeTypes {
  html = 'text/html',
  plaintext = 'text/html',
  ico = 'image/vnd.microsoft.icon',
  octetStream = 'application/octet-stream',
}

export function simple_response(
  body: string | ReadableStream | ArrayBuffer,
  content_type = 'text/html',
  expires_in: number | null = null,
): Response {
  return new Response(body, {headers: build_headers(content_type, expires_in)})
}

export function json_response(obj: Record<string, any>): Response {
  return new Response(JSON.stringify(obj, null, 2), {headers: {'content-type': 'application/json'}})
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

  response = (default_headers: Record<string, string>): Response => {
    const headers = {...default_headers, ...this.headers}
    return new Response(`${this.status}: ${this.body}`, {status: this.status, headers})
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
