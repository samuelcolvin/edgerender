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
  debug?: boolean
  protected readonly prefix: RegExp
  protected readonly manifest: Record<string, string>
  protected readonly kv_namespace?: KVNamespace
  protected readonly security_headers: Record<string, string>
  protected readonly headers: Record<string, string>

  constructor(config: AssetConfig, security_headers: Record<string, string>, debug: boolean) {
    this.path = config.path || '/assets/'
    if (!this.path.startsWith('/') || !this.path.endsWith('/')) {
      throw Error('static path must start and end with "/"')
    }

    this.prefix = new RegExp(`^${escape_regex(this.path)}`)
    this.manifest = JSON.parse(config.content_manifest || '{}')
    this.kv_namespace = config.kv_namespace
    this.security_headers = security_headers
    this.headers = {
      'cache-control': config.cache_control || 'public, max-age=86400',
    }
    this.debug = debug
  }

  is_static_path(pathname: string): boolean {
    return pathname.startsWith(this.path)
  }

  async response(request: Request, pathname: string): Promise<PreResponse> {
    // stripe leading slashes and "assets to match the format in static_manifest
    const asset_path = pathname.replace(this.prefix, '')

    const content_key: string | undefined = this.manifest[asset_path]
    if (content_key) {
      if (this.debug) {
        console.debug(`static file found path=${pathname} content_key=${content_key}`)
      }
    } else {
      throw this.not_found_error(pathname)
    }

    if (this.kv_namespace == undefined) {
      console.warn('KV namespace not defined, static assets not available')
      throw this.not_found_error(pathname)
    }

    const body = await this.kv_namespace.get(content_key, 'arrayBuffer')
    if (body === null) {
      // TODO log to sentry
      console.error(`content_key "${content_key}" found for asset_path "${pathname}", but no value in the KV store`)
      throw this.not_found_error(pathname)
    } else {
      return {
        body,
        mime_type: this.mime_type(pathname),
        headers: this.headers,
      }
    }
  }

  not_found_error(pathname: string): Error {
    return new HttpError(404, `static asset "${pathname}" not found`)
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
        mime_type: custom_mime_type || metadata.mime_type || MimeTypes.octetStream,
        headers: this.headers,
      }
    }
    if (this.debug) {
      console.debug(`"${url}" not yet cached, downloading`)
    }
    // , {method: request.method, headers: Object.fromEntries(request.headers.entries())}
    const r = await fetch(url, request)
    if (r.status != 200) {
      throw new HttpError(502, `Error getting "${url}", upstream response: ${r.status}`)
    }
    const mime_type: MimeTypes =
      custom_mime_type || (r.headers.get('content-type') as MimeTypes) || MimeTypes.octetStream

    const blob = await r.blob()

    // const body = await blob.text()  // required for dev-server
    const body = await blob.arrayBuffer()
    await this.kv_namespace.put(cache_key, body, {expirationTtl: 3600 * 24 * 30, metadata: {mime_type}})
    return {body, mime_type, headers: this.headers}
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
  }
}

const known_mime_types: Record<string, MimeTypes> = {
  '.ico': MimeTypes.ico,
}
