import {ChildType, classNameType, JsxChunk, Key} from './render'
export {Router, Views} from './router'
export {AssetConfig} from './assets'

export async function render_jsx(jsx_element: JSX.Element): Promise<string> {
  const jsx_obj: JsxChunk = await Promise.resolve(jsx_element)
  return await jsx_obj.render()
}

interface CustomTagProperties {
  _tag: string
  key?: Key
  className?: classNameType
  children?: ChildType
  [key: string]: any
}

export const CustomTag = ({_tag, key, ...props}: CustomTagProperties): JsxChunk => {
  return new JsxChunk(_tag, key, props)
}

export class RawHtml {
  readonly html: string

  constructor(html: string) {
    this.html = html
  }
}

export const raw_html = (html: string): RawHtml => new RawHtml(html)
