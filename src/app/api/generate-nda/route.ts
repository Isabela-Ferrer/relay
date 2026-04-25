import { generateNDA } from "@/lib/templates/documents"
import type { GeneratedDocument } from "@/types"

export async function POST(req: Request): Promise<Response> {
  let body: { buyerName?: string; sellerCompany?: string; sessionId?: string }

  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const buyerName = body.buyerName || "Prospective Buyer"
  const sellerCompany = body.sellerCompany || "Seller"
  const sessionId = body.sessionId || crypto.randomUUID()

  const doc: GeneratedDocument = {
    type: "NDA",
    sessionId,
    generatedAt: new Date().toISOString(),
    content: generateNDA(buyerName, sellerCompany),
  }

  return Response.json(doc)
}
