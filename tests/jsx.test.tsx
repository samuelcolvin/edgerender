import each from 'jest-each'
import {Component, JsxChunk} from 'edgerender/render'
import {render_jsx} from 'edgerender'

describe('jsx', () => {
  test('render', async () => {
    const Foobar = ({foo}: {foo: number}) => <div>{foo * 2}</div>
    const result = Foobar({foo: 4})
    expect(result).toBeInstanceOf(JsxChunk)
    expect(result.toString()).toEqual('JsxElement(div, {"children":8})')
    const text = await render_jsx(result)
    expect(text).toEqual('<div>8</div>')
  })
})

interface ComponentTest {
  component: Component
  args?: Record<string, any>
  expected: string
}

const components: ComponentTest[] = [
  {
    component: () => <>this is a fragment</>,
    expected: 'this is a fragment',
  },
  {
    component: () => <div style={{maxWidth: '100px', height: 0}} />,
    expected: '<div style="max-width:100px;height:0"></div>',
  },
  {
    component: ({name}) => <div>{name}</div>,
    args: {name: '<b>new</b>'},
    expected: '<div>&lt;b&gt;new&lt;/b&gt;</div>',
  },
  {
    component: () => <input className="foo bar" />,
    expected: '<input class="foo bar">',
  },
  {
    component: () => <input className={['foo', false, 'bar', null]} />,
    expected: '<input class="foo bar">',
  },
  {
    component: () => <input className={{foo: true, spam: false, bar: 1}} />,
    expected: '<input class="foo bar">',
  },
]

describe('render_jsx', () => {
  each(components).test('components %j', async ({component, args, expected}) => {
    const text = await render_jsx(component(args))
    // console.log('text:', text)
    expect(text).toEqual(expected)
  })
})
