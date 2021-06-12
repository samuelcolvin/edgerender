export class EdgeFetchEvent implements Partial<FetchEvent> {
  readonly type: 'fetch'
  readonly request: Request
  _response: Response | Promise<Response> | null = null
  readonly _wait_until_promises: Promise<any>[] = []

  constructor(type: 'fetch', init: FetchEventInit) {
    this.type = type
    this.request = init.request
  }

  respondWith(response: Response | Promise<Response>): void {
    this._response = response
  }

  waitUntil(f: any): void {
    this._wait_until_promises.push(f as Promise<any>)
  }
}
