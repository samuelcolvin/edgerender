import {Router, Assets, Views} from 'edgerender'
import {json_response} from '../edgerender/response'
import {IndexPage} from './page'
import favicon_path from './icons/favicon.ico'
import './icons/icon.svg'

declare const __STATIC_CONTENT_MANIFEST: string
declare const __STATIC_CONTENT: KVNamespace

const assets = new Assets({
  path: '/assets/',
  content_manifest: __STATIC_CONTENT_MANIFEST,
  kv_namespace: __STATIC_CONTENT,
})

const views: Views = {
  '/': () => IndexPage(),
  '/favicon.ico': {
    view: async context => {
      const s = context.assets as Assets
      return await s.response(context.request, favicon_path)
    },
  },
  '/path/{id:int}/': ({match}) => {
    console.log('match:', match)
    return json_response({match})
  },
  '/fonts/{file_name:.+}': ({request, url, assets}) => {
    const assets_ = assets as Assets
    return assets_.cached_proxy(request,`https://smokeshow.helpmanual.io${url.pathname}`)
  },
}
const router = new Router({views, assets})

addEventListener('fetch', router.handler)
