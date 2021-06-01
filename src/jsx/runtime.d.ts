import * as CSS from 'csstype'
import {JsxChunk} from './render'

export {}

declare global {
  namespace JSX {
    type Props = Record<string, any>
    type Component = (props: Props) => Element
    type ChildTypes = Component | HtmlElement | string | number | boolean

    type Element = JsxChunk | Promise<JsxChunk>

    interface ElementChildrenAttribute {
      children: unknown
    }

    interface GenericHtmlElement {
      className?: string
      id?: string
      styles?: CSS.Properties
      children?: ChildTypes | ChildTypes[]
      [key: string]: any
    }

    interface EmptyHtmlElement {
      className?: string
      id?: string
      styles?: CSS.Properties
      children?: never
      [key: string]: any
    }
    type HtmlElement = GenericHtmlElement | EmptyHtmlElement

    interface IntrinsicElements {
      a: GenericHtmlElement
      abbr: GenericHtmlElement
      address: GenericHtmlElement
      area: EmptyHtmlElement
      article: GenericHtmlElement
      aside: GenericHtmlElement
      audio: GenericHtmlElement
      b: GenericHtmlElement
      base: EmptyHtmlElement
      bdi: GenericHtmlElement
      bdo: GenericHtmlElement
      big: GenericHtmlElement
      blockquote: GenericHtmlElement
      body: GenericHtmlElement
      br: EmptyHtmlElement
      button: GenericHtmlElement
      canvas: GenericHtmlElement
      caption: GenericHtmlElement
      cite: GenericHtmlElement
      code: GenericHtmlElement
      col: EmptyHtmlElement
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
      embed: EmptyHtmlElement
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
      hr: EmptyHtmlElement
      html: GenericHtmlElement
      i: GenericHtmlElement
      iframe: GenericHtmlElement
      img: EmptyHtmlElement
      input: EmptyHtmlElement
      ins: GenericHtmlElement
      kbd: GenericHtmlElement
      keygen: GenericHtmlElement
      label: GenericHtmlElement
      legend: GenericHtmlElement
      li: GenericHtmlElement
      link: EmptyHtmlElement
      main: GenericHtmlElement
      map: GenericHtmlElement
      mark: GenericHtmlElement
      menu: GenericHtmlElement
      menuitem: GenericHtmlElement
      meta: EmptyHtmlElement
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
      param: EmptyHtmlElement
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
      source: EmptyHtmlElement
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
      track: EmptyHtmlElement
      u: GenericHtmlElement
      ul: GenericHtmlElement
      var: GenericHtmlElement
      video: GenericHtmlElement
      wbr: EmptyHtmlElement
      webview: GenericHtmlElement

      // SVG
      svg: GenericHtmlElement

      animate: GenericHtmlElement
      animateMotion: GenericHtmlElement
      animateTransform: GenericHtmlElement
      circle: GenericHtmlElement
      clipPath: GenericHtmlElement
      defs: GenericHtmlElement
      desc: GenericHtmlElement
      ellipse: GenericHtmlElement
      feBlend: GenericHtmlElement
      feColorMatrix: GenericHtmlElement
      feComponentTransfer: GenericHtmlElement
      feComposite: GenericHtmlElement
      feConvolveMatrix: GenericHtmlElement
      feDiffuseLighting: GenericHtmlElement
      feDisplacementMap: GenericHtmlElement
      feDistantLight: GenericHtmlElement
      feDropShadow: GenericHtmlElement
      feFlood: GenericHtmlElement
      feFuncA: GenericHtmlElement
      feFuncB: GenericHtmlElement
      feFuncG: GenericHtmlElement
      feFuncR: GenericHtmlElement
      feGaussianBlur: GenericHtmlElement
      feImage: GenericHtmlElement
      feMerge: GenericHtmlElement
      feMergeNode: GenericHtmlElement
      feMorphology: GenericHtmlElement
      feOffset: GenericHtmlElement
      fePointLight: GenericHtmlElement
      feSpecularLighting: GenericHtmlElement
      feSpotLight: GenericHtmlElement
      feTile: GenericHtmlElement
      feTurbulence: GenericHtmlElement
      filter: GenericHtmlElement
      foreignObject: GenericHtmlElement
      g: GenericHtmlElement
      image: GenericHtmlElement
      line: GenericHtmlElement
      linearGradient: GenericHtmlElement
      marker: GenericHtmlElement
      mask: GenericHtmlElement
      metadata: GenericHtmlElement
      mpath: GenericHtmlElement
      path: GenericHtmlElement
      pattern: GenericHtmlElement
      polygon: GenericHtmlElement
      polyline: GenericHtmlElement
      radialGradient: GenericHtmlElement
      rect: GenericHtmlElement
      stop: GenericHtmlElement
      switch: GenericHtmlElement
      symbol: GenericHtmlElement
      text: GenericHtmlElement
      textPath: GenericHtmlElement
      tspan: GenericHtmlElement
      use: GenericHtmlElement
      view: GenericHtmlElement
    }
  }
}
