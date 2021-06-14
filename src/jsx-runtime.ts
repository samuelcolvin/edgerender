import {ElementType, Props, Key, JsxChunk, Fragment} from './jsx'

const jsx = (el: ElementType, props: Props, key: Key) => new JsxChunk(el, key, props)

export {jsx, jsx as jsxs, Fragment}
