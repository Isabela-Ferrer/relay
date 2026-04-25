export interface AnalysisResult {
  sessionId: string
  analyzedAt: string
  summary: string
  gapAnalysis: {
    term: string
    buyerPosition: string | number
    sellerPosition: string | number
    gapSize: "small" | "medium" | "large"
    bridgeSuggestion: string
  }[]
  convergenceProbability: number
  estimatedRoundsToClose: number
  blockingIssues: string[]
  quickWins: string[]
  riskAssessment: {
    risk: string
    severity: "low" | "medium" | "high"
    mitigation: string
  }[]
  recommendedNextAction: string
}

export async function POST(): Promise<Response> {
  const result: AnalysisResult = {
    sessionId: "session-mock-001",
    analyzedAt: new Date().toISOString(),
    summary:
      "Parties are $2M apart on headline price. Structure and timeline are largely aligned. Main friction points are earnout design and exclusivity length.",
    gapAnalysis: [
      {
        term: "Purchase price",
        buyerPosition: 11_000_000,
        sellerPosition: 13_000_000,
        gapSize: "medium",
        bridgeSuggestion: "Split difference at $12M with $1M performance earnout tied to Year 1 revenue.",
      },
      {
        term: "Exclusivity period",
        buyerPosition: "45 days",
        sellerPosition: "30 days",
        gapSize: "small",
        bridgeSuggestion: "Agree to 30 days with a 15-day extension option upon mutual consent.",
      },
      {
        term: "Non-compete duration",
        buyerPosition: "36 months",
        sellerPosition: "24 months",
        gapSize: "small",
        bridgeSuggestion: "Settle at 30 months, standard for this transaction size.",
      },
      {
        term: "Indemnification cap",
        buyerPosition: "20% of purchase price",
        sellerPosition: "10% of purchase price",
        gapSize: "medium",
        bridgeSuggestion: "15% cap is market standard for comparable transactions; use as anchor.",
      },
    ],
    convergenceProbability: 0.72,
    estimatedRoundsToClose: 3,
    blockingIssues: ["Headline price delta of $2M"],
    quickWins: [
      "Align on exclusivity at 30 days + extension",
      "Confirm non-compete at 30 months",
      "Lock deal structure as stock sale",
    ],
    riskAssessment: [
      {
        risk: "Buyer financing contingency",
        severity: "medium",
        mitigation: "Request proof of funds or committed debt financing letter before exclusivity.",
      },
      {
        risk: "Seller key-person dependency",
        severity: "high",
        mitigation: "Negotiate retention package for founder with 18-month stay bonus.",
      },
      {
        risk: "Customer concentration",
        severity: "medium",
        mitigation: "Tie 50% of earnout to top-3 customer retention through Year 1.",
      },
    ],
    recommendedNextAction:
      "Buyer should submit revised LOI at $12M with structured earnout. Seller should respond within 48 hours.",
  }

  return Response.json(result)
}
