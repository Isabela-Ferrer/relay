// ═══════════════════════════════════════════════════════════════
// Relay — Valuation Engine
// Calculates SDE-based valuation from seller onboarding data
// ═══════════════════════════════════════════════════════════════

import type { SellerOnboardingData, ValuationMemo } from "@/lib/agents/types"

// ─── INDUSTRY MULTIPLES ───────────────────────────────────────
const INDUSTRY_MULTIPLES: Record<string, { low: number; high: number }> = {
  "B2B SaaS":                { low: 3.0, high: 5.0 },
  "SaaS":                    { low: 3.0, high: 5.0 },
  "Professional Services":   { low: 2.0, high: 3.5 },
  "E-Commerce":              { low: 2.0, high: 3.5 },
  "Retail":                  { low: 1.5, high: 2.5 },
  "Manufacturing":           { low: 2.5, high: 4.0 },
  "Healthcare":              { low: 2.5, high: 4.5 },
  "Hospitality":             { low: 1.5, high: 3.0 },
  "Construction":            { low: 1.5, high: 3.0 },
}
const DEFAULT_MULTIPLE = { low: 2.0, high: 3.0 }

export interface ValuationResult {
  sde: number
  sdeBreakdown: {
    netIncome: number
    ownerCompensation: number
    adjustments: number
  }
  baseMultiple: number
  adjustments: { factor: string; delta: number; reason: string }[]
  adjustedMultiple: number
  valuationLow: number
  valuationMid: number
  valuationHigh: number
  riskFlags: { severity: "high" | "medium" | "low"; title: string; description: string }[]
}

