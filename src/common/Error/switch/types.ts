import { XOR } from '../../types'

export interface SwitchErrorBasicArgs {
  message?: string
  fn: any
  args?: any
}
export interface SwitchErrorWithName extends SwitchErrorBasicArgs {
  name: string
}
export interface SwitchErrorWithCode extends SwitchErrorBasicArgs {
  code: number
}

export type SwitchErrorArgs = XOR<SwitchErrorWithCode, SwitchErrorWithName>
