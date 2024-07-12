import throttle from 'lodash.throttle'
import AitmedError from '..'
import Response from '../../../common/Response'
import store from '../../store'
import { automaticLogin } from '../../../services/Account/Account'
import log from '../../../utils/log'

const jwtExpired = async ({
  fn,
  args,
}: {
  fn: Function
  args: any
}): Promise<Response> => {
  try {
    if (store.env === 'development') {
      log.debug(
        `%cAutomatic login for JWT_EXPIRED`,
        'background:#f9fc17; color: black; display: block;',
      )
    }
    await automaticLogin()
    return fn(args)
  } catch (error) {
    throw new AitmedError({
      code: error.code,
      message: error.message || 'There was an error retrieving a new JWT',
    })
  }
}

const throttledJWTExpired = throttle(jwtExpired, 6000000, { trailing: false })

export { throttledJWTExpired }
export default jwtExpired
