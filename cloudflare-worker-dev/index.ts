import {Request, Response, FetchEvent, Headers, FetchEventTarget} from './models'
export {MockKVNamespace} from './kv_namespace'

declare const global: any

export class CloudflareEnv extends FetchEventTarget {
  readonly Request = Request
  readonly Response = Response
  readonly FetchEvent = FetchEvent
  readonly Headers = Headers
}

export function makeCloudflareEnv(extra: Record<string, any> = {}): void {
  const env = new CloudflareEnv()
  Object.assign(global, env, extra)
}
