import { Codes } from '../../codes/error'
import AitmedError from '../AitmedError'
import { SwitchErrorArgs } from './types'
import { default as jwtNotFound } from './jwtNotFound'
import { default as jwtExpired } from './jwtExpired'
import Response from '../../../common/Response'

const errorSwitch = async ({
  name,
  code,
  message,
  fn,
  args,
}: SwitchErrorArgs): Promise<Response> => {
  let errorName
  if (name === undefined && code !== undefined) {
    errorName = Codes[code]
  } else {
    errorName = name
  }
  let response
  switch (errorName) {
    case 'JWT_NOT_FOUND':
      response = await jwtNotFound({ fn, args })
      return response
    case 'JWT_EXPIRED':
      response = await jwtExpired({ fn, args })
      return response
    default:
      throw new AitmedError({ name: errorName, message })
  }
}

export default errorSwitch
