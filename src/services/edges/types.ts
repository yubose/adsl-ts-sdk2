export interface EdgeRequestArgs extends GenerateGRPCEdgeArgs {
  isEncrypt?: boolean
}

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
  refid?: Uint8Array | string
  besak?: Uint8Array | string
  eesak?: Uint8Array | string
  sig?: Uint8Array | string
  isEncrypt?: boolean
  jwt?: string
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

export interface RetrieveEdgeArgs {
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
}
