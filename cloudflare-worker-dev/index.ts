import Request from './models/Request'
import Response from './models/Response'
import FetchEvent from './models/FetchEvent'
import Headers from './models/Headers'
import FetchEventTarget from './models/FetchEventTarget'
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
