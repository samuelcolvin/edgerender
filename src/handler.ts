import render_page from './page'

export async function route(request: Request): Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname == '/') {
    let html = await render_page()
    if (/^<html/i.test(html)) {
      html = '<!doctype html>' + html
    }
    return new Response(html, {headers: {'content-type': 'text/html'}})
  }
  return await fetch(`https://smokeshow.helpmanual.io${url.pathname}`, request)
  // throw new HttpError(404, 'Page Not Found')
}
