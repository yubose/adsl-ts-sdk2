import * as grpcWeb from 'grpc-web'
import { dxResp as ServerDeleteResponse } from '@aitmed/protorepo/js/ecos/v1beta1/ecos_api_pb'
import AitmedError, { translateErrorCode } from '../../common/Error'
import { Codes } from '../../common/codes/error'
import errorSwitch from '../../common/Error/switch'
import store from '../../common/store'

export { deleteService, handleServerError }
function deleteService(_request): Promise<[Error | '', ServerDeleteResponse]> {
  return new Promise((resolve) => {
    store.grpcClient.dx(_request, null, callback)
    function callback(_error, _response) {
      return deleteServiceCallBack(_error, _response, resolve)
    }
  })
}
function deleteServiceCallBack(
  //@ts-ignore
  _error: grpcWeb.Error,
  _response,
  resolve,
): void {
  let serviceError: Error | '' = ''

  const gRPCErrorExists = _error !== null
  if (gRPCErrorExists) {
    serviceError = new AitmedError({
      code: _error.code,
      message: _error.message,
    })
    resolve([serviceError, _response])
    return
  }

  const serverResponseCode = _response.getCode()
  const serverErrorExists = serverResponseCode !== 0
  if (serverErrorExists) {
    serviceError = _response.getError()
    resolve([serviceError, _response])
    return
  }

  resolve(['', _response])
  return
}

async function handleServerError({ response, fn, args, resolve, error }) {
  if (!response && error) {
    //When there is a GRPC Error we want to return the original error
    throw error
  }
  const serverResponseCode = response.getCode()
  const serverError = response.getError()
  const translatedCode = translateErrorCode(serverResponseCode)
  const errorIsUnknown =
    translatedCode === -1 || translatedCode === serverResponseCode
  if (errorIsUnknown) {
    throw new AitmedError({
      code: serverResponseCode,
      source: 'lvl-1',
      message: serverError,
    })
  } else {
    try {
      const errorName = Codes[translatedCode]
      const switchResponse = await errorSwitch({
        name: errorName,
        fn,
        args,
      })
      resolve(switchResponse)
    } catch (error) {
      throw error
    }
  }
}
