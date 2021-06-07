import {router} from '../test-worker'
import makeServiceWorkerEnv from 'service-worker-mock'

declare const global: any

describe('handle', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    jest.resetModules()
  })

  test('handle GET', async () => {
    const request = new Request('/', {method: 'GET'})
    const event = new FetchEvent('fetch', {request})
    const response = await router.handle(event)
    expect(response.status).toEqual(200)
    // const text = await result.text()
    // expect(text).toEqual('request method: GET')
  })
})
