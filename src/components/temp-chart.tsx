"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import chartDataSets from "./temp.json";

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
  const pad = (max - min) * 0.1 || min * 0.1; // 10 % or at least 0.5 %
  return [min - pad, max + pad];
};

export function AnimatedHatchedPatternAreaChart() {
  const [activeProperty, setActiveProperty] = React.useState<ActiveProperty | null>(null);
  const [selectedPeriod, setSelectedPeriod] = React.useState<TimePeriod>("YTD");

  // For now, fallback to existing data structure until we update all periods
  const chartData = chartDataSets["12m"] || chartDataSets[selectedPeriod as keyof typeof chartDataSets];

  // Calculate dynamic Y-axis domain for better scaling
  const totalDomain = buildDomain(chartData.map((d) => d.total));

  // Calculate current value and period change
  const currentValue = chartData[chartData.length - 1]?.total || 0;
  const startValue = chartData[0]?.total || 0;
  const periodChange = currentValue - startValue;
  const periodChangePercent = startValue !== 0 ? (periodChange / startValue) * 100 : 0;
  const isPositive = periodChange >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="text-muted-foreground text-sm">Net Worth</div>
            <div className="font-medium text-3xl">
              ${currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
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
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-96 w-full">
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              tick={(props) => {
                const { x, y, payload, index } = props;
                if (index === 0 || index === chartData.length - 1) {
                  return (
                    <text x={x} y={y + 4} textAnchor={index === 0 ? "start" : "end"} fontSize={12} fill="currentColor">
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
              <HatchedBackgroundPattern config={chartConfig} />
              <linearGradient id="hatched-background-pattern-grad-total" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getChartColor(isPositive)} stopOpacity={0.4} />
                <stop offset="95%" stopColor={getChartColor(isPositive)} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              onMouseEnter={() => setActiveProperty("total")}
              onMouseLeave={() => setActiveProperty(null)}
              dataKey="total"
              type="linear"
              fill={
                activeProperty === "total"
                  ? "url(#hatched-background-pattern-total)"
                  : "url(#hatched-background-pattern-grad-total)"
              }
              stroke={getChartColor(isPositive)}
              strokeWidth={1}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const HatchedBackgroundPattern = ({ config }: { config: ChartConfig }) => {
  const items = Object.fromEntries(Object.entries(config).map(([key, value]) => [key, value.color]));
  return (
    <>
      {Object.entries(items).map(([key, value]) => (
        <pattern
          key={key}
          id={`hatched-background-pattern-${key}`}
          x="0"
          y="0"
          width="6.81"
          height="6.81"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
          overflow="visible"
        >
          <g overflow="visible" className="will-change-transform">
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="6 0"
              dur="1s"
              repeatCount="indefinite"
            />
            <rect width="10" height="10" opacity={0.05} fill={value} />
            <rect width="1" height="10" fill={value} />
          </g>
        </pattern>
      ))}
    </>
  );
};
