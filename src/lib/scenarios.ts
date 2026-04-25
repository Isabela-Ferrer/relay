// ═══════════════════════════════════════════════════════════════
// Relay — Demo Scenarios
// Pre-built data for the CloudTrack Pro hackathon demo
// ═══════════════════════════════════════════════════════════════

import type {
  SellerOnboardingData,
  BuyerProfile,
  SellerMandate,
  BuyerMandate,
  NegotiationState,
} from "@/lib/agents/types"

// ─── SELLER DATA ──────────────────────────────────────────────

export const DEMO_SELLER: SellerOnboardingData = {
  companyName: "CloudTrack Pro",
  industry: "B2B SaaS",
  businessType: "S-Corp",
  description: "B2B SaaS fleet management and logistics optimization platform serving mid-market transportation and delivery companies.",
  foundedYear: 2021,
  headquarters: "Austin, TX",
  employeeCount: 18,
  customerCount: 142,
  financials: {
    revenueY1: 650_000,
    revenueY2: 900_000,
    revenueY3: 1_200_000,
    expensesY1: 390_000,
    expensesY2: 540_000,
    expensesY3: 720_000,
    netIncomeY1: 260_000,
    netIncomeY2: 360_000,
    netIncomeY3: 480_000,
    ownerSalary: 150_000,
    addBacks: 15_600,
    fiscalYearEnd: "December",
  },
  topCustomerRevenuePercent: 14,
  recurringRevenuePercent: 88,
  reasonForSale: "Founder retirement after 5 years — seeking liquidity for next venture.",
  targetPrice: 3_600_000,
  minimumPrice: 2_800_000,
  transitionWillingness: 3,
  sellerNoteTolerance: 20,
  earnoutWillingness: "conditional",
  dealStructurePreference: "flexible",
  timeline: "6_months",
  exclusions: [],
  confidentialityLevel: "high",
  contactName: "Sarah Chen",
  contactEmail: "sarah@cloudtrackpro.com",
}

// ─── BUYER DATA ───────────────────────────────────────────────

export const DEMO_BUYER: BuyerProfile = {
  id: "buyer-demo-001",
  organizationName: "Apex Growth Partners",
  buyerType: "individual",
  operationalBackground: "8 years in SaaS operations and product management. No prior acquisitions. SBA 7(a) pre-qualified. Seeking owner-operated B2B SaaS with strong recurring revenue and product-market fit.",
  targetIndustries: ["B2B SaaS", "Logistics Tech", "Fleet Management"],
  geographicFocus: ["United States"],
  availableCapital: 2_500_000,
  sbaPrequalified: true,
  sbaPrequalAmount: 2_000_000,
  maxPrice: 3_200_000,
  preferredStructure: "sba_7a",
  earnoutAppetite: "moderate",
  timelineToClose: 6,
  dueDiligenceTimeNeeded: 75,
  exclusivityPeriod: 90,
  qualificationStatus: "qualified",
  ndasigned: true,
  contactName: "James Park",
  contactEmail: "james@apexgrowth.com",
}

// ─── SELLER MANDATE ───────────────────────────────────────────

export const DEMO_SELLER_MANDATE: SellerMandate = {
  minPrice: 2_800_000,           // CONFIDENTIAL
  urgency: "Founder retirement — moderate urgency, willing to wait for right deal",  // CONFIDENTIAL
  maxSellerNote: 20,             // CONFIDENTIAL — max 20% seller financing
  maxTransition: 3,              // CONFIDENTIAL — max 3 months post-sale
  weaknesses: [
    "Founder handles all enterprise sales directly",
    "No formal customer success team — founder manages top accounts",
  ],                             // CONFIDENTIAL

  targetPrice: 3_600_000,
  askingPrice: 3_780_000,        // ~5% above target
  structures: ["stock_sale", "asset_sale"],
  earnoutWillingness: "Willing if metric is customer retention rate or ARR — not net-new growth. Max 12 months.",
  exclusivityWillingnessDays: 75,
  hardNos: [
    "Will not stay longer than 3 months post-sale",
    "Will not accept less than 60% cash at closing",
    "No clawback provisions on earned compensation",
  ],
}

// ─── BUYER MANDATE ────────────────────────────────────────────

export const DEMO_BUYER_MANDATE: BuyerMandate = {
  maxPrice: 3_200_000,           // CONFIDENTIAL
  preferredStructure: "70% cash at close, 15% seller note, 15% performance earnout",  // CONFIDENTIAL
  alternatives: "None currently — this is the primary target",  // CONFIDENTIAL
  timelineFlex: "Flexible up to 6 months, prefer 4 months",    // CONFIDENTIAL
  riskConcerns: [
    "Founder handles all enterprise sales — key person risk",
    "No dedicated customer success function",
    "Product roadmap dependent on founder vision",
  ],                             // CONFIDENTIAL

  openingRange: { low: 2_400_000, high: 2_700_000 },
  financingCapacity: "SBA 7(a) pre-qualified up to $2M + $500K cash equity + $300K ROBS",
  earnoutPreference: "Strong preference for 15-20% earnout tied to customer retention over 12 months",
  ddPeriodDays: 75,
  exclusivityDays: 90,
  closingTimelineDays: 150,
  hardConstraints: [
    "Total price cannot exceed $3.5M under any structure",
    "Minimum 60 days due diligence",
    "Seller must stay at least 2 months for transition",
  ],
}

// ─── INITIAL NEGOTIATION STATE ────────────────────────────────

export function buildDemoNegotiationState(sessionId: string): NegotiationState {
  return {
    sessionId,
    round: 1,
    status: "active",
    sellerData: DEMO_SELLER,
    buyerProfile: DEMO_BUYER,
    valuation: null,
    proposals: [],
    activeProposalId: null,
    agreedTerms: null,
    openIssues: [
      "Purchase price",
      "Deal structure (cash/note/earnout split)",
      "Earnout terms",
      "Exclusivity period",
      "Due diligence timeline",
      "Transition period",
    ],
    resolvedIssues: [],
    agentMessages: [],
    convergenceScore: 0,
    lastActivityAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
}
