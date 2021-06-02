import {ElementType, Props, Key, JsxChunk, Fragment} from './render'

const jsx = (el: ElementType, props: Props, key: Key) => new JsxChunk(el, props, key)

export {jsx, jsx as jsxs, Fragment}
