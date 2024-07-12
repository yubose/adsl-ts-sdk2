import { Codes, defaultMessages } from './codes/error'

export default class Response {
  readonly code: number
  readonly name: string
  readonly message: string
  readonly data: any

  constructor({
    code,
    message,
    data,
  }: {
    code: number
    message?: string
    data?: any
  }) {
    const name = Codes[code]
    if (data !== undefined) {
      this.data = data
    }
    if (name === undefined) {
      this.code = -1
      this.name = 'UNKNOWN_ERROR'
    } else {
      this.code = code
      this.name = name
    }
    this.message = message === undefined ? defaultMessages[name] : message
  }
}
