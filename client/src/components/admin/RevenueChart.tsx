import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

export function RevenueChart() {
  const q = trpc.admin.dailyRevenue.useQuery();

  if (q.isLoading)
    return <div className="text-muted-foreground p-8">Loading…</div>;
  if (!q.data) return null;

  const data = q.data.map(d => ({
    day: format(new Date(d.day), "MMM d"),
    revenueDollars: d.estimatedRevenueCents / 100,
    credits: d.credits,
  }));

  const total = data.reduce((acc, d) => acc + d.revenueDollars, 0);

  return (
    <Card className="glass gradient-border-animated">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">
          Revenue (last 30 days)
        </CardTitle>
        <CardDescription>
          Estimated total:{" "}
          <span className="text-gold font-semibold">${total.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                dataKey="day"
                stroke="rgba(255,255,255,0.5)"
                fontSize={11}
              />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "rgba(20,20,20,0.95)",
                  border: "1px solid rgba(245,166,35,0.3)",
                  borderRadius: 8,
                }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
              />
              <Bar
                dataKey="revenueDollars"
                fill="#F5A623"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
