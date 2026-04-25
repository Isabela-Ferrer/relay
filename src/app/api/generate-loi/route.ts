import type { LOIProposal } from "@/lib/agents/types"
import { generateLOI } from "@/lib/templates/documents"

export async function POST(req: Request): Promise<Response> {
  let body: { proposal?: LOIProposal; sellerCompany?: string; buyerName?: string }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.proposal) {
    return Response.json({ error: "proposal is required" }, { status: 400 })
  }

  const sellerCompany = body.sellerCompany || "Seller"
  const buyerName = body.buyerName || "Buyer"

  const loiText = generateLOI(body.proposal, sellerCompany, buyerName)

  return Response.json({
    type: "LOI",
    sessionId: body.proposal.sessionId,
    generatedAt: new Date().toISOString(),
    content: loiText,
    terms: body.proposal,
  })
}
