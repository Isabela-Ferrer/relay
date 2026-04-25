import type { SellerOnboardingData } from "@/lib/agents/types"
import { buildValuationMemo } from "@/lib/valuation"

export async function POST(req: Request): Promise<Response> {
  let body: { sellerData: SellerOnboardingData; sessionId?: string }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { sellerData, sessionId } = body

  if (!sellerData?.financials) {
    return Response.json(
      { error: "sellerData with financials is required" },
      { status: 400 },
    )
  }

  try {
    const normalizedSellerData: SellerOnboardingData = {
      ...sellerData,
      companyName: sellerData.companyName?.trim() || "Untitled Business",
    }
    const memo = buildValuationMemo(normalizedSellerData, sessionId || crypto.randomUUID())
    return Response.json(memo)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Valuation calculation failed"
    return Response.json({ error: message }, { status: 500 })
  }
}
