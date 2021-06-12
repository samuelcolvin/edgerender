// https://developer.mozilla.org/en-US/docs/Web/API/Blob
import {TextEncoder} from 'util'
import ReadableStream from './ReadableStream'

const encoder = new TextEncoder()

export default class Blob {
  protected readonly chunks: string[]
  protected type: string

  constructor(chunks: string[], options: {type?: string} = {}) {
    this.chunks = chunks
    this.type = options.type || ''
  }

  get size(): number {
    return encoder.encode(this.chunks.join('')).length
  }

  async text(): Promise<string> {
    return this.chunks.join('')
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return encoder.encode(await this.text()).buffer
  }

  stream(): ReadableStream {
    return new ReadableStream(this.chunks)
  }

  slice(start = 0, end: number | undefined = undefined, contentType?: string): Blob {
    const options = contentType ? {type: contentType} : {}
    return new Blob(this.chunks.slice(start, end), options)
  }
}
