// ═══════════════════════════════════════════════════════════════
// Relay — Concession & Convergence Engine
// Deadlock detection, gap analysis, bridge proposals, fairness scoring
// ═══════════════════════════════════════════════════════════════

import type { LOIProposal, SellerMandate, BuyerMandate } from "@/lib/agents/types"

// ─── CONVERGENCE DATA ─────────────────────────────────────────

export interface ConvergenceData {
  buyerPrice: number
  sellerPrice: number
  gap: number
  gapPercentage: number
  projectedConvergenceRound?: number
}

export function calculateConvergence(proposals: LOIProposal[]): ConvergenceData {
  const buyerProposals = proposals.filter(p => p.proposingParty === "buyer")
  const sellerProposals = proposals.filter(p => p.proposingParty === "seller")

  const latestBuyer = buyerProposals[buyerProposals.length - 1]
  const latestSeller = sellerProposals[sellerProposals.length - 1]

  if (!latestBuyer && !latestSeller) {
    return { buyerPrice: 0, sellerPrice: 0, gap: 0, gapPercentage: 0 }
  }

  const buyerPrice = latestBuyer?.purchasePrice || 0
  const sellerPrice = latestSeller?.purchasePrice || 0
  const gap = sellerPrice - buyerPrice
  const midpoint = (sellerPrice + buyerPrice) / 2
  const gapPercentage = midpoint > 0 ? gap / midpoint : 0

  // Trend-based convergence projection
  let projectedConvergenceRound: number | undefined
  if (buyerProposals.length >= 2 && sellerProposals.length >= 2) {
    const buyerDelta = buyerProposals[buyerProposals.length - 1].purchasePrice - buyerProposals[buyerProposals.length - 2].purchasePrice
    const sellerDelta = sellerProposals[sellerProposals.length - 2].purchasePrice - sellerProposals[sellerProposals.length - 1].purchasePrice
    const closingRate = buyerDelta + sellerDelta
    if (closingRate > 0 && gap > 0) {
      const currentRound = Math.max(latestBuyer.version, latestSeller.version)
      projectedConvergenceRound = currentRound + Math.ceil(gap / closingRate)
    }
  }

  return { buyerPrice, sellerPrice, gap, gapPercentage, projectedConvergenceRound }
}

// ─── CONVERGENCE SCORE (0–100) ────────────────────────────────

export function calculateConvergenceScore(proposals: LOIProposal[], sellerAsk: number): number {
  const conv = calculateConvergence(proposals)
  if (conv.gap <= 0) return 100
  if (sellerAsk <= 0) return 0

  // Score based on how much of the initial gap has been closed
  const initialGap = sellerAsk - (proposals.find(p => p.proposingParty === "buyer")?.purchasePrice || 0)
  if (initialGap <= 0) return 100

  const closed = initialGap - conv.gap
  return Math.max(0, Math.min(100, Math.round((closed / initialGap) * 100)))
}

// ─── DEADLOCK DETECTION ───────────────────────────────────────

export function detectDeadlock(proposals: LOIProposal[]): boolean {
  if (proposals.length < 6) return false

  const recentBuyer = proposals.filter(p => p.proposingParty === "buyer").slice(-3)
  const recentSeller = proposals.filter(p => p.proposingParty === "seller").slice(-3)

  if (recentBuyer.length < 3 || recentSeller.length < 3) return false

  const buyerMovement = Math.abs(recentBuyer[2].purchasePrice - recentBuyer[0].purchasePrice)
  const sellerMovement = Math.abs(recentSeller[0].purchasePrice - recentSeller[2].purchasePrice)
  const avgPrice = (recentBuyer[2].purchasePrice + recentSeller[2].purchasePrice) / 2

  return (buyerMovement / avgPrice < 0.01) && (sellerMovement / avgPrice < 0.01)
}

// ─── GAP ANALYSIS & BRIDGE PROPOSALS ──────────────────────────

export interface BridgeProposal {
  description: string
  mechanism: "earnout" | "seller_note" | "escrow" | "consulting_agreement"
  amount: number
  terms: string
}

export interface GapAnalysis {
  priceGap: number
  buyerPosition: number
  sellerPosition: number
  bridgeProposals: BridgeProposal[]
}

