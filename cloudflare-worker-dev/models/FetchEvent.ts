
interface FetchEventInit {
  request:
}

export default class FetchEvent {
  readonly type: 'fetch'
  readonly init: FetchEventInit

  constructor(type: 'fetch', init: FetchEventInit) {
    this.type = type
    this.init = init
  }
}
