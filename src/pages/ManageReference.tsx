import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, MoreHorizontal, Plus, Pencil, Eye, Trash2, FileText } from "lucide-react";
import ReferenceModal, { ReferenceModalData } from "@/components/ReferenceModal";
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

interface Reference {
  id: string;
  serialNo: number;
  itemName: string;
  travelItemNumber: string;
  type: string;
  status: "Active" | "Inactive";
}

const mockReferences: Reference[] = [
  {
    id: "1",
    serialNo: 1,
    itemName: "Laptop",
    travelItemNumber: "Macbook Pro M5",
    type: "Travel",
    status: "Active",
  },
  {
    id: "2",
    serialNo: 2,
    itemName: "Mobile Phone",
    travelItemNumber: "iPhone 15 Pro",
    type: "Travel",
    status: "Active",
  },
  {
    id: "3",
    serialNo: 3,
    itemName: "Tablet",
    travelItemNumber: "iPad Air",
    type: "Travel",
    status: "Inactive",
  },
];

const referenceTypes = ["Travel", "Split"];

export default function ManageReference() {
  const { toast } = useToast();
  const [data, setData] = useState<Reference[]>(mockReferences);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedReferenceForStatus, setSelectedReferenceForStatus] = useState<Reference | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [referenceToDelete, setReferenceToDelete] = useState<Reference | null>(null);

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
        item.itemName.toLowerCase().includes(searchLower) ||
        item.travelItemNumber.toLowerCase().includes(searchLower) ||
        item.type.toLowerCase().includes(searchLower)
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
          case "itemName":
            aValue = a.itemName;
            bValue = b.itemName;
            break;
          case "travelItemNumber":
            aValue = a.travelItemNumber;
            bValue = b.travelItemNumber;
            break;
          case "type":
            aValue = a.type;
            bValue = b.type;
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
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredData, currentPage, entriesPerPage]);

  const handleNewReference = () => {
    setSelectedReference(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleView = (item: Reference) => {
    setSelectedReference(item);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (item: Reference) => {
    setSelectedReference(item);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleModalSubmit = (formData: ReferenceModalData) => {
    if (modalMode === "create") {
      const newReference: Reference = {
        id: Date.now().toString(),
        serialNo: data.length + 1,
        itemName: formData.itemName,
        travelItemNumber: formData.travelItemNumber,
        type: formData.type,
        status: "Active", // Default status
      };
      setData([...data, newReference]);
      toast({
        title: "Success",
        description: "Reference created successfully.",
      });
    } else if (modalMode === "edit" && selectedReference) {
      const updatedData = data.map((item) =>
        item.id === selectedReference.id
          ? {
              ...item,
              itemName: formData.itemName,
              travelItemNumber: formData.travelItemNumber,
              type: formData.type,
              // Preserve existing status
            }
          : item
      );
      setData(updatedData);
      toast({
        title: "Success",
        description: "Reference updated successfully.",
      });
    }
  };

  const getModalData = (): ReferenceModalData | undefined => {
    if (!selectedReference) return undefined;
    return {
      id: selectedReference.id,
      itemName: selectedReference.itemName,
      travelItemNumber: selectedReference.travelItemNumber,
      type: selectedReference.type,
    };
  };

  const handleStatusClick = (item: Reference) => {
    setSelectedReferenceForStatus(item);
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedReferenceForStatus) {
      const updatedData = data.map((item) =>
        item.id === selectedReferenceForStatus.id
          ? { ...item, status: newStatus as "Active" | "Inactive" }
          : item
      );
      setData(updatedData);
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
    }
  };

  const handleDeleteClick = (item: Reference) => {
    setReferenceToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (referenceToDelete) {
      const updatedData = data.filter((item) => item.id !== referenceToDelete.id);
      // Recalculate serial numbers
      const renumberedData = updatedData.map((item, index) => ({
        ...item,
        serialNo: index + 1,
      }));
      setData(renumberedData);
      toast({
        title: "Success",
        description: `Reference "${referenceToDelete.itemName}" has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setReferenceToDelete(null);
    }
  };

  const handleImportReference = () => {
    toast({
      title: "Import Reference",
      description: "Reference import feature will be implemented soon.",
    });
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
          <h1 className="text-3xl font-bold tracking-tight">Manage Reference</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleImportReference}>
            <FileText className="h-4 w-4 mr-2" />
            Import Reference
          </Button>
          <Button onClick={handleNewReference}>
            <Plus className="h-4 w-4 mr-2" />
            New Reference
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
              placeholder="Search references..."
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
                    onClick={() => handleSort("itemName")}
                  >
                    <span className="mr-2">Item Name</span>
                    {getSortIcon("itemName")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("travelItemNumber")}
                  >
                    <span className="mr-2">Travel Item Number</span>
                    {getSortIcon("travelItemNumber")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("type")}
                  >
                    <span className="mr-2">Type</span>
                    {getSortIcon("type")}
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
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No references found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.serialNo}</TableCell>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.travelItemNumber}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                          item.status === "Active"
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
                            Edit
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

      {/* Reference Modal */}
      <ReferenceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        data={getModalData()}
        typeOptions={referenceTypes}
        onSubmit={handleModalSubmit}
      />

      {/* Status Change Modal */}
      {selectedReferenceForStatus && (
        <StatusChangeModal
          isOpen={statusModalOpen}
          onOpenChange={setStatusModalOpen}
          title="Update Reference Status"
          nameLabel="Item Name"
          nameValue={selectedReferenceForStatus.itemName}
          currentStatus={selectedReferenceForStatus.status}
          statusOptions={["Active", "Inactive"]}
          onConfirm={handleStatusUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the reference{" "}
              <span className="font-semibold">"{referenceToDelete?.itemName}"</span> and remove it from
              your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReferenceToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

