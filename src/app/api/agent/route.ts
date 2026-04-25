import type { AgentMandate } from "@/lib/agents/types"

export async function POST(): Promise<Response> {
  const mandate: AgentMandate = {
    agentId: crypto.randomUUID(),
    role: "neutral_facilitator",
    sessionId: "session-mock-001",
    constraints: {
      minAcceptablePrice: 9_000_000,
      maxOfferPrice: 14_000_000,
      mustHaveTerms: ["Non-compete", "Representations and warranties"],
      dealBreakers: ["Asset-only sale", "Price below $8M"],
      priorityTerms: ["Purchase price", "Earnout structure"],
    },
    instructionOverrides: [],
    allowedActions: ["propose", "counter", "request_info", "generate_document"],
    confidentialContext: "Seller has a competing offer at $10.5M. Motivated to close within 90 days.",
    activatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }

  return Response.json(mandate)
}

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get("agentId")

  if (!agentId) {
    return Response.json({ error: "agentId is required" }, { status: 400 })
  }

  return Response.json({ agentId, status: "active", role: "neutral_facilitator" })
}
