import 'dotenv/config'
import { app, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'

import { createMain } from './windows/create-main'
import { createPopover } from './windows/create-popover'
import { createTray } from './tray/create-tray'
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from './shortcuts/global-shurtcuts'

// Importa handlers de IPC para ativar as rotas
import './ipc/tips'
import './ipc/config'
import './ipc/audio'
import './ipc/transcriptions'

// Exemplo de IPC simples para teste
ipcMain.on('ping', () => console.log('pong'))

ipcMain.on('open-config', () => {
  if (!mainWindow) {
    mainWindow = createMain()
  } else {
    mainWindow.show()
    mainWindow.focus()
  }
})

ipcMain.on('toggle-popover', () => {
  console.log('Toggling popover visibility')
  if (popoverWindow) {
    if (popoverWindow.isVisible()) {
      popoverWindow.hide()
    } else {
      popoverWindow.show()
      popoverWindow.focus()
    }
  }
})

let mainWindow: Electron.BrowserWindow | null = null
let popoverWindow: Electron.BrowserWindow | null = null

app.whenReady().then(() => {
  // Define ID para integração melhor no Windows
  electronApp.setAppUserModelId('com.stealthvoice.ai')

  console.log('Criando popover')
  popoverWindow = createPopover()

  // System tray abre a janela de config quando quiser
  createTray(() => {
    if (!mainWindow) {
      mainWindow = createMain()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  }, popoverWindow)
  // Registra atalhos globais vinculados ao popover
  registerGlobalShortcuts(popoverWindow)

  // Watch para atalhos de dev
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Reabre janelas no macOS ao clicar no ícone do dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      popoverWindow = createPopover()
    }
  })
})

// Encerra tudo ao fechar as janelas (menos macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Limpeza dos atalhos globais ao sair
app.on('will-quit', () => {
  unregisterGlobalShortcuts()
})
