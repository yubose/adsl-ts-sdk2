import { UUIDU8 } from '../../common/types'

export interface VertexRequestArgs extends GenerateGRPCVertexArgs {}
export interface GenerateGRPCVertexArgs {
  tage?: number
  id?: string | Uint8Array
  type?: number
  subtype?: number
  name?: Record<string, any>
  deat?: Record<string, any>
  atimes?: number
  pk?: UUIDU8
  esk?: UUIDU8
  uid?: string
  jwt?: string
}

export type CreateVertexArgs = Omit<VertexRequestArgs, 'id'>

export type UpdateVertexArgs = Omit<VertexRequestArgs, 'id'> &
  Pick<Required<VertexRequestArgs>, 'id'>

export interface RetrieveVertexArgs {
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
    jwtNoUse?: boolean
  }
}
