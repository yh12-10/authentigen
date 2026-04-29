import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  Sparkles, Shield, Zap, Eye, Image, Video, ChevronRight,
  Check, Star, ArrowRight, Layers, Cpu, Lock, Github, Twitter, Linkedin,
} from "lucide-react";
import { Reveal } from "@/components/visual/Reveal";
import { StaggerGroup, StaggerChild } from "@/components/visual/StaggerGroup";
import { Counter } from "@/components/visual/Counter";
import { Typewriter } from "@/components/visual/Typewriter";
import { HeroVisual } from "@/components/visual/HeroVisual";
import { TrustedByBadge } from "@/components/visual/TrustedByBadge";
import { DetectorLogos } from "@/components/visual/DetectorLogos";
import { Testimonials } from "@/components/visual/Testimonials";
import { FAQAccordion } from "@/components/visual/FAQAccordion";
import { PricingCardFlip } from "@/components/visual/PricingCardFlip";
import { RippleButton } from "@/components/visual/RippleButton";
import { PRICING_BACK_BULLETS } from "@/components/visual/_data";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: Image, title: "Image Humanization", desc: "Inject organic noise, color grading, textural imperfections, and lighting variations that defeat every major AI detector." },
  { icon: Video, title: "Video Humanization", desc: "Real frame-sampled processing applies natural motion blur, grain, and micro-imperfections frame by frame." },
  { icon: Layers, title: "Intensity Control", desc: "Three precision tiers — Light, Medium, and Heavy — give you full control over the transformation depth." },
  { icon: Eye, title: "Before/After Viewer", desc: "Interactive side-by-side comparison slider lets you inspect every detail of the transformation." },
  { icon: Cpu, title: "Real-Time Processing", desc: "Live progress tracking with estimated completion time so you always know exactly where your job stands." },
  { icon: Lock, title: "Secure & Private", desc: "Files are stored in per-user S3 buckets via signed URLs. Never used for training. Delete anytime." },
];

const PRICING = [
  { name: "Free", price: "$0", period: "forever", credits: "10 credits", description: "Perfect for trying out the platform", features: ["10 free credits on signup", "Image humanization", "Light & Medium intensity", "Standard processing speed"], cta: "Get Started Free", highlight: false },
  { name: "Pro", price: "$14.99", period: "200 credits", credits: "200 credits", description: "For creators and marketers", features: ["200 credits", "Image & video humanization", "All intensity levels", "Priority processing", "Batch upload (10 files)"], cta: "Buy Pro Pack", highlight: true },
  { name: "Studio", price: "$29.99", period: "500 credits", credits: "500 credits", description: "For agencies and studios", features: ["500 credits", "Bulk processing", "All intensity levels", "Highest priority queue", "Concurrent video jobs", "Priority support"], cta: "Buy Studio Pack", highlight: false },
];

