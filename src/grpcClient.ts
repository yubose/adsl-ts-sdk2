import EcosAPIClientV1Beta1 from '@aitmed/protorepo'
import type {
  EcosAPIClient,
  GrpcUnaryInterceptor,
  GrpcStreamInterceptor,
} from './types'

let grpcClient: EcosAPIClient | undefined

export interface GetEcosAPIClientProps {
  /**
   * Force a new gRPC client to be created. If this is not true, 
   */
  force?: boolean
  url?: string
  credentials?: EcosAPIClient['credentials_']
  options?: {
    streamInterceptors?: GrpcStreamInterceptor<any, any>[]
    unaryInterceptors?: GrpcUnaryInterceptor<any, any>[]
    [key: string]: any
  }
  apiVersion?: string
}

const getEcosAPIClient = ({
  url = '',
  credentials,
  options,
  apiVersion = 'v1beta1',
  force,
}: GetEcosAPIClientProps = {}): EcosAPIClient | null => {
  switch (apiVersion.trim().toLowerCase()) {
    case 'v1beta1': {
      if (!grpcClient || force === true) {
        grpcClient = new EcosAPIClientV1Beta1(url, credentials, options)
      }
      return grpcClient
    }
    default:
      return null
  }
}

export default getEcosAPIClient
