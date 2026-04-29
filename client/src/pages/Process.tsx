import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Sparkles, ArrowLeft, Download, CheckCircle2, XCircle,
  Clock, Zap, ChevronLeft, ChevronRight, LayoutGrid
} from "lucide-react";

function ComparisonSlider({ originalUrl, processedUrl }: { originalUrl: string; processedUrl: string }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => { setIsDragging(true); updateSlider(e.clientX); };
  const onMouseMove = useCallback((e: MouseEvent) => { if (isDragging) updateSlider(e.clientX); }, [isDragging, updateSlider]);
  const onMouseUp = useCallback(() => setIsDragging(false), []);
  const onTouchMove = useCallback((e: TouchEvent) => { if (e.touches[0]) updateSlider(e.touches[0].clientX); }, [updateSlider]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [onMouseMove, onMouseUp, onTouchMove]);

  return (
    <div
      ref={containerRef}
      className="comparison-slider relative rounded-2xl overflow-hidden select-none"
      style={{ cursor: isDragging ? "col-resize" : "col-resize", aspectRatio: "16/9" }}
      onMouseDown={onMouseDown}
      onTouchStart={(e) => { if (e.touches[0]) updateSlider(e.touches[0].clientX); }}
    >
      {/* Original (full width, clipped on right) */}
      <img
        src={originalUrl}
        alt="Original"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Processed (clipped on left) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      >
        <img
          src={processedUrl}
          alt="Humanized"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="comparison-handle"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg"
          style={{ boxShadow: "0 0 20px oklch(0.82 0.12 85 / 0.6)" }}>
          <div className="flex items-center gap-0.5">
            <ChevronLeft className="w-3 h-3 text-primary-foreground" />
            <ChevronRight className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold glass text-foreground">
        Original
      </div>
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
        Humanized
      </div>
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
      <div
        className="h-full rounded-full progress-bar-animated transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function Process() {
  const params = useParams<{ jobId: string }>();
  const jobId = parseInt(params.jobId ?? "0");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [pollEnabled, setPollEnabled] = useState(true);

  const { data: job } = trpc.jobs.status.useQuery(
    { jobId },
    {
      enabled: !!jobId && isAuthenticated && pollEnabled,
      refetchInterval: (query) => {
        const data = query.state.data;
        if (!data) return 2000;
        if (data.status === "completed" || data.status === "failed") return false;
        return 2000;
      },
    }
  );

  useEffect(() => {
    if (job?.status === "completed" || job?.status === "failed") {
      setPollEnabled(false);
    }
  }, [job?.status]);

  const getETA = () => {
    if (!job) return null;
    if (job.status === "completed") return "Done";
    if (job.status === "failed") return "Failed";
    if (job.status === "pending") return "Queued...";
    const remaining = 100 - job.progress;
    const secs = Math.ceil(remaining * 0.8);
    return secs < 60 ? `~${secs}s remaining` : `~${Math.ceil(secs / 60)}m remaining`;
  };

  const handleDownload = () => {
    if (!job?.processedUrl) return;
    const a = document.createElement("a");
    a.href = job.processedUrl;
    a.download = `humanized_${job.originalFilename}`;
    a.click();
  };

  if (!isAuthenticated) {
    navigate("/");
    return null;
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
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <LayoutGrid className="w-4 h-4 mr-1.5" /> Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="container pt-28 pb-16 page-enter">
        <button onClick={() => navigate("/upload")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> New Upload
        </button>

        <div className="max-w-3xl mx-auto">
          {/* Status Header */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {job?.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : job?.status === "failed" ? (
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
                  )}
                  <h1 className="font-semibold text-lg truncate">
                    {job?.status === "completed" ? "Humanization Complete" :
                     job?.status === "failed" ? "Processing Failed" :
                     job?.status === "processing" ? "Humanizing Your Content..." :
                     "Queued for Processing"}
                  </h1>
                </div>
                <p className="text-muted-foreground text-sm truncate">
                  {job?.originalFilename ?? "Loading..."}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-shrink-0">
                <Clock className="w-4 h-4" />
                {getETA()}
              </div>
            </div>

            {job && (job.status === "processing" || job.status === "pending") && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>{job.progress}%</span>
                </div>
                <ProgressBar progress={job.progress} />
              </div>
            )}

            {job?.status === "completed" && (
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={handleDownload} className="glow-gold-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Humanized File
                </Button>
                <Button variant="outline" onClick={() => navigate("/upload")}>
                  <Zap className="w-4 h-4 mr-2" />
                  Humanize Another
                </Button>
              </div>
            )}

            {job?.status === "failed" && (
              <div className="mt-4">
                <p className="text-sm text-destructive mb-3">{job.errorMessage ?? "An unexpected error occurred."}</p>
                <Button variant="outline" onClick={() => navigate("/upload")}>Try Again</Button>
              </div>
            )}
          </div>

          {/* Job Details */}
          {job && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Type", value: job.type === "image" ? "Image" : "Video" },
                { label: "Intensity", value: job.intensity.charAt(0).toUpperCase() + job.intensity.slice(1) },
                { label: "Credits Used", value: job.status === "completed" ? `${job.creditsUsed} credits` : "Pending" },
              ].map((item) => (
                <div key={item.label} className="glass rounded-xl p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                  <div className="font-semibold text-sm">{item.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Before/After Comparison */}
          {job?.status === "completed" && job.processedUrl && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Before / After Comparison
              </h2>

              {job.type === "video" ? (
                // Video jobs: show original video + humanized preview frame side by side
                <div>
                  <div className="mb-3 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary">
                    <strong>Video Preview Mode:</strong> The humanized output shown is a representative processed frame
                    demonstrating the applied color grading, grain, and cinematic effects. Full frame-by-frame video
                    export is available in the Studio plan.
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-2 font-medium">Original Video</div>
                      <video
                        src={job.originalUrl}
                        controls
                        muted
                        className="w-full rounded-xl object-cover"
                        style={{ aspectRatio: "16/9" }}
                      />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-2 font-medium">Humanized Preview Frame</div>
                      <img
                        src={job.processedUrl}
                        alt="Humanized preview frame"
                        className="w-full rounded-xl object-cover"
                        style={{ aspectRatio: "16/9" }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Image jobs: full interactive drag slider
                <div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Drag the slider to compare original vs. humanized output.
                  </p>
                  <ComparisonSlider
                    originalUrl={job.originalUrl}
                    processedUrl={job.processedUrl}
                  />
                </div>
              )}
            </div>
          )}

          {/* Loading skeleton */}
          {!job && (
            <div className="glass rounded-2xl p-6">
              <div className="shimmer h-6 w-48 rounded-lg mb-4" />
              <div className="shimmer h-64 w-full rounded-xl" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