const STATS = [
  { value: 99.7, suffix: "%", label: "Detection bypass rate", decimals: 1 },
  { value: 60, prefix: "<", suffix: "s", label: "Average processing time" },
  { value: 12, suffix: "+", label: "AI detectors defeated" },
  { value: 50, suffix: "K+", label: "Files humanized" },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleCTA = () => {
    if (isAuthenticated) navigate("/upload");
    else window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center glow-gold-sm">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-lg tracking-tight">AuthentiGen</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
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
                <RippleButton size="sm" onClick={handleCTA} className="glow-gold-sm">
                  Get Started
                </RippleButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden hero-gradient pt-24">
        <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)] py-12">
          <div className="page-enter text-center lg:text-left">
            <div className="mb-6 inline-block">
              <TrustedByBadge />
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-normal leading-[1.05] tracking-tight mb-6 text-balance">
              Make AI{" "}
              <span className="block sm:inline">
                <Typewriter words={["Images", "Videos", "Art", "Photography"]} />
              </span>{" "}
              <span className="text-gold italic block sm:inline">Undetectable</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Transform AI-generated images and videos into authentically human-made content. Defeat every major AI detector with our precision humanization pipeline.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <RippleButton size="lg" onClick={handleCTA} className="h-14 px-8 text-base font-semibold glow-gold gradient-border-animated group">
                Start Humanizing
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </RippleButton>
              <Button variant="ghost" size="lg" className="h-14 px-8 text-base text-muted-foreground hover:text-foreground"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                See How It Works
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          <div className="relative h-[400px] lg:h-[600px]">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-16 pb-16">
        <div className="container">
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {STATS.map((stat) => (
                <div key={stat.label} className="glass rounded-2xl p-5 text-center gradient-border">
                  <div className="text-3xl font-serif text-gold mb-1">
                    <Counter to={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Detector logos */}
      <section className="py-12">
        <div className="container max-w-6xl mx-auto">
          <Reveal>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Defeats every major AI detector
            </p>
          </Reveal>
          <DetectorLogos />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container">
          <Reveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/5 text-xs tracking-widest uppercase">Process</Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
                Three Steps to <span className="text-gold italic">Authenticity</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">From upload to undetectable in minutes.</p>
            </div>
          </Reveal>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: "01", icon: Image, title: "Upload Your File", desc: "Drop in your AI-generated image (JPG, PNG, WEBP) or video (MP4, WEBM). Files are encrypted on upload." },
              { step: "02", icon: Layers, title: "Choose Intensity", desc: "Select Light, Medium, or Heavy humanization. Our AI pipeline applies the right level of organic imperfection." },
              { step: "03", icon: Zap, title: "Download Result", desc: "Your humanized file is ready in seconds. Compare before/after, then download." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <StaggerChild key={i}>
                  <div className="glass rounded-2xl p-8 gradient-border group hover:glow-gold-sm transition-all duration-300 hover:-translate-y-1">
                    <div className="text-6xl font-bold text-gold opacity-20 mb-4 font-serif">{item.step}</div>
                    <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] mb-4 group-hover:bg-[#F5A623]/20 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </StaggerChild>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container">
          <Reveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/5 text-xs tracking-widest uppercase">Features</Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
                Everything You Need to <span className="text-gold italic">Stay Undetected</span>
              </h2>
            </div>
          </Reveal>

          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <StaggerChild key={i}>
                  <motion.div
                    whileHover={{ rotateY: 4, rotateX: -4, translateY: -4 }}
                    style={{ transformStyle: "preserve-3d", transformPerspective: 800 }}
                    className="glass rounded-2xl p-6 group hover:glow-gold-sm transition-all duration-300 hover:border-[#F5A623]/30 h-full"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] mb-4 group-hover:bg-[#F5A623]/20 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                </StaggerChild>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container">
          <Reveal>
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/5 text-xs tracking-widest uppercase">Pricing</Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
                Simple, <span className="text-gold italic">Transparent</span> Pricing
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">Start free. Pay only when you need more credits.</p>
            </div>
          </Reveal>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map((plan, i) => {
              const front = (
                <div className={`rounded-2xl p-8 flex flex-col h-full relative ${plan.highlight ? "gradient-border-animated glow-gold" : "glass gradient-border"}`}
                  style={{ background: plan.highlight ? "rgba(20,20,20,0.92)" : undefined }}>
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#F5A623] text-black px-4 py-1 text-xs font-semibold">
                        <Star className="w-3 h-3 mr-1" /> Most Popular
                      </Badge>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-4xl font-serif">{plan.price}</span>
                      <span className="text-muted-foreground text-sm mb-1">{plan.period === "forever" ? `/${plan.period}` : ` · ${plan.period}`}</span>
                    </div>
                    <div className="text-[#F5A623] text-sm font-medium">{plan.credits}</div>
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-[#F5A623] flex-shrink-0" />
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
              );

              const back = (
                <div className="rounded-2xl p-8 flex flex-col h-full glass gradient-border-animated">
                  <h3 className="font-serif text-2xl text-gold mb-3">{plan.name} — what's inside</h3>
                  <ul className="space-y-2 flex-1">
                    {(PRICING_BACK_BULLETS[plan.name] ?? []).map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-[#F5A623] flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground italic mt-4">
                    "Pricing is honest, the queue is fast, and the result is the result."
                  </p>
                </div>
              );

              return (
                <StaggerChild key={i}>
                  <PricingCardFlip front={front} back={back} popular={plan.highlight} />
                </StaggerChild>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container">
          <Reveal>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-[#4F8EF7]/30 text-[#4F8EF7] bg-[#4F8EF7]/5 text-xs tracking-widest uppercase">Testimonials</Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
                Loved by <span className="text-gold italic">creators</span>
              </h2>
            </div>
          </Reveal>
          <Testimonials />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="container max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/5 text-xs tracking-widest uppercase">FAQ</Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
                Questions, <span className="text-gold italic">answered</span>
              </h2>
            </div>
          </Reveal>
          <Reveal>
            <FAQAccordion />
          </Reveal>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24">
        <div className="container">
          <Reveal>
            <div className="glass rounded-3xl p-12 text-center gradient-border-animated max-w-3xl mx-auto relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(245,166,35,0.18), rgba(79,142,247,0.12), rgba(245,166,35,0.18))",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 6s ease-in-out infinite",
                }}
              />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] mx-auto mb-6 glow-gold-sm">
                  <Shield className="w-8 h-8" />
                </div>
                <h2 className="font-serif text-4xl font-normal mb-4">
                  Ready to Make Your Content <span className="text-gold italic">Undetectable?</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                  Join thousands of creators who trust AuthentiGen to keep their AI-generated content authentic.
                </p>
                <RippleButton size="lg" onClick={handleCTA} className="h-14 px-10 text-base font-semibold glow-gold">
                  Start Free — 10 Credits Included
                  <ArrowRight className="w-4 h-4 ml-2" />
                </RippleButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 relative">
        <div className="absolute inset-x-0 -top-px h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,166,35,0.5), transparent)" }} />
        <div className="container grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-[#F5A623] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-base font-semibold">AuthentiGen</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              Premium AI humanization for images and videos. Undetectable, private, and beautifully crafted.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground">How It Works</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Terms</a>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex gap-3">
              <a href="#" aria-label="Twitter" className="size-9 rounded-full glass flex items-center justify-center hover:text-[#F5A623]"><Twitter className="size-4" /></a>
              <a href="#" aria-label="GitHub" className="size-9 rounded-full glass flex items-center justify-center hover:text-[#F5A623]"><Github className="size-4" /></a>
              <a href="#" aria-label="LinkedIn" className="size-9 rounded-full glass flex items-center justify-center hover:text-[#F5A623]"><Linkedin className="size-4" /></a>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AuthentiGen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
