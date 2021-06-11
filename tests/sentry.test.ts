import makeServiceWorkerEnv from 'service-worker-mock'
import Sentry from 'edgerender/sentry'
import {mock_fetch} from './mock'

declare const global: any

describe('sentry', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    global.fetch = mock_fetch
    jest.resetModules()
  })

  test('captureException', async () => {
    const sentry = new Sentry('https://foo@bar.ingest.sentry.io/spam', undefined)

    let promises: any[] = []
    const event = {
      waitUntil: (p: any): void => {
        promises.push(p)
      },
      request: new Request('/', {headers: {accept: '*/*', foo: 'bar'}}),
    }
    const error = new Error('broken')
    sentry.captureException(event as any, error)
    expect(promises.length).toEqual(1)
    const promise = promises[0]
    const response = await promise
    expect(response._request.url).toMatch(/^https:\/\/sentry\.io\/api\/spam\/store\/\?/)
    const body = JSON.parse(response._request.body)
    expect(body.level).toEqual('error')
    expect(body.message).toEqual('Error: broken')
    expect(body.request).toStrictEqual({
      url: 'https://www.test.com/',
      method: 'GET',
      headers: {accept: '*/*', foo: 'bar'},
    })
  })
})
