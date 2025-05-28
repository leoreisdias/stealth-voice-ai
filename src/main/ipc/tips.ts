import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { ipcMain } from 'electron'
import { logIPC } from '../utils/logger'

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
})

const generateTip = async (userPrompt: string, mediaPrompt: string): Promise<string> => {
  const model = openRouter('google/gemini-2.0-flash-001')

  const response = await generateText({
    model,
    system: `You are a real-time conversation assistant. Analyze the following transcripts:

- "User Transcript": what the user is saying.
- "Other Party Transcript": what the other person or people are saying.

Based on this, provide **one single, highly actionable suggestion** that the user can apply immediately to maintain control of the conversation, overcome objections, or sound more confident.

Guidelines:
- The response must be in **Brazilian Portuguese**.
- Provide only **one direct, practical tip**.
- Use clear and persuasive language.
- If relevant, provide an example phrase the user can say right now.
- Keep the response short (max 3 lines).

If no specific objection or challenge is detected, suggest a confidence-boosting statement or a way to guide the conversation.

**Do not explain your reasoning, just provide the suggestion directly.**

If the content of the transcripts does not indicate a clear objection or question, suggest confidence-boosting statements or techniques to keep the conversation under the user’s control.
`,
    messages: [
      {
        role: 'user',
        content: `User Transcript: ${userPrompt} \n\n Other Party Transcript: ${mediaPrompt}; Suggestion:`
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
