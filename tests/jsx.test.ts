import {Foobar} from './worker/page'
import {JsxChunk} from '../edgerender/render'
import {render_jsx} from '../edgerender'

describe('jsx', () => {
  test('simple-render', async () => {
    const result = Foobar({foo: 4})
    expect(result).toBeInstanceOf(JsxChunk)
    const text = await render_jsx(result)
    expect(text).toEqual('<div>8</div>')
  })
})
