import { AUDIO_PROCESSING_CONFIG } from '@renderer/config/audio-processing'
import { audioCapture } from './audio-capture'
import { windowAudioCapture } from './system-audio'
import { normalizeAudioBlob } from './normalizer'

type SegmentTranscriptionProps = {
  userBlob: Blob
  systemBlob?: Blob
}

export const getLastSegments = async () => {
  const [userBlob, systemBlob] = await Promise.all([
    audioCapture.getAndClearRecentChunks(),
    windowAudioCapture.getAndClearRecentChunks()
  ])

  return {
    userBlob,
    systemBlob
  }
}

// Função para transcrever áudio com tratamento de erro
export const transcribeAudioBlob = async (audioBlob: Blob | undefined): Promise<string> => {
  try {
    if (!audioBlob || audioBlob.size < AUDIO_PROCESSING_CONFIG.MIN_AUDIO_SIZE) {
      return '' // Áudio muito pequeno
    }
    const arrayBuffer = await audioBlob.arrayBuffer()
    return await window.api.audio.transcribe(arrayBuffer)
  } catch (error) {
    console.error('Erro na transcrição:', error)
    return ''
  }
}

export const getSegmentTranscription = async ({
  userBlob,
  systemBlob
}: SegmentTranscriptionProps) => {
  // Verificar se há áudio suficiente
  const isUserAudioSmall = userBlob.size < AUDIO_PROCESSING_CONFIG.MIN_AUDIO_SIZE
  const isSystemAudioSmall =
    !!systemBlob && systemBlob.size < AUDIO_PROCESSING_CONFIG.MIN_AUDIO_SIZE

  if (isUserAudioSmall && isSystemAudioSmall) {
    console.log('Segmento muito pequeno, pulando...')
    return {
      userTranscript: '',
      systemTranscript: ''
    }
  }

  const [userTranscript, systemTranscript] = await Promise.all([
    transcribeAudioBlob(userBlob),
    transcribeAudioBlob(systemBlob ? await normalizeAudioBlob(systemBlob) : systemBlob)
  ])

  // Só processar se houver transcrição
  return {
    userTranscript,
    systemTranscript
  }
}

export const processLastSegment = async () => {
  const { userBlob, systemBlob } = await getLastSegments()

  const segmentTranscription = await getSegmentTranscription({
    userBlob,
    systemBlob
  })

  return segmentTranscription
}
