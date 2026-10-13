import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, MoreHorizontal, Plus, Pencil, Eye, Trash2 } from "lucide-react";
import AllowanceModal, { AllowanceModalData } from "@/components/AllowanceModal";
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

interface Allowance {
  id: string;
  serialNo: number;
  title: string;
  allowancesType: string;
  value: number;
  externalIdCode: number;
  externalId: number;
  status: "Active" | "Inactive";
}

const mockAllowances: Allowance[] = [
  {
    id: "1",
    serialNo: 1,
    title: "Asd",
    allowancesType: "Expense",
    value: 9809,
    externalIdCode: 2,
    externalId: 2,
    status: "Active",
  },
];

export default function ManageAllowances() {
  const { toast } = useToast();
  const [data, setData] = useState<Allowance[]>(mockAllowances);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedAllowance, setSelectedAllowance] = useState<Allowance | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedAllowanceForStatus, setSelectedAllowanceForStatus] = useState<Allowance | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [allowanceToDelete, setAllowanceToDelete] = useState<Allowance | null>(null);

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
        item.title.toLowerCase().includes(searchLower) ||
        item.allowancesType.toLowerCase().includes(searchLower) ||
        item.value.toString().includes(search) ||
        item.externalIdCode.toString().includes(search) ||
        item.externalId.toString().includes(search)
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
          case "title":
            aValue = a.title;
            bValue = b.title;
            break;
          case "allowancesType":
            aValue = a.allowancesType;
            bValue = b.allowancesType;
            break;
          case "value":
            aValue = a.value;
            bValue = b.value;
            break;
          case "externalIdCode":
            aValue = a.externalIdCode;
            bValue = b.externalIdCode;
            break;
          case "externalId":
            aValue = a.externalId;
            bValue = b.externalId;
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

  const handleNewAllowance = () => {
    setSelectedAllowance(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleView = (item: Allowance) => {
    setSelectedAllowance(item);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (item: Allowance) => {
    setSelectedAllowance(item);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDeleteClick = (item: Allowance) => {
    setAllowanceToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (allowanceToDelete) {
      const renumberedData = data
        .filter((item) => item.id !== allowanceToDelete.id)
        .map((item, index) => ({
          ...item,
          serialNo: index + 1,
        }));
      setData(renumberedData);
      toast({
        title: "Success",
        description: `Allowance "${allowanceToDelete.title}" has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setAllowanceToDelete(null);
    }
  };

  const handleModalSubmit = (formData: AllowanceModalData) => {
    if (modalMode === "create") {
      const newAllowance: Allowance = {
        id: Date.now().toString(),
        serialNo: data.length + 1,
        title: formData.title,
        allowancesType: formData.allowancesType,
        value: formData.value,
        externalIdCode: formData.externalIdCode,
        externalId: formData.externalId,
        status: "Active",
      };
      setData((prev) => [...prev, newAllowance]);
      toast({
        title: "Success",
        description: "Allowance created successfully.",
      });
    } else if (modalMode === "edit" && selectedAllowance) {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedAllowance.id
            ? {
                ...item,
                title: formData.title,
                allowancesType: formData.allowancesType,
                value: formData.value,
                externalIdCode: formData.externalIdCode,
                externalId: formData.externalId,
              }
            : item
        )
      );
      toast({
        title: "Success",
        description: "Allowance updated successfully.",
      });
    }
  };

  const getModalData = (): AllowanceModalData | undefined => {
    if (!selectedAllowance) return undefined;
    return {
      id: selectedAllowance.id,
      title: selectedAllowance.title,
      allowancesType: selectedAllowance.allowancesType,
      value: selectedAllowance.value,
      externalIdCode: selectedAllowance.externalIdCode,
      externalId: selectedAllowance.externalId,
    };
  };

  const handleStatusClick = (item: Allowance) => {
    setSelectedAllowanceForStatus(item);
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedAllowanceForStatus) {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedAllowanceForStatus.id
            ? { ...item, status: newStatus as "Active" | "Inactive" }
            : item
        )
      );
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
      setSelectedAllowanceForStatus(null);
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
          <h1 className="text-3xl font-bold tracking-tight">Manage Allowances</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleNewAllowance}>
            <Plus className="h-4 w-4 mr-2" />
            New Allowance
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
                    onClick={() => handleSort("title")}
                  >
                    <span className="mr-2">Title</span>
                    {getSortIcon("title")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("allowancesType")}
                  >
                    <span className="mr-2">Allowances Type</span>
                    {getSortIcon("allowancesType")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("value")}
                  >
                    <span className="mr-2">Value</span>
                    {getSortIcon("value")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 hover:bg-transparent"
                    onClick={() => handleSort("externalIdCode")}
                  >
                    <span className="mr-2">External ID Code</span>
                    {getSortIcon("externalIdCode")}
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
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No allowances found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.serialNo}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.allowancesType}</TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>{item.externalIdCode}</TableCell>
                    <TableCell>{item.externalId}</TableCell>
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
            {totalPages > 0 && (
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={filteredData.length === 0}
              >
                1
              </Button>
            )}
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

      {/* Allowance Modal */}
      <AllowanceModal
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
              This action cannot be undone. This will permanently delete the allowance{" "}
              <span className="font-semibold">"{allowanceToDelete?.title}"</span> and remove it from
              your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAllowanceToDelete(null)}>Cancel</AlertDialogCancel>
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
        title="Change Allowance Status"
        nameLabel="Allowance Title"
        nameValue={selectedAllowanceForStatus?.title || ""}
        currentStatus={selectedAllowanceForStatus?.status || ""}
        statusOptions={["Active", "Inactive"]}
        onConfirm={handleStatusUpdate}
      />
    </div>
  );
}

