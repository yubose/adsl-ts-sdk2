import type {
  ClientReadableStream as GrpcClientReadableStream,
  CallOptions as GrpcCallOptions,
  //@ts-expect-error
  Error as GrpcError,
  MethodDescriptor as GrpcMethodDescriptor,
  Metadata as GrpcMetadata,
  Request as GrpcRequest,
  StatusCode as GrpcStatusCode,
  StreamInterceptor as GrpcStreamInterceptor,
  UnaryInterceptor as GrpcUnaryInterceptor,
  UnaryResponse as GrpcUnaryResponse,
  Status as GrpcStatus,
} from 'grpc-web'
import type { EcosAPIClient } from '@aitmed/protorepo/dist/types/js/ecos/v1beta1/ecos_apiServiceClientPb'
import type AitmedError from './common/Error/AitmedError'
import type Response from './common/Response'

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
}

export class Edge {
  eid: Uint8Array | string
  ctime: number // create time, never be changed
  mtime: number // modify time
  atime: number // last access time
  atimes: number // access times, counter for the number of access
  bvid: Uint8Array | string // begin vertex on the directive graph.
  type: number
  name: any // searchable public description
  evid: Uint8Array | string // end vertex on the directive graph.
  subtype: number
  stime: number
  etime: number
  refid: Uint8Array | string // reference to other entries on the eTable.
  besak: Uint8Array | string
  eesak: Uint8Array | string
  sig: Uint8Array | string
  tage: number // target age
  deat: any
}

export class Vertex {
  id: Uint8Array | string // uuid
  ctime: number // create time, never be changed
  mtime: number // modify time
  atime: number // last access time
  atimes: number // access times, counter for the number of access
  type: number // External identifiable vertex with login credential, such as by phone number and password or by email and password, etc.s
  subtype: number
  name: any // searchable public description
  esk: Uint8Array | string // symmetrically encrypted secret key
  pk: Uint8Array | string // public key
  uid: string //  external user identifiable id, such as a phone number or email address
  deat: any // derived attribute from its edges.
  tage: number // target age
}

export class Doc {
  id: Uint8Array | string // document id
  ctime: number // create time, never be changed
  mtime: number // modify time
  atime: number // last access time
  atimes: number // access times, counter for the number of access
  tage: number // target age
  subtype: number
  type: number
  name: any // searchable public description
  deat: any
  size: number
  fid: Uint8Array | string
  eid: Uint8Array | string // Edge id
  bsig: Uint8Array | string
  esig: Uint8Array | string
}

/**
 * TODO: Move all typings to this file for best practice
 */

export interface GenerateGRPCEdgeArgs {
  tage?: number
  id?: Uint8Array | string
  type: number
  name?: Record<string, any>
  deat?: Record<string, any>
  subtype?: number
  bvid?: Uint8Array | string
  evid?: Uint8Array | string
  stime?: number
  etime?: number
  atimes?:number
  refid?: Uint8Array | string
  besak?: Uint8Array | string
  eesak?: Uint8Array | string
  sig?: Uint8Array | string
  isEncrypt?: boolean
  jwt?: string
}

export interface EdgeRequestArgs extends GenerateGRPCEdgeArgs {
  isEncrypt?: boolean
}

export interface CreateInviteGRPCEdgeArgs {
  name: {
    eventName: string
    eventId: string
    eventType: number
    inviteePhoneNumber: string
    inviteeName: string
    inviterName: string
  }
  type: number
  refid: Uint8Array | string
  bvid: Uint8Array | string
  evid?: Uint8Array | string
}

export interface AcceptInviteGRPCEdgeArgs {
  name: Record<string, any>
  type: number
  refid: Uint8Array | string
  evid: Uint8Array | string
  bvid: Uint8Array | string
}

export interface EventAuthorizeGRPCEdgeArgs {
  refid: Uint8Array | string
  evid: Uint8Array | string
  bvid: Uint8Array | string
  name: Record<string, any>
}
export interface EventAuthorizeIndependentGRPCEdgeArgs
  extends EventAuthorizeGRPCEdgeArgs {
  isEncrypt?: boolean
  name: Record<string, any>
}

export type CreateEdgeArgs = Omit<EdgeRequestArgs, 'id'>

export type UpdateEdgeArgs = Omit<EdgeRequestArgs, 'id'> &
  Pick<Required<EdgeRequestArgs>, 'id'>

export type IdList = (string | Uint8Array)[]

export interface RetrieveEdgeArgs {
  idList: IdList
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
}

export interface RetrieveEdgeSDKResponse
  extends Pick<Response, 'code' | 'data' | 'name' | 'message'> {
  data: ResponseDataObject<{ edge: null | Edge[] }>
}

export interface RetrieveDocumentSDKResponse
  extends Pick<Response, 'code' | 'data' | 'name' | 'message'> {
  data: ResponseDataObject<{ doc: null | Doc[] }>
}

export interface RetrieveVertexSDKResponse
  extends Pick<Response, 'code' | 'data' | 'name' | 'message'> {
  data: ResponseDataObject<{ vertex: null | Vertex[] }>
}

export type ResponseDataObject<O> = O & {
  error: Error | AitmedError | ''
  jwt: string
  code: number | ''
}
