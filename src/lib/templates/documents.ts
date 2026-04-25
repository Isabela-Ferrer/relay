// ═══════════════════════════════════════════════════════════════
// Relay — Document Templates (NDA, CIM, LOI)
// ═══════════════════════════════════════════════════════════════

import type { SellerOnboardingData, ValuationMemo, LOIProposal } from "@/lib/agents/types"

// ─── NDA ──────────────────────────────────────────────────────

export function generateNDA(buyerName: string, sellerCompany: string): string {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  return `MUTUAL NON-DISCLOSURE AGREEMENT

Effective Date: ${today}

This Mutual Non-Disclosure Agreement ("Agreement") is entered into by and between:

Disclosing Party: ${sellerCompany} ("Seller")
Receiving Party: ${buyerName} ("Buyer")

1. PURPOSE
The Parties wish to explore a potential business transaction involving the acquisition of the Seller's business. In connection with this evaluation, each Party may disclose certain confidential and proprietary information.

2. CONFIDENTIAL INFORMATION
"Confidential Information" means any and all non-public information disclosed by either Party, including: financial statements, customer lists, business plans, pricing strategies, trade secrets, employee information, operational data, and any other information marked as or reasonably understood to be confidential.

3. OBLIGATIONS
The Receiving Party agrees to: (a) hold all Confidential Information in strict confidence; (b) not disclose Confidential Information to any third party without prior written consent; (c) use Confidential Information solely for evaluating the Transaction; (d) limit disclosure to employees, advisors, and representatives with a need to know.

4. EXCLUSIONS
Confidential Information does not include information that: (a) is publicly available through no fault of the Receiving Party; (b) was known prior to disclosure; (c) is independently developed without use of Confidential Information; (d) is disclosed pursuant to court order with reasonable notice.

5. TERM
This Agreement shall remain in effect for 2 years from the Effective Date.

6. RETURN OF MATERIALS
Upon termination or request, the Receiving Party shall promptly return or destroy all Confidential Information.

7. NO OBLIGATION TO TRANSACT
This Agreement does not obligate either Party to proceed with the Transaction.

8. GOVERNING LAW
This Agreement shall be governed by the laws of the State of New York.

SELLER: ${sellerCompany}
Signature: ___________________________
Date: ___________________________

BUYER: ${buyerName}
Signature: ___________________________
Date: ___________________________`
}

// ─── CIM ──────────────────────────────────────────────────────

export interface CIMSection {
  title: string
  content: string
}

export function generateCIM(seller: SellerOnboardingData, valuation: ValuationMemo): CIMSection[] {
  const { financials } = seller
  const sde = financials.netIncomeY3 + financials.ownerSalary + financials.addBacks
  const grossMargin = financials.revenueY3 > 0
    ? (financials.revenueY3 - financials.expensesY3) / financials.revenueY3
    : 0
  const revenueGrowthRate = financials.revenueY2 > 0
    ? (financials.revenueY3 - financials.revenueY2) / financials.revenueY2
    : 0
  const grossMarginPct = (grossMargin * 100).toFixed(0)
  const growthPct = (revenueGrowthRate * 100).toFixed(0)
  const sdeMarginPct = financials.revenueY3 > 0 ? ((sde / financials.revenueY3) * 100).toFixed(0) : "0"

  return [
    {
      title: "Executive Summary",
      content: `${seller.companyName} is a ${seller.industry} ${seller.businessType} headquartered in ${seller.headquarters}, generating $${(financials.revenueY3 / 1_000_000).toFixed(1)}M in annual revenue with $${(sde / 1_000).toFixed(0)}K SDE. Founded in ${seller.foundedYear}, the company has ${seller.employeeCount} employees and ${seller.customerCount} customers, demonstrating ${growthPct}% year-over-year revenue growth. The indicative valuation range is $${(valuation.range.low / 1_000_000).toFixed(1)}M–$${(valuation.range.high / 1_000_000).toFixed(1)}M.`,
    },
    {
      title: "Business Description",
      content: `${seller.description} The company operates as a ${seller.dealStructurePreference === "flexible" ? "flexibly structured" : seller.dealStructurePreference} entity with ${seller.employeeCount} team members. ${seller.exclusions.length > 0 ? `Note: the following are excluded from the transaction: ${seller.exclusions.join(", ")}.` : "No material assets are excluded from the transaction."}`,
    },
    {
      title: "Financial Overview",
      content: `Revenue (Y1 / Y2 / Y3): $${financials.revenueY1.toLocaleString()} / $${financials.revenueY2.toLocaleString()} / $${financials.revenueY3.toLocaleString()}\nNet Income (Y3): $${financials.netIncomeY3.toLocaleString()}\nOwner Salary: $${financials.ownerSalary.toLocaleString()}\nAdd-Backs: $${financials.addBacks.toLocaleString()}\nSDE: $${sde.toLocaleString()}\nGross Margin: ${grossMarginPct}%\nSDE Margin: ${sdeMarginPct}%\nYoY Revenue Growth (Y2→Y3): ${growthPct}%\nRecurring Revenue: ${seller.recurringRevenuePercent}%`,
    },
    {
      title: "Investment Highlights",
      content: valuation.keyValueDrivers.map((d, i) => `${i + 1}. ${d}`).join("\n"),
    },
    {
      title: "Growth Opportunities",
      content: revenueGrowthRate > 0.2
        ? `The business has demonstrated strong organic growth of ${growthPct}% YoY. Key growth vectors include geographic expansion, product line extension, and enterprise customer acquisition. The ${grossMarginPct}% gross margin provides significant room for reinvestment.`
        : `The business has a stable revenue base with opportunities for growth through market expansion, operational improvements, and strategic investment in sales and marketing.`,
    },
    {
      title: "Risk Factors",
      content: valuation.risks.length > 0
        ? valuation.risks.map((r, i) => `${i + 1}. ${r}`).join("\n")
        : "No significant risk factors identified.",
    },
    {
      title: "Reason for Sale",
      content: seller.reasonForSale,
    },
    {
      title: "Transaction Overview",
      content: `Asking price range: $${(valuation.range.low / 1_000_000).toFixed(1)}M–$${(valuation.range.high / 1_000_000).toFixed(1)}M.\nPreferred structure: ${seller.dealStructurePreference}.\nTarget timeline: ${seller.timeline.replace("_", " ")}.\n\n${valuation.recommendation}`,
    },
    {
      title: "Disclaimer",
      content: "This CIM has been prepared for informational purposes only. All information is based on data provided by the Seller and has not been independently verified. Prospective buyers should conduct their own due diligence. This document does not constitute an offer to sell or a solicitation of an offer to buy any securities or assets.",
    },
  ]
}

