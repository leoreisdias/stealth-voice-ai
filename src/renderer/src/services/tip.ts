import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'

const openRouter = createOpenRouter({
  apiKey: ''
})

export const generateTip = async (userPrompt: string, mediaPrompt: string): Promise<string> => {
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

Context about the user:
- He is a front-end developer focused on React and Next.js.
- He is a senior with 4+ years of experience.
- Software Engineer (FE-Heavy) with 4+ years of experience in frontend and backend development, specializing in React.js ecosystem, including Next.js, and also with deep experience in Node.js and Nest.js. Proven track record of building systems from scratch, optimizing platforms, and delivering impactful, user-focused solutions. Adept at thriving in high-paced environments, collaborating with cross-functional teams, bridging product and engineering to align technical initiatives with business goals, and driving secure, high-performance systems. Recognized for technical excellence, innovation, and a user-first approach that delivers strategic outcomes
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
