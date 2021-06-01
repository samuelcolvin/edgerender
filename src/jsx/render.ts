import type * as CSS from 'csstype'
import escapeHtml from 'escape-html'
import {smart_typeof, SmartType} from './utils'
import {RawHtml} from './index'

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
        attrs += render_prop(key, value)
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

function render_prop(name: string, value: any): string {
  let attr_value: string | null = null
  let quote = '"'

  if (name == 'styles') {
    attr_value = render_styles(value)
  } else {
    switch (smart_typeof(value)) {
      case SmartType.String:
        attr_value = escapeHtml(value)
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
        attr_value = escapeHtml(JSON.stringify(value))
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
      return escapeHtml(child as string)
    case SmartType.JsxChunk:
      return await (child as JsxChunk).render()
    case SmartType.Array:
      return await cat_array(child as ChildType[])
    case SmartType.RawHtml:
      return (child as RawHtml).html
    default:
      return JSON.stringify(child)
  }
}

async function cat_array(child: ChildType[]): Promise<string> {
  let result = ''
  for (const item of child) {
    result += await render_child(item)
  }
  return result
}

function render_styles(styles: CSS.Properties): string | null {
  let serialized = ''
  let delimiter = ''
  for (const [name, value] of Object.entries(styles)) {
    const is_custom_property = name.indexOf('--') == 0
    if (value != null) {
      serialized +=
        delimiter +
        (is_custom_property ? name : get_style_name(name)) +
        ':' +
        get_style_value(name, value, is_custom_property) +
        ';'

      delimiter = ';'
    }
  }
  return serialized || null
}

const uppercase_pattern = /([A-Z])/g
const ms_pattern = /^ms-/
const style_name_cache: Record<string, string> = {}

function get_style_name(name: string): string {
  // from https://github.com/facebook/react/blob/master/packages/react-dom/src/server/ReactPartialRenderer.js
  // (processStyleName) and
  // https://github.com/facebook/react/blob/master/packages/react-dom/src/shared/hyphenateStyleName.js
  const cached_value = style_name_cache[name] as string | undefined
  if (typeof cached_value == 'string') {
    return cached_value
  } else {
    return (style_name_cache[name] = name.replace(uppercase_pattern, '-$1').toLowerCase().replace(ms_pattern, '-ms-'))
  }
}

function get_style_value(name: string, value: string | number | null | boolean, is_custom_property: boolean): string {
  // from https://github.com/facebook/react/blob/master/packages/react-dom/src/shared/dangerousStyleValue.js

  const is_empty = value == null || typeof value === 'boolean' || value === ''
  if (is_empty) {
    return ''
  }

  if (!is_custom_property && typeof value === 'number' && value !== 0 && !unitless_numbers.has(name)) {
    // Presumes implicit 'px' suffix for unitless numbers
    return value + 'px'
  }

  return ('' + value).trim()
}

const unitless_numbers = new Set([
  'animationIterationCount',
  'aspectRatio',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridArea',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',

  // SVG-related properties
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
])
