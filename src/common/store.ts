import axios from 'axios'
import YAML from 'yaml'
import { APIVersion, ConfigProps } from './types'
import { getNodeEnv, setNodeEnv } from '../utils/nodeEnv'
import log from '../utils/log'
import getEcosAPIClient from '../grpcClient'
import type {
  EcosAPIClient,
  GrpcStreamInterceptor,
  GrpcUnaryInterceptor,
} from '../types'

export interface ConfigData {
  apiHost: string
  apiPort: string
  appApiHost?: string
  connectiontimeout?: string
  loadingLevel?: number
  timestamp?: string
  versionNumber?: number
  webApiHost?: string
  web?: any
  ios?: any
  android?: any
  cadlEndpoint?: string
}

const CONFIG_NAME = 'config'

class Store {
  private apiPort: string = '443'
  private _apiHost: string
  private _apiVersion: APIVersion
  private _configUrl: string
  private _protocol: string
  #interceptors = {
    stream: [] as GrpcStreamInterceptor<any, any>[],
    unary: [] as GrpcUnaryInterceptor<any, any>[],
  }

  grpcClient: EcosAPIClient | null

  constructor({
    apiVersion,
    apiHost,
    env,
    configUrl,
    forceNewGrpcClient,
    protocol = 'https',
  }: ConfigProps) {
    setNodeEnv(env)
    this.configUrl = configUrl
    if (apiHost) this.apiHost = apiHost
    if (apiVersion) this.apiVersion = apiVersion
    this._protocol = protocol

    const config = this.getConfig()
    if (config) {
      if (config.webApiHost && config.webApiHost !== 'apiHost') {
        this.apiHost = config.webApiHost
      } else {
        this.apiHost = config.apiHost
      }
      this.apiPort = config.apiPort
    }
    this.generateGrpcCLient({ force: forceNewGrpcClient })
  }

  private generateGrpcCLient({ force: forceNewGrpcClient }: { force?: boolean } = {}) {
    if (this.apiHost) {
      let url = `${this._protocol}://${this.apiHost}`
      // allow connect local http ecos-server
      if(this.apiHost.startsWith('http')) {
        const config = this.getConfig()
        url = `${this.apiHost}:${config.apiPort}`
      }
      this.grpcClient = getEcosAPIClient({
        force: forceNewGrpcClient,
        options: {
          streamInterceptors: this.#interceptors.stream,
          unaryInterceptors: this.#interceptors.unary,
        },
        url,
        apiVersion: this.apiVersion,
      })
    }
  }

  getConfig() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const config = localStorage.getItem(CONFIG_NAME)
        if (config === null) return null
        const configData: ConfigData = YAML.parse(config)
        return configData
      } catch (error) {
        log.error(error instanceof Error ? error : new Error(String(error)))
      }
    }
    return null
  }

  async loadConfig(appName?: string, { forceNewGrpcClient }: { forceNewGrpcClient?: boolean } = {}): Promise<ConfigData> {
    if (typeof window === 'undefined') {
      return { apiHost: this.apiHost, apiPort: this.apiPort }
    }

    // Getting app name from hostname
    appName = appName ? appName : 'aitmed'
    if (typeof window !== 'undefined') {
      if (window && window.location && window.location.hostname) {
        const hostname = window.location.hostname
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
          const splits = hostname.split('.')
          if (splits[1] === 'aitmed') {
            appName = splits[0]
          } else {
            appName = splits.slice(0, splits.length - 1).join('.')
          }
        }
      }
    }

    let url
    //permits overriding of config url
    if (this.configUrl.endsWith('.yml')) {
      url = this.configUrl
    } else {
      url = `${this.configUrl}/${appName}.yml`
    }
    // Getting config data from {appName}.yml
    const configData: ConfigData = await axios({
        url:url,
        method: 'get',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      .then(({ data }) => data)
      .catch(async () => {
        //TODO: should an override have a default?
        const urlArr = url.split('/')
        urlArr.pop()
        const defaultUrl = urlArr.join('/')
        const aitmedConfig = await axios({
          url:`${defaultUrl}/aitmed.yml`,
          method: 'get',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
          .then(({ data }) => data)
        return aitmedConfig
      })

    let config
    try {
      //@ts-ignore
      config = YAML.parse(configData)
      let configJSON = JSON.stringify(config)
      if (typeof window !== 'undefined') {
        localStorage.setItem(CONFIG_NAME, configJSON)
      }
    } catch (error) {
      log.error(error instanceof Error ? error : new Error(String(error)))
    }
    if (config) {
      if (config.webApiHost && config.webApiHost !== 'apiHost') {
        this.apiHost = config.webApiHost
      } else {
        this.apiHost = config.apiHost
      }
      this.apiPort = config.apiPort
    }
    this.generateGrpcCLient({ force: forceNewGrpcClient })
    return config
  }

  cleanConfig() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const config = localStorage.getItem(CONFIG_NAME)
      if (config !== null) {
        localStorage.removeItem(CONFIG_NAME)
      }
    }
  }

  useInterceptor<Req, Resp>(
    type: 'stream',
    interceptor: GrpcStreamInterceptor<Req, Resp>,
  ): this

  useInterceptor<Req, Resp>(
    type: 'unary',
    interceptor: GrpcUnaryInterceptor<Req, Resp>,
  ): this

  useInterceptor<
    T extends 'stream' | 'unary',
    ReqMessage = any,
    RespMessage = any,
  >(
    type: T,
    interceptor:
      | GrpcUnaryInterceptor<ReqMessage, RespMessage>
      | GrpcStreamInterceptor<ReqMessage, RespMessage>,
  ) {
    this.#interceptors[type].push(interceptor as any)
    return this
  }

  set apiVersion(newApiVersion) {
    this._apiVersion = newApiVersion
    this.generateGrpcCLient()
  }
  get apiVersion() {
    return this._apiVersion
  }

  set env(value) {
    setNodeEnv(value)
  }

  get env() {
    return getNodeEnv()
  }

  get apiHost() {
    return this._apiHost
  }
  set apiHost(value: string) {
    this._apiHost = value
    this.generateGrpcCLient()
  }
  set protocol(protocol: string) {
    this._protocol = protocol
  }

  get configUrl() {
    return this._configUrl
  }
  set configUrl(value: string) {
    this._configUrl = value
  }
}

const store = new Store({
  env: 'development',
  configUrl: 'https://.aitmed.com/config',
})

export default store
