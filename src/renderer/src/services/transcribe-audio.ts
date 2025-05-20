import { createOpenAI } from '@ai-sdk/openai'
import { experimental_transcribe } from 'ai'

const openai = createOpenAI({
  apiKey: ''
})

export async function transcribeAudio(audioBlob: ArrayBuffer): Promise<string> {
  const transcript = await experimental_transcribe({
    model: openai.transcription('whisper-1'),
    audio: audioBlob
  })

  return transcript.text
}
