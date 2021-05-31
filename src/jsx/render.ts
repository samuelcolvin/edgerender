import {smart_typeof, SmartType} from './utils'
import type {Component} from './jsx-runtime'

type ChildTypes = Component | string | number | boolean

async function render_element(child: ChildTypes): Promise<string> {
  const child_type = smart_typeof(child)
  // console.log('render_children:', {child_type, child})
  let result = ''
  switch (child_type) {
    case SmartType.String:
      return child
    case SmartType.JsxElement:
      return await jsxs(child.el, child.props)
    case SmartType.AsyncRef:
      return await render_element(await child.get_result())
    case SmartType.Array:
      for (const item of child as any[]) {
        result += await render_element(item)
      }
      return result
    default:
      return JSON.stringify(child)
  }
  // console.log('render_children:', {child_type, child})
}

export async function jsxs(el: AnyElement, props: Props): Promise<string> {
  // console.log('jsxs:', {el, props})
  if (typeof el == 'string') {
    let children = ''
    let attrs = ''
    for (const [key, raw_value] of Object.entries(props)) {
      const value = await render_element(raw_value)
      if (key == 'children') {
        children = value
      } else {
        // TODO other conversions
        const name = key == 'className' ? 'class' : key
        attrs += ` ${name}="${value}"`
      }
    }
    return `<${el}${attrs}>${children}</${el}>`
    // } else if (el == Fragment) {
    //   return await render_element(props.children)
  } else {
    const f = el as any
    const result = f(props)
    if (smart_typeof(result) == SmartType.Promise) {
      return await result
    } else {
      return await render_element(result)
    }
  }
}
