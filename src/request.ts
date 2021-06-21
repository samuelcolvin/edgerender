import {escape_regex} from './utils'
import type {View, ViewFunction} from './handle'

const MethodStrings = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const
export type Method = typeof MethodStrings[number]

export interface PathView {
  path: RegExp | string
  allow: Set<Method>
  view: ViewFunction
}

export const clean_path = (pathname: string): string => pathname.replace(/\/+$/, '') || '/'

export function as_path_view([key, view]: [string, View | ViewFunction]): PathView {
  if (typeof view == 'function') {
    view = {view}
  }

  let allow: Set<Method>
  if (view.allow == undefined) {
    allow = new Set(['GET'])
  } else if (typeof view.allow == 'string') {
    allow = new Set([view.allow])
  } else {
    allow = new Set(view.allow)
  }

  const invalid = [...allow].filter(m => !MethodStrings.includes(m))
  if (invalid.length) {
    throw new Error(`${invalid.join(', ')} is not a valid method, should be: ${MethodStrings.join(', ')}`)
  }

  return {path: parse_path(key), view: view.view, allow}
}

const group_regex = /{(\w+)(?::(.+?))?}([^{]*)/g

function parse_path(path: string): string | RegExp {
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  if (!path.includes('{')) {
    if (path.includes('}')) {
      throw new Error(`invalid path "${path}", "}" with no matching start "{"`)
    } else {
      return clean_path(path)
    }
  }

  let regex_str = ''
  let first = true
  let last_ended = 0
  for (const m of path.matchAll(group_regex)) {
    if (first) {
      regex_str += escape_regex(path.substr(0, m.index))
      first = false
    }
    regex_str += `(?<${m[1]}>${make_regex(m[2])})${escape_regex(m[3])}`
    last_ended = (m.index || 0) + m[0].length
  }
  if (last_ended != path.length) {
    throw new Error(`invalid path, match expression "${path}" can't be interpreted`)
  }
  regex_str = `^${clean_path(regex_str)}$`
  return new RegExp(regex_str)
}

const word_regex = '[\\w\\-]+'

function make_regex(group: string | undefined): string {
  if (!group || group == 'word') {
    return word_regex
  } else if (group == 'int') {
    return '\\d+'
  } else {
    return group
  }
}
