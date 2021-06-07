import {Router, Views} from '../../edgerender'
import {json_response} from '../../edgerender/response'
import {IndexPage} from './page'

const views: Views = {
  '/': () => IndexPage(),
  '/path/{id:int}/': ({match}) => {
    console.log('match:', match)
    return json_response({match})
  },
  '/fonts/{file_name:.+}': ({request, url, assets}) => {
    return assets.cached_proxy(request, `https://smokeshow.helpmanual.io${url.pathname}`)
  },
}
export const router = new Router({views})

// addEventListener('fetch', router.handler)
