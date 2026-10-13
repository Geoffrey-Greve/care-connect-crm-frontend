import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, DollarSign, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

// Mock invoices data
const mockInvoices = [
  {
    id: "INV-001",
    invoiceNumber: "INV-2024-001",
    issueDate: "2024-01-15",
    amount: 2500.00,
    tax: 250.00,
    balance: 0.00,
    paymentDate: "2024-01-20",
    status: "Paid",
  },
  {
    id: "INV-002",
    invoiceNumber: "INV-2024-002",
    issueDate: "2024-02-10",
    amount: 3200.00,
    tax: 320.00,
    balance: 3200.00,
    paymentDate: null,
    status: "Unpaid",
  },
  {
    id: "INV-003",
    invoiceNumber: "INV-2024-003",
    issueDate: "2024-01-20",
    amount: 1800.00,
    tax: 180.00,
    balance: 1800.00,
    paymentDate: null,
    status: "Overdue",
  },
  {
    id: "INV-004",
    invoiceNumber: "INV-2024-004",
    issueDate: "2024-03-05",
    amount: 4500.00,
    tax: 450.00,
    balance: 0.00,
    paymentDate: "2024-03-10",
    status: "Paid",
  },
  {
    id: "INV-005",
    invoiceNumber: "INV-2024-005",
    issueDate: "2024-03-15",
    amount: 2100.00,
    tax: 210.00,
    balance: 2100.00,
    paymentDate: null,
    status: "Unpaid",
  },
];

type InvoiceSortField = 'invoiceNumber' | 'issueDate' | 'amount' | 'tax' | 'balance' | 'paymentDate' | 'status';
type InvoiceSortDirection = 'asc' | 'desc' | null;

interface ClientInvoicesProps {
  clientName?: string;
}

const ClientInvoices: React.FC<ClientInvoicesProps> = ({ clientName }) => {
  const navigate = useNavigate();
  const [invoices] = useState(mockInvoices);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceSortField, setInvoiceSortField] = useState<InvoiceSortField | null>(null);
  const [invoiceSortDirection, setInvoiceSortDirection] = useState<InvoiceSortDirection>(null);
  const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(1);
  const [invoiceEntriesPerPage, setInvoiceEntriesPerPage] = useState(10);

  const handleInvoiceClick = (invoice: any) => {
    // Navigate to invoice detail page
    // In production, this would navigate to a specific invoice detail route
    navigate(`/invoices/${invoice.id}`);
  };

  const handleInvoiceSort = (field: InvoiceSortField) => {
    if (invoiceSortField === field) {
      if (invoiceSortDirection === 'asc') {
        setInvoiceSortDirection('desc');
      } else if (invoiceSortDirection === 'desc') {
        setInvoiceSortField(null);
        setInvoiceSortDirection(null);
      }
    } else {
      setInvoiceSortField(field);
      setInvoiceSortDirection('asc');
    }
  };

  const getInvoiceSortIcon = (field: InvoiceSortField) => {
    if (invoiceSortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return invoiceSortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    let result = [...invoices];

    // Apply search filter
    if (invoiceSearch) {
      const search = invoiceSearch.toLowerCase();
      result = result.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(search) ||
        invoice.status.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (invoiceSortField && invoiceSortDirection) {
      result.sort((a, b) => {
        let aValue: string | number | null;
        let bValue: string | number | null;

        switch (invoiceSortField) {
          case 'invoiceNumber':
            aValue = a.invoiceNumber;
            bValue = b.invoiceNumber;
            break;
          case 'issueDate':
            aValue = a.issueDate;
            bValue = b.issueDate;
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
          case 'paymentDate':
            aValue = a.paymentDate;
            bValue = b.paymentDate;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return invoiceSortDirection === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        return invoiceSortDirection === 'asc'
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      });
    }

    return result;
  }, [invoices, invoiceSearch, invoiceSortField, invoiceSortDirection]);

  // Invoice pagination
  const invoiceTotalPages = Math.ceil(filteredAndSortedInvoices.length / invoiceEntriesPerPage);
  const invoiceStartIndex = (invoiceCurrentPage - 1) * invoiceEntriesPerPage;
  const invoiceEndIndex = invoiceStartIndex + invoiceEntriesPerPage;
  const paginatedInvoices = filteredAndSortedInvoices.slice(invoiceStartIndex, invoiceEndIndex);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case "Unpaid":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Unpaid</Badge>;
      case "Overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Invoices</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 sm:flex-initial sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={invoiceSearch}
                onChange={(e) => {
                  setInvoiceSearch(e.target.value);
                  setInvoiceCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={invoiceEntriesPerPage.toString()}
                onValueChange={(value) => {
                  setInvoiceEntriesPerPage(Number(value));
                  setInvoiceCurrentPage(1);
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
          </div>

          {/* Invoices Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      onClick={() => handleInvoiceSort('invoiceNumber')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Invoice Number
                      {getInvoiceSortIcon('invoiceNumber')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleInvoiceSort('issueDate')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Issue Date
                      {getInvoiceSortIcon('issueDate')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleInvoiceSort('amount')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Amount
                      {getInvoiceSortIcon('amount')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleInvoiceSort('tax')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Tax
                      {getInvoiceSortIcon('tax')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleInvoiceSort('balance')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Balance
                      {getInvoiceSortIcon('balance')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleInvoiceSort('paymentDate')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Payment Date
                      {getInvoiceSortIcon('paymentDate')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleInvoiceSort('status')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Status
                      {getInvoiceSortIcon('status')}
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInvoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleInvoiceClick(invoice)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {invoice.invoiceNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(invoice.issueDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatCurrency(invoice.tax)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatCurrency(invoice.balance)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(invoice.paymentDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {invoiceStartIndex + 1} to {Math.min(invoiceEndIndex, filteredAndSortedInvoices.length)} of {filteredAndSortedInvoices.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInvoiceCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={invoiceCurrentPage === 1 || invoiceTotalPages === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: invoiceTotalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === invoiceTotalPages ||
                    (page >= invoiceCurrentPage - 1 && page <= invoiceCurrentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={invoiceCurrentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setInvoiceCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === invoiceCurrentPage - 2 || page === invoiceCurrentPage + 2) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInvoiceCurrentPage(prev => Math.min(invoiceTotalPages, prev + 1))}
                disabled={invoiceCurrentPage === invoiceTotalPages || invoiceTotalPages === 0}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientInvoices;

