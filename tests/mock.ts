type KvDictType = Record<string, {value: string; metadata?: Record<string, string>}>

interface KvValue {
  value?: string
  metadata?: Record<string, string>
}

export class MockKvNamespace {
  protected kv: KvDictType

  constructor(kv: KvDictType | null = null) {
    this.kv = kv || {}
  }

  set_keys(kv: KvDictType) {
    this.kv = kv
  }

  as_kv_namespace(): KVNamespace {
    return this as any
  }

  async get(key: string, type: 'string' | 'arrayBuffer' = 'string'): Promise<string | undefined> {
    const v = await this.getWithMetadata(key, type)
    if (v) {
      return v.value
    }
  }

  async getWithMetadata(key: string, _type: 'string' | 'arrayBuffer' = 'string'): Promise<KvValue> {
    const v = this.kv[key]
    if (v == undefined) {
      return {}
    } else {
      return {value: v.value, metadata: v.metadata || {}}
    }
  }

  async put(key: string, value: string, extra: {metadata?: Record<string, string>}): Promise<void> {
    this.kv[key] = {value, metadata: extra.metadata}
  }
}

class MockResponse {
  protected readonly content: string
  readonly status: number
  readonly headers: Headers

  constructor(content: string, headers: Record<string, string>, status = 200) {
    this.content = content
    this.status = status
    this.headers = new Headers(headers)
  }

  async blob(): Promise<any> {
    return {arrayBuffer: async (): Promise<string> => this.content}
  }
}

export async function mock_fetch(url: string, _init: any): Promise<MockResponse> {
  if (url == 'https://example.com/') {
    return new MockResponse('<h1>response to example.com</h1>', {'content-type': 'text/html'})
  } else {
    return new MockResponse('404 response', {'content-type': 'text/plain'}, 404)
  }
}
