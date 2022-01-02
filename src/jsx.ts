import {smart_typeof, SmartType} from './utils'
import {hyphenate, render_styles} from './utils/styles'
import HtmlEscape from './utils/escape'

export type Props = Record<string, any>
export type Component = (props: Props) => JsxChunk | Promise<JsxChunk>
export class Fragment {}
export type ElementType = string | typeof Fragment | Component
type ChildSingleType = string | boolean | number | RawHtml | JsxChunk
export type ChildType = ChildSingleType | ChildSingleType[]
export type Key = string | number | null
export type classNameType = string | (string | boolean | null | undefined)[] | Record<string, any>

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

export const raw_html = (html: string): string => new RawHtml(html) as any

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

  constructor(el: ElementType, key: Key = null, args: Props) {
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
      if (el == 'html') {
        return '<!doctype html>\n' + (await this.render_element(el))
      } else {
        return await this.render_element(el)
      }
    } else if (el == Fragment) {
      return await this.render_children()
    } else {
      const f = el as Component
      const jsx_chunk: JsxChunk = await Promise.resolve(f(this.args))
      return await jsx_chunk.render()
    }
  }

  private async render_element(el: string): Promise<string> {
    let attrs = ''
    for (const [key, value] of Object.entries(this.props)) {
      attrs += render_attr(key, value)
    }
    if (EmptyTags.has(el)) {
      // TODO error if children exist?
      return `<${el}${attrs}>`
    } else {
      const children = await this.render_children()
      return `<${el}${attrs}>${children}</${el}>`
    }
  }

  private async render_children(): Promise<string> {
    return await cat_array(this.children)
  }

  toString() {
    return `JsxElement(${this.el}, ${JSON.stringify(this.args)})`
  }
}

function render_attr(name: string, value: any): string {
  let attr_value: string | null = null
  const value_type = smart_typeof(value)

  if (value == null) {
    attr_value = null
  } else if (name == 'style') {
    attr_value = render_styles(value)
  } else if (name == 'className') {
    attr_value = render_class(value, value_type)
  } else if (name == 'data' && value_type == SmartType.Object) {
    return render_data(value as Record<string, any>)
  } else if (value_type == SmartType.Boolean) {
    if (value === true) {
      return ` ${get_tag_name(name)}`
    } else {
      attr_value = null
    }
  } else {
    attr_value = render_attr_value(value, value_type)
  }

  if (attr_value == null) {
    return ''
  } else {
    const quote = attr_value.includes('"') ? "'" : '"'
    return ` ${get_tag_name(name)}=${quote}${attr_value}${quote}`
  }
}

function render_attr_value(value: any, value_type: SmartType) {
  switch (value_type) {
    case SmartType.String:
      return HtmlEscape.attr_double(value)
    case SmartType.RawHtml:
      return (value as RawHtml).html
    default:
      return HtmlEscape.attr_single(JSON.stringify(value))
  }
}

function get_tag_name(name: string): string {
  if (name == 'className') {
    return 'class'
  } else if (name == 'htmlFor') {
    return 'for'
  } else if (name.startsWith('hx')) {
    return hyphenate(name)
  } else {
    return name.toLowerCase()
  }
}

async function render_child(child: any): Promise<string> {
  switch (smart_typeof(child)) {
    case SmartType.String:
      return HtmlEscape.content(child as string)
    case SmartType.JsxChunk:
      return await (child as JsxChunk).render()
    case SmartType.Array:
      return await cat_array(child as ChildType[])
    case SmartType.RawHtml:
      return (child as RawHtml).html
    case SmartType.Null:
    case SmartType.Undefined:
      return ''
    case SmartType.Number:
      return (child as number).toString()
    case SmartType.Function:
      return await render_child((child as CallableFunction)())
    case SmartType.Promise:
      return await render_child((await child) as Promise<any>)
    case SmartType.RegExp:
      return HtmlEscape.content((child as RegExp).toString())
    default:
      return HtmlEscape.content(JSON.stringify(child))
  }
}

async function cat_array(child: ChildType[]): Promise<string> {
  const results = await Promise.all(child.map(item => render_child(item)))
  return results.join('')
}

function render_class(value: classNameType, value_type: SmartType): string {
  const classNames: string[] = []
  switch (value_type) {
    case SmartType.String:
      return value as string
    case SmartType.Array:
      for (const className of value as any[]) {
        if (typeof className == 'string') {
          classNames.push(className)
        }
      }
      break
    case SmartType.Object:
      for (const [className, v] of Object.entries(value as Record<string, any>)) {
        if (v) {
          classNames.push(className)
        }
      }
      break
    default:
      throw new TypeError(`unexpected type passed to className: "${value_type}", should be string, list or object`)
  }
  return classNames.join(' ')
}

function render_data(data: Record<string, any>): string {
  let result = ''
  for (const [key, value] of Object.entries(data)) {
    const clean_name = key.replace(/[^\w-]/g, '')
    const attr_value: string = render_attr_value(value, smart_typeof(value))
    const quote = attr_value.includes('"') ? "'" : '"'
    result += ` data-${clean_name}=${quote}${attr_value}${quote}`
  }
  return result
}
