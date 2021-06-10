import {HttpError, MimeTypes, default_security_headers, PreResponse} from './response'
import Sentry from './sentry'
import {JsxChunk} from './jsx'
import {Assets, AssetConfig} from './assets'
import {PathView, Method, as_path_view, clean_path} from './request'

export interface RequestContext {
  request: Request
  method: Method
  url: URL
  match: Record<string, string>
  is_htmx: boolean
  edge_render: EdgeRender
  assets: Assets
}

type ResponseTypes = PreResponse | Response | JsxChunk
type ViewReturnType = ResponseTypes | Promise<ResponseTypes>
export type ViewFunction = (context: RequestContext) => ViewReturnType
export interface View {
  allow?: Method | Method[]
  view: ViewFunction
}
export type Views = Record<string, View | ViewFunction>

type Page = (children: JsxChunk, context: RequestContext) => JsxChunk | Promise<JsxChunk>

// TODO csp
export interface EdgeRenderConfig {
  views: Views
  page?: Page
  debug?: boolean
  sentry_dsn?: string
  sentry_release?: string
  sentry_environment?: string
  assets?: AssetConfig
  security_headers?: Record<string, string>
}

export const edge_render = (edge_render_config: EdgeRenderConfig): EdgeRender => new EdgeRender(edge_render_config)

export class EdgeRender {
  readonly views: PathView[]
  readonly page?: Page
  readonly debug: boolean
  readonly sentry?: Sentry
  readonly assets: Assets
  readonly security_headers: Record<string, string>

  constructor(config: EdgeRenderConfig) {
    this.views = Object.entries(config.views).map(as_path_view)
    this.page = config.page
    this.debug = config.debug || false
    if (this.debug) {
      console.debug('views:', this.views)
    }
    this.security_headers = config.security_headers || default_security_headers
    const assets_config: AssetConfig = config.assets || {}
    const AssetsClass = assets_config.asset_class || Assets
    this.assets = new AssetsClass(assets_config, this.security_headers, this.debug)
    if (config.sentry_dsn) {
      this.sentry = new Sentry(config.sentry_dsn, config.sentry_environment, config.sentry_release)
    }
    this.handler = this.handler.bind(this)
  }

  handler(event: FetchEvent): void {
    event.respondWith(this.handle(event))
  }

  async handle(event: FetchEvent): Promise<Response> {
    const {request} = event

    try {
      const r = await this.route(request)
      if (r instanceof Response) {
        return r
      } else {
        return this.prepare_response(r)
      }
    } catch (exc) {
      if (exc instanceof HttpError) {
        return this.on_http_error(exc)
      }
      console.error('error handling request:', request, exc)
      if (this.sentry) {
        this.sentry.captureException(event, exc)
      }
      const body = this.debug ? `\nError occurred on the edge:\n\n${exc.message}\n${exc.stack}\n` : 'Edge Server Error'
      return this.prepare_response({
        body,
        status: 500,
        mime_type: MimeTypes.plaintext,
      })
    }
  }

  protected async route(request: Request): Promise<PreResponse | Response> {
    const url = new URL(request.url)
    const {pathname} = url
    const cleaned_path = clean_path(pathname)
    const is_htmx = request.headers.get('hx-request') == 'true'
    if (this.debug) {
      console.debug(`${request.method} ${cleaned_path} (cleaned)`)
    }

    if (this.assets && this.assets.is_static_path(pathname)) {
      return await this.assets.response(request, pathname)
    }
    const method = request.method as Method

    for (const view of this.views) {
      let match: Record<string, string> = {}
      if (typeof view.path == 'string') {
        if (view.path != cleaned_path) {
          continue
        }
      } else {
        const m = cleaned_path.match(view.path)
        if (!m) {
          continue
        }
        match = m.groups as Record<string, string>
      }

      if (!view.allow.has(method)) {
        const allow = [...view.allow].join(',')
        const msg = `"${method}" Method Not Allowed (allowed: ${allow})`
        throw new HttpError(405, msg, {allow})
      }

      const context: RequestContext = {
        request,
        method,
        url,
        match,
        is_htmx,
        edge_render: this,
        assets: this.assets,
      }
      let result: ResponseTypes = await Promise.resolve(view.view(context))
      if ('children' in result) {
        if (this.page) {
          result = await Promise.resolve(this.page(result, context))
        }
        return {
          body: await result.render(),
          mime_type: MimeTypes.html,
        }
      } else {
        return result
      }
    }

    return await this.on_404({
      request,
      method,
      url,
      match: {},
      is_htmx,
      edge_render: this,
      assets: this.assets,
    })
  }

  protected async on_404(context: RequestContext): Promise<Response> {
    throw new HttpError(404, `Page not found for "${context.url.pathname}"`)
  }

  protected async on_http_error(exc: HttpError): Promise<Response> {
    console.warn(exc.message)
    return this.prepare_response(exc.response())
  }

  protected prepare_response(r: PreResponse): Response {
    const status = r.status || 200
    const headers = {'Content-Type': r.mime_type, ...this.security_headers, ...(r.headers || {})}
    return new Response(r.body, {status, headers})
  }
}
