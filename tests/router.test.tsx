import makeServiceWorkerEnv from 'service-worker-mock'
import {Router, Views} from 'edgerender'
import {json_response} from 'edgerender/response'

declare const global: any

let warnings: any[] = []

const views: Views = {
  '/': () => (
    <html lang="en">
      <head>
        <title>testing</title>
        <meta name="description" content="this is a test" />
      </head>
      <body>
        <h1>Testing</h1>
      </body>
    </html>
  ),
  '/path/{id:int}/': ({match}) => json_response({match}),
}
const router = new Router({views})

describe('handle', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    warnings = []
    console.warn = (...args) => {
      warnings.push(args)
    }
    jest.resetModules()
  })

  test('index', async () => {
    const request = new Request('/', {method: 'GET'})
    const event = new FetchEvent('fetch', {request})
    const response = await router.handle(event)
    expect(response.status).toEqual(200)
    const text = await response.text()
    expect(text).toMatch(/^<!doctype html>\n/)
    // console.log('response: %o', text)
  })

  test('path', async () => {
    const event = new FetchEvent('fetch', {request: new Request('/path/123')})
    const response = await router.handle(event)
    expect(response.status).toEqual(200)
    expect(response.headers.get('content-type')).toEqual('application/json')
    const json_obj = await response.json()
    expect(json_obj).toStrictEqual({match: {id: '123'}})
  })

  test('path', async () => {
    const event = new FetchEvent('fetch', {request: new Request('/path/123/')})
    const response = await router.handle(event)
    expect(response.status).toEqual(200)
    const json_obj = await response.json()
    expect(json_obj).toStrictEqual({match: {id: '123'}})
  })

  test('404', async () => {
    const event = new FetchEvent('fetch', {request: new Request('/missing/')})
    const response = await router.handle(event)
    expect(response.status).toEqual(404)
    const text = await response.text()
    expect(text).toEqual('404: Page not found for "/missing/"')
    expect(response.headers.get('content-type')).toEqual('text/plain')
    expect(warnings).toStrictEqual([['HTTP Error 404: Page not found for "/missing/"']])
  })

  test('assets-404', async () => {
    const request = new Request('/assets/foobar.png')
    const event = new FetchEvent('fetch', {request})
    const response = await router.handle(event)
    expect(response.status).toEqual(404)
    const text = await response.text()
    expect(text).toEqual('404: static asset "/assets/foobar.png" not found')
    expect(response.headers.get('content-type')).toEqual('text/plain')
    expect(warnings).toStrictEqual([['HTTP Error 404: static asset "/assets/foobar.png" not found']])
  })
})
