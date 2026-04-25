import type { BuyerProfile, QualificationResult } from "@/lib/agents/types"
import { DEMO_SELLER } from "@/lib/scenarios"

export async function POST(req: Request): Promise<Response> {
  let body: { buyerProfile?: BuyerProfile; sessionId?: string; askingPrice?: number }

  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const sessionId = body.sessionId || crypto.randomUUID()
  const buyer = body.buyerProfile
  const askingPrice = body.askingPrice || DEMO_SELLER.askingPrice || 3_780_000

  if (!buyer) {
    return Response.json(buildDemoResult(sessionId))
  }

  const criteria: QualificationResult["criteria"] = []
  let totalScore = 0

  const capitalRatio = buyer.checkSize.max / askingPrice
  const finScore = capitalRatio >= 1.0 ? 30 : capitalRatio >= 0.5 ? 22 : capitalRatio >= 0.3 ? 15 : 5
  criteria.push({
    criterion: "Financial capacity",
    weight: 30,
    score: finScore,
    passed: finScore >= 15,
    rationale: capitalRatio >= 0.3
      ? `Check size of $${buyer.checkSize.max.toLocaleString()} covers ${(capitalRatio * 100).toFixed(0)}% of asking price.`
      : "Check size insufficient relative to asking price.",
  })
  totalScore += finScore

  const industryMatch = buyer.targetIndustries.some(i =>
    ["saas", "software", "tech", "logistics", "b2b"].some(k => i.toLowerCase().includes(k))
  )
  const industryScore = industryMatch ? 25 : 12
  criteria.push({
    criterion: "Industry fit",
    weight: 25,
    score: industryScore,
    passed: industryScore >= 15,
    rationale: industryMatch ? "Target industries align with available deal." : "Partial industry match.",
  })
  totalScore += industryScore

  const structureScore = 20
  criteria.push({ criterion: "Deal structure compatibility", weight: 20, score: structureScore, passed: true, rationale: "Standard deal structures accepted." })
  totalScore += structureScore

  const geoMatch = buyer.geographicFocus.some(g => g.toLowerCase().includes("united states") || g.toLowerCase().includes("us"))
  const geoScore = geoMatch ? 15 : 8
  criteria.push({ criterion: "Geographic focus", weight: 15, score: geoScore, passed: geoScore >= 10, rationale: geoMatch ? "US-focused." : "Geographic mismatch." })
  totalScore += geoScore

  criteria.push({ criterion: "NDA readiness", weight: 10, score: 8, passed: true, rationale: "Buyer agreed to sign NDA." })
  totalScore += 8

  const riskFlags: string[] = []
  if (buyer.previousAcquisitions === 0) riskFlags.push("No prior acquisition experience")
  if (capitalRatio < 0.5) riskFlags.push("May require significant external financing")

  const result: QualificationResult = {
    buyerId: buyer.id,
    sessionId,
    evaluatedAt: new Date().toISOString(),
    passed: totalScore >= 60,
    score: totalScore,
    maxScore: 100,
    criteria,
    financialCapabilityVerified: finScore >= 15,
    strategicFitScore: Math.round((industryScore + structureScore) / 45 * 100),
    culturalFitScore: 70,
    riskFlags,
    recommendedNextStep: totalScore >= 60 ? "proceed_to_nda" : totalScore >= 45 ? "request_more_info" : "disqualify",
    analystNotes: `Score: ${totalScore}/100. ${riskFlags.length > 0 ? riskFlags.join(", ") + "." : "No significant concerns."}`,
  }

  return Response.json(result)
}

function buildDemoResult(sessionId: string): QualificationResult {
  return {
    buyerId: "buyer-demo-001",
    sessionId,
    evaluatedAt: new Date().toISOString(),
    passed: true,
    score: 78,
    maxScore: 100,
    criteria: [
      { criterion: "Financial capacity", weight: 30, score: 25, passed: true, rationale: "Check size within stated range." },
      { criterion: "Industry fit", weight: 25, score: 20, passed: true, rationale: "B2B SaaS aligns with deal." },
      { criterion: "Deal structure compatibility", weight: 20, score: 15, passed: true, rationale: "Accepts stock sale." },
      { criterion: "Geographic focus", weight: 15, score: 10, passed: true, rationale: "US-focused." },
      { criterion: "NDA readiness", weight: 10, score: 8, passed: true, rationale: "Ready to sign NDA." },
    ],
    financialCapabilityVerified: true,
    strategicFitScore: 80,
    culturalFitScore: 70,
    riskFlags: ["Limited acquisition track record"],
    recommendedNextStep: "proceed_to_nda",
    analystNotes: "Buyer qualified. Proceed to NDA and CIM delivery.",
  }
}
