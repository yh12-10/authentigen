import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useState } from "react";
import {
<<<<<<< Updated upstream
  Sparkles,
  Shield,
  Zap,
  Eye,
  ChevronRight,
  Crosshair,
  Check,
  Star,
  ArrowRight,
  Layers,
  Lock,
  Github,
  Twitter,
  Linkedin,
=======
  Sparkles, Shield, Zap, Eye, Image, Video, ChevronRight,
  Check, Star, ArrowRight, Layers, Cpu, Lock, ChevronDown
>>>>>>> Stashed changes
} from "lucide-react";
import { type ComponentType } from "react";
import { Reveal } from "@/components/visual/Reveal";
import { StaggerGroup, StaggerChild } from "@/components/visual/StaggerGroup";
import { Counter } from "@/components/visual/Counter";
import { TrustedByBadge } from "@/components/visual/TrustedByBadge";
import { DetectorLogos } from "@/components/visual/DetectorLogos";
import { Testimonials } from "@/components/visual/Testimonials";
import { FAQAccordion } from "@/components/visual/FAQAccordion";
import { PricingCardFlip } from "@/components/visual/PricingCardFlip";
import { RippleButton } from "@/components/visual/RippleButton";
import { MagneticButton } from "@/components/visual/MagneticButton";
import { FloatCard } from "@/components/visual/FloatCard";
import { Hero3DShowcase } from "@/components/visual/Hero3DShowcase";
import { PRICING_BACK_BULLETS } from "@/components/visual/_data";
import { motion } from "framer-motion";

// ── CDN-hosted brand imagery ──────────────────────────────────────────────────
const IMAGES = {
  heroBg:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663259820393/BFLz82b6GYCyJFpcFZXEzr/hero_bg-kcR6dzewB9D3GtidFycy7U.webp",
  heroMain:
    "/storage/originals/1/hf_20260430_115238_af044ea3-5047-4709-972a-82a3ea5dcaa9.png",
  howItWorks:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663259820393/BFLz82b6GYCyJFpcFZXEzr/how_it_works-GzWpzzK3RGiWrDaZ3XnWxV.webp",
  featureShield:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663259820393/BFLz82b6GYCyJFpcFZXEzr/feature_shield-5aympYYyki6z5uCpsMWN94.webp",
  featureHumanizer:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663259820393/BFLz82b6GYCyJFpcFZXEzr/feature_humanizer-YLWtwRqsT5MUjd9mYKRp6K.webp",
  featureVideo:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663259820393/BFLz82b6GYCyJFpcFZXEzr/feature_video-42jBJtdPW8t5YqMdKdCyCf.webp",
  pricingBg:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663259820393/BFLz82b6GYCyJFpcFZXEzr/pricing_bg-bUPbt5GkjuDKtSMLB66HfJ.webp",
  dashboardPreview:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663259820393/BFLz82b6GYCyJFpcFZXEzr/dashboard_preview-UpA6PRuPsRJrDctDkypkhD.webp",
} as const;

type Feature = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  image?: string;
};

