import { Tray, Menu, nativeImage, app } from 'electron'
import path from 'path'

let tray: Tray | null = null

// Função para criar e configurar o system tray
export function createTray(openConfigWindow: () => void) {
  const iconPath = path.join(__dirname, '../../resources/icon.png')

  const trayIcon = nativeImage.createFromPath(iconPath)
  tray = new Tray(trayIcon)

  tray.setToolTip('Stealth Voice AI')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir Configurações',
      click: () => {
        openConfigWindow() // Agora chama a função ao invés de acessar o objeto
      }
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    openConfigWindow()
  })

  return tray
}
