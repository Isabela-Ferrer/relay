"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, FileText, CheckCircle, Loader2, Shield } from "lucide-react"

export default function NDAPage() {
  const router = useRouter()
  const [ndaContent, setNdaContent] = useState("")
  const [signed, setSigned] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sigName, setSigName] = useState("")
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    const profile = JSON.parse(sessionStorage.getItem("relay_buyer_profile") || "{}")
    fetch("/api/generate-nda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerName: profile.organizationName || "Prospective Buyer",
        sellerCompany: "CloudTrack Pro",
        sessionId: sessionStorage.getItem("relay_session_id") || crypto.randomUUID(),
      }),
    })
      .then(r => r.json())
      .then(d => setNdaContent(d.content || ""))
      .finally(() => setLoading(false))
  }, [])

  const handleSign = () => {
    if (!sigName || !agreed) return
    const profile = JSON.parse(sessionStorage.getItem("relay_buyer_profile") || "{}")
    profile.ndasigned = true
    sessionStorage.setItem("relay_buyer_profile", JSON.stringify(profile))
    setSigned(true)
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="bg-white border border-zinc-200 rounded-xl p-10 max-w-sm w-full text-center">
          <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-900 mb-2">NDA Signed</h2>
          <p className="text-sm text-zinc-500 mb-6">You now have access to the Confidential Information Memorandum (CIM) for CloudTrack Pro.</p>
          <Button onClick={() => router.push("/buyer/cim")} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full">
            View CIM <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">R</div>
            <span className="font-semibold text-zinc-900 text-sm">Relay</span>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Non-Disclosure Agreement</Badge>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 mb-1">Mutual Non-Disclosure Agreement</h1>
            <p className="text-sm text-zinc-500">Read and sign this NDA to receive access to the CloudTrack Pro CIM and proceed to negotiation.</p>
          </div>
        </div>

        {/* NDA document */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden mb-6">
          <div className="border-b border-zinc-100 px-6 py-3 flex items-center gap-2 bg-zinc-50">
            <Shield className="h-4 w-4 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-600">Confidential — NDA Document</span>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            ) : (
              <pre className="text-xs text-zinc-700 font-mono whitespace-pre-wrap leading-relaxed">{ndaContent}</pre>
            )}
          </div>
        </div>

        {/* Signature section */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-zinc-900">Electronic Signature</h2>
          <div>
            <Label className="text-xs font-semibold text-zinc-700 mb-1.5 block">Full Legal Name *</Label>
            <Input
              value={sigName}
              onChange={e => setSigName(e.target.value)}
              placeholder="Type your full name to sign"
            />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-blue-600"
            />
            <span className="text-sm text-zinc-600">
              I have read and agree to the terms of this Mutual Non-Disclosure Agreement. I understand this creates a legal obligation to maintain confidentiality.
            </span>
          </label>
          <Button
            onClick={handleSign}
            disabled={!sigName || !agreed || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            Sign & Access CIM <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-xs text-zinc-400 text-center">
            This electronic signature has the same legal effect as a handwritten signature.
          </p>
        </div>
      </div>
    </div>
  )
}
