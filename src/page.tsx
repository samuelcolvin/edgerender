import {render_jsx, raw_html} from 'edgerender'
import main_styles from './styles/main.scss'
import icon from './icons/icon.svg'
import script_src from '!raw-loader!./raw_javascript.js'

const MoonSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203
    23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512
    7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309
    114.511 256 256 256z"/>
  </svg>
)
const GitHubSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6
    3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2
    2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8
    8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70
    15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9
    2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9
    20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9
    16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5
    4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6
    1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7
    4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1
    1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3
    1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/>
  </svg>
)

async function MainPage() {
  const readme = 'this is the readme'
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>

        <title>smokeshow</title>
        <meta name="description" content="Deploy ephemeral websites."/>

        <meta name="msapplication-TileColor" content="#0d1117"/>
        <meta name="theme-color" content="#0d1117"/>

        <link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
        <link rel="preload" href="/fonts/Inter-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>
        <link rel="preload" href="/fonts/Inter-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/>

        <link rel="preload" href={main_styles} as="style" crossOrigin="anonymous"/>
        <link rel="stylesheet" href={main_styles} crossOrigin="anonymous"/>

       <script src="https://unpkg.com/htmx.org@1.4.1" crossOrigin="anonymous"/>
      </head>
      <body>
        <main>
          <nav>
            <div className="dark-control">
              <MoonSvg/>
              <div className="switch">
                <span id="slider"/>
              </div>
            </div>
            <script>
              {raw_html(script_src)}
            </script>
          </nav>
          <article className={['foo', false, 'bar', true]}>
            <header className={{spam: true, fish: null, another: undefined, snap: 'ok'}}>
              <div className="weight-medium">README.md</div>
              <a href="https://github.com/samuelcolvin/smokeshow">
                <GitHubSvg/>
                <span>samuelcolvin/smokeshow</span>
              </a>
            </header>
            {readme}
            <button hxPost="/clicked/" hxSwap="outerHTML" hxPushUrl="true">
              Click Me
            </button>
            <button hxDelete="/account" hxPrompt="Enter your account name to confirm deletion">
              Delete My Account
            </button>
            <p align="center">
              <a href="https://smokeshow.helpmanual.io">
                <img src={icon} alt="smokeshow" width="200" height="200"/>
              </a>
            </p>
          </article>
        </main>
      </body>
    </html>
  )
}

export async function main(): Promise<string> {
  const t = MainPage()
  return await render_jsx(t)
}

const Clicked = () => {
  return (
    <div>
      This was clicked
    </div>
  )
}

export async function clicked(): Promise<string> {
  const t = Clicked()
  return await render_jsx(t)
}
