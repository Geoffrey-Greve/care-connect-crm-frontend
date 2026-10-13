import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Pencil,
  Eye,
  Trash2,
  ArrowLeft,
  Filter,
} from "lucide-react";
import PriceFormModal, { PriceFormModalData } from "@/components/PriceFormModal";
import StatusChangeModal from "@/components/StatusChangeModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// Get current financial year (Australian financial year: July 1 to June 30)
const getCurrentFinancialYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  if (month >= 6) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

interface Price {
  id: string;
  serialNo: number;
  dayOfWeek: string;
  time: string;
  pricePerHour: string;
  itemNo: string;
  effectiveDate: string;
  multiplier: string;
  financialYear: string;
  status: "Active" | "Inactive";
}

const mockPrices: Price[] = [
  {
    id: "1",
    serialNo: 1,
    dayOfWeek: "Weekdays - Mon Tue Wed Thu Fri",
    time: "00:00 - 06:00",
    pricePerHour: "78.81",
    itemNo: "01_002_0107_1_1",
    effectiveDate: "01-Jul-2025",
    multiplier: "1:1",
    financialYear: getCurrentFinancialYear(),
    status: "Active",
  },
  {
    id: "2",
    serialNo: 2,
    dayOfWeek: "Saturday",
    time: "00:00 - 23:00",
    pricePerHour: "98.83",
    itemNo: "01_013_0107_1_1",
    effectiveDate: "01-Jul-2025",
    multiplier: "1:1",
    financialYear: getCurrentFinancialYear(),
    status: "Active",
  },
];

