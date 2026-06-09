import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
  Sparkles,
  Shield,
  Zap,
  Eye,
  ChevronRight,
  Crosshair,
  ArrowRight,
  Layers,
  Lock,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { type ComponentType } from "react";
import { Reveal } from "@/components/visual/Reveal";
import { StaggerGroup, StaggerChild } from "@/components/visual/StaggerGroup";
import { Counter } from "@/components/visual/Counter";
import { TrustedByBadge } from "@/components/visual/TrustedByBadge";
import { DetectorLogos } from "@/components/visual/DetectorLogos";
import { Testimonials } from "@/components/visual/Testimonials";
import { FAQAccordion } from "@/components/visual/FAQAccordion";
import { RippleButton } from "@/components/visual/RippleButton";
import { MagneticButton } from "@/components/visual/MagneticButton";
import { FloatCard } from "@/components/visual/FloatCard";
import { motion } from "framer-motion";

const REPO_URL = "https://github.com/yh12-10/authentigen";

// ── CDN-hosted brand imagery ──────────────────────────────────────────────────
const IMAGES = {
  heroBg:
    "https://d2xsxph8kpxj0f.cloudfront.net/310519663259820393/BFLz82b6GYCyJFpcFZXEzr/hero_bg-kcR6dzewB9D3GtidFycy7U.webp",
  heroWave6: "/hero_wave6.png",
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

// Reusable fade-in-up + viewport variants for image reveals
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleCTA = () => {
    if (isAuthenticated) navigate("/upload");
    else navigate("/signup");
  };

  const handleSignIn = () => navigate("/login");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
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
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#open-source"
              className="hover:text-foreground transition-colors"
            >
              Open Source
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

          {/* Hero main visual: the composed showcase image */}
          <FloatCard amplitude={6} className="w-full">
            <div className="relative rounded-2xl overflow-hidden border border-[#F5A623]/25 glow-gold shadow-2xl">
              <img
                src={IMAGES.heroWave6}
                alt="AuthentiGen — AI image humanizer: before, after, and processing results"
                loading="eager"
                fetchPriority="high"
                draggable={false}
                className="w-full h-auto select-none"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.06), transparent 40%)",
                }}
              />
            </div>
          </FloatCard>
        </div>
      </section>

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

      {/* ────────────────────── Features ─────────────────────────── */}
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

      {/* ───────────────── Dashboard Showcase ────────────────────── */}
      <section id="dashboard" className="py-24">
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

      {/* ─────────────────────── Open source ─────────────────────── */}
      <section id="open-source" className="relative py-24 overflow-hidden">
        {/* Full-bleed background image with uniform dark overlay */}
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
              "linear-gradient(to bottom, rgba(8,8,8,0.78) 0%, rgba(8,8,8,0.78) 100%)",
          }}
        />

        <div className="container relative z-10">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center">
              <Badge
                variant="outline"
                className="mb-4 border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/5 text-xs tracking-widest uppercase"
              >
                Open Source
              </Badge>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal mb-4">
                Free Forever.{" "}
                <span className="text-gold italic">Self-Hosted.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-10">
                AuthentiGen is open-source under the MIT license. No credits, no
                usage limits, no subscriptions — clone it, run it on your own
                server, and humanize as much as you want.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
                {[
                  {
                    icon: Lock,
                    title: "Your data, your server",
                    desc: "Files never leave the infrastructure you control.",
                  },
                  {
                    icon: Zap,
                    title: "No credits or limits",
                    desc: "Process unlimited images and video for free.",
                  },
                  {
                    icon: Github,
                    title: "Inspectable & extensible",
                    desc: "Read every line of the pipeline and make it yours.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="glass rounded-2xl p-5 gradient-border"
                  >
                    <Icon
                      className="w-6 h-6 text-[#F5A623] mb-3"
                      strokeWidth={1.5}
                    />
                    <div className="font-semibold mb-1">{title}</div>
                    <div className="text-sm text-muted-foreground">{desc}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <MagneticButton strength={14} radius={140}>
                  <RippleButton
                    size="lg"
                    onClick={() => window.open(REPO_URL, "_blank")}
                    className="h-14 px-8 text-base font-semibold glow-gold gradient-border-animated group"
                  >
                    <Github className="w-4 h-4 mr-2" /> Star on GitHub
                  </RippleButton>
                </MagneticButton>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-14 px-8 text-base text-muted-foreground hover:text-foreground"
                  onClick={handleCTA}
                >
                  Start Humanizing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────── Testimonials ──────────────────────── */}
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
              href="#open-source"
              className="text-muted-foreground hover:text-foreground"
            >
              Open Source
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
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
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
