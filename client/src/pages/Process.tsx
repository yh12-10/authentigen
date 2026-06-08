import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Sparkles,
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  Zap,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { ProcessingOrb } from "@/components/process/ProcessingOrb";
import { StepIndicators } from "@/components/process/StepIndicators";
import { CompletionConfetti } from "@/components/process/CompletionConfetti";
import { ErrorState } from "@/components/process/ErrorState";

function ComparisonSlider({
  originalUrl,
  processedUrl,
}: {
  originalUrl: string;
  processedUrl: string;
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100)
    );
    setSliderPos(pos);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSlider(e.clientX);
  };
  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) updateSlider(e.clientX);
    },
    [isDragging, updateSlider]
  );
  const onMouseUp = useCallback(() => setIsDragging(false), []);
  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches[0]) updateSlider(e.touches[0].clientX);
    },
    [updateSlider]
  );

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
      style={{ cursor: "col-resize", aspectRatio: "16/9" }}
      onMouseDown={onMouseDown}
      onTouchStart={e => {
        if (e.touches[0]) updateSlider(e.touches[0].clientX);
      }}
    >
      <img
        src={originalUrl}
        alt="Original"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
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
      <div
        className="absolute top-0 bottom-0 w-px bg-[#F5A623]"
        style={{
          left: `${sliderPos}%`,
          transform: "translateX(-50%)",
          boxShadow: "0 0 20px rgba(245,166,35,0.6)",
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center shadow-lg glow-gold">
          <div className="flex items-center gap-0.5">
            <ChevronLeft className="w-3 h-3 text-black" />
            <ChevronRight className="w-3 h-3 text-black" />
          </div>
        </div>
      </div>
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold glass text-foreground">
        Original
      </div>
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F5A623] text-black">
        Humanized
      </div>
    </div>
  );
}

function SyncedVideoPair({
  originalUrl,
  processedUrl,
  isVideo,
}: {
  originalUrl: string;
  processedUrl: string;
  isVideo: boolean;
}) {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);

  const sync = (source: "a" | "b") => () => {
    const src = source === "a" ? aRef.current : bRef.current;
    const dst = source === "a" ? bRef.current : aRef.current;
    if (!src || !dst) return;
    if (Math.abs(dst.currentTime - src.currentTime) > 0.05)
      dst.currentTime = src.currentTime;
    if (src.paused && !dst.paused) dst.pause();
    if (!src.paused && dst.paused) dst.play().catch(() => {});
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-xs text-muted-foreground mb-2 font-medium">
          Original
        </div>
        <video
          ref={aRef}
          src={originalUrl}
          controls
          muted
          onPlay={sync("a")}
          onPause={sync("a")}
          onSeeked={sync("a")}
          onTimeUpdate={sync("a")}
          className="w-full rounded-xl object-cover"
          style={{ aspectRatio: "16/9" }}
        />
      </div>
      <div>
        <div className="text-xs text-muted-foreground mb-2 font-medium">
          Humanized
        </div>
        {isVideo ? (
          <video
            ref={bRef}
            src={processedUrl}
            controls
            muted
            onPlay={sync("b")}
            onPause={sync("b")}
            onSeeked={sync("b")}
            onTimeUpdate={sync("b")}
            className="w-full rounded-xl object-cover"
            style={{ aspectRatio: "16/9" }}
          />
        ) : (
          <img
            src={processedUrl}
            alt="Humanized preview frame"
            className="w-full rounded-xl object-cover"
            style={{ aspectRatio: "16/9" }}
          />
        )}
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
      refetchInterval: query => {
        const data = query.state.data;
        if (!data) return 2000;
        if (data.status === "completed" || data.status === "failed")
          return false;
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
    return secs < 60
      ? `~${secs}s remaining`
      : `~${Math.ceil(secs / 60)}m remaining`;
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

  // Detect if processed output is a video (real per-frame pipeline) vs preview JPG
  const processedIsVideo = Boolean(
    job?.type === "video" &&
      job.processedUrl &&
      !job.processedUrl.endsWith(".jpg") &&
      !job.processedUrl.endsWith(".jpeg")
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CompletionConfetti trigger={job?.status === "completed"} />

      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="container flex items-center justify-between h-16">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center glow-gold-sm">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              AuthentiGen
            </span>
          </button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutGrid className="w-4 h-4 mr-1.5" /> Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="container pt-28 pb-16 page-enter">
        <button
          onClick={() => navigate("/upload")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> New Upload
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-2xl p-6 mb-6">
            {(job?.status === "pending" ||
              job?.status === "processing" ||
              !job) && (
              <div className="flex flex-col items-center text-center mb-6">
                <ProcessingOrb status={job?.status ?? "processing"} />
                <h1 className="font-serif text-2xl mt-4">
                  {job?.status === "pending"
                    ? "Queued for Processing"
                    : "Humanizing Your Content"}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {job?.originalFilename ?? "Loading…"}
                </p>
              </div>
            )}

            {job?.status === "completed" && (
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="size-6 text-emerald-400" />
                <div>
                  <h1 className="font-serif text-2xl">Humanization Complete</h1>
                  <p className="text-muted-foreground text-sm">
                    {job.originalFilename}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto">
                  <Clock className="w-4 h-4" /> {getETA()}
                </div>
              </div>
            )}

            {job?.status === "failed" && (
              <ErrorState
                message={job.errorMessage}
                onRetry={() => navigate("/upload")}
                onBack={() => navigate("/dashboard")}
              />
            )}

            {job &&
              (job.status === "processing" || job.status === "pending") && (
                <>
                  <div className="mb-4">
                    <StepIndicators
                      progress={job.progress}
                      status={job.status}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span>
                      {job.progress}% • {getETA()}
                    </span>
                  </div>
                  <ProgressBar progress={job.progress} />
                </>
              )}

            {job?.status === "completed" && (
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  onClick={handleDownload}
                  className="glow-gold-sm relative overflow-hidden"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Humanized File
                  <span className="absolute inset-0 shimmer opacity-30 pointer-events-none" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/upload")}>
                  <Zap className="w-4 h-4 mr-2" />
                  Humanize Another
                </Button>
              </div>
            )}
          </div>

          {job && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                {
                  label: "Type",
                  value: job.type === "image" ? "Image" : "Video",
                },
                {
                  label: "Intensity",
                  value:
                    job.intensity.charAt(0).toUpperCase() +
                    job.intensity.slice(1),
                },
                {
                  label: "Credits Used",
                  value:
                    job.status === "completed"
                      ? `${job.creditsUsed} credits`
                      : "Pending",
                },
              ].map(item => (
                <div
                  key={item.label}
                  className="glass rounded-xl p-4 text-center"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {item.label}
                  </div>
                  <div className="font-semibold text-sm">{item.value}</div>
                </div>
              ))}
            </div>
          )}

          {job?.status === "completed" && job.processedUrl && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#F5A623]" />
                Before / After Comparison
              </h2>

              {job.type === "video" ? (
                <SyncedVideoPair
                  originalUrl={job.originalUrl}
                  processedUrl={job.processedUrl}
                  isVideo={processedIsVideo}
                />
              ) : (
                <div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Drag the slider to compare original vs. humanized.
                  </p>
                  <ComparisonSlider
                    originalUrl={job.originalUrl}
                    processedUrl={job.processedUrl}
                  />
                </div>
              )}
            </div>
          )}

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
