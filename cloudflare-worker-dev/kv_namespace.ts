// https://developers.cloudflare.com/workers/runtime-apis/kv
// TODO ReadableStream, list, expiration
import {EdgeReadableStream} from './models'
import {encode, decode} from './utils'

interface InputValue {
  value: string | ArrayBuffer
  metadata?: Record<string, string>
}

interface InternalValue {
  value: ArrayBuffer
  metadata?: Record<string, string>
}

interface KvValue {
  value?: any
  metadata?: Record<string, string>
}

type ValueTypeNames = 'text' | 'json' | 'arrayBuffer' | 'stream'

export class MockKVNamespace {
  protected kv: Map<string, InternalValue>

  constructor(kv: Record<string, InputValue> = {}) {
    this.kv = new Map()
    this._reset(kv)
  }

  async get(key: string, type: ValueTypeNames = 'text'): Promise<any> {
    const v = await this.getWithMetadata(key, type)
    return v.value || null
  }

  async getWithMetadata(key: string, type: ValueTypeNames = 'text'): Promise<KvValue> {
    const v = this.kv.get(key)
    if (v == undefined) {
      return {}
    }
    return {value: prepare_value(v.value, type), metadata: v.metadata || {}}
  }

  async put(key: string, value: string | ArrayBuffer, extra: {metadata?: Record<string, string>}): Promise<void> {
    this._put(key, value, extra.metadata)
  }

  async delete(key: string): Promise<void> {
    this.kv.delete(key)
  }

  async list(): Promise<any[]> {
    throw new Error('not yet implemented')
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

function prepare_value(v: ArrayBuffer, type: ValueTypeNames): any {
  switch (type) {
    case 'arrayBuffer':
      return v
    case 'json':
      return JSON.parse(decode(v))
    case 'text':
      return decode(v)
    case 'stream':
      return new EdgeReadableStream([new Uint8Array(v)])
  }
}
