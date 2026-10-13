import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimeEntry {
  id: string;
  name: string;
  unapprovedShift: number;
  sunday: number;
  saturday: number;
  weekday12To6: number;
  weekday6To8: number;
  weekday8To10: number;
  weekday10To12: number;
  total: number;
  mileage: string;
  expense: number;
  allowances: number;
  action?: string;
  date: string;
}

const mockTimeEntries: TimeEntry[] = [
  {
    id: "1",
    name: "Harrison",
    unapprovedShift: 1,
    sunday: 0,
    saturday: 0,
    weekday12To6: 0,
    weekday6To8: 1,
    weekday8To10: 0,
    weekday10To12: 0,
    total: 1,
    mileage: "0 km",
    expense: 0,
    allowances: 0,
    action: "...",
    date: "2025-11-18",
  },
  {
    id: "2",
    name: "Testing",
    unapprovedShift: 0,
    sunday: 0,
    saturday: 0,
    weekday12To6: 0,
    weekday6To8: 0,
    weekday8To10: 0,
    weekday10To12: 0,
    total: 0,
    mileage: "0 km",
    expense: 0,
    allowances: 0,
    action: "...",
    date: "2025-11-20",
  },
];

export default function TimeTracker() {
  const { toast } = useToast();
  const [entries] = useState<TimeEntry[]>(mockTimeEntries);
  const [dateFrom, setDateFrom] = useState("2025-11-17");
  const [dateTo, setDateTo] = useState("2025-11-23");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEntries = useMemo(() => {
    let data = [...entries];

    if (searchTerm) {
      data = data.filter((entry) => entry.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      data = data.filter((entry) => new Date(entry.date) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      data = data.filter((entry) => new Date(entry.date) <= to);
    }

    return data;
  }, [entries, searchTerm, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / entriesPerPage));
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredEntries.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredEntries, currentPage, entriesPerPage]);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your time tracking report is being generated and will download shortly.",
    });
  };

  const currencyFormatter = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Time Tracker</h1>
        <p className="text-muted-foreground">Review unapproved shifts and hours by day type.</p>
      </div>

      <Card className="border border-muted">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />

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
              <Label htmlFor="time-tracker-search">Search:</Label>
              <Input
                id="time-tracker-search"
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
                  <TableHead>Name</TableHead>
                  <TableHead>Unapproved Shift</TableHead>
                  <TableHead>Sunday</TableHead>
                  <TableHead>Saturday</TableHead>
                  <TableHead>Weekday 12am-6am</TableHead>
                  <TableHead>Weekday 6am-8pm</TableHead>
                  <TableHead>Weekday 8pm-10pm</TableHead>
                  <TableHead>Weekday 10pm-12pm</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Mileage</TableHead>
                  <TableHead>Expense</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEntries.length ? (
                  paginatedEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>{entry.unapprovedShift}</TableCell>
                      <TableCell>{entry.sunday}</TableCell>
                      <TableCell>{entry.saturday}</TableCell>
                      <TableCell>{entry.weekday12To6}</TableCell>
                      <TableCell>{entry.weekday6To8}</TableCell>
                      <TableCell>{entry.weekday8To10}</TableCell>
                      <TableCell>{entry.weekday10To12}</TableCell>
                      <TableCell>{entry.total}</TableCell>
                      <TableCell>{entry.mileage}</TableCell>
                      <TableCell>{currencyFormatter.format(entry.expense)}</TableCell>
                      <TableCell>{currencyFormatter.format(entry.allowances)}</TableCell>
                      <TableCell className="text-right">{entry.action}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} className="py-8 text-center text-muted-foreground">
                      No shifts found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>
              Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
              {Math.min(currentPage * entriesPerPage, filteredEntries.length)} of {filteredEntries.length} entries
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

