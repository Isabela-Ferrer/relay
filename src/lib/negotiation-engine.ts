// ═══════════════════════════════════════════════════════════════
// Relay — Negotiation Orchestrator
// Runs the multi-agent negotiation loop with SSE streaming
// ═══════════════════════════════════════════════════════════════

import type {
  LOIProposal,
  NegotiationState,
  SellerMandate,
  BuyerMandate,
} from "@/lib/agents/types"

import { runSellerAgent } from "@/lib/agents/seller-agent"
import { runBuyerAgent, type BuyerAgentInput } from "@/lib/agents/buyer-agent"
import {
  calculateConvergence,
  calculateConvergenceScore,
  detectDeadlock,
  generateGapAnalysis,
  generateSummary,
  type ConvergenceData,
  type GapAnalysis,
  type NegotiationSummary,
} from "@/lib/concession"
import { detectLeak, sanitizeReasoning, LEAK_WARNING } from "@/lib/leak-detection"

// ─── SSE EVENT TYPES ──────────────────────────────────────────

export interface NegotiationEvent {
  type: "proposal" | "checkpoint" | "deadlock" | "agreed" | "complete" | "error"
  round: number
  agent?: "buyer" | "seller"
  proposal?: LOIProposal
  convergenceData?: ConvergenceData
  convergenceScore?: number
  checkpointReason?: string
  gapAnalysis?: GapAnalysis
  summary?: NegotiationSummary
  message?: string
}

// ─── ORCHESTRATOR CONFIG ──────────────────────────────────────

export interface OrchestratorConfig {
  sessionId: string
  sellerData: NegotiationState["sellerData"]
  buyerProfile: NegotiationState["buyerProfile"]
  sellerMandate: SellerMandate
  buyerMandate: BuyerMandate
  maxRounds: number
  startRound?: number
  initialProposals?: LOIProposal[]
  onEvent: (event: NegotiationEvent) => void
}

export interface NegotiationRunResult {
  status: "checkpoint" | "agreed" | "complete"
  proposals: LOIProposal[]
  round: number
  checkpointReason?: string
}

// ─── RUN NEGOTIATION ──────────────────────────────────────────

