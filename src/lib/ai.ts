import { createAnthropic } from "@ai-sdk/anthropic"

const provider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const NEGOTIATION_MODEL_ID = process.env.NEGOTIATION_MODEL_ID || "claude-sonnet-4-6"

// AI SDK v6 expects a provider-backed LanguageModel instance, not a raw model string.
export const NEGOTIATION_MODEL = provider(NEGOTIATION_MODEL_ID)
