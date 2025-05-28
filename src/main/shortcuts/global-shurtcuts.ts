import { globalShortcut, BrowserWindow } from 'electron'

// Função para registrar atalhos globais
export function registerGlobalShortcuts(popoverWindow: BrowserWindow) {
  // Exemplo: atalho para mostrar/ocultar o popover
  globalShortcut.register('CommandOrControl+Y', () => {
    if (popoverWindow.isVisible()) {
      popoverWindow.hide()
    } else {
      popoverWindow.show()
      popoverWindow.focus()
    }
  })
}

// Função para limpar todos os atalhos registrados
export function unregisterGlobalShortcuts() {
  globalShortcut.unregisterAll()
}
