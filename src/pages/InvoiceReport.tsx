import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Download, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

interface InvoiceReportItem {
  id: string;
  date: string;
  shift: string;
  client: string;
  area: string;
  status: "Booked" | "Invoiced" | "Pending" | "Cancelled";
}

const mockInvoiceReports: InvoiceReportItem[] = [
  {
    id: "1",
    date: "2025-11-17",
    shift: "Harrison",
    client: "INTERNAL_MEMBER",
    area: "",
    status: "Booked",
  },
  {
    id: "2",
    date: "2025-11-18",
    shift: "Morning",
    client: "John Doe",
    area: "Area A",
    status: "Invoiced",
  },
  {
    id: "3",
    date: "2025-11-19",
    shift: "Afternoon",
    client: "Jane Smith",
    area: "Area B",
    status: "Pending",
  },
  {
    id: "4",
    date: "2025-11-20",
    shift: "Evening",
    client: "Bob Johnson",
    area: "Area C",
    status: "Cancelled",
  },
  {
    id: "5",
    date: "2025-11-21",
    shift: "Harrison",
    client: "Alice Brown",
    area: "Area A",
    status: "Booked",
  },
];

// Generate chart data for the last 7 days
const generateChartData = () => {
  const days = ["Mon, 11 Nov", "Tue, 12 Nov", "Wed, 13 Nov", "Thu, 14 Nov", "Fri, 15 Nov", "Sat, 16 Nov", "Mon, 17 Nov"];
  return days.map((day, index) => ({
    day,
    Booked: Math.floor(Math.random() * 5000) + 1000,
    Invoiced: Math.floor(Math.random() * 4000) + 800,
    Pending: Math.floor(Math.random() * 3000) + 500,
    Cancelled: Math.floor(Math.random() * 1000) + 100,
  }));
};

const chartData = generateChartData();

const chartConfig = {
  Booked: {
    label: "Booked",
    color: "#3b82f6", // Blue
  },
  Invoiced: {
    label: "Invoiced",
    color: "#10b981", // Green
  },
  Pending: {
    label: "Pending",
    color: "#f97316", // Orange
  },
  Cancelled: {
    label: "Cancelled",
    color: "#ef4444", // Red
  },
};

export default function InvoiceReport() {
  const { toast } = useToast();
  const [reports] = useState<InvoiceReportItem[]>(mockInvoiceReports);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedDateFrom, setSelectedDateFrom] = useState<Date>(new Date(2025, 10, 11)); // Nov 11, 2025
  const [selectedDateTo, setSelectedDateTo] = useState<Date>(new Date(2025, 10, 24)); // Nov 24, 2025

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col">
          <ChevronUp className="h-3 w-3 opacity-30" />
          <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
        </div>
      );
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Filter and sort reports
  const filteredAndSortedReports = useMemo(() => {
    let result = [...reports];

    // Apply search filter
    if (search) {
      result = result.filter(
        (report) =>
          report.shift.toLowerCase().includes(search.toLowerCase()) ||
          report.client.toLowerCase().includes(search.toLowerCase()) ||
          report.area.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "All") {
      result = result.filter((report) => report.status === filterStatus);
    }

    // Apply date range filter
    if (selectedDateFrom) {
      result = result.filter((report) => {
        const reportDate = new Date(report.date);
        return reportDate >= selectedDateFrom;
      });
    }
    if (selectedDateTo) {
      result = result.filter((report) => {
        const reportDate = new Date(report.date);
        return reportDate <= selectedDateTo;
      });
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case 'date':
            aValue = a.date;
            bValue = b.date;
            break;
          case 'shift':
            aValue = a.shift;
            bValue = b.shift;
            break;
          case 'client':
            aValue = a.client;
            bValue = b.client;
            break;
          case 'area':
            aValue = a.area;
            bValue = b.area;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return result;
  }, [reports, search, filterStatus, selectedDateFrom, selectedDateTo, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedReports.length / entriesPerPage);
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredAndSortedReports.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredAndSortedReports, currentPage, entriesPerPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      Booked: "bg-blue-100 text-blue-800 border-blue-200",
      Invoiced: "bg-green-100 text-green-800 border-green-200",
      Pending: "bg-orange-100 text-orange-800 border-orange-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"}`}
      >
        {status}
      </span>
    );
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your invoice report is being generated and will download shortly.",
    });
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const invoiced = filteredAndSortedReports.filter((r) => r.status === "Invoiced").length;
    const booked = filteredAndSortedReports.filter((r) => r.status === "Booked").length;
    const cancelled = filteredAndSortedReports.filter((r) => r.status === "Cancelled").length;
    const pending = filteredAndSortedReports.filter((r) => r.status === "Pending").length;

    return {
      invoiced,
      booked,
      cancelled,
      pending,
    };
  }, [filteredAndSortedReports]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoice Report</h1>
        <p className="text-muted-foreground">Monitor booked, invoiced, pending, and cancelled activity.</p>
      </div>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">INVOICED</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.invoiced * 1000)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BOOKED</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.booked * 1000)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CANCELLED</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.cancelled * 1000)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PENDING</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.pending * 1000)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Invoiced">Invoiced</SelectItem>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !selectedDateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDateFrom ? format(selectedDateFrom, "dd/MM/yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDateFrom}
                    onSelect={setSelectedDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !selectedDateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDateTo ? format(selectedDateTo, "dd/MM/yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDateTo}
                    onSelect={setSelectedDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1" />

            <Button className="bg-primary text-primary-foreground">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Chart Header merged into chart area */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Invoice Report Chart</h3>
              {/* Legend */}
              <div className="flex items-center gap-6 text-sm">
                <span className="font-medium">Mon, 17 Nov</span>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Invoiced</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span>Cancelled</span>
                </div>
              </div>
            </div>
            
            {/* Chart with increased height */}
            <div className="h-[450px] w-full min-w-0">
              <ChartContainer config={chartConfig} className="w-full h-full">
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
                    <Bar dataKey="Invoiced" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pending" fill="#f97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
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
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Search:</Label>
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-[200px]"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-2">
                      Date
                      {getSortIcon('date')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('shift')}>
                    <div className="flex items-center gap-2">
                      Shift
                      {getSortIcon('shift')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('client')}>
                    <div className="flex items-center gap-2">
                      Client
                      {getSortIcon('client')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('area')}>
                    <div className="flex items-center gap-2">
                      Area
                      {getSortIcon('area')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No records found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{formatDate(report.date)}</TableCell>
                      <TableCell className="font-medium">{report.shift}</TableCell>
                      <TableCell>{report.client}</TableCell>
                      <TableCell>{report.area || "-"}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, filteredAndSortedReports.length)} of {filteredAndSortedReports.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
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
