import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, MoreHorizontal, Plus, Pencil, Eye, Trash2 } from "lucide-react";
import PayGroupModal, { PayGroupModalData } from "@/components/PayGroupModal";
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

interface PayGroup {
  id: string;
  serialNo: number;
  payGroupName: string;
  status: "Active" | "Inactive";
}

const mockPayGroups: PayGroup[] = [
  {
    id: "1",
    serialNo: 1,
    payGroupName: "Test",
    status: "Active",
  },
  {
    id: "2",
    serialNo: 2,
    payGroupName: "HPA Default",
    status: "Active",
  },
];

export default function ManagePayGroup() {
  const { toast } = useToast();
  const [data, setData] = useState<PayGroup[]>(mockPayGroups);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedPayGroup, setSelectedPayGroup] = useState<PayGroup | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedPayGroupForStatus, setSelectedPayGroupForStatus] = useState<PayGroup | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [payGroupToDelete, setPayGroupToDelete] = useState<PayGroup | null>(null);

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
      return item.payGroupName.toLowerCase().includes(searchLower);
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
          case "payGroupName":
            aValue = a.payGroupName;
            bValue = b.payGroupName;
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

  const handleNewPayGroup = () => {
    setSelectedPayGroup(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleView = (item: PayGroup) => {
    setSelectedPayGroup(item);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (item: PayGroup) => {
    setSelectedPayGroup(item);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDeleteClick = (item: PayGroup) => {
    setPayGroupToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (payGroupToDelete) {
      const renumberedData = data
        .filter((item) => item.id !== payGroupToDelete.id)
        .map((item, index) => ({
          ...item,
          serialNo: index + 1,
        }));
      setData(renumberedData);
      toast({
        title: "Success",
        description: `Pay group "${payGroupToDelete.payGroupName}" has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setPayGroupToDelete(null);
    }
  };

  const handleModalSubmit = (formData: PayGroupModalData) => {
    if (modalMode === "create") {
      const newPayGroup: PayGroup = {
        id: Date.now().toString(),
        serialNo: data.length + 1,
        payGroupName: formData.payGroupName,
        status: "Active",
      };
      setData((prev) => [...prev, newPayGroup]);
      toast({
        title: "Success",
        description: "Pay group created successfully.",
      });
    } else if (modalMode === "edit" && selectedPayGroup) {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedPayGroup.id
            ? {
                ...item,
                payGroupName: formData.payGroupName,
              }
            : item
        )
      );
      toast({
        title: "Success",
        description: "Pay group updated successfully.",
      });
    }
  };

  const getModalData = (): PayGroupModalData | undefined => {
    if (!selectedPayGroup) return undefined;
    return {
      id: selectedPayGroup.id,
      payGroupName: selectedPayGroup.payGroupName,
    };
  };

  const handleStatusClick = (item: PayGroup) => {
    setSelectedPayGroupForStatus(item);
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedPayGroupForStatus) {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedPayGroupForStatus.id
            ? { ...item, status: newStatus as "Active" | "Inactive" }
            : item
        )
      );
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
      setSelectedPayGroupForStatus(null);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Manage Pay Group</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleNewPayGroup}>
            <Plus className="h-4 w-4 mr-2" />
            New Pay Group
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
                    onClick={() => handleSort("payGroupName")}
                  >
                    <span className="mr-2">Pay Group Name</span>
                    {getSortIcon("payGroupName")}
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
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No pay groups found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.serialNo}</TableCell>
                    <TableCell>{item.payGroupName}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
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
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || filteredData.length === 0}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Pay Group Modal */}
      <PayGroupModal
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
              This action cannot be undone. This will permanently delete the pay group{" "}
              <span className="font-semibold">"{payGroupToDelete?.payGroupName}"</span> and remove it from
              your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPayGroupToDelete(null)}>Cancel</AlertDialogCancel>
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
        title="Change Pay Group Status"
        nameLabel="Pay Group Name"
        nameValue={selectedPayGroupForStatus?.payGroupName || ""}
        currentStatus={selectedPayGroupForStatus?.status || ""}
        statusOptions={["Active", "Inactive"]}
        onConfirm={handleStatusUpdate}
      />
    </div>
  );
}

