import { audioCapture } from '@renderer/services/audio-capture'
import { normalizeAudioBlob } from '@renderer/services/normalizer'
import { windowAudioCapture } from '@renderer/services/system-audio'
import { generateTip } from '@renderer/services/tip'
import { transcribeAudio } from '@renderer/services/transcribe-audio'
import { Flex } from '@styled-system/jsx'
import { useState } from 'react'
import { Button, ButtonGlow } from './ui/button'

export function Recorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [userTranscript, setUserTranscript] = useState('')
  const [mediaTranscript, setMediaTranscript] = useState('')
  const [tip, setTip] = useState('')

  const handleStart = async () => {
    await audioCapture.start()
    await windowAudioCapture.start()

    setIsRecording(true)
  }

  const handleUserStop = async () => {
    const audioBlob = await audioCapture.stop()
    setIsRecording(false)

    // Aqui você pode enviar o `audioBlob` para a API ou salvar localmente
    console.log('Áudio capturado:', audioBlob)
    const arrayBuffer = await audioBlob.arrayBuffer()
    const transcript = await transcribeAudio(arrayBuffer)
    setUserTranscript(transcript)

    return transcript
    // // Exemplo: transformar em URL e tocar o áudio
    // const url = URL.createObjectURL(audioBlob)
    // const audio = new Audio(url)
    // audio.play()
    // const
  }

  const handleMediaStop = async () => {
    const audioBlob = await windowAudioCapture.stop()
    setIsRecording(false)
    const normalizedBlob = await normalizeAudioBlob(audioBlob)
    // Aqui você pode transcrever o áudio como já fez antes!
    console.log('🎧 Áudio capturado:', normalizedBlob)
    const arrayBuffer = await normalizedBlob.arrayBuffer()
    const transcript = await transcribeAudio(arrayBuffer)
    setMediaTranscript(transcript)

    return transcript
  }

  const handleStop = async () => {
    const [userTranscript, mediaTranscript] = await Promise.all([
      handleUserStop(),
      handleMediaStop()
    ])

    const tip = await generateTip(userTranscript, mediaTranscript)
    setTip(tip)
  }

  return (
    <Flex w="full" justify={'center'} mt={10}>
      {!isRecording ? (
        <ButtonGlow>🎙️ Iniciar Gravação</ButtonGlow>
      ) : (
        <button onClick={handleStop}>⏹️ Parar Gravação</button>
      )}
      {!!userTranscript && <Flex>Usuario: {userTranscript}</Flex>}
      {!!mediaTranscript && <Flex>Media: {mediaTranscript}</Flex>}
      {!!tip && (
        <Flex>
          <h3>Tip:</h3>
          <p>{tip}</p>
        </Flex>
      )}
    </Flex>
  )
}
