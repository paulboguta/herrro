"use client";

import * as React from "react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Filter,
	Search,
} from "lucide-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const transactionSchema = z.object({
	id: z.number(),
	date: z.string(),
	description: z.string(),
	category: z.string(),
	amount: z.number(),
	account: z.string(),
	status: z.string(),
});

type Transaction = z.infer<typeof transactionSchema>;

const columns: ColumnDef<Transaction>[] = [
	{
		accessorKey: "date",
		header: "Date",
		cell: ({ row }) => {
			const date = new Date(row.getValue("date"));
			return (
				<div className="font-medium">
					{date.toLocaleDateString("en-US", {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
					})}
				</div>
			);
		},
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row }) => (
			<div
				className="max-w-[200px] truncate"
				title={row.getValue("description")}
			>
				{row.getValue("description")}
			</div>
		),
	},
	{
		accessorKey: "category",
		header: "Category",
		cell: ({ row }) => (
			<Badge variant="outline" className="text-xs">
				{row.getValue("category")}
			</Badge>
		),
	},
	{
		accessorKey: "amount",
		header: () => <div className="text-right">Amount</div>,
		cell: ({ row }) => {
			const amount = Number.parseFloat(row.getValue("amount"));
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(amount);

			return (
				<div
					className={`text-right font-medium ${
						amount < 0
							? "text-red-600 dark:text-red-400"
							: "text-green-600 dark:text-green-400"
					}`}
				>
					{formatted}
				</div>
			);
		},
	},
	{
		accessorKey: "account",
		header: "Account",
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("account")}
			</div>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge
					variant={status === "Cleared" ? "default" : "secondary"}
					className="text-xs"
				>
					{status}
				</Badge>
			);
		},
	},
];

interface TransactionsTableProps {
	data: Transaction[];
}

export function TransactionsTable({ data }: TransactionsTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [globalFilter, setGlobalFilter] = React.useState("");

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: "includesString",
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			globalFilter,
		},
	});

	return (
		<div className="w-full">
			<div className="flex items-center justify-between px-4 py-4 lg:px-6">
				<div className="flex items-center space-x-2">
					<div className="relative">
						<Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search transactions..."
							value={globalFilter ?? ""}
							onChange={(event) => setGlobalFilter(String(event.target.value))}
							className="max-w-sm pl-8"
						/>
					</div>
					<Select
						value={
							(table.getColumn("category")?.getFilterValue() as string) ?? ""
						}
						onValueChange={(value: string) =>
							table
								.getColumn("category")
								?.setFilterValue(value === "all" ? "" : value)
						}
					>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							<SelectItem value="Income">Income</SelectItem>
							<SelectItem value="Food & Drink">Food & Drink</SelectItem>
							<SelectItem value="Shopping">Shopping</SelectItem>
							<SelectItem value="Transportation">Transportation</SelectItem>
							<SelectItem value="Entertainment">Entertainment</SelectItem>
							<SelectItem value="Utilities">Utilities</SelectItem>
							<SelectItem value="Investment">Investment</SelectItem>
							<SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
							<SelectItem value="Insurance">Insurance</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm">
							<Filter className="h-4 w-4" />
							View
							<ChevronDown className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value: boolean) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="mx-4 rounded-md border bg-card lg:mx-6 dark:bg-card">
				<Table>
					<TableHeader className="bg-sidebar dark:bg-sidebar">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No transactions found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 px-4 py-4 lg:px-6">
				<div className="flex-1 text-muted-foreground text-sm">
					{table.getFilteredRowModel().rows.length} transaction(s) total.
				</div>
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronsLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<ChevronsRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
