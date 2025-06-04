import { audioCapture } from '@renderer/services/audio-capture'
import { normalizeAudioBlob } from '@renderer/services/normalizer'
import { windowAudioCapture } from '@renderer/services/system-audio'
import { AUDIO_PROCESSING_CONFIG } from '@renderer/config/audio-processing'
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
  const [isAutoProcessing, setIsAutoProcessing] = useState(false)
  const [segmentCount, setSegmentCount] = useState(0)
  const [memoryUsage, setMemoryUsage] = useState({ audio: 0 })

  const { setMessages, setIsProcessing, messages } = usePopoverContext()
  const { formattedTime, startTimer, stopTimer, resetTimer } = useRecordTimer()
  const messagesRef = useRef(messages)

  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Função para transcrever áudio com tratamento de erro
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      if (audioBlob.size < AUDIO_PROCESSING_CONFIG.MIN_AUDIO_SIZE) {
        return '' // Áudio muito pequeno
      }
      const arrayBuffer = await audioBlob.arrayBuffer()
      return await window.api.audio.transcribe(arrayBuffer)
    } catch (error) {
      console.error('Erro na transcrição:', error)
      return ''
    }
  }

  // Processar segmento de áudio automaticamente
  const processAudioSegment = async () => {
    try {
      setIsProcessing(true)

      const [userBlob, systemBlob] = await Promise.all([
        audioCapture.getAndClearRecentChunks(),
        windowAudioCapture.getAndClearRecentChunks()
      ])

      // Verificar se há áudio suficiente
      const isUserAudioSmall = userBlob.size < AUDIO_PROCESSING_CONFIG.MIN_AUDIO_SIZE
      const isSystemAudioSmall = systemBlob.size < AUDIO_PROCESSING_CONFIG.MIN_AUDIO_SIZE

      if (isUserAudioSmall && isSystemAudioSmall) {
        console.log('Segmento muito pequeno, pulando...')
        return
      }

      const [userTranscript, systemTranscript] = await Promise.all([
        transcribeAudio(userBlob),
        transcribeAudio(systemBlob.size > 0 ? await normalizeAudioBlob(systemBlob) : systemBlob)
      ])

      // Só processar se houver transcrição
      if (!userTranscript && !systemTranscript) {
        console.log('Nenhuma transcrição obtida, pulando...')
        return
      }

      // Adicionar ao contexto
      const newMessage: CoreMessage = {
        role: 'user',
        content: `Usuario (Léo): ${userTranscript} | Outros: ${systemTranscript}`
      }

      // Use callback para garantir estado atual
      const currentMessages = [...messagesRef.current, newMessage]

      // Gerar dica
      const tip = await window.api.tips.generate({
        // messages: contextManager.current.getMessages()
        messages: currentMessages
      })

      window.api.popover.expand()
      setMessages(tip)
      setSegmentCount((prev) => prev + 1)

      // Atualizar métricas de memória
      updateMemoryMetrics()

      // console.log(`Segmento ${segmentCount + 1} processado com sucesso`)
    } catch (error) {
      console.error('Erro no processamento automático:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Atualizar métricas de memória
  const updateMemoryMetrics = () => {
    const audioMemory =
      (audioCapture.getMemoryUsage() + windowAudioCapture.getMemoryUsage()) / 1024 / 1024
    // const messageCount = contextManager.current.getMessageCount()

    setMemoryUsage({
      audio: Math.round(audioMemory * 100) / 100 // MB
    })

    // Alertas de memória
    if (audioMemory > AUDIO_PROCESSING_CONFIG.MEMORY_WARNING_THRESHOLD) {
      console.warn('Uso de memória alto, considerando limpeza adicional')
    }
  }

  // Limpeza de memória
  const performMemoryCleanup = () => {
    // Forçar garbage collection se disponível
    if (window.gc) {
      window.gc()
    }

    // Atualizar métricas
    updateMemoryMetrics()

    console.log(`Limpeza realizada. Segmentos: ${segmentCount}, Memória: ${memoryUsage.audio}MB`)
  }

  // Iniciar processamento automático
  const startAutoProcessing = async () => {
    try {
      await audioCapture.start()
      console.log('User audio capture started')
      await windowAudioCapture.start()
      console.log('System audio capture started')

      setIsAutoProcessing(true)
      startTimer()

      // Processar a cada intervalo configurado
      processingIntervalRef.current = setInterval(async () => {
        await processAudioSegment()
      }, AUDIO_PROCESSING_CONFIG.SEGMENT_INTERVAL)

      // Limpeza de memória no intervalo configurado
      cleanupIntervalRef.current = setInterval(() => {
        performMemoryCleanup()
      }, AUDIO_PROCESSING_CONFIG.CLEANUP_INTERVAL)

      console.log('Processamento automático iniciado')
    } catch (error) {
      console.error('Erro ao iniciar processamento automático:', error)
      setIsAutoProcessing(false)
    }
  }

  // Parar processamento automático
  const stopAutoProcessing = async () => {
    try {
      // Limpar intervalos
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current)
        processingIntervalRef.current = null
      }

      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
        cleanupIntervalRef.current = null
      }

      stopTimer()

      // Parar capturas
      await audioCapture.stop()
      await windowAudioCapture.stop()

      setIsAutoProcessing(false)

      console.log('Processamento automático parado')
    } catch (error) {
      console.error('Erro ao parar processamento automático:', error)
    } finally {
      resetTimer()
      setSegmentCount(0)
      setMemoryUsage({ audio: 0 })
    }
  }

  // Função principal de toggle
  const toggle = async () => {
    console.log('Toggling processing state:', isAutoProcessing)
    if (isAutoProcessing) {
      return stopAutoProcessing()
    } else {
      return startAutoProcessing()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current)
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

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
        whileHover={{ scale: 1.1 }}
        animate={
          isAutoProcessing
            ? { backgroundColor: ['#ff0000', '#007AFF', '#ff0000'] }
            : { backgroundColor: '#007AFF' }
        }
        transition={
          isAutoProcessing
            ? { repeat: Infinity, duration: 1.2, ease: 'easeIn', repeatType: 'loop' }
            : {}
        }
      >
        <Mic size={14} />
      </BoxMotion>

      {/* Timer e informações */}
      <Box
        color="fg.muted"
        fontSize="14px"
        fontWeight="500"
        fontFamily="system-ui, -apple-system, sans-serif"
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="2px"
      >
        <Box>{formattedTime}</Box>
      </Box>

      {/* Monitor de memória (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && isAutoProcessing && (
        <Box
          position="absolute"
          top="0"
          right="0"
          fontSize="8px"
          color="gray.500"
          bg="white"
          p="2px"
          borderRadius="2px"
          opacity="0.7"
        >
          Áudio: {memoryUsage.audio}MB | Msgs: {messages.length}
        </Box>
      )}
    </>
  )
}
