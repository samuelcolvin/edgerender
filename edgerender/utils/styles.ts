import * as CSS from 'csstype'

export function render_styles(styles: CSS.Properties): string | null {
  let serialized = ''
  let delimiter = ''
  for (const [name, value] of Object.entries(styles)) {
    const is_custom_property = name.indexOf('--') == 0
    if (value != null) {
      serialized +=
        delimiter +
        (is_custom_property ? name : get_style_name(name)) +
        ':' +
        get_style_value(name, value, is_custom_property)

      delimiter = ';'
    }
  }
  return serialized || null
}

const uppercase_pattern = /([A-Z])/g
const ms_pattern = /^ms-/
const style_name_cache: Record<string, string> = {}

export const hyphenate = (name: string): string => name.replace(uppercase_pattern, '-$1').toLowerCase()

function get_style_name(name: string): string {
  // from https://github.com/facebook/react/blob/master/packages/react-dom/src/server/ReactPartialRenderer.js
  // (processStyleName) and
  // https://github.com/facebook/react/blob/master/packages/react-dom/src/shared/hyphenateStyleName.js
  const cached_value = style_name_cache[name] as string | undefined
  if (typeof cached_value == 'string') {
    return cached_value
  } else {
    return (style_name_cache[name] = hyphenate(name).replace(ms_pattern, '-ms-'))
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
