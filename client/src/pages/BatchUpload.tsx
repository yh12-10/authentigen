import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Upload as UploadIcon,
  Sparkles,
  ArrowLeft,
  X,
  Files,
  Zap,
  Trash2,
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
  Download,
  FileImage,
  FileVideo,
} from "lucide-react";
import { RippleButton } from "@/components/visual/RippleButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Intensity = "light" | "medium" | "heavy";
type Mime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "video/mp4"
  | "video/webm";

const ACCEPTED: Mime[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
];
const MAX_FILES = 10;

interface Item {
  file: File;
  intensity: Intensity;
}

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

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending: <Clock className="size-4 text-yellow-400" />,
  processing: <Loader2 className="size-4 text-blue-400 animate-spin" />,
  completed: <CheckCircle2 className="size-4 text-emerald-400" />,
  failed: <XCircle className="size-4 text-red-400" />,
};

export default function BatchUpload() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [globalIntensity, setGlobalIntensity] = useState<Intensity>("medium");
  const [batchId, setBatchId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const createBatch = trpc.batch.create.useMutation();
  const status = trpc.batch.status.useQuery(
    { batchId: batchId ?? "" },
    {
      enabled: !!batchId,
      refetchInterval: query => {
        const data = query.state.data;
        if (!data) return 2000;
        const allDone = data.every(
          j => j.status === "completed" || j.status === "failed"
        );
        return allDone ? false : 2000;
      },
    }
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const accepted = arr.filter(f => ACCEPTED.includes(f.type as Mime));
      if (accepted.length !== arr.length)
        toast.error("Some files were skipped (unsupported type).");
      setItems(prev => {
        const merged = [
          ...prev,
          ...accepted.map(f => ({ file: f, intensity: globalIntensity })),
        ].slice(0, MAX_FILES);
        if (prev.length + accepted.length > MAX_FILES)
          toast.warning(`Max ${MAX_FILES} files. Extras dropped.`);
        return merged;
      });
    },
    [globalIntensity]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const submitAll = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const payload = await Promise.all(
        items.map(async it => ({
          filename: it.file.name,
          mimeType: it.file.type as Mime,
          intensity: it.intensity,
          fileDataBase64: await fileToBase64(it.file),
        }))
      );
      const result = await createBatch.mutateAsync({ files: payload });
      setBatchId(result.batchId);
      toast.success(`Batch started — ${result.jobIds.length} files queued`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Batch creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadZip = () => {
    if (!batchId) return;
    window.location.href = `/api/batch/${batchId}/download`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 text-[#F5A623] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass max-w-md gradient-border">
          <CardHeader>
            <CardTitle className="font-serif">Sign in required</CardTitle>
            <CardDescription>Sign in to start a batch upload.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/login")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const jobs = status.data ?? [];
  const completed = jobs.filter(j => j.status === "completed").length;
  const failed = jobs.filter(j => j.status === "failed").length;
  const allDone =
    jobs.length > 0 &&
    jobs.every(j => j.status === "completed" || j.status === "failed");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/40">
        <div className="container flex items-center justify-between h-16">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center glow-gold-sm">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              AuthentiGen
            </span>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>
        </div>
      </nav>

      <main className="container pt-28 pb-16 page-enter max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/upload")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Single upload
        </button>

        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl sm:text-5xl mb-3">
            <Files className="size-10 inline -mt-1 mr-2 text-[#F5A623]" />
            Batch <span className="text-gold italic">Upload</span>
          </h1>
          <p className="text-muted-foreground">
            Process up to {MAX_FILES} files at once. Download all as a ZIP.
          </p>
        </div>

        {!batchId && (
          <>
            <div
              className="drop-zone bg-secondary/20 rounded-2xl border-2 border-dashed border-border/60 p-10 text-center cursor-pointer mb-6 transition-colors hover:border-[#F5A623]/40"
              onDragOver={e => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED.join(",")}
                className="hidden"
                onChange={e => e.target.files && handleFiles(e.target.files)}
              />
              <div className="w-16 h-16 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] mx-auto mb-4">
                <UploadIcon className="w-8 h-8" />
              </div>
              <p className="font-semibold mb-1">Drop files or click to add</p>
              <p className="text-xs text-muted-foreground">
                Up to {MAX_FILES} files · {items.length} selected
              </p>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-muted-foreground">
                Default intensity
              </span>
              <Select
                value={globalIntensity}
                onValueChange={v => setGlobalIntensity(v as Intensity)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-muted-foreground"
                onClick={() => setItems([])}
                disabled={items.length === 0}
              >
                <Trash2 className="size-4 mr-1.5" /> Clear
              </Button>
            </div>

            <div className="space-y-2 mb-6">
              {items.map((it, i) => {
                const isImg = it.file.type.startsWith("image/");
                return (
                  <div
                    key={i}
                    className="bg-secondary/30 border border-border/50 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="size-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] flex-shrink-0">
                      {isImg ? (
                        <FileImage className="size-5" />
                      ) : (
                        <FileVideo className="size-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {it.file.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fmtSize(it.file.size)}
                      </div>
                    </div>
                    <Select
                      value={it.intensity}
                      onValueChange={v =>
                        setItems(prev =>
                          prev.map((p, idx) =>
                            idx === i ? { ...p, intensity: v as Intensity } : p
                          )
                        )
                      }
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="heavy">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() =>
                        setItems(prev => prev.filter((_, idx) => idx !== i))
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <RippleButton
              size="lg"
              className="w-full h-14 glow-gold disabled:opacity-50 disabled:shadow-none disabled:saturate-50 disabled:cursor-not-allowed"
              disabled={items.length === 0 || submitting}
              onClick={submitAll}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" /> Starting…
                </>
              ) : (
                <>
                  <Zap className="size-5 mr-2" /> Start batch ({items.length})
                </>
              )}
            </RippleButton>
          </>
        )}

        {batchId && (
          <div className="space-y-4">
            <Card className="glass gradient-border-animated">
              <CardHeader>
                <CardDescription>Batch progress</CardDescription>
                <CardTitle className="font-serif text-3xl">
                  {completed}{" "}
                  <span className="text-muted-foreground text-base">
                    of {jobs.length} processed
                  </span>
                </CardTitle>
                {failed > 0 && (
                  <p className="text-sm text-destructive">{failed} failed</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full progress-bar-animated transition-all"
                    style={{
                      width: `${jobs.length === 0 ? 0 : ((completed + failed) / jobs.length) * 100}%`,
                    }}
                  />
                </div>
                {allDone && completed > 0 && (
                  <Button onClick={downloadZip} className="glow-gold-sm">
                    <Download className="size-4 mr-2" /> Download all (.zip)
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              {jobs.map(j => (
                <div
                  key={j.id}
                  className="glass rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="flex-shrink-0">{STATUS_ICON[j.status]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {j.originalFilename}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full progress-bar-animated"
                          style={{ width: `${j.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {j.progress}%
                      </span>
                    </div>
                  </div>
                  {j.status === "completed" && j.processedUrl && (
                    <a
                      href={j.processedUrl}
                      download={`humanized_${j.originalFilename}`}
                    >
                      <Button variant="ghost" size="sm" className="size-8 p-0">
                        <Download className="size-4" />
                      </Button>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
