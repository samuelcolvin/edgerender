import type {Properties as CssProperties} from 'csstype'
export {EdgeRender, EdgeRenderConfig, Views} from './handle'
export {AssetConfig} from './assets'
import {JsxChunk, classNameType} from './jsx'

type AttributeReferrerPolicy =
  | ''
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url'

type InputType =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week'

declare global {
  namespace JSX {
    type Props = Record<string, any>
    type Component = (props: Props) => Element
    type ChildTypes = Component | HtmlTag | string | number | boolean

    type Element = JsxChunk | Promise<JsxChunk>

    interface TagChildrenAttribute {
      children: unknown
    }

    interface BaseTag {
      // Standard HTML Attributes
      accessKey?: string
      className?: classNameType
      contentEditable?: boolean | 'inherit'
      contextMenu?: string
      dir?: string
      draggable?: boolean
      hidden?: boolean
      id?: string
      lang?: string
      placeholder?: string
      slot?: string
      spellCheck?: boolean
      style?: CssProperties
      tabIndex?: number
      title?: string
      translate?: 'yes' | 'no'

      // Unknown
      radioGroup?: string // <command>, <menuitem>

      // WAI-ARIA
      role?: string

      // RDFa Attributes
      about?: string
      datatype?: string
      inlist?: any
      prefix?: string
      property?: string
      resource?: string
      typeof?: string
      vocab?: string

      // Non-standard Attributes
      autoCapitalize?: string
      autoCorrect?: string
      autoSave?: string
      color?: string
      itemProp?: string
      itemScope?: boolean
      itemType?: string
      itemID?: string
      itemRef?: string
      results?: number
      security?: string
      unselectable?: 'on' | 'off'

      // Living Standard
      /**
       * Hints at the type of data that might be entered by the user while editing the Tag or its contents
       * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
       */
      inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
      /**
       * Specify that a standard HTML Tag should behave like a defined custom built-in Tag
       * @see https://html.spec.whatwg.org/multipage/custom-Tags.html#attr-is
       */
      is?: string

      data?: Record<string, any>

      // htmx attributes https://htmx.org/docs/#ajax
      hxGet?: string
      hxPost?: string
      hxPut?: string
      hxPatch?: string
      hxDelete?: string

      hxSwap?: 'innerHTML' | 'outerHTML' | 'afterbegin' | 'beforebegin' | 'beforeend' | 'afterend'
      hxSwapOob?: boolean
      hxTarget?: string
      hxTrigger?: string
      hxSelect?: string
      hxBoost?: boolean
      hxPushUrl?: 'true'
      hxPrompt?: string
      hxConfirm?: string
      hxIndicator?: string
    }

    interface GenericTag extends BaseTag {
      children?: ChildTypes | ChildTypes[]
      [key: string]: any
    }

    // html tag with no children e.g. used like <foo .../> not <foo...>...</foo>
    interface EmptyTag extends BaseTag {
      children?: never
      [key: string]: any
    }

    interface AnchorTag extends BaseTag {
      download?: any
      href?: string
      hrefLang?: string
      media?: string
      ping?: string
      rel?: string
      target?: string
      type?: string
      referrerPolicy?: AttributeReferrerPolicy

      children?: ChildTypes | ChildTypes[]
    }

    interface ButtonTag extends BaseTag {
      autoFocus?: boolean
      disabled?: boolean
      form?: string
      formAction?: string
      formEncType?: string
      formMethod?: string
      formNoValidate?: boolean
      formTarget?: string
      name?: string
      type?: 'submit' | 'reset' | 'button'
      value?: string | ReadonlyArray<string> | number

      children?: ChildTypes | ChildTypes[]
    }

    interface FormTag extends BaseTag {
      acceptCharset?: string
      action?: string
      autoComplete?: string
      encType?: string
      method?: string
      name?: string
      noValidate?: boolean
      target?: string

      children?: ChildTypes | ChildTypes[]
    }

    interface HtmlHtmlTag extends BaseTag {
      manifest?: string

      children?: ChildTypes | ChildTypes[]
    }

    interface IframeTag extends BaseTag {
      allow?: string
      allowFullScreen?: boolean
      allowTransparency?: boolean
      /** @deprecated */
      frameBorder?: number | string
      height?: number | string
      loading?: 'eager' | 'lazy'
      /** @deprecated */
      marginHeight?: number
      /** @deprecated */
      marginWidth?: number
      name?: string
      referrerPolicy?: AttributeReferrerPolicy
      sandbox?: string
      /** @deprecated */
      scrolling?: string
      seamless?: boolean
      src?: string
      srcDoc?: string
      width?: number | string

      children?: ChildTypes | ChildTypes[]
    }

    interface ImageTag extends BaseTag {
      alt?: string
      crossOrigin?: 'anonymous' | 'use-credentials' | ''
      decoding?: 'async' | 'auto' | 'sync'
      height?: number | string
      loading?: 'eager' | 'lazy'
      referrerPolicy?: AttributeReferrerPolicy
      sizes?: string
      src?: string
      srcSet?: string
      useMap?: string
      width?: number | string
    }

    interface InputTag extends BaseTag {
      accept?: string
      alt?: string
      autoComplete?: string
      autoFocus?: boolean
      capture?: boolean | string // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
      checked?: boolean
      dirname?: string
      disabled?: boolean
      enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
      form?: string
      formAction?: string
      formEncType?: string
      formMethod?: string
      formNoValidate?: boolean
      formTarget?: string
      height?: number | string
      list?: string
      max?: number | string
      maxLength?: number
      min?: number | string
      minLength?: number
      multiple?: boolean
      name?: string
      pattern?: string
      placeholder?: string
      readOnly?: boolean
      required?: boolean
      size?: number
      src?: string
      step?: number | string
      type?: InputType
      value?: string | ReadonlyArray<string> | number
      width?: number | string
    }

    interface LabelTag extends BaseTag {
      form?: string
      htmlFor?: string

      children?: ChildTypes | ChildTypes[]
    }

    interface LinkTag extends BaseTag {
      as?: string
      crossOrigin?: string
      href?: string
      hrefLang?: string
      integrity?: string
      media?: string
      referrerPolicy?: AttributeReferrerPolicy
      rel?: string
      sizes?: string
      type?: string
      charSet?: string
    }

    interface MetaTag extends BaseTag {
      charSet?: string
      content?: string
      httpEquiv?: string
      name?: string
    }

    type HtmlTag =
      | GenericTag
      | EmptyTag
      | AnchorTag
      | ButtonTag
      | FormTag
      | HtmlHtmlTag
      | IframeTag
      | ImageTag
      | InputTag
      | LabelTag
      | LinkTag
      | MetaTag

    interface IntrinsicElements {
      a: AnchorTag
      abbr: GenericTag
      address: GenericTag
      area: EmptyTag
      article: GenericTag
      aside: GenericTag
      audio: GenericTag
      b: GenericTag
      base: EmptyTag
      bdi: GenericTag
      bdo: GenericTag
      big: GenericTag
      blockquote: GenericTag
      body: GenericTag
      br: EmptyTag
      button: ButtonTag
      canvas: GenericTag
      caption: GenericTag
      cite: GenericTag
      code: GenericTag
      col: EmptyTag
      colgroup: GenericTag
      data: GenericTag
      datalist: GenericTag
      dd: GenericTag
      del: GenericTag
      details: GenericTag
      dfn: GenericTag
      dialog: GenericTag
      div: GenericTag
      dl: GenericTag
      dt: GenericTag
      em: GenericTag
      embed: EmptyTag
      fieldset: GenericTag
      figcaption: GenericTag
      figure: GenericTag
      footer: GenericTag
      form: FormTag
      h1: GenericTag
      h2: GenericTag
      h3: GenericTag
      h4: GenericTag
      h5: GenericTag
      h6: GenericTag
      head: GenericTag
      header: GenericTag
      hgroup: GenericTag
      hr: EmptyTag
      html: HtmlHtmlTag
      i: GenericTag
      iframe: IframeTag
      img: ImageTag
      input: InputTag
      ins: GenericTag
      kbd: GenericTag
      keygen: GenericTag
      label: LabelTag
      legend: GenericTag
      li: GenericTag
      link: LinkTag
      main: GenericTag
      map: GenericTag
      mark: GenericTag
      menu: GenericTag
      menuitem: GenericTag
      meta: MetaTag
      meter: GenericTag
      nav: GenericTag
      noindex: GenericTag
      noscript: GenericTag
      object: GenericTag
      ol: GenericTag
      optgroup: GenericTag
      option: GenericTag
      output: GenericTag
      p: GenericTag
      param: EmptyTag
      picture: GenericTag
      pre: GenericTag
      progress: GenericTag
      q: GenericTag
      rp: GenericTag
      rt: GenericTag
      ruby: GenericTag
      s: GenericTag
      samp: GenericTag
      slot: GenericTag
      script: GenericTag
      section: GenericTag
      select: GenericTag
      small: GenericTag
      source: EmptyTag
      span: GenericTag
      strong: GenericTag
      style: GenericTag
      sub: GenericTag
      summary: GenericTag
      sup: GenericTag
      table: GenericTag
      template: GenericTag
      tbody: GenericTag
      td: GenericTag
      textarea: GenericTag
      tfoot: GenericTag
      th: GenericTag
      thead: GenericTag
      time: GenericTag
      title: GenericTag
      tr: GenericTag
      track: EmptyTag
      u: GenericTag
      ul: GenericTag
      var: GenericTag
      video: GenericTag
      wbr: EmptyTag
      webview: GenericTag

      // SVG
      svg: GenericTag

      animate: GenericTag
      animateMotion: GenericTag
      animateTransform: GenericTag
      circle: GenericTag
      clipPath: GenericTag
      defs: GenericTag
      desc: GenericTag
      ellipse: GenericTag
      feBlend: GenericTag
      feColorMatrix: GenericTag
      feComponentTransfer: GenericTag
      feComposite: GenericTag
      feConvolveMatrix: GenericTag
      feDiffuseLighting: GenericTag
      feDisplacementMap: GenericTag
      feDistantLight: GenericTag
      feDropShadow: GenericTag
      feFlood: GenericTag
      feFuncA: GenericTag
      feFuncB: GenericTag
      feFuncG: GenericTag
      feFuncR: GenericTag
      feGaussianBlur: GenericTag
      feImage: GenericTag
      feMerge: GenericTag
      feMergeNode: GenericTag
      feMorphology: GenericTag
      feOffset: GenericTag
      fePointLight: GenericTag
      feSpecularLighting: GenericTag
      feSpotLight: GenericTag
      feTile: GenericTag
      feTurbulence: GenericTag
      filter: GenericTag
      foreignObject: GenericTag
      g: GenericTag
      image: GenericTag
      line: GenericTag
      linearGradient: GenericTag
      marker: GenericTag
      mask: GenericTag
      metadata: GenericTag
      mpath: GenericTag
      path: GenericTag
      pattern: GenericTag
      polygon: GenericTag
      polyline: GenericTag
      radialGradient: GenericTag
      rect: GenericTag
      stop: GenericTag
      switch: GenericTag
      symbol: GenericTag
      text: GenericTag
      textPath: GenericTag
      tspan: GenericTag
      use: GenericTag
      view: GenericTag
    }
  }
}
