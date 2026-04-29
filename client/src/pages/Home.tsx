import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  Sparkles, Shield, Zap, Eye, Image, Video, ChevronRight,
  Check, Star, ArrowRight, Layers, Cpu, Lock
} from "lucide-react";

const FEATURES = [
  {
    icon: <Image className="w-6 h-6" />,
    title: "Image Humanization",
    desc: "Inject organic noise, color grading, textural imperfections, and lighting variations that defeat every major AI detector.",
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: "Video Humanization",
    desc: "Frame-by-frame processing applies natural motion blur, grain, and micro-imperfections for authentic cinematic feel.",
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Intensity Control",
    desc: "Three precision tiers — Light, Medium, and Heavy — give you full control over the transformation depth.",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Before/After Viewer",
    desc: "Interactive side-by-side comparison slider lets you inspect every detail of the transformation.",
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "Real-Time Processing",
    desc: "Live progress tracking with estimated completion time so you always know exactly where your job stands.",
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Secure & Private",
    desc: "Your files are encrypted in transit and at rest. Processed files are available for download and then purged.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    credits: "10 credits",
    description: "Perfect for trying out the platform",
    features: ["10 free credits on signup", "Image humanization", "Light & Medium intensity", "Standard processing speed", "7-day file retention"],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    credits: "200 credits/mo",
    description: "For creators and marketers",
    features: ["200 credits per month", "Image & video humanization", "All intensity levels", "Priority processing", "30-day file retention", "API access"],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Studio",
    price: "$79",
    period: "per month",
    credits: "1,000 credits/mo",
    description: "For agencies and studios",
    features: ["1,000 credits per month", "Bulk processing", "All intensity levels", "Dedicated processing queue", "90-day file retention", "Full API access", "Priority support"],
    cta: "Start Studio",
    highlight: false,
  },
];

const STATS = [
  { value: "99.7%", label: "Detection bypass rate" },
  { value: "< 60s", label: "Average processing time" },
  { value: "12+", label: "AI detectors defeated" },
  { value: "50K+", label: "Files humanized" },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/upload");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navigation───────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-gold-sm">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">AuthentiGen</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Welcome, {user?.name?.split(" ")[0]}
                </span>
                <Button size="sm" onClick={() => navigate("/dashboard")} className="glow-gold-sm">
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = getLoginUrl()}>
                  Sign In
                </Button>
                <Button size="sm" onClick={handleCTA} className="glow-gold-sm">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient pt-16">
        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full orb pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.82 0.12 85 / 0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full orb orb-delay pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.6 0.15 280 / 0.08) 0%, transparent 70%)" }} />

        <div className="container relative z-10 text-center page-enter">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 px-4 py-1.5 text-xs font-medium tracking-widest uppercase">
            <Sparkles className="w-3 h-3 mr-1.5" />
            AI Humanization Platform
          </Badge>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-normal leading-[1.05] tracking-tight mb-6">
            Make AI Content{" "}
            <span className="text-gold italic">Undetectable</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform AI-generated images and videos into authentically human-made content.
            Defeat every major AI detector with our precision humanization pipeline.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" onClick={handleCTA}
              className="h-14 px-8 text-base font-semibold glow-gold gradient-border group">
              Start Humanizing
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="ghost" size="lg" className="h-14 px-8 text-base text-muted-foreground hover:text-foreground"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
              See How It Works
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-gold mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, oklch(0.09 0.015 265))" }} />
      </section>

      {/* ── How It Works ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 text-xs tracking-widest uppercase">
              Process
            </Badge>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
              Three Steps to{" "}
              <span className="text-gold italic">Authenticity</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From upload to undetectable in under a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: "01", icon: <Image className="w-6 h-6" />, title: "Upload Your File", desc: "Drop in your AI-generated image (JPG, PNG, WEBP) or video (MP4, WEBM). Files are encrypted immediately on upload." },
              { step: "02", icon: <Layers className="w-6 h-6" />, title: "Choose Intensity", desc: "Select Light, Medium, or Heavy humanization. Our AI pipeline applies the appropriate level of organic imperfections." },
              { step: "03", icon: <Zap className="w-6 h-6" />, title: "Download Result", desc: "Your humanized file is ready in seconds. Compare before/after with our interactive slider, then download." },
            ].map((item, i) => (
              <div key={i} className="glass rounded-2xl p-8 gradient-border group hover:glow-gold-sm transition-all duration-300">
                <div className="text-6xl font-bold text-gold opacity-20 mb-4 font-serif">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 text-xs tracking-widest uppercase">
              Features
            </Badge>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
              Everything You Need to{" "}
              <span className="text-gold italic">Stay Undetected</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="glass rounded-2xl p-6 group hover:glow-gold-sm transition-all duration-300 hover:border-primary/30">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 text-xs tracking-widest uppercase">
              Pricing
            </Badge>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
              Simple,{" "}
              <span className="text-gold italic">Transparent</span>{" "}
              Pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 flex flex-col relative ${plan.highlight ? "gradient-border glow-gold" : "glass"}`}
                style={plan.highlight ? { background: "oklch(0.13 0.02 265 / 0.9)" } : {}}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold">
                      <Star className="w-3 h-3 mr-1" /> Most Popular
                    </Badge>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground text-sm mb-1">/{plan.period}</span>
                  </div>
                  <div className="text-primary text-sm font-medium">{plan.credits}</div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button
                  className={plan.highlight ? "glow-gold-sm" : ""}
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={handleCTA}>
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container">
          <div className="glass rounded-3xl p-12 text-center gradient-border max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 glow-gold-sm">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-4xl font-normal mb-4">
              Ready to Make Your Content{" "}
              <span className="text-gold italic">Undetectable?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              Join thousands of creators who trust AuthentiGen to keep their AI-generated content authentic.
            </p>
            <Button size="lg" onClick={handleCTA} className="h-14 px-10 text-base font-semibold glow-gold">
              Start Free — 10 Credits Included
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">AuthentiGen</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} AuthentiGen. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
