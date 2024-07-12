import SDK from './SDK'
export {
  ceReq,
  ceResp,
  cdReq,
  cdResp,
  cvReq,
  cvResp,
  dxReq,
  dxResp,
  rxReq,
  reResp,
  rvResp,
  rdResp,
} from '@aitmed/protorepo/js/ecos/v1beta1/ecos_api_pb'
export { Edge, Vertex, Doc } from '@aitmed/protorepo/js/ecos/v1beta1/types_pb'

// TODO - See if we can remove most of the imports below in favor of the ones above this

import * as CommonTypes from './common/types'
export * from './SDK'

export { AccountTypes } from './services/Account'
export { EdgeTypes } from './services/edges'
export { DocumentTypes } from './services/document'
export { VertexTypes } from './services/vertex'
export { CommonTypes }
export { default as Level2Error } from './common/Error'
export { default as Level2Response } from './common/Response'
export { default as Status } from './common/Status'

export type {
  EcosAPIClient,
  GrpcCallOptions,
  GrpcClientReadableStream,
  GrpcError,
  GrpcMetadata,
  GrpcMethodDescriptor,
  GrpcRequest,
  GrpcStatus,
  GrpcStatusCode,
  GrpcStreamInterceptor,
  GrpcUnaryInterceptor,
  GrpcUnaryResponse,
  IdList,
  CreateEdgeArgs,
  EdgeRequestArgs,
  RetrieveEdgeArgs,
  UpdateEdgeArgs,
  ResponseDataObject,
  RetrieveEdgeSDKResponse,
  RetrieveDocumentSDKResponse,
  RetrieveVertexSDKResponse,
} from './types'

export default SDK
