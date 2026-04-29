import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  Sparkles, Plus, Download, Clock, CheckCircle2, XCircle,
  Loader2, Image, Video, Coins, LayoutGrid, LogOut, Zap,
  ArrowRight, RefreshCw
} from "lucide-react";
type JobStatus = "pending" | "processing" | "completed" | "failed";
type JobIntensity = "light" | "medium" | "heavy";
type JobType = "image" | "video";
interface Job {
  id: number;
  type: JobType;
  status: JobStatus;
  intensity: JobIntensity;
  originalFilename: string;
  processedUrl?: string | null;
  progress: number;
  creditsUsed: number;
  createdAt: Date;
}

function StatusBadge({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, { label: string; class: string }> = {
    pending: { label: "Queued", class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    processing: { label: "Processing", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    completed: { label: "Done", class: "bg-green-500/10 text-green-400 border-green-500/20" },
    failed: { label: "Failed", class: "bg-red-500/10 text-red-400 border-red-500/20" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.class}`}>
      {status === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "completed" && <CheckCircle2 className="w-3 h-3" />}
      {status === "failed" && <XCircle className="w-3 h-3" />}
      {status === "pending" && <Clock className="w-3 h-3" />}
      {s.label}
    </span>
  );
}

function IntensityBadge({ intensity }: { intensity: JobIntensity }) {
  const map: Record<JobIntensity, string> = {
    light: "bg-secondary text-secondary-foreground",
    medium: "bg-primary/10 text-primary",
    heavy: "bg-orange-500/10 text-orange-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[intensity]}`}>
      {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
    </span>
  );
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatSize(filename: string) {
  return filename.length > 28 ? filename.slice(0, 25) + "..." : filename;
}

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: jobs, isLoading: jobsLoading, refetch } = trpc.jobs.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  const { data: creditsData } = trpc.credits.balance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const claimBonus = trpc.credits.claimBonus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

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
          <h2 className="font-serif text-3xl font-normal mb-3">Sign In Required</h2>
          <p className="text-muted-foreground mb-8">Sign in to access your dashboard.</p>
          <Button className="glow-gold w-full h-12" onClick={() => window.location.href = getLoginUrl()}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const completedJobs = jobs?.filter((j) => j.status === "completed") ?? [];
  const activeJobs = jobs?.filter((j) => j.status === "pending" || j.status === "processing") ?? [];
  const credits = creditsData?.credits ?? user?.credits ?? 0;

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
            <Button size="sm" onClick={() => navigate("/upload")} className="glow-gold-sm">
              <Plus className="w-4 h-4 mr-1.5" /> New Upload
            </Button>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container pt-28 pb-16 page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal mb-1">
              Welcome back, <span className="text-gold italic">{user?.name?.split(" ")[0] ?? "Creator"}</span>
            </h1>
            <p className="text-muted-foreground">Manage your humanization jobs and credits.</p>
          </div>
          <Button onClick={() => navigate("/upload")} className="glow-gold self-start sm:self-auto">
            <Zap className="w-4 h-4 mr-2" /> Humanize Content
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Coins className="w-5 h-5" />
              </div>
              <button
                onClick={() => claimBonus.mutate()}
                disabled={claimBonus.isPending}
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                {claimBonus.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                Claim Bonus
              </button>
            </div>
            <div className="text-3xl font-bold mb-1">{credits}</div>
            <div className="text-sm text-muted-foreground">Credits Available</div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold mb-1">{completedJobs.length}</div>
            <div className="text-sm text-muted-foreground">Files Humanized</div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
              <Loader2 className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold mb-1">{activeJobs.length}</div>
            <div className="text-sm text-muted-foreground">Active Jobs</div>
          </div>
        </div>

        {/* Active Jobs */}
        {activeJobs.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                Active Processing
              </h2>
            </div>
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    {job.type === "image" ? <Image className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{formatSize(job.originalFilename)}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full progress-bar-animated"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{job.progress}%</span>
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/process/${job.id}`)}>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job History */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-primary" />
              Upload History
            </h2>
            <button onClick={() => refetch()} className="text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {jobsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl">
                  <div className="shimmer w-10 h-10 rounded-lg" />
                  <div className="flex-1">
                    <div className="shimmer h-4 w-48 rounded mb-2" />
                    <div className="shimmer h-3 w-32 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="font-semibold mb-2">No jobs yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Upload your first AI-generated content to get started.</p>
              <Button onClick={() => navigate("/upload")} className="glow-gold-sm">
                <Plus className="w-4 h-4 mr-2" /> Upload Content
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left pb-3 font-medium">File</th>
                    <th className="text-left pb-3 font-medium hidden sm:table-cell">Type</th>
                    <th className="text-left pb-3 font-medium hidden md:table-cell">Intensity</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium hidden lg:table-cell">Date</th>
                    <th className="text-right pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                            {job.type === "image" ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                          </div>
                          <span className="truncate max-w-[120px] sm:max-w-[180px]">{formatSize(job.originalFilename)}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell capitalize text-muted-foreground">{job.type}</td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        <IntensityBadge intensity={job.intensity} />
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="py-3 pr-4 hidden lg:table-cell text-muted-foreground text-xs">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {job.status === "completed" && job.processedUrl && (
                            <a href={job.processedUrl} download={`humanized_${job.originalFilename}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Download className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => navigate(`/process/${job.id}`)}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
