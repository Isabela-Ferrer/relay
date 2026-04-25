import type { SellerOnboardingData, ValuationMemo } from "@/lib/agents/types"
import { generateCIM } from "@/lib/templates/documents"
import { buildValuationMemo } from "@/lib/valuation"
import type { GeneratedDocument } from "@/types"

export async function POST(req: Request): Promise<Response> {
  let body: { sellerData?: SellerOnboardingData; valuation?: ValuationMemo; sessionId?: string }

  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const sessionId = body.sessionId || crypto.randomUUID()

  // If no seller data provided, use demo data
  const { DEMO_SELLER } = await import("@/lib/scenarios")
  const sellerData = body.sellerData || DEMO_SELLER
  const valuation = body.valuation || buildValuationMemo(sellerData, sessionId)

  const sections = generateCIM(sellerData, valuation)

  // Return both structured sections (for frontend rendering) and a plain text version
  const plainText = sections.map(s => `${s.title.toUpperCase()}\n${s.content}`).join("\n\n")

  const doc: GeneratedDocument = {
    type: "CIM",
    sessionId,
    generatedAt: new Date().toISOString(),
    content: plainText,
  }

  return Response.json({ ...doc, sections })
}
