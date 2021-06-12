// https://developer.mozilla.org/en-US/docs/Web/API/Blob
import {ReadableStream} from './ReadableStream'
import {encode, decode} from '../utils'

type BlobChunkType = ArrayBuffer | Blob | string

export class Blob {
  protected readonly chunks: BlobChunkType[]
  protected type: string

  constructor(chunks: BlobChunkType[], options: {type?: string} = {}) {
    this.chunks = chunks
    this.type = options.type || ''
  }

  protected _text(): string {
    let s = ''
    for (const chunk of this.chunks) {
      if (chunk instanceof ArrayBuffer) {
        s += decode(chunk)
      } else if (chunk instanceof Blob) {
        s += (chunk as any)._text()
      } else {
        s += chunk
      }
    }
    return s
  }

  protected _Uint8Array(): Uint8Array {
    const a: Uint8Array[] = []
    for (const chunk of this.chunks) {
      if (chunk instanceof ArrayBuffer) {
        a.push(new Uint8Array(chunk))
      } else if (chunk instanceof Blob) {
        a.push((chunk as any)._Uint8Array())
      } else {
        a.push(encode(chunk))
      }
    }
    return s
  }

  get size(): number {
    return encode(this._text()).length
  }

  async text(): Promise<string> {
    return this._text()
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return encode(this._text()).buffer
  }

  stream(): ReadableStream {
    return new ReadableStream(this.chunks)
  }

  slice(start = 0, end: number | undefined = undefined, contentType?: string): Blob {
    const options = contentType ? {type: contentType} : {}
    return new Blob(this.chunks.slice(start, end), options)
  }
}
