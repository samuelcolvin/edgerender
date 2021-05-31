import render_page from '../src/page'
import makeServiceWorkerEnv from 'service-worker-mock'

declare const global: any

describe('page', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv())
    jest.resetModules()
  })

  test('render_page', async () => {
    const result = await render_page()
    console.log('result:', JSON.stringify(result, null, 2))
  })
})
