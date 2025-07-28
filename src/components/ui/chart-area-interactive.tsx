"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

const chartData = [
	{ date: "2024-04-01", cash: 25000, investments: 35000 },
	{ date: "2024-04-02", cash: 24800, investments: 35200 },
	{ date: "2024-04-03", cash: 25100, investments: 35800 },
	{ date: "2024-04-04", cash: 26200, investments: 36200 },
	{ date: "2024-04-05", cash: 25800, investments: 37200 },
	{ date: "2024-04-06", cash: 26500, investments: 37800 },
	{ date: "2024-04-07", cash: 25900, investments: 38100 },
	{ date: "2024-04-08", cash: 27200, investments: 38500 },
	{ date: "2024-04-09", cash: 26800, investments: 39200 },
	{ date: "2024-04-10", cash: 27500, investments: 39800 },
	{ date: "2024-04-11", cash: 28200, investments: 40200 },
	{ date: "2024-04-12", cash: 27800, investments: 40800 },
	{ date: "2024-04-13", cash: 28900, investments: 41200 },
	{ date: "2024-04-14", cash: 28500, investments: 41800 },
	{ date: "2024-04-15", cash: 29200, investments: 42200 },
	{ date: "2024-04-16", cash: 28800, investments: 42800 },
	{ date: "2024-04-17", cash: 30100, investments: 43200 },
	{ date: "2024-04-18", cash: 29800, investments: 43800 },
	{ date: "2024-04-19", cash: 30500, investments: 44200 },
	{ date: "2024-04-20", cash: 30200, investments: 44800 },
	{ date: "2024-04-21", cash: 31000, investments: 45200 },
	{ date: "2024-04-22", cash: 30800, investments: 45800 },
	{ date: "2024-04-23", cash: 31500, investments: 46200 },
	{ date: "2024-04-24", cash: 32200, investments: 46800 },
	{ date: "2024-04-25", cash: 31900, investments: 47200 },
	{ date: "2024-04-26", cash: 32500, investments: 47800 },
	{ date: "2024-04-27", cash: 33200, investments: 48200 },
	{ date: "2024-04-28", cash: 32900, investments: 48800 },
	{ date: "2024-04-29", cash: 33800, investments: 49200 },
	{ date: "2024-04-30", cash: 34200, investments: 49800 },
	{ date: "2024-05-01", cash: 34800, investments: 50200 },
	{ date: "2024-05-02", cash: 35200, investments: 50800 },
	{ date: "2024-05-03", cash: 34900, investments: 51200 },
	{ date: "2024-05-04", cash: 35800, investments: 51800 },
	{ date: "2024-05-05", cash: 36500, investments: 52200 },
	{ date: "2024-05-06", cash: 36200, investments: 52800 },
	{ date: "2024-05-07", cash: 36800, investments: 53200 },
	{ date: "2024-05-08", cash: 37200, investments: 53800 },
	{ date: "2024-05-09", cash: 36900, investments: 54200 },
	{ date: "2024-05-10", cash: 37800, investments: 54800 },
	{ date: "2024-05-11", cash: 38200, investments: 55200 },
	{ date: "2024-05-12", cash: 37900, investments: 55800 },
	{ date: "2024-05-13", cash: 38800, investments: 56200 },
	{ date: "2024-05-14", cash: 39200, investments: 56800 },
	{ date: "2024-05-15", cash: 39800, investments: 57200 },
	{ date: "2024-05-16", cash: 39500, investments: 57800 },
	{ date: "2024-05-17", cash: 40200, investments: 58200 },
	{ date: "2024-05-18", cash: 40500, investments: 58800 },
	{ date: "2024-05-19", cash: 40200, investments: 59200 },
	{ date: "2024-05-20", cash: 41000, investments: 59800 },
	{ date: "2024-05-21", cash: 40800, investments: 60200 },
	{ date: "2024-05-22", cash: 41500, investments: 60800 },
	{ date: "2024-05-23", cash: 42000, investments: 61200 },
	{ date: "2024-05-24", cash: 41800, investments: 61800 },
	{ date: "2024-05-25", cash: 42500, investments: 62200 },
	{ date: "2024-05-26", cash: 42200, investments: 62800 },
	{ date: "2024-05-27", cash: 43000, investments: 63200 },
	{ date: "2024-05-28", cash: 43200, investments: 63800 },
	{ date: "2024-05-29", cash: 42900, investments: 64200 },
	{ date: "2024-05-30", cash: 43800, investments: 64800 },
	{ date: "2024-05-31", cash: 44200, investments: 65200 },
	{ date: "2024-06-01", cash: 44800, investments: 65800 },
	{ date: "2024-06-02", cash: 45200, investments: 66200 },
	{ date: "2024-06-03", cash: 44900, investments: 66800 },
	{ date: "2024-06-04", cash: 45800, investments: 67200 },
	{ date: "2024-06-05", cash: 45500, investments: 67800 },
	{ date: "2024-06-06", cash: 46200, investments: 68200 },
	{ date: "2024-06-07", cash: 46800, investments: 68800 },
	{ date: "2024-06-08", cash: 46500, investments: 69200 },
	{ date: "2024-06-09", cash: 47200, investments: 69800 },
	{ date: "2024-06-10", cash: 46900, investments: 70200 },
	{ date: "2024-06-11", cash: 47800, investments: 70800 },
	{ date: "2024-06-12", cash: 48200, investments: 71200 },
	{ date: "2024-06-13", cash: 47900, investments: 71800 },
	{ date: "2024-06-14", cash: 48800, investments: 72200 },
	{ date: "2024-06-15", cash: 49200, investments: 72800 },
	{ date: "2024-06-16", cash: 48900, investments: 73200 },
	{ date: "2024-06-17", cash: 49800, investments: 73800 },
	{ date: "2024-06-18", cash: 49500, investments: 74200 },
	{ date: "2024-06-19", cash: 50200, investments: 74800 },
	{ date: "2024-06-20", cash: 50800, investments: 75200 },
	{ date: "2024-06-21", cash: 50500, investments: 75800 },
	{ date: "2024-06-22", cash: 51200, investments: 76200 },
	{ date: "2024-06-23", cash: 51800, investments: 76800 },
	{ date: "2024-06-24", cash: 51500, investments: 77200 },
	{ date: "2024-06-25", cash: 52200, investments: 77800 },
	{ date: "2024-06-26", cash: 52800, investments: 78200 },
	{ date: "2024-06-27", cash: 53200, investments: 78800 },
	{ date: "2024-06-28", cash: 52900, investments: 79200 },
	{ date: "2024-06-29", cash: 53800, investments: 79800 },
	{ date: "2024-06-30", cash: 54200, investments: 80200 },
];

