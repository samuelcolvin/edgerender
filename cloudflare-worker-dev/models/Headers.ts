// stubs https://developer.mozilla.org/en-US/docs/Web/API/Headers

export class Headers {
  protected readonly map: Map<string, string>
  
  constructor(init: Record<string, string> = {}) {

    if (init instanceof Headers) {
      this.map = new Map(init.map);
    } else {
      this.map = new Map(Object.entries(init).map(([k, v]) => [k.toLowerCase(), v]))
    }
  }

  entries(): IterableIterator<[string, string]> {
    return this.map.entries();
  }

  keys(): IterableIterator<string> {
    return this.map.keys();
  }

  values(): IterableIterator<string> {
    return this.map.values()
  }

  append(name: string, value: string): void {
    let k = name.toLowerCase()
    if (this.map.has(k)) {
      value = `${this.map.get(k)},${value}`
    }
    this.map.set(k, value);
  }

  delete(name: string): void {
    this.map.delete(name.toLowerCase());
  }

  forEach(callback: (value: string, key: string, map: Map<string, string>) => void): void {
    this.map.forEach(callback)
  }

  get(name: string): string | null {
    const k = name.toLowerCase()
    return this.map.get(k) || null
  }

  has(name: string): boolean {
    return this.map.has(name.toLowerCase())
  }

  set(name: string, value: string): void {
    this.map.set(name.toLowerCase(), value);
  }

  [Symbol.iterator](): IterableIterator<string> {
    return this.values()
  }
}


