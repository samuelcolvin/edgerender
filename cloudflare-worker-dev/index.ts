import {
  EdgeRequest,
  EdgeBlob,
  EdgeResponse,
  EdgeFetchEvent,
  EdgeHeaders,
  EdgeEventTarget,
  EdgeReadableStream,
} from './models'
export {MockKVNamespace} from './kv_namespace'
import {edge_fetch} from './fetch'

declare const global: any

export class EdgeEnv extends EdgeEventTarget {
  readonly Request = EdgeRequest
  readonly Response = EdgeResponse
  readonly FetchEvent = EdgeFetchEvent
  readonly Headers = EdgeHeaders
  readonly Blob = EdgeBlob
  readonly ReadableStream = EdgeReadableStream
  readonly fetch = edge_fetch
}

export function makeEdgeEnv(extra: Record<string, any> = {}): void {
  const env = new EdgeEnv()
  Object.assign(global, env, extra)
}
