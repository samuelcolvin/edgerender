import {Request} from './Request'

interface FetchEventInit {
  request: Request
}

export class FetchEvent {
  readonly type: 'fetch'
  request: Request
  response: Promise<any> | null = null

  constructor(type: 'fetch', init: FetchEventInit) {
    this.type = type
    this.request = init.request
  }

  respondWith(response: any): void {
    this.response = response
  }
}
