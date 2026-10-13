import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, Download, RefreshCw, Search } from "lucide-react";
import { mockStaff } from "./StaffDetail";
import { format } from "date-fns";

interface TimesheetEntry {
  id: string;
  date: string;
  shift: string;
  clients: string;
  startTime: string;
  finishTime: string;
  hours: string;
  isSplitShift: boolean;
  sShiftStart?: string;
  sShiftEnd?: string;
  splitHours?: string;
  totalHours: string;
  kilometers?: number;
  expense?: number;
  allowances?: string;
}

// Mock timesheet data
const mockTimesheetData: TimesheetEntry[] = [];

type SortField = 'date' | 'shift' | 'clients' | 'startTime' | 'finishTime' | 'hours' | 'isSplitShift' | 'sShiftStart' | 'sShiftEnd' | 'splitHours' | 'totalHours' | 'kilometers' | 'expense' | 'allowances';
type SortDirection = 'asc' | 'desc' | null;

export default function Timesheet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("2025-10-17");
  const [endDate, setEndDate] = useState("2025-12-17");
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const staff = mockStaff.find(s => s.id === id);
  const staffName = staff?.fullName || "Harrison";

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col">
          <ChevronUp className="h-3 w-3 text-muted-foreground opacity-50" />
          <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50 -mt-1" />
        </div>
      );
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    );
  };

  // Filter and sort timesheet data
  const filteredAndSortedData = useMemo(() => {
    let result = [...mockTimesheetData];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(entry =>
        entry.date.toLowerCase().includes(searchLower) ||
        entry.shift.toLowerCase().includes(searchLower) ||
        entry.clients.toLowerCase().includes(searchLower) ||
        entry.startTime.toLowerCase().includes(searchLower) ||
        entry.finishTime.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number | boolean;
        let bValue: string | number | boolean;

        switch (sortField) {
          case 'date':
            aValue = a.date;
            bValue = b.date;
            break;
          case 'shift':
            aValue = a.shift;
            bValue = b.shift;
            break;
          case 'clients':
            aValue = a.clients;
            bValue = b.clients;
            break;
          case 'startTime':
            aValue = a.startTime;
            bValue = b.startTime;
            break;
          case 'finishTime':
            aValue = a.finishTime;
            bValue = b.finishTime;
            break;
          case 'hours':
            aValue = parseFloat(a.hours) || 0;
            bValue = parseFloat(b.hours) || 0;
            break;
          case 'isSplitShift':
            aValue = a.isSplitShift ? 1 : 0;
            bValue = b.isSplitShift ? 1 : 0;
            break;
          case 'sShiftStart':
            aValue = a.sShiftStart || '';
            bValue = b.sShiftStart || '';
            break;
          case 'sShiftEnd':
            aValue = a.sShiftEnd || '';
            bValue = b.sShiftEnd || '';
            break;
          case 'splitHours':
            aValue = parseFloat(a.splitHours || '0') || 0;
            bValue = parseFloat(b.splitHours || '0') || 0;
            break;
          case 'totalHours':
            aValue = parseFloat(a.totalHours) || 0;
            bValue = parseFloat(b.totalHours) || 0;
            break;
          case 'kilometers':
            aValue = a.kilometers || 0;
            bValue = b.kilometers || 0;
            break;
          case 'expense':
            aValue = a.expense || 0;
            bValue = b.expense || 0;
            break;
          case 'allowances':
            aValue = a.allowances || '';
            bValue = b.allowances || '';
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
  }, [mockTimesheetData, search, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  // Calculate total hours
  const totalHours = useMemo(() => {
    const total = filteredAndSortedData.reduce((sum, entry) => {
      const hours = parseFloat(entry.totalHours) || 0;
      return sum + hours;
    }, 0);
    const hrs = Math.floor(total);
    const mins = Math.round((total - hrs) * 60);
    return { hrs, mins };
  }, [filteredAndSortedData]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold ml-6 mt-6">Timeline Sheet</h1>
      <div className="space-y-6 p-6 bg-white m-6 rounded-lg border">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-blue-600">{staffName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[150px]"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </Button>

          </div>
        </div>

        {/* Controls Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">Show</span>
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
            <span className="text-sm">entries</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Search:</span>
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-[250px]"
            />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                    <TableHead className="cursor-pointer" onClick={() => handleSort('clients')}>
                      <div className="flex items-center gap-2">
                        Clients
                        {getSortIcon('clients')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('startTime')}>
                      <div className="flex items-center gap-2">
                        Start Time
                        {getSortIcon('startTime')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('finishTime')}>
                      <div className="flex items-center gap-2">
                        Finish Time
                        {getSortIcon('finishTime')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('hours')}>
                      <div className="flex items-center gap-2">
                        Hours
                        {getSortIcon('hours')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('isSplitShift')}>
                      <div className="flex items-center gap-2">
                        Is Split Shift
                        {getSortIcon('isSplitShift')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('sShiftStart')}>
                      <div className="flex items-center gap-2">
                        S-Shift Start
                        {getSortIcon('sShiftStart')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('sShiftEnd')}>
                      <div className="flex items-center gap-2">
                        S-Shift End
                        {getSortIcon('sShiftEnd')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('splitHours')}>
                      <div className="flex items-center gap-2">
                        Split Hours
                        {getSortIcon('splitHours')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('totalHours')}>
                      <div className="flex items-center gap-2">
                        Total Hours
                        {getSortIcon('totalHours')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('kilometers')}>
                      <div className="flex items-center gap-2">
                        Kilometers
                        {getSortIcon('kilometers')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('expense')}>
                      <div className="flex items-center gap-2">
                        Expense
                        {getSortIcon('expense')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('allowances')}>
                      <div className="flex items-center gap-2">
                        Allowances
                        {getSortIcon('allowances')}
                      </div>
                    </TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                        No data available in table
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell>{entry.shift}</TableCell>
                        <TableCell>{entry.clients}</TableCell>
                        <TableCell>{entry.startTime}</TableCell>
                        <TableCell>{entry.finishTime}</TableCell>
                        <TableCell>{entry.hours}</TableCell>
                        <TableCell>{entry.isSplitShift ? "Yes" : "No"}</TableCell>
                        <TableCell>{entry.sShiftStart || "-"}</TableCell>
                        <TableCell>{entry.sShiftEnd || "-"}</TableCell>
                        <TableCell>{entry.splitHours || "-"}</TableCell>
                        <TableCell>{entry.totalHours}</TableCell>
                        <TableCell>{entry.kilometers || "-"}</TableCell>
                        <TableCell>{entry.expense ? `$${entry.expense.toFixed(2)}` : "-"}</TableCell>
                        <TableCell>{entry.allowances || "-"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Section */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Total: {totalHours.hrs} hrs {totalHours.mins} mins
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {filteredAndSortedData.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} entries
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

