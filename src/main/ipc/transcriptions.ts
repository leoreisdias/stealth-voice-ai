import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { logIPC } from '../utils/logger'

// Diretório onde serão armazenadas as transcrições
const transcriptionDir = path.join(process.cwd(), 'transcriptions')

// Garante que o diretório exista
if (!fs.existsSync(transcriptionDir)) {
  fs.mkdirSync(transcriptionDir)
}

// Handler para salvar uma transcrição
ipcMain.handle('transcription:save', async (_event, filename: string, content: string) => {
  logIPC('transcription:save', 'in', { filename, contentLength: content.length })
  const filePath = path.join(transcriptionDir, `${filename}.txt`)
  fs.writeFileSync(filePath, content, 'utf-8')
  logIPC('transcription:save', 'out', { filePath })
  return filePath
})

// Handler para listar todas as transcrições
ipcMain.handle('transcription:list', () => {
  logIPC('transcription:list', 'in')
  const files = fs.readdirSync(transcriptionDir).map((file) => ({
    name: file,

    path: path.join(transcriptionDir, file)
  }))
  logIPC('transcription:list', 'out', { count: files.length, files })
  return files
})

// Handler para ler uma transcrição específica
ipcMain.handle('transcription:read', (_event, filename: string) => {
  logIPC('transcription:read', 'in', { filename })
  const filePath = path.join(transcriptionDir, filename)
  if (fs.existsSync(filePath)) {
    logIPC('transcription:read', 'out', { filePath })
    return fs.readFileSync(filePath, 'utf-8')
  }

  logIPC('transcription:read', 'out', { error: 'File not found' })
  return null
})

// Handler para deletar uma transcrição
ipcMain.handle('transcription:delete', (_event, filename: string) => {
  logIPC('transcription:delete', 'in', { filename })

  const filePath = path.join(transcriptionDir, filename)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    logIPC('transcription:delete', 'out', { success: true })
    return true
  }

  logIPC('transcription:delete', 'out', { success: false, reason: 'File not found' })
  return false
})
