import {Router, AssetConfig, Views} from 'edgerender'
import {json_response} from '../edgerender/response'
import {IndexPage} from './page'
import favicon_path from './icons/favicon.ico'
import './icons/icon.svg'

declare const __STATIC_CONTENT_MANIFEST: string
declare const __STATIC_CONTENT: KVNamespace

const assets: AssetConfig = {
  content_manifest: __STATIC_CONTENT_MANIFEST,
  kv_namespace: __STATIC_CONTENT,
}

const views: Views = {
  '/': () => IndexPage(),
  '/favicon.ico': {
    view: async ({assets, request}) => {
      return await assets.response(request, favicon_path)
    },
  },
  '/path/{id:int}/': ({match}) => {
    console.log('match:', match)
    return json_response({match})
  },
  '/fonts/{file_name:.+}': ({request, url, assets}) => {
    return assets.cached_proxy(request, `https://smokeshow.helpmanual.io${url.pathname}`)
  },
}
const router = new Router({views, assets})

addEventListener('fetch', router.handler)
