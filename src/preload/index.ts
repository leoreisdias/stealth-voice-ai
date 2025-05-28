/// <reference path="./index.d.ts" />
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openConfig: () => window.electron.ipcRenderer.send('open-config'),
  config: {
    set: (key: string, value: any) => window.electron.ipcRenderer.invoke('config:set', key, value),
    get: (key: string) => window.electron.ipcRenderer.invoke('config:get', key),
    getAll: () => window.electron.ipcRenderer.invoke('config:get-all')
  },
  audio: {
    save: (filename: string, data: Buffer) =>
      window.electron.ipcRenderer.invoke('audio:save', filename, data),
    list: () => window.electron.ipcRenderer.invoke('audio:list'),
    delete: (filename: string) => window.electron.ipcRenderer.invoke('audio:delete', filename)
  },
  transcription: {
    save: (filename: string, content: string) =>
      window.electron.ipcRenderer.invoke('transcription:save', filename, content),
    list: () => window.electron.ipcRenderer.invoke('transcription:list'),
    read: (filename: string) => window.electron.ipcRenderer.invoke('transcription:read', filename),
    delete: (filename: string) =>
      window.electron.ipcRenderer.invoke('transcription:delete', filename)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
