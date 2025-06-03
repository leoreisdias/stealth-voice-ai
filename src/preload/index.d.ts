import { CoreMessage } from 'ai'

export {}

declare global {
  interface Window {
    electron: typeof import('@electron-toolkit/preload').electronAPI
    api: {
      popover: {
        expand: () => void
      }
      openConfig: () => void
      togglePopover: () => void
      tips: {
        generate: (prompts: { messages: CoreMessage[] }) => Promise<CoreMessage[]>
      }
      config: {
        set: (key: string, value: any) => Promise<any>
        get: (key: string) => Promise<any>
        getAll: () => Promise<any>
      }
      audio: {
        transcribe: (arrayBuffer: ArrayBuffer) => Promise<string>
        save: (filename: string, data: Buffer) => Promise<any>
        list: () => Promise<any>
        delete: (filename: string) => Promise<any>
      }
      transcription: {
        save: (filename: string, content: string) => Promise<any>
        list: () => Promise<any>
        read: (filename: string) => Promise<any>
        delete: (filename: string) => Promise<any>
      }
    }
  }
}
