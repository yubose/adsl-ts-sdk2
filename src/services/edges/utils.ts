import * as grpcWeb from 'grpc-web'
import {
  ceResp as ServerCreateEdgeResponse,
  ceReq as CreateEdgeRequest,
  rxReq as RetrieveXRequest,
  reResp as ServerRetrieveEdgeResponse,
} from '@aitmed/protorepo/js/ecos/v1beta1/ecos_api_pb'

import { JWT } from '../../common/types'
import utils from '../../utils'
import AitmedError, { translateErrorCode } from '../../common/Error'
import { Codes } from '../../common/codes/error'
import errorSwitch from '../../common/Error/switch'
import store from '../../common/store'
import documentServices from '../document'

const { createDocument } = documentServices

export {
  getJWT,
  setJWT,
  handleServerError,
  attachDocumentsToEdge,
  createEdgeService,
  retrieveEdgeService,
}
function getJWT(type) {
  if (typeof window?.localStorage == 'undefined') {
    return null
  }
  switch (type) {
    case 1040: {
      const vcjwt: JWT | null = localStorage.getItem('vcjwt')
      return vcjwt
    }
    default:
      const jwt: JWT | null = localStorage.getItem('jwt')
      return jwt
  }
}

function setJWT(type, jwt) {
  if ([1010, 1011].includes(type)) {
    utils.storeCredentialsInLocalStorage({ vcjwt: jwt })
  } else {
    utils.storeCredentialsInLocalStorage({ jwt })
  }
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

async function attachDocumentsToEdge(docList, eid) {
  docList.map(async (doc) => {
    let docNameField = { ...doc.name }
    const deatFieldExists = doc.deat !== null
    if (deatFieldExists) {
      const awsS3URL = doc.deat.url
      docNameField['url'] = awsS3URL
    }
    await createDocument({
      ...doc,
      name: docNameField,
      eid,
    })
  })
}

function createEdgeService(
  _request: CreateEdgeRequest,
): Promise<[Error | '', ServerCreateEdgeResponse]> {
  return new Promise((resolve) => {
    store.grpcClient.ce(_request, null, callback)
    function callback(_error, _response) {
      return createEdgeServiceCallBack(_error, _response, resolve)
    }
  })
}
function retrieveEdgeService(
  _request: RetrieveXRequest,
): Promise<[Error | '', ServerRetrieveEdgeResponse]> {
  return new Promise((resolve) => {
    store.grpcClient.re(_request, null, callback)
    function callback(_error, _response) {
      return retrieveEdgeCallBack(_error, _response, resolve)
    }
  })
}

function retrieveEdgeCallBack(
  //@ts-ignore
  _error: grpcWeb.Error,
  _response: ServerRetrieveEdgeResponse,
  resolve: Function,
): void {
  let serviceError: Error | string = ''

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
function createEdgeServiceCallBack(
  //@ts-ignore
  _error: grpcWeb.Error,
  _response: ServerCreateEdgeResponse,
  resolve: Function,
): void {
  let serviceError: Error | string = ''

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
