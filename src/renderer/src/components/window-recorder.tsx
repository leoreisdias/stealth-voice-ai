import { normalizeAudioBlob } from '@renderer/services/normalizer'
import { windowAudioCapture } from '@renderer/services/system-audio'
import { transcribeAudio } from '@renderer/services/transcribe-audio'
import { useState } from 'react'

export function WindowRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  const handleStart = async () => {
    await windowAudioCapture.start()
    setIsRecording(true)
  }

  const handleStop = async () => {
    const audioBlob = await windowAudioCapture.stop()
    setIsRecording(false)
    const normalizedBlob = await normalizeAudioBlob(audioBlob)
    // Aqui você pode transcrever o áudio como já fez antes!
    console.log('🎧 Áudio capturado:', normalizedBlob)
    const arrayBuffer = await normalizedBlob.arrayBuffer()
    const transcript = await transcribeAudio(arrayBuffer)
    setTranscript(transcript)

    // Exemplo: Tocar o áudio capturado
    // const url = URL.createObjectURL(audioBlob)
    // const audio = new Audio(url)

    // const audioContext = new AudioContext()
    // const source = audioContext.createMediaElementSource(audio)
    // const gainNode = audioContext.createGain()
    // source.connect(gainNode).connect(audioContext.destination)
    // gainNode.gain.value = 10 // Aumenta o volume 5x
    // audio.play()
  }

  return (
    <div>
      {!isRecording ? (
        <button onClick={handleStart}>🎙️ Iniciar Captura da Janela</button>
      ) : (
        <button onClick={handleStop}>⏹️ Parar Captura</button>
      )}
      <div>
        <h3>Transcrição:</h3>
        <p>{transcript}</p>
      </div>
    </div>
  )
}
