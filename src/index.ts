import {route} from './handler'
import {HttpError} from './utils'

addEventListener('fetch', e => e.respondWith(handle(e)))

async function handle(event: FetchEvent): Promise<Response> {
  const {request} = event

  try {
    return await route(request)
  } catch (exc) {
    if (exc instanceof HttpError) {
      console.warn(exc.message)
      return exc.response()
    }
    console.error('error handling request:', request)
    console.error('error:', exc)
    // captureException(event, exc)
    const body = `\nError occurred on the edge:\n\n${exc.message}\n${exc.stack}\n`
    return new Response(body, {status: 500})
  }
}
