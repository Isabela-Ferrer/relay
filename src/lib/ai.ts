import { createAnthropic } from "@ai-sdk/anthropic"

const provider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const NEGOTIATION_MODEL = provider("claude-sonnet-4-6")
