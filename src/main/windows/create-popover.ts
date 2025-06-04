import { BrowserWindow, desktopCapturer, ipcMain, session } from 'electron'
import path from 'path'
import { is } from '@electron-toolkit/utils'

let popoverWindow: BrowserWindow | null = null

ipcMain.on('expand', (_) => {
  if (!popoverWindow) return

  const [width] = popoverWindow.getSize()
  popoverWindow.setSize(width, 340)
})

ipcMain.on('collapse', (_) => {
  if (!popoverWindow) return

  const [width] = popoverWindow.getSize()
  popoverWindow.setSize(width, 100)
})

export function createPopover(): BrowserWindow {
  if (popoverWindow) {
    popoverWindow.show()
    return popoverWindow
  }

  popoverWindow = new BrowserWindow({
    width: 600,
    height: 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: true,
      webSecurity: false // Necessário para carregar URLs locais
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

  session.defaultSession.setDisplayMediaRequestHandler(
    (_request, callback) => {
      desktopCapturer.getSources({ types: ['window', 'screen'] }).then((sources) => {
        sources.forEach((source) => console.log('Fonte:', source.name, 'ID:', source.id))
        // Aqui você pode escolher uma janela específica (ex: Meet, Zoom)
        const meetWindow = sources.find((src) => {
          console.log(src.name)
          return src.name.includes('Screen 1') // Caso queira capturar a aba do navegador
        })

        console.log('Janela Meet:', meetWindow)
        if (meetWindow) {
          callback({ video: meetWindow, audio: 'loopback' })
        } else {
          callback({ video: sources[0], audio: 'loopback' }) // Fallback
        }
      })
    },
    { useSystemPicker: true }
  )

  return popoverWindow
}
