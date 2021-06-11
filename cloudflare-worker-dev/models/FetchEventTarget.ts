import FetchEvent from './FetchEvent'

type EventListener = (event: FetchEvent) => void

export default class FetchEventTarget {
  protected readonly listeners: Set<EventListener>

  constructor() {
    this.listeners = new Set()
  }

  // TODO: support `opts`
  addEventListener(type: 'event', listener: EventListener) {
    this.listeners.add(listener)
  }

  dispatchEvent(event: FetchEvent): boolean {
    for (const listener of this.listeners) {
      listener(event)
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
    // dispatchEvent mostly returns true
    return true
  }

  removeEventListener(type: 'event', listener: EventListener): void {
    this.listeners.delete(listener)
  }

  resetEventListeners() {
    this.listeners.clear()
  }
}
