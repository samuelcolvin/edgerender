// stubs https://developer.mozilla.org/en-US/docs/Web/API/Response
import Blob from './Blob'
import Body from './Body'
import Headers, {as_headers} from './Headers'
import ReadableStream from './ReadableStream'

const validBodyType = (b: any): boolean =>
  b === null || b instanceof Blob || b instanceof ReadableStream || typeof b === 'string'

type BodyType = string | Blob | ReadableStream | null

const RedirectStatuses: Set<number> = new Set([301, 302, 303, 307, 308])

interface BodyInit {
  status?: number
  statusText?: string
  headers?: Record<string, string> | Headers
  _url?: string
}

export default class Response extends Body {
  readonly status: number
  readonly ok: boolean
  readonly statusText: string
  readonly headers: Headers
  readonly redirected = false
  readonly type: 'basic' | 'cors' = 'basic'
  readonly url: string

  constructor(body: BodyType = null, init: BodyInit = {}) {
    if (!validBodyType(body)) {
      throw new TypeError('Response body must be one of: Blob, ReadableStream, string, null')
    }
    super(body)
    this.status = init.status || 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = init.statusText || 'OK'
    this.headers = as_headers(init.headers)

    this.url = init._url || 'http://example.com'
  }

  clone() {
    return new Response(this._body_content, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      _url: this.url,
    })
  }

  static redirect(url: string, status = 302): Response {
    // see https://fetch.spec.whatwg.org/#dom-response-redirect
    if (!RedirectStatuses.has(status)) {
      throw new RangeError('Invalid status code')
    }
    return new Response(null, {
      status: status,
      headers: {
        location: new URL(url).href,
      },
    })
  }

  static error() {
    return new Response(null, {status: 0})
  }
}
