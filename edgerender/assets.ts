import mime from 'mime/lite'
import {HttpError} from './response'

export const default_security_headers: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin',
}

export enum MimeTypes {
  html = 'text/html',
  plaintext = 'text/html',
  ico = 'image/vnd.microsoft.icon',
  octetStream = 'application/octet-stream',
}

export interface AssetConfig {
  path: string
  content_manifest: string
  kv_namespace: KVNamespace
  security_headers?: Record<string, string>
  cache_control?: string
}

export class Assets {
  protected readonly path: string
  protected readonly prefix: RegExp
  protected readonly manifest: Record<string, string>
  protected readonly kv_namespace: KVNamespace
  protected readonly security_headers: Record<string, string>
  protected readonly cache_control: string

  constructor(config: AssetConfig) {
    this.path = config.path
    if (!this.path.startsWith('/') || !this.path.endsWith('/')) {
      throw Error('static path must start and end with "/"')
    }

    this.prefix = new RegExp(`^${escape_regex(config.path)}`)
    this.manifest = JSON.parse(config.content_manifest)
    this.kv_namespace = config.kv_namespace
    this.security_headers = config.security_headers || default_security_headers
    this.cache_control = config.cache_control || 'public, max-age=86400'
  }

  is_static_path(pathname: string): boolean {
    return pathname.startsWith(this.path)
  }

  async response(request: Request, pathname: string): Promise<Response> {
    // stripe leading slashes and "assets to match the format in static_manifest
    const asset_path = pathname.replace(this.prefix, '')

    const content_key: string | undefined = this.manifest[asset_path]
    if (content_key) {
      console.debug(`static file found path=${asset_path} content_key=${content_key}`)
    } else {
      throw new HttpError(404, `content not found for path "${asset_path}"`)
    }

    const content = await this.kv_namespace.get(content_key, 'arrayBuffer')
    if (content === null) {
      // TODO log to sentry
      console.error(`content_key "${content_key}" found for asset_path "${asset_path}", but no value in the KV store`)
      throw new HttpError(404, `content not found for path "${asset_path}"`)
    } else {
      return new Response(content, {headers: this.http_headers(pathname)})
    }
  }

  protected http_headers(pathname: string): Record<string, string> {
    const m = pathname.toLocaleLowerCase().match(/\.([a-z]+)$/)
    let mime_type: MimeTypes | undefined = undefined
    if (m) {
      const ext = m[0]
      mime_type = known_mime_types[ext]
      if (!mime_type) {
        mime_type = mime.getType(ext) as MimeTypes
      }
    }
    mime_type = mime_type || MimeTypes.octetStream

    return {'Content-Type': mime_type, 'Cache-Control': this.cache_control, ...this.security_headers}
  }
}

const known_mime_types: Record<string, MimeTypes> = {
  '.ico': MimeTypes.ico,
}

/*
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 * $& means the whole matched string
 */
const escape_regex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
