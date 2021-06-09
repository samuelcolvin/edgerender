import each from 'jest-each'
import {Component, JsxChunk} from 'edgerender/render'
import {render_jsx, raw_html, CustomTag} from 'edgerender'

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
  {
    component: ({thing}) => <div id="123">{raw_html(thing)}</div>,
    args: {thing: '<b>new</b>'},
    expected: '<div id="123"><b>new</b></div>',
  },
  {
    component: () => (
      <div>
        {['a', 'b', 'c'].map(v => (
          <span>{v}</span>
        ))}
      </div>
    ),
    expected: '<div><span>a</span><span>b</span><span>c</span></div>',
  },
  {
    component: () => <label htmlFor="foobar">xxx</label>,
    expected: '<label for="foobar">xxx</label>',
  },
  {
    component: () => <textarea required={true}>boolean</textarea>,
    expected: '<textarea required>boolean</textarea>',
  },
  {
    component: () => <textarea required={false}>boolean</textarea>,
    expected: '<textarea>boolean</textarea>',
  },
  {
    component: () => (
      <span id={raw_html('"thing"') as any} hxGet="foobar">
        thing
      </span>
    ),
    expected: `<span id='"thing"' hx-get="foobar">thing</span>`,
  },
  {
    component: () => <input value={{foo: 'bar'} as any} />,
    expected: `<input value='{"foo":"bar"}'>`,
  },
  {
    component: () => (
      <CustomTag _tag="div" className={['egg', 'ham']} xxx="4">
        this is the custom tag body
      </CustomTag>
    ),
    expected: '<div class="egg ham" xxx="4">this is the custom tag body</div>',
  },
]

describe('render_jsx', () => {
  each(components).test('components %j', async ({component, args, expected}) => {
    const text = await render_jsx(component(args))
    // console.log('text:', text)
    expect(text).toEqual(expected)
  })
})
