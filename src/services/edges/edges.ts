// @ts-nocheck
import * as u from '@jsmanifest/utils'
import {
  ceReq as CreateEdgeRequest,
  ceResp as CreateEdgeResponse,
  rxReq as RetrieveXRequest,
  reResp as RetrieveEdgeResponse,
} from '@aitmed/protorepo/js/ecos/v1beta1/ecos_api_pb'
import { Edge as gRPCEdge } from '@aitmed/protorepo/js/ecos/v1beta1/types_pb'
import type * as t from '@/types'
import { generateEsak, toSDKEdge } from '../common'
import AitmedError from '../../common/Error'
import Response from '../../common/Response'
import deleteRequest from '../common/deleteRequest'
import utils from '../../utils'
import log from '../../utils/log'
import {
  getJWT,
  handleServerError,
  createEdgeService,
  retrieveEdgeService,
  setJWT,
} from './utils'
import { isDevelopment } from '../../utils/nodeEnv'
import { Edge as SDKEdge, JWT } from '../../common/types'
const edgesServices = (function () {
  const services = {
    createEdge: (args: t.CreateEdgeArgs) => edgeRequest({ ...args }),
    retrieveEdge,
    updateEdge: (args: t.UpdateEdgeArgs) => edgeRequest({ ...args }),
    deleteEdge: deleteRequest,
  } as const

  /**
   *
   * @param {t.EdgeRequestArgs} args
   * @param {string | Uint8Array} args.id if id is undefined, create edge, otherwise, update edge.
   *
   */
  function edgeRequest({
    ...edgeOptions
  }: t.EdgeRequestArgs): Promise<Response> {
    return new Promise(async (resolve) => {
      let serviceError: Error | AitmedError | '' = ''
      let responseData: t.ResponseDataObject<{
        edge: SDKEdge | ''
      }> = {
        error: '',
        jwt: '',
        edge: '',
        code: '',
      }

      const _request = new CreateEdgeRequest()

      const requestEdge = buildRequest({ ...edgeOptions }) as gRPCEdge
      _request.setEdge(requestEdge)

      const jwt = getJWT(edgeOptions.type)
      if(edgeOptions.type !== 1010){
        if (edgeOptions.jwt) {
          if (isDevelopment()) {
            log.debug(
              `%cUsing noodl jwt`,
              'background:#ffa500; color: white; display: block;',
              {
                jwt,
                request: _request.toObject(),
                edge: requestEdge.toObject(),
                options: edgeOptions,
              },
            )
          }
          _request.setJwt(edgeOptions.jwt)
        } else {
          if (isDevelopment()) {
            log.debug(
              `%cUsing jwt`,
              'background:#ffa500; color: white; display: block;',
              {
                jwt,
                request: _request.toObject(),
                edge: requestEdge.toObject(),
                options: edgeOptions,
              },
            )
          }
          _request.setJwt(jwt ? jwt : '')
        }
      }
      

      let serviceResponse: CreateEdgeResponse | undefined

      try {
        if (isDevelopment()) {
          log.debug(
            `%cLVL2 ${edgeOptions.id ? 'Update' : 'Create'} Edge Request`,
            'background: #d217fc; color: white; display: block;',
            {
              jwt,
              request: _request.toObject(),
              edge: requestEdge.toObject(),
              options: edgeOptions,
            },
          )
        }
        let [_error, _response] = await createEdgeService(_request)

        serviceError = _error
        serviceResponse = _response

        // 4 = server response for throttling (prevents DNS)
        if (serviceError?.['code'] == 4) {
          await utils.delay(1000)
          try {
            const newErrRes = await createEdgeService(_request)
            serviceError = newErrRes[0]
            serviceResponse = newErrRes[1]
          } catch (error) { }
        }
      } catch (error) {
        serviceError = error
      }

      if (serviceError) {
        try {
          await handleServerError({
            response: serviceResponse,
            fn: edgeRequest,
            args: edgeOptions,
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
        let resCode = serviceResponse?.getCode() || -1
        if (
          serviceError &&
          //@ts-ignore
          serviceError.code
        ) {
          //@ts-ignore
          resCode = serviceError.code
        }
        resolve(
          new Response({
            code: serviceResponse?.getCode() || -1,
            data: {
              ...responseData,
              code: resCode,
              error: serviceResponse?.getError(),
            },
          }),
        )
      } else if (serviceResponse) {
        const edge = serviceResponse.getEdge()
        const newJWT = serviceResponse.getJwt()
        let sdkEdge: SDKEdge | '' = ''
        if (edge === undefined) {
          serviceError = new AitmedError({
            name: 'EDGE_IS_UNDEFINED',
          })
        } else {
          sdkEdge = toSDKEdge(edge)

          setJWT(sdkEdge.type, newJWT)
        }

        responseData.edge = sdkEdge
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
            `%cLVL2 ${edgeOptions.id ? 'Update' : 'Create'} Edge Response`,
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

  /**
   * @param {t.RetrieveEdgeArgs} args
   */
  function retrieveEdge({
    idList = [],
    options = {},
  }: t.RetrieveEdgeArgs): Promise<t.RetrieveEdgeSDKResponse> {
    return new Promise(async function (resolve) {
      let serviceError: Error | AitmedError | '' = ''
      let responseData: {
        error: Error | AitmedError | ''
        jwt: string
        edge: SDKEdge[] | ''
        code: number | ''
      } = {
        error: '',
        jwt: '',
        edge: '',
        code: '',
      }

      // @ts-expect-error
      if (!utils.isBrowser()) resolve({})

      const _request = new RetrieveXRequest()

      const jwt: JWT | null = localStorage.getItem('jwt')
      if (isDevelopment()) { log.debug(`%cUsing ${options.jwt ? 'noodl ' : ''}jwt`, options.jwt || jwt) }

      _request.setJwt('')
      _request.setIdList(idList)
      const requestargs = {
        idList: idList,
        options: options
      }
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

      let serviceResponse: RetrieveEdgeResponse | undefined
      try {
        if (isDevelopment()) {
          log.debug(
            '%cLVL2 Get Edge Request',
            'background: #d217fc; color: white; display: block;',
            { idList, options },
          )
        }
        const [_error, _response] = await retrieveEdgeService(_request)

        serviceError = _error
        serviceResponse = _response
      } catch (error) {
        serviceError = error
      }

      if (serviceError) {
        try {
          await handleServerError({
            response: serviceResponse,
            fn: retrieveEdge,
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
        const edge = serviceResponse.getEdgeList()
        const newJWT = serviceResponse.getJwt()
        let sdkEdgeList: SDKEdge[] | '' = ''
        if (edge === undefined) {
          serviceError = new AitmedError({
            name: 'EDGE_IS_UNDEFINED',
          })
        } else {
          sdkEdgeList = edge.map((data) => toSDKEdge(data))
          utils.storeCredentialsInLocalStorage({ jwt: newJWT })
        }

        responseData.edge = sdkEdgeList
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
        log.debug(
          '%cLVL2 Get Edge Response',
          'background: #d217fc; color: white; display: block;',
          responseData,
        )
        resolve(
          new Response({
            code: serviceResponse.getCode(),
            data: responseData,
          }),
        )
      }
    })
  }

  /**
   *
   * @param edgeOptions
   *
   * @param edgeOptions.tage  number
   * @param edgeOptions.id  Uint8Array | string
   * @param edgeOptions.type  number
   * @param edgeOptions.name  Record<string, any>
   * @param edgeOptions.deat  Record<string, any>
   * @param edgeOptions.subtype  number
   * @param edgeOptions.bvid  Uint8Array | string
   * @param edgeOptions.evid  Uint8Array | string
   * @param edgeOptions.stime  number
   * @param edgeOptions.etime  number
   * @param edgeOptions.refid  Uint8Array | string
   * @param edgeOptions.besak  Uint8Array | string
   * @param edgeOptions.eesak  Uint8Array | string
   * @param edgeOptions.sig  Uint8Array | string
   * @param edgeOptions.isEncrypt  boolean
   *
   */
  function defaultPath({
    tage,
    id,
    type,
    name,
    deat,
    subtype,
    bvid,
    atimes,
    evid,
    stime,
    etime,
    refid,
    eesak,
    besak,
    sig,
    isEncrypt,
  }: t.GenerateGRPCEdgeArgs): gRPCEdge {
    const apiEdge: gRPCEdge = new gRPCEdge()
    let besakGen: Uint8Array | string | undefined = besak
    if (isEncrypt === true && besakGen === undefined) {
      //event is encrypted
      try {
        //TODO refactor uneeded conversion to Uint8Array
        const pk = localStorage.getItem('pk')
        let pkToUint8Array
        if (pk) {
          pkToUint8Array = utils.base64ToUint8Array(pk)
        }
        besakGen = generateEsak(pk)
        apiEdge.setSig(pk ? pkToUint8Array : '')
      } catch (error) {
        throw new AitmedError({
          name: 'ERROR_CREATING_BESAK',
        })
      }
    } else {
      if (sig !== undefined) apiEdge.setSig(sig)
    }

    if (name) {
      try {
        if (u.isStr(name?.verification_code)) {
          name.verification_code = Number(name?.verification_code)
        }
        const nameJSONString = JSON.stringify(name)
        apiEdge.setName(nameJSONString)
      } catch (error) {
        throw new AitmedError({
          name: 'JSON_STRINGIFY_FAILED',
        })
      }
    }
    if (deat) {
      try {
        const deatJSONString = JSON.stringify(deat)
        apiEdge.setDeat(deatJSONString)
      } catch (error) {
        throw new AitmedError({
          name: 'JSON_STRINGIFY_FAILED',
        })
      }
    }
    if (bvid !== undefined) apiEdge.setBvid(bvid)
    if (stime !== undefined) apiEdge.setStime(stime)
    if (type !== undefined) apiEdge.setType(type)
    if (tage !== undefined) apiEdge.setTage(tage)
    if (id !== undefined) apiEdge.setId(id)
    if (subtype !== undefined) apiEdge.setSubtype(subtype)
    if (evid !== undefined) apiEdge.setEvid(evid)
    if (etime !== undefined) apiEdge.setEtime(etime)
    if (refid !== undefined) apiEdge.setRefid(refid)
    if (besakGen !== undefined) apiEdge.setBesak(besakGen)
    if (eesak !== undefined) apiEdge.setEesak(eesak)
    if (atimes !== undefined) apiEdge.setAtimes(atimes)

    return apiEdge
  }

  /**
   *
   * @param edgeOptions
   * @param edgeOptions.name Record<string, any>
   * @param edgeOptions.type number
   * @param edgeOptions.refid string //eventId
   * @param edgeOptions.evid string //the receiver of this particular edge
   */
  //@ts-ignore
  // async function createInvite({
  //   name,
  //   type,
  //   refid,
  //   bvid,
  //   evid,
  // }: CreateInviteGRPCEdgeArgs): Promise<gRPCEdge> {
  //   const apiEdge: gRPCEdge = new gRPCEdge()
  //   try {
  //     const nameJSONString = JSON.stringify(name)
  //     apiEdge.setName(nameJSONString)
  //   } catch (error) {
  //     throw new AitmedError({
  //       name: 'JSON_STRINGIFY_FAILED',
  //     })
  //   }
  //   apiEdge.setType(type)
  //   apiEdge.setBvid(bvid)
  //   apiEdge.setRefid(refid)

  //   if (typeof evid !== 'undefined') apiEdge.setEvid(evid)

  //   // if (stime !== undefined) apiEdge.setStime(stime)
  //   // if (etime !== undefined) apiEdge.setEtime(etime)

  //   return apiEdge
  // }

  /**
   *
   * @param params
   * @param params.name Record<string, any>
   * @param params.type number
   * @param params.refid string //inviteId
   * @param params.evid string //the receiver of this particular edge(i.e. who this acceptance is directed to)
   */
  //@ts-ignore

  // async function acceptInvite({
  //   name,
  //   type,
  //   refid,
  //   evid,
  //   bvid,
  // }: AcceptInviteGRPCEdgeArgs): Promise<gRPCEdge> {
  //   const apiEdge: gRPCEdge = new gRPCEdge()
  //   try {
  //     const nameJSONString = JSON.stringify(name)
  //     apiEdge.setName(nameJSONString)
  //   } catch (error) {
  //     throw new AitmedError({
  //       name: 'JSON_STRINGIFY_FAILED',
  //     })
  //   }
  //   if (typeof window?.localStorage == 'undefined') {
  //     return apiEdge
  //   }
  //   const evidPk = localStorage.getItem('pk')
  //   apiEdge.setSig(evidPk === null ? '' : evidPk)
  //   apiEdge.setType(type)
  //   apiEdge.setRefid(refid)
  //   apiEdge.setEvid(evid)
  //   apiEdge.setBvid(bvid)

  //   return apiEdge
  // }

  // used for one to many communications
  // ex shared notebooks
  // where multiple users are able to access the same edge
  //@ts-ignore

  // async function authorizeEvent_Dependent({
  //   bvid,
  //   evid,
  //   refid,
  //   name,
  // }: EventAuthorizeGRPCEdgeArgs): Promise<gRPCEdge> {
  //   //retrieve sharedEvent
  //   let sharedEvent
  //   try {
  //     const { besak, rootName, type, eid } = await findRoot(refid)
  //     sharedEvent = { besak, rootName, type, eid }
  //   } catch (error) {
  //     //TODO handle error where shared event cannot be retrieved
  //     throw error
  //   }

  //   const apiEdge: gRPCEdge = new gRPCEdge()

  //   if (typeof window?.localStorage == 'undefined') {
  //     return apiEdge
  //   }

  //   //check if event is encrypted
  //   //if so attach a eesak to this edge
  //   let eesak
  //   if (sharedEvent.besak) {
  //     let esak
  //     const edgeWithEsak = await findEdgeWithEsak(refid)
  //     //event is encrypted
  //     //retrieve acceptEdge to get the pk of evid
  //     const { data: acceptEdge } = await services.retrieveEdge({
  //       idList: [refid],
  //     })

  //     const evidPk = acceptEdge[0].sig
  //     let evidPkUint8Array = evidPk
  //     if (typeof evidPk === 'string') {
  //       evidPkUint8Array = utils.base64ToUint8Array(evidPk)
  //     }

  //     let publicKey
  //     let secretKey
  //     if (edgeWithEsak.besak) {
  //       esak = edgeWithEsak.besak
  //       //user authorizing shared edge is user who created the orignal notebook
  //       publicKey = localStorage.getItem('pk')
  //       secretKey = localStorage.getItem('sk')
  //     } else {
  //       esak = edgeWithEsak.eesak
  //       //user authorizing shared edge is not the user who created the original notebook
  //       publicKey = utils.uint8ArrayToBase64(edgeWithEsak.sig)
  //       secretKey = localStorage.getItem('sk')
  //     }
  //     //get the sak
  //     let partialKey, pkToUint8Array, skToUint8Array
  //     if (publicKey && secretKey) {
  //       pkToUint8Array = utils.base64ToUint8Array(publicKey)
  //       skToUint8Array = utils.base64ToUint8Array(secretKey)
  //       partialKey = utils.aKeyDecrypt(pkToUint8Array, skToUint8Array, esak)
  //     }
  //     //encrypt sak with receiverPk and senderSk
  //     if (partialKey) {
  //       eesak = utils.aKeyEncrypt(evidPkUint8Array, skToUint8Array, partialKey)
  //     }
  //     //attach sender public key so receiver can decrypt eesak
  //     apiEdge.setSig(publicKey === null ? '' : publicKey)
  //   }

  //   try {
  //     const mergedName = { ...sharedEvent.rootName, ...name }
  //     const nameJSONString = JSON.stringify(mergedName)
  //     apiEdge.setName(nameJSONString)
  //   } catch (error) {
  //     throw new AitmedError({
  //       name: 'JSON_STRINGIFY_FAILED',
  //     })
  //   }

  //   if (eesak !== undefined) apiEdge.setEesak(eesak)

  //   apiEdge.setType(sharedEvent.type)
  //   apiEdge.setRefid(sharedEvent.eid)
  //   apiEdge.setEvid(evid)
  //   apiEdge.setBvid(bvid)

  //   return apiEdge
  // }

  //ex. authorize inbox
  // used for one to one communication
  // only one bvid and evid are able to modify and access the docs on edge
  //@ts-ignore
  // async function authorizeEvent_Independent({
  //   evid,
  //   bvid,
  //   refid,
  //   name,
  //   isEncrypt = false,
  // }: EventAuthorizeIndependentGRPCEdgeArgs): Promise<gRPCEdge> {
  //   //retrieve sharedEvent
  //   let sharedEvent
  //   try {
  //     const { besak, name: rootName, type, eid } = await findRoot(refid)
  //     sharedEvent = { besak, rootName, type, eid }
  //   } catch (error) {
  //     //TODO handle error where shared event cannot be retrieved
  //     throw error
  //   }

  //   const apiEdge: gRPCEdge = new gRPCEdge()

  //   if (typeof window?.localStorage == 'undefined') {
  //     return apiEdge
  //   }

  //   //check if event is encrypted
  //   //if so attach a eesak to this edge
  //   let eesak
  //   let besak
  //   if (isEncrypt) {
  //     //event is encrypted
  //     //retrieve acceptEdge to get the pk of evid
  //     const { data: acceptEdge } = await services.retrieveEdge({
  //       idList: [refid],
  //     })

  //     const evidPk = acceptEdge[0].sig
  //     let evidPkUint8Array = evidPk
  //     if (typeof evidPk === 'string') {
  //       evidPkUint8Array = utils.base64ToUint8Array(evidPk)
  //     }

  //     //get the pk and sk of bvid
  //     let bvidPk = localStorage.getItem('pk')
  //     let bvidSK = localStorage.getItem('sk')
  //     try {
  //       besak = generateEsak(bvidPk)
  //     } catch (error) {
  //       throw new AitmedError({
  //         name: 'ERROR_CREATING_BESAK',
  //       })
  //     }

  //     //get the sak
  //     let partialKey, pkToUint8Array, skToUint8Array
  //     if (bvidPk && bvidSK) {
  //       pkToUint8Array = utils.base64ToUint8Array(bvidPk)
  //       skToUint8Array = utils.base64ToUint8Array(bvidSK)
  //       partialKey = utils.aKeyDecrypt(pkToUint8Array, skToUint8Array, besak)
  //     }

  //     //encrypt sak with receiverPk and senderSk
  //     if (partialKey) {
  //       eesak = utils.aKeyEncrypt(evidPkUint8Array, skToUint8Array, partialKey)
  //     }
  //     //attach sender public key so receiver can decrypt eesak
  //     apiEdge.setSig(bvidPk === null ? '' : bvidPk)
  //   }

  //   try {
  //     const mergedName = { ...sharedEvent.rootName, ...name }
  //     const nameJSONString = JSON.stringify(mergedName)
  //     apiEdge.setName(nameJSONString)
  //   } catch (error) {
  //     throw new AitmedError({
  //       name: 'JSON_STRINGIFY_FAILED',
  //     })
  //   }

  //   if (besak !== undefined) apiEdge.setBesak(besak)
  //   if (eesak !== undefined) apiEdge.setEesak(eesak)

  //   apiEdge.setType(sharedEvent.type)
  //   apiEdge.setRefid(sharedEvent.eid)
  //   apiEdge.setEvid(evid)
  //   apiEdge.setBvid(bvid)

  //   return apiEdge
  // }
  // async function findRoot(id) {
  //   const { data: edge } = await services.retrieveEdge({ idList: [id] })
  //   const { refid } = edge[0]
  //   if (refid) {
  //     return findRoot(refid)
  //   }
  //   return edge[0]
  // }
  // async function findEdgeWithEsak(id) {
  //   const { data: edge } = await services.retrieveEdge({ idList: [id] })
  //   const { eesak, besak, refid } = edge[0]
  //   if (eesak || besak) {
  //     return edge[0]
  //   } else {
  //     return findEdgeWithEsak(refid)
  //   }
  // }

  const buildRequest = (edgeOptions) => {
    switch (edgeOptions.type) {
      //TODO: used for createInvite specific logic
      // case 1050:
      //   return createInvite(edgeOptions)
      // case 1060:
      //   return acceptInvite(edgeOptions)
      // case 1070:
      //   //this type(1070) serves as a placeholder
      //   //and will be replaced by the type of the original event
      //   return authorizeEvent_Dependent(edgeOptions)
      // case 1071:
      //   //this type(1071) serves as a placeholder
      //   //and will be replaced by the type of the original event
      //   return authorizeEvent_Independent(edgeOptions)
      default:
        return defaultPath(edgeOptions)
    }
  }
  return services
})()

export default edgesServices
