
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

export async function cached_proxy(kv_namespace: KVNamespace, url: string, content_type: string): Promise<Response> {
  const cache_key = `file:${url}`

  const cache_value = await kv_namespace.getWithMetadata(cache_key, 'stream')
  if (cache_value.value) {
    return response_from_kv(cache_value as KVFile, 3600)
  }
  console.log(`"${url}" not yet cached, downloading`)
  const r = await fetch(url)
  if (r.status != 200) {
    throw new HttpError(502, `Error getting "${url}", response: ${r.status}`)
  }
  const blob = await r.blob()
  const body = await blob.arrayBuffer()
  await kv_namespace.put(cache_key, body, {expirationTtl: 3600 * 24 * 30, metadata: {content_type}})
  return simple_response(body, content_type, 3600)
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

  response = (): Response => {
    return new Response(`${this.status}: ${this.body}`, {status: this.status, headers: this.headers})
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
