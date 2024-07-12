import EtypeCode from './codes/etypes'

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U

export type JWT = string
export type JSONString = string
export type APIVersion = string
export type ENV = 'development' | 'production'

export type UUIDB64 = string
export type UUIDU8 = Uint8Array
export type Etype = EtypeCode
export type DigitCode = string
export type Base64String = string

export class Edge {
  eid: UUIDU8 | UUIDB64
  ctime: number // create time, never be changed
  mtime: number // modify time
  atime: number // last access time
  atimes: number // access times, counter for the number of access
  bvid: UUIDU8 | UUIDB64 // begin vertex on the directive graph.
  type: number
  name: any // searchable public description
  evid: UUIDU8 | UUIDB64 // end vertex on the directive graph.
  subtype: number
  stime: number
  etime: number
  refid: UUIDU8 | UUIDB64 // reference to other entries on the eTable.
  besak: UUIDU8 | UUIDB64
  eesak: UUIDU8 | UUIDB64
  sig: UUIDU8 | UUIDB64
  tage: number // target age
  deat: any
}
export class Vertex {
  id: UUIDU8 | UUIDB64 // uuid
  ctime: number // create time, never be changed
  mtime: number // modify time
  atime: number // last access time
  atimes: number // access times, counter for the number of access
  type: number // External identifiable vertex with login credential, such as by phone number and password or by email and password, etc.s
  subtype: number
  name: any // searchable public description
  esk: UUIDU8 | UUIDB64 // symmetrically encrypted secret key
  pk: UUIDU8 | UUIDB64 // public key
  uid: string //  external user identifiable id, such as a phone number or email address
  deat: any // derived attribute from its edges.
  tage: number // target age
}

export class Doc {
  id: UUIDU8 | UUIDB64 // document id
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
  fid: UUIDU8 | UUIDB64
  eid: UUIDU8 | UUIDB64 // Edge id
  bsig: UUIDU8 | UUIDB64
  esig: UUIDU8 | UUIDB64
  reid?: UUIDU8 | UUIDB64
}

export interface ConfigProps {
  apiHost?: string
  apiVersion?: APIVersion
  configUrl: string
  env: 'development' | 'production'
  forceNewGrpcClient?: boolean
  protocol?: string
}
