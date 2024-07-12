import {
  dxReq as DeleteRequest,
  dxResp as DeleteResponse,
} from '@aitmed/protorepo/js/ecos/v1beta1/ecos_api_pb'
import AitmedError from '../../common/Error'
import Response from '../../common/Response'
import { JWT } from '../../common/types'
import utils from '../../utils'
import { deleteService, handleServerError } from './utils'

function deleteRequest(idList: (string | Uint8Array)[]): Promise<Response> {
  return new Promise(async (resolve) => {
    let serviceError: Error | '' = ''
    let responseData: {
      error: Error | ''
      jwt: string
      code: number | ''
    } = {
      error: '',
      jwt: '',
      code: '',
    }

    if (typeof window?.localStorage !== 'undefined') {
      const _request = new DeleteRequest()
      const jwt: JWT | null = localStorage.getItem('jwt')
      _request.setJwt(jwt ? jwt : '')
      _request.setIdList(idList)

      let serviceResponse: DeleteResponse | undefined
      try {
        const [_error, _response] = await deleteService(_request)
        serviceError = _error
        serviceResponse = _response
      } catch (error) {
        serviceError = error
      }

      if (serviceError) {
        try {
          await handleServerError({
            response: serviceResponse,
            fn: deleteRequest,
            args: idList,
            resolve,
            error: serviceError,
          })
        } catch (error) {
          serviceError = error
        }
      }
      if (!serviceError && !serviceResponse) {
        serviceError = new AitmedError({ code: -1 })
      }
      if (serviceError) {
        resolve(
          new Response({
            code: serviceResponse?.getCode() || -1,
            data: {
              ...responseData,
              error: serviceError,
            },
          }),
        )
      } else if (serviceResponse) {
        const newJWT = serviceResponse.getJwt()
        utils.storeCredentialsInLocalStorage({ jwt: newJWT })

        responseData.jwt = newJWT
        responseData.error = serviceError
        responseData.code = serviceResponse.getCode()

        resolve(
          new Response({
            code: serviceResponse.getCode(),
            data: {
              ...responseData,
            },
          }),
        )
      }
    }
  })
}

export default deleteRequest
