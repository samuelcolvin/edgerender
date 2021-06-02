import type {JsxChunk} from './render'

export async function render_jsx(jsx_element: JSX.Element): Promise<string> {
  const jsx_obj: JsxChunk = await Promise.resolve(jsx_element)
  return await jsx_obj.render()
}

export class RawHtml {
  readonly html: string

  constructor(html: string) {
    this.html = html
  }
}

export const raw_html = (html: string): RawHtml => new RawHtml(html)
