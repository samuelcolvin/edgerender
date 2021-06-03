import {HttpError} from './response'
import Sentry from './sentry'
import type {JsxChunk} from './render'
import {default_security_headers, MimeTypes, Assets} from './assets'

export interface RequestContext {
  request: Request
  url: URL
  match: RegExpMatchArray | boolean
  cleaned_path: string
  is_htmx: boolean
  router: Router
  assets?: Assets
}

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'

type ViewReturnType = Response | JsxChunk | Promise<Response | JsxChunk>
export interface View {
  match: RegExp | string
  allow?: Method | Method[]
  view: {
    (context: RequestContext): ViewReturnType
  }
}
export type Views = View[]

type Page = (children: JsxChunk, context: RequestContext) => JsxChunk | Promise<JsxChunk>

// TODO csp
export interface RouterConfig {
  views: View[]
  page?: Page
  debug?: boolean
  sentry_dsn?: string
  sentry_release?: string
  sentry_environment?: string
  assets?: Assets
  security_headers?: Record<string, string>
}

export class Router {
  readonly views: View[]
  readonly page?: Page
  readonly debug: boolean
  readonly sentry?: Sentry
  readonly assets?: Assets
  readonly security_headers: Record<string, string>

  constructor(config: RouterConfig) {
    this.views = config.views
    this.page = config.page
    this.debug = config.debug || false
    this.assets = config.assets
    this.security_headers = config.security_headers || default_security_headers
    if (config.sentry_dsn) {
      this.sentry = new Sentry(config.sentry_dsn, config.sentry_environment, config.sentry_release)
    }
    this.handler = this.handler.bind(this)
    this.handle = this.handle.bind(this)
  }

  handler(event: FetchEvent): void {
    event.respondWith(this.handle(event))
  }

  private async handle(event: FetchEvent): Promise<Response> {
    const {request} = event

    try {
      return await this.route(request)
    } catch (exc) {
      if (exc instanceof HttpError) {
        return this.on_http_error(exc)
      }
      console.error('error handling request:', request, exc)
      if (this.sentry) {
        this.sentry.captureException(event, exc)
      }
      const body = this.debug ? `\nError occurred on the edge:\n\n${exc.message}\n${exc.stack}\n` : 'Edge Server Error'
      return new Response(body, {status: 500, headers: this.http_headers(MimeTypes.plaintext)})
    }
  }

  private async route(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const {pathname} = url
    const cleaned_path = Router.clean_path(pathname)
    const is_htmx = request.headers.get('hx-request') == 'true'
    console.debug(`${request.method} ${cleaned_path} (cleaned)`)

    if (this.assets && this.assets.is_static_path(pathname)) {
      return await this.assets.response(request, pathname)
    }

    for (const view of this.views) {
      let match
      if (typeof view.match == 'string') {
        match = view.match == cleaned_path
      } else {
        match = cleaned_path.match(view.match)
      }
      if (!match) {
        continue
      }

      Router.check_method(request, view.allow || 'GET')

      const context: RequestContext = {
        request,
        url,
        match,
        cleaned_path,
        is_htmx,
        router: this,
        assets: this.assets,
      }
      let result: Response | JsxChunk = await Promise.resolve(view.view(context))
      if (result instanceof Response) {
        return result
      } else {
        if (this.page) {
          result = await Promise.resolve(this.page(result, context))
        }
        const html = await result.render()
        return new Response(html, {headers: this.http_headers(MimeTypes.html)})
      }
    }

    return await this.on_404({
      request,
      url,
      match: false,
      cleaned_path,
      is_htmx,
      router: this,
      assets: this.assets,
    })
  }

  protected http_headers(mime_type: MimeTypes): Record<string, string> {
    return {'Content-Type': mime_type, ...this.security_headers}
  }

  protected async on_404(context: RequestContext): Promise<Response> {
    throw new HttpError(404, `Page not found for "${context.url.pathname}"`)
  }

  protected async on_http_error(exc: HttpError): Promise<Response> {
    console.warn(exc.message)
    return exc.response(this.http_headers(MimeTypes.plaintext))
  }

  private static clean_path(pathname: string): string {
    if (!pathname.includes('.') && !pathname.endsWith('/')) {
      pathname += '/'
    }
    return pathname
  }

  private static check_method(request: Request, allow: Method | Method[]): void {
    const req_method = request.method as Method
    let allow_str: string
    if (typeof allow == 'string') {
      if (req_method == req_method) {
        return
      }
      allow_str = allow
    } else {
      if (allow.includes(req_method)) {
        return
      }
      allow_str = allow.join(',')
    }
    const msg = `Method Not Allowed (allowed: ${allow_str})`
    throw new HttpError(405, msg, {allow: allow_str})
  }
}
