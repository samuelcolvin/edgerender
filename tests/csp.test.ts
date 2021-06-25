import {makeEdgeEnv} from 'edge-mock'
import {EdgeRender, Views} from 'edgerender'
import {MimeTypes} from 'edgerender/response'
import {CspRules} from 'edgerender/csp'

const views: Views = {
  '/': () => ({body: 'index', mime_type: MimeTypes.plaintext}),
}
const warnings: any[][] = []

describe('CSP', () => {
  beforeEach(() => {
    makeEdgeEnv()
    warnings.length = 0
    console.warn = (...args) => {
      warnings.push(args)
    }
    jest.resetModules()
  })

  test('simple', async () => {
    const csp: CspRules = {'default-src': ["'self'"], 'frame-src': ["'self'", 'foobar.com']}
    const router = new EdgeRender({views, csp})
    const event = new FetchEvent('fetch', {request: new Request('/')})
    const response = await router.handle(event)
    expect(response.status).toEqual(200)
    const csp_header = response.headers.get('content-security-policy')
    expect(csp_header).toEqual("default-src 'self'; frame-src 'self' foobar.com;")
  })

  test('with-sentry', async () => {
    const csp: CspRules = {'default-src': ["'self'"], 'frame-src': ["'self'", 'foobar.com']}
    const router = new EdgeRender({views, csp, sentry_dsn: 'https://123abc@123456.ingest.sentry.io/654321'})
    const event = new FetchEvent('fetch', {request: new Request('/')})
    const response = await router.handle(event)
    expect(response.status).toEqual(200)
    expect(response.headers.get('content-security-policy')).toEqual(
      "default-src 'self'; frame-src 'self' foobar.com; " +
      "report-uri https://123456.ingest.sentry.io/api/654321/security/?sentry_key=123abc;"
    )
    expect(warnings).toStrictEqual([])
  })

  test('with-invalid-sentry', async () => {
    const csp: CspRules = {'default-src': ["'self'"]}
    const router = new EdgeRender({views, csp, sentry_dsn: 'foobar'})
    const event = new FetchEvent('fetch', {request: new Request('/')})
    const response = await router.handle(event)
    expect(response.status).toEqual(200)
    const csp_header = response.headers.get('content-security-policy')
    expect(csp_header).toEqual("default-src 'self';")
    expect(warnings).toStrictEqual([['invalid sentry DSN', 'foobar']])
  })
})
