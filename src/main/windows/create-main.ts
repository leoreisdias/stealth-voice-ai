import { BrowserWindow, shell } from 'electron'
import path from 'path'
import { is } from '@electron-toolkit/utils'

let mainWindow: BrowserWindow | null = null

// Função para criar ou mostrar a janela principal
export function createMain(): BrowserWindow {
  // Se já existe, só mostra e retorna
  if (mainWindow) {
    mainWindow.show()
    return mainWindow
  }

  // Criação da janela principal com configurações
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    frame: true, // Mantém a barra padrão do sistema
    autoHideMenuBar: true, // Oculta automaticamente o menu
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'), // Preload para IPC seguro
      contextIsolation: true, // Mantém isolamento de contexto
      sandbox: false // Desativa sandbox se não necessário
    }
  })

  // Carrega a URL de desenvolvimento ou o arquivo de produção
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Define comportamento ao tentar abrir nova janela: abre no navegador padrão
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' } // Bloqueia abertura no Electron
  })

  // Ao fechar, apenas esconde a janela — não encerra o app
  mainWindow.on('close', (event) => {
    event.preventDefault()
    mainWindow?.hide()
  })

  return mainWindow
}
