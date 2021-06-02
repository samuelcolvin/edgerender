import {smart_typeof, SmartType} from './utils'
import {RawHtml} from './index'
import render_styles from './styles'
import HtmlEscape from './escape'

export type Props = Record<string, any>
export type Component = (props: Props) => JsxChunk | Promise<JsxChunk>
export class Fragment {}
export type ElementType = string | typeof Fragment | Component
type ChildSingleType = string | boolean | number | RawHtml | JsxChunk
export type ChildType = ChildSingleType | ChildSingleType[]
export type Key = string | number | null

const EmptyTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

export class JsxChunk {
  readonly el: ElementType
  readonly key: Key
  readonly args: Props
  readonly props: Props
  readonly children: ChildType[]

  constructor(el: ElementType, args: Props, key: Key = null) {
    this.el = el
    this.key = key
    this.args = args
    const {children, ...props} = args
    this.props = props
    if (Array.isArray(children)) {
      this.children = children
    } else if (typeof children == 'undefined') {
      this.children = []
    } else {
      this.children = [children]
    }
  }

  async render(): Promise<string> {
    const {el} = this
    if (typeof el == 'string') {
      let attrs = ''
      for (const [key, value] of Object.entries(this.props)) {
        attrs += render_attr(key, value)
      }
      if (EmptyTags.has(el)) {
        // TODO error if children exist?
        return `<${el}${attrs}>`
      } else {
        return `<${el}${attrs}>${await this.render_children()}</${el}>`
      }
    } else if (el == Fragment) {
      return await this.render_children()
    } else {
      const f = el as Component
      const jsx_chunk: JsxChunk = await Promise.resolve(f(this.args))
      return await jsx_chunk.render()
    }
  }

  private async render_children(): Promise<string> {
    return await cat_array(this.children)
  }

  toString() {
    return `JsxElement<${this.el} (${JSON.stringify(this.args)})>`
  }
}

function render_attr(name: string, value: any): string {
  let attr_value: string | null = null
  let quote = '"'

  if (name == 'styles') {
    attr_value = render_styles(value)
  } else {
    switch (smart_typeof(value)) {
      case SmartType.String:
        attr_value = HtmlEscape.attr_double(value)
        break
      case SmartType.Boolean:
        if (value === true) {
          return ` ${get_tag_name(name)}`
        } else {
          attr_value = null
        }
        break
      case SmartType.RawHtml:
        attr_value = (value as RawHtml).html
        quote = attr_value.indexOf('"') == -1 ? '"' : "'"
        break
      default:
        attr_value = HtmlEscape.attr_single(JSON.stringify(value))
        quote = "'"
    }
  }
  if (attr_value == null) {
    return ''
  } else {
    return ` ${get_tag_name(name)}=${quote}${attr_value}${quote}`
  }
}

function get_tag_name(name: string): string {
  switch (name) {
    case 'className':
      return 'class'
    default:
      return name.toLowerCase()
  }
}

async function render_child(child: ChildType): Promise<string> {
  switch (smart_typeof(child)) {
    case SmartType.String:
      return HtmlEscape.content(child as string)
    case SmartType.JsxChunk:
      return await (child as JsxChunk).render()
    case SmartType.Array:
      return await cat_array(child as ChildType[])
    case SmartType.RawHtml:
      return (child as RawHtml).html
    default:
      return HtmlEscape.content(JSON.stringify(child))
  }
}

async function cat_array(child: ChildType[]): Promise<string> {
  const results = await Promise.all(child.map(item => render_child(item)))
  return results.join('')
}
