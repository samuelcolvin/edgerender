import {Blob} from './blob'

export function throwBodyUsed(name: string): void {
  throw new TypeError(`Failed to execute "${name}": body is already used`)
}

export default class Body {
  protected readonly _body_content: string | Blob | undefined
  protected _bodyUsed: boolean

  constructor(body_content: string | Blob | undefined) {
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
    return JSON.parse(await this.text())
  }

  async text(): Promise<string> {
    this.check_used('text')
    if (typeof this._body_content == 'string') {
      return this._body_content
    } else if (this._body_content instanceof Blob) {
      return await this._body_content.text()
    } else {
      return ''
    }
  }

  protected check_used(name: string): void {
    if (this.bodyUsed) {
      throwBodyUsed(name)
    }
    this._bodyUsed = true
  }
}
