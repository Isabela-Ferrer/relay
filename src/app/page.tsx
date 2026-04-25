import Link from "next/link"
import { ArrowRight, TrendingDown, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChaosToOrder } from "@/components/chaos-to-order"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-lime flex items-center justify-center text-foreground font-bold text-sm">R</div>
            <span className="font-semibold text-foreground">Relay</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/seller">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">I&apos;m Selling</Button>
            </Link>
            <Link href="/buyer/qualify">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">I&apos;m Buying</Button>
            </Link>
            <Link href="/demo">
              <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-5">
                Run Demo
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <Badge variant="secondary" className="mb-6 bg-lime/20 text-foreground border-lime/30 rounded-full px-4 py-1">
          AI Agents & Autonomy Track
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-2 max-w-3xl mx-auto leading-tight">
          Business acquisitions,<br />but{" "}
          <span className="bg-lime px-2 rounded-lg">
            easy
          </span>.
        </h1>
        <p className="text-2xl font-semibold text-foreground/70 mb-6">
          1/3 the cost, 10x the speed
        </p>
        
        {/* Chaos to Order illustration */}
        <div className="w-full max-w-4xl mx-auto mb-10">
          <ChaosToOrder className="w-full h-auto text-foreground/70" />
        </div>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Relay deploys confidential AI agents for both buyer and seller. They negotiate LOI terms in real time while keeping each party&apos;s floor price, motivations, and risk concerns completely private.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/demo">
            <Button size="lg" className="bg-foreground hover:bg-foreground/90 text-background px-8 h-12 text-base rounded-full">
              Watch Live Demo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/seller">
            <Button size="lg" variant="outline" className="px-8 h-12 text-base border-border text-foreground hover:bg-secondary rounded-full">
              Start as Seller
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-lime/30 bg-lime/10">
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-1">8–10%</div>
            <div className="text-sm text-muted-foreground">Traditional broker fee</div>
            <div className="text-xs text-muted-foreground mt-2 font-medium">Industry average</div>
          </div>
          <div className="text-center relative">
            <div className="absolute inset-x-0 -top-6 flex justify-center">
              <TrendingDown className="h-5 w-5 text-foreground" />
            </div>
            <div className="text-4xl font-bold text-foreground mb-1">2–3%</div>
            <div className="text-sm text-muted-foreground">Relay platform fee</div>
            <div className="inline-block text-xs bg-lime text-foreground mt-2 font-medium px-2 py-0.5 rounded-full">70% savings</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-1">4–5</div>
            <div className="text-sm text-muted-foreground">Avg. rounds to LOI</div>
            <div className="text-xs text-muted-foreground mt-2 font-medium">vs. weeks of back-and-forth</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">How it works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Three stages, two AI agents, one fair deal — without either side revealing their hand.</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Seller onboards & gets valuation",
              desc: "Input financials to receive a data-driven SDE-based valuation. Set your mandate — floor price, earnout preferences, hard no's — all encrypted server-side.",
              cta: "Start as seller",
              href: "/seller",
            },
            {
              step: "02",
              title: "Buyer is onboarded & signs NDA",
              desc: "Buyers identified by the seller submit acquisition criteria and are screened. Qualified buyers receive the CIM — a full confidential information memorandum.",
              cta: "Qualify as buyer",
              href: "/buyer/qualify",
            },
            {
              step: "03",
              title: "Agents negotiate to LOI",
              desc: "Two AI agents — one for each side — run a structured negotiation loop. Neither agent can see the other's confidential parameters. Humans approve at key checkpoints.",
              cta: "See it live",
              href: "/demo",
            },
          ].map(item => (
            <div key={item.step} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="inline-block text-xs font-bold tracking-wider bg-lime text-foreground px-2 py-1 rounded-full mb-4">{item.step}</div>
              <h3 className="font-semibold text-foreground mb-2 text-lg">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{item.desc}</p>
              <Link href={item.href} className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors">
                {item.cta} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Deal Timeline */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">The deal journey</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">From preparation to closing — see where Relay transforms the traditional M&A process.</p>
        </div>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
          
          <div className="space-y-8">
            {/* Stage 1 */}
            <div className="relative pl-20">
              <div className="absolute left-5 w-6 h-6 rounded-full bg-secondary border-2 border-border flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">1</span>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">Seller Preparation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The seller gathers financials, story, and intent. No Relay involvement. Quiet setup before the engine starts.
                </p>
              </div>
            </div>

            {/* Stage 2 - Highlighted */}
            <div className="relative pl-20">
              <div className="absolute left-5 w-6 h-6 rounded-full bg-lime border-2 border-lime flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">2</span>
              </div>
              <div className="bg-lime/10 border border-lime/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-foreground">Valuation</h3>
                  <span className="text-xs font-medium bg-lime text-foreground px-2 py-0.5 rounded-full">Relay transforms this</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The first shift. The fog lifts.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/60 rounded-xl p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Before</div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      A number pulled from loose comparisons and broker instinct. Confidence is fragile. Logic is hidden.
                    </p>
                  </div>
                  <div className="bg-lime/20 rounded-xl p-4">
                    <div className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">After</div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      A structured valuation range grounded in real earnings (SDE). Clear reasoning. Risks surfaced early. The seller now has a position they can defend, not just suggest.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="relative pl-20">
              <div className="absolute left-5 w-6 h-6 rounded-full bg-secondary border-2 border-border flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">3</span>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">Listing & Discovery</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The business enters the market. Buyers begin circling. Still traditional. Still noisy.
                </p>
              </div>
            </div>

            {/* Stage 4 - Highlighted */}
            <div className="relative pl-20">
              <div className="absolute left-5 w-6 h-6 rounded-full bg-lime border-2 border-lime flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">4</span>
              </div>
              <div className="bg-lime/10 border border-lime/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-foreground">Buyer Qualification & NDA</h3>
                  <span className="text-xs font-medium bg-lime text-foreground px-2 py-0.5 rounded-full">Relay transforms this</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The filter snaps into place.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/60 rounded-xl p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Before</div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Curious but unqualified buyers flood in. Time leaks. Sensitive info drifts too early.
                    </p>
                  </div>
                  <div className="bg-lime/20 rounded-xl p-4">
                    <div className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">After</div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Only serious buyers pass through. Capital is confirmed. Intent is clear. Information flows after trust is established, not before.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 5 - Highlighted */}
            <div className="relative pl-20">
              <div className="absolute left-5 w-6 h-6 rounded-full bg-lime border-2 border-lime flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">5</span>
              </div>
              <div className="bg-lime/10 border border-lime/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-foreground">LOI Negotiation</h3>
                  <span className="text-xs font-medium bg-lime text-foreground px-2 py-0.5 rounded-full">Relay transforms this</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The core engine. Where chaos becomes choreography.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/60 rounded-xl p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Before</div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Fragmented emails. Slow back-and-forth. Negotiation shaped by personality, not structure. Deadlocks with no clear path forward.
                    </p>
                  </div>
                  <div className="bg-lime/20 rounded-xl p-4">
                    <div className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">After</div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Structured, agent-driven negotiation. Each side operates within defined boundaries. Every move is reasoned. Every gap is visible. When stuck, solutions are proposed, not avoided.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 6 */}
            <div className="relative pl-20">
              <div className="absolute left-5 w-6 h-6 rounded-full bg-secondary border-2 border-border flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">6</span>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">Due Diligence</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Lawyers and accountants step in. Verification, scrutiny, reality check. Relay steps back. Humans take the wheel.
                </p>
              </div>
            </div>

            {/* Stage 7 */}
            <div className="relative pl-20">
              <div className="absolute left-5 w-6 h-6 rounded-full bg-secondary border-2 border-border flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">7</span>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-2">Closing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Final agreements signed. Ownership transfers. The deal crystallizes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Information Separation */}
      <section className="bg-sky">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-5 bg-lime text-foreground border-lime rounded-full">The Moat</Badge>
              <h2 className="text-3xl font-bold mb-5 text-foreground">Information privacy, autonomy, and supervision</h2>
              <p className="text-foreground/70 leading-relaxed mb-8">
                Like traditional brokers, Relay&apos;s dual-agent architecture represent each party&apos;s incentives, they are your confidential AI advocate. They help to get your best agreement.
              </p>
              <ul className="space-y-4">
                {[
                  "Seller's floor price, buyer's max, and urgency are never revealed",
                  "Every step is fully transparent; numbers are justified and agent interactions are explainable",
                  "Human checkpoints for approval at key decisions",
                  "Handoff to partner lawyers and financial institutions to close the deal seamlessly",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                    <CheckCircle className="h-4 w-4 text-foreground flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-2xl p-6 font-mono text-sm space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-4">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <span className="ml-2">leak-detection.ts</span>
              </div>
              <div>
                <span className="text-amber-500 font-medium">const</span>{" "}
                <span className="text-foreground">sellerContext</span>{" "}
                <span className="text-muted-foreground">= </span>
                <span className="text-amber-500">encrypt</span>
                <span className="text-muted-foreground">(mandate)</span>
              </div>
              <div className="text-muted-foreground">// minPrice, urgency, weaknesses</div>
              <div className="mt-2">
                <span className="text-amber-500 font-medium">const</span>{" "}
                <span className="text-foreground">buyerContext</span>{" "}
                <span className="text-muted-foreground">= </span>
                <span className="text-amber-500">encrypt</span>
                <span className="text-muted-foreground">(mandate)</span>
              </div>
              <div className="text-muted-foreground">// maxPrice, alternatives, risks</div>
              <div className="mt-3 text-amber-500 font-medium">// Shared state = proposals only</div>
              <div>
                <span className="text-amber-500 font-medium">const</span>{" "}
                <span className="text-foreground">shared</span>{" "}
                <span className="text-muted-foreground">= {"{"} proposals </span>
                <span className="text-muted-foreground">{"}"}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-border text-xs text-amber-500">
                Leak detected → re-prompt with warning
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">See the negotiation in action</h2>
          <p className="text-foreground/70 mb-10 text-lg">
            Watch CloudTrack Pro — a $1.2M ARR SaaS company — reach a deal in under 5 rounds.
          </p>
          <Link href="/demo">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 px-10 h-12 text-base font-semibold rounded-full">
              Run Demo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-lime" />
            <span>Relay — NYU EX Vercel Hackathon 2025</span>
          </div>
          <div className="flex gap-8">
            <Link href="/seller" className="hover:text-foreground transition-colors">Sellers</Link>
            <Link href="/buyer/qualify" className="hover:text-foreground transition-colors">Buyers</Link>
            <Link href="/demo" className="hover:text-foreground transition-colors">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
