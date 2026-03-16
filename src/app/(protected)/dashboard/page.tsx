import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Users, UserCheck, Activity, Plus, ArrowRight } from "lucide-react";
import type { Customer } from "@/types/customer";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-zinc-100 text-zinc-600 border-zinc-200",
  lead: "bg-blue-100 text-blue-800 border-blue-200",
  prospect: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch customers for stats
  const { data: customers = [] } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  const typedCustomers = (customers ?? []) as Customer[];

  const totalCustomers = typedCustomers.length;
  const activeCustomers = typedCustomers.filter((c) => c.status === "active").length;
  const recentCustomers = typedCustomers.slice(0, 5);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = typedCustomers.filter(
    (c) => new Date(c.created_at) >= startOfMonth
  ).length;

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: Users,
      description: "All time",
    },
    {
      title: "Active",
      value: activeCustomers,
      icon: UserCheck,
      description: "Currently active",
    },
    {
      title: "New This Month",
      value: newThisMonth,
      icon: Activity,
      description: "Added this month",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="font-semibold">
            {process.env.NEXT_PUBLIC_APP_NAME ?? "CRM"}
          </h1>
          <UserMenu />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          <p className="text-muted-foreground mt-1">
            Signed in as {user?.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
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

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/customers?action=new">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/customers">
              <Users className="h-4 w-4 mr-2" />
              View All Customers
            </Link>
          </Button>
        </div>

        {/* Recent Customers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Customers</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customers">
                View all
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No customers yet.{" "}
                      <Link href="/customers" className="underline">
                        Add your first one
                      </Link>
                      .
                    </TableCell>
                  </TableRow>
                ) : (
                  recentCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="hover:underline"
                        >
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.email ?? "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {customer.company ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            STATUS_STYLES[customer.status] ??
                            "bg-zinc-100 text-zinc-600 border-zinc-200"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
}
