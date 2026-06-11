import { useState, useRef, useCallback, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  ArrowLeft,
  X,
  FileImage,
  Zap,
  Layers,
  Shield,
  ChevronDown,
  ChevronRight,
  CloudUpload,
  Files,
  History,
  Settings,
  ArrowDown,
  Info,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { RippleButton } from "@/components/visual/RippleButton";
import { MagneticButton } from "@/components/visual/MagneticButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@shared/const";

// ── Types ─────────────────────────────────────────────────────────────────────

type Intensity = "light" | "medium" | "heavy";

const ACCEPTED_IMAGE = ["image/jpeg", "image/png", "image/webp"];

const INTENSITY_OPTIONS: {
  value: Intensity;
  label: string;
  desc: string;
}[] = [
  {
    value: "light",
    label: "Light",
    desc: "Subtle, minimal adjustments. Nearly identical to original.",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Balanced humanization with organic imperfections.",
  },
  {
    value: "heavy",
    label: "Heavy",
    desc: "Maximum transformation. Unmistakably human-made.",
  },
];

// Honest per-intensity effect profile — what the pixel pipeline actually does
// at each level (sourced from the real humanizer profiles). No invented metrics.
const INTENSITY_EFFECTS: Record<
  Intensity,
  { grain: string; color: string; lens: string }
> = {
  light: {
    grain: "Fine film grain",
    color: "Whisper of warmth",
    lens: "Faint vignette — near-identical to source",
  },
  medium: {
    grain: "Visible film grain",
    color: "Gentle warmth + halation",
    lens: "Soft vignette — organic camera feel",
  },
  heavy: {
    grain: "Strong film grain",
    color: "Warm 35 mm bloom",
    lens: "Pronounced vignette — filmic",
  },
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function initials(
  name: string | null | undefined,
  email: string | null | undefined
): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }
  return (email?.[0] ?? "?").toUpperCase();
}

// ── Top nav ───────────────────────────────────────────────────────────────────

function TopNav() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong h-16 border-b border-border/40">
      <div className="h-full px-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 group"
        >
          <div className="size-8 rounded-lg bg-[#F5A623] flex items-center justify-center glow-gold-sm transition-transform group-hover:scale-105">
            <Sparkles className="size-4 text-black" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            AuthentiGen
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a
            href="/#features"
            className="hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            className="hover:text-foreground transition-colors"
          >
            How It Works
          </a>
          <a href="/#faq" className="hover:text-foreground transition-colors">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-secondary/40 transition-colors">
                <div className="size-8 rounded-full bg-gradient-to-br from-[#F5A623] to-[#4F8EF7] flex items-center justify-center text-xs font-semibold text-black">
                  {initials(user?.name, user?.email)}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.name?.split(" ")[0] ??
                    user?.email?.split("@")[0] ??
                    "Guest"}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong w-56">
              <DropdownMenuLabel>
                {user?.email ?? "Signed in"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="mr-2 size-4" /> Dashboard
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <ShieldCheck className="mr-2 size-4" /> Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-destructive"
              >
                <LogOut className="mr-2 size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative outline-none focus-visible:ring-1 focus-visible:ring-[#F5A623]/40",
        active
          ? "bg-[#F5A623]/[0.08] text-[#F5A623] border border-[#F5A623]/25"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-2 bottom-2 w-1 bg-[#F5A623] rounded-r-full"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="size-5 flex items-center justify-center">{icon}</span>
      {label}
    </motion.button>
  );
}

function Sidebar() {
  const [, navigate] = useLocation();
  return (
    <aside className="fixed top-16 bottom-0 left-0 w-64 hidden lg:flex flex-col glass border-r border-border/40 z-40">
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-2 px-3 py-2.5 mb-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Home
        </button>

        <SidebarItem
          icon={<CloudUpload className="size-4" />}
          label="Upload Content"
          active
        />
        <SidebarItem
          icon={<History className="size-4" />}
          label="History"
          onClick={() => navigate("/dashboard")}
        />
        <SidebarItem
          icon={<Files className="size-4" />}
          label="Batch Process"
          onClick={() => navigate("/batch")}
        />
        <SidebarItem
          icon={<Settings className="size-4" />}
          label="Settings"
          onClick={() => navigate("/dashboard")}
        />
      </div>
    </aside>
  );
}

// ── Drop zone ─────────────────────────────────────────────────────────────────

