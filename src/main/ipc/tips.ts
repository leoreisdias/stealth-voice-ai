import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { CoreMessage, generateText } from 'ai'
import { ipcMain } from 'electron'
import { logIPC } from '../utils/logger'
import { SYSTEM_PROMPT } from '../prompts/system'

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
})

const generateTip = async (messages: CoreMessage[]): Promise<CoreMessage[]> => {
  const model = openRouter('google/gemini-2.5-flash-preview-05-20')

  const result = await generateText({
    model,
    system: SYSTEM_PROMPT,
    temperature: 0.4,
    messages: messages
  })

  return result.response.messages
}

ipcMain.handle('tips:generate', async (_event, prompts: { messages: CoreMessage[] }) => {
  logIPC('tips:generate', 'in', prompts)
  try {
    const tip = await generateTip(prompts.messages)
    logIPC('tips:generate', 'out', { tip })
    return tip
  } catch (error) {
    logIPC('tips:generate', 'out', error)
    return []
  }
})
