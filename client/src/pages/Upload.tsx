import { useState, useRef, useCallback, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Upload as UploadIcon, Image as ImageIcon, Video as VideoIcon, ArrowLeft,
  X, FileImage, FileVideo, Zap, Layers, Shield, ChevronDown, ChevronRight,
  CloudUpload, Files, History, Settings, Code2, ArrowDown, Crown, Info,
  LogOut, LayoutDashboard, ShieldCheck, Coins, Sparkles,
} from "lucide-react";
import { RippleButton } from "@/components/visual/RippleButton";
import { MagneticButton } from "@/components/visual/MagneticButton";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Intensity = "light" | "medium" | "heavy";
type FileType = "image" | "video" | null;

const ACCEPTED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_VIDEO = ["video/mp4", "video/webm"];
const ALL_ACCEPTED = [...ACCEPTED_IMAGE, ...ACCEPTED_VIDEO];

const INTENSITY_OPTIONS: {
  value: Intensity;
  label: string;
  desc: string;
  credits: string;
}[] = [
  { value: "light", label: "Light", desc: "Subtle, minimal adjustments. Nearly identical to original.", credits: "1× credits" },
  { value: "medium", label: "Medium", desc: "Balanced humanization with organic imperfections.", credits: "2× credits" },
  { value: "heavy", label: "Heavy", desc: "Maximum transformation. Unmistakably human-made.", credits: "3× credits" },
];

// Mock detection probabilities — illustrative UX, not real measurements.
const DETECTION_BY_INTENSITY: Record<Intensity, { before: number; after: number }> = {
  light: { before: 94, after: 14 },
  medium: { before: 94, after: 8 },
  heavy: { before: 94, after: 3 },
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function initials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }
  return (email?.[0] ?? "?").toUpperCase();
}

// ── Top nav ───────────────────────────────────────────────────────────────────

