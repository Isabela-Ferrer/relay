"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react"
import type { SellerOnboardingData } from "@/lib/agents/types"

const STEPS = ["Business Basics", "Financials", "Sale Preferences"]

const INDUSTRIES = [
  "B2B SaaS", "SaaS", "E-Commerce", "Professional Services",
  "Healthcare", "Manufacturing", "Retail", "Hospitality", "Construction", "Other",
]

const BUSINESS_TYPES = [
  "LLC", "S-Corp", "C-Corp", "Partnership", "Sole Proprietor", "Other",
]

const parseCurrency = (v: string) => Number(v.replace(/[^0-9.]/g, "")) || 0

export default function SellerOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    companyName: "CloudTrack Pro",
    industry: "B2B SaaS",
    businessType: "S-Corp",
    description: "B2B SaaS fleet management and logistics optimization platform serving mid-market transportation and delivery companies.",
    foundedYear: String(new Date().getFullYear() - 5),
    headquarters: "",
    employeeCount: "10",
    customerCount: "142",
    contactName: "Sarah Chen",
    contactEmail: "sarah@cloudtrackpro.com",
    revenueY1: "650000", revenueY2: "900000", revenueY3: "1200000",
    expensesY1: "390000", expensesY2: "540000", expensesY3: "720000",
    netIncomeY1: "260000", netIncomeY2: "360000", netIncomeY3: "480000",
    ownerSalary: "150000",
    addBacks: "15600",
    topCustomerRevenuePercent: "14",
    recurringRevenuePercent: "88",
    reasonForSale: "Founder retirement after 5 years — seeking liquidity for next venture.",
    targetPrice: "",
    minimumPrice: "",
    transitionWillingness: "3",
    sellerNoteTolerance: "20",
    earnoutWillingness: "conditional",
    dealStructurePreference: "flexible",
    timeline: "6_months",
  })

  const set = (k: string, v: string | null | undefined) => setForm(f => ({ ...f, [k]: v ?? "" }))

  const buildPayload = (): SellerOnboardingData => ({
    companyName: form.companyName,
    industry: form.industry,
    businessType: form.businessType,
    description: form.description,
    foundedYear: Number(form.foundedYear),
    headquarters: form.headquarters,
    employeeCount: Number(form.employeeCount),
    customerCount: Number(form.customerCount),
    financials: {
      revenueY1: parseCurrency(form.revenueY1),
      revenueY2: parseCurrency(form.revenueY2),
      revenueY3: parseCurrency(form.revenueY3),
      expensesY1: parseCurrency(form.expensesY1),
      expensesY2: parseCurrency(form.expensesY2),
      expensesY3: parseCurrency(form.expensesY3),
      netIncomeY1: parseCurrency(form.netIncomeY1),
      netIncomeY2: parseCurrency(form.netIncomeY2),
      netIncomeY3: parseCurrency(form.netIncomeY3),
      ownerSalary: parseCurrency(form.ownerSalary),
      addBacks: parseCurrency(form.addBacks),
      fiscalYearEnd: "December",
    },
    topCustomerRevenuePercent: Number(form.topCustomerRevenuePercent) || 0,
    recurringRevenuePercent: Number(form.recurringRevenuePercent) || 0,
    reasonForSale: form.reasonForSale,
    targetPrice: form.targetPrice ? parseCurrency(form.targetPrice) : null,
    minimumPrice: form.minimumPrice ? parseCurrency(form.minimumPrice) : null,
    transitionWillingness: Number(form.transitionWillingness),
    sellerNoteTolerance: Number(form.sellerNoteTolerance),
    earnoutWillingness: form.earnoutWillingness as SellerOnboardingData["earnoutWillingness"],
    dealStructurePreference: form.dealStructurePreference as SellerOnboardingData["dealStructurePreference"],
    timeline: form.timeline as SellerOnboardingData["timeline"],
    exclusions: [],
    confidentialityLevel: "high",
    contactName: form.contactName,
    contactEmail: form.contactEmail,
  })

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      setLoading(true)
      try {
        const payload = buildPayload()
        const sessionId = crypto.randomUUID()
        const res = await fetch("/api/valuation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sellerData: payload, sessionId }),
        })
        const memo = await res.json()
        if (!res.ok) throw new Error(memo?.error || "Valuation API error")
        sessionStorage.setItem("relay_seller_data", JSON.stringify(payload))
        sessionStorage.setItem("relay_valuation", JSON.stringify(memo))
        sessionStorage.setItem("relay_session_id", sessionId)
        router.push("/seller/valuation")
      } catch {
        alert("Failed to calculate valuation. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const currentYear = new Date().getFullYear()
  const yearLabels = [
    `${currentYear - 3} (Y1)`,
    `${currentYear - 2} (Y2)`,
    `${currentYear - 1} (Y3, most recent)`,
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-lime flex items-center justify-center text-foreground font-bold text-sm">R</div>
            <span className="font-semibold text-foreground">Relay</span>
          </div>
          <Badge variant="secondary" className="bg-lime/30 text-foreground border-lime/50 rounded-full">
            Seller Onboarding
          </Badge>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-sm font-medium ${i === step ? "text-foreground" : i < step ? "text-foreground" : "text-muted-foreground"}`}>
                {i < step ? (
                  <CheckCircle className="h-4 w-4 text-foreground" />
                ) : (
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${i === step ? "border-foreground text-foreground bg-lime" : "border-border text-muted-foreground"}`}>
                    {i + 1}
                  </div>
                )}
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? "bg-foreground" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <h1 className="text-xl font-bold text-foreground mb-1">{STEPS[step]}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {step === 0 && "Tell us about your business so buyers can understand what you've built."}
            {step === 1 && "Your financial data drives the AI valuation. We protect this with your confidentiality settings."}
            {step === 2 && "Set your sale preferences. These become your agent's mandate — fully confidential."}
          </p>

          {/* Step 0: Business Basics */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Company Name *</Label>
                  <Input value={form.companyName} onChange={e => set("companyName", e.target.value)} placeholder="CloudTrack Pro" className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Industry *</Label>
                  <Select value={form.industry} onValueChange={v => set("industry", v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Business Type *</Label>
                  <Select value={form.businessType} onValueChange={v => set("businessType", v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Legal entity" /></SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Customer Count</Label>
                  <Input type="number" value={form.customerCount} onChange={e => set("customerCount", e.target.value)} placeholder="250" className="rounded-xl" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-foreground mb-1.5 block">Business Description *</Label>
                <Textarea
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Describe your business, product/service, and customer base..."
                  className="h-24 resize-none rounded-xl"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Founded Year</Label>
                  <Input type="number" value={form.foundedYear} onChange={e => set("foundedYear", e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Headquarters</Label>
                  <Input value={form.headquarters} onChange={e => set("headquarters", e.target.value)} placeholder="Austin, TX" className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Employees</Label>
                  <Input type="number" value={form.employeeCount} onChange={e => set("employeeCount", e.target.value)} className="rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Contact Name</Label>
                  <Input value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="Sarah Chen" className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Contact Email</Label>
                  <Input type="email" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="sarah@company.com" className="rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Financials */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="p-3 bg-lime/30 rounded-xl text-xs text-foreground border border-lime/50">
                Your financial data is encrypted and only used to generate your valuation and agent mandate. It is never shared with buyers directly.
              </div>

              {/* 3-year financial table */}
              <div>
                <div className="grid grid-cols-4 gap-3 mb-2">
                  <div />
                  {yearLabels.map(y => (
                    <div key={y} className="text-xs font-semibold text-muted-foreground text-center">{y}</div>
                  ))}
                </div>
                {[
                  { label: "Revenue *", keys: ["revenueY1", "revenueY2", "revenueY3"] as const, placeholder: "1,200,000" },
                  { label: "Expenses *", keys: ["expensesY1", "expensesY2", "expensesY3"] as const, placeholder: "720,000" },
                  { label: "Net Income *", keys: ["netIncomeY1", "netIncomeY2", "netIncomeY3"] as const, placeholder: "480,000" },
                ].map(row => (
                  <div key={row.label} className="grid grid-cols-4 gap-3 mb-3 items-center">
                    <div className="text-xs font-semibold text-foreground">{row.label}</div>
                    {row.keys.map(k => (
                      <Input
                        key={k}
                        value={form[k]}
                        onChange={e => set(k, e.target.value)}
                        placeholder={row.placeholder}
                        className="rounded-xl text-sm"
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Owner&apos;s Salary *</Label>
                  <Input value={form.ownerSalary} onChange={e => set("ownerSalary", e.target.value)} placeholder="150,000" className="rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Add-Backs</Label>
                  <Input value={form.addBacks} onChange={e => set("addBacks", e.target.value)} placeholder="15,600" className="rounded-xl" />
                  <p className="text-xs text-muted-foreground mt-1">One-time or non-recurring expenses added back to earnings</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Top Customer Revenue %</Label>
                  <Input type="number" value={form.topCustomerRevenuePercent} onChange={e => set("topCustomerRevenuePercent", e.target.value)} placeholder="15" className="rounded-xl" />
                  <p className="text-xs text-muted-foreground mt-1">% of total revenue from your largest customer</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Recurring Revenue %</Label>
                  <Input type="number" value={form.recurringRevenuePercent} onChange={e => set("recurringRevenuePercent", e.target.value)} placeholder="80" className="rounded-xl" />
                  <p className="text-xs text-muted-foreground mt-1">% of revenue that is subscription or contract-based</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Sale Preferences */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-semibold text-foreground mb-1.5 block">Reason for Sale *</Label>
                <Textarea
                  value={form.reasonForSale}
                  onChange={e => set("reasonForSale", e.target.value)}
                  placeholder="Founder retirement, seeking liquidity for next venture..."
                  className="h-20 resize-none rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Target Price</Label>
                  <Input value={form.targetPrice} onChange={e => set("targetPrice", e.target.value)} placeholder="3,600,000" className="rounded-xl" />
                  <p className="text-xs text-muted-foreground mt-1">Your ideal exit value</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Minimum Price</Label>
                  <Input value={form.minimumPrice} onChange={e => set("minimumPrice", e.target.value)} placeholder="2,800,000" className="rounded-xl" />
                  <p className="text-xs text-muted-foreground mt-1">Confidential walk-away floor</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Transition Willingness (months)</Label>
                  <Select value={form.transitionWillingness} onValueChange={v => set("transitionWillingness", v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 month</SelectItem>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Seller Note Tolerance (%)</Label>
                  <Input type="number" value={form.sellerNoteTolerance} onChange={e => set("sellerNoteTolerance", e.target.value)} placeholder="20" className="rounded-xl" />
                  <p className="text-xs text-muted-foreground mt-1">Max % of deal you&apos;d finance as seller note</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Earnout Willingness</Label>
                  <Select value={form.earnoutWillingness} onValueChange={v => set("earnoutWillingness", v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="willing">Willing</SelectItem>
                      <SelectItem value="conditional">Conditional (metric-dependent)</SelectItem>
                      <SelectItem value="unwilling">Unwilling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-foreground mb-1.5 block">Deal Structure Preference</Label>
                  <Select value={form.dealStructurePreference} onValueChange={v => set("dealStructurePreference", v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Flexible</SelectItem>
                      <SelectItem value="asset_sale">Asset Sale</SelectItem>
                      <SelectItem value="stock_sale">Stock Sale</SelectItem>
                      <SelectItem value="merger">Merger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-foreground mb-1.5 block">Target Timeline</Label>
                <Select value={form.timeline} onValueChange={v => set("timeline", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (&lt; 30 days)</SelectItem>
                    <SelectItem value="3_months">3 months</SelectItem>
                    <SelectItem value="6_months">6 months</SelectItem>
                    <SelectItem value="12_months_plus">12+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => step === 0 ? router.push("/") : setStep(s => s - 1)}
            className="gap-2 rounded-full border-border text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? "Back to Home" : "Previous"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading}
            className="gap-2 bg-foreground hover:bg-foreground/90 text-background rounded-full"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Calculating valuation...</>
            ) : step === STEPS.length - 1 ? (
              <>Get My Valuation <ArrowRight className="h-4 w-4" /></>
            ) : (
              <>Continue <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