// ─── LOI ──────────────────────────────────────────────────────

export function generateLOI(proposal: LOIProposal, sellerCompany: string, buyerName: string): string {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const { priceStructure } = proposal

  let structureDetails = `• Cash at Closing: $${priceStructure.cashAtClose.toLocaleString()}`
  if (priceStructure.sellerFinancing > 0) {
    structureDetails += `\n• Seller Note: $${priceStructure.sellerFinancing.toLocaleString()}`
  }
  if (priceStructure.earnout > 0) {
    structureDetails += `\n• Earnout: $${priceStructure.earnout.toLocaleString()}${priceStructure.earnoutConditions ? ` — ${priceStructure.earnoutConditions}` : ""}`
  }
  if (priceStructure.rolloverEquity > 0) {
    structureDetails += `\n• Rollover Equity: $${priceStructure.rolloverEquity.toLocaleString()}`
  }

  return `LETTER OF INTENT (Non-Binding)

${today}

Dear ${sellerCompany},

This Letter of Intent ("LOI") sets forth the principal terms upon which ${buyerName} ("Buyer") proposes to acquire ${sellerCompany} ("Seller"). This LOI is non-binding except for the exclusivity and confidentiality provisions.

1. PURCHASE PRICE
Total: $${proposal.purchasePrice.toLocaleString()}, structured as follows:
${structureDetails}

2. DEAL STRUCTURE
The Transaction shall be structured as a${proposal.dealStructure === "asset_sale" ? "n asset" : proposal.dealStructure === "stock_sale" ? " stock" : ""} ${proposal.dealStructure.replace("_", " ")}.

3. DUE DILIGENCE
Buyer shall have ${proposal.dueDiligencePeriodDays} days following execution of this LOI to conduct customary due diligence.

4. EXCLUSIVITY
${proposal.exclusivity.requested ? `Seller agrees to an exclusivity period of ${proposal.exclusivity.periodDays} days from execution of this LOI.` : "No exclusivity period is requested."}

5. KEY PERSON RETENTION
${proposal.keyPersonRetention.length > 0 ? `The following key persons shall be retained through transition: ${proposal.keyPersonRetention.join(", ")}.` : "No specific key person retention requirements."}

6. NON-COMPETE
${proposal.nonCompetePeriodMonths ? `Seller agrees to a non-compete period of ${proposal.nonCompetePeriodMonths} months post-closing.` : "Non-compete terms to be negotiated in the definitive agreement."}

7. CLOSING CONDITIONS
${proposal.closingConditions.map((c, i) => `${i + 1}. ${c}`).join("\n")}

8. INDEMNIFICATION
${proposal.indemnificationCap ? `Indemnification capped at $${proposal.indemnificationCap.toLocaleString()}.` : "Indemnification terms to be negotiated in the definitive agreement."}

9. NON-BINDING
Except for exclusivity and confidentiality, this LOI is non-binding and does not obligate either Party to consummate the Transaction.

BUYER: ${buyerName}
Signature: ___________________________
Date: ___________________________

SELLER: ${sellerCompany}
Signature: ___________________________
Date: ___________________________`
}
