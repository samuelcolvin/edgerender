import {Blob} from './blob'
import {ReadableStream} from './ReadableStream'

const BodyTypes = new Set(['String', 'Blob', 'ReadableStream', 'ArrayBuffer', 'Null', 'Undefined'])

export type BodyType = string | Blob | ReadableStream | ArrayBuffer

export class Body {
  protected readonly _body_content: string | Blob | ReadableStream | ArrayBuffer | undefined
  protected _bodyUsed: boolean

  constructor(body_content: BodyType | undefined) {
    const body_type = get_type(body_content)
    if (!BodyTypes.has(body_type)) {
      throw new TypeError(`Invalid body type "${body_type}", must be one of: Blob, ReadableStream, string, null`)
    }
    this._body_content = body_content
    this._bodyUsed = false
  }

  get bodyUsed(): boolean {
    return this._bodyUsed
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    this.check_used('arrayBuffer')
    const blob = await this.blob()
    return blob.arrayBuffer()
  }

  async blob(): Promise<Blob> {
    this.check_used('blob')
    if (typeof this._body_content == 'string') {
      return new Blob([this._body_content])
    } else if (this._body_content instanceof Blob) {
      return this._body_content
    } else {
      return new Blob([])
    }
  }

  async json(): Promise<any> {
    this.check_used('json')
    return JSON.parse(await this._text())
  }

  async text(): Promise<string> {
    this.check_used('text')
    return await this._text()
  }

  protected async _text(): Promise<string> {
    if (typeof this._body_content == 'string') {
      return this._body_content
    } else if (this._body_content instanceof Blob) {
      return await this._body_content.text()
    } else {
      return ''
    }
  }

  protected check_used(name: string): void {
    if (this._bodyUsed) {
      throw new Error(`Failed to execute "${name}": body is already used`)
    }
    this._bodyUsed = true
  }
}

function get_type(obj: any): string {
  if (obj == null) {
    return 'Null'
  } else if (obj == undefined) {
    return 'Undefined'
  } else {
    return Object.getPrototypeOf(obj).constructor.name
  }
}
