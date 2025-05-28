import { BrowserWindow } from 'electron'
import path from 'path'
import { is } from '@electron-toolkit/utils'

let popoverWindow: BrowserWindow | null = null

export function createPopover(): BrowserWindow {
  if (popoverWindow) {
    popoverWindow.show()
    return popoverWindow
  }

  popoverWindow = new BrowserWindow({
    width: 600,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    popoverWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/popover`)
  } else {
    popoverWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  popoverWindow.on('closed', () => {
    popoverWindow = null
  })

  popoverWindow.on('will-resize', (e) => {
    e.preventDefault()
    popoverWindow?.unmaximize() // Garante que não fique maximizado
  })

  return popoverWindow
}