const chartConfig = {
	cash: {
		label: "Cash",
		color: "hsl(var(--primary))",
	},
	investments: {
		label: "Investments",
		color: "hsl(142 71% 45%)",
	},
} satisfies ChartConfig;

export function ChartAreaInteractive() {
	const isMobile = useIsMobile();
	const [timeRange, setTimeRange] = React.useState("90d");

	React.useEffect(() => {
		if (isMobile) {
			setTimeRange("7d");
		}
	}, [isMobile]);

	const filteredData = chartData.filter((item) => {
		const date = new Date(item.date);
		const referenceDate = new Date("2024-06-30");
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

	return (
		<Card className="@container/card bg-sidebar dark:bg-sidebar">
			<CardHeader>
				<CardTitle>Portfolio Balance</CardTitle>
				<CardDescription>
					<span className="@[540px]/card:block hidden">
						Cash and investments over time
					</span>
					<span className="@[540px]/card:hidden">Cash vs Investments</span>
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
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full"
				>
					<AreaChart data={filteredData}>
						<defs>
							<linearGradient id="fillCash" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-cash)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-cash)"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient id="fillInvestments" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-investments)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-investments)"
									stopOpacity={0.1}
								/>
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
								/>
							}
						/>
						<Area
							dataKey="cash"
							type="natural"
							fill="url(#fillCash)"
							stroke="var(--color-cash)"
						/>
						<Area
							dataKey="investments"
							type="natural"
							fill="url(#fillInvestments)"
							stroke="var(--color-investments)"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
