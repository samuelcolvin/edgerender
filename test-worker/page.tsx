export const Foobar = ({foo}: {foo: number}) => (
  <div>
    {foo * 2}
  </div>
)

export async function IndexPage() {
  const main_styles = 'https://www.example.com'
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>

        <title>testing</title>
        <meta name="description" content="Deploy ephemeral websites."/>

        <link rel="stylesheet" href={main_styles} crossOrigin="anonymous"/>
       <script src="https://unpkg.com/htmx.org@1.4.1" crossOrigin="anonymous"/>
      </head>
      <body>
        <main>
          <h1>Testing</h1>
          <Foobar foo={123}/>
        </main>
      </body>
    </html>
  )
}
