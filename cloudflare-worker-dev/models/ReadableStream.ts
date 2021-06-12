type BasicCallback = () => void

class ReadableStreamDefaultReader {
  protected readonly stream: ReadableStream
  protected readonly closed_promise: Promise<void>

  constructor(stream: ReadableStream) {
    this.stream = stream
    this.closed_promise = new Promise(resolve => {
      stream._internal_add_resolver(resolve)
    })
  }

  get closed(): Promise<void> {
    return this.closed_promise
  }

  async read(): Promise<IteratorResult<string>> {
    return this.stream._internal_read()
  }

  async cancel(reason?: any): Promise<void> {
    return this.stream.cancel(reason)
  }

  releaseLock(): void {
    this.stream._internal_unlock()
  }
}

export class ReadableStream {
  protected locked = false
  _internal_iterator: IterableIterator<string>
  protected readonly on_done_resolvers: Set<BasicCallback>

  constructor(chunks: string[]) {
    this._internal_iterator = chunks[Symbol.iterator]()
    this.on_done_resolvers = new Set()
  }

  async cancel(_reason?: any): Promise<void> {
    this._internal_iterator = [][Symbol.iterator]()
    return new Promise(resolve => {
      this.on_done_resolvers.add(resolve)
    })
  }

  getReader({mode}: {mode?: 'byob'} = {}): ReadableStreamDefaultReader {
    if (mode) {
      throw new TypeError('ReadableStream modes other than default are not supported')
    } else if (this.locked) {
      throw new Error('ReadableStream already locked')
    }
    this.locked = true
    return new ReadableStreamDefaultReader(this)
  }

  _internal_unlock(): void {
    this.locked = false
  }

  _internal_add_resolver(resolver: BasicCallback): void {
    this.on_done_resolvers.add(resolver)
  }

  async _internal_read(): Promise<IteratorResult<string>> {
    const result = this._internal_iterator.next()
    if (result.done) {
      for (const resolve of this.on_done_resolvers) {
        resolve()
      }
    }
    return result
  }
}
