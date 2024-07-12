import axios from 'axios'
import {
  cdReq as CreateDocumentRequest,
  cdResp as CreateDocumentResponse,
  rdResp as RetrieveDocumentResponse,
  rxReq as RetrieveXRequest,
} from '@aitmed/protorepo/js/ecos/v1beta1/ecos_api_pb'
import { Doc as gRPCDocument } from '@aitmed/protorepo/js/ecos/v1beta1/types_pb'
import { isDevelopment } from '../../utils/nodeEnv'
import AitmedError from '../../common/Error'
import Response from '../../common/Response'
import { JWT, Doc as SDKDoc } from '../../common/types'
import edgesServices from '../edges/edges'
import utils from '../../utils'
import log from '../../utils/log'
import {
  CreateDocumentArgs,
  UpdateDocumentArgs,
  DocumentRequestArgs,
  GenerateGRPCDocumentArgs,
  AttachDocumentArgs,
  UploadDocumentToS3,
  DownloadDocumentFromS3,
} from './types'

import deleteRequest from '../common/deleteRequest'
import { toSDKDoc } from '../common'
import {
  createDocumentService,
  retrieveDocumentService,
  handleServerError,
} from './utils'

const documentServices = (function() {
  const services = {
    createDocument: (args: CreateDocumentArgs) => documentRequest({ ...args }),
    retrieveDocument,
    updateDocument: (args: UpdateDocumentArgs) => documentRequest({ ...args }),
    deleteDocument: deleteRequest,
    attachDocument,
    uploadDocumentToS3,
    downloadDocumentFromS3,
  }

  /**
   *
   * @param {DocumentRequestArgs} args
   * @param {string | Uint8Array} args.id if id is undefined, create document, otherwise, update document.
   */
  function documentRequest({
    ...documentOptions
  }: DocumentRequestArgs): Promise<Response> {
    return new Promise(async (resolve) => {
      let serviceError: Error | AitmedError | '' = ''
      let responseData: {
        error: Error | AitmedError | ''
        jwt: string
        document: SDKDoc | ''
        code: number | ''
      } = {
        error: '',
        jwt: '',
        document: '',
        code: '',
      }

      if (typeof window?.localStorage !== 'undefined') {
        const apiDocument = generateGRPCDocument(documentOptions)
        let jwt: JWT | null = localStorage.getItem('jwt')
        if (!jwt) {
          const user_id = localStorage.getItem('facility_vid')
            ? localStorage.getItem('facility_vid')
            : localStorage.getItem('user_vid')
          const userIdToUint8Array = utils.base64ToUint8Array(user_id)
          const jwtResp = await edgesServices.createEdge({
            type: 1030,
            bvid: userIdToUint8Array,
          })
          jwt = jwtResp.data.jwt
          localStorage.setItem('jwt', jwt)
        }
        const _request = new CreateDocumentRequest()
        if (documentOptions.jwt) {
          if (isDevelopment()) {
            log.debug(
              `%cUsing noodl jwt`,
              'background:#ffa500; color: white; display: block;',
              documentOptions.jwt,
            )
          }
          _request.setJwt(documentOptions.jwt)
        } else {
          if (isDevelopment()) {
            log.debug(
              `%cUsing jwt`,
              'background:#ffa500; color: white; display: block;',
              jwt,
            )
          }
          _request.setJwt(jwt ? jwt : '')
        }
        _request.setDoc(apiDocument)

        let serviceResponse: CreateDocumentResponse | undefined
        try {
          if (isDevelopment()) {
            log.debug(
              `%cLVL2 ${
                documentOptions.id ? 'Update' : 'Create'
              } Document Request`,
              'background: #d217fc; color: white; display: block;',
              {
                ...documentOptions,
              },
            )
          }
          const [_error, _response] = await createDocumentService(_request)
          serviceError = _error
          serviceResponse = _response

          // 4 = server response for throttling (prevents DNS)
          if (serviceError?.['code'] == 4) {
            await utils.delay(1000)
            try {
              const newErrRes = await createDocumentService(_request)
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
              fn: documentRequest,
              args: documentOptions,
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

        if (serviceError?.['code'] == 14 || serviceError?.['code'] == -1) {
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
          const document = serviceResponse.getDoc()
          const newJWT = serviceResponse.getJwt()
          utils.storeCredentialsInLocalStorage({ jwt: newJWT })
          let sdkDoc: SDKDoc | '' = ''
          if (document === undefined) {
            serviceError = new AitmedError({
              name: 'DOCUMENT_IS_UNDEFINED',
            })
          } else {
            sdkDoc = toSDKDoc(document)
          }
          responseData.document = sdkDoc
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
              `%cLVL2 ${
                documentOptions.id ? 'Update' : 'Create'
              } Document Response`,
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
      }
    })
  }

  function retrieveDocument({
    idList = [],
    options = {},
  }: {
    idList: (string | Uint8Array)[]
    options?: {
      xfname?: string
      type?: number
      key?: string
      sfname?: string
      loid?: string | Uint8Array
      maxcount?: number
      obfname?: string
      scondition?: string
      asc?: boolean
      ObjType?: number
      jwt?: string
    }
  }): Promise<Response> {
    return new Promise(async function(resolve) {
      let serviceError: Error | AitmedError | '' = ''
      let responseData: {
        error: Error | AitmedError | ''
        jwt: string
        document: SDKDoc[] | ''
        code: number | ''
      } = {
        error: '',
        jwt: '',
        document: '',
        code: '',
      }

      const _request = new RetrieveXRequest()

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
      } else {
        if (isDevelopment()) {
          log.debug(
            `%cUsing jwt`,
            'background:#ffa500; color: white; display: block;',
            jwt,
          )
        }
        // _request.setJwt('')
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

      let serviceResponse: RetrieveDocumentResponse | undefined
      try {
        if (isDevelopment()) {
          log.debug(
            '%cLVL2 Get Document Request',
            'background: #d217fc; color: white; display: block;',
            { idList, options },
          )
        }
        const [_error, _response] = await retrieveDocumentService(_request)

        serviceError = _error
        serviceResponse = _response
      } catch (error) {
        serviceError = error
      }
      const requestargs = {
        idList: idList,
        options: options,
      }
      if (serviceError) {
        try {
          await handleServerError({
            response: serviceResponse,
            fn: retrieveDocument,
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
      if (serviceError?.['code'] == 14 || serviceError?.['code'] == -1) {
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
        const document = serviceResponse.getDocList()
        const newJWT = serviceResponse.getJwt()
        let sdkDocumentList: SDKDoc[] | '' = ''
        if (document === undefined) {
          serviceError = new AitmedError({
            name: 'DOCUMENT_IS_UNDEFINED',
          })
        } else {
          sdkDocumentList = document.map((data) => toSDKDoc(data))
          utils.storeCredentialsInLocalStorage({ jwt: newJWT })
        }
        responseData.document = sdkDocumentList
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
            '%cLVL2 Get Document Response',
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
  function generateGRPCDocument({
    id,
    type,
    subtype,
    name,
    deat,
    size,
    fid,
    eid,
    bSig, // overloaded to: ovid, owner vertex id
    eSig, // overloaded to: reid, root edge id
    ctime,
    mtime,
    atime,
    atimes,
    tage,
  }: GenerateGRPCDocumentArgs): gRPCDocument {
    const document: gRPCDocument = new gRPCDocument()
    if (id !== undefined) document.setId(id)
    if (type !== undefined) document.setType(type)
    if (subtype !== undefined) document.setSubtype(subtype)
    if (name) {
      try {
        const nameJSONString = JSON.stringify(name)
        document.setName(nameJSONString)
      } catch (error) {
        throw new AitmedError({
          name: 'JSON_STRINGIFY_FAILED',
        })
      }
    }
    if (deat) {
      try {
        const deatJSONString = JSON.stringify(deat)
        document.setDeat(deatJSONString)
      } catch (error) {
        throw new AitmedError({
          name: 'JSON_STRINGIFY_FAILED',
        })
      }
    }

    if (size !== undefined) document.setSize(size)
    if (fid !== undefined) document.setFid(fid)
    if (eid !== undefined) document.setEid(eid)
    if (bSig !== undefined) document.setBsig(bSig)
    if (eSig !== undefined) document.setEsig(eSig)
    if (ctime !== undefined) document.setCtime(ctime)
    if (mtime !== undefined) document.setMtime(mtime)
    if (atime !== undefined) document.setAtime(atime)
    if (atimes !== undefined) document.setAtimes(atimes)
    if (tage !== undefined) document.setTage(tage)

    return document
  }

  async function attachDocument({
    eid,
    documentInfo: name,
    data,
    size,
  }: AttachDocumentArgs): Promise<Response> {
    try {
      var {
        data: { deat },
      } = await services.createDocument({
        eid,
        name,
        size,
      })
    } catch (error) {
      throw error
    }
    try {
      const { url, sig } = deat
      await uploadDocumentToS3({ url, sig, data })
      return new Response({ code: 0 })
    } catch (error) {
      throw new AitmedError({ name: 'ERROR_UPLOADING_TO_AWS_S3' })
    }
  }

  async function uploadDocumentToS3({
    url,
    sig,
    data,
  }: UploadDocumentToS3): Promise<Response> {
    try {
      await axios({
        method: 'put',
        url: `${url}?${sig}`,
        data,
      })
      return new Response({ code: 0 })
    } catch (error) {
      throw new AitmedError({ name: 'ERROR_UPLOADING_TO_AWS_S3' })
    }
  }
  async function downloadDocumentFromS3({
    url,
  }: DownloadDocumentFromS3): Promise<Response> {
    try {
      const { data } = await axios.get(url)
      return new Response({ code: 0, data })
    } catch (error) {
      throw new AitmedError({ name: 'ERROR_DOWNLOADING_FROM_AWS_S3' })
    }
  }

  return services
})()

export default documentServices
