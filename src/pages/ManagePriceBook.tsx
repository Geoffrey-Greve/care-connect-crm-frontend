import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, MoreHorizontal, Plus, Pencil, Eye, Trash2, FileText } from "lucide-react";
import PriceBookModal, { PriceBookModalData } from "@/components/PriceBookModal";
import ImportCustomPricesModal from "@/components/ImportCustomPricesModal";
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

  // If month is July (6) or later, financial year starts this year
  // Otherwise, it started last year
  if (month >= 6) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

interface PriceBook {
  id: string;
  serialNo: number;
  priceBookName: string;
  externalId: string;
  financialYear: string;
  fixedPrices: boolean;
  providerTravel: boolean;
}

const mockPriceBooks: PriceBook[] = [
  {
    id: "1",
    serialNo: 1,
    priceBookName: "Default",
    externalId: "1",
    financialYear: getCurrentFinancialYear(),
    fixedPrices: true,
    providerTravel: false,
  },
  {
    id: "2",
    serialNo: 2,
    priceBookName: "Default",
    externalId: "1",
    financialYear: getCurrentFinancialYear(),
    fixedPrices: false,
    providerTravel: true,
  },
  {
    id: "3",
    serialNo: 3,
    priceBookName: "Default",
    externalId: "1",
    financialYear: getCurrentFinancialYear(),
    fixedPrices: true,
    providerTravel: true,
  },
];

export default function ManagePriceBook() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<PriceBook[]>(mockPriceBooks);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedPriceBook, setSelectedPriceBook] = useState<PriceBook | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [priceBookToDelete, setPriceBookToDelete] = useState<PriceBook | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    let filtered = data.filter((item) => {
      const searchLower = search.toLowerCase();
      return (
        item.priceBookName.toLowerCase().includes(searchLower) ||
        item.externalId.toLowerCase().includes(searchLower) ||
        item.financialYear.toLowerCase().includes(searchLower)
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
          case "priceBookName":
            aValue = a.priceBookName;
            bValue = b.priceBookName;
            break;
          case "externalId":
            aValue = a.externalId;
            bValue = b.externalId;
            break;
          case "financialYear":
            aValue = a.financialYear;
            bValue = b.financialYear;
            break;
          case "fixedPrices":
            aValue = a.fixedPrices ? 1 : 0;
            bValue = b.fixedPrices ? 1 : 0;
            break;
          case "providerTravel":
            aValue = a.providerTravel ? 1 : 0;
            bValue = b.providerTravel ? 1 : 0;
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
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredData, currentPage, entriesPerPage]);

  const handleNewPriceBook = () => {
    setSelectedPriceBook(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleView = (item: PriceBook) => {
    setSelectedPriceBook(item);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (item: PriceBook) => {
    setSelectedPriceBook(item);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleModalSubmit = (formData: PriceBookModalData) => {
    if (modalMode === "create") {
      const newPriceBook: PriceBook = {
        id: Date.now().toString(),
        serialNo: data.length + 1,
        priceBookName: formData.priceBookName,
        externalId: formData.externalId,
        financialYear: formData.financialYear, // Auto-calculated
        fixedPrices: formData.fixedPrices,
        providerTravel: formData.providerTravel,
      };
      setData([...data, newPriceBook]);
      toast({
        title: "Success",
        description: "Price book created successfully.",
      });
    } else if (modalMode === "edit" && selectedPriceBook) {
      const updatedData = data.map((item) =>
        item.id === selectedPriceBook.id
          ? {
            ...item,
            priceBookName: formData.priceBookName,
            externalId: formData.externalId,
            financialYear: formData.financialYear, // Auto-calculated
            fixedPrices: formData.fixedPrices,
            providerTravel: formData.providerTravel,
          }
          : item
      );
      setData(updatedData);
      toast({
        title: "Success",
        description: "Price book updated successfully.",
      });
    }
  };

  const getModalData = (): PriceBookModalData | undefined => {
    if (!selectedPriceBook) return undefined;
    return {
      id: selectedPriceBook.id,
      priceBookName: selectedPriceBook.priceBookName,
      externalId: selectedPriceBook.externalId,
      financialYear: selectedPriceBook.financialYear,
      fixedPrices: selectedPriceBook.fixedPrices,
      providerTravel: selectedPriceBook.providerTravel,
    };
  };

  const handleDeleteClick = (item: PriceBook) => {
    setPriceBookToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (priceBookToDelete) {
      const updatedData = data.filter((item) => item.id !== priceBookToDelete.id);
      // Recalculate serial numbers
      const renumberedData = updatedData.map((item, index) => ({
        ...item,
        serialNo: index + 1,
      }));
      setData(renumberedData);
      toast({
        title: "Success",
        description: `Price book "${priceBookToDelete.priceBookName}" has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setPriceBookToDelete(null);
    }
  };

  const handleHPANDISPricingConfigurator = () => {
    navigate("/admin/ndis-import");
  };

  const handleImportCustomPrices = () => {
    setImportModalOpen(true);
  };

  const handleImportSubmit = (data: { effectiveDate: string; file: File | null }) => {
    if (!data.file) {
      toast({
        title: "Error",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically handle the file upload/import
    toast({
      title: "Success",
      description: `Custom prices imported successfully. Effective Date: ${data.effectiveDate}`,
    });
  };

  const handlePricesDetails = (item: PriceBook) => {
    navigate(`/admin/manage-price?priceBookId=${item.id}&priceBookName=${encodeURIComponent(item.priceBookName)}`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Price Book</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleHPANDISPricingConfigurator}>
            <FileText className="h-4 w-4 mr-2" />
            HPA NDIS Pricing Configurator
          </Button>
          <Button onClick={handleImportCustomPrices}>
            <FileText className="h-4 w-4 mr-2" />
            Import Custom Prices
          </Button>
          <Button onClick={handleNewPriceBook}>
            <Plus className="h-4 w-4 mr-2" />
            New Price Book
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
              placeholder="Search price books..."
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
                    onClick={() => handleSort("priceBookName")}
                  >
                    <span className="mr-2">Price Book</span>
                    {getSortIcon("priceBookName")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("externalId")}
                  >
                    <span className="mr-2">External ID</span>
                    {getSortIcon("externalId")}
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
                    onClick={() => handleSort("fixedPrices")}
                  >
                    <span className="mr-2">Fixed Prices</span>
                    {getSortIcon("fixedPrices")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("providerTravel")}
                  >
                    <span className="mr-2">Provider Travel</span>
                    {getSortIcon("providerTravel")}
                  </Button>
                </TableHead>
                <TableHead className="w-20">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No price books found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.serialNo}</TableCell>
                    <TableCell>{item.priceBookName}</TableCell>
                    <TableCell>{item.externalId}</TableCell>
                    <TableCell>{item.financialYear || "-"}</TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {item.fixedPrices ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {item.providerTravel ? "Yes" : "No"}
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
                          <DropdownMenuItem onClick={() => handlePricesDetails(item)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Prices Details
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
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || filteredData.length === 0}
            >
              Previous
            </Button>
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={filteredData.length === 0}
            >
              1
            </Button>
            {totalPages > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || filteredData.length === 0}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Price Book Modal */}
      <PriceBookModal
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
              This action cannot be undone. This will permanently delete the price book{" "}
              <span className="font-semibold">"{priceBookToDelete?.priceBookName}"</span> and remove it from
              your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPriceBookToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Custom Prices Modal */}
      <ImportCustomPricesModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSubmit={handleImportSubmit}
      />
    </div>
  );
}

