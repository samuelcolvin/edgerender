export const Foobar = ({foo}: {foo: number}) => <div>{foo * 2}</div>

export async function IndexPage() {
  return (
    <html lang="en">
      <head>
        <title>testing</title>
        <meta name="description" content="this is a test" />
      </head>
      <body>
        <main>
          <h1>Testing</h1>
          <Foobar foo={123} />
        </main>
      </body>
    </html>
  )
}
