import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, TrendingUp } from "lucide-react";
import type { Customer } from "@/types/customer";

interface StatsCardsProps {
  customers: Customer[];
}

export function StatsCards({ customers }: StatsCardsProps) {
  const total = customers.length;
  const active = customers.filter((c) => c.status === "active").length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = customers.filter(
    (c) => new Date(c.created_at) >= startOfMonth
  ).length;

  const leads = customers.filter(
    (c) => c.status === "lead" || c.status === "prospect"
  ).length;

  const stats = [
    {
      title: "Total Customers",
      value: total,
      icon: Users,
      description: "All time",
    },
    {
      title: "Active",
      value: active,
      icon: UserCheck,
      description: "Currently active",
    },
    {
      title: "New This Month",
      value: newThisMonth,
      icon: UserPlus,
      description: "Added this month",
    },
    {
      title: "Pipeline",
      value: leads,
      icon: TrendingUp,
      description: "Leads & prospects",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
