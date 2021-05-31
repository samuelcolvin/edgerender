import {load_template, render_template} from 'edgerender-yatl'
import {json_response, HttpError} from './utils'

declare const TEMPLATES: KVNamespace

async function post_file(request: Request, pathname: string): Promise<Response> {
  // TODO authentication!
  const content_type = request.headers.get('content-type')
  const {body} = request
  if (body == null) {
    throw new HttpError(400, 'No request body')
  }

  await TEMPLATES.put(`file:${pathname}`, body, {metadata: {content_type}})

  return json_response({pathname, content_type})
}

declare const WASM_MODULE: WebAssembly.Module

async function load_wasm(parser: any): Promise<void> {
  const instance = new WebAssembly.Instance(WASM_MODULE, {
    env: {
      memoryBase: 0,
      tableBase: 0,
      memory: new WebAssembly.Memory({initial: 10} as WebAssembly.MemoryDescriptor),
      table: new WebAssembly.Table({initial: 1, element: 'anyfunc'} as WebAssembly.TableDescriptor),
      event_listener: parser.eventTrap,
    },
  })
  parser.wasmSaxParser = instance.exports
  const wasm_parser = instance.exports.parser as (v: number) => void
  wasm_parser(parser.events)
}

async function file_loader(path: string): Promise<ReadableStream> {
  const v = await TEMPLATES.get(`file:${path}`, 'stream')
  if (!v) {
    throw new Error(`xml "${path}" not found`)
  }
  return v
}

async function render_template_response(request: Request, pathname: string): Promise<Response> {
  const template_elements = await load_template('/base.html', file_loader, load_wasm)
  const r = await render_template(template_elements, {name: 'World', pathname}, {})
  // const r = await render_string('<div>hello {{ name }}</div>', {name: 'World'}, {}, load_wasm)
  return new Response(r)
}

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
