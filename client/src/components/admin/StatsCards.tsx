import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Counter } from "@/components/visual/Counter";
import { Reveal } from "@/components/visual/Reveal";
import { Users, FileImage, Activity, UserPlus } from "lucide-react";
import type { ReactNode } from "react";

interface Stat {
  label: string;
  value: number;
  icon: ReactNode;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

interface StatsCardsProps {
  stats:
    | {
        totalUsers: number;
        totalJobs: number;
        jobsToday: number;
        newUsersToday: number;
      }
    | undefined;
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;
  const cards: Stat[] = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="size-5 text-[#F5A623]" />,
    },
    {
      label: "Total Jobs",
      value: stats.totalJobs,
      icon: <FileImage className="size-5 text-[#4F8EF7]" />,
    },
    {
      label: "Jobs Today",
      value: stats.jobsToday,
      icon: <Activity className="size-5 text-[#F5A623]" />,
    },
    {
      label: "New Users Today",
      value: stats.newUsersToday,
      icon: <UserPlus className="size-5 text-[#4F8EF7]" />,
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((c, i) => (
        <Reveal key={c.label} delay={i * 0.06}>
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.label}
              </CardTitle>
              {c.icon}
            </CardHeader>
            <CardContent>
              <div className="font-serif text-3xl">
                <Counter
                  to={c.value}
                  prefix={c.prefix}
                  suffix={c.suffix}
                  decimals={c.decimals ?? 0}
                />
              </div>
            </CardContent>
          </Card>
        </Reveal>
      ))}
    </div>
  );
}
