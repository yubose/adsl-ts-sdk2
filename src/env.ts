let _env: 'stable' | 'test'

export const getEnv = function() {
  return _env
}

export const setEnv = function(env: typeof _env) {
  _env = env
}
