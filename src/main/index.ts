import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  session,
  desktopCapturer,
  globalShortcut,
  Tray,
  Menu,
  nativeImage
} from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Store from 'electron-store'

let tray: Tray | null = null
let mainWindow: BrowserWindow

function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../../resources/stealth-icon.png') // ou qualquer ícone que você tenha
  )

  tray = new Tray(icon)
  tray.setToolTip('Stealth Audio')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        tray?.destroy()
        mainWindow?.destroy()
        app.quit() // pode ser app.exit() também
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  // Clique duplo também abre
  tray.on('double-click', () => {
    if (!mainWindow) return

    if (mainWindow.isVisible()) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    } else {
      mainWindow.show()
    }
  })
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: true,
    autoHideMenuBar: true,
    alwaysOnTop: false,

    title: 'Stealth Audio',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      webSecurity: false,
      nodeIntegration: true
    }
  })

  mainWindow.setAlwaysOnTop(true, 'screen-saver') // Mantenha a janela sempre no topo
  mainWindow.setVisibleOnAllWorkspaces(true)
  if (mainWindow.setIgnoreMouseEvents) mainWindow.setIgnoreMouseEvents(false) // Controla se a janela passa ou não eventos de clique
  if (mainWindow.setContentProtection) mainWindow.setContentProtection(true) // Evita captura por gravação de tela (quando suportado)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
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

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow.hide() // Oculta a janela mas mantém o app rodando
  })
}

let popoverWindow: BrowserWindow | null = null

function createPopover() {
  if (popoverWindow) {
    popoverWindow.show()
    return
  }

  popoverWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js')
    }
  })

  popoverWindow.loadURL('http://localhost:5173/popover') // Rota separada no Vite

  popoverWindow.setContentProtection(true)

  popoverWindow.on('closed', () => {
    popoverWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()
  createTray()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  globalShortcut.register('CommandOrControl+Shift+Y', () => {
    if (popoverWindow && popoverWindow.isVisible()) {
      popoverWindow.hide()
    } else {
      createPopover()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const store = new Store()
// Salva a chave
ipcMain.handle('openai:set-key', (_event, key: string) => {
  store.set('openai_key', key)
  return true
})

// Retorna a chave
ipcMain.handle('openai:get-key', () => {
  return store.get('openai_key', '')
})
