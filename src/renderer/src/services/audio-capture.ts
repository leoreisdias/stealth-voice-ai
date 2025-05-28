// src/renderer/src/services/audioCapture.ts

export class AudioCapture {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []

  async start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.mediaRecorder = new MediaRecorder(stream)
    this.mediaRecorder.ondataavailable = (e) => {
      this.audioChunks.push(e.data)
    }
    this.mediaRecorder.start()
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return resolve(new Blob())

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        this.audioChunks = []
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }
}

export const audioCapture = new AudioCapture()
