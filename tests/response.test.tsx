import {makeEdgeEnv} from 'edge-mock'
import {EdgeRender} from 'edgerender'
import {HttpError, Redirect} from 'edgerender/response'

let warnings: string[] = []

describe('response', () => {
  beforeEach(() => {
    makeEdgeEnv()
    warnings = []
    console.warn = (...args) => {
      warnings.push(args.join(' '))
    }
    jest.resetModules()
  })

  test('throw-HttpError', async () => {
    const router = new EdgeRender({
      views: {
        '/foo/': () => {
          throw new HttpError(422, 'This is wrong')
        },
      },
    })
    const event = new FetchEvent('fetch', {request: new Request('/foo/', {method: 'GET'})})
    const response = await router.handle(event)
    expect(response.status).toEqual(422)
    const text = await response.text()
    expect(text).toEqual('422: This is wrong')
    expect(warnings).toStrictEqual(['HTTP Error 422: This is wrong'])
  })

  test('return-HttpError', async () => {
    const router = new EdgeRender({
      views: {
        '/foo/': () => new HttpError(422, 'This is wrong'),
      },
    })
    const event = new FetchEvent('fetch', {request: new Request('/foo/', {method: 'GET'})})
    const response = await router.handle(event)
    expect(response.status).toEqual(422)
    const text = await response.text()
    expect(text).toEqual('422: This is wrong')
    expect(warnings).toStrictEqual([])
  })

  test('redirect-full-path', async () => {
    const router = new EdgeRender({
      views: {
        '/foo/': () => {
          throw new Redirect('/bar/')
        },
      },
    })
    const event = new FetchEvent('fetch', {request: new Request('/foo/', {method: 'GET'})})
    const response = await router.handle(event)
    expect(response.status).toEqual(307)
    expect(response.headers.get('Location')).toEqual('https://example.com/bar/')
    const text = await response.text()
    expect(text).toEqual('307: Redirecting to "/bar/"')
  })

  test('redirect-relative', async () => {
    const router = new EdgeRender({
      views: {
        '/foo/': () => {
          throw new Redirect('.bar/', 301)
        },
      },
    })
    const event = new FetchEvent('fetch', {request: new Request('/foo/', {method: 'GET'})})
    const response = await router.handle(event)
    expect(response.status).toEqual(301)
    expect(response.headers.get('Location')).toEqual('https://example.com/foo/bar/')
    expect(await response.text()).toEqual('301: Redirecting to ".bar/"')
  })

  test('redirect-relative-double', async () => {
    const router = new EdgeRender({
      views: {
        '/foo/': () => {
          throw new Redirect('./bar/', 302)
        },
      },
    })
    const event = new FetchEvent('fetch', {request: new Request('/foo/', {method: 'GET'})})
    const response = await router.handle(event)
    expect(response.status).toEqual(302)
    expect(response.headers.get('Location')).toEqual('https://example.com/foo/bar/')
  })

  test('redirect-relative-bare', async () => {
    const router = new EdgeRender({
      views: {
        '/foo/': () => new Redirect('bar/', 303, 'foobar'),
      },
    })
    const event = new FetchEvent('fetch', {request: new Request('/foo/', {method: 'GET'})})
    const response = await router.handle(event)
    expect(response.status).toEqual(303)
    expect(response.headers.get('Location')).toEqual('https://example.com/foo/bar/')
    expect(await response.text()).toEqual('303: foobar')
  })

  test('redirect-full', async () => {
    const router = new EdgeRender({
      views: {
        '/foo/': () => {
          throw new Redirect('http://example.org/spam/')
        },
      },
    })
    const event = new FetchEvent('fetch', {request: new Request('/foo/', {method: 'GET'})})
    const response = await router.handle(event)
    expect(response.status).toEqual(307)
    expect(response.headers.get('Location')).toEqual('http://example.org/spam/')
    expect(await response.text()).toEqual('307: Redirecting to "http://example.org/spam/"')
  })
})
