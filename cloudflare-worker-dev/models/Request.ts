// stubs https://developer.mozilla.org/en-US/docs/Web/API/Request
import Headers from './Headers'
import Body, {throwBodyUsed} from './Body'
import {Blob} from './blob'
import {RequestCf, example_cf} from './RequestCf'

const DEFAULT_HEADERS = {
  accept: '*/*',
}

const MethodStrings = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const
export type Method = typeof MethodStrings[number]

type ModeType = 'cors' | 'no-cors' | 'same-origin' | 'navigate'
type CredentialsType = 'omit' | 'sane-origin' | 'include'
type CacheType = 'default' | 'reload' | 'no-cache'

interface RequestInit {
  method?: Method
  headers?: Record<string, string> | Headers
  body?: string | Blob
  mode?: ModeType
  credentials?: CredentialsType
  cache?: CacheType
  redirect?: 'follow' | 'error' | 'manual'
  referrer?: string
  integrity?: string | null
}

export default class Request extends Body {
  readonly url: string
  readonly method: Method
  readonly mode: ModeType
  readonly credentials: CredentialsType
  readonly cache: CacheType
  readonly redirect: 'follow' | 'error' | 'manual'
  readonly referrer: string
  readonly integrity: string | null
  readonly headers: Headers
  readonly cf?: RequestCf

  constructor(urlOrRequest: string | Request, init: RequestInit = {}) {
    const method: Method = init.method || 'GET'
    if (init.body && (method == 'GET' || method == 'HEAD')) {
      throw new TypeError("Failed to construct 'Request': Request with GET/HEAD method cannot have body.")
    }
    super(init.body)

    if (urlOrRequest instanceof Request) {
      this.url = urlOrRequest.url
      init = {
        body: urlOrRequest._body_content,
        credentials: urlOrRequest.credentials,
        headers: urlOrRequest.headers,
        method: urlOrRequest.method,
        mode: urlOrRequest.mode,
        referrer: urlOrRequest.referrer,
        ...init,
      }
    } else {
      this.url = urlOrRequest || '/'
    }
    this.method = method
    this.mode = init.mode || 'same-origin'
    this.cache = init.cache || 'default'
    this.referrer = init.referrer && init.referrer !== 'no-referrer' ? init.referrer : ''
    // See https://fetch.spec.whatwg.org/#concept-request-credentials-mode
    this.credentials = init.credentials || (this.mode === 'navigate' ? 'include' : 'omit')
    this.redirect = init.redirect || 'follow'
    this.integrity = init.integrity || null
    this.cf = example_cf()

    // Transform init.headers to Headers object
    if (init.headers) {
      if (init.headers instanceof Headers) {
        this.headers = init.headers
      } else {
        this.headers = new Headers(init.headers)
      }
    } else {
      this.headers = new Headers(DEFAULT_HEADERS)
    }
  }

  clone(): Request {
    if (this.bodyUsed) {
      throwBodyUsed('clone')
    }

    return new Request(this.url, {
      method: this.method,
      headers: this.headers,
      body: this._body_content,
      mode: this.mode,
      credentials: this.credentials,
      cache: this.cache,
      redirect: this.redirect,
      referrer: this.referrer,
      integrity: this.integrity,
    })
  }
}
