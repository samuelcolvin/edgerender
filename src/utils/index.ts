export const enum SmartType {
  Null = 'Null',
  Undefined = 'Undefined',
  Number = 'Number',
  Boolean = 'Boolean',
  Date = 'Date',
  RegExp = 'RegExp',
  String = 'String',
  Array = 'Array',
  Object = 'Object',
  Function = 'Function',
  Promise = 'Promise',
  JsxChunk = 'JsxChunk',
  Fragment = 'Fragment',
  RawHtml = 'RawHtml',
}

export const smart_typeof = (obj: any): SmartType => {
  /**
   * Helper to get the type of object, including classes
   */
  if (obj === null) {
    return SmartType.Null
  } else if (obj === undefined) {
    return SmartType.Undefined
  } else {
    return Object.getPrototypeOf(obj).constructor.name as SmartType
  }
}

/*
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 * $& means the whole matched string
 */
export const escape_regex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
