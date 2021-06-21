export default class Sentry {
  readonly sentry_key: string
  readonly sentry_app: string
  readonly release?: string
  readonly environment: string

  constructor(dsn: string, environment: string | undefined, release: string | undefined = undefined) {
    const m = dsn.match(/^https:\/\/(.+?)@(.+?)\.ingest\.sentry\.io\/(.+)/)
    const [, sentry_key, , sentry_app] = m as RegExpMatchArray
    this.sentry_key = sentry_key
    this.sentry_app = sentry_app

    this.environment = environment || 'production'
    this.release = release
  }

  captureMessage(event: FetchEvent, message: string, {level = 'info', extra = {}} = {}): void {
    event.waitUntil(this.capture(event.request, {message, level, extra}))
  }

  captureException(event: FetchEvent, exc: Error, {level = 'error', extra = {}} = {}): void {
    const message = exc.toString() || exc.message || 'Unknown error'
    event.waitUntil(
      this.capture(event.request, {
        exception: {
          mechanism: {handled: true, type: 'generic'},
          values: [
            {
              type: 'Error',
              value: message,
              stacktrace: {frames: get_frames(exc.stack)},
            },
          ],
        },
        message,
        level,
        extra,
      }),
    )
  }

  private async capture(request: Request, data: Partial<SentryData>): Promise<Response> {
    const sentry_data: SentryData = Object.assign(
      {
        platform: 'javascript',
        logger: 'cloudflare',
        environment: this.environment,
        fingerprint: [`${request.method}-${request.url}-${data.message || 'null'}`],
        user: {
          ip_address: request.headers.get('CF-Connecting-IP'),
        },
        request: {
          url: request.url,
          method: request.method,
          headers: Object.fromEntries(request.headers),
        },
        extra: {},
      },
      data,
    )
    sentry_data.extra.cloudflare = request.cf

    // console.log('sentry data:', sentry_data)

    // if (this.release) {
    //   defaults.release = this.release
    // }
    const params = {
      sentry_key: this.sentry_key,
      sentry_version: 7,
      sentry_client: 'cloudflare-worker-custom',
    }
    const args = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')
    const sentry_url = `https://sentry.io/api/${this.sentry_app}/store/?${args}`

    return await fetch(sentry_url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(sentry_data),
    })
  }
}

interface Frame {
  in_app: true
  filename: string
  function: string
  lineno?: number
  colno?: number
}

interface SentryData {
  platform: string
  logger: string
  environment: string
  fingerprint: string[]
  user: {ip_address: string}
  request: {url: string; method: string; headers: Record<string, string>}
  exception?: {
    mechanism: {handled: boolean; type: string}
    values: {type: string; value: string; stacktrace: {frames: Frame[]}}[]
  }
  message?: string
  level?: string
  extra: Record<string, any>
}

function get_frames(stack: string | undefined): Frame[] {
  if (!stack) {
    return []
  }
  const lines = stack.split('\n')
  lines.splice(0, 1)
  return lines
    .reverse()
    .filter(line => line.match(/^ {4}at /))
    .map(extract_frame)
}

const frame_regexes: RegExp[] = [
  /^ +at (?<func>.+?) \((?<filename>.+?):(?<lineno>\d+):(?<colno>\d+)\)/,
  /^ +at (?<func>.+?):(?<lineno>\d+):(?<colno>\d+)/,
  /^ +at (?<func>.+?) \(/,
]

function extract_frame(line: string): Frame {
  for (const regex of frame_regexes) {
    const m = line.match(regex)
    if (m) {
      const {func, filename, lineno, colno} = m.groups as Record<string, string>
      const f = {
        in_app: true,
        filename: `~/${filename || '__unknown__.js'}`,
        function: func,
      }
      if (lineno) {
        Object.assign(f, {lineno: parseInt(lineno), colno: parseInt(colno)})
      }
      return f as Frame
    }
  }
  throw Error(`no frame found in stack line: "${line}"`)
}