export default function ManagePrice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const priceBookId = searchParams.get("priceBookId");
  const priceBookName = searchParams.get("priceBookName") || "Price Book";

  const { toast } = useToast();
  const [data, setData] = useState<Price[]>(mockPrices);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState<Price | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedPriceForStatus, setSelectedPriceForStatus] = useState<Price | null>(null);

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredData = useMemo(() => {
    let filtered = data.filter((item) => {
      const searchLower = search.toLowerCase();
      return (
        item.dayOfWeek.toLowerCase().includes(searchLower) ||
        item.itemNo.toLowerCase().includes(searchLower) ||
        item.pricePerHour.toLowerCase().includes(searchLower) ||
        item.effectiveDate.toLowerCase().includes(searchLower)
      );
    });

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case "serialNo":
            aValue = a.serialNo;
            bValue = b.serialNo;
            break;
          case "dayOfWeek":
            aValue = a.dayOfWeek;
            bValue = b.dayOfWeek;
            break;
          case "time":
            aValue = a.time;
            bValue = b.time;
            break;
          case "pricePerHour":
            aValue = parseFloat(a.pricePerHour);
            bValue = parseFloat(b.pricePerHour);
            break;
          case "itemNo":
            aValue = a.itemNo;
            bValue = b.itemNo;
            break;
          case "effectiveDate":
            aValue = a.effectiveDate;
            bValue = b.effectiveDate;
            break;
          case "multiplier":
            aValue = a.multiplier;
            bValue = b.multiplier;
            break;
          case "financialYear":
            aValue = a.financialYear;
            bValue = b.financialYear;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, search, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(start, start + entriesPerPage);
  }, [filteredData, currentPage, entriesPerPage]);

  const handleNewPrice = () => {
    setSelectedPrice(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleView = (item: Price) => {
    setSelectedPrice(item);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (item: Price) => {
    setSelectedPrice(item);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDeleteClick = (item: Price) => {
    setPriceToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleStatusClick = (item: Price) => {
    setSelectedPriceForStatus(item);
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedPriceForStatus) {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedPriceForStatus.id
            ? { ...item, status: newStatus as "Active" | "Inactive" }
            : item
        )
      );
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
      setSelectedPriceForStatus(null);
    }
  };

  const confirmDelete = () => {
    if (priceToDelete) {
      setData((prev) => prev.filter((item) => item.id !== priceToDelete.id));
      // Renumber serial numbers
      const renumberedData = data
        .filter((item) => item.id !== priceToDelete.id)
        .map((item, index) => ({
          ...item,
          serialNo: index + 1,
        }));
      setData(renumberedData);
      toast({
        title: "Success",
        description: `Price entry has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setPriceToDelete(null);
    }
  };

  const handleModalSubmit = (formData: PriceFormModalData) => {
    if (modalMode === "create") {
      const newPrice: Price = {
        id: Date.now().toString(),
        serialNo: data.length + 1,
        dayOfWeek: formData.dayOfWeek,
        time: `${formData.startTime} - ${formData.endTime}`,
        pricePerHour: formData.pricePerHour,
        itemNo: formData.itemNo,
        effectiveDate: new Date(formData.effectiveDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        multiplier: formData.multiplier,
        financialYear: getCurrentFinancialYear(),
        status: "Active",
      };
      setData((prev) => [...prev, newPrice]);
      toast({
        title: "Success",
        description: "Price entry created successfully.",
      });
    } else if (modalMode === "edit" && selectedPrice) {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedPrice.id
            ? {
              ...item,
              dayOfWeek: formData.dayOfWeek,
              time: `${formData.startTime} - ${formData.endTime}`,
              pricePerHour: formData.pricePerHour,
              itemNo: formData.itemNo,
              effectiveDate: new Date(formData.effectiveDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              multiplier: formData.multiplier,
            }
            : item
        )
      );
      toast({
        title: "Success",
        description: "Price entry updated successfully.",
      });
    }
  };

  const getModalData = (): PriceFormModalData | undefined => {
    if (!selectedPrice) return undefined;

    const [startTime, endTime] = selectedPrice.time.split(" - ");

    // Parse date from "01-Jul-2025" format to YYYY-MM-DD
    const parseDate = (dateStr: string): string => {
      try {
        // Try parsing the DD-MMM-YYYY format
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0];
        }
        // Fallback: if already in YYYY-MM-DD format
        return dateStr;
      } catch {
        return "";
      }
    };

    return {
      id: selectedPrice.id,
      dayOfWeek: selectedPrice.dayOfWeek,
      itemNo: selectedPrice.itemNo,
      effectiveDate: parseDate(selectedPrice.effectiveDate),
      startTime: startTime || "00:00",
      endTime: endTime || "00:00",
      perKm: "",
      multiplier: selectedPrice.multiplier,
      pricePerHour: selectedPrice.pricePerHour,
      transportReferenceNo: "",
    };
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-muted-foreground opacity-50" />;
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="h-4 w-4 text-primary" />;
    }
    if (sortDirection === "desc") {
      return <ChevronDown className="h-4 w-4 text-primary" />;
    }
    return <ChevronUp className="h-4 w-4 text-muted-foreground opacity-50" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{priceBookName}</h1>
            <p className="text-sm text-destructive mt-1">
              Note: Please avoid duplicate prices, as they affect the invoice.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleNewPrice}>
            <Plus className="h-4 w-4 mr-2" />
            New Price
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={entriesPerPage.toString()}
              onValueChange={(value) => {
                setEntriesPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20 h-8">
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
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-64 h-8"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("serialNo")}
                  >
                    <span className="mr-2">Serial No</span>
                    {getSortIcon("serialNo")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("dayOfWeek")}
                  >
                    <span className="mr-2">Day of Week</span>
                    {getSortIcon("dayOfWeek")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("time")}
                  >
                    <span className="mr-2">Time</span>
                    {getSortIcon("time")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("pricePerHour")}
                  >
                    <span className="mr-2">Price Per Hour</span>
                    {getSortIcon("pricePerHour")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("itemNo")}
                  >
                    <span className="mr-2">Item No</span>
                    {getSortIcon("itemNo")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("effectiveDate")}
                  >
                    <span className="mr-2">Effective Date</span>
                    {getSortIcon("effectiveDate")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("multiplier")}
                  >
                    <span className="mr-2">Multiplier</span>
                    {getSortIcon("multiplier")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("financialYear")}
                  >
                    <span className="mr-2">Financial Year</span>
                    {getSortIcon("financialYear")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("status")}
                  >
                    <span className="mr-2">Status</span>
                    {getSortIcon("status")}
                  </Button>
                </TableHead>
                <TableHead className="w-20">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    No data available in table
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.serialNo}</TableCell>
                    <TableCell>{item.dayOfWeek}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.pricePerHour}</TableCell>
                    <TableCell>{item.itemNo}</TableCell>
                    <TableCell>{item.effectiveDate}</TableCell>
                    <TableCell>{item.multiplier}</TableCell>
                    <TableCell>{item.financialYear}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${item.status === "Active"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        onClick={() => handleStatusClick(item)}
                      >
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || filteredData.length === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || filteredData.length === 0}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Price Form Modal */}
      <PriceFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        data={getModalData()}
        onSubmit={handleModalSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this price entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPriceToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        title="Change Price Status"
        nameLabel="Price Entry"
        nameValue={selectedPriceForStatus ? `${selectedPriceForStatus.dayOfWeek} - ${selectedPriceForStatus.itemNo}` : ""}
        currentStatus={selectedPriceForStatus?.status || ""}
        statusOptions={["Active", "Inactive"]}
        onConfirm={handleStatusUpdate}
      />
    </div>
  );
}

