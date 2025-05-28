import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { logIPC } from '../utils/logger'
import { createOpenAI } from '@ai-sdk/openai'
import { experimental_transcribe } from 'ai'

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function transcribeAudio(audioBlob: ArrayBuffer): Promise<string> {
  const transcript = await experimental_transcribe({
    model: openai.transcription('whisper-1'),
    audio: audioBlob
  })

  return transcript.text
}

// Diretório onde serão armazenadas as transcrições ou áudios capturados
const audioDir = path.join(process.cwd(), 'audio_captures')

// Garante que o diretório exista
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir)
}

// Handler para salvar um blob de áudio no disco
ipcMain.handle('audio:save', async (_event, filename: string, data: Buffer) => {
  logIPC('audio:save', 'in', { filename, dataLength: data.length })
  const filePath = path.join(audioDir, filename)
  fs.writeFileSync(filePath, data)
  logIPC('audio:save', 'out', { filePath })
  return filePath
})

// Handler para listar todos os arquivos de áudio salvos
ipcMain.handle('audio:list', () => {
  logIPC('audio:list', 'in')
  const files = fs.readdirSync(audioDir).map((file) => ({
    name: file,
    path: path.join(audioDir, file)
  }))

  logIPC('audio:list', 'out', { count: files.length, files })
  return files
})

// Handler para deletar um arquivo específico
ipcMain.handle('audio:delete', (_event, filename: string) => {
  logIPC('audio:delete', 'in', { filename })
  const filePath = path.join(audioDir, filename)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    logIPC('audio:delete', 'out', { success: true })
    return true
  }

  logIPC('audio:delete', 'out', { success: false, reason: 'File not found' })
  return false
})

ipcMain.handle('audio:transcribe', async (_event, arrayBuffer: ArrayBuffer) => {
  logIPC('audio:transcribe', 'in', { arrayBufferLength: arrayBuffer.byteLength })
  try {
    const transcript = await transcribeAudio(arrayBuffer)
    logIPC('audio:transcribe', 'out', { transcript })
    return transcript
  } catch (error) {
    logIPC('audio:transcribe', 'out', {
      error: error instanceof Error ? error.message : String(error)
    })
    return ''
  }
})
