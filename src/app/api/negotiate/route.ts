import type { SellerMandate, BuyerMandate, SellerOnboardingData, BuyerProfile, LOIProposal } from "@/lib/agents/types"
import { runNegotiation, type NegotiationEvent } from "@/lib/negotiation-engine"
import {
  DEMO_SELLER,
  DEMO_BUYER,
  DEMO_SELLER_MANDATE,
  DEMO_BUYER_MANDATE,
  buildDemoNegotiationState,
} from "@/lib/scenarios"

interface RequestBody {
  action?: "start" | "approve" | "reject"
  sessionId?: string
  sellerData?: SellerOnboardingData
  buyerProfile?: BuyerProfile
  sellerMandate?: SellerMandate
  buyerMandate?: BuyerMandate
  maxRounds?: number
  demo?: boolean
  initialProposals?: LOIProposal[]
}

interface PendingCheckpoint {
  sessionId: string
  sellerData: SellerOnboardingData
  buyerProfile: BuyerProfile
  sellerMandate: SellerMandate
  buyerMandate: BuyerMandate
  maxRounds: number
  proposals: LOIProposal[]
  round: number
}

const pendingCheckpoints = new Map<string, PendingCheckpoint>()

export async function POST(req: Request): Promise<Response> {
  let body: RequestBody

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const action = body.action || "start"

  if (action === "reject") {
    if (body.sessionId) pendingCheckpoints.delete(body.sessionId)
    return Response.json({ ok: true })
  }

  let sessionId: string
  let sellerData: SellerOnboardingData
  let buyerProfile: BuyerProfile
  let sellerMandate: SellerMandate
  let buyerMandate: BuyerMandate
  let maxRounds: number
  let initialProposals: LOIProposal[] = []
  let startRound = 1

  if (action === "approve") {
    if (!body.sessionId) {
      return Response.json({ error: "sessionId is required for approve action" }, { status: 400 })
    }
    const pending = pendingCheckpoints.get(body.sessionId)
    if (!pending) {
      return Response.json({ error: "No pending checkpoint found for session" }, { status: 404 })
    }

    sessionId = pending.sessionId
    sellerData = pending.sellerData
    buyerProfile = pending.buyerProfile
    sellerMandate = pending.sellerMandate
    buyerMandate = pending.buyerMandate
    maxRounds = pending.maxRounds
    initialProposals = pending.proposals
    startRound = pending.round + 1
    pendingCheckpoints.delete(body.sessionId)
  } else {
    sessionId = body.sessionId || crypto.randomUUID()
    sellerData = body.demo ? DEMO_SELLER : (body.sellerData || DEMO_SELLER)
    buyerProfile = body.demo ? DEMO_BUYER : (body.buyerProfile || DEMO_BUYER)
    sellerMandate = body.demo ? DEMO_SELLER_MANDATE : (body.sellerMandate || DEMO_SELLER_MANDATE)
    buyerMandate = body.demo ? DEMO_BUYER_MANDATE : (body.buyerMandate || DEMO_BUYER_MANDATE)
    maxRounds = body.maxRounds || 5
  }

  // SSE streaming response
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: NegotiationEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`
        controller.enqueue(encoder.encode(data))
      }

      try {
        const result = await runNegotiation({
          sessionId,
          sellerData,
          buyerProfile,
          sellerMandate,
          buyerMandate,
          maxRounds,
          startRound,
          initialProposals,
          onEvent: sendEvent,
        })

        if (result.status === "checkpoint") {
          pendingCheckpoints.set(sessionId, {
            sessionId,
            sellerData,
            buyerProfile,
            sellerMandate,
            buyerMandate,
            maxRounds,
            proposals: result.proposals,
            round: result.round,
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Negotiation failed"
        sendEvent({ type: "error", round: 0, message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const sessionId = url.searchParams.get("sessionId")

  if (!sessionId) {
    return Response.json({ error: "sessionId is required" }, { status: 400 })
  }

  return Response.json(buildDemoNegotiationState(sessionId))
}
