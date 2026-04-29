import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Upload as UploadIcon, Image, Video, Sparkles, ArrowLeft,
  X, FileImage, FileVideo, Zap, Layers, Shield, Files,
} from "lucide-react";
import { RippleButton } from "@/components/visual/RippleButton";
import { motion } from "framer-motion";

type Intensity = "light" | "medium" | "heavy";
type FileType = "image" | "video" | null;

const ACCEPTED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_VIDEO = ["video/mp4", "video/webm"];
const ALL_ACCEPTED = [...ACCEPTED_IMAGE, ...ACCEPTED_VIDEO];

const INTENSITY_OPTIONS: { value: Intensity; label: string; desc: string; credits: string }[] = [
  { value: "light", label: "Light", desc: "Subtle, minimal adjustments. Nearly identical to original.", credits: "1× credits" },
  { value: "medium", label: "Medium", desc: "Balanced humanization with organic imperfections.", credits: "2× credits" },
  { value: "heavy", label: "Heavy", desc: "Maximum transformation. Unmistakably human-made.", credits: "3× credits" },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
      toast.error(`File too large. Max ${f.type.startsWith("video/") ? "100MB" : "20MB"}.`);
      return;
    }
    setFile(f);
    setFileType(f.type.startsWith("image/") ? "image" : "video");
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
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
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-12 text-center max-w-md gradient-border">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-normal mb-3">Sign In Required</h2>
          <p className="text-muted-foreground mb-8">Create a free account to start humanizing your AI content.</p>
          <Button className="glow-gold w-full h-12" onClick={() => window.location.href = getLoginUrl()}>
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-gold-sm">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">AuthentiGen</span>
          </button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/batch")}>
              <Files className="w-4 h-4 mr-1.5" /> Batch
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>Dashboard</Button>
          </div>
        </div>
      </nav>

      <main className="container pt-28 pb-16 page-enter">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl sm:text-5xl font-normal mb-3">
              Upload Your{" "}
              <span className="text-gold italic">Content</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Drop your AI-generated image or video below and we'll make it undetectable.
            </p>
          </div>

          {/* Drop Zone */}
          <div
            className={`drop-zone glass rounded-3xl border-2 border-dashed border-border p-12 text-center cursor-pointer mb-8 ${isDragOver ? "drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALL_ACCEPTED.join(",")}
              className="hidden"
              onChange={onInputChange}
            />

            {file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {fileType === "image" ? <FileImage className="w-8 h-8" /> : <FileVideo className="w-8 h-8" />}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{file.name}</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {fileType === "image" ? "Image" : "Video"} · {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setFileType(null); }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" /> Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <UploadIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-semibold mb-1">Drop your file here</p>
                  <p className="text-muted-foreground text-sm">or click to browse</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {["JPG", "PNG", "WEBP", "MP4", "WEBM"].map((fmt) => (
                    <span key={fmt} className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {fmt}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Images up to 20MB · Videos up to 100MB</p>
              </div>
            )}
          </div>

          {/* Intensity Selector */}
          <div className="glass rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Humanization Intensity</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {INTENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setIntensity(opt.value)}
                  className={`rounded-xl p-4 text-left transition-all duration-200 border ${
                    intensity === opt.value
                      ? "border-primary bg-primary/10 glow-gold-sm"
                      : "border-border bg-secondary/30 hover:border-primary/40"
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mb-2 leading-relaxed">{opt.desc}</div>
                  <div className={`text-xs font-medium ${intensity === opt.value ? "text-primary" : "text-muted-foreground"}`}>
                    {opt.credits}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File type info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="glass rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm mb-1">Images</div>
                <div className="text-xs text-muted-foreground">JPG, PNG, WEBP · Up to 20MB · 1–3 credits</div>
              </div>
            </div>
            <div className="glass rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm mb-1">Videos</div>
                <div className="text-xs text-muted-foreground">MP4, WEBM · Up to 100MB · 3–9 credits</div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <RippleButton
              size="lg"
              className="w-full h-14 text-base font-semibold glow-gold"
              disabled={!file || isUploading}
              onClick={handleSubmit}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin mr-2" />
                  Uploading & Processing…
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Humanize {fileType === "video" ? "Video" : "Image"}
                </>
              )}
            </RippleButton>
          </motion.div>
          {fileType === "video" && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Videos are humanized at sampled framerate with audio passthrough · 30s max.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
