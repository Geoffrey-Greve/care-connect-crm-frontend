import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PeriodOption = "Hours" | "Amount";

type SortField = "client" | "booked" | "pending" | "cancelled" | "total";

interface ValuationRow {
  id: string;
  client: string;
  serviceType: string;
  bookedHours: number;
  pendingHours: number;
  cancelledHours: number;
  bookedAmount: number;
  pendingAmount: number;
  cancelledAmount: number;
}

const serviceOptions = ["All", "Domestic Assistance", "Night Shift", "Personal Care", "Respite Care", "Sleepover"];
const periodOptions: PeriodOption[] = ["Hours", "Amount"];

const valuationRows: ValuationRow[] = [
  {
    id: "1",
    client: "INTERNAL_MEMBER",
    serviceType: "Domestic Assistance",
    bookedHours: 6,
    pendingHours: 2,
    cancelledHours: 1,
    bookedAmount: 420,
    pendingAmount: 110,
    cancelledAmount: 70,
  },
  {
    id: "2",
    client: "Sarah Johnson",
    serviceType: "Night Shift",
    bookedHours: 3,
    pendingHours: 1,
    cancelledHours: 0,
    bookedAmount: 360,
    pendingAmount: 120,
    cancelledAmount: 0,
  },
  {
    id: "3",
    client: "Michael Chen",
    serviceType: "Personal Care",
    bookedHours: 4,
    pendingHours: 0,
    cancelledHours: 2,
    bookedAmount: 280,
    pendingAmount: 0,
    cancelledAmount: 160,
  },
];

const chartData = [
  { day: "Mon, 11 Nov", Booked: 4, Pending: 2, Cancelled: 1 },
  { day: "Tue, 12 Nov", Booked: 3, Pending: 1, Cancelled: 0 },
  { day: "Wed, 13 Nov", Booked: 5, Pending: 0, Cancelled: 1 },
  { day: "Thu, 14 Nov", Booked: 6, Pending: 1, Cancelled: 0 },
  { day: "Fri, 15 Nov", Booked: 4, Pending: 2, Cancelled: 1 },
  { day: "Mon, 17 Nov", Booked: 2, Pending: 1, Cancelled: 0 },
];

const chartLegend = [
  { label: "Booked", color: "#3b82f6" },
  { label: "Pending", color: "#22c55e" },
  { label: "Cancelled", color: "#facc15" },
];

export default function ValuationReport() {
  const { toast } = useToast();
  const [serviceFilter, setServiceFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState<PeriodOption>("Hours");
  const [dateFrom, setDateFrom] = useState("2025-11-11");
  const [dateTo, setDateTo] = useState("2025-11-24");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const isHourView = periodFilter === "Hours";

  const filteredRows = useMemo(() => {
    let rows = [...valuationRows];

    if (serviceFilter !== "All") {
      rows = rows.filter((row) => row.serviceType === serviceFilter);
    }

    if (searchTerm) {
      rows = rows.filter((row) => row.client.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (sortField && sortDirection) {
      rows.sort((a, b) => {
        const getValue = (row: ValuationRow) => {
          switch (sortField) {
            case "client":
              return row.client;
            case "booked":
              return isHourView ? row.bookedHours : row.bookedAmount;
            case "pending":
              return isHourView ? row.pendingHours : row.pendingAmount;
            case "cancelled":
              return isHourView ? row.cancelledHours : row.cancelledAmount;
            case "total": {
              const total = isHourView
                ? row.bookedHours + row.pendingHours + row.cancelledHours
                : row.bookedAmount + row.pendingAmount + row.cancelledAmount;
              return total;
            }
            default:
              return 0;
          }
        };

        const aValue = getValue(a);
        const bValue = getValue(b);

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return rows;
  }, [serviceFilter, searchTerm, sortField, sortDirection, isHourView]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / entriesPerPage));
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredRows.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredRows, currentPage, entriesPerPage]);

  const summaryTotal = filteredRows.reduce((sum, row) => {
    const value = isHourView
      ? row.bookedHours + row.pendingHours + row.cancelledHours
      : row.bookedAmount + row.pendingAmount + row.cancelledAmount;
    return sum + value;
  }, 0);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your valuation report is being generated and will download shortly.",
    });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatValue = (value: number) => {
    if (isHourView) {
      return `${value.toFixed(1)}h`;
    }
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field || !sortDirection) {
      return (
        <span className="flex flex-col text-[10px] leading-none opacity-40">
          ↑
          ↓
        </span>
      );
    }

    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Valuation Report</h1>
        <p className="text-muted-foreground">Compare service performance by booked, pending, and cancelled records.</p>
      </div>

      <Card className="border border-muted">
        <CardContent className="space-y-6 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {serviceOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as PeriodOption)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />

            <div className="flex-1" />

            <Button className="rounded-full px-6">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" className="rounded-full px-6" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1">
              <div className="h-[450px] w-full min-w-0">
                <ChartContainer
                  config={{
                    Booked: { label: "Booked", color: "#3b82f6" },
                    Pending: { label: "Pending", color: "#22c55e" },
                    Cancelled: { label: "Cancelled", color: "#facc15" },
                  }}
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData} 
                      margin={{ top: 20, right: 20, left: 10, bottom: 0 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 12 }} width={60} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="Booked" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Pending" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Cancelled" fill="#facc15" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                {chartLegend.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col items-end justify-center rounded-lg border bg-muted/40 px-6 py-4 text-right text-lg font-semibold text-foreground/80 lg:w-[220px]">
              <span className="text-sm font-normal text-muted-foreground">Total</span>
              <span className="text-3xl font-bold text-foreground">{formatValue(summaryTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Show</span>
              <Select
                value={entriesPerPage.toString()}
                onValueChange={(value) => {
                  setEntriesPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>entries</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Label htmlFor="valuation-search">Search:</Label>
              <Input
                id="valuation-search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 w-[200px]"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("client")}>
                    <div className="flex items-center gap-2">
                      Name
                      {getSortIcon("client")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("booked")}>
                    <div className="flex items-center gap-2">
                      Booked
                      {getSortIcon("booked")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("pending")}>
                    <div className="flex items-center gap-2">
                      Pending
                      {getSortIcon("pending")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("cancelled")}>
                    <div className="flex items-center gap-2">
                      Cancelled
                      {getSortIcon("cancelled")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("total")}>
                    <div className="flex items-center gap-2">
                      Total
                      {getSortIcon("total")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.length ? (
                  paginatedRows.map((row) => {
                    const booked = isHourView ? row.bookedHours : row.bookedAmount;
                    const pending = isHourView ? row.pendingHours : row.pendingAmount;
                    const cancelled = isHourView ? row.cancelledHours : row.cancelledAmount;
                    const total = booked + pending + cancelled;

                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.client}</TableCell>
                        <TableCell>{formatValue(booked)}</TableCell>
                        <TableCell>{formatValue(pending)}</TableCell>
                        <TableCell>{formatValue(cancelled)}</TableCell>
                        <TableCell>{formatValue(total)}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No entries found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
              {Math.min(currentPage * entriesPerPage, filteredRows.length)} of {filteredRows.length} entries
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-md"
              >
                Previous
              </Button>
              <Button variant="default" size="sm" className="rounded-md px-4">
                {currentPage}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