const FEATURES: Feature[] = [
  {
    icon: Shield,
    image: IMAGES.featureShield,
    title: "Camera-Realistic Output",
    desc: "A 13-step pixel-level pipeline reintroduces the sensor noise, lens optics, and compression artefacts of real photography — the camera-domain signals clean synthetic output is missing.",
  },
  {
    icon: Sparkles,
    image: IMAGES.featureHumanizer,
    title: "Image Humanizer",
    desc: "Sub-pixel barrel warp, edge-aware chromatic aberration, Gaussian sensor noise, lens vignette, film halation — applied with real cinematic intent.",
  },
  {
    icon: Sparkles,
    image: IMAGES.featureVideo,
    title: "Video Processing",
    desc: "Frame-sampled FFmpeg pipeline humanizes every frame, preserves audio, caps at 30 s, plays back from a real MP4 you can download.",
  },
  {
    icon: Layers,
    title: "Intensity Control",
    desc: "Three precision tiers — Light, Medium, and Heavy — give you full control over the transformation depth.",
  },
  {
    icon: Eye,
    title: "Before/After Viewer",
    desc: "Interactive side-by-side comparison slider lets you inspect every detail of the transformation.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    desc: "Self-hosted: files are stored under per-user keys on your own server, never sent to a third party or used for training. Delete anytime.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    credits: "10 credits",
    description: "Perfect for trying out the platform",
    features: [
      "10 free credits on signup",
      "Image humanization",
      "Light & Medium intensity",
      "Standard processing speed",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$14.99",
    period: "200 credits",
    credits: "200 credits",
    description: "For creators and marketers",
    features: [
      "200 credits",
      "Image & video humanization",
      "All intensity levels",
      "Priority processing",
      "Batch upload (10 files)",
    ],
    cta: "Buy Pro Pack",
    highlight: true,
  },
  {
    name: "Studio",
    price: "$29.99",
    period: "500 credits",
    credits: "500 credits",
    description: "For agencies and studios",
    features: [
      "500 credits",
      "Bulk processing",
      "All intensity levels",
      "Highest priority queue",
      "Concurrent video jobs",
      "Priority support",
    ],
    cta: "Buy Studio Pack",
    highlight: false,
  },
];

const STATS: {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}[] = [
  { value: 13, suffix: "", label: "Pixel-pipeline stages" },
  { value: 60, prefix: "<", suffix: "s", label: "Typical image time" },
  { value: 3, suffix: "", label: "Intensity levels" },
  { value: 100, suffix: "%", label: "Open-source & self-hosted" },
];

<<<<<<< Updated upstream
// Reusable fade-in-up + viewport variants for image reveals
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};
=======
const DETECTORS = ["GPTZero", "Originality.ai", "Hive Moderation", "Winston AI", "Copyleaks", "Turnitin", "ZeroGPT", "Sapling", "Writer", "Content at Scale", "Illuminarty", "AI or Not"];

const BEFORE_IMAGE = "/manus-storage/showcase_before_c38ddd90.jpg";
const AFTER_IMAGE = "/manus-storage/showcase_after_dd02d650.png";
>>>>>>> Stashed changes

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [previewTab, setPreviewTab] = useState<"image" | "video">("image");

  const handleCTA = () => {
    if (isAuthenticated) navigate("/upload");
    else navigate("/signup");
  };

  const handleSignIn = () => navigate("/login");

  return (
    <div className="min-h-screen bg-background text-foreground">
<<<<<<< Updated upstream
      {/* Navigation */}
=======
      {/* ── Navigation ─────────────────────────────────────────── */}
>>>>>>> Stashed changes
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center glow-gold-sm">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              AuthentiGen
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
<<<<<<< Updated upstream
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
=======
            <a href="#preview" className="hover:text-foreground transition-colors">Preview</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
>>>>>>> Stashed changes
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Welcome, {user?.name?.split(" ")[0]}
                </span>
                <Button
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="glow-gold-sm"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleSignIn}>
                  Sign In
                </Button>
                <RippleButton
                  size="sm"
                  onClick={handleCTA}
                  className="glow-gold-sm"
                >
                  Get Started
                </RippleButton>
              </>
            )}
          </div>
        </div>
      </nav>

