"use client";

import * as React from "react";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { api } from "@/trpc/react";
import { formatCurrency } from "@/lib/utils";

interface AccountChartProps {
  accountId: string;
}

const chartConfig = {
  balance: {
    label: "Balance",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function AccountChart({ accountId }: AccountChartProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Get account info for currency
  const { data: account } = api.account.getById.useQuery({ id: accountId });

  // Get transactions to build balance history
  const { data: transactions, isLoading } = api.transaction.getByAccount.useQuery(
    { accountId, limit: 100, offset: 0 },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    },
  );

  // Calculate balance history from transactions
  const balanceHistory = useMemo(() => {
    if (!transactions?.items || !account) return [];

    // Sort transactions by date (oldest first)
    const sortedTransactions = [...transactions.items].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Generate balance points
    const balancePoints: Array<{ date: string; balance: number }> = [];
    let currentBalance = Number.parseFloat(account.startingBalance);

    // Add starting point
    if (sortedTransactions.length > 0) {
      const firstDate = new Date(sortedTransactions[0].date);
      firstDate.setDate(firstDate.getDate() - 1);
      balancePoints.push({
        date: firstDate.toISOString().split("T")[0],
        balance: currentBalance,
      });
    }

    // Process each transaction
    sortedTransactions.forEach((transaction) => {
      const amount = Number.parseFloat(transaction.amount);
      if (transaction.type === "income") {
        currentBalance += amount;
      } else {
        currentBalance -= amount;
      }

      balancePoints.push({
        date: new Date(transaction.date).toISOString().split("T")[0],
        balance: currentBalance,
      });
    });

    // If no transactions, show current balance
    if (balancePoints.length === 0) {
      balancePoints.push({
        date: new Date().toISOString().split("T")[0],
        balance: Number.parseFloat(account.balance),
      });
    }

    return balancePoints;
  }, [transactions, account]);

  // Filter data based on time range
  const filteredData = balanceHistory.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  if (isLoading) {
    return (
      <Card className="@container/card bg-sidebar dark:bg-sidebar">
        <CardHeader>
          <CardTitle>Balance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!account || balanceHistory.length === 0) {
    return (
      <Card className="@container/card bg-sidebar dark:bg-sidebar">
        <CardHeader>
          <CardTitle>Balance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No transaction history available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card bg-sidebar dark:bg-sidebar">
      <CardHeader>
        <CardTitle>Balance History</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">Account balance over time</span>
          <span className="@[540px]/card:hidden">Balance Trend</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="*:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex @[767px]/card:hidden w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-balance)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-balance)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                  formatter={(value) => [formatCurrency(Number(value), account.currency), "Balance"]}
                />
              }
            />
            <Area dataKey="balance" type="natural" fill="url(#fillBalance)" stroke="var(--color-balance)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
