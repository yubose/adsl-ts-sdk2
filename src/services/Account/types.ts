import { DigitCode } from '../../common/types'

export interface RequestVerificationCodeArgs {
  phone_number: string
}
export interface CreateUserArgs {
  phone_number: string
  password: string
  verification_code: number
  userInfo?: any
  type?: number
}
export interface CreateInvitedUserArgs {
  phone_number: string
  password: string
  userInfo?: any
  id: string | Uint8Array
}
export interface GeneratorSigForOldAccountArgs {
  userInfo?: any
  id: string | Uint8Array
  sk?: any
  phoneNumber: string
}
export interface LoginArgs {
  password?: string
  autoLogin?: boolean
}

export interface LoginNewDeviceArgs {
  phone_number: string
  verification_code: DigitCode
}

export interface ChangePasswordWithOldPasswordArgs {
  oldPassword: string
  newPassword: string
}

export interface ChangePasswordWithVerificationCode {
  phone_number: string
  verification_code: string
  password: string
}

export interface VerifyUserPasswordArgs {
  password: string
}
export interface ChangePasswordWithoutOldPasswordArgs {
  password: string
  phone_number: string
  verification_code: number
}
