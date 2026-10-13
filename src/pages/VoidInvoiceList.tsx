import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface VoidInvoice {
  id: string;
  invoiceNumber: string;
  to: string;
  amount: number;
  tax: number;
  balance: number;
  status: string;
  issuedDate: string;
}

const mockVoidInvoices: VoidInvoice[] = [
  {
    id: "VOID-001",
    invoiceNumber: "INV-2024-001",
    to: "Sarah Johnson",
    amount: 2850.00,
    tax: 285.00,
    balance: 3135.00,
    status: "Voided",
    issuedDate: "2024-01-01",
  },
  {
    id: "VOID-002",
    invoiceNumber: "INV-2024-002",
    to: "Robert Smith",
    amount: 1920.50,
    tax: 192.05,
    balance: 2112.55,
    status: "Voided",
    issuedDate: "2024-01-04",
  },
  {
    id: "VOID-003",
    invoiceNumber: "INV-2024-003",
    to: "Maria Garcia",
    amount: 3245.75,
    tax: 324.58,
    balance: 3570.33,
    status: "Voided",
    issuedDate: "2024-01-11",
  },
];

type SortField = 'invoiceNumber' | 'to' | 'amount' | 'tax' | 'balance' | 'status' | 'issuedDate';
type SortDirection = 'asc' | 'desc' | null;

export default function VoidInvoiceList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shiftDateFrom, setShiftDateFrom] = useState<string>("2025-11-04");
  const [shiftDateTo, setShiftDateTo] = useState<string>("2025-11-14");
  const [invoiceData, setInvoiceData] = useState<VoidInvoice[]>([]);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Filter, search, and sort invoice data
  const filteredAndSortedData = useMemo(() => {
    let result = [...invoiceData];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.invoiceNumber.toLowerCase().includes(query) ||
          item.to.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case 'invoiceNumber':
            aValue = a.invoiceNumber;
            bValue = b.invoiceNumber;
            break;
          case 'to':
            aValue = a.to;
            bValue = b.to;
            break;
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'tax':
            aValue = a.tax;
            bValue = b.tax;
            break;
          case 'balance':
            aValue = a.balance;
            bValue = b.balance;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'issuedDate':
            aValue = a.issuedDate;
            bValue = b.issuedDate;
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
  }, [invoiceData, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / entriesPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredAndSortedData, currentPage, entriesPerPage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSearch = () => {
    // Simulate API call to fetch void invoice data
    setInvoiceData(mockVoidInvoices);
    setCurrentPage(1);
    toast({
      title: "Search Completed",
      description: `Found ${mockVoidInvoices.length} voided invoice(s) for the selected date range.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Voided": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Heading */}
      <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        <h1 className="text-3xl font-bold">Void Invoice List</h1>
      </div>

      {/* Filter and Table Section */}
      <Card>
        <CardContent className="p-6">
          {/* Filter Section */}
          <div className="flex items-center justify-end mb-6">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="shift-date-from">Shift Date</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="shift-date-from"
                    type="date"
                    value={shiftDateFrom}
                    onChange={(e) => setShiftDateFrom(e.target.value)}
                    className="w-[150px]"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    id="shift-date-to"
                    type="date"
                    value={shiftDateTo}
                    onChange={(e) => setShiftDateTo(e.target.value)}
                    min={shiftDateFrom || undefined}
                    className="w-[150px]"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={handleSearch} className="h-10 mt-6">
                Search
              </Button>
            </div>
          </div>

          {/* Table Controls */}
          <div className="flex items-center justify-between mb-6">
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
              <Label htmlFor="search" className="text-sm">Search:</Label>
              <Input
                id="search"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-[200px]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('invoiceNumber')}>
                    <div className="flex items-center gap-2">
                      Invoice Number
                      {getSortIcon('invoiceNumber')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('to')}>
                    <div className="flex items-center gap-2">
                      To
                      {getSortIcon('to')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                    <div className="flex items-center gap-2">
                      Amount
                      {getSortIcon('amount')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('tax')}>
                    <div className="flex items-center gap-2">
                      Tax
                      {getSortIcon('tax')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('balance')}>
                    <div className="flex items-center gap-2">
                      Balance
                      {getSortIcon('balance')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('issuedDate')}>
                    <div className="flex items-center gap-2">
                      Issued Date
                      {getSortIcon('issuedDate')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                      <TableCell>{item.to}</TableCell>
                      <TableCell>{formatCurrency(item.amount)}</TableCell>
                      <TableCell>{formatCurrency(item.tax)}</TableCell>
                      <TableCell>{formatCurrency(item.balance)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(item.status) as any}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(item.issuedDate)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No data available in table
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedData.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * entriesPerPage, filteredAndSortedData.length)} of{" "}
              {filteredAndSortedData.length} entries
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
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
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

