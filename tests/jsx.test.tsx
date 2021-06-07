const Foobar = ({foo}: {foo: number}) => (
  <div>
    {foo * 2}
  </div>
)

const Page = () => (
  <Foobar foo={4}/>
)

describe('jsx', () => {

  test('', async () => {
    const result = Page()
    console.log('result:', result)
  })
})
