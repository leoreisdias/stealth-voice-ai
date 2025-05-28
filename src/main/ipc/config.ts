import { ipcMain } from 'electron'
import store, { ConfigSchema } from '../store'
import { logIPC } from '../utils/logger'

// Handler para salvar uma configuração
ipcMain.handle('config:set', (_event, key: keyof ConfigSchema, value: any) => {
  logIPC('config:set', 'in', { key, value })
  store.set(key, value)
  logIPC('config:set', 'out', true)
  return true
})

// Handler para obter uma configuração
ipcMain.handle('config:get', (_event, key: keyof ConfigSchema) => {
  logIPC('config:get', 'in', { key })
  const value = store.get(key)
  logIPC('config:get', 'out', { key, value })
  return value
})

// Handler para obter todas as configurações
ipcMain.handle('config:get-all', () => {
  logIPC('config:get-all', 'in')
  const allConfigs = store.store
  logIPC('config:get-all', 'out', allConfigs)
  return allConfigs // Retorna todas as chaves armazenadas
})
