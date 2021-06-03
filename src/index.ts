import {Router, Views} from 'edgerender/router'
import {simple_response} from '../edgerender/response'

const views: Views = [
  {
    match: '/',
    view: () => simple_response('this is index', 'text/html', 3600),
  },
]
const router = new Router({
  views
})

addEventListener('fetch', router.handler)
