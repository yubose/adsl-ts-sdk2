import store from './store'
import { StatusCodes, defaultMessages } from './codes/status'

import { XOR } from './types'

export interface StatusBasics {
  message?: any
  data?: any
}

export interface StatusWithCode extends StatusBasics {
  code: number
}

export interface StatusWithName extends StatusBasics {
  name: string
}

export type StatusArgs = XOR<StatusWithCode, StatusWithName>

export default class Status {
  readonly code: number
  readonly name: string
  readonly message: string
  readonly data: any
  readonly config: ReturnType<typeof store.getConfig>

  constructor({ code, message, data, name }: StatusArgs) {
    if (code === undefined && name) {
      this.code = StatusCodes[name] === undefined ? -1 : StatusCodes[name]
      this.name = name
      this.message = message === undefined ? defaultMessages[name] : message
    } else if (name === undefined && code) {
      this.name =
        StatusCodes[code] === undefined ? 'UNKNOWN_STATUS' : StatusCodes[code]
      this.code = code
      this.message = message === undefined ? defaultMessages[code] : message
    } else {
      this.code = -1
      this.name = 'UNKNOWN_STATUS'
    }
    this.data = data
    this.config = store.getConfig()
  }
}
