import escapeHtml from 'escape-html'
import {smart_typeof, SmartType} from './utils'

export type Props = Record<string, any>
export type Component = (props: Props) => JsxChunk | Promise<JsxChunk>
export class Fragment {}
export type ElementType = string | typeof Fragment | Component
type ChildSingleType = string | boolean | number | JsxChunk
export type ChildType = ChildSingleType | ChildSingleType[]
export type Key = string | number | null

export class JsxChunk {
  private readonly el: ElementType
  private readonly key: Key
  private readonly all_props: Props
  private readonly props: Props
  private readonly children: ChildType[]

  constructor(el: ElementType, all_props: Props, key: Key = null) {
    this.el = el
    this.key = key
    this.all_props = all_props
    const {children, ...props} = all_props
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
      return `<${el}${attrs}>${await this.render_children()}</${el}>`
    } else if (el == Fragment) {
      return await this.render_children()
    } else {
      const f = el as Component
      const jsx_chunk: JsxChunk = await Promise.resolve(f(this.all_props))
      return await jsx_chunk.render()
    }
  }

  private async render_children(): Promise<string> {
    let result = ''
    for (const child of this.children) {
      result += await render_child(child)
    }
    return result
  }

  toString() {
    return `JsxElement<${this.el} (${JSON.stringify(this.props)})>`
  }

  // TODO remove
  toJSON() {
    return {
      el: this.el.toString(),
      key: this.key,
      props: this.props,
      children: this.children,
    }
  }
}

export function render_prop(name: string, value: any): string {
  let str_value = ''
  if (typeof value == 'string') {
    str_value = value
  } else {
    // TODO styles etc
    str_value = JSON.stringify(value)
  }
  return ` ${name}="${escapeHtml(str_value)}"`
}

export async function render_child(child: ChildType): Promise<string> {
  const child_type = smart_typeof(child)
  let result = ''
  switch (child_type) {
    case SmartType.String:
      return escapeHtml(child as string)
    case SmartType.JsxChunk:
      return await (child as JsxChunk).render()
    case SmartType.Array:
      for (const item of child as any[]) {
        result += await render_child(item)
      }
      return result
    default:
      return JSON.stringify(child)
  }
}
