import {HttpError, MimeTypes} from './response'
import Sentry from './sentry'
import type {JsxChunk} from './render'
import {default_security_headers, Assets} from './assets'
import {escape_regex} from './utils'

export interface RequestContext {
  request: Request
  method: Method
  url: URL
  match: Record<string, string>
  is_htmx: boolean
  router: Router
  assets?: Assets
}

export enum Method {
  get = 'GET',
  post = 'POST',
  put = 'PUT',
  patch = 'PATCH',
  delete = 'DELETE',
  options = 'OPTIONS',
}

type ViewReturnType = Response | JsxChunk | Promise<Response | JsxChunk>
export type ViewFunction = (context: RequestContext) => ViewReturnType
export interface View {
  allow?: Method | Method[]
  view: ViewFunction
}
export type Views = Record<string, View | ViewFunction>

type Page = (children: JsxChunk, context: RequestContext) => JsxChunk | Promise<JsxChunk>

// TODO csp
export interface RouterConfig {
  views: Views
  page?: Page
  debug?: boolean
  sentry_dsn?: string
  sentry_release?: string
  sentry_environment?: string
  assets?: Assets
  security_headers?: Record<string, string>
}

interface PathView {
  path: RegExp | string
  allow: Set<Method>
  view: ViewFunction
}

export class Router {
  readonly views: PathView[]
  readonly page?: Page
  readonly debug: boolean
  readonly sentry?: Sentry
  readonly assets?: Assets
  readonly security_headers: Record<string, string>

  constructor(config: RouterConfig) {
    this.views = Object.entries(config.views).map(as_path_view)
    console.debug('views:', this.views)
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
    const cleaned_path = clean_path(pathname)
    const is_htmx = request.headers.get('hx-request') == 'true'
    console.debug(`${request.method} ${cleaned_path} (cleaned)`)

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
        const msg = `${method}: Method Not Allowed (allowed: ${allow})`
        throw new HttpError(405, msg, {allow})
      }

      const context: RequestContext = {
        request,
        method,
        url,
        match,
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
      method,
      url,
      match: {},
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
}

const clean_path = (pathname: string): string => pathname.replace(/\/+$/, '') || '/'

function as_path_view([key, view]: [string, View | ViewFunction]): PathView {
  const path = parse_path(key)
  if (typeof view == 'function') {
    return {path, view, allow: new Set([Method.get])}
  } else {
    let allow: Set<Method>
    if (typeof view.allow == 'string') {
      allow = new Set([view.allow])
    } else {
      allow = new Set(view.allow)
    }
    return {path, view: view.view, allow}
  }
}

const group_regex = /{(\w+)(?::(.+?))?}([^{]*)/g

// function parse_path(path: string): string | RegExp {
function parse_path(path: string): string | RegExp {
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  if (!path.includes('{')) {
    if (path.includes('}')) {
      throw new Error(`invalid path "${path}", "}" with no matching start "{"`)
    } else {
      return clean_path(path)
    }
  }

  let regex_str = ''
  let first = true
  let last_ended = 0
  for (const m of path.matchAll(group_regex)) {
    if (first) {
      regex_str += escape_regex(path.substr(0, m.index))
      first = false
    }
    regex_str += `(?<${m[1]}>${get_regex(m[2])})${escape_regex(m[3])}`
    last_ended = (m.index || 0) + m[0].length
  }
  if (last_ended != path.length) {
    throw new Error(`invalid path, match expression "${path}" can't be interpreted`)
  }
  regex_str = `^${clean_path(regex_str)}$`
  return new RegExp(regex_str)
}

const word_regex = '[\\w\\-]+'

function get_regex(group: string | undefined): string {
  if (!group || group == 'word') {
    return word_regex
  } else if (group == 'int') {
    return '\\d+'
  } else {
    return group
  }
}
