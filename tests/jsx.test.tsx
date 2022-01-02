import each from 'jest-each'
import {Component, JsxChunk, raw_html, CustomTag, render_jsx} from 'edgerender/jsx'

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
    component: () => <div data={{foo: '<bar"', spam: 123, html: raw_html('"xxx"')}}>whatever</div>,
    expected: '<div data-foo="&lt;bar&quot;" data-spam="123" data-html=\'"xxx"\'>whatever</div>',
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
      <span id={raw_html('"thing"')} hxGet="foobar">
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
  {
    component: ({condition}) => <div>{condition ? <span>condition true</span> : null}</div>,
    args: {condition: true},
    expected: '<div><span>condition true</span></div>',
  },
  {
    component: ({condition}) => <div>{condition ? <span>condition true</span> : null}</div>,
    args: {condition: false},
    expected: '<div></div>',
  },
  {
    component: () => <span>null: "{null}"</span>,
    expected: '<span>null: ""</span>',
  },
  {
    component: () => <span>undefined: "{undefined}"</span>,
    expected: '<span>undefined: ""</span>',
  },
  {
    component: () => <span>true: "{true}"</span>,
    expected: '<span>true: "true"</span>',
  },
  {
    component: () => <span>false: "{false}"</span>,
    expected: '<span>false: "false"</span>',
  },
  {
    component: () => <span>date: "{new Date(2e12)}"</span>,
    expected: '<span>date: ""2033-05-18T03:33:20.000Z""</span>',
  },
  {
    component: () => <span>regex: "{/foobar/}"</span>,
    expected: '<span>regex: "/foobar/"</span>',
  },
  {
    component: () => <span>function: "{() => 'function-returns'}"</span>,
    expected: '<span>function: "function-returns"</span>',
  },
  {
    component: () => <span>promise: "{new Promise(resolve => resolve('promise-result'))}"</span>,
    expected: '<span>promise: "promise-result"</span>',
  },
  {
    component: () => <span>jsx object: "{<span>inner fragment</span>}"</span>,
    expected: '<span>jsx object: "<span>inner fragment</span>"</span>',
  },
  {
    component: () => <span>fragment: "{<>inner fragment</>}"</span>,
    expected: '<span>fragment: "inner fragment"</span>',
  },
  {
    component: () => <span>array: "{[1, 2, 3]}"</span>,
    expected: '<span>array: "123"</span>',
  },
  {
    component: () => <span>object: "{{a: 1, b: 2, c: 3}}"</span>,
    expected: '<span>object: "{"a":1,"b":2,"c":3}"</span>',
  },
  {
    component: () => <input value={undefined} />,
    expected: '<input>',
  },
  {
    component: () => <input value={null} />,
    expected: '<input>',
  },
]

describe('render_jsx', () => {
  each(components).test('components %j', async ({component, args, expected}) => {
    const text = await render_jsx(component(args))
    // console.log('text:', text)
    expect(text).toEqual(expected)
  })
})
