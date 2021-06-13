import Sentry from 'edgerender/sentry'
import {makeEdgeEnv, EdgeFetchEvent} from 'edge-mock'

describe('sentry', () => {
  beforeEach(() => {
    makeEdgeEnv()
    jest.resetModules()
  })

  test('captureException', async () => {
    const sentry = new Sentry('https://foo@bar.ingest.sentry.io/spam', undefined)

    const request = new Request('/', {headers: {accept: '*/*', foo: 'bar'}})
    const event = new EdgeFetchEvent('fetch', {request})
    const error = new Error('broken')
    sentry.captureException(event, error)
    expect(event._wait_until_promises.length).toEqual(1)
    const promise = event._wait_until_promises[0]
    const response = await promise
    expect(response.url).toMatch(/^https:\/\/sentry\.io\/api\/spam\/store\/\?/)
    const body = JSON.parse(response._extra.init.body)
    expect(body.level).toEqual('error')
    expect(body.message).toEqual('Error: broken')
    expect(body.request).toStrictEqual({
      url: 'https://example.com/',
      method: 'GET',
      headers: {accept: '*/*', foo: 'bar'},
    })
  })
})
