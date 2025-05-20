// src/renderer/services/windowAudioCapture.ts

export class WindowAudioCapture {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []

  async start() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false
      },
      video: false
    })

    this.mediaRecorder = new MediaRecorder(stream)
    this.audioChunks = []

    this.mediaRecorder.ondataavailable = (e) => {
      this.audioChunks.push(e.data)
    }

    this.mediaRecorder.start()
    console.log('🎙️ Captura de áudio da janela iniciada.')
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return resolve(new Blob())

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.audioChunks = []
        console.log('🛑 Captura de áudio da janela parada.')
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }
}

export const windowAudioCapture = new WindowAudioCapture()