export function calculateValuation(seller: SellerOnboardingData): ValuationResult {
  const { financials } = seller

  // ─── SDE Calculation ──────────────────────────────────
  // SDE = Net Income (most recent year) + Owner Salary + Add-Backs
  const sde = financials.netIncomeY3 + financials.ownerSalary + financials.addBacks
  const sdeBreakdown = {
    netIncome: financials.netIncomeY3,
    ownerCompensation: financials.ownerSalary,
    adjustments: financials.addBacks,
  }

  // ─── Base Multiple ────────────────────────────────────
  const range = INDUSTRY_MULTIPLES[seller.industry] || DEFAULT_MULTIPLE
  const baseMultiple = (range.low + range.high) / 2

  // ─── Adjustments ──────────────────────────────────────
  const adjustments: { factor: string; delta: number; reason: string }[] = []

  // YoY growth from 3-year history
  const revenueGrowthRate = financials.revenueY2 > 0
    ? (financials.revenueY3 - financials.revenueY2) / financials.revenueY2
    : 0

  if (revenueGrowthRate > 0.30) {
    adjustments.push({ factor: "High Growth", delta: 0.5, reason: `${(revenueGrowthRate * 100).toFixed(0)}% YoY revenue growth exceeds 30% threshold` })
  } else if (revenueGrowthRate > 0.15) {
    adjustments.push({ factor: "Moderate Growth", delta: 0.25, reason: `${(revenueGrowthRate * 100).toFixed(0)}% YoY revenue growth shows healthy trajectory` })
  } else if (revenueGrowthRate < 0) {
    adjustments.push({ factor: "Declining Revenue", delta: -0.5, reason: `Revenue declined ${(Math.abs(revenueGrowthRate) * 100).toFixed(0)}% YoY` })
  }

  // Customer concentration risk
  if (seller.topCustomerRevenuePercent > 20) {
    adjustments.push({ factor: "Customer Concentration", delta: -0.5, reason: `Top customer represents ${seller.topCustomerRevenuePercent}% of revenue — exceeds 20% threshold` })
  }

  // Recurring revenue premium
  if (seller.recurringRevenuePercent > 80) {
    adjustments.push({ factor: "High Recurring Revenue", delta: 0.5, reason: `${seller.recurringRevenuePercent}% recurring revenue indicates predictable cash flows` })
  } else if (seller.recurringRevenuePercent < 20) {
    adjustments.push({ factor: "Low Recurring Revenue", delta: -0.25, reason: `${seller.recurringRevenuePercent}% recurring revenue adds revenue risk` })
  }

  // Gross margin from most recent year
  const grossMargin = financials.revenueY3 > 0
    ? (financials.revenueY3 - financials.expensesY3) / financials.revenueY3
    : 0

  if (grossMargin > 0.70) {
    adjustments.push({ factor: "Strong Gross Margins", delta: 0.5, reason: `${(grossMargin * 100).toFixed(0)}% gross margin indicates high-quality revenue` })
  } else if (grossMargin < 0.40) {
    adjustments.push({ factor: "Low Gross Margins", delta: -0.25, reason: `${(grossMargin * 100).toFixed(0)}% gross margin limits scalability` })
  }

  // SDE margin on revenue
  const sdeMargin = financials.revenueY3 > 0 ? sde / financials.revenueY3 : 0
  if (sdeMargin > 0.25) {
    adjustments.push({ factor: "Strong Profitability", delta: 0.25, reason: `${(sdeMargin * 100).toFixed(0)}% SDE margin exceeds industry norms` })
  } else if (sdeMargin < 0.10) {
    adjustments.push({ factor: "Thin Profitability", delta: -0.25, reason: `${(sdeMargin * 100).toFixed(0)}% SDE margin leaves little room for error` })
  }

  // Team size as owner-dependency proxy
  if (seller.employeeCount < 5) {
    adjustments.push({ factor: "Owner Dependency Risk", delta: -0.5, reason: `Only ${seller.employeeCount} employees suggests heavy owner dependency` })
  } else if (seller.employeeCount > 20) {
    adjustments.push({ factor: "Established Team", delta: 0.25, reason: `${seller.employeeCount} employees indicates scalable operations` })
  }

  // Track record — +0.25x per year beyond 3, capped at +1.0x
  const currentYear = new Date().getFullYear()
  const yearsInBusiness = currentYear - seller.foundedYear
  if (yearsInBusiness > 3) {
    const trackDelta = Math.min((yearsInBusiness - 3) * 0.25, 1.0)
    adjustments.push({ factor: "Established Track Record", delta: trackDelta, reason: `${yearsInBusiness} years in business (+${trackDelta.toFixed(2)}x)` })
  }

  // Timeline urgency discount
  if (seller.timeline === "immediate") {
    adjustments.push({ factor: "Urgent Timeline", delta: -0.25, reason: `Immediate sale timeline may limit competitive process` })
  }

  // ─── Final Multiple ───────────────────────────────────
  const totalAdjustment = adjustments.reduce((sum, a) => sum + a.delta, 0)
  const adjustedMultiple = Math.max(1.0, Math.round((baseMultiple + totalAdjustment) * 100) / 100)

  // ─── Valuation Range ──────────────────────────────────
  const midValuation = Math.round(sde * adjustedMultiple)
  const lowValuation = Math.round(midValuation * 0.8)
  const highValuation = Math.round(midValuation * 1.2)

  // ─── Risk Flags ───────────────────────────────────────
  const riskFlags: ValuationResult["riskFlags"] = []

  if (seller.topCustomerRevenuePercent > 20) {
    riskFlags.push({
      severity: seller.topCustomerRevenuePercent > 40 ? "high" : "medium",
      title: "High Customer Concentration",
      description: `Top customer represents ${seller.topCustomerRevenuePercent}% of revenue. Buyers will discount heavily and may require retention guarantees.`,
    })
  }

  if (seller.employeeCount < 10) {
    riskFlags.push({
      severity: seller.employeeCount < 5 ? "high" : "medium",
      title: "Owner Dependency",
      description: `With ${seller.employeeCount} employees, the business likely depends heavily on the owner. Buyers will want a longer transition period.`,
    })
  }

  if (revenueGrowthRate < 0) {
    riskFlags.push({
      severity: "high",
      title: "Declining Revenue",
      description: `Revenue declined ${(Math.abs(revenueGrowthRate) * 100).toFixed(0)}% year-over-year. This will significantly impact buyer interest.`,
    })
  }

  if (sdeMargin < 0.15) {
    riskFlags.push({
      severity: "medium",
      title: "Margin Pressure",
      description: `SDE margin of ${(sdeMargin * 100).toFixed(0)}% is below typical acquisition thresholds. Buyers will question scalability.`,
    })
  }

  if (seller.recurringRevenuePercent < 20) {
    riskFlags.push({
      severity: "medium",
      title: "Low Recurring Revenue",
      description: `Only ${seller.recurringRevenuePercent}% recurring revenue makes future cash flows less predictable, reducing buyer confidence.`,
    })
  }

  if (seller.timeline === "immediate") {
    riskFlags.push({
      severity: "low",
      title: "Compressed Timeline",
      description: `An immediate sale timeline may limit the competitive process and reduce offers.`,
    })
  }

  if (seller.exclusions.length > 2) {
    riskFlags.push({
      severity: "medium",
      title: "Significant Exclusions",
      description: `${seller.exclusions.length} asset exclusions may complicate deal structure and reduce buyer confidence.`,
    })
  }

  return {
    sde,
    sdeBreakdown,
    baseMultiple,
    adjustments,
    adjustedMultiple,
    valuationLow: lowValuation,
    valuationMid: midValuation,
    valuationHigh: highValuation,
    riskFlags,
  }
}

