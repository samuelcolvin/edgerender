// https://developers.cloudflare.com/workers/runtime-apis/kv
// TODO ReadableStream, list, expiration
import {EdgeReadableStream} from './models'
import {encode, decode} from './utils'

interface InputValue {
  value: string | ArrayBuffer
  metadata?: Record<string, string>
  expiration?: number
}

interface InternalValue {
  value: ArrayBuffer
  metadata?: unknown
  expiration?: number
}

interface OutputValue {
  value: any
  metadata: unknown | null
}

interface ListKey {
  name: string
  expiration?: number
  metadata?: unknown
}

type ValueTypeNames = 'text' | 'json' | 'arrayBuffer' | 'stream'

export class MockKVNamespace implements KVNamespace {
  protected kv: Map<string, InternalValue>

  constructor(kv: Record<string, InputValue> = {}) {
    this.kv = new Map()
    this._reset(kv)
  }

  async get(key: string, options?: {type?: ValueTypeNames; cacheTtl?: number} | ValueTypeNames): Promise<any> {
    options = options || {}
    if (typeof options == 'string') {
      options = {type: options}
    }
    const v = await this.getWithMetadata(key, options.type)
    return v.value || null
  }

  async getWithMetadata(key: string, type?: ValueTypeNames): Promise<OutputValue> {
    // async getWithMetadata(key: string, type: ValueTypeNames = 'text'): Promise<KvValue> {
    const v = this.kv.get(key)
    if (v == undefined) {
      return {value: null, metadata: null}
    }
    return {value: prepare_value(v.value, type), metadata: v.metadata || {}}
  }

  async put(key: string, value: string | ArrayBuffer, extra: {metadata?: Record<string, string>}): Promise<void> {
    this._put(key, value, extra.metadata)
  }

  async delete(key: string): Promise<void> {
    this.kv.delete(key)
  }

  async list(options?: {prefix?: string; limit?: number; cursor?: string}): Promise<{
    keys: ListKey[]
    list_complete: boolean
    cursor?: string
  }> {
    options = options || {}
    if (options.cursor) {
      throw new Error('list cursors not yet implemented')
    }

    const prefix = options.prefix
    const limit = options.limit || 1000
    const keys: ListKey[] = []
    for (const [name, value] of this.kv) {
      if (!prefix || name.startsWith(prefix)) {
        if (keys.length == limit) {
          return {keys, list_complete: false, cursor: 'not-fully-implemented'}
        }
        const {expiration, metadata} = value
        keys.push({name, expiration, metadata})
      }
    }
    return {keys, list_complete: true}
  }

  _clear() {
    this.kv.clear()
  }

  _reset(kv: Record<string, InputValue>) {
    this._clear()
    for (const [k, v] of Object.entries(kv)) {
      this._put(k, v.value, v.metadata)
    }
  }

  private _put(key: string, value: string | ArrayBuffer, metadata: Record<string, string> | undefined): void {
    if (typeof value == 'string') {
      value = encode(value).buffer
    }
    this.kv.set(key, {value, metadata})
  }
}

function prepare_value(v: ArrayBuffer, type: ValueTypeNames | undefined): any {
  switch (type) {
    case 'arrayBuffer':
      return v
    case 'json':
      return JSON.parse(decode(v))
    case 'stream':
      return new EdgeReadableStream([new Uint8Array(v)])
    default:
      return decode(v)
  }
}