export function generateGapAnalysis(
  proposals: LOIProposal[],
  sellerMandate: SellerMandate,
  buyerMandate: BuyerMandate,
): GapAnalysis {
  const conv = calculateConvergence(proposals)
  const priceGap = conv.gap
  const bridgeProposals: BridgeProposal[] = []

  if (priceGap <= 0) {
    return { priceGap: 0, buyerPosition: conv.buyerPrice, sellerPosition: conv.sellerPrice, bridgeProposals }
  }

  // Earnout bridge
  const earnoutAmount = Math.min(priceGap, conv.sellerPrice * 0.15)
  bridgeProposals.push({
    description: `Performance-based earnout of $${earnoutAmount.toLocaleString()} tied to year-1 revenue retention`,
    mechanism: "earnout",
    amount: earnoutAmount,
    terms: `$${earnoutAmount.toLocaleString()} paid if annual revenue stays above 90% of current run rate for 12 months post-close`,
  })

  // Seller note bridge
  if (sellerMandate.maxSellerNote > 0) {
    const noteAmount = Math.min(priceGap, conv.sellerPrice * (sellerMandate.maxSellerNote / 100))
    bridgeProposals.push({
      description: `Seller financing of $${noteAmount.toLocaleString()} at favorable terms`,
      mechanism: "seller_note",
      amount: noteAmount,
      terms: `$${noteAmount.toLocaleString()} seller note at 5% interest over 3 years`,
    })
  }

  // Consulting agreement for small gaps
  if (priceGap < conv.sellerPrice * 0.1) {
    const consultingAmount = Math.min(priceGap, 150_000)
    bridgeProposals.push({
      description: `Post-sale consulting agreement worth $${consultingAmount.toLocaleString()}`,
      mechanism: "consulting_agreement",
      amount: consultingAmount,
      terms: `${Math.ceil(consultingAmount / 10_000)}-month consulting engagement at $10,000/month`,
    })
  }

  // Escrow holdback
  const escrowAmount = Math.min(priceGap * 0.5, conv.sellerPrice * 0.1)
  bridgeProposals.push({
    description: `Escrow holdback of $${escrowAmount.toLocaleString()} released upon milestones`,
    mechanism: "escrow",
    amount: escrowAmount,
    terms: `$${escrowAmount.toLocaleString()} held in escrow, released after 6 months if customer retention exceeds 85%`,
  })

  return {
    priceGap,
    buyerPosition: conv.buyerPrice,
    sellerPosition: conv.sellerPrice,
    bridgeProposals,
  }
}

// ─── FAIRNESS SCORING ─────────────────────────────────────────

export function calculateFairnessScore(
  agreedPrice: number,
  sellerMin: number,
  buyerMax: number,
): number {
  const nashSolution = (sellerMin + buyerMax) / 2
  const maxDeviation = (buyerMax - sellerMin) / 2
  if (maxDeviation <= 0) return 1.0
  const deviation = Math.abs(agreedPrice - nashSolution)
  return Math.max(0, Math.round((1 - deviation / maxDeviation) * 100) / 100)
}

// ─── NEGOTIATION SUMMARY ─────────────────────────────────────

export interface NegotiationSummary {
  totalRounds: number
  timeElapsedMs: number
  fairnessScore: number
  convergenceScore: number
  buyerSavingsVsAsking: number
  sellerPremiumVsFloor: number
  totalConcessions: { buyer: number; seller: number }
  relayFee: number
  traditionalFee: number
}

export function generateSummary(
  proposals: LOIProposal[],
  sellerMandate: SellerMandate,
  buyerMandate: BuyerMandate,
  startTime: number,
): NegotiationSummary {
  const lastProposal = proposals[proposals.length - 1]
  const agreedPrice = lastProposal?.purchasePrice || 0
  const totalRounds = Math.ceil(proposals.length / 2)

  const buyerProposals = proposals.filter(p => p.proposingParty === "buyer")
  const sellerProposals = proposals.filter(p => p.proposingParty === "seller")

  const buyerConcession = buyerProposals.length >= 2
    ? buyerProposals[buyerProposals.length - 1].purchasePrice - buyerProposals[0].purchasePrice
    : 0

  const sellerConcession = sellerProposals.length >= 2
    ? sellerProposals[0].purchasePrice - sellerProposals[sellerProposals.length - 1].purchasePrice
    : 0

  return {
    totalRounds,
    timeElapsedMs: Date.now() - startTime,
    fairnessScore: calculateFairnessScore(agreedPrice, sellerMandate.minPrice, buyerMandate.maxPrice),
    convergenceScore: calculateConvergenceScore(proposals, sellerMandate.askingPrice),
    buyerSavingsVsAsking: sellerMandate.askingPrice - agreedPrice,
    sellerPremiumVsFloor: agreedPrice - sellerMandate.minPrice,
    totalConcessions: {
      buyer: Math.abs(buyerConcession),
      seller: Math.abs(sellerConcession),
    },
    relayFee: Math.round(agreedPrice * 0.025),
    traditionalFee: Math.round(agreedPrice * 0.09),
  }
}
