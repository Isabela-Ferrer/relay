"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react"
import type { ValuationMemo } from "@/lib/agents/types"

export default function ValuationPage() {
  const router = useRouter()
  const [valuation, setValuation] = useState<ValuationMemo | null>(null)
  const [sellerData, setSellerData] = useState<{ companyName: string; industry: string; financials: { revenue: number; ebitda: number } } | null>(null)

  useEffect(() => {
    const v = sessionStorage.getItem("relay_valuation")
    const s = sessionStorage.getItem("relay_seller_data")
    if (!v || !s) { router.push("/seller"); return }
    setValuation(JSON.parse(v))
    setSellerData(JSON.parse(s))
  }, [router])

  if (!valuation || !sellerData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    )
  }

  const fmt = (n: number) => `$${(n / 1_000_000).toFixed(2)}M`
  const fmtK = (n: number) => n >= 1_000_000 ? fmt(n) : `$${n.toLocaleString()}`

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-lime flex items-center justify-center text-foreground font-bold text-sm">R</div>
            <span className="font-semibold text-foreground">Relay</span>
          </Link>
          <Badge variant="secondary" className="bg-lime/30 text-foreground border-lime/50 rounded-full">
            Valuation Complete
          </Badge>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Hero valuation card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1 font-medium">{sellerData.companyName} · {sellerData.industry}</div>
          <h1 className="text-2xl font-bold text-foreground mb-6">AI Valuation Report</h1>

          {/* Range bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Low</span>
              <span className="font-semibold text-foreground">Mid (Recommended)</span>
              <span>High</span>
            </div>
            <div className="relative h-10 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-lime/30 rounded-full"
                style={{ left: "0%", width: "100%" }}
              />
              <div
                className="absolute h-full bg-lime/70 rounded-full"
                style={{
                  left: `${((valuation.range.low / valuation.range.high) * 100)}%`,
                  right: "0%",
                }}
              />
              {/* Mid marker */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-foreground rounded-full"
                style={{ left: `${((valuation.range.mid - valuation.range.low) / (valuation.range.high - valuation.range.low)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-lg font-bold text-muted-foreground">{fmt(valuation.range.low)}</span>
              <span className="text-2xl font-bold text-foreground">{fmt(valuation.range.mid)}</span>
              <span className="text-lg font-bold text-muted-foreground">{fmt(valuation.range.high)}</span>
            </div>
          </div>

          <div className="p-4 bg-lime/20 rounded-xl border border-lime/30">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80">{valuation.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Valuation methods */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">Valuation Methods</h2>
          <div className="space-y-3">
            {valuation.methods.map(m => (
              <div key={m.method} className="flex items-center gap-4 p-3 bg-secondary rounded-xl">
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground capitalize">{m.method.replace(/_/g, " ")}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.assumptions[0]}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">{fmtK(m.value)}</div>
                  <div className="text-xs text-muted-foreground">{(m.weight * 100).toFixed(0)}% weight</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key drivers */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Value Drivers</h2>
            <ul className="space-y-2">
              {valuation.keyValueDrivers.slice(0, 4).map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/80">
                  <TrendingUp className="h-4 w-4 text-foreground flex-shrink-0 mt-0.5" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Risk Factors</h2>
            <ul className="space-y-2">
              {valuation.risks.slice(0, 4).map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-foreground/60 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{r}</span>
                </li>
              ))}
              {valuation.risks.length === 0 && (
                <li className="flex gap-2 text-sm text-foreground/80">
                  <CheckCircle className="h-4 w-4 text-foreground" />
                  No significant risk factors
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Mandate setup call-to-action */}
        <div className="bg-foreground text-background rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-2">Ready to set your mandate?</h2>
          <p className="text-background/60 text-sm mb-6 leading-relaxed">
            Your mandate defines your private negotiation floor: minimum acceptable price, earnout tolerance, and hard no&apos;s. The AI agent uses this to negotiate on your behalf — but buyers never see these parameters.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
            {[
              { label: "Min price (confidential)", value: fmtK(Math.round(valuation.range.mid * 0.85)) },
              { label: "Ask price (public)", value: fmtK(Math.round(valuation.range.mid * 1.05)) },
              { label: "Ideal structure", value: "Flexible" },
            ].map(item => (
              <div key={item.label} className="bg-background/10 rounded-xl p-3">
                <div className="text-background/50 text-xs mb-1">{item.label}</div>
                <div className="font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
          <Button
            onClick={() => router.push("/demo")}
            size="lg"
            className="bg-lime hover:bg-lime/90 text-foreground gap-2 rounded-full px-8"
          >
            Continue to Negotiation Demo <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-4">
          Valuation generated {new Date(valuation.analysisDate).toLocaleDateString()} · {valuation.analystNotes}
        </p>
      </div>
    </div>
  )
}
