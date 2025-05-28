import { audioCapture } from '@renderer/services/audio-capture'
import { normalizeAudioBlob } from '@renderer/services/normalizer'
import { windowAudioCapture } from '@renderer/services/system-audio'
import { useState } from 'react'
import { Mic } from 'lucide-react'
import { BoxMotion } from './ui/motion'
import { usePopoverContext } from '@renderer/contexts/popover'

export function Recorder() {
  const [isRecording, setIsRecording] = useState(false)
  const { setCurrentTip, setIsProcessing } = usePopoverContext()

  const handleUserStop = async () => {
    const audioBlob = await audioCapture.stop()
    setIsRecording(false)

    // Aqui você pode enviar o `audioBlob` para a API ou salvar localmente
    console.log('Áudio capturado:', audioBlob)
    const arrayBuffer = await audioBlob.arrayBuffer()
    const transcript = await window.api.audio.transcribe(arrayBuffer)
    console.log('Transcrição do áudio do usuário:', transcript)

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
    const transcript = await window.api.audio.transcribe(arrayBuffer)
    console.log('Transcrição do áudio da mídia:', transcript)

    return transcript
  }

  const handleStop = async () => {
    try {
      setCurrentTip('')
      setIsProcessing(true)
      const [userTranscript, mediaTranscript] = await Promise.all([
        handleUserStop(),
        handleMediaStop()
      ])

      const tip = await window.api.tips.generate({
        mediaPrompt: mediaTranscript,
        userPrompt: userTranscript
      })
      setCurrentTip(tip)
    } finally {
      setIsProcessing(false)
      console.log('Recording stopped')
    }
  }

  const toggle = async () => {
    console.log('Toggling recording state:', isRecording)
    if (isRecording) return handleStop()

    await audioCapture.start()
    console.log('User audio capture started')
    await windowAudioCapture.start()

    setIsRecording(true)
  }

  return (
    <BoxMotion
      w="24px"
      h="24px"
      bg="#007AFF"
      borderRadius="50%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      style={{
        // @ts-ignore electron needs this
        WebkitAppRegion: 'no-drag'
      }}
      onClick={() => {
        toggle()
      }}
      animate={
        isRecording
          ? { backgroundColor: ['#ff0000', '#ffffff', '#ff0000'] }
          : { backgroundColor: '#007AFF' }
      }
      transition={
        isRecording ? { repeat: Infinity, duration: 1.2, ease: 'easeIn', repeatType: 'loop' } : {}
      }
    >
      <Mic size={14} />
      {isRecording ?? 'sim'}
    </BoxMotion>
    // <Flex w="full" justify={'center'} mt={10}>
    //   {!isRecording ? (
    //     <ButtonGlow onClick={handleStart}>🎙️ Iniciar Gravação</ButtonGlow>
    //   ) : (
    //     <button onClick={handleStop}>⏹️ Parar Gravação</button>
    //   )}
    //   {!!userTranscript && <Flex>Usuario: {userTranscript}</Flex>}
    //   {!!mediaTranscript && <Flex>Media: {mediaTranscript}</Flex>}
    //   {!!tip && (
    //     <Flex>
    //       <h3>Tip:</h3>
    //       <p>{tip}</p>
    //     </Flex>
    //   )}
    // </Flex>
  )
}
