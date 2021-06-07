import mime from 'mime/lite'
import {escape_regex} from './utils'
import {HttpError, MimeTypes, PreResponse} from './response'

export interface AssetConfig {
  content_manifest?: string
  kv_namespace?: KVNamespace
  path?: string
  cache_control?: string
  asset_class?: typeof Assets
}

export class Assets {
  protected readonly path: string
  protected readonly prefix: RegExp
  protected readonly manifest: Record<string, string>
  protected readonly kv_namespace?: KVNamespace
  protected readonly security_headers: Record<string, string>
  protected readonly extra_headers: Record<string, string>

  constructor(config: AssetConfig, security_headers: Record<string, string>) {
    this.path = config.path || '/assets/'
    if (!this.path.startsWith('/') || !this.path.endsWith('/')) {
      throw Error('static path must start and end with "/"')
    }

    this.prefix = new RegExp(`^${escape_regex(this.path)}`)
    this.manifest = JSON.parse(config.content_manifest || '{}')
    this.kv_namespace = config.kv_namespace
    this.security_headers = security_headers
    this.extra_headers = {
      'cache-control': config.cache_control || 'public, max-age=86400',
    }
  }

  is_static_path(pathname: string): boolean {
    return pathname.startsWith(this.path)
  }

  async response(request: Request, pathname: string): Promise<PreResponse> {
    // stripe leading slashes and "assets to match the format in static_manifest
    const asset_path = pathname.replace(this.prefix, '')

    const content_key: string | undefined = this.manifest[asset_path]
    if (content_key) {
      console.debug(`static file found path=${asset_path} content_key=${content_key}`)
    } else {
      throw new HttpError(404, `content not found for path "${asset_path}"`)
    }
    if (this.kv_namespace == undefined) {
      console.warn(`KV namespace not defined, static assets not available`)
      throw new HttpError(404, `content not found for path "${asset_path}"`)
    }

    const body = await this.kv_namespace.get(content_key, 'arrayBuffer')
    if (body === null) {
      // TODO log to sentry
      console.error(`content_key "${content_key}" found for asset_path "${asset_path}", but no value in the KV store`)
      throw new HttpError(404, `content not found for path "${asset_path}"`)
    } else {
      return {
        body,
        mime_type: this.mime_type(pathname),
        extra_headers: this.extra_headers,
      }
    }
  }

  async cached_proxy(request: Request, url: string, custom_mime_type: MimeTypes | null = null): Promise<PreResponse> {
    const cache_key = `cached-file:${url}`
    if (this.kv_namespace == undefined) {
      throw new Error(`KV namespace not defined, static assets not available`)
    }

    const cache_value = await this.kv_namespace.getWithMetadata(cache_key, 'stream')
    if (cache_value.value) {
      const metadata: {mime_type: MimeTypes | undefined} = cache_value.metadata || ({} as any)
      return {
        body: cache_value.value,
        mime_type: metadata.mime_type || MimeTypes.octetStream,
        extra_headers: this.extra_headers,
      }
    }
    console.log(`"${url}" not yet cached, downloading`)
    const r = await fetch(url, request)
    if (r.status != 200) {
      throw new HttpError(502, `Error getting "${url}", response: ${r.status}`)
    }
    const mime_type: MimeTypes =
      custom_mime_type || (r.headers.get('content-type') as MimeTypes) || MimeTypes.octetStream

    const blob = await r.blob()
    const body = await blob.arrayBuffer()
    await this.kv_namespace.put(cache_key, body, {expirationTtl: 3600 * 24 * 30, metadata: {mime_type}})
    return {body, mime_type, extra_headers: this.extra_headers}
  }

  protected mime_type(pathname: string): MimeTypes {
    const m = pathname.toLocaleLowerCase().match(/\.([a-z]+)$/)
    let mime_type: MimeTypes | undefined = undefined
    if (m) {
      const ext = m[0]
      mime_type = known_mime_types[ext]
      if (!mime_type) {
        mime_type = mime.getType(ext) as MimeTypes
      }
    }
    return mime_type || MimeTypes.octetStream
    // return {'Content-Type': mime_type, 'Cache-Control': this.cache_control, ...this.security_headers}
  }
}

const known_mime_types: Record<string, MimeTypes> = {
  '.ico': MimeTypes.ico,
}
