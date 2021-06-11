import Request from './models/Request'
import FetchEvent from './models/FetchEvent'
import FetchEventTarget from './models/FetchEventTarget'

declare const global: any

export class CloudflareEnv extends FetchEventTarget {
  readonly Request = Request
  readonly FetchEvent = FetchEvent
}

export function prepareEnv(): void {
  const env = new CloudflareEnv()
  Object.assign(global, env)
}
