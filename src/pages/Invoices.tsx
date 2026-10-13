import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Invoice {
  id: string;
  invoiceNumber: string;
  to: string;
  amount: number;
  tax: number;
  balance: number;
  status: string;
  invoiceStatus: string;
  sent: string;
  xeroSync: string;
  issuedDate: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "INV-001",
    invoiceNumber: "INV-2024-001",
    to: "Sarah Johnson",
    amount: 2850.00,
    tax: 285.00,
    balance: 2850.00,
    status: "Paid",
    invoiceStatus: "Paid",
    sent: "Yes",
    xeroSync: "Synced",
    issuedDate: "2024-01-01",
  },
  {
    id: "INV-002",
    invoiceNumber: "INV-2024-002",
    to: "Robert Smith",
    amount: 1920.50,
    tax: 192.05,
    balance: 1920.50,
    status: "Overdue",
    invoiceStatus: "Unpaid",
    sent: "Yes",
    xeroSync: "Pending",
    issuedDate: "2024-01-04",
  },
  {
    id: "INV-003",
    invoiceNumber: "INV-2024-003",
    to: "Maria Garcia",
    amount: 3245.75,
    tax: 324.58,
    balance: 3245.75,
    status: "Pending",
    invoiceStatus: "Unpaid",
    sent: "Yes",
    xeroSync: "Synced",
    issuedDate: "2024-01-11",
  },
];

// Mock data for dropdowns
const mockClients = [
  { id: "all", name: "All Client" },
  { id: "CLI-001", name: "Sarah Johnson" },
  { id: "CLI-002", name: "Robert Smith" },
  { id: "CLI-003", name: "Maria Garcia" },
];

const statusOptions = ["All Status", "Paid", "Sent", "Pending", "Draft", "Overdue"];
const clientTypeOptions = ["All Client Type", "Self-Managed", "Plan Managed", "NDIA Managed"];
const monthOptions = ["This month", "Last month", "This quarter", "This year", "Custom"];

type SortField = 'invoiceNumber' | 'to' | 'amount' | 'tax' | 'balance' | 'status' | 'invoiceStatus' | 'sent' | 'xeroSync' | 'issuedDate';
type SortDirection = 'asc' | 'desc' | null;

export default function Invoices() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Filter states
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("All Status");
  const [filterClientType, setFilterClientType] = useState<string>("All Client Type");
  const [filterMonth, setFilterMonth] = useState<string>("This month");

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

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    let result = [...invoices];

    // Apply filters
    if (filterClient && filterClient !== "all") {
      result = result.filter(inv => inv.to.toLowerCase().includes(filterClient.toLowerCase()));
    }

    if (filterStatus && filterStatus !== "All Status") {
      result = result.filter(inv => inv.status === filterStatus);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchLower) ||
        inv.to.toLowerCase().includes(searchLower) ||
        inv.status.toLowerCase().includes(searchLower)
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
          case 'invoiceStatus':
            aValue = a.invoiceStatus;
            bValue = b.invoiceStatus;
            break;
          case 'sent':
            aValue = a.sent;
            bValue = b.sent;
            break;
          case 'xeroSync':
            aValue = a.xeroSync;
            bValue = b.xeroSync;
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
  }, [invoices, filterClient, filterStatus, search, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedInvoices.length / entriesPerPage);
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredAndSortedInvoices.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredAndSortedInvoices, currentPage, entriesPerPage]);

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
    setCurrentPage(1);
    toast({
      title: "Search Applied",
      description: "Filters have been applied to the invoice list.",
    });
  };

  const handleBulkSync = () => {
    toast({
      title: "Bulk Sync with Xero",
      description: "Bulk synchronization with Xero will be implemented here.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "secondary";
      case "Sent": return "default";
      case "Pending": return "outline";
      case "Draft": return "secondary";
      case "Overdue": return "destructive";
      case "Unpaid": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold">Generated Invoice</h1>
      </div>
      
      {/* Filter Section */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="filter-client">All Client</Label>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger id="filter-client">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
      </div>

            <div className="space-y-2">
              <Label htmlFor="filter-status">All Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
      </div>

            <div className="space-y-2">
              <Label htmlFor="filter-client-type">All Client Type</Label>
              <Select value={filterClientType} onValueChange={setFilterClientType}>
                <SelectTrigger id="filter-client-type">
                  <SelectValue placeholder="Select Client Type" />
                  </SelectTrigger>
                  <SelectContent>
                  {clientTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-month">All Month</Label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger id="filter-month">
                  <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>

            <Button variant="outline" onClick={handleSearch} className="h-10">
              Search
            </Button>

            <Button onClick={() => navigate("/invoices/generate")} className="h-10">
              Generate
            </Button>

            <Button variant="outline" onClick={handleBulkSync} className="h-10">
              Bulk Sync with Xero
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card>
        <CardContent className="p-6">
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
              <span className="text-sm text-muted-foreground">Search:</span>
              <Input
                placeholder=""
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
                  <TableHead className="cursor-pointer" onClick={() => handleSort('invoiceStatus')}>
                    <div className="flex items-center gap-2">
                      Invoice Status
                      {getSortIcon('invoiceStatus')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('sent')}>
                    <div className="flex items-center gap-2">
                      Sent
                      {getSortIcon('sent')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('xeroSync')}>
                    <div className="flex items-center gap-2">
                      Xero Sync
                      {getSortIcon('xeroSync')}
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
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.to}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>{formatCurrency(invoice.tax)}</TableCell>
                      <TableCell>{formatCurrency(invoice.balance)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(invoice.status) as any}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(invoice.invoiceStatus) as any}>
                          {invoice.invoiceStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.sent}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.xeroSync === "Synced" ? "secondary" : "outline"}>
                          {invoice.xeroSync}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invoice.issuedDate)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No data available in table
                    </TableCell>
                  </TableRow>
                )}
                </TableBody>
              </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedInvoices.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * entriesPerPage, filteredAndSortedInvoices.length)} of{" "}
              {filteredAndSortedInvoices.length} entries
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
