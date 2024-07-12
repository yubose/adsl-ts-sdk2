export type NODE_ENV_LVL2 = 'development' | 'production'
let env = process.env.NODE_ENV_LVL2
let nodeEnv =  env as NODE_ENV_LVL2
if (env == 'production') {
  nodeEnv = 'production'
}
export function isDevelopment() {
  return nodeEnv === "development"
}

export function getNodeEnv() {
  return nodeEnv
}

export function setNodeEnv(env: typeof nodeEnv) {
  nodeEnv = env
}
