import { XOR } from '../types'

export interface AitmedErrorBasics {
  message?: any
  source?: string
}

export interface AitmedErrorWithCode extends AitmedErrorBasics {
  code: number
}

export interface AitmedErrorWithName extends AitmedErrorBasics {
  name: string
}

export type AitmedErrorArgs = XOR<AitmedErrorWithCode, AitmedErrorWithName>