<<<<<<< Updated upstream
      {/* ─────────────────────────── Hero ─────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden pt-24">
        {/* Full-bleed background image */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.heroBg})` }}
        />
        {/* Dark gradient overlay so text stays readable */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,8,8,0.30) 0%, rgba(8,8,8,0.85) 100%)",
          }}
        />
=======
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient pt-16">
        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full orb pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.82 0.12 85 / 0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full orb orb-delay pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.6 0.15 280 / 0.08) 0%, transparent 70%)" }} />
>>>>>>> Stashed changes

        <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)] py-12">
          <div className="page-enter text-center lg:text-left">
            <div className="mb-6 inline-block">
              <TrustedByBadge />
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-normal leading-[1.05] tracking-tight mb-6 text-balance">
              Make AI <span className="text-gold">Image</span>
              <span className="block">
                <span className="text-gold italic">|</span>{" "}
                <span className="text-gold italic">Camera-Real</span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Give AI-generated images and videos the grain, lens optics, and
              imperfections of real photography — through a deterministic,
              pixel-level pipeline that runs entirely on your own server.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <MagneticButton strength={14} radius={140}>
                <RippleButton
                  size="lg"
                  onClick={handleCTA}
                  className="h-14 px-8 text-base font-semibold glow-gold gradient-border-animated group"
                >
                  Start Humanizing
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </RippleButton>
              </MagneticButton>
              <Button
                variant="ghost"
                size="lg"
                className="h-14 px-8 text-base text-muted-foreground hover:text-foreground"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See How It Works
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

<<<<<<< Updated upstream
            {/* Trust pill row: 4 icon-label pairs */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6 max-w-xl mx-auto lg:mx-0">
              {[
                { icon: Shield, label: ["Advanced", "Humanization"] },
                { icon: Crosshair, label: ["Camera-Domain", "Realism"] },
                { icon: Zap, label: ["Lightning", "Fast"] },
                { icon: Lock, label: ["Privacy", "Focused"] },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label.join("-")}
                  className="flex flex-col items-center lg:items-start gap-2.5"
                >
                  <Icon className="w-6 h-6 text-[#F5A623]" strokeWidth={1.5} />
                  <div className="text-xs leading-tight text-muted-foreground text-center lg:text-left">
                    <div>{label[0]}</div>
                    <div>{label[1]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero main visual: 3D-tilted, floating, glow-haloed showcase */}
          <Hero3DShowcase
            src={IMAGES.heroMain}
            alt="AuthentiGen humanization in action"
          />
=======
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" onClick={handleCTA}
              className="h-14 px-8 text-base font-semibold glow-gold gradient-border group">
              Start Humanizing
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="ghost" size="lg" className="h-14 px-8 text-base text-muted-foreground hover:text-foreground"
              onClick={() => document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" })}>
              See It In Action
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

          {/* Scroll hint */}
          <div className="mt-16 flex justify-center animate-bounce opacity-40">
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </div>
>>>>>>> Stashed changes
        </div>
      </section>

<<<<<<< Updated upstream
      {/* ────────────────────────── Stats ──────────────────────────── */}
      <section className="relative -mt-16 pb-16">
        <div className="container">
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {STATS.map(stat => (
                <div
                  key={stat.label}
                  className="glass rounded-2xl p-5 text-center gradient-border"
                >
                  <div className="text-3xl font-serif text-gold mb-1">
                    <Counter
                      to={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      decimals={stat.decimals ?? 0}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────── Detector logos ──────────────────────── */}
      <section className="py-12">
        <div className="container max-w-6xl mx-auto">
          <Reveal>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Tested against leading AI-image detectors
            </p>
          </Reveal>
          <DetectorLogos />
        </div>
      </section>

      {/* ─────────────────── How It Works ────────────────────────── */}
=======
      {/* ── Humanization Preview ─────────────────────────────────── */}
      <section id="preview" className="py-28 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(ellipse, oklch(0.82 0.12 85) 0%, transparent 70%)" }} />
        </div>

        <div className="container relative z-10">
          {/* Section header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 text-xs tracking-widest uppercase">
              Live Demo
            </Badge>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
              Humanization{" "}
              <span className="text-gold italic">Preview</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              See the power of AuthentiGen — the same image, transformed from obviously AI-generated to authentically human.
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex justify-center mb-10">
            <div className="glass rounded-xl p-1 flex gap-1">
              <button
                onClick={() => setPreviewTab("image")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  previewTab === "image"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Image className="w-4 h-4" />
                Image
              </button>
              <button
                onClick={() => setPreviewTab("video")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  previewTab === "video"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Video className="w-4 h-4" />
                Video
              </button>
            </div>
          </div>

          {previewTab === "image" ? (
            <div className="max-w-5xl mx-auto">
              {/* Before / After side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Before */}
                <div className="group relative">
                  <div className="glass rounded-2xl overflow-hidden gradient-border">
                    {/* Label */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="flex items-center gap-1.5 bg-red-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        AI Generated
                      </span>
                    </div>
                    {/* Detection badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="glass text-red-400 text-xs font-medium px-3 py-1.5 rounded-full border border-red-500/30">
                        94% Detected
                      </span>
                    </div>
                    <img
                      src={BEFORE_IMAGE}
                      alt="AI Generated — Before humanization"
                      className="w-full aspect-[3/4] object-cover object-top"
                    />
                    {/* Bottom overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4"
                      style={{ background: "linear-gradient(to top, oklch(0.09 0.015 265 / 0.95), transparent)" }}>
                      <p className="text-xs text-muted-foreground">
                        Uncanny perfection, zero texture, sterile lighting — flagged instantly by detectors.
                      </p>
                    </div>
                  </div>
                  <p className="text-center text-sm font-medium text-muted-foreground mt-3">Before</p>
                </div>

                {/* After */}
                <div className="group relative">
                  <div className="glass rounded-2xl overflow-hidden" style={{ boxShadow: "0 0 40px oklch(0.82 0.12 85 / 0.15), inset 0 0 0 1px oklch(0.82 0.12 85 / 0.2)" }}>
                    {/* Label */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="flex items-center gap-1.5 bg-emerald-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        Humanized
                      </span>
                    </div>
                    {/* Detection badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="glass text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-500/30">
                        8% Detected
                      </span>
                    </div>
                    <img
                      src={AFTER_IMAGE}
                      alt="Humanized — After AuthentiGen processing"
                      className="w-full aspect-[3/4] object-cover object-top"
                    />
                    {/* Bottom overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4"
                      style={{ background: "linear-gradient(to top, oklch(0.09 0.015 265 / 0.95), transparent)" }}>
                      <p className="text-xs text-muted-foreground">
                        Natural film grain, warm tones, organic skin texture — passes every detector.
                      </p>
                    </div>
                  </div>
                  <p className="text-center text-sm font-medium text-gold mt-3">After — AuthentiGen Heavy</p>
                </div>
              </div>

              {/* Detection probability bar */}
              <div className="glass rounded-2xl p-6 max-w-2xl mx-auto gradient-border">
                <h3 className="text-sm font-semibold text-center mb-5 text-foreground">Detection Probability</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Before (AI Generated)</span>
                      <span className="text-red-400 font-semibold">94%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000" style={{ width: "94%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>After (Humanized)</span>
                      <span className="text-emerald-400 font-semibold">8%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000" style={{ width: "8%" }} />
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-5 flex items-center justify-center gap-1.5">
                  <Shield className="w-3 h-3 text-primary" />
                  Powered by a deterministic, pixel-level realism pipeline
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="glass rounded-2xl p-10 text-center gradient-border">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Video Humanization</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                  Upload your AI-generated video and we'll apply frame-by-frame humanization — grain, motion blur, color grading, and more.
                </p>
                <Button onClick={handleCTA} className="glow-gold-sm">
                  Try With Your Video
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Detectors Ticker ─────────────────────────────────────── */}
      <section className="py-10 border-y border-border overflow-hidden">
        <div className="container mb-4 text-center">
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Defeats all major AI detectors</p>
        </div>
        <div className="relative flex overflow-hidden">
          <div className="flex gap-8 animate-marquee whitespace-nowrap">
            {[...DETECTORS, ...DETECTORS].map((d, i) => (
              <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground px-4">
                <Check className="w-3 h-3 text-primary flex-shrink-0" />
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
>>>>>>> Stashed changes
      <section id="how-it-works" className="py-24">
        <div className="container">
          <Reveal>
            <div className="text-center mb-12">
              <Badge
                variant="outline"
                className="mb-4 border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/5 text-xs tracking-widest uppercase"
              >
                Process
              </Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
                Three Steps to{" "}
                <span className="text-gold italic">Authenticity</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                From upload to camera-real in minutes.
              </p>
            </div>
          </Reveal>

          {/* Pipeline visual */}
          <motion.div
            initial={fadeInUp.initial}
            whileInView={fadeInUp.whileInView}
            viewport={fadeInUp.viewport}
            transition={fadeInUp.transition}
            className="mb-16 mx-auto max-w-[900px]"
          >
            <img
              src={IMAGES.howItWorks}
              alt="AuthentiGen humanization pipeline"
              loading="lazy"
              className="w-full h-auto rounded-2xl"
              style={{
                boxShadow:
                  "0 0 40px rgba(245,166,35,0.15), 0 10px 40px rgba(0,0,0,0.4)",
              }}
            />
          </motion.div>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Upload Your File",
                desc: "Drop in your AI-generated image (JPG, PNG, WEBP) or video (MP4, WEBM). Files are encrypted on upload.",
              },
              {
                step: "02",
                title: "Choose Intensity",
                desc: "Select Light, Medium, or Heavy humanization. Our AI pipeline applies the right level of organic imperfection.",
              },
              {
                step: "03",
                title: "Download Result",
                desc: "Your humanized file is ready in seconds. Compare before/after, then download.",
              },
            ].map((item, i) => (
              <StaggerChild key={i}>
                <div className="glass rounded-2xl p-8 gradient-border group hover:glow-gold-sm transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="text-6xl font-bold text-gold opacity-20 mb-4 font-serif">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </StaggerChild>
            ))}
          </StaggerGroup>
        </div>
      </section>

<<<<<<< Updated upstream
      {/* ────────────────────── Features ─────────────────────────── */}
=======
      {/* ── Features ─────────────────────────────────────────────── */}
>>>>>>> Stashed changes
      <section id="features" className="py-24">
        <div className="container">
          <Reveal>
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/5 text-xs tracking-widest uppercase"
              >
                Features
              </Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
                Everything You Need to{" "}
                <span className="text-gold italic">Stay Undetected</span>
              </h2>
            </div>
          </Reveal>

          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <StaggerChild key={i}>
                  <FloatCard amplitude={5} className="h-full">
                    <motion.div
                      whileHover={{
                        rotateY: 4,
                        rotateX: -4,
                        translateY: -6,
                        scale: 1.01,
                      }}
                      style={{
                        transformStyle: "preserve-3d",
                        transformPerspective: 800,
                      }}
                      className="glass rounded-2xl group hover:glow-gold-sm transition-all duration-300 hover:border-[#F5A623]/30 h-full overflow-hidden flex flex-col"
                    >
                      {f.image ? (
                        <motion.div
                          initial={fadeInUp.initial}
                          whileInView={fadeInUp.whileInView}
                          viewport={fadeInUp.viewport}
                          transition={fadeInUp.transition}
                          className="relative overflow-hidden"
                        >
                          <img
                            src={f.image}
                            alt={f.title}
                            loading="lazy"
                            className="w-full h-48 object-cover rounded-t-2xl transition-transform duration-700 group-hover:scale-105"
                          />
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(20,20,20,0.85) 0%, rgba(20,20,20,0) 50%)",
                            }}
                          />
                        </motion.div>
                      ) : (
                        <div className="p-6 pb-0">
                          <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] group-hover:bg-[#F5A623]/20 transition-colors">
                            <Icon className="w-6 h-6" />
                          </div>
                        </div>
                      )}
                      <div className="p-6 flex-1">
                        <h3 className="font-semibold text-base mb-2">
                          {f.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    </motion.div>
                  </FloatCard>
                </StaggerChild>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

<<<<<<< Updated upstream
      {/* ───────────────── Dashboard Showcase ────────────────────── */}
      <section id="dashboard" className="py-24">
=======
      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-24">
>>>>>>> Stashed changes
        <div className="container">
          <Reveal>
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <Badge
                variant="outline"
                className="mb-4 border-[#4F8EF7]/30 text-[#4F8EF7] bg-[#4F8EF7]/5 text-xs tracking-widest uppercase"
              >
                Your Command Center
              </Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
                Everything You Need,{" "}
                <span className="text-gold italic">In One Place</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Track every job, manage your credits, and download humanized
                files — all from your sleek dashboard.
              </p>
            </div>
          </Reveal>

          <motion.div
            initial={fadeInUp.initial}
            whileInView={fadeInUp.whileInView}
            viewport={fadeInUp.viewport}
            transition={fadeInUp.transition}
            className="dashboard-tilt mx-auto w-full max-w-[900px] cursor-default"
          >
            <img
              src={IMAGES.dashboardPreview}
              alt="AuthentiGen dashboard"
              loading="lazy"
              className="w-full h-auto rounded-2xl"
            />
          </motion.div>
        </div>
      </section>

<<<<<<< Updated upstream
      {/* ─────────────────────── Pricing ─────────────────────────── */}
      <section id="pricing" className="relative py-24 overflow-hidden">
        {/* Full-bleed background image with uniform 70% dark overlay */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.pricingBg})` }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.7) 100%)",
          }}
        />

        <div className="container relative z-10">
          <Reveal>
            <div className="text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/5 text-xs tracking-widest uppercase"
              >
                Pricing
              </Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
                Simple, <span className="text-gold italic">Transparent</span>{" "}
                Pricing
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Start free. Pay only when you need more credits.
              </p>
            </div>
          </Reveal>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING.map((plan, i) => {
              const front = (
                <div
                  className={`rounded-2xl p-8 flex flex-col h-full relative ${plan.highlight ? "gradient-border-animated glow-gold" : "glass gradient-border"}`}
                  style={{
                    background: plan.highlight
                      ? "rgba(20,20,20,0.92)"
                      : undefined,
                  }}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#F5A623] text-black px-4 py-1 text-xs font-semibold">
                        <Star className="w-3 h-3 mr-1" /> Most Popular
                      </Badge>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-4xl font-serif">{plan.price}</span>
                      <span className="text-muted-foreground text-sm mb-1">
                        {plan.period === "forever"
                          ? `/${plan.period}`
                          : ` · ${plan.period}`}
                      </span>
                    </div>
                    <div className="text-[#F5A623] text-sm font-medium">
                      {plan.credits}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feat, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-[#F5A623] flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={plan.highlight ? "glow-gold-sm" : ""}
                    variant={plan.highlight ? "default" : "outline"}
                    onClick={handleCTA}
                  >
                    {plan.cta}
                  </Button>
                </div>
              );

              const back = (
                <div className="rounded-2xl p-8 flex flex-col h-full glass gradient-border-animated">
                  <h3 className="font-serif text-2xl text-gold mb-3">
                    {plan.name} — what's inside
                  </h3>
                  <ul className="space-y-2 flex-1">
                    {(PRICING_BACK_BULLETS[plan.name] ?? []).map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-[#F5A623] flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground italic mt-4">
                    "Pricing is honest, the queue is fast, and the result is the
                    result."
                  </p>
                </div>
              );

              return (
                <StaggerChild key={i}>
                  <PricingCardFlip
                    front={front}
                    back={back}
                    popular={plan.highlight}
                  />
                </StaggerChild>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* ───────────────────── Testimonials ──────────────────────── */}
=======
      {/* ── CTA Banner ───────────────────────────────────────────── */}
>>>>>>> Stashed changes
      <section className="py-24">
        <div className="container">
          <Reveal>
            <div className="text-center mb-12">
              <Badge
                variant="outline"
                className="mb-4 border-[#4F8EF7]/30 text-[#4F8EF7] bg-[#4F8EF7]/5 text-xs tracking-widest uppercase"
              >
                Testimonials
              </Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
                Loved by <span className="text-gold italic">creators</span>
              </h2>
            </div>
          </Reveal>
          <Testimonials />
        </div>
      </section>

<<<<<<< Updated upstream
      {/* ─────────────────────── FAQ ─────────────────────────────── */}
      <section id="faq" className="py-24">
        <div className="container max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <Badge
                variant="outline"
                className="mb-4 border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/5 text-xs tracking-widest uppercase"
              >
                FAQ
              </Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
                Questions, <span className="text-gold italic">answered</span>
              </h2>
=======
      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
>>>>>>> Stashed changes
            </div>
          </Reveal>
          <Reveal>
            <FAQAccordion />
          </Reveal>
        </div>
      </section>

      {/* ───────────────────── CTA Banner ────────────────────────── */}
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
                  Ready to Make Your Content{" "}
                  <span className="text-gold italic">Camera-Real?</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                  Add the grain, optics, and imperfections of real photography
                  to your AI-generated images and video.
                </p>
                <MagneticButton strength={12} radius={150}>
                  <RippleButton
                    size="lg"
                    onClick={handleCTA}
                    className="h-14 px-10 text-base font-semibold glow-gold"
                  >
                    Start Free — 10 Credits Included
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </RippleButton>
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────── Footer ─────────────────────────── */}
      <footer className="border-t border-border/40 py-10 relative">
        <div
          className="absolute inset-x-0 -top-px h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(245,166,35,0.5), transparent)",
          }}
        />
        <div className="container grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-[#F5A623] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-base font-semibold">AuthentiGen</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              Premium AI humanization for images and videos. Camera-realistic,
              private, and self-hosted.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground"
            >
              Pricing
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground"
            >
              How It Works
            </a>
            <a
              href="#faq"
              className="text-muted-foreground hover:text-foreground"
            >
              FAQ
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              Terms
            </a>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Twitter"
                className="size-9 rounded-full glass flex items-center justify-center hover:text-[#F5A623]"
              >
                <Twitter className="size-4" />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="size-9 rounded-full glass flex items-center justify-center hover:text-[#F5A623]"
              >
                <Github className="size-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="size-9 rounded-full glass flex items-center justify-center hover:text-[#F5A623]"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AuthentiGen. All rights reserved.
            </p>
          </div>
        </div>
        <div className="container mt-8">
          <p className="text-[11px] leading-relaxed text-muted-foreground/70 max-w-3xl">
            AuthentiGen adds authentic photographic characteristics to digital
            media. Please use it responsibly and lawfully — it is not intended
            for fraud, academic dishonesty, disinformation, or misrepresenting
            synthetic media as authentic where authenticity matters.
            Detector-evasion outcomes are not guaranteed.
          </p>
        </div>
      </footer>
    </div>
  );
}
