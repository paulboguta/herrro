"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { type PortfolioData, filterDataByPeriod, needsYearData, requiresServerData } from "@/lib/chart-utils";
import { api } from "@/trpc/react";
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

const PERIOD_OPTIONS = [
  { value: "1D", label: "1D" },
  { value: "WTD", label: "WTD" },
  { value: "7D", label: "7D" },
  { value: "MTD", label: "MTD" },
  { value: "30D", label: "30D" },
  { value: "90D", label: "90D" },
  { value: "YTD", label: "YTD" },
  { value: "365D", label: "365D" },
  { value: "5Y", label: "5Y" },
  { value: "MAX", label: "MAX" },
] as const;

const PERIOD_LABELS = {
  "1D": "vs yesterday",
  WTD: "vs start of week",
  "7D": "vs 7 days ago",
  MTD: "vs start of month",
  "30D": "vs 30 days ago",
  "90D": "vs 90 days ago",
  YTD: "vs start of year",
  "365D": "vs 365 days ago",
  "5Y": "vs 5 years ago",
  MAX: "vs all time low",
} as const;

type TimePeriod = (typeof PERIOD_OPTIONS)[number]["value"];

const chartConfig = {
  total: {
    label: "Total Portfolio",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const getChartColor = (isPositive: boolean) => {
  return isPositive ? "var(--chart-positive)" : "var(--chart-negative)";
};

type ActiveProperty = keyof typeof chartConfig;

const buildDomain = (values: number[]) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  // If range is very small, create more generous padding to center the line
  if (range < max * 0.1) {
    const centerPadding = max * 0.3; // 30% padding above and below
    return [min - centerPadding, max + centerPadding];
  }

  // For normal ranges, use standard padding
  const pad = range * 0.2; // 20% padding
  return [min - pad, max + pad];
};

export function NetworthChart() {
  const [activeProperty, setActiveProperty] = React.useState<ActiveProperty | null>(null);
  const [selectedPeriod, setSelectedPeriod] = React.useState<TimePeriod>("30D");

  // Strategy: 30D blocking, 365D non-blocking prefetch, >365D on-demand
  const shouldFetchFromServer = requiresServerData(selectedPeriod);
  const needsYear = needsYearData(selectedPeriod);

  // 1. BLOCKING: 30D data for immediate display (includes shorter periods)
  const {
    data: monthData,
    isLoading: isMonthLoading,
    error: monthError,
  } = api.portfolio.getDailyChartData.useQuery(
    { period: "30D" },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    },
  );

  // 2. NON-BLOCKING: 365D data prefetch for longer periods
  const {
    data: yearData,
    isLoading: isYearLoading,
    error: yearError,
  } = api.portfolio.getDailyChartData.useQuery(
    { period: "365D" },
    {
      enabled: monthData !== undefined, // Only start after 30D loads
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    },
  );

  // 3. ON-DEMAND: >365D periods (5Y/MAX)
  const {
    data: serverData,
    isLoading: isServerLoading,
    error: serverError,
  } = api.portfolio.getDailyChartData.useQuery({ period: selectedPeriod }, { enabled: shouldFetchFromServer });

  // Smart data selection and filtering
  const portfolioData = React.useMemo(() => {
    if (shouldFetchFromServer) {
      return serverData;
    }

    // For periods needing year data, use 365D if available, fallback to 30D
    if (needsYear) {
      const sourceData = yearData || monthData;
      if (!sourceData) return null;

      if (selectedPeriod === "365D") {
        return yearData || filterDataByPeriod(sourceData, selectedPeriod);
      }

      return filterDataByPeriod(sourceData, selectedPeriod);
    }

    // For shorter periods (<= 30D), use 30D data
    if (!monthData) return null;

    if (selectedPeriod === "30D") {
      return monthData;
    }

    return filterDataByPeriod(monthData, selectedPeriod);
  }, [monthData, yearData, serverData, selectedPeriod, shouldFetchFromServer, needsYear]);

  // Loading logic: Only show loading for initial 30D fetch or server data
  const isLoading = isMonthLoading || (shouldFetchFromServer && isServerLoading);
  const error = monthError || serverError || (needsYear && yearError);

  // Never show loading state - always show chart with whatever data we have
  const showChartLoading = false;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm">Net Worth</div>
              <div className="font-light text-3xl">Error</div>
              <div className="text-red-600 text-sm">Failed to load portfolio data</div>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Get data with fallbacks - show immediately if available
  const chartData = portfolioData?.data || [];

  // Clean default values - just show $0.00 normally
  const summary = portfolioData?.summary || {
    currentValue: 0,
    periodChange: 0,
    periodChangePercent: 0,
    isPositive: true, // Default to positive to avoid red color on load
  };

  // Calculate dynamic Y-axis domain for better scaling
  const totalDomain = chartData.length > 0 ? buildDomain(chartData.map((d) => d.total)) : [0, 100]; // Default domain when no data

  // Use summary data from the API
  const { currentValue, periodChange, periodChangePercent, isPositive } = summary;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground text-sm">Net Worth</div>
            </div>
            <div className="font-medium text-3xl">
              {portfolioData ? `$${currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : <></>}
            </div>
            {portfolioData && (
              <div
                className={`flex items-center gap-1 font-mono text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}
              >
                <span>
                  {isPositive ? "+" : ""}
                  {Math.abs(periodChange).toLocaleString("en-US", { minimumFractionDigits: 2 })}$
                </span>
                {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span>({Math.abs(periodChangePercent).toFixed(1)}%)</span>
                <span className="ml-1 text-muted-foreground">
                  {PERIOD_LABELS[selectedPeriod] || "vs start of period"}
                </span>
              </div>
            )}
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden p-0">
        {showChartLoading ? (
          <div className="h-64 w-full animate-pulse rounded bg-muted" />
        ) : (
          <div className="-mx-1 relative overflow-hidden">
            <ChartContainer config={chartConfig} className="h-64 w-[calc(100%+8px)]">
              <AreaChart accessibilityLayer data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  interval={0}
                  tick={(props) => {
                    const { x, y, payload, index } = props;
                    if (index === 0 || index === chartData.length - 1) {
                      return (
                        <text
                          x={index === 0 ? 24 : x - 36}
                          y={y + 4}
                          textAnchor={index === 0 ? "start" : "end"}
                          fontSize={12}
                          fill="currentColor"
                        >
                          {payload.value}
                        </text>
                      );
                    }
                    return null;
                  }}
                />
                <YAxis domain={totalDomain} hide={true} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getChartColor(isPositive)} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={getChartColor(isPositive)} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  onMouseEnter={() => setActiveProperty("total")}
                  onMouseLeave={() => setActiveProperty(null)}
                  dataKey="total"
                  type="linear"
                  fill="url(#area-gradient)"
                  stroke={getChartColor(isPositive)}
                  strokeWidth={3}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
