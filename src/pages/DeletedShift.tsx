import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";

interface DeletedShift {
  id: string;
  serialNo: number;
  date: string;
  shift: string;
  clients: string;
  startTime: string;
  finishTime: string;
  hours: number;
  extraTime: number;
  distance: string;
  expense: number;
  allowances: number;
  status: string;
}

const mockDeletedShifts: DeletedShift[] = [
  {
    id: "1",
    serialNo: 1,
    date: "2025-11-17",
    shift: "Morning",
    clients: "John Smith",
    startTime: "08:00",
    finishTime: "12:00",
    hours: 4,
    extraTime: 0,
    distance: "15 km",
    expense: 25.50,
    allowances: 10.00,
    status: "Deleted",
  },
  {
    id: "2",
    serialNo: 2,
    date: "2025-11-18",
    shift: "Afternoon",
    clients: "Sarah Johnson",
    startTime: "13:00",
    finishTime: "17:00",
    hours: 4,
    extraTime: 0.5,
    distance: "20 km",
    expense: 30.00,
    allowances: 15.00,
    status: "Deleted",
  },
  {
    id: "3",
    serialNo: 3,
    date: "2025-11-19",
    shift: "Evening",
    clients: "Mike Chen",
    startTime: "18:00",
    finishTime: "22:00",
    hours: 4,
    extraTime: 0,
    distance: "12 km",
    expense: 20.00,
    allowances: 12.00,
    status: "Deleted",
  },
  {
    id: "4",
    serialNo: 4,
    date: "2025-11-20",
    shift: "Night",
    clients: "Emma Davis",
    startTime: "22:00",
    finishTime: "06:00",
    hours: 8,
    extraTime: 1,
    distance: "25 km",
    expense: 45.00,
    allowances: 20.00,
    status: "Deleted",
  },
  {
    id: "5",
    serialNo: 5,
    date: "2025-11-21",
    shift: "Morning",
    clients: "David Wilson",
    startTime: "07:00",
    finishTime: "11:00",
    hours: 4,
    extraTime: 0,
    distance: "18 km",
    expense: 28.00,
    allowances: 10.00,
    status: "Deleted",
  },
  {
    id: "6",
    serialNo: 6,
    date: "2025-11-22",
    shift: "Afternoon",
    clients: "Lisa Anderson",
    startTime: "14:00",
    finishTime: "18:00",
    hours: 4,
    extraTime: 0.5,
    distance: "22 km",
    expense: 35.00,
    allowances: 15.00,
    status: "Deleted",
  },
  {
    id: "7",
    serialNo: 7,
    date: "2025-11-23",
    shift: "Evening",
    clients: "Robert Brown",
    startTime: "19:00",
    finishTime: "23:00",
    hours: 4,
    extraTime: 0,
    distance: "16 km",
    expense: 26.00,
    allowances: 12.00,
    status: "Deleted",
  },
];

export default function DeletedShift() {
  const [data] = useState<DeletedShift[]>(mockDeletedShifts);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
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
    let result = [...data];

    if (search) {
      result = result.filter((item) =>
        item.clients.toLowerCase().includes(search.toLowerCase()) ||
        item.shift.toLowerCase().includes(search.toLowerCase()) ||
        item.date.includes(search)
      );
    }

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case 'serialNo':
            aValue = a.serialNo;
            bValue = b.serialNo;
            break;
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
            aValue = a.hours;
            bValue = b.hours;
            break;
          case 'extraTime':
            aValue = a.extraTime;
            bValue = b.extraTime;
            break;
          case 'distance':
            aValue = parseFloat(a.distance);
            bValue = parseFloat(b.distance);
            break;
          case 'expense':
            aValue = a.expense;
            bValue = b.expense;
            break;
          case 'allowances':
            aValue = a.allowances;
            bValue = b.allowances;
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
  }, [data, search, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / entriesPerPage));
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredData, currentPage, entriesPerPage]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deleted Shift</h1>
        <p className="text-muted-foreground">View and manage deleted shift records</p>
      </div>

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
                  <TableHead className="cursor-pointer" onClick={() => handleSort('serialNo')}>
                    <div className="flex items-center gap-1">
                      Serial No
                      {getSortIcon('serialNo')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1">
                      Date
                      {getSortIcon('date')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('shift')}>
                    <div className="flex items-center gap-1">
                      Shift
                      {getSortIcon('shift')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('clients')}>
                    <div className="flex items-center gap-1">
                      Clients
                      {getSortIcon('clients')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('startTime')}>
                    <div className="flex items-center gap-1">
                      Start Time
                      {getSortIcon('startTime')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('finishTime')}>
                    <div className="flex items-center gap-1">
                      Finish Time
                      {getSortIcon('finishTime')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('hours')}>
                    <div className="flex items-center gap-1">
                      Hours
                      {getSortIcon('hours')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('extraTime')}>
                    <div className="flex items-center gap-1">
                      Extra Time
                      {getSortIcon('extraTime')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('distance')}>
                    <div className="flex items-center gap-1">
                      Distance
                      {getSortIcon('distance')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('expense')}>
                    <div className="flex items-center gap-1">
                      Expense
                      {getSortIcon('expense')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('allowances')}>
                    <div className="flex items-center gap-1">
                      Allowances
                      {getSortIcon('allowances')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                      No data available in table
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.serialNo}</TableCell>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>{item.shift}</TableCell>
                      <TableCell>{item.clients}</TableCell>
                      <TableCell>{item.startTime}</TableCell>
                      <TableCell>{item.finishTime}</TableCell>
                      <TableCell>{item.hours}</TableCell>
                      <TableCell>{item.extraTime}</TableCell>
                      <TableCell>{item.distance}</TableCell>
                      <TableCell>{formatCurrency(item.expense)}</TableCell>
                      <TableCell>{formatCurrency(item.allowances)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-red-100 text-red-800 border-red-200">
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
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

