import type {Sentry} from './sentry'
import {smart_typeof} from './utils'

export function addCspHeader(headers: Record<string, string>, csp_rules: CspRules, sentry?: Sentry) {
  if (!csp_rules.report_uri && sentry) {
    const {key, server, app} = sentry
    csp_rules.report_uri = `https://${server}.ingest.sentry.io/api/${app}/security/?sentry_key=${key}`
  }

  headers['content-security-policy'] = Object.entries(csp_rules).map(directiveAsString).filter(v => v).join(' ')
}

function directiveAsString([k, v]: [k: string, v: string | string[] | boolean]): string | undefined {
  const name = k.replace(/_/g, '-')
  if (typeof v == 'string') {
    return `${name} ${v};`
  } else if (typeof v == 'boolean') {
    if (v) {
      return `${name};`
    }
  } else {
    if (!Array.isArray(v)) {
      throw new TypeError(`CSP ${name}: Invalid directive value type ${smart_typeof(v)}`)
    } else if (v.length > 0) {
      return `${name} ${v.join(' ')};`
    }
  }
}

export interface CspRules {
  default_src?: string | string[]
  connect_src?: string | string[]
  child_src?: string | string[]
  font_src?: string | string[]
  frame_src?: string | string[]
  img_src?: string | string[]
  manifest_src?: string | string[]
  media_src?: string | string[]
  object_src?: string | string[]
  prefetch_src?: string | string[]
  script_src?: string | string[]
  script_src_attr?: string | string[]
  style_src?: string | string[]
  style_src_attr?: string | string[]
  worker_src?: string | string[]

  base_uri?: string | string[]
  form_action?: string | string[]
  frame_ancestors?: string | string[]
  navigate_to?: string | string[]

  require_trusted_types_for?: 'script'
  trusted_types?: string | string[]
  sandbox?: boolean | string | string[]

  upgrade_insecure_requests?: boolean

  report_uri?: string | string[]
  // TODO report_to is not yet supported
}
