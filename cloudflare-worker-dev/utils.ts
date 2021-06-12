import {TextDecoder, TextEncoder} from 'util'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function encode(input: string): Uint8Array {
  return encoder.encode(input)
}
export function decode(input: Uint8Array | ArrayBuffer): string {
  return decoder.decode(input)
}
