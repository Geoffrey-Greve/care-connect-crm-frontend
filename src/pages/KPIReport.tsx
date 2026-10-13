import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KPIReportData {
  id: string;
  kpiName: string;
  category: string;
  value: string | number;
  target: string | number;
  status: "met" | "not-met" | "pending";
  date: string;
  staffName?: string;
  notes?: string;
}

// Mock KPI report data
const mockKPIReportData: KPIReportData[] = [
  {
    id: "KPI-001",
    kpiName: "Client Satisfaction Score",
    category: "Client Services",
    value: 4.5,
    target: 4.0,
    status: "met",
    date: "2025-11-17",
    staffName: "Harrison",
    notes: "Excellent feedback from clients this month",
  },
  {
    id: "KPI-002",
    kpiName: "On-Time Arrival Rate",
    category: "Operations",
    value: "92%",
    target: "90%",
    status: "met",
    date: "2025-11-17",
    staffName: "John Smith",
  },
  {
    id: "KPI-003",
    kpiName: "Documentation Completion",
    category: "Compliance",
    value: "85%",
    target: "95%",
    status: "not-met",
    date: "2025-11-18",
    staffName: "Sarah Johnson",
    notes: "Need to improve documentation timeliness",
  },
  {
    id: "KPI-004",
    kpiName: "Training Hours Completed",
    category: "Workforce",
    value: 24,
    target: 20,
    status: "met",
    date: "2025-11-19",
    staffName: "Mike Chen",
  },
  {
    id: "KPI-005",
    kpiName: "Service Hours Delivered",
    category: "Operations",
    value: "94%",
    target: "90%",
    status: "met",
    date: "2025-11-20",
    staffName: "Emma Davis",
  },
  {
    id: "KPI-006",
    kpiName: "Attendance Rate",
    category: "Workforce",
    value: "96%",
    target: "95%",
    status: "met",
    date: "2025-11-21",
    staffName: "Harrison",
  },
  {
    id: "KPI-007",
    kpiName: "Response Time",
    category: "Operations",
    value: "2.4h",
    target: "2.0h",
    status: "not-met",
    date: "2025-11-22",
    staffName: "John Smith",
    notes: "Slightly above target, needs improvement",
  },
  {
    id: "KPI-008",
    kpiName: "Funding Utilisation",
    category: "Financial",
    value: "87%",
    target: "85%",
    status: "met",
    date: "2025-11-23",
    staffName: "Sarah Johnson",
  },
  {
    id: "KPI-009",
    kpiName: "Staff Availability",
    category: "Workforce",
    value: "92%",
    target: "90%",
    status: "met",
    date: "2025-11-17",
    staffName: "Mike Chen",
  },
  {
    id: "KPI-010",
    kpiName: "Incident Resolution Rate",
    category: "Compliance",
    value: "88%",
    target: "90%",
    status: "not-met",
    date: "2025-11-18",
    staffName: "Emma Davis",
    notes: "Below target, review processes",
  },
];

export default function KPIReport() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("2025-11-17");
  const [endDate, setEndDate] = useState("2025-11-23");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

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
    let result = [...mockKPIReportData];

    // Filter by date range
    result = result.filter((item) => {
      return item.date >= startDate && item.date <= endDate;
    });

    // Sort data
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case 'kpiName':
            aValue = a.kpiName;
            bValue = b.kpiName;
            break;
          case 'category':
            aValue = a.category;
            bValue = b.category;
            break;
          case 'value':
            aValue = a.value;
            bValue = b.value;
            break;
          case 'target':
            aValue = a.target;
            bValue = b.target;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'date':
            aValue = a.date;
            bValue = b.date;
            break;
          case 'staffName':
            aValue = a.staffName || '';
            bValue = b.staffName || '';
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
  }, [startDate, endDate, sortField, sortDirection]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "met":
        return (
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-green-100 text-green-800 border-green-200">
            Met
          </span>
        );
      case "not-met":
        return (
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-red-100 text-red-800 border-red-200">
            Not Met
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your KPI report is being generated and will download shortly.",
    });
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredData.length;
    const met = filteredData.filter((item) => item.status === "met").length;
    const notMet = filteredData.filter((item) => item.status === "not-met").length;
    const pending = filteredData.filter((item) => item.status === "pending").length;
    const successRate = total > 0 ? ((met / total) * 100).toFixed(1) : "0.0";

    return { total, met, notMet, pending, successRate };
  }, [filteredData]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">KPI Report</h1>
        <p className="text-muted-foreground">Comprehensive view of all Key Performance Indicators</p>
      </div>

      {/* Filter Section */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[180px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[180px]"
            />
          </div>
          <div className="flex-1" />
          <Button variant="outline" className="px-6 bg-primary text-primary-foreground" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Total KPIs</div>
          <div className="text-2xl font-bold mt-1">{summaryStats.total}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Met</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{summaryStats.met}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Not Met</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{summaryStats.notMet}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{summaryStats.pending}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Success Rate</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{summaryStats.successRate}%</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1">
                      Date
                      {getSortIcon('date')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('kpiName')}>
                    <div className="flex items-center gap-1">
                      KPI Name
                      {getSortIcon('kpiName')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                    <div className="flex items-center gap-1">
                      Category
                      {getSortIcon('category')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('staffName')}>
                    <div className="flex items-center gap-1">
                      Staff Name
                      {getSortIcon('staffName')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('value')}>
                    <div className="flex items-center gap-1">
                      Value
                      {getSortIcon('value')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('target')}>
                    <div className="flex items-center gap-1">
                      Target
                      {getSortIcon('target')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No KPI data available for the selected date range.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{formatDate(item.date)}</TableCell>
                      <TableCell className="font-medium">{item.kpiName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.staffName || "N/A"}</TableCell>
                      <TableCell>{item.value}</TableCell>
                      <TableCell>{item.target}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.notes || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

