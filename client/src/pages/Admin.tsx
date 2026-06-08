import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCards } from "@/components/admin/StatsCards";
import { UsersTable } from "@/components/admin/UsersTable";
import { JobsTable } from "@/components/admin/JobsTable";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { Loader2, ShieldAlert } from "lucide-react";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const stats = trpc.admin.stats.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="container py-20 max-w-md mx-auto text-center">
        <ShieldAlert className="size-12 text-amber-500 mx-auto mb-4" />
        <h1 className="font-serif text-2xl mb-2">Access denied</h1>
        <p className="text-muted-foreground">Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="container py-10 max-w-7xl">
        <div className="mb-8">
          <h1 className="font-serif text-4xl">
            <span className="text-gold">Admin</span> Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            System-wide statistics, user management, and revenue.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsCards stats={stats.data} />
            <Card className="glass">
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Switch to the Jobs tab for a paginated view of all recent
                  activity.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UsersTable />
          </TabsContent>
          <TabsContent value="jobs">
            <JobsTable />
          </TabsContent>
          <TabsContent value="revenue">
            <RevenueChart />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
