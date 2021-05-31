import {smart_typeof, SmartType} from './utils'

type Props = Record<string, any>
export type Component = (props: Props) => JsxElement
type AnyElement = string | Component | JsxElement
type Key = string | number | null

class JsxElement {
  readonly el: AnyElement
  readonly children?: AnyElement | AnyElement[]
  readonly props: Props
  readonly key: Key
  constructor(el: AnyElement, props: Props, key: Key = null) {
    this.el = el
    this.children = props.children
    delete props.children
    this.props = props
    this.key = key
  }
  toString() {
    return `JsxElement<${this.el} (${JSON.stringify(this.props)})>`
  }
  toJSON() {
    return {
      'el': this.el.toString(),
      'key': this.key,
      'props': this.props,
      'children': this.children,
    }
  }
}

export function Fragment(props: Props): JsxElement {
  return new JsxElement('Fragment', props)
}

export function jsx(el: AnyElement, props: Props, key: Key): JsxElement {
  return new JsxElement(el, props, key)
}
export function jsxs(el: AnyElement, props: Props, key: Key): JsxElement {
  return new JsxElement(el, props, key)
}
