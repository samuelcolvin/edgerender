import {Router, Assets, Views} from 'edgerender'
import {simple_response} from '../edgerender/response'
import favicon_path from './icons/favicon.ico'
import './icons/icon.svg'

declare const __STATIC_CONTENT_MANIFEST: string
declare const __STATIC_CONTENT: KVNamespace

const assets = new Assets({
  path: '/assets/',
  content_manifest: __STATIC_CONTENT_MANIFEST,
  kv_namespace: __STATIC_CONTENT,
})

const views: Views = [
  {
    match: '/',
    view: () => simple_response('this is index', 'text/html', 3600),
  },
  {
    match: '/favicon.ico',
    view: async context => {
      const s = context.assets as Assets
      return await s.response(context.request, favicon_path)
    },
  },
]
const router = new Router({views, assets})

addEventListener('fetch', router.handler)