interface DropZoneProps {
  file: File | null;
  isDragOver: boolean;
  setIsDragOver: (v: boolean) => void;
  onFile: (f: File) => void;
  onClear: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function DropZone({
  file,
  isDragOver,
  setIsDragOver,
  onFile,
  onClear,
  fileInputRef,
}: DropZoneProps) {
  return (
    <div
      className={cn(
        "drop-zone relative rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all bg-secondary/20 overflow-hidden",
        isDragOver
          ? "border-[#F5A623] bg-[#F5A623]/5 glow-gold"
          : "border-border/60 hover:border-[#F5A623]/40"
      )}
      onDragOver={e => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={e => {
        e.preventDefault();
        setIsDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) onFile(dropped);
      }}
      onClick={() => !file && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE.join(",")}
        className="hidden"
        onChange={e => {
          const selected = e.target.files?.[0];
          if (selected) onFile(selected);
        }}
      />

      {/* Animated dashed border highlight when dragging */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background:
                "radial-gradient(circle at center, rgba(245,166,35,0.12), transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="has-file"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center gap-4 text-center relative z-10"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="size-16 rounded-2xl bg-[#F5A623]/15 flex items-center justify-center text-[#F5A623] glow-gold-sm"
            >
              <FileImage className="size-8" />
            </motion.div>
            <div>
              <p className="font-semibold">{file.name}</p>
              <p className="text-muted-foreground text-sm mt-1">
                Image · {fmtSize(file.size)}
              </p>
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                onClear();
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="size-4" /> Remove file
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-center relative z-10"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="size-16 rounded-full border-2 border-[#F5A623] flex items-center justify-center text-[#F5A623]"
            >
              <CloudUpload className="size-8" />
            </motion.div>
            <div>
              <p className="text-lg font-semibold">Drop your file here</p>
              <p className="text-muted-foreground text-sm">
                or click to browse
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {["JPG", "PNG", "WEBP"].map(fmt => (
                <span
                  key={fmt}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary/60 text-muted-foreground border border-border/40"
                >
                  {fmt}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Images up to {MAX_UPLOAD_MB} MB
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Intensity cards ───────────────────────────────────────────────────────────

function IntensityCards({
  value,
  onChange,
}: {
  value: Intensity;
  onChange: (v: Intensity) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {INTENSITY_OPTIONS.map(opt => (
        <motion.button
          key={opt.value}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-xl p-4 text-left transition-all border relative overflow-hidden",
            value === opt.value
              ? "border-[#F5A623] bg-[#F5A623]/5 glow-gold-sm"
              : "border-border/50 bg-secondary/30 hover:border-[#F5A623]/40"
          )}
        >
          {value === opt.value && (
            <motion.div
              layoutId="intensity-glow"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(245,166,35,0.10), transparent 70%)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <div className="flex items-center justify-between mb-1.5 relative">
            <span className="font-semibold text-sm">{opt.label}</span>
            {value === opt.value && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="size-4 rounded-full bg-[#F5A623] flex items-center justify-center"
              >
                <svg viewBox="0 0 16 16" className="size-2.5 text-black">
                  <path
                    fill="currentColor"
                    d="M6.5 11.5 3 8l1-1 2.5 2.5L12 4l1 1z"
                  />
                </svg>
              </motion.span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed relative">
            {opt.desc}
          </p>
        </motion.button>
      ))}
    </div>
  );
}

// ── Right-side preview panel ──────────────────────────────────────────────────

function PreviewPanel({ intensity }: { intensity: Intensity }) {
  const effects = INTENSITY_EFFECTS[intensity];

  return (
    <aside className="fixed top-16 bottom-0 right-0 w-[22rem] hidden xl:flex flex-col glass border-l border-border/40 z-40 overflow-y-auto">
      <div className="p-6 space-y-5">
        <div>
          <h2 className="font-serif text-2xl">
            Humanization <span className="text-gold italic">Preview</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            See the power of AuthentiGen
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Before</p>
            <div className="relative rounded-xl overflow-hidden border border-border/40 aspect-[4/3]">
              <img
                src="/demo/before.jpg"
                alt="AI-generated landscape, before humanization"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-500/90 text-white">
                AI Generated
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="size-9 rounded-full border border-[#F5A623]/40 flex items-center justify-center bg-background"
            >
              <ArrowDown className="size-4 text-[#F5A623]" />
            </motion.div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">After</p>
            <div className="relative rounded-xl overflow-hidden border border-[#F5A623]/30 aspect-[4/3] glow-gold-sm">
              <AnimatePresence mode="wait">
                <motion.img
                  key={intensity}
                  src={`/demo/after-${intensity}.jpg`}
                  alt={`Humanized result (${intensity} intensity)`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                />
              </AnimatePresence>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/90 text-white z-10">
                Humanized
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <h3 className="text-sm font-semibold capitalize">
            {intensity} · effect profile
          </h3>
          {[effects.grain, effects.color, effects.lens].map(item => (
            <div
              key={item}
              className="flex items-center gap-2.5 text-xs text-muted-foreground"
            >
              <span className="size-1.5 rounded-full bg-[#F5A623] flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-400 flex-shrink-0" />
          <span>Powered by a deterministic, pixel-level realism pipeline</span>
        </div>
      </div>
    </aside>
  );
}

// ── How it works dialog ───────────────────────────────────────────────────────

function HowItWorksDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs glass border border-[#F5A623]/30 text-[#F5A623] hover:bg-[#F5A623]/5 transition-colors">
          <Info className="size-3.5" /> How it works
        </button>
      </DialogTrigger>
      <DialogContent className="glass-strong max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">
            How humanization works
          </DialogTitle>
          <DialogDescription>
            Every uploaded file runs through a 13-step pixel-level pipeline:
          </DialogDescription>
        </DialogHeader>
        <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal pl-5">
          <li>Subtle barrel distortion</li>
          <li>Sobel edge map + skin-tone mask</li>
          <li>Edge-aware chromatic aberration</li>
          <li>Highlight clip + shadow crush + micro banding</li>
          <li>Directional motion blur on the outer 15% ring</li>
          <li>Sensor hot pixels</li>
          <li>Color-temperature drift</li>
          <li>Focus-falloff blur</li>
          <li>Film halation glow from highlights</li>
          <li>Gaussian sensor noise</li>
          <li>Lens dust spots</li>
          <li>Lens vignette</li>
          <li>JPEG re-encode with fake camera EXIF</li>
        </ol>
        <p className="text-xs text-muted-foreground pt-2">
          The result looks identical to your eye but reads as a real photo to AI
          detectors.
        </p>
      </DialogContent>
    </Dialog>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Upload() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createJob = trpc.jobs.create.useMutation({
    onSuccess: data => {
      toast.success("Processing started!");
      navigate(`/process/${data.jobId}`);
    },
    onError: err => {
      toast.error(err.message || "Failed to start processing");
      setIsUploading(false);
    },
  });

  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED_IMAGE.includes(f.type)) {
      toast.error("Unsupported file type. Use JPG, PNG, or WEBP.");
      return;
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      toast.error(`File too large. Max ${MAX_UPLOAD_MB} MB.`);
      return;
    }
    setFile(f);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      await createJob.mutateAsync({
        filename: file.name,
        mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
        intensity,
        fileDataBase64: base64,
      });
    } catch {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-[#F5A623] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass max-w-md gradient-border">
          <CardHeader>
            <div className="size-14 rounded-2xl bg-[#F5A623]/15 flex items-center justify-center text-[#F5A623] mb-3">
              <Shield className="size-7" />
            </div>
            <CardTitle className="font-serif text-2xl">
              Sign in required
            </CardTitle>
            <CardDescription>
              Create a free account to start humanizing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full glow-gold-sm"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <Sidebar />
      <PreviewPanel intensity={intensity} />

      <main className="pt-20 pb-12 px-6 lg:pl-72 xl:pr-[24rem] page-enter">
        <div className="max-w-3xl mx-auto">
          <div className="card-premium gradient-border rounded-2xl">
            <div className="p-8 space-y-7">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl">
                    Upload Your{" "}
                    <span className="text-gold italic">Content</span>
                  </h1>
                  <p className="text-muted-foreground mt-1.5">
                    Drop your AI-generated image below and we'll give it the
                    look of real photography.
                  </p>
                </div>
                <HowItWorksDialog />
              </div>

              {/* Drop zone */}
              <DropZone
                file={file}
                isDragOver={isDragOver}
                setIsDragOver={setIsDragOver}
                onFile={handleFile}
                onClear={() => setFile(null)}
                fileInputRef={fileInputRef}
              />

              {/* Intensity */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="size-4 text-[#F5A623]" />
                  <h2 className="font-semibold text-sm">
                    Humanization Intensity
                  </h2>
                </div>
                <IntensityCards value={intensity} onChange={setIntensity} />
              </div>

              {/* File type info */}
              <div className="rounded-xl p-4 flex items-start gap-3 bg-secondary/30 border border-border/50">
                <div className="size-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] flex-shrink-0">
                  <ImageIcon className="size-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">Images</div>
                  <div className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP · Up to {MAX_UPLOAD_MB} MB
                  </div>
                </div>
              </div>

              {/* Submit */}
              <MagneticButton strength={8} radius={140}>
                <RippleButton
                  size="lg"
                  className="w-full h-14 text-base font-semibold glow-gold gradient-border-animated"
                  disabled={!file || isUploading}
                  onClick={handleSubmit}
                >
                  {isUploading ? (
                    <>
                      <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin mr-2" />
                      Uploading & Processing…
                    </>
                  ) : (
                    <>
                      <Zap className="size-5 mr-2" />
                      Humanize Content
                    </>
                  )}
                </RippleButton>
              </MagneticButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
