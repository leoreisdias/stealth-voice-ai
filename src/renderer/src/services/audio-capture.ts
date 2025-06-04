// src/renderer/src/services/audioCapture.ts
import { AUDIO_PROCESSING_CONFIG } from '@renderer/config/audio-processing'

interface AudioSegment {
  blob: Blob
  timestamp: number
  processed: boolean
}

export class AudioCapture {
  private mediaRecorder: MediaRecorder | null = null
  private audioSegments: AudioSegment[] = []
  private readonly MAX_SEGMENTS = AUDIO_PROCESSING_CONFIG.MAX_AUDIO_SEGMENTS
  private stream: MediaStream | null = null

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: AUDIO_PROCESSING_CONFIG.MIME_TYPE
    })

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.audioSegments.push({
          blob: e.data,
          timestamp: Date.now(),
          processed: false
        })
      }
    }

    // Iniciar gravação contínua - vamos parar/reiniciar para coletar segmentos válidos
    this.mediaRecorder.start()
  }

  async getAndClearRecentChunks(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
        resolve(new Blob([], { type: 'audio/webm' }))
        return
      }

      // Parar a gravação atual para obter um blob válido
      this.mediaRecorder.onstop = () => {
        // Coletar todos os chunks não processados
        const recentChunks = this.audioSegments
          .filter((segment) => !segment.processed)
          .map((segment) => {
            segment.processed = true
            return segment.blob
          })

        const audioBlob = new Blob(recentChunks, { type: 'audio/webm' })

        // Limpeza periódica
        this.cleanupOldSegments()

        // Reiniciar a gravação imediatamente
        if (this.stream && this.stream.active) {
          this.mediaRecorder = new MediaRecorder(this.stream, {
            mimeType: AUDIO_PROCESSING_CONFIG.MIME_TYPE
          })

          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              this.audioSegments.push({
                blob: e.data,
                timestamp: Date.now(),
                processed: false
              })
            }
          }

          this.mediaRecorder.start()
        }

        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  private cleanupOldSegments() {
    if (this.audioSegments.length > this.MAX_SEGMENTS) {
      // Manter apenas os últimos MAX_SEGMENTS
      this.audioSegments = this.audioSegments.slice(-this.MAX_SEGMENTS)
    }
  }

  getMemoryUsage(): number {
    return this.audioSegments.reduce((total, segment) => total + segment.blob.size, 0)
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return resolve(new Blob())

      this.mediaRecorder.onstop = () => {
        // Retornar todos os chunks não processados
        const remainingChunks = this.audioSegments
          .filter((segment) => !segment.processed)
          .map((segment) => segment.blob)

        const audioBlob = new Blob(remainingChunks, { type: 'audio/webm' })

        // Limpar tudo
        this.audioSegments = []

        // Parar stream
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop())
          this.stream = null
        }

        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}

export const audioCapture = new AudioCapture()
