import { audioCapture } from '@renderer/services/audio-capture'
import { windowAudioCapture } from '@renderer/services/system-audio'
import { AUDIO_PROCESSING_CONFIG } from '@renderer/config/audio-processing'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, Play, Square } from 'lucide-react'
import { BoxMotion } from '../ui/motion'
import { Box, Flex } from '@styled-system/jsx'
import { CoreMessage } from 'ai'
import { usePopoverAI } from '@renderer/contexts/popover-contexts'
import { ToggleGroup } from '../ui/toggle-group'
import { processLastSegment } from '@renderer/services/processer'

const useRecordTimer = () => {
  const [recordingTime, setRecordingTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

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

const Timer = ({ formattedTime }: { formattedTime: string }) => {
  return (
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
  )
}

export function Recorder() {
  const [isAutoProcessing, setIsAutoProcessing] = useState(false)
  const [segmentCount, setSegmentCount] = useState(0)
  const [memoryUsage, setMemoryUsage] = useState({ audio: 0 })

  const {
    setMessages,
    setIsProcessing,
    messages,
    isPaused,
    pauseAutoProcessing,
    resumeAutoProcessing
  } = usePopoverAI()
  const { formattedTime, startTimer, stopTimer, resetTimer } = useRecordTimer()

  const messagesRef = useRef(messages)
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const processAudioSegment = useCallback(async () => {
    try {
      setIsProcessing(true)

      const { systemTranscript, userTranscript } = await processLastSegment()

      if (!userTranscript && !systemTranscript) {
        console.log('Nenhuma transcrição disponível, pulando segmento...')
        return
      }

      const newMessage: CoreMessage = {
        role: 'user',
        content: `Usuario (Léo): ${userTranscript} | Outros: ${systemTranscript}`
      }

      const currentMessages = [...messagesRef.current, newMessage]

      const tip = await window.api.tips.generate({
        messages: currentMessages
      })

      window.api.popover.expand()
      setMessages(tip)
      setSegmentCount((prev) => prev + 1)

      updateMemoryMetrics()
    } catch (error) {
      console.error('Erro no processamento automático:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [setIsProcessing, setMessages])

  const updateMemoryMetrics = () => {
    const audioMemory =
      (audioCapture.getMemoryUsage() + windowAudioCapture.getMemoryUsage()) / 1024 / 1024

    setMemoryUsage({
      audio: Math.round(audioMemory * 100) / 100 // MB
    })

    if (audioMemory > AUDIO_PROCESSING_CONFIG.MEMORY_WARNING_THRESHOLD) {
      console.warn('Uso de memória alto, considerando limpeza adicional')
    }
  }

  const performMemoryCleanup = () => {
    if (window.gc) {
      window.gc()
    }

    updateMemoryMetrics()

    console.log(`Limpeza realizada. Segmentos: ${segmentCount}, Memória: ${memoryUsage.audio}MB`)
  }

  const startAutoProcessing = async () => {
    try {
      await audioCapture.start()
      console.log('User audio capture started')
      await windowAudioCapture.start()
      console.log('System audio capture started')

      setIsAutoProcessing(true)
      startTimer()

      processingIntervalRef.current = setInterval(async () => {
        await processAudioSegment()
      }, AUDIO_PROCESSING_CONFIG.SEGMENT_INTERVAL)

      cleanupIntervalRef.current = setInterval(() => {
        performMemoryCleanup()
      }, AUDIO_PROCESSING_CONFIG.CLEANUP_INTERVAL)

      console.log('Processamento automático iniciado')
    } catch (error) {
      console.error('Erro ao iniciar processamento automático:', error)
      setIsAutoProcessing(false)
    }
  }

  const stopAutoProcessing = async () => {
    try {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current)
        processingIntervalRef.current = null
      }

      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
        cleanupIntervalRef.current = null
      }

      stopTimer()

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

  const toggle = async () => {
    console.log('Toggling processing state:', isAutoProcessing)
    if (isAutoProcessing) return stopAutoProcessing()

    return startAutoProcessing()
  }

  useEffect(() => {
    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current)
        processingIntervalRef.current = null
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
        cleanupIntervalRef.current = null
      }

      // TODO: ANALISAR...
      // ✅ Parar capturas apenas no unmount (não no cleanup periódico)
      const stopCaptures = async () => {
        try {
          if (audioCapture.isRecording()) {
            await audioCapture.stop()
          }
          if (windowAudioCapture.isRecording()) {
            await windowAudioCapture.stop()
          }
        } catch (error) {
          console.error('Erro durante cleanup no unmount:', error)
        }
      }

      stopCaptures()
    }
  }, [])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    const shouldResumeProcessing = isAutoProcessing && !isPaused

    if (isPaused && processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current)
      processingIntervalRef.current = null
      console.log('Processamento pausado')
    } else if (shouldResumeProcessing && !processingIntervalRef.current) {
      processingIntervalRef.current = setInterval(
        processAudioSegment,
        AUDIO_PROCESSING_CONFIG.SEGMENT_INTERVAL
      )
      console.log('Processamento retomado')
    }
  }, [isPaused, isAutoProcessing, processAudioSegment])

  return (
    <Flex align="center" gap={2}>
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
          isPaused
            ? { backgroundColor: ['#ff0000', '#ff8800', '#ff0000'] }
            : isAutoProcessing
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
      {isAutoProcessing && (
        <ToggleGroup.Root
          onValueChange={(details) => {
            const isPausedPressed = details.value.length > 0
            if (isPausedPressed) {
              pauseAutoProcessing()
              stopTimer()
            } else {
              resumeAutoProcessing()
              startTimer()
            }
          }}
        >
          <ToggleGroup.Item value="pause" aria-label="Toggle Bold">
            {isPaused ? <Square size={14} /> : <Play size={14} />}
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      )}

      <Timer formattedTime={formattedTime} />

      {/* Monitor de memória (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && isAutoProcessing && (
        <Box
          position="absolute"
          top="0"
          right="0"
          fontSize="8px"
          color="gray.500"
          bg="white"
          px="4px"
          py="2px"
          borderRadius="0px 12px 0px 4px"
          opacity="0.7"
        >
          Áudio: {memoryUsage.audio}MB | Msgs: {messages.length}
        </Box>
      )}
    </Flex>
  )
}