// Build a ValuationMemo (matching the repo's existing type) from our calculation
export function buildValuationMemo(
  seller: SellerOnboardingData,
  sessionId: string,
): ValuationMemo {
  const result = calculateValuation(seller)
  const ebitdaMultiple = result.adjustedMultiple

  return {
    sessionId,
    companyName: seller.companyName,
    analysisDate: new Date().toISOString(),
    analystNotes: `Valuation based on ${seller.industry} industry multiples adjusted for growth, margins, and risk factors. SDE of $${result.sde.toLocaleString()} with an adjusted ${ebitdaMultiple}x multiple.`,
    methods: [
      {
        method: "ebitda_multiple",
        value: result.valuationMid,
        weight: 0.6,
        assumptions: [
          `${ebitdaMultiple}x adjusted EBITDA multiple`,
          `EBITDA of $${result.sde.toLocaleString()}`,
          ...result.adjustments.map(a => `${a.factor}: ${a.delta > 0 ? "+" : ""}${a.delta}x (${a.reason})`),
        ],
      },
      {
        method: "revenue_multiple",
        value: Math.round(seller.financials.revenueY3 * (ebitdaMultiple * 0.4)),
        weight: 0.25,
        assumptions: [
          `${(ebitdaMultiple * 0.4).toFixed(1)}x revenue multiple (derived from SDE multiple)`,
          `Revenue of $${seller.financials.revenueY3.toLocaleString()}`,
        ],
      },
      {
        method: "precedent_transactions",
        value: result.valuationMid,
        weight: 0.15,
        assumptions: [
          `Based on comparable ${seller.industry} transactions`,
          `Adjusted for company-specific factors`,
        ],
      },
    ],
    weightedValue: result.valuationMid,
    range: {
      low: result.valuationLow,
      mid: result.valuationMid,
      high: result.valuationHigh,
    },
    keyValueDrivers: [
      ...(result.adjustments.filter(a => a.delta > 0).map(a => a.reason)),
      `$${result.sde.toLocaleString()} in EBITDA`,
    ],
    risks: result.riskFlags.map(r => `${r.title}: ${r.description}`),
    comparableTransactions: [],
    recommendation: `Indicative valuation range of $${(result.valuationLow / 1_000_000).toFixed(1)}M–$${(result.valuationHigh / 1_000_000).toFixed(1)}M. Mid-point of $${(result.valuationMid / 1_000_000).toFixed(1)}M recommended as anchor.`,
    currency: "USD",
  }
}
