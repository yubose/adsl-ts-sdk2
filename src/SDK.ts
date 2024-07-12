
import store from './common/store'
import Account from './services/Account'
import edgeServices from './services/edges'
import vertexServices from './services/vertex'
import documentServices from './services/document'
import utilServices from './utils'
import * as commonServices from './services/common'
import { getNodeEnv, setNodeEnv } from './utils/nodeEnv'
import type { ConfigProps, APIVersion } from './common/types'
import type { NODE_ENV_LVL2 } from './utils/nodeEnv'
import loglevel from './utils/log'


export default class SDK {
  public readonly Account: Account
  public readonly edgeServices: typeof edgeServices
  public readonly documentServices: typeof documentServices
  public readonly vertexServices: typeof vertexServices
  public readonly commonServices: typeof commonServices
  public readonly utilServices: typeof utilServices

  constructor({ apiVersion, apiHost, env, configUrl, loglevel: loglevelProp, protocol }: ConfigProps & { loglevel: keyof typeof loglevel.levels}) {
    setNodeEnv(env)
		if (loglevelProp) loglevel.setLevel(loglevelProp)
    store.configUrl = configUrl
    if (apiVersion) store.apiVersion = apiVersion
    if (apiHost) store.apiHost = apiHost
		if (protocol) store.protocol=protocol

    this.Account = new Account({edgeServices,vertexServices})
    this.edgeServices = edgeServices
    this.documentServices = documentServices
    this.vertexServices = vertexServices
    this.commonServices = commonServices
    this.utilServices = utilServices
  }

  getConfigData() {
    return store.getConfig()
  }

  async loadConfigData(appName?: string): Promise<Record<string, any>> {
    return await store.loadConfig(appName)
  }

  set apiVersion(apiVersion: APIVersion) {
    store.apiVersion = apiVersion
  }

  get apiVersion() {
    return store.apiVersion
  }

  set env(value: NODE_ENV_LVL2) {
    setNodeEnv(value)
  }

  get env() {
    return getNodeEnv()
  }

  get apiHost() {
    return store.apiHost
  }
  set apiHost(value: string) {
    store.apiHost = value
  }
  get apiProtocol() {
    return store.protocol
  }
  set apiProtocol(protocol) {
    store.protocol = protocol
  }

  get configUrl() {
    return store.configUrl
  }

  set configUrl(value: string) {
    store.configUrl = value
  }
}
