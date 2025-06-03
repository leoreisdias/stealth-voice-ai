import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { ipcMain } from 'electron'
import { logIPC } from '../utils/logger'
import { SYSTEM_PROMPT } from '../prompts/system'

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
})

const generateTip = async (userPrompt: string, mediaPrompt: string): Promise<string> => {
  const model = openRouter('google/gemini-2.5-flash-preview-05-20')

  const response = await generateText({
    model,
    system: SYSTEM_PROMPT,
    temperature: 0.4,
    messages: [
      {
        role: 'user',
        content: `Most recente user Transcript: ${userPrompt} \n\n Most recent others transcript: ${mediaPrompt};`
      }
    ]
  })

  return response.text
}

ipcMain.handle(
  'tips:generate',
  async (_event, prompts: { userPrompt: string; mediaPrompt: string }) => {
    logIPC('tips:generate', 'in', prompts)
    try {
      const tip = await generateTip(prompts.userPrompt, prompts.mediaPrompt)
      logIPC('tips:generate', 'out', { tip })
      return tip
    } catch (error) {
      logIPC('tips:generate', 'out', error)
      return ''
    }
  }
)
