import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SortDirection = "asc" | "desc" | null;

type SortField =
  | "client"
  | "deliveredAmount"
  | "invoicedAmount"
  | "cancelledAmount"
  | "nonInvoicedAmount"
  | "deliveredHours"
  | "invoicedHours"
  | "cancelledHours"
  | "nonInvoicedHours";

interface PaymentReportRow {
  id: string;
  client: string;
  deliveredAmount: number;
  invoicedAmount: number;
  cancelledAmount: number;
  nonInvoicedAmount: number;
  deliveredHours: number;
  invoicedHours: number;
  cancelledHours: number;
  nonInvoicedHours: string;
  date: string;
}

const mockPaymentReport: PaymentReportRow[] = [
  {
    id: "CLI-001",
    client: "INTERNAL_MEMBER",
    deliveredAmount: 0,
    invoicedAmount: 0,
    cancelledAmount: 0,
    nonInvoicedAmount: 0,
    deliveredHours: 0,
    invoicedHours: 0,
    cancelledHours: 0,
    nonInvoicedHours: "07:32",
    date: "2025-11-17",
  },
  {
    id: "CLI-002",
    client: "Sarah Johnson",
    deliveredAmount: 1425,
    invoicedAmount: 1200,
    cancelledAmount: 150,
    nonInvoicedAmount: 75,
    deliveredHours: 18,
    invoicedHours: 16,
    cancelledHours: 1,
    nonInvoicedHours: "01:30",
    date: "2025-11-19",
  },
  {
    id: "CLI-003",
    client: "Michael Chen",
    deliveredAmount: 980,
    invoicedAmount: 880,
    cancelledAmount: 0,
    nonInvoicedAmount: 100,
    deliveredHours: 12,
    invoicedHours: 11,
    cancelledHours: 0,
    nonInvoicedHours: "00:45",
    date: "2025-11-21",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(value);

const periodOptions = ["Hours", "Amount"] as const;

export default function PaymentReport() {
  const { toast } = useToast();
  const [reportData] = useState<PaymentReportRow[]>(mockPaymentReport);
  const [periodFilter, setPeriodFilter] = useState<(typeof periodOptions)[number]>("Hours");
  const [dateFrom, setDateFrom] = useState("2025-11-11");
  const [dateTo, setDateTo] = useState("2025-11-24");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your payment report is being generated and will download shortly.",
    });
  };

  const handleSort = (field: SortField) => {
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field || !sortDirection) {
      return (
        <span className="flex flex-col leading-none text-xs opacity-40">
          ↑
          ↓
        </span>
      );
    }

    return sortDirection === "asc" ? "↑" : "↓";
  };

  const filteredData = useMemo(() => {
    let data = [...reportData];

    if (searchTerm) {
      data = data.filter((row) => row.client.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      data = data.filter((row) => new Date(row.date) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      data = data.filter((row) => new Date(row.date) <= toDate);
    }

    if (sortField && sortDirection) {
      data.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return data;
  }, [reportData, searchTerm, dateFrom, dateTo, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage) || 1;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredData, currentPage, entriesPerPage]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Report</h1>
        <p className="text-muted-foreground">Track delivery vs invoicing across clients.</p>
      </div>
      <Card className="border border-muted">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as (typeof periodOptions)[number])}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Hours" />
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

            <Button className="rounded-full px-6">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" className="rounded-full px-6" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Show</span>
              <Select
                value={entriesPerPage.toString()}
                onValueChange={(value) => {
                  setEntriesPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[72px]">
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
              <Label htmlFor="payment-report-search">Search:</Label>
              <Input
                id="payment-report-search"
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
                  <TableHead className="w-48 cursor-pointer" onClick={() => handleSort("client")}>
                    <div className="flex items-center gap-2">
                      Client
                      {getSortIcon("client")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("deliveredAmount")}>
                    <div className="flex items-center gap-2">
                      Delivered Amount
                      {getSortIcon("deliveredAmount")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("invoicedAmount")}>
                    <div className="flex items-center gap-2">
                      Invoiced Amount
                      {getSortIcon("invoicedAmount")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("cancelledAmount")}>
                    <div className="flex items-center gap-2">
                      Cancelled Amount
                      {getSortIcon("cancelledAmount")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("nonInvoicedAmount")}>
                    <div className="flex items-center gap-2">
                      Non Invoiced Amount
                      {getSortIcon("nonInvoicedAmount")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("deliveredHours")}>
                    <div className="flex items-center gap-2">
                      Delivered Hours
                      {getSortIcon("deliveredHours")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("invoicedHours")}>
                    <div className="flex items-center gap-2">
                      Invoiced Hours
                      {getSortIcon("invoicedHours")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("cancelledHours")}>
                    <div className="flex items-center gap-2">
                      Cancelled Hours
                      {getSortIcon("cancelledHours")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("nonInvoicedHours")}>
                    <div className="flex items-center gap-2">
                      Non Invoiced Hours
                      {getSortIcon("nonInvoicedHours")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length ? (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.client}</TableCell>
                      <TableCell>{formatCurrency(row.deliveredAmount)}</TableCell>
                      <TableCell>{formatCurrency(row.invoicedAmount)}</TableCell>
                      <TableCell>{formatCurrency(row.cancelledAmount)}</TableCell>
                      <TableCell>{formatCurrency(row.nonInvoicedAmount)}</TableCell>
                      <TableCell>{row.deliveredHours}</TableCell>
                      <TableCell>{row.invoicedHours}</TableCell>
                      <TableCell>{row.cancelledHours}</TableCell>
                      <TableCell>{row.nonInvoicedHours}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                      No records found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
              {Math.min(currentPage * entriesPerPage, filteredData.length)} of {filteredData.length} entries
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

