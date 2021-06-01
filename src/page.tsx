async function render_jsx(jsx_element: JSX.Element): Promise<string> {
  return await (jsx_element as any).render()
}

const Foobar = ({thing}: {thing: number}) => <span className="whatever">Number: {thing}</span>

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function get_thing(x: number): Promise<number> {
  await sleep(x)
  return 42
}

async function DoWait({x}: {x: number}) {
  const answer = await get_thing(x)
  // const answer = async_ref(get_thing(x))
  return (
    <>
      <div>answer: {answer}</div>
      <Foobar thing={answer}/>
    </>
  )
}

const HasInner = ({children}: {children: JSX.AnyHtmlElement}) => {
  return <div className="this-takes-inner">{children}</div>
}

function foobar() {
  const x = '<b>this is html</b>'
  const foobar = [1, 2, 3, 4]
  return (
    <div key="123" className="foobar">
      <Foobar thing={123} />
      hello
      <HasInner>
        <b>the kids</b>
      </HasInner>
      <DoWait x={50}/>
      <input type="text"/>
      <>whatever</>
      {x}
      {foobar.map(v => (
        <div>{v}</div>
      ))}
    </div>
  )
}

export default async () => {
  const t = foobar()
  return await render_jsx(t)
}
