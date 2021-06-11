// stubs https://developer.mozilla.org/en-US/docs/Web/API/Request
import {Headers} from './Headers'
// const URL = require('url').URL || require('dom-urls');


const DEFAULT_HEADERS = {
  accept: '*/*'
};

const throwBodyUsed = () => {
  throw new TypeError('Failed to execute \'clone\': body is already used');
};


const MethodStrings = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const
export type Method = typeof MethodStrings[number]

type ModeType = 'cors' | 'no-cors' | 'same-origin' | 'navigate'
type CredentialsType = 'omit' | 'sane-origin' | 'include'
type CacheType = 'default' | 'reload' | 'no-cache'

interface RequestInit {
  method?: Method,
  headers?: Record<string, string> | Headers,
  body?: string | FormData | URLSearchParams | ReadableStream,
  mode?: ModeType
  credentials?: CredentialsType
  cache?: CacheType
  redirect?: 'follow' | 'error' | 'manual'
  referrer?: string
  integrity?: string
}

export default class Request {
  readonly url: string
  readonly method: Method
  readonly headers: Headers
  readonly body: string | FormData | URLSearchParams | ReadableStream
  readonly mode: ModeType
  readonly credentials: CredentialsType
  readonly cache: CacheType
  readonly redirect: 'follow' | 'error' | 'manual'
  readonly referrer: string
  readonly integrity: string

  constructor(urlOrRequest: string | Request, init: RequestInit = {}) {
    if (urlOrRequest instanceof Request) {
      this.url = urlOrRequest.url
      init = {
        body: urlOrRequest.body,
        credentials: urlOrRequest.credentials,
        headers: urlOrRequest.headers,
        method: urlOrRequest.method,
        mode: urlOrRequest.mode,
        referrer: urlOrRequest.referrer,
        ...init
      }
    } else {
      this.url = urlOrRequest || '/'
    }

    this.method = init.method || 'GET'
    this.mode = init.mode || 'same-origin'
    this.referrer = init.referrer && init.referrer !== 'no-referrer' ? init.referrer : ''
    // See https://fetch.spec.whatwg.org/#concept-request-credentials-mode
    this.credentials = init.credentials || (this.mode === 'navigate' ? 'include' : 'omit');

    // Transform init.headers to Headers object
    if (init.headers) {
      if (init.headers instanceof Headers) {
        this.headers = init.headers
      } else {
        this.headers = new Headers(init.headers);
      }
    } else {
      this.headers = new Headers(DEFAULT_HEADERS);
    }
  }
  arrayBuffer() {
    throw new Error('Body.arrayBuffer is not yet supported.');
  }

  blob() {
    return this.resolve('blob', body => body);
  }

  json() {
    return this.resolve('json', body => JSON.parse(body._text));
  }

  text() {
    return this.resolve('text', body => body._text);
  }

  resolve(name, resolver) {
    if (this.bodyUsed) throwBodyUsed(name);
    this.bodyUsed = true;
    return Promise.resolve(resolver(this.body));
  }

  clone() {
    if (this.bodyUsed) {
      throwBodyUsed();
    }

    return new Request(this.url, {
      method: this.method,
      mode: this.mode,
      headers: this.headers,
      body: this.body ? this.body.clone() : this.body
    });
  }
}

Request.Request = (url, options) => new Request(url, options);

