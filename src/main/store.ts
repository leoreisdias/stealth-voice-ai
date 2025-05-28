// eslint-disable-next-line @typescript-eslint/no-require-imports
const Store = require('electron-store')
// Define o schema das configurações do app
export type ConfigSchema = {
  open_router_key: string
  capture_mode: 'mic' | 'system' | 'both'
  user_context: string
  conversation_context: string
}

const store = new Store() as {
  get<K extends keyof ConfigSchema>(key: K): ConfigSchema[K]
  set<K extends keyof ConfigSchema>(key: K, value: ConfigSchema[K]): void
  store: ConfigSchema
}

export default store