export async function runNegotiation(config: OrchestratorConfig): Promise<NegotiationRunResult> {
  const {
    sessionId,
    sellerData,
    buyerProfile,
    sellerMandate,
    buyerMandate,
    maxRounds,
    onEvent,
  } = config

  const startRound = config.startRound ?? 1
  const startTime = Date.now()
  const proposals: LOIProposal[] = [...(config.initialProposals ?? [])]

  // Confidential values for leak detection
  const sellerConfidentialValues = [sellerMandate.minPrice]
  const buyerConfidentialValues = [buyerMandate.maxPrice]

  for (let round = startRound; round <= maxRounds; round++) {

    // Build shared state (proposals only — NO confidential data from either side)
    const sharedState: NegotiationState = {
      sessionId,
      round,
      status: "active",
      sellerData,
      buyerProfile,
      valuation: null,
      proposals: [...proposals],
      activeProposalId: null,
      agreedTerms: null,
      openIssues: [],
      resolvedIssues: [],
      agentMessages: [],
      convergenceScore: calculateConvergenceScore(proposals, sellerMandate.askingPrice),
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    // ─── BUYER TURN ─────────────────────────────────────
    const lastSellerProposal = [...proposals].reverse().find(p => p.proposingParty === "seller") || null

    const buyerResult = await callWithRetry(
      () => runBuyerAgent({
        sessionId,
        negotiationState: sharedState,
        buyerMandate,
        incomingProposal: lastSellerProposal,
      }),
      "buyer",
      buyerConfidentialValues,
    )

    // Enforce version/party
    buyerResult.proposal.version = proposals.length + 1
    buyerResult.proposal.proposingParty = "buyer"
    buyerResult.proposal.sessionId = sessionId

    proposals.push(buyerResult.proposal)
    const buyerConv = calculateConvergence(proposals)

    onEvent({
      type: buyerResult.requiresHumanReview ? "checkpoint" : "proposal",
      round,
      agent: "buyer",
      proposal: buyerResult.proposal,
      convergenceData: buyerConv,
      convergenceScore: calculateConvergenceScore(proposals, sellerMandate.askingPrice),
      checkpointReason: buyerResult.escalationReason || undefined,
    })

    if (buyerResult.proposal.status === "accepted") {
      emitFinal("agreed", proposals, sellerMandate, buyerMandate, startTime, round, onEvent)
      return { status: "agreed", proposals, round }
    }
    if (buyerResult.requiresHumanReview) {
      return {
        status: "checkpoint",
        proposals,
        round,
        checkpointReason: buyerResult.escalationReason || undefined,
      }
    }

    // ─── SELLER TURN ────────────────────────────────────
    const lastBuyerProposal = buyerResult.proposal

    // Update shared state with buyer's proposal
    sharedState.proposals = [...proposals]
    sharedState.convergenceScore = calculateConvergenceScore(proposals, sellerMandate.askingPrice)

    const sellerResult = await callWithRetry(
      () => runSellerAgent({
        sessionId,
        negotiationState: sharedState,
        sellerMandate,
        incomingProposal: lastBuyerProposal,
      }),
      "seller",
      sellerConfidentialValues,
    )

    sellerResult.proposal.version = proposals.length + 1
    sellerResult.proposal.proposingParty = "seller"
    sellerResult.proposal.sessionId = sessionId

    proposals.push(sellerResult.proposal)
    const sellerConv = calculateConvergence(proposals)

    onEvent({
      type: sellerResult.requiresHumanReview ? "checkpoint" : "proposal",
      round,
      agent: "seller",
      proposal: sellerResult.proposal,
      convergenceData: sellerConv,
      convergenceScore: calculateConvergenceScore(proposals, sellerMandate.askingPrice),
      checkpointReason: sellerResult.escalationReason || undefined,
    })

    if (sellerResult.proposal.status === "accepted") {
      emitFinal("agreed", proposals, sellerMandate, buyerMandate, startTime, round, onEvent)
      return { status: "agreed", proposals, round }
    }
    if (sellerResult.requiresHumanReview) {
      return {
        status: "checkpoint",
        proposals,
        round,
        checkpointReason: sellerResult.escalationReason || undefined,
      }
    }

    // ─── DEADLOCK CHECK ─────────────────────────────────
    if (detectDeadlock(proposals)) {
      const gapAnalysis = generateGapAnalysis(proposals, sellerMandate, buyerMandate)
      onEvent({
        type: "deadlock",
        round,
        gapAnalysis,
        convergenceData: sellerConv,
        message: `Negotiation stalled. Parties are $${gapAnalysis.priceGap.toLocaleString()} apart.`,
      })
      emitFinal("complete", proposals, sellerMandate, buyerMandate, startTime, round, onEvent)
      return { status: "complete", proposals, round }
    }
  }

  // Max rounds reached
  emitFinal("complete", proposals, sellerMandate, buyerMandate, startTime, maxRounds, onEvent)
  return { status: "complete", proposals, round: maxRounds }
}

// ─── EMIT FINAL SUMMARY ──────────────────────────────────────

function emitFinal(
  type: "agreed" | "complete",
  proposals: LOIProposal[],
  sellerMandate: SellerMandate,
  buyerMandate: BuyerMandate,
  startTime: number,
  round: number,
  onEvent: (event: NegotiationEvent) => void,
) {
  const summary = generateSummary(proposals, sellerMandate, buyerMandate, startTime)
  const lastProposal = proposals[proposals.length - 1]

  onEvent({
    type,
    round,
    proposal: lastProposal,
    convergenceData: calculateConvergence(proposals),
    convergenceScore: summary.convergenceScore,
    summary,
    message: type === "agreed"
      ? "Deal reached!"
      : `Negotiation completed after ${round} rounds`,
  })
}

// ─── RETRY WITH LEAK DETECTION ────────────────────────────────

async function callWithRetry<T extends { proposal: LOIProposal; requiresHumanReview: boolean; escalationReason: string | null }>(
  fn: () => Promise<T>,
  role: "buyer" | "seller",
  confidentialValues: number[],
  maxRetries: number = 3,
): Promise<T> {
  let attempts = 0

  while (attempts < maxRetries) {
    try {
      const result = await fn()

      // Check for leaks in the notes field (where reasoning lives)
      const reasoning = result.proposal.notes || ""
      const leakCheck = detectLeak(reasoning, role, confidentialValues)

      if (leakCheck.leaked) {
        console.warn(`[LEAK DETECTED] ${role} agent: ${leakCheck.matches.join(", ")}`)
        result.proposal.notes = sanitizeReasoning(reasoning, role)
        // On first leak, sanitize and return. On repeated leaks, still return sanitized.
        return result
      }

      return result
    } catch (error) {
      attempts++
      if (attempts >= maxRetries) throw error
      await new Promise(r => setTimeout(r, 1000 * attempts))
    }
  }

  throw new Error(`Agent call failed after ${maxRetries} attempts`)
}
