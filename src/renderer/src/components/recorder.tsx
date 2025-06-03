import { audioCapture } from '@renderer/services/audio-capture'
import { normalizeAudioBlob } from '@renderer/services/normalizer'
import { windowAudioCapture } from '@renderer/services/system-audio'
import { useState, useEffect, useRef } from 'react'
import { Mic } from 'lucide-react'
import { BoxMotion } from './ui/motion'
import { usePopoverContext } from '@renderer/contexts/popover'
import { Box } from '@styled-system/jsx'
import { CoreMessage } from 'ai'

const useRecordTimer = () => {
  const [recordingTime, setRecordingTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = () => {
    setRecordingTime(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const resetTimer = () => {
    stopTimer()
    setRecordingTime(0)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    recordingTime,
    formattedTime: formatTime(recordingTime),
    startTimer,
    stopTimer,
    resetTimer
  }
}

export function Recorder() {
  const [isRecording, setIsRecording] = useState(false)
  const { setMessages, setIsProcessing, messages } = usePopoverContext()
  const { formattedTime, startTimer, stopTimer, resetTimer } = useRecordTimer()

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
      stopTimer()
      window.api.popover.expand()
      setIsProcessing(true)
      const [userTranscript, mediaTranscript] = await Promise.all([
        handleUserStop(),
        handleMediaStop()
      ])

      const newMessages: CoreMessage[] = [
        ...messages,
        {
          role: 'user',
          content: `Most recente user Transcript: ${userTranscript} \n\n Most recent others transcript: ${mediaTranscript};`
        }
      ]

      const tip = await window.api.tips.generate({ messages: newMessages })

      setMessages(tip)
    } finally {
      setIsProcessing(false)
      resetTimer()
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
    startTimer()
  }

  return (
    <>
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
            ? { backgroundColor: ['#ff0000', '#007AFF', '#ff0000'] }
            : { backgroundColor: '#007AFF' }
        }
        transition={
          isRecording ? { repeat: Infinity, duration: 1.2, ease: 'easeIn', repeatType: 'loop' } : {}
        }
      >
        <Mic size={14} />
        {isRecording ?? 'sim'}
      </BoxMotion>
      {/* Timer */}
      <Box
        color="fg.muted"
        fontSize="14px"
        fontWeight="500"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {formattedTime}
      </Box>
    </>
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
