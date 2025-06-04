/// <reference path="./index.d.ts" />
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { CoreMessage } from 'ai'

// Custom APIs for renderer
const api = {
  popover: {
    expand: () => electronAPI.ipcRenderer.send('expand'),
    collapse: () => electronAPI.ipcRenderer.send('collapse')
  },
  openConfig: () => electronAPI.ipcRenderer.send('open-config'),
  togglePopover: () => electronAPI.ipcRenderer.send('toggle-popover'),
  tips: {
    generate: (prompts: { messages: CoreMessage[] }) =>
      electronAPI.ipcRenderer.invoke('tips:generate', prompts)
  },
  config: {
    set: (key: string, value: any) => electronAPI.ipcRenderer.invoke('config:set', key, value),
    get: (key: string) => electronAPI.ipcRenderer.invoke('config:get', key),
    getAll: () => electronAPI.ipcRenderer.invoke('config:get-all')
  },
  audio: {
    transcribe: (arrayBuffer: ArrayBuffer) =>
      electronAPI.ipcRenderer.invoke('audio:transcribe', arrayBuffer),
    save: (filename: string, data: Buffer) =>
      electronAPI.ipcRenderer.invoke('audio:save', filename, data),
    list: () => electronAPI.ipcRenderer.invoke('audio:list'),
    delete: (filename: string) => electronAPI.ipcRenderer.invoke('audio:delete', filename)
  },
  transcription: {
    save: (filename: string, content: string) =>
      electronAPI.ipcRenderer.invoke('transcription:save', filename, content),
    list: () => electronAPI.ipcRenderer.invoke('transcription:list'),
    read: (filename: string) => electronAPI.ipcRenderer.invoke('transcription:read', filename),
    delete: (filename: string) => electronAPI.ipcRenderer.invoke('transcription:delete', filename)
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
