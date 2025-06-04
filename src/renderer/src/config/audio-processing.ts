export const AUDIO_PROCESSING_CONFIG = {
  // Intervalo de processamento automático (20 segundos)
  SEGMENT_INTERVAL: 20000,

  // Gerenciamento de memória
  MAX_AUDIO_SEGMENTS: 50, // ~17min de histórico de áudio
  MAX_CONTEXT_MESSAGES: 100, // Limite de mensagens para API
  CLEANUP_INTERVAL: 200000, // 200s entre limpezas de memória
  MEMORY_WARNING_THRESHOLD: 40, // MB - alerta de uso alto
  MIN_AUDIO_SIZE: 4900, // bytes mínimos para processar
  COMPRESSION_THRESHOLD: 80, // Msgs antes de comprimir contexto

  // Configurações de gravação
  MIME_TYPE: 'audio/webm;codecs=opus',

  // Configurações de áudio do sistema
  SYSTEM_AUDIO_CONFIG: {
    echoCancellation: false,
    autoGainControl: false,
    noiseSuppression: false
  }
} as const

export type AudioProcessingConfig = typeof AUDIO_PROCESSING_CONFIG
