type Key = string | number
type Props = Record<string, any>

interface JsxElement<T> {
  el: T
  props: Props
  key?: Key
}
// type Element = MyElement | Promise<MyElement>

export {}

declare global {
  namespace JSX {
    type ElementTypes = Component | AnyHtmlElement
    type ChildTypes = ElementTypes | string | number | boolean
    type Element = JsxElement<ElementTypes> | Promise<JsxElement<ElementTypes>>

    type Component = (props: Props) => Element
    // export class Fragment {}

    // type Element = MyElement | Promise<MyElement>

    interface ElementChildrenAttribute {
      children: unknown
    }

    interface GenericHtmlElement {
      className?: string
      id?: string
      styles?: Record<string, string | number>
      children?: ChildTypes | ChildTypes[]
      [key: string]: any
    }

    interface VoidHtmlElement {
      className?: string
      id?: string
      styles?: Record<string, string | number>
      [key: string]: any
    }
    type AnyHtmlElement = GenericHtmlElement | VoidHtmlElement

    interface IntrinsicElements {
      a: GenericHtmlElement
      abbr: GenericHtmlElement
      address: GenericHtmlElement
      area: GenericHtmlElement
      article: GenericHtmlElement
      aside: GenericHtmlElement
      audio: GenericHtmlElement
      b: GenericHtmlElement
      base: GenericHtmlElement
      bdi: GenericHtmlElement
      bdo: GenericHtmlElement
      big: GenericHtmlElement
      blockquote: GenericHtmlElement
      body: GenericHtmlElement
      br: GenericHtmlElement
      button: GenericHtmlElement
      canvas: GenericHtmlElement
      caption: GenericHtmlElement
      cite: GenericHtmlElement
      code: GenericHtmlElement
      col: GenericHtmlElement
      colgroup: GenericHtmlElement
      data: GenericHtmlElement
      datalist: GenericHtmlElement
      dd: GenericHtmlElement
      del: GenericHtmlElement
      details: GenericHtmlElement
      dfn: GenericHtmlElement
      dialog: GenericHtmlElement
      div: GenericHtmlElement
      dl: GenericHtmlElement
      dt: GenericHtmlElement
      em: GenericHtmlElement
      embed: GenericHtmlElement
      fieldset: GenericHtmlElement
      figcaption: GenericHtmlElement
      figure: GenericHtmlElement
      footer: GenericHtmlElement
      form: GenericHtmlElement
      h1: GenericHtmlElement
      h2: GenericHtmlElement
      h3: GenericHtmlElement
      h4: GenericHtmlElement
      h5: GenericHtmlElement
      h6: GenericHtmlElement
      head: GenericHtmlElement
      header: GenericHtmlElement
      hgroup: GenericHtmlElement
      hr: GenericHtmlElement
      html: GenericHtmlElement
      i: GenericHtmlElement
      iframe: GenericHtmlElement
      img: GenericHtmlElement
      input: VoidHtmlElement
      ins: GenericHtmlElement
      kbd: GenericHtmlElement
      keygen: GenericHtmlElement
      label: GenericHtmlElement
      legend: GenericHtmlElement
      li: GenericHtmlElement
      link: GenericHtmlElement
      main: GenericHtmlElement
      map: GenericHtmlElement
      mark: GenericHtmlElement
      menu: GenericHtmlElement
      menuitem: GenericHtmlElement
      meta: VoidHtmlElement
      meter: GenericHtmlElement
      nav: GenericHtmlElement
      noindex: GenericHtmlElement
      noscript: GenericHtmlElement
      object: GenericHtmlElement
      ol: GenericHtmlElement
      optgroup: GenericHtmlElement
      option: GenericHtmlElement
      output: GenericHtmlElement
      p: GenericHtmlElement
      param: GenericHtmlElement
      picture: GenericHtmlElement
      pre: GenericHtmlElement
      progress: GenericHtmlElement
      q: GenericHtmlElement
      rp: GenericHtmlElement
      rt: GenericHtmlElement
      ruby: GenericHtmlElement
      s: GenericHtmlElement
      samp: GenericHtmlElement
      slot: GenericHtmlElement
      script: GenericHtmlElement
      section: GenericHtmlElement
      select: GenericHtmlElement
      small: GenericHtmlElement
      source: GenericHtmlElement
      span: GenericHtmlElement
      strong: GenericHtmlElement
      style: GenericHtmlElement
      sub: GenericHtmlElement
      summary: GenericHtmlElement
      sup: GenericHtmlElement
      table: GenericHtmlElement
      template: GenericHtmlElement
      tbody: GenericHtmlElement
      td: GenericHtmlElement
      textarea: GenericHtmlElement
      tfoot: GenericHtmlElement
      th: GenericHtmlElement
      thead: GenericHtmlElement
      time: GenericHtmlElement
      title: GenericHtmlElement
      tr: GenericHtmlElement
      track: GenericHtmlElement
      u: GenericHtmlElement
      ul: GenericHtmlElement
      var: GenericHtmlElement
      video: GenericHtmlElement
      wbr: GenericHtmlElement
      webview: GenericHtmlElement
    }
  }
}
