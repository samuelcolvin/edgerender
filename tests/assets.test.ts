import makeServiceWorkerEnv from 'service-worker-mock'
import {Router, Views} from 'edgerender'
import {HttpError, MimeTypes} from 'edgerender/response'
import {AssetConfig} from 'edgerender/assets'

import {MockKvNamespace, mock_fetch} from './mock'

declare const global: any

const manifest = {
  'foobar.png': 'foobar_png',
  'favicon.ico': 'favicon_ico',
  'thing.not-known-type': 'splat',
  'not-in-kv.png': 'not_in_kv_png',
}

const kv_namespace = new MockKvNamespace()
const assets: AssetConfig = {
  kv_namespace: kv_namespace.as_kv_namespace(),
  content_manifest: JSON.stringify(manifest),
}

const views: Views = {
  '/': () => ({body: 'index', mime_type: MimeTypes.plaintext}),
  '/cache-proxy': ({request, assets}) => assets.cached_proxy(request, 'https://example.com/'),
}
const router = new Router({views, assets})
let warnings: any[] = []

describe('handle', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    global.fetch = mock_fetch
    warnings = []
    kv_namespace.set_keys({
      foobar_png: {value: 'this is foobar.png'},
      favicon_ico: {value: 'this is favicon.ico'},
      splat: {value: 'splat'},
    })
    console.warn = (...args) => {
      warnings.push(args)
    }
    jest.resetModules()
  })

  test('foobar.png', async () => {
    const event = new FetchEvent('fetch', {request: new Request('/assets/foobar.png')})
    const response = await router.handle(event)
    expect(response.status).toEqual(200)
    const text = await response.text()
    expect(text).toEqual('this is foobar.png')
    expect(response.headers.get('content-type')).toEqual('image/png')
  })

  test('favicon.ico', async () => {
    const event = new FetchEvent('fetch', {request: new Request('/assets/favicon.ico')})
    const response = await router.handle(event)
    expect(response.status).toEqual(200)
    const text = await response.text()
    expect(text).toEqual('this is favicon.ico')
    expect(response.headers.get('content-type')).toEqual('image/vnd.microsoft.icon')
  })

  test('thing.not-known-type', async () => {
    const event = new FetchEvent('fetch', {request: new Request('/assets/thing.not-known-type')})
    const response = await router.handle(event)
    expect(response.status).toEqual(200)
    const text = await response.text()
    expect(text).toEqual('splat')
    expect(response.headers.get('content-type')).toEqual('application/octet-stream')
  })

  test('cache_proxy', async () => {
    const event = new FetchEvent('fetch', {request: new Request('/cache-proxy')})
    const response = await router.handle(event)
    expect(response.status).toEqual(200)
    expect(response.headers.get('content-type')).toEqual('text/html')
    const text = await response.text()
    expect(text).toEqual('<h1>response to example.com</h1>')

    const event2 = new FetchEvent('fetch', {request: new Request('/cache-proxy')})
    const response2 = await router.handle(event2)
    expect(response2.status).toEqual(200)
    expect(response2.headers.get('content-type')).toEqual('text/html')
    expect(await response2.text()).toEqual('<h1>response to example.com</h1>')
  })

  test('no-kv_namespace', async () => {
    const assets: AssetConfig = {content_manifest: JSON.stringify(manifest)}

    const views: Views = {'/': () => ({body: 'index', mime_type: MimeTypes.plaintext})}
    const router = new Router({views, assets})

    const event = new FetchEvent('fetch', {request: new Request('/assets/favicon.ico')})
    const response = await router.handle(event)
    expect(response.status).toEqual(404)
    expect(await response.text()).toEqual('404: static asset "/assets/favicon.ico" not found')
    expect(warnings).toStrictEqual([
      ['KV namespace not defined, static assets not available'],
      ['HTTP Error 404: static asset "/assets/favicon.ico" not found'],
    ])
  })

  test('no-kv_namespace-cached_proxy', async () => {
    const assets: AssetConfig = {content_manifest: JSON.stringify(manifest)}

    const views: Views = {'/': () => ({body: 'index', mime_type: MimeTypes.plaintext})}
    const router = new Router({views, assets})

    await expect(router.assets.cached_proxy(new Request('/'), 'https://example.com')).rejects.toThrow(
      'KV namespace not defined, static assets not available',
    )
  })

  test('cached_proxy', async () => {
    const r1 = await router.assets.cached_proxy(new Request('/'), 'https://example.com/')
    expect(r1.status).toEqual(undefined)
    expect(r1.body).toEqual('<h1>response to example.com</h1>')
    expect(r1.mime_type).toEqual('text/html')

    await expect(router.assets.cached_proxy(new Request('/'), 'https://missing.com/')).rejects.toThrow(
      new HttpError(502, 'Error getting "https://missing.com/", upstream response: 404'),
    )
  })

  test('not-in-kv.png', async () => {
    const errors: any[] = []
    console.error = (...args) => {
      errors.push(args)
    }
    const event = new FetchEvent('fetch', {request: new Request('/assets/not-in-kv.png')})
    const response = await router.handle(event)
    expect(response.status).toEqual(404)
    expect(await response.text()).toEqual('404: static asset "/assets/not-in-kv.png" not found')
    expect(warnings).toStrictEqual([['HTTP Error 404: static asset "/assets/not-in-kv.png" not found']])
    expect(errors).toStrictEqual([
      ['content_key "not_in_kv_png" found for asset_path "/assets/not-in-kv.png", but no value in the KV store'],
    ])
  })
})
