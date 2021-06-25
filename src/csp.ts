import type {Sentry} from './sentry'

export interface CspRules {
  'default-src'?: string[]
  'script-src'?: string[]
  'frame-src'?: string[]
  'font-src'?: string[]
  'style-src'?: string[]
  'img-src'?: string[]
  'media-src'?: string[]
  'connect-src'?: string[]
  'report-uri'?: string[]
}

export function addCspHeader(headers: Record<string, string>, csp_rules: CspRules, sentry?: Sentry) {
  if (!csp_rules['report-uri'] && sentry) {
    const {key, server, app} = sentry
    csp_rules['report-uri'] = [`https://${server}.ingest.sentry.io/api/${app}/security/?sentry_key=${key}`]
  }

  headers['content-security-policy'] = Object.entries(csp_rules).map(([k, v]) => `${k} ${v.join(' ')};`).join(' ')
}
