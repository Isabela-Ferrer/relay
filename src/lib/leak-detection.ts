// ═══════════════════════════════════════════════════════════════
// Relay — Information Leak Detection
// Scans agent reasoning for leaked confidential parameters
// ═══════════════════════════════════════════════════════════════

const SELLER_LEAK_PATTERNS = [
  /our minimum\s*(is|price|acceptable)/i,
  /walk[\s-]?away\s*(price|number|point)/i,
  /we('d|'ll| would| will)?\s*(accept|go|settle)\s*(as low as|for as little)/i,
  /lowest we/i,
  /floor\s*(is|price)/i,
  /motivated\s*to\s*sell/i,
  /urgency|urgent|quickly|need to sell fast/i,
  /desperate/i,
  /maximum seller note.*(is|of|up to)\s*\d/i,
  /we('re| are)\s*(willing|open)\s*to\s*go\s*(down|lower)\s*to/i,
  /our bottom line/i,
  /weaknesses?\s*(include|are|is)/i,
]

const BUYER_LEAK_PATTERNS = [
  /our maximum\s*(is|budget|price)/i,
  /we('d|'ll| would| will)?\s*(go|pay)\s*(up to|as high as|as much as)/i,
  /ceiling\s*(is|price)/i,
  /highest we/i,
  /could stretch to/i,
  /budget\s*(is|allows|of)\s*\$/i,
  /alternative\s*(deals?|options?|acquisitions?)/i,
  /other\s*(deals?|options?|targets?)\s*(we('re| are)|under)/i,
  /prefer.*structure.*(is|would be)\s*\d/i,
  /we('re| are)\s*(willing|open)\s*to\s*go\s*(up|higher)\s*to/i,
  /our cap is/i,
  /risk concerns.*(include|are)/i,
]

export function detectLeak(
  text: string,
  role: "buyer" | "seller",
  confidentialValues: number[] = [],
): { leaked: boolean; matches: string[] } {
  const patterns = role === "seller" ? SELLER_LEAK_PATTERNS : BUYER_LEAK_PATTERNS
  const matches: string[] = []

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) matches.push(match[0])
  }

  // Check for exact confidential dollar amounts
  for (const value of confidentialValues) {
    const formatted = value.toLocaleString("en-US")
    const raw = value.toString()
    const patterns = [
      new RegExp(`\\$${formatted.replace(/,/g, ",")}(?!\\d)`, "i"),
      new RegExp(`\\$${raw}(?!\\d)`, "i"),
    ]
    for (const p of patterns) {
      if (p.test(text)) {
        matches.push(`Contains confidential value: $${formatted}`)
      }
    }
  }

  return { leaked: matches.length > 0, matches }
}

export function sanitizeReasoning(text: string, role: "buyer" | "seller"): string {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const patterns = role === "seller"
    ? [/minimum/i, /walk[\s-]?away/i, /floor/i, /urgent/i, /lowest/i, /weakness/i, /desperate/i]
    : [/maximum/i, /ceiling/i, /budget/i, /highest/i, /stretch/i, /alternative/i, /risk concern/i]

  const clean = sentences.filter(s => !patterns.some(p => p.test(s)))

  return clean.length > 0
    ? clean.join(" ")
    : "Based on our analysis of the business fundamentals and market comparables, we believe this proposal represents a fair position."
}

export const LEAK_WARNING = `WARNING: Your previous response contained confidential information in the reasoning field. This is a critical violation. Regenerate your proposal with reasoning that justifies your position using ONLY business fundamentals, market data, and valuation analysis. Do NOT reference your minimum price, maximum budget, urgency, preferred structure percentages, or any other confidential parameters.`
