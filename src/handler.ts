export async function route(request: Request): Promise<Response> {
  // const {pathname} = new URL(request.url)
  //
  // if (request.method == 'POST') {
  //   return await post_file(request, pathname)
  // }
  //
  // if (pathname == '/') {
  //   return await render_template_response(request, pathname)
  // }
  return new Response(`request method: ${request.method}`)
  // throw new HttpError(404, 'Page Not Found')
}
