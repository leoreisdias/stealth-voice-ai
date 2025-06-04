import { AUDIO_PROCESSING_CONFIG } from '@renderer/config/audio-processing'

export async function normalizeAudioBlob(blob: Blob): Promise<Blob> {
  const isAudioSmall = blob.size < AUDIO_PROCESSING_CONFIG.MIN_AUDIO_SIZE

  if (isAudioSmall) return blob

  const arrayBuffer = await blob.arrayBuffer()

  const audioContext = new AudioContext()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  const numberOfChannels = audioBuffer.numberOfChannels
  const length = audioBuffer.length
  const sampleRate = audioBuffer.sampleRate

  // Cria um novo buffer normalizado
  const normalizedBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate)

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel)
    const outputData = normalizedBuffer.getChannelData(channel)

    let peak = 0
    for (let i = 0; i < inputData.length; i++) {
      const absValue = Math.abs(inputData[i])
      if (absValue > peak) peak = absValue
    }

    // Define o ganho necessário para normalizar o áudio (pico de 1.0)
    const normalizationGain = peak > 0 ? 1.0 / peak : 1.0

    // Aplica o ganho de normalização
    for (let i = 0; i < inputData.length; i++) {
      outputData[i] = inputData[i] * normalizationGain
    }
  }

  // Converte o buffer normalizado de volta para Blob
  const normalizedBlob = await audioBufferToBlob(normalizedBuffer)

  return normalizedBlob
}

// Função auxiliar para converter o AudioBuffer de volta para Blob (usando WAV como exemplo)
async function audioBufferToBlob(buffer: AudioBuffer): Promise<Blob> {
  const wavArrayBuffer = await encodeWAV(buffer)
  return new Blob([wavArrayBuffer], { type: 'audio/wav' })
}

// Encoder simples para WAV (pode usar uma lib mais completa se precisar)
async function encodeWAV(buffer: AudioBuffer): Promise<ArrayBuffer> {
  const numOfChan = buffer.numberOfChannels
  const length = buffer.length * numOfChan * 2 + 44
  const bufferOut = new ArrayBuffer(length)
  const view = new DataView(bufferOut)

  // Escreve cabeçalho WAV
  function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + buffer.length * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // PCM
  view.setUint16(20, 1, true) // Linear quantization
  view.setUint16(22, numOfChan, true)
  view.setUint32(24, buffer.sampleRate, true)
  view.setUint32(28, buffer.sampleRate * numOfChan * 2, true)
  view.setUint16(32, numOfChan * 2, true)
  view.setUint16(34, 16, true) // 16-bit
  writeString(view, 36, 'data')
  view.setUint32(40, buffer.length * numOfChan * 2, true)

  // Interleaving channels
  let offset = 44
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      const sample = buffer.getChannelData(channel)[i]
      const clamped = Math.max(-1, Math.min(1, sample))
      view.setInt16(offset, clamped * 0x7fff, true)
      offset += 2
    }
  }

  return bufferOut
}
