import Link from "next/link"
import { ArrowRight, Shield, Zap, TrendingDown, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-zinc-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">R</div>
            <span className="font-semibold text-zinc-900">Relay</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/seller">
              <Button variant="ghost" size="sm" className="text-zinc-600">I&apos;m Selling</Button>
            </Link>
            <Link href="/buyer/qualify">
              <Button variant="ghost" size="sm" className="text-zinc-600">I&apos;m Buying</Button>
            </Link>
            <Link href="/demo">
              <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800">
                Run Demo
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200">
          AI Agents & Autonomy Track
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 mb-5 max-w-3xl mx-auto leading-tight">
          Business acquisitions made {" "}
          <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
            easy
          </span>
          {", "}1/3 the cost, 10x the speed
        </h1>
        <p className="text-xl text-zinc-500 mb-8 max-w-2xl mx-auto leading-relaxed">
          Relay deploys confidential AI agents for both buyer and seller. They negotiating LOI terms in real time while keeping each party&apos;s floor price, motivations, and risk concerns completely private.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/demo">
            <Button size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 h-12 text-base">
              Watch Live Demo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/seller">
            <Button size="lg" variant="outline" className="px-8 h-12 text-base border-zinc-200 text-zinc-700 hover:bg-zinc-50">
              Start as Seller
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-zinc-100 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-zinc-900 mb-1">8–10%</div>
            <div className="text-sm text-zinc-500">Traditional broker fee</div>
            <div className="text-xs text-red-500 mt-1 font-medium">↓ Industry average</div>
          </div>
          <div className="text-center relative">
            <div className="absolute inset-x-0 -top-6 flex justify-center">
              <TrendingDown className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="text-4xl font-bold text-emerald-600 mb-1">2–3%</div>
            <div className="text-sm text-zinc-500">Relay platform fee</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">↑ 70% savings</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-zinc-900 mb-1">4–5</div>
            <div className="text-sm text-zinc-500">Avg. rounds to LOI</div>
            <div className="text-xs text-blue-500 mt-1 font-medium">↓ vs. weeks of back-and-forth</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-zinc-900 mb-3">How it works</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">Three stages, two AI agents, one fair deal — without either side revealing their hand.</p>
        </div>
        <div className="grid grid-cols-3 gap-8">
          {[
            {
              step: "01",
              color: "emerald",
              title: "Seller onboards & gets valuation",
              desc: "Input financials to receive a data-driven SDE-based valuation. Set your mandate — floor price, earnout preferences, hard no's — all encrypted server-side.",
              cta: "Start as seller →",
              href: "/seller",
            },
            {
              step: "02",
              color: "blue",
              title: "Buyer is onboarded & signs NDA",
              desc: "Buyers identified by the seller submit acquisition criteria and are screened. Qualified buyers receive the CIM — a full confidential information memorandum.",
              cta: "Qualify as buyer →",
              href: "/buyer/qualify",
            },
            {
              step: "03",
              color: "violet",
              title: "Agents negotiate to LOI",
              desc: "Two AI agents — one for each side — run a structured negotiation loop. Neither agent can see the other's confidential parameters. Humans approve at key checkpoints.",
              cta: "See it live →",
              href: "/demo",
            },
          ].map(item => (
            <div key={item.step} className="bg-white border border-zinc-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className={`text-xs font-bold tracking-wider text-${item.color}-600 mb-3`}>{item.step}</div>
              <h3 className="font-semibold text-zinc-900 mb-2 text-lg">{item.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-4">{item.desc}</p>
              <Link href={item.href} className={`text-sm font-medium text-${item.color}-600 hover:text-${item.color}-700`}>
                {item.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Feature: Information Separation */}
      <section className="bg-zinc-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">The Moat</Badge>
              <h2 className="text-3xl font-bold mb-4">Information privacy, autonomy, and supervision</h2>
              <p className="text-zinc-400 leading-relaxed mb-6">
                Like traditional brokers, Relay&apos;s dual-agent architecture represent each party's incentives, they are your confidential AI advocate. They help to get your best agreement.
              </p>
              <ul className="space-y-3">
                {[
                  "Seller's floor price, buyer's max, and urgency are never revealed",
                  "Every step is fully transparent; numbers are justified and agent interactions are explainable",
                  "Human checkpoints for approval at key decisions",
                  "Handoff to partner lawyers and financial institutions to close the deal seamlessly",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-zinc-800 rounded-xl p-6 font-mono text-sm space-y-3">
              <div className="flex items-center gap-2 text-zinc-500 text-xs mb-4">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="ml-2">leak-detection.ts</span>
              </div>
              <div>
                <span className="text-violet-400">const</span>{" "}
                <span className="text-blue-300">sellerContext</span>{" "}
                <span className="text-zinc-400">= </span>
                <span className="text-emerald-300">encrypt</span>
                <span className="text-zinc-400">(mandate)</span>
              </div>
              <div className="text-zinc-500">// ↑ minPrice, urgency, weaknesses</div>
              <div className="mt-2">
                <span className="text-violet-400">const</span>{" "}
                <span className="text-blue-300">buyerContext</span>{" "}
                <span className="text-zinc-400">= </span>
                <span className="text-emerald-300">encrypt</span>
                <span className="text-zinc-400">(mandate)</span>
              </div>
              <div className="text-zinc-500">// ↑ maxPrice, alternatives, risks</div>
              <div className="mt-3 text-yellow-400">// Shared state = proposals only</div>
              <div>
                <span className="text-violet-400">const</span>{" "}
                <span className="text-blue-300">shared</span>{" "}
                <span className="text-zinc-400">= {"{"} proposals </span>
                <span className="text-zinc-400">{"}"}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-700 text-xs text-red-400">
                ⚠ Leak detected → re-prompt with warning
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "Privacy-first", desc: "Confidential parameters are server-side only. Never in the shared context." },
            { icon: Zap, title: "Real-time convergence", desc: "Watch buyer and seller prices converge round by round with live charts." },
            { icon: CheckCircle, title: "Human checkpoints", desc: "Agents can propose — only humans can accept. Full approval flow built in." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-zinc-700" />
              </div>
              <div>
                <div className="font-semibold text-zinc-900 mb-1">{title}</div>
                <div className="text-sm text-zinc-500 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-500 to-blue-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">See the negotiation in action</h2>
          <p className="text-emerald-50 mb-8 text-lg">
            Watch CloudTrack Pro — a $1.2M ARR SaaS company — reach a deal in under 5 rounds.
          </p>
          <Link href="/demo">
            <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100 px-10 h-12 text-base font-semibold">
              Run Demo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-500 to-blue-600" />
            <span>Relay — NYU EX Vercel Hackathon 2025</span>
          </div>
          <div className="flex gap-6">
            <Link href="/seller" className="hover:text-zinc-700">Sellers</Link>
            <Link href="/buyer/qualify" className="hover:text-zinc-700">Buyers</Link>
            <Link href="/demo" className="hover:text-zinc-700">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