function TopNav() {
  const { user, logout } = useAuth();
  const credits = trpc.credits.balance.useQuery(undefined, { enabled: !!user });
  const [, navigate] = useLocation();
  const creditCount = credits.data?.credits ?? user?.credits ?? 0;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong h-16 border-b border-border/40">
      <div className="h-full px-6 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
          <div className="size-9 rounded-xl bg-[#F5A623] flex items-center justify-center glow-gold-sm transition-transform group-hover:scale-105">
            <Sparkles className="size-5 text-black" />
          </div>
          <span className="font-semibold text-lg tracking-tight">AuthentiGen</span>
        </button>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="/#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="/#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="/#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[#F5A623]/30"
            animate={{ boxShadow: ["0 0 0 rgba(245,166,35,0)", "0 0 14px rgba(245,166,35,0.25)", "0 0 0 rgba(245,166,35,0)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Zap className="size-4 text-[#F5A623]" />
            <span className="text-sm font-semibold text-[#F5A623]">
              {creditCount.toLocaleString()} Credits
            </span>
          </motion.div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-secondary/40 transition-colors">
                <div className="size-8 rounded-full bg-gradient-to-br from-[#F5A623] to-[#4F8EF7] flex items-center justify-center text-xs font-semibold text-black">
                  {initials(user?.name, user?.email)}
                </div>
                <span className="hidden sm:block text-sm font-medium">{user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Guest"}</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong w-56">
              <DropdownMenuLabel>{user?.email ?? "Signed in"}</DropdownMenuLabel>
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
              <DropdownMenuItem onClick={() => logout()} className="text-destructive">
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

interface SidebarItemProps { icon: ReactNode; label: string; active?: boolean; onClick?: () => void; }

function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
        active
          ? "bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/30"
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

        <SidebarItem icon={<CloudUpload className="size-4" />} label="Upload Content" active />
        <SidebarItem icon={<History className="size-4" />} label="History" onClick={() => navigate("/dashboard")} />
        <SidebarItem icon={<Files className="size-4" />} label="Batch Process" onClick={() => navigate("/batch")} />
        <SidebarItem icon={<Code2 className="size-4" />} label="API Access" onClick={() => toast.info("Public API ships in v2 — Studio plan only")} />
        <SidebarItem icon={<Settings className="size-4" />} label="Settings" onClick={() => navigate("/dashboard")} />
      </div>

      <div className="p-4">
        <Card className="glass gradient-border-animated relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-[#F5A623]">
              <Crown className="size-4" />
              <CardTitle className="text-sm">Upgrade Plan</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Get more credits & unlock premium features.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              size="sm"
              className="w-full bg-[#F5A623] hover:bg-[#F5A623]/90 text-black glow-gold-sm"
              onClick={() => navigate("/dashboard")}
            >
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}

// ── Drop zone ─────────────────────────────────────────────────────────────────

interface DropZoneProps {
  file: File | null;
  fileType: FileType;
  isDragOver: boolean;
  setIsDragOver: (v: boolean) => void;
  onFile: (f: File) => void;
  onClear: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function DropZone({ file, fileType, isDragOver, setIsDragOver, onFile, onClear, fileInputRef }: DropZoneProps) {
  return (
    <div
      className={cn(
        "drop-zone relative rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all glass overflow-hidden",
        isDragOver ? "border-[#F5A623] bg-[#F5A623]/5 glow-gold" : "border-border/60"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
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
        accept={ALL_ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
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
              background: "radial-gradient(circle at center, rgba(245,166,35,0.12), transparent 70%)",
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
              {fileType === "image" ? <FileImage className="size-8" /> : <FileVideo className="size-8" />}
            </motion.div>
            <div>
              <p className="font-semibold">{file.name}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {fileType === "image" ? "Image" : "Video"} · {fmtSize(file.size)}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
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
              <p className="text-muted-foreground text-sm">or click to browse</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {["JPG", "PNG", "WEBP", "MP4", "WEBM"].map((fmt) => (
                <span key={fmt} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary/60 text-muted-foreground border border-border/40">
                  {fmt}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Images up to 20 MB · Videos up to 100 MB</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Intensity cards ───────────────────────────────────────────────────────────

function IntensityCards({ value, onChange }: { value: Intensity; onChange: (v: Intensity) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {INTENSITY_OPTIONS.map((opt) => (
        <motion.button
          key={opt.value}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-xl p-4 text-left transition-all border relative overflow-hidden",
            value === opt.value
              ? "border-[#F5A623] bg-[#F5A623]/5 glow-gold-sm"
              : "border-border/60 bg-secondary/30 hover:border-[#F5A623]/40"
          )}
        >
          {value === opt.value && (
            <motion.div
              layoutId="intensity-glow"
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at top right, rgba(245,166,35,0.10), transparent 70%)" }}
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
                <svg viewBox="0 0 16 16" className="size-2.5 text-black"><path fill="currentColor" d="M6.5 11.5 3 8l1-1 2.5 2.5L12 4l1 1z"/></svg>
              </motion.span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2 relative">{opt.desc}</p>
          <span className={cn("text-xs font-medium relative", value === opt.value ? "text-[#F5A623]" : "text-muted-foreground")}>
            {opt.credits}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// ── Right-side preview panel ──────────────────────────────────────────────────

const DEMO_BEFORE_SVG = `<svg width="600" height="450" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a2238"/>
      <stop offset="60%" stop-color="#2d3a5c"/>
      <stop offset="100%" stop-color="#3a4866"/>
    </linearGradient>
    <linearGradient id="peak" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e89456"/>
      <stop offset="50%" stop-color="#7a5238"/>
      <stop offset="100%" stop-color="#1f1a18"/>
    </linearGradient>
  </defs>
  <rect width="600" height="450" fill="url(#sky)"/>
  <ellipse cx="450" cy="80" rx="120" ry="40" fill="#5a6480" opacity="0.6"/>
  <ellipse cx="200" cy="60" rx="160" ry="30" fill="#404a66" opacity="0.5"/>
  <polygon points="0,450 150,200 250,300 380,150 500,280 600,220 600,450" fill="url(#peak)"/>
  <polygon points="0,450 100,330 200,380 280,320 380,400 480,350 600,380 600,450" fill="#0e0f15" opacity="0.85"/>
</svg>`;

function ProbabilityBar({ label, value, color }: { label: string; value: number; color: "red" | "green" }) {
  const colorMap = {
    red: "from-red-500 to-rose-500",
    green: "from-emerald-500 to-green-500",
  };
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className={cn("h-full rounded-full bg-gradient-to-r", colorMap[color])}
        />
      </div>
    </div>
  );
}

function PreviewPanel({ intensity }: { intensity: Intensity }) {
  const [tab, setTab] = useState<"image" | "video">("image");
  const detection = DETECTION_BY_INTENSITY[intensity];
  const demoSrc = `data:image/svg+xml;utf8,${encodeURIComponent(DEMO_BEFORE_SVG)}`;

  return (
    <aside className="fixed top-16 bottom-0 right-0 w-[22rem] hidden xl:flex flex-col glass border-l border-border/40 z-40 overflow-y-auto">
      <div className="p-6 space-y-5">
        <div>
          <h2 className="font-serif text-2xl">Humanization <span className="text-gold italic">Preview</span></h2>
          <p className="text-xs text-muted-foreground mt-1">See the power of AuthentiGen</p>
        </div>

        <div className="inline-flex p-1 rounded-lg bg-secondary/50 border border-border/50">
          {(["image", "video"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative px-4 py-1.5 text-xs font-medium rounded-md transition-colors",
                tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === t && (
                <motion.div
                  layoutId="preview-tab-pill"
                  className="absolute inset-0 rounded-md bg-[#F5A623]/15 border border-[#F5A623]/40"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative capitalize">{t}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Before</p>
            <div className="relative rounded-xl overflow-hidden border border-border/40 aspect-[4/3]">
              <img src={demoSrc} alt="Demo before" className="w-full h-full object-cover" />
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
              <img
                src={demoSrc}
                alt="Demo after"
                className="w-full h-full object-cover"
                style={{
                  filter: `contrast(${1 + intensity === "heavy" ? 0.08 : 0.04}) saturate(${
                    intensity === "heavy" ? 1.2 : intensity === "medium" ? 1.12 : 1.05
                  }) hue-rotate(${intensity === "heavy" ? "8deg" : intensity === "medium" ? "5deg" : "2deg"})`,
                }}
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/90 text-white">
                Humanized
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold">Detection Probability</h3>
          <ProbabilityBar label="Before" value={detection.before} color="red" />
          <ProbabilityBar label="After" value={detection.after} color="green" />
        </div>

        <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-400 flex-shrink-0" />
          <span>Powered by advanced detection bypass technology</span>
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
          <DialogTitle className="font-serif">How humanization works</DialogTitle>
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
          The result looks identical to your eye but reads as a real photo to AI detectors.
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
  const [fileType, setFileType] = useState<FileType>(null);
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createJob = trpc.jobs.create.useMutation({
    onSuccess: (data) => {
      toast.success("Processing started!");
      navigate(`/process/${data.jobId}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start processing");
      setIsUploading(false);
    },
  });

  const handleFile = useCallback((f: File) => {
    if (!ALL_ACCEPTED.includes(f.type)) {
      toast.error("Unsupported file type. Use JPG, PNG, WEBP, MP4, or WEBM.");
      return;
    }
    const maxSize = f.type.startsWith("video/") ? 100 * 1024 * 1024 : 20 * 1024 * 1024;
    if (f.size > maxSize) {
      toast.error(`File too large. Max ${f.type.startsWith("video/") ? "100 MB" : "20 MB"}.`);
      return;
    }
    setFile(f);
    setFileType(f.type.startsWith("image/") ? "image" : "video");
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
        mimeType: file.type as "image/jpeg" | "image/png" | "image/webp" | "video/mp4" | "video/webm",
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
            <CardTitle className="font-serif text-2xl">Sign in required</CardTitle>
            <CardDescription>Create a free account to start humanizing.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full glow-gold-sm" onClick={() => navigate("/login")}>Sign In</Button>
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
          <Card className="glass border-border/40">
            <CardContent className="p-8 space-y-7">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl">
                    Upload Your <span className="text-gold italic">Content</span>
                  </h1>
                  <p className="text-muted-foreground mt-1.5">
                    Drop your AI-generated image or video below and we'll make it undetectable.
                  </p>
                </div>
                <HowItWorksDialog />
              </div>

              {/* Drop zone */}
              <DropZone
                file={file}
                fileType={fileType}
                isDragOver={isDragOver}
                setIsDragOver={setIsDragOver}
                onFile={handleFile}
                onClear={() => { setFile(null); setFileType(null); }}
                fileInputRef={fileInputRef}
              />

              {/* Intensity */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="size-4 text-[#F5A623]" />
                  <h2 className="font-semibold text-sm">Humanization Intensity</h2>
                </div>
                <IntensityCards value={intensity} onChange={setIntensity} />
              </div>

              {/* File type info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl p-4 flex items-start gap-3 bg-secondary/30 border border-border/40">
                  <div className="size-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] flex-shrink-0">
                    <ImageIcon className="size-5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Images</div>
                    <div className="text-xs text-muted-foreground">JPG, PNG, WEBP · Up to 20 MB · 1–3 credits</div>
                  </div>
                </div>
                <div className="rounded-xl p-4 flex items-start gap-3 bg-secondary/30 border border-border/40">
                  <div className="size-10 rounded-lg bg-[#4F8EF7]/10 flex items-center justify-center text-[#4F8EF7] flex-shrink-0">
                    <VideoIcon className="size-5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Videos</div>
                    <div className="text-xs text-muted-foreground">MP4, WEBM · Up to 100 MB · 3–9 credits</div>
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

              {fileType === "video" && (
                <p className="text-xs text-muted-foreground text-center -mt-3">
                  Videos are humanized at sampled framerate with audio passthrough · 30 s max.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
