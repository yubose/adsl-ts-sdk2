import { UUIDU8 } from '../../common/types'

export interface RetrieveDocumentArgs {
  idList: (string | Uint8Array)[]
  callBack?: any
}
export interface AttachDocumentArgs {
  eid: UUIDU8
  documentInfo?: Record<string, any>
  data: Uint8Array
  size: number
}

export interface GenerateGRPCDocumentArgs {
  id?: Uint8Array | string

  type?: number
  subtype?: number
  name?: Record<string, any>
  deat?: Record<string, any>

  size?: number

  fid?: Uint8Array | string
  eid?: Uint8Array | string
  bSig?: Uint8Array | string
  eSig?: Uint8Array | string

  ctime?: number
  mtime?: number
  atime?: number
  atimes?: number
  tage?: number
  jwt?: string
}

export interface DocumentRequestArgs extends GenerateGRPCDocumentArgs {}

export type CreateDocumentArgs = Omit<DocumentRequestArgs, 'id'>

export type UpdateDocumentArgs = Omit<DocumentRequestArgs, 'id'> &
  Pick<Required<DocumentRequestArgs>, 'id'>

export interface UploadDocumentToS3 {
  url: string
  sig: string
  data: Uint8Array | string
}

export interface DownloadDocumentFromS3 {
  url: string
}
