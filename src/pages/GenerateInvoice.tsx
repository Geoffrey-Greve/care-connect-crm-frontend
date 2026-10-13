import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GenerateInvoiceData {
  id: string;
  client: string;
  totalShifts: number;
  to: string;
  purchaseOrder: string;
  due: number;
  tax: number;
  totalCost: number;
  status: string;
}

const mockInvoiceData: GenerateInvoiceData[] = [
  {
    id: "GEN-001",
    client: "Sarah Johnson",
    totalShifts: 12,
    to: "Sarah Johnson",
    purchaseOrder: "PO-2024-001",
    due: 2850.00,
    tax: 285.00,
    totalCost: 3135.00,
    status: "Pending",
  },
  {
    id: "GEN-002",
    client: "Robert Smith",
    totalShifts: 8,
    to: "Robert Smith",
    purchaseOrder: "PO-2024-002",
    due: 1920.50,
    tax: 192.05,
    totalCost: 2112.55,
    status: "Generated",
  },
];

type SortField = 'client' | 'totalShifts' | 'to' | 'purchaseOrder' | 'due' | 'tax' | 'totalCost' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export default function GenerateInvoice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [includeKilometers, setIncludeKilometers] = useState(false);
  const [includeExpenses, setIncludeExpenses] = useState(false);
  const [shiftDateFrom, setShiftDateFrom] = useState<string>("2025-11-06");
  const [shiftDateTo, setShiftDateTo] = useState<string>("2025-11-13");
  const [invoiceData, setInvoiceData] = useState<GenerateInvoiceData[]>([]);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Filter and sort invoice data
  const filteredAndSortedData = useMemo(() => {
    let result = [...invoiceData];

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case 'client':
            aValue = a.client;
            bValue = b.client;
            break;
          case 'totalShifts':
            aValue = a.totalShifts;
            bValue = b.totalShifts;
            break;
          case 'to':
            aValue = a.to;
            bValue = b.to;
            break;
          case 'purchaseOrder':
            aValue = a.purchaseOrder;
            bValue = b.purchaseOrder;
            break;
          case 'due':
            aValue = a.due;
            bValue = b.due;
            break;
          case 'tax':
            aValue = a.tax;
            bValue = b.tax;
            break;
          case 'totalCost':
            aValue = a.totalCost;
            bValue = b.totalCost;
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
  }, [invoiceData, sortField, sortDirection]);

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
    // Simulate API call to fetch invoice data
    setInvoiceData(mockInvoiceData);
    setCurrentPage(1);
    toast({
      title: "Search Completed",
      description: `Found ${mockInvoiceData.length} invoice(s) for the selected date range.`,
    });
  };

  const handleGenerate = () => {
    if (invoiceData.length === 0) {
      toast({
        title: "No Data",
        description: "Please search for invoices first before generating.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Invoices Generated",
      description: `${invoiceData.length} invoice(s) have been generated successfully.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Generated": return "secondary";
      case "Pending": return "outline";
      case "Draft": return "secondary";
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
        <h1 className="text-3xl font-bold">Invoices Generatet</h1>
      </div>

      {/* Table Section */}
      <Card>
        <CardContent className="p-6">
          {/* Control Panel */}
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

            <div className="flex flex-wrap items-end justify-center gap-4">
              <div className="flex items-center h-10 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kilometers"
                    checked={includeKilometers}
                    onCheckedChange={(checked) => setIncludeKilometers(checked as boolean)}
                  />
                  <Label htmlFor="kilometers" className="cursor-pointer">
                    Kilometers
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="expenses"
                    checked={includeExpenses}
                    onCheckedChange={(checked) => setIncludeExpenses(checked as boolean)}
                  />
                  <Label htmlFor="expenses" className="cursor-pointer">
                    Expenses
                  </Label>
                </div>
              </div>

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
              </div>

              <Button variant="outline" onClick={handleSearch} className="h-10">
                Search
              </Button>

              <Button onClick={handleGenerate} className="h-10">
                Generate
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('client')}>
                    <div className="flex items-center gap-2">
                      Client
                      {getSortIcon('client')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('totalShifts')}>
                    <div className="flex items-center gap-2">
                      Total Shifts
                      {getSortIcon('totalShifts')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('to')}>
                    <div className="flex items-center gap-2">
                      To
                      {getSortIcon('to')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('purchaseOrder')}>
                    <div className="flex items-center gap-2">
                      Purchase Order
                      {getSortIcon('purchaseOrder')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('due')}>
                    <div className="flex items-center gap-2">
                      Due
                      {getSortIcon('due')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('tax')}>
                    <div className="flex items-center gap-2">
                      Tax
                      {getSortIcon('tax')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('totalCost')}>
                    <div className="flex items-center gap-2">
                      Total Cost
                      {getSortIcon('totalCost')}
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
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.client}</TableCell>
                      <TableCell>{item.totalShifts}</TableCell>
                      <TableCell>{item.to}</TableCell>
                      <TableCell>{item.purchaseOrder}</TableCell>
                      <TableCell>{formatCurrency(item.due)}</TableCell>
                      <TableCell>{formatCurrency(item.tax)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.totalCost)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(item.status) as any}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No data available in table
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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

