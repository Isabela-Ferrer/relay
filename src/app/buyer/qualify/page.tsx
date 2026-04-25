"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, XCircle } from "lucide-react"

const parseCurrency = (v: string) => Number(v.replace(/[^0-9.]/g, "")) || 0

export default function BuyerQualifyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ passed: boolean; score: number; reason: string } | null>(null)

  const [form, setForm] = useState({
    organizationName: "",
    buyerType: "individual",
    operationalBackground: "",
    targetIndustries: "B2B SaaS, Logistics Tech",
    geographicFocus: "United States",
    availableCapital: "",
    sbaPrequalified: "no",
    sbaPrequalAmount: "",
    maxPrice: "",
    timelineToClose: "6",
    preferredStructure: "flexible",
    earnoutAppetite: "moderate",
    dueDiligenceTimeNeeded: "60",
    exclusivityPeriod: "90",
    contactName: "",
    contactEmail: "",
  })

  const set = (k: string, v: string | null | undefined) => setForm(f => ({ ...f, [k]: v ?? "" }))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const availableCapital = parseCurrency(form.availableCapital)
      const askingPrice = 3_780_000 // CloudTrack Pro demo
      const capitalRatio = availableCapital / askingPrice
      const passed = capitalRatio >= 0.3

      const profile = {
        id: crypto.randomUUID(),
        organizationName: form.organizationName,
        buyerType: form.buyerType,
        operationalBackground: form.operationalBackground,
        targetIndustries: form.targetIndustries.split(",").map(s => s.trim()),
        geographicFocus: form.geographicFocus.split(",").map(s => s.trim()),
        availableCapital,
        sbaPrequalified: form.sbaPrequalified === "yes",
        sbaPrequalAmount: form.sbaPrequalAmount ? parseCurrency(form.sbaPrequalAmount) : null,
        maxPrice: form.maxPrice ? parseCurrency(form.maxPrice) : null,
        preferredStructure: form.preferredStructure,
        earnoutAppetite: form.earnoutAppetite,
        timelineToClose: Number(form.timelineToClose),
        dueDiligenceTimeNeeded: Number(form.dueDiligenceTimeNeeded),
        exclusivityPeriod: Number(form.exclusivityPeriod),
        qualificationStatus: passed ? "qualified" : "disqualified",
        ndasigned: false,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
      }

      sessionStorage.setItem("relay_buyer_profile", JSON.stringify(profile))
      setResult({
        passed,
        score: passed ? 78 : 42,
        reason: passed
          ? "Financial capacity verified. Target industry aligns with available deal. Strategic fit confirmed."
          : "Available capital may be insufficient relative to the asking price (minimum 30% required per SBA guidelines). Consider increasing your stated acquisition budget.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
          {result.passed ? (
            <CheckCircle className="h-14 w-14 text-foreground mx-auto mb-4" />
          ) : (
            <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
          )}
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {result.passed ? "You're Qualified!" : "Not Qualified"}
          </h2>
          <div className={`text-4xl font-bold mb-2 ${result.passed ? "text-foreground" : "text-red-500"}`}>
            {result.score}/100
          </div>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{result.reason}</p>
          {result.passed ? (
            <Button
              onClick={() => router.push("/buyer/nda")}
              className="bg-foreground hover:bg-foreground/90 text-background gap-2 w-full rounded-full"
            >
              Proceed to NDA <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setResult(null)} className="w-full rounded-full border-border">
              Update Information
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-lime flex items-center justify-center text-foreground font-bold text-sm">R</div>
            <span className="font-semibold text-foreground">Relay</span>
          </div>
          <Badge className="bg-sky/50 text-foreground border-sky rounded-full">Buyer Qualification</Badge>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Buyer Qualification</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Tell us about your acquisition profile. Qualified buyers receive the full CIM after NDA execution.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-5 shadow-sm">
          {/* Identity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Organization / Name *</Label>
              <Input value={form.organizationName} onChange={e => set("organizationName", e.target.value)} placeholder="Apex Growth Partners" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Buyer Type *</Label>
              <Select value={form.buyerType} onValueChange={v => set("buyerType", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual / Searcher</SelectItem>
                  <SelectItem value="pe">Private Equity</SelectItem>
                  <SelectItem value="strategic">Strategic Acquirer</SelectItem>
                  <SelectItem value="family_office">Family Office</SelectItem>
                  <SelectItem value="financial">Financial Buyer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-foreground mb-1.5 block">Operational Background *</Label>
            <Textarea
              value={form.operationalBackground}
              onChange={e => set("operationalBackground", e.target.value)}
              placeholder="Describe your relevant industry experience, past acquisitions, or operating background..."
              className="h-20 resize-none rounded-xl"
            />
          </div>

          {/* Criteria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Industries of Interest</Label>
              <Input value={form.targetIndustries} onChange={e => set("targetIndustries", e.target.value)} placeholder="B2B SaaS, Healthcare" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Geography</Label>
              <Input value={form.geographicFocus} onChange={e => set("geographicFocus", e.target.value)} placeholder="United States" className="rounded-xl" />
            </div>
          </div>

          {/* Capital */}
          <div className="p-3 bg-sky/20 rounded-xl text-xs text-foreground border border-sky/40">
            SBA guidelines require available capital of at least 30% of the asking price. Self-reported for this demo; production integrates Plaid verification.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Available Capital * ($)</Label>
              <Input value={form.availableCapital} onChange={e => set("availableCapital", e.target.value)} placeholder="1,200,000" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">SBA Pre-qualified?</Label>
              <Select value={form.sbaPrequalified} onValueChange={v => set("sbaPrequalified", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.sbaPrequalified === "yes" && (
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">SBA Pre-qual Amount ($)</Label>
              <Input value={form.sbaPrequalAmount} onChange={e => set("sbaPrequalAmount", e.target.value)} placeholder="2,000,000" className="rounded-xl" />
            </div>
          )}

          {/* Deal terms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Max Price ($)</Label>
              <Input value={form.maxPrice} onChange={e => set("maxPrice", e.target.value)} placeholder="3,200,000" className="rounded-xl" />
              <p className="text-xs text-muted-foreground mt-1">Confidential — used only by your agent</p>
            </div>
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Preferred Structure</Label>
              <Select value={form.preferredStructure} onValueChange={v => set("preferredStructure", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible</SelectItem>
                  <SelectItem value="asset_sale">Asset Sale</SelectItem>
                  <SelectItem value="stock_sale">Stock Sale</SelectItem>
                  <SelectItem value="cash_only">All Cash</SelectItem>
                  <SelectItem value="sba_7a">SBA 7(a) Financed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Earnout Appetite</Label>
              <Select value={form.earnoutAppetite} onValueChange={v => set("earnoutAppetite", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None — all cash at close</SelectItem>
                  <SelectItem value="low">Low (up to 10%)</SelectItem>
                  <SelectItem value="moderate">Moderate (10–25%)</SelectItem>
                  <SelectItem value="high">High (25%+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Timeline to Close (months)</Label>
              <Select value={form.timelineToClose} onValueChange={v => set("timelineToClose", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 months</SelectItem>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">4–6 months</SelectItem>
                  <SelectItem value="12">6–12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Due Diligence Period (days)</Label>
              <Select value={form.dueDiligenceTimeNeeded} onValueChange={v => set("dueDiligenceTimeNeeded", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="45">45 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="75">75 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Exclusivity Period (days)</Label>
              <Select value={form.exclusivityPeriod} onValueChange={v => set("exclusivityPeriod", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="120">120 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Contact Name</Label>
              <Input value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="James Park" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Contact Email</Label>
              <Input type="email" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="james@apexgrowth.com" className="rounded-xl" />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => router.push("/")} className="gap-2 rounded-full border-border text-foreground hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !form.organizationName || !form.availableCapital}
            className="gap-2 bg-foreground hover:bg-foreground/90 text-background rounded-full"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking...</> : <>Submit for Review <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </div>
    </div>
  )
}
