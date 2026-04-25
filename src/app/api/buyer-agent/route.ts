import { NoObjectGeneratedError } from "ai"
import { runBuyerAgent } from "@/lib/agents/buyer-agent"
import type { BuyerMandate, LOIProposal, NegotiationState } from "@/lib/agents/types"

interface RequestBody {
  sessionId: string
  negotiationState: NegotiationState
  buyerMandate: BuyerMandate
  incomingProposal?: LOIProposal
}

export async function POST(req: Request): Promise<Response> {
  let body: RequestBody

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { sessionId, negotiationState, buyerMandate, incomingProposal } = body

  if (!sessionId || typeof sessionId !== "string") {
    return Response.json({ error: "sessionId is required" }, { status: 400 })
  }
  if (!negotiationState || !buyerMandate) {
    return Response.json(
      { error: "negotiationState and buyerMandate are required" },
      { status: 400 },
    )
  }

  try {
    const result = await runBuyerAgent({
      sessionId,
      negotiationState,
      buyerMandate,
      incomingProposal: incomingProposal ?? null,
    })

    // 202 signals the frontend to pause the negotiation loop and await human approval
    return Response.json(result, { status: result.requiresHumanReview ? 202 : 200 })
  } catch (err) {
    if (NoObjectGeneratedError.isInstance(err)) {
      return Response.json(
        { error: "Agent failed to produce a valid proposal — model output did not match schema" },
        { status: 500 },
      )
    }
    const message = err instanceof Error ? err.message : "Agent generation failed"
    return Response.json({ error: message }, { status: 500 })
  }
}
