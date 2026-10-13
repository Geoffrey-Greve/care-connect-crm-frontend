import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Download, Search, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

type ViewType = "Staff" | "Client";

interface LogData {
  id: string;
  name: string;
  booked: number;
  pending: number;
  cancelled: number;
  total: number;
}

// Staff data
const staffLogData: LogData[] = [
  {
    id: "1",
    name: "Harrison",
    booked: 0,
    pending: 0,
    cancelled: 0,
    total: 0,
  },
];

// Client data
const clientLogData: LogData[] = [
  {
    id: "1",
    name: "Harrison",
    booked: 0,
    pending: 0,
    cancelled: 0,
    total: 0,
  },
];

// Staff chart data
const staffChartData = [
  { day: "Mon, 17 Nov", Booked: 2, Pending: 1, Cancelled: 0 },
  { day: "Tue, 18 Nov", Booked: 3, Pending: 0, Cancelled: 1 },
  { day: "Wed, 19 Nov", Booked: 1, Pending: 2, Cancelled: 0 },
  { day: "Thu, 20 Nov", Booked: 4, Pending: 1, Cancelled: 1 },
  { day: "Fri, 21 Nov", Booked: 2, Pending: 0, Cancelled: 0 },
  { day: "Sat, 22 Nov", Booked: 3, Pending: 1, Cancelled: 0 },
  { day: "Mon, 23 Nov", Booked: 2, Pending: 1, Cancelled: 0 },
];

// Client chart data
const clientChartData = [
  { day: "Mon, 17 Nov", Booked: 1, Pending: 2, Cancelled: 0 },
  { day: "Tue, 18 Nov", Booked: 2, Pending: 1, Cancelled: 1 },
  { day: "Wed, 19 Nov", Booked: 3, Pending: 0, Cancelled: 0 },
  { day: "Thu, 20 Nov", Booked: 1, Pending: 3, Cancelled: 0 },
  { day: "Fri, 21 Nov", Booked: 2, Pending: 1, Cancelled: 1 },
  { day: "Sat, 22 Nov", Booked: 4, Pending: 0, Cancelled: 0 },
  { day: "Mon, 23 Nov", Booked: 2, Pending: 2, Cancelled: 0 },
];

const serviceOptions = ["All", "Community Access", "Domestic Assistance", "Personal Care", "Night Shift"];
const periodOptions = ["Hours", "Amount"];

const chartConfig = {
  Booked: {
    label: "Booked",
    color: "#3b82f6",
  },
  Pending: {
    label: "Pending",
    color: "#10b981",
  },
  Cancelled: {
    label: "Cancelled",
    color: "#f97316",
  },
};

export default function LogReport() {
  const { toast } = useToast();
  const [viewType, setViewType] = useState<ViewType>("Staff");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("Hours");
  const [dateFrom, setDateFrom] = useState("2025-11-17");
  const [dateTo, setDateTo] = useState("2025-11-23");
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  // Get data based on view type
  const currentData = useMemo(() => {
    return viewType === "Staff" ? staffLogData : clientLogData;
  }, [viewType]);

  const currentChartData = useMemo(() => {
    return viewType === "Staff" ? staffChartData : clientChartData;
  }, [viewType]);

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

  const filteredData = useMemo(() => {
    let result = [...currentData];

    if (search) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (serviceFilter !== "All") {
      // Filter logic can be added here if service type is added to data
    }

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (sortField) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'booked':
            aValue = a.booked;
            bValue = b.booked;
            break;
          case 'pending':
            aValue = a.pending;
            bValue = b.pending;
            break;
          case 'cancelled':
            aValue = a.cancelled;
            bValue = b.cancelled;
            break;
          case 'total':
            aValue = a.total;
            bValue = b.total;
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
  }, [currentData, search, serviceFilter, sortField, sortDirection]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.total, 0);
  }, [filteredData]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredData, currentPage, entriesPerPage]);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your log report is being generated and will download shortly.",
    });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    toast({
      title: "Search Applied",
      description: "Filters have been applied to the report.",
    });
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Report</h1>
        <p className="text-muted-foreground">Track booked, pending, and cancelled logs by staff or client</p>
      </div>

      {/* Filter Section */}
      <div className="rounded-lg border bg-card p-4">
        <div className="space-y-4">
          {/* Radio Buttons */}
          <div className="flex items-center gap-6">
            <RadioGroup value={viewType} onValueChange={(value) => setViewType(value as ViewType)} className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Staff" id="view-staff" />
                <Label htmlFor="view-staff" className="cursor-pointer font-normal">Staff</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Client" id="view-client" />
                <Label htmlFor="view-client" className="cursor-pointer font-normal">Client</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[180px]">
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

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[120px]">
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

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[160px]"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[160px]"
            />

            <div className="flex-1" />

            <div className="text-sm font-semibold">
              Total {formatCurrency(totalAmount)}
            </div>

            <Button className="px-6" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" className="px-6 bg-primary text-primary-foreground" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            {/* Chart Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{viewType} Log Report Chart</h3>
              {/* Legend */}
              <div className="flex items-center gap-6 text-sm">
                <span className="font-medium">Mon, 17 Nov</span>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  <span>Cancelled</span>
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="h-[400px] w-full min-w-0">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={currentChartData} 
                    margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
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
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      width={60}
                      domain={[0, 'dataMax + 1']}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Booked" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Pending" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Cancelled" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
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
                <TableRow className="text-xs">
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      {viewType === "Staff" ? "Staff Name" : "Client Name"}
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('booked')}>
                    <div className="flex items-center gap-1">
                      Booked
                      {getSortIcon('booked')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('pending')}>
                    <div className="flex items-center gap-1">
                      Pending
                      {getSortIcon('pending')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('cancelled')}>
                    <div className="flex items-center gap-1">
                      Cancelled
                      {getSortIcon('cancelled')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('total')}>
                    <div className="flex items-center gap-1">
                      Total
                      {getSortIcon('total')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No data available in table
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{formatCurrency(item.booked)}</TableCell>
                      <TableCell>{formatCurrency(item.pending)}</TableCell>
                      <TableCell>{formatCurrency(item.cancelled)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || filteredData.length === 0}
              >
                Previous
              </Button>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={filteredData.length === 0}
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || filteredData.length === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

