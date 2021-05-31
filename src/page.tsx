async function render_jsx(raw: any): Promise<string> {
  // console.log('raw:', raw)
  const prom = raw as Promise<string>
  return await prom
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

// const Smash = ({x}: {x: number}) => <div>{x * 2}</div>

function foobar() {
  return (
    <div key="123" className="foobar">
      <Foobar thing={123} />
      hello
      {/*<HasInner>*/}
      {/*  <b>the kids</b>*/}
      {/*</HasInner>*/}
      <DoWait x={50}/>
      <input type="text"/>
      <>whatever</>
      {/*<Smash x={1}/>*/}
    </div>
  )
}

export default async () => {
  return await render_jsx(foobar())
}
