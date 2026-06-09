import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Sparkles,
  Plus,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Image,
  Video,
  LayoutGrid,
  LogOut,
  Zap,
  ArrowRight,
  RefreshCw,
  Settings,
} from "lucide-react";
import { Counter } from "@/components/visual/Counter";
import { Reveal } from "@/components/visual/Reveal";
import { EmptyState } from "@/components/process/EmptyState";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type JobStatus = "pending" | "processing" | "completed" | "failed";
type JobIntensity = "light" | "medium" | "heavy";
type JobType = "image" | "video";

function StatusBadge({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, { label: string; class: string }> = {
    pending: {
      label: "Queued",
      class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    processing: {
      label: "Processing",
      class: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    completed: {
      label: "Done",
      class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    failed: {
      label: "Failed",
      class: "bg-red-500/10 text-red-400 border-red-500/20",
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.class}`}
    >
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
    medium: "bg-[#F5A623]/10 text-[#F5A623]",
    heavy: "bg-orange-500/10 text-orange-400",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${map[intensity]}`}
    >
      {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
    </span>
  );
}

function formatFile(filename: string) {
  return filename.length > 28 ? filename.slice(0, 25) + "…" : filename;
}

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: jobs, refetch: refetchJobs } = trpc.jobs.list.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      refetchInterval: 5000,
    }
  );

  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | JobType>("all");

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
        <div className="glass rounded-3xl p-12 text-center max-w-md gradient-border">
          <h2 className="font-serif text-3xl font-normal mb-3">
            Sign In Required
          </h2>
          <p className="text-muted-foreground mb-8">
            Sign in to access your dashboard.
          </p>
          <Button
            className="glow-gold w-full h-12"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const completedJobs = jobs?.filter(j => j.status === "completed") ?? [];
  const activeJobs =
    jobs?.filter(j => j.status === "pending" || j.status === "processing") ??
    [];
  const filteredJobs = (jobs ?? []).filter(
    j =>
      (statusFilter === "all" || j.status === statusFilter) &&
      (typeFilter === "all" || j.type === typeFilter)
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            {user?.role === "admin" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
              >
                Admin
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => navigate("/upload")}
              className="glow-gold-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> New Upload
            </Button>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container pt-28 pb-16 page-enter">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal mb-1">
              Welcome back,{" "}
              <span className="text-gold italic">
                {user?.name?.split(" ")[0] ?? "Creator"}
              </span>
            </h1>
            <p className="text-muted-foreground">
              Manage your humanization jobs.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/upload")}
              className="glow-gold-sm"
            >
              <Zap className="w-4 h-4 mr-2" /> Humanize
            </Button>
            <Button variant="outline" onClick={() => navigate("/batch")}>
              Batch
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="overview">
              <LayoutGrid className="size-4 mr-1.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Video className="size-4 mr-1.5" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="size-4 mr-1.5" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Reveal>
                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Jobs
                    </CardTitle>
                    <div className="w-9 h-9 rounded-xl bg-[#F5A623]/15 flex items-center justify-center text-[#F5A623]">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-serif">
                      <Counter to={jobs?.length ?? 0} />
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
              <Reveal delay={0.06}>
                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Files Humanized
                    </CardTitle>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-serif">
                      <Counter to={completedJobs.length} />
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
              <Reveal delay={0.12}>
                <Card className="glass">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Jobs
                    </CardTitle>
                    <div className="w-9 h-9 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center text-[#4F8EF7]">
                      <Loader2 className="w-5 h-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-serif">
                      <Counter to={activeJobs.length} />
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </div>

            {activeJobs.length > 0 && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#F5A623] animate-spin" />
                    Active Processing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeJobs.map(job => (
                    <div
                      key={job.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] flex-shrink-0">
                        {job.type === "image" ? (
                          <Image className="w-5 h-5" />
                        ) : (
                          <Video className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {formatFile(job.originalFilename)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full progress-bar-animated"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {job.progress}%
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={job.status} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/process/${job.id}`)}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Jobs */}
          <TabsContent value="jobs" className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Select
                value={statusFilter}
                onValueChange={v => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={typeFilter}
                onValueChange={v => setTypeFilter(v as typeof typeFilter)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchJobs()}
                className="ml-auto"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
              </Button>
            </div>

            {!jobs || jobs.length === 0 ? (
              <Card className="glass">
                <CardContent className="pt-6">
                  <EmptyState
                    title="No jobs yet"
                    description="Upload your first AI-generated content to get started."
                    action={
                      <Button
                        onClick={() => navigate("/upload")}
                        className="glow-gold-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Upload Content
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="glass">
                <CardContent className="overflow-x-auto pt-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs">
                        <th className="text-left pb-3 font-medium">File</th>
                        <th className="text-left pb-3 font-medium hidden sm:table-cell">
                          Type
                        </th>
                        <th className="text-left pb-3 font-medium hidden md:table-cell">
                          Intensity
                        </th>
                        <th className="text-left pb-3 font-medium">Status</th>
                        <th className="text-left pb-3 font-medium hidden lg:table-cell">
                          Date
                        </th>
                        <th className="text-right pb-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredJobs.map(job => (
                        <tr
                          key={job.id}
                          className="hover:bg-secondary/20 transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] flex-shrink-0">
                                {job.type === "image" ? (
                                  <Image className="w-4 h-4" />
                                ) : (
                                  <Video className="w-4 h-4" />
                                )}
                              </div>
                              <span className="truncate max-w-[120px] sm:max-w-[180px]">
                                {formatFile(job.originalFilename)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 hidden sm:table-cell capitalize text-muted-foreground">
                            {job.type}
                          </td>
                          <td className="py-3 pr-4 hidden md:table-cell">
                            <IntensityBadge intensity={job.intensity} />
                          </td>
                          <td className="py-3 pr-4">
                            <StatusBadge status={job.status} />
                          </td>
                          <td className="py-3 pr-4 hidden lg:table-cell text-muted-foreground text-xs">
                            {format(new Date(job.createdAt), "MMM d, HH:mm")}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {job.status === "completed" &&
                                job.processedUrl && (
                                  <a
                                    href={job.processedUrl}
                                    download={`humanized_${job.originalFilename}`}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
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
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="font-serif">Profile</CardTitle>
                <CardDescription>Your account information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-muted-foreground">Name</div>
                  <div>{user?.name ?? "—"}</div>
                  <div className="text-muted-foreground">Email</div>
                  <div>{user?.email ?? "—"}</div>
                  <div className="text-muted-foreground">Role</div>
                  <div className="capitalize">{user?.role}</div>
                  <div className="text-muted-foreground">Login method</div>
                  <div>{user?.loginMethod ?? "—"}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="font-serif">
                  Notification preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notif-jobs">Job completion</Label>
                    <p className="text-xs text-muted-foreground">
                      Toast when a job finishes processing.
                    </p>
                  </div>
                  <Switch id="notif-jobs" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle className="font-serif">Cursor</CardTitle>
                <CardDescription>
                  The premium custom cursor can be disabled in favour of the
                  native one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="cursor-toggle">Use custom cursor</Label>
                  <Switch
                    id="cursor-toggle"
                    defaultChecked={
                      typeof window !== "undefined" &&
                      localStorage.getItem("ag-cursor") !== "native"
                    }
                    onCheckedChange={checked => {
                      localStorage.setItem(
                        "ag-cursor",
                        checked ? "custom" : "native"
                      );
                      window.dispatchEvent(new Event("storage"));
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
