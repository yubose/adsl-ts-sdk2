import throttle from 'lodash.throttle'
import AitmedError from '..'
import Response from '../../../common/Response'
import { automaticLogin } from '../../../services/Account/Account'
import { isDevelopment } from '../../../utils/nodeEnv'
import log from '../../../utils/log'
let refreshTokenInProgress = false

function sleepRefreshToken() {
  return new Promise((resolve,reject) => {
    const monitorJwt = function(resolve){
      let index = 0
      const int = setInterval(()=>{
          if(!refreshTokenInProgress && index >= 3){
            clearInterval(int)
            resolve()
          }
          index++
      },1000)
    }
    monitorJwt(resolve)
  })
}
const jwtNotFound = async ({
  fn,
  args,
}: {
  fn: Function
  args: any
}): Promise<Response> => {
  if(refreshTokenInProgress){
    await sleepRefreshToken().then(async()=>{
      args.jwt = localStorage.getItem('jwt')
      return fn(args)
    })
  }
  refreshTokenInProgress = true
  try {
    if (isDevelopment()) {
      log.debug(
        `%cAutomatic login for JWT_NOT_FOUND`,
        'background:#f9fc17; color: black; display: block;',
      )
    }
    if (args.esk && args.tage && +args.tage>100000) {
      // 如果需要更新 vertex, 自动登录的时候 1032 的 根据这个判断 这是不是一个 更改密码的时候的自动登录 . tage 里面是个验证码 
      // update vertext 给的 tage 要和 申请jwt的时候 给的 tage对上
      await localStorage.setItem('vcode', args.tage) 
    }
    if (!localStorage.getItem('user_vid')) {
      // 只有有这些信息的时候才有重新登录的必要 否则是没有必要的 。 登录的时候有时候会有这个问题
      localStorage.getItem('jwt') && localStorage.removeItem('jwt')
      localStorage.getItem('vcjwt') && localStorage.removeItem('vcjwt')
      if([1031,1030,1010].includes(args.type)){
        return fn(args)
      }
    }
    await automaticLogin()
    args.jwt = await localStorage.getItem('jwt')
    if(args.jwt){
      refreshTokenInProgress = false
      return fn(args)
    }
    return
  } catch (error) {
    throw new AitmedError({
      code: error.code,
      message: error.message || 'There was an error retrieving a new JWT',
    })
  }
}

const throttledJWTNotFound = throttle(jwtNotFound, 6000000, {
  trailing: false,
})

export { throttledJWTNotFound }
export default jwtNotFound
