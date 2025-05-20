import { audioCapture } from '@renderer/services/audio-capture'
import { transcribeAudio } from '@renderer/services/transcribe-audio'
import { Flex } from '@styled-system/jsx'
import { useState } from 'react'

export function UserRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  const handleStart = async () => {
    await audioCapture.start()
    setIsRecording(true)
  }

  const handleStop = async () => {
    const audioBlob = await audioCapture.stop()
    setIsRecording(false)

    // Aqui você pode enviar o `audioBlob` para a API ou salvar localmente
    console.log('Áudio capturado:', audioBlob)
    const arrayBuffer = await audioBlob.arrayBuffer()
    // const transcript = await transcribeAudio(arrayBuffer)
    // setTranscript(transcript)
    // // Exemplo: transformar em URL e tocar o áudio
    const url = URL.createObjectURL(audioBlob)
    const audio = new Audio(url)
    audio.play()
    // const
  }

  return (
    <div>
      {!isRecording ? (
        <button onClick={handleStart}>🎙️ Iniciar Gravação</button>
      ) : (
        <button onClick={handleStop}>⏹️ Parar Gravação</button>
      )}
      {!!transcript && <Flex>{transcript}</Flex>}
    </div>
  )
}
