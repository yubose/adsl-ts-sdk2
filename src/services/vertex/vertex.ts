import {
  rxReq as RetrieveXRequest,
  cvReq as CreateVertexRequest,
  rvResp as RetrieveVertexResponse,
  cvResp as CreateVertexResponse,
} from '@aitmed/protorepo/js/ecos/v1beta1/ecos_api_pb'
import { Vertex as gRPCVertex } from '@aitmed/protorepo/js/ecos/v1beta1/types_pb'
import { toSDKVertex } from '../common'
import { isDevelopment } from '../../utils/nodeEnv'
import AitmedError from '../../common/Error'
import Response from '../../common/Response'
import deleteRequest from '../common/deleteRequest'
import { JWT, Vertex as SDKVertex } from '../../common/types'
import {
  VertexRequestArgs,
  CreateVertexArgs,
  UpdateVertexArgs,
  GenerateGRPCVertexArgs,
  RetrieveVertexArgs,
} from './types'
import utils from '../../utils'
import log from '../../utils/log'
import {
  createVertexService,
  retrieveVertexService,
  handleServerError,
} from './utils'

const vertexServices = (function() {
  const services = {
    createVertex: (args: CreateVertexArgs) => vertexRequest({ ...args }),
    retrieveVertex,
    updateVertex: (args: UpdateVertexArgs) => vertexRequest({ ...args }),
    deleteVertex: deleteRequest,
  }

  /**
   *
   * @param {VertexRequestArgs} args
   * @param {string | Uint8Array} args.id if id is undefined, create vector, otherwise, update vector.
   */
  function vertexRequest({
    ...vertexOptions
  }: VertexRequestArgs): Promise<Response> {
    return new Promise(async (resolve) => {
      let serviceError: Error | AitmedError | '' = ''
      let responseData: {
        error: Error | AitmedError | ''
        jwt: string
        vertex: SDKVertex | ''
        code: number | ''
      } = {
        error: '',
        jwt: '',
        vertex: '',
        code: '',
      }

      const apiVertex: gRPCVertex = generateGRPCVertex({ ...vertexOptions })
      const requestargs = vertexOptions
      if (typeof window?.localStorage == 'undefined') {
        resolve({} as any)
      }

      const _request = new CreateVertexRequest()
      if (vertexOptions.jwt) {
        _request.setJwt(vertexOptions.jwt)
        if (isDevelopment()) {
          log.debug(
            `%cUsing noodl jwt`,
            'background:#ffa500; color: white; display: block;',
            vertexOptions.jwt,
          )
        }
      } else if (
        (vertexOptions.type &&
          [1, -1,2,-2].includes(vertexOptions.type) &&
          !vertexOptions.id) ||
        (vertexOptions.type &&
          [1, -1,2,-2].includes(vertexOptions.type) &&
          vertexOptions.id &&
          vertexOptions.tage !== 0)
      ) {
        //creating a new user
        const vcjwt: JWT | null = localStorage.getItem('vcjwt')
        _request.setJwt(vcjwt === null ? '' : vcjwt)
        if (isDevelopment()) {
          log.debug(
            `%cUsing vcjwt`,
            'background:#ffa500; color: white; display: block;',
            vcjwt,
          )
        }
      } else {
        const jwt: JWT | null = localStorage.getItem('jwt')
        _request.setJwt(jwt === null ? '' : jwt)
        if (isDevelopment()) {
          log.debug(
            `%cUsing jwt`,
            'background:#ffa500; color: white; display: block;',
            jwt,
          )
        }
      }
      _request.setVertex(apiVertex)

      let serviceResponse: CreateVertexResponse | undefined
      try {
        if (isDevelopment()) {
          log.debug(
            `%cLVL2 ${vertexOptions.id ? 'Update' : 'Create'} Vertex Request`,
            'background: #d217fc; color: white; display: block;',
            {
              ...vertexOptions,
            },
          )
        }
        const [_error, _response] = await createVertexService(_request)
        serviceError = _error
        serviceResponse = _response

        // 4 = server response for throttling (prevents DNS)
        if (serviceError?.['code'] == 4) {
          await utils.delay(1000)
          try {
            const newErrRes = await createVertexService(_request)
            serviceError = newErrRes[0]
            serviceResponse = newErrRes[1]
          } catch (error) {}
        }
      } catch (error) {
        serviceError = error
      }
      
      if (serviceError) {
        try {
          await handleServerError({
            response: serviceResponse,
            fn: vertexRequest,
            args: requestargs,
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
      if(serviceError?.["code"] ==14|| serviceError?.["code"]==-1){
        utils.serverDownhandle()
      }
      if (serviceError) {
        if (
          serviceError &&
          //@ts-ignore
          serviceError.code
        ) {
          //@ts-ignore
          responseData.code = serviceError.code
        }
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
        const vertex = serviceResponse.getVertex()
        const newJWT = serviceResponse.getJwt()
        utils.storeCredentialsInLocalStorage({ jwt: newJWT })
        let sdkVertex: SDKVertex | '' = ''
        if (vertex === undefined) {
          serviceError = new AitmedError({
            name: 'VERTEX_IS_UNDEFINED',
          })
        } else {
          sdkVertex = toSDKVertex(vertex)
        }

        responseData.vertex = sdkVertex
        responseData.jwt = newJWT
        responseData.error = serviceError
        responseData.code = serviceResponse.getCode()
        if (
          serviceError &&
          //@ts-ignore
          serviceError.code
        ) {
          //@ts-ignore
          responseData.code = serviceError.code
        }
        if (isDevelopment()) {
          log.debug(
            `%cLVL2 ${vertexOptions.id ? 'Update' : 'Create'} Vertex Response`,
            'background: #d217fc; color: white; display: block;',
            {
              ...responseData,
            },
          )
        }
        resolve(
          new Response({
            code: serviceResponse.getCode(),
            data: {
              ...responseData,
            },
          }),
        )
      }
    })
  }

  function retrieveVertex({
    idList = [],
    options = {},
  }: RetrieveVertexArgs): Promise<Response> {
    return new Promise(async function(resolve) {
      let serviceError: Error | AitmedError | '' = ''
      let responseData: {
        error: Error | AitmedError | ''
        jwt: string
        vertex: SDKVertex[] | ''
        code: number | ''
      } = {
        error: '',
        jwt: '',
        vertex: '',
        code: '',
      }

      const _request = new RetrieveXRequest()

      if (typeof window?.localStorage == 'undefined') {
        return _request
      }

      const jwt: JWT | null = localStorage.getItem('jwt')
      if (options.jwt) {
        if (isDevelopment()) {
          log.debug(
            `%cUsing noodl jwt`,
            'background:#ffa500; color: white; display: block;',
            options.jwt,
          )
        }
        _request.setJwt(options.jwt)
      } else if(options?.jwtNoUse){
        _request.setJwt('')
      }else {
        if (isDevelopment()) {
          log.debug(
            `%cUsing jwt`,
            'background:#ffa500; color: white; display: block;',
            jwt,
          )
        }
        _request.setJwt(jwt ? jwt : '')
      }
      _request.setIdList(idList)

      const {
        xfname,
        type,
        key,
        sfname,
        loid,
        maxcount,
        obfname,
        scondition,
        asc,
        ObjType,
      } = options
      //_request.setXfname(xfname === undefined ? 'id' : xfname)
      // Tony Tong Oct 29, 2021
      // if xfname is empty from noodl don't set default
      // backend will handle it depending on different ObjType
      if (xfname !== undefined) _request.setXfname(xfname)
      if (type !== undefined) _request.setType(type)
      if (key !== undefined) _request.setKey(key)
      if (sfname !== undefined) _request.setSfname(sfname)
      if (loid !== undefined) _request.setLoid(loid)
      if (maxcount !== undefined) _request.setMaxcount(maxcount)
      if (obfname !== undefined) _request.setObfname(obfname)
      if (scondition !== undefined) _request.setScondition(scondition)
      if (asc !== undefined) _request.setAsc(asc)
      if (ObjType !== undefined) _request.setObjtype(ObjType)

      let serviceResponse: RetrieveVertexResponse | undefined
      try {
        if (isDevelopment()) {
          log.debug(
            '%cLVL2 Get Vertex Request',
            'background: #d217fc; color: white; display: block;',
            { idList, options },
          )
        }
        const [_error, _response] = await retrieveVertexService(_request)

        serviceError = _error
        serviceResponse = _response
      } catch (error) {
        serviceError = error
      }
      const requestargs = {
        idList: idList,
        options: options
      }
      if (serviceError) {
        try {
          await handleServerError({
            response: serviceResponse,
            fn: retrieveVertex,
            args: requestargs,
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
      if(serviceError?.["code"] ==14|| serviceError?.["code"]==-1){
        utils.serverDownhandle()
      }
      if (serviceError) {
        if (
          serviceError &&
          //@ts-ignore
          serviceError.code
        ) {
          //@ts-ignore
          responseData.code = serviceError.code
        }
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
        const vertex = serviceResponse.getVertexList()
        const newJWT = serviceResponse.getJwt()
        let sdkVertexList: SDKVertex[] | '' = ''
        if (vertex === undefined) {
          serviceError = new AitmedError({
            name: 'VERTEX_IS_UNDEFINED',
          })
        } else {
          sdkVertexList = vertex.map((data) => toSDKVertex(data))
          utils.storeCredentialsInLocalStorage({ jwt: newJWT })
        }

        responseData.vertex = sdkVertexList
        responseData.jwt = newJWT
        responseData.error = serviceError
        responseData.code = serviceResponse.getCode()
        if (
          serviceError &&
          //@ts-ignore
          serviceError.code
        ) {
          //@ts-ignore
          responseData.code = serviceError.code
        }
        if (isDevelopment()) {
          log.debug(
            '%cLVL2 Get Vertex Response',
            'background: #d217fc; color: white; display: block;',
            responseData,
          )
        }
        resolve(
          new Response({
            code: serviceResponse.getCode(),
            data: {
              ...responseData,
            },
          }),
        )
      }
    })
  }

  function generateGRPCVertex({
    tage,
    id,
    type,
    subtype,
    name,
    atimes,
    deat,
    pk,
    esk,
    uid,
  }: GenerateGRPCVertexArgs): gRPCVertex {
    const apiVertex: gRPCVertex = new gRPCVertex()
    if (name) {
      try {
        const nameJSONString = JSON.stringify(name)
        apiVertex.setName(nameJSONString)
      } catch (error) {
        throw new AitmedError({
          name: 'JSON_STRINGIFY_FAILED',
        })
      }
    }
    if (deat) {
      try {
        const deatJSONString = JSON.stringify(deat)
        apiVertex.setDeat(deatJSONString)
      } catch (error) {
        throw new AitmedError({
          name: 'JSON_STRINGIFY_FAILED',
        })
      }
    }
    if (tage !== undefined) apiVertex.setTage(tage)
    if (id !== undefined) apiVertex.setId(id)
    if (type !== undefined) apiVertex.setType(type)
    if (subtype !== undefined) apiVertex.setSubtype(subtype)
    if (pk !== undefined) apiVertex.setPk(pk)
    if (esk !== undefined) apiVertex.setEsk(esk)
    if (uid !== undefined) apiVertex.setUid(uid)
    if (atimes !== undefined) apiVertex.setAtimes(atimes)
    return apiVertex
  }

  return services
})()

export default vertexServices
