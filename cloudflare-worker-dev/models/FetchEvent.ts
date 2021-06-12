export class EdgeFetchEvent implements FetchEvent {
  readonly type: 'fetch'
  readonly request: Request
  _response: Response | Promise<Response> | null = null
  readonly _wait_until_promises: Promise<any>[] = []

  constructor(type: 'fetch', init: FetchEventInit) {
    if (type != 'fetch') {
      throw new Error('only "fetch" events are supported')
    }
    this.type = type
    this.request = init.request
  }

  respondWith(response: Response | Promise<Response>): void {
    this._response = response
  }

  waitUntil(f: any): void {
    this._wait_until_promises.push(f as Promise<any>)
  }

  // all these values/methods are required to be a valid FetchEvent but are not implemented by FetchEvents
  // in CloudFlare workers
  get clientId(): string {
    throw new Error('clientId not implemented')
  }
  get resultingClientId(): string {
    throw new Error('resultingClientId not implemented')
  }
  get bubbles(): boolean {
    throw new Error('bubbles not implemented')
  }
  get cancelBubble(): boolean {
    throw new Error('cancelBubble not implemented')
  }
  get cancelable(): boolean {
    throw new Error('cancelable not implemented')
  }
  get composed(): boolean {
    throw new Error('composed not implemented')
  }
  get currentTarget(): EventTarget | null {
    throw new Error('currentTarget not implemented')
  }
  get defaultPrevented(): boolean {
    throw new Error('defaultPrevented not implemented')
  }
  get isTrusted(): boolean {
    throw new Error('isTrusted not implemented')
  }
  get returnValue(): boolean {
    throw new Error('returnValue not implemented')
  }
  get srcElement(): EventTarget | null {
    throw new Error('srcElement not implemented')
  }
  get target(): EventTarget | null {
    throw new Error('target not implemented')
  }
  get timeStamp(): number {
    throw new Error('timeStamp not implemented')
  }

  get eventPhase(): number {
    throw new Error('eventPhase not implemented')
  }
  get AT_TARGET(): number {
    throw new Error('AT_TARGET not implemented')
  }
  get BUBBLING_PHASE(): number {
    throw new Error('BUBBLING_PHASE not implemented')
  }
  get CAPTURING_PHASE(): number {
    throw new Error('CAPTURING_PHASE not implemented')
  }
  get NONE(): number {
    throw new Error('NONE not implemented')
  }
  initEvent(_type: string, _bubbles?: boolean, _cancelable?: boolean): void {
    throw new TypeError('initEvent not implemented')
  }
  passThroughOnException(): void {
    throw new TypeError('passThroughOnException not implemented')
  }
  get preloadResponse(): Promise<any> {
    throw new TypeError('preloadResponse not implemented')
  }
  composedPath(): EventTarget[] {
    throw new TypeError('composedPath not implemented')
  }
  preventDefault(): void {
    throw new TypeError('preventDefault not implemented')
  }
  stopImmediatePropagation(): void {
    throw new TypeError('stopImmediatePropagation not implemented')
  }
  stopPropagation(): void {
    throw new TypeError('stopPropagation not implemented')
  }
}
