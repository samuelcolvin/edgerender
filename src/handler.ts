import mime from 'mime/lite'
import {HttpError} from 'edgerender/response'
import {main, clicked} from './page'
import favicon_path from './icons/favicon.ico'

export async function route(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const {pathname} = url
  console.log(`${request.method} ${url}`)
  console.log('htmx request:', request.headers.get('hx-request') == 'true')
  if (pathname == '/') {
    const html = await main()
    return new Response(html, {headers: content_headers(pathname, 'main.html')})
  } else if (pathname == '/clicked/') {
    const html = await clicked()
    return new Response(html, {headers: content_headers(pathname, 'main.html')})
  }

  if (pathname.startsWith('/assets/')) {
    return await static_content(request, pathname)
  }

  if (pathname.startsWith('/fonts/')) {
    return await fetch(`https://smokeshow.helpmanual.io${pathname}`, request)
  }
  if (pathname == '/favicon.ico') {
    return await static_content(request, favicon_path)
  }
  throw new HttpError(404, 'Page Not Found')
}

declare const __STATIC_CONTENT_MANIFEST: string
declare const __STATIC_CONTENT: KVNamespace
// __STATIC_CONTENT_MANIFEST is a JSON generate by the "site" mode of wrangler
const static_manifest: Record<string, string> = JSON.parse(__STATIC_CONTENT_MANIFEST)

async function static_content(request: Request, pathname: string): Promise<Response> {
  // stripe leading slashes and "assets to match the format in static_manifest
  const clean_path = pathname.replace(/^\/assets\//, '')

  const content_key = static_manifest[clean_path]
  if (content_key) {
    console.debug(`static file found path=${clean_path} content_key=${content_key}`)
  } else {
    throw new HttpError(404, `content not found for key "${content_key}"`)
  }

  // __STATIC_CONTENT is a KV namespace setup by the "site" mode of wrangler
  const content = await __STATIC_CONTENT.get(content_key, 'arrayBuffer')
  if (content === null) {
    throw new HttpError(404, `content not found for key "${content_key}"`)
  } else {
    return new Response(content, {headers: content_headers(pathname, content_key)})
  }
}

function content_headers(pathname: string, content_key: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': get_mime_type(content_key),
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin',
  }

  // if (csp_rules) {
  //   headers['Content-Security-Policy'] = csp_rules
  // }
  if (pathname.startsWith('/assets/')) {
    headers['Cache-Control'] = 'public, max-age=86400'
  }
  if (pathname.startsWith('/favicons/')) {
    headers['Cache-Control'] = 'public, max-age=31536000'
  }

  return headers
}

function get_mime_type(content_key: string): string {
  const m = content_key.toLocaleLowerCase().match(/\.([a-z]+)$/)
  return (m && mime.getType(m[0])) || 'application/octet-stream'
}
