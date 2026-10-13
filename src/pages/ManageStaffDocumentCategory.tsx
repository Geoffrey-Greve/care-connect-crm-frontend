import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Eye, Edit, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTablePagination } from "@/hooks/useTablePagination";
import { ErrorDialog } from "@/components/ErrorDialog";
import { DEFAULT_TABLE_FETCH_LIMIT } from "@/lib/constants";
import {
  useGetStaffDocumentCategoriesQuery,
  useCreateStaffDocumentCategoryMutation,
  useUpdateStaffDocumentCategoryMutation,
  useChangeStaffDocumentCategoryStatusMutation,
  useDeleteStaffDocumentCategoryMutation,
} from "@/redux/api/staffDocumentCategoryApi";
import { StaffDocumentCategory } from "@/types/models";

export default function ManageStaffDocumentCategory() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StaffDocumentCategory | null>(null);
  const [statusChangingItem, setStatusChangingItem] = useState<StaffDocumentCategory | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StaffDocumentCategory | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  // API hooks
  const { data, isLoading } = useGetStaffDocumentCategoriesQuery({
    limit: DEFAULT_TABLE_FETCH_LIMIT,
  });
  const [createStaffDocumentCategory, { isLoading: isCreating }] = useCreateStaffDocumentCategoryMutation();
  const [updateStaffDocumentCategory, { isLoading: isUpdating }] = useUpdateStaffDocumentCategoryMutation();
  const [changeStaffDocumentCategoryStatus, { isLoading: isTogglingStatus }] = useChangeStaffDocumentCategoryStatusMutation();
  const [deleteStaffDocumentCategory, { isLoading: isDeleting }] = useDeleteStaffDocumentCategoryMutation();

  const categories = data?.data || [];
  const isSaving = isCreating || isUpdating;

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingItem) {
        await updateStaffDocumentCategory({
          id: editingItem.id,
          name: formData.name,
        }).unwrap();
      } else {
        await createStaffDocumentCategory({
          name: formData.name,
          status: true,
        }).unwrap();
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({ name: "" });
    } catch (error: any) {
      console.error('Error saving category:', error);
      const errorMsg = error?.data?.message || error?.data?.data?.message || error?.message || "Failed to save category";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const handleEdit = (item: StaffDocumentCategory) => {
    setEditingItem(item);
    setFormData({ name: item.name });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (item: StaffDocumentCategory) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteStaffDocumentCategory(itemToDelete.id).unwrap();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const errorMsg = error?.data?.message || error?.data?.data?.message || error?.message || "Failed to delete category";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleStatusClick = (item: StaffDocumentCategory) => {
    setStatusChangingItem(item);
    setIsStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangingItem) return;

    try {
      // Toggle status: if current is true/1, send 0; if false/0, send 1
      const newStatus = statusChangingItem.status ? 0 : 1;
      await changeStaffDocumentCategoryStatus({ id: statusChangingItem.id, status: newStatus }).unwrap();
      setIsStatusDialogOpen(false);
      setStatusChangingItem(null);
    } catch (error: any) {
      console.error('Error toggling status:', error);
      const errorMsg = error?.data?.message || error?.data?.data?.message || error?.message || "Failed to toggle status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setIsStatusDialogOpen(false);
    }
  };

  const handleNewClick = () => {
    setEditingItem(null);
    setFormData({ name: "" });
    setIsDialogOpen(true);
  };

  const filteredItems = useMemo(() => {
    return categories.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const {
    entriesPerPage,
    handleEntriesChange,
    paginatedItems,
    startIndex,
    showingStart,
    showingEnd,
    totalItems,
    pageCount,
    currentPage,
    setCurrentPage,
    canGoPrevious,
    canGoNext,
    goToPreviousPage,
    goToNextPage,
    resetToFirstPage,
  } = useTablePagination(filteredItems);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <span className="hover:underline cursor-pointer">Dashboard</span>
            {" > "}
            <span className="font-medium text-foreground">Manage Staff Document Categories</span>
          </p>
          <h1 className="text-3xl font-bold tracking-tight mt-2">Manage Staff Document Categories</h1>
        </div>
        <Button onClick={handleNewClick} className="bg-[#1e293b] hover:bg-[#0f172a]">
          <Plus className="h-4 w-4 mr-2" />
          New Document Category
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">Show</span>
          <Select value={entriesPerPage} onValueChange={handleEntriesChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">entries</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Search:</span>
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetToFirstPage();
            }}
            className="w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Serial No</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
              ) : (
                paginatedItems.map((item, index) => (
                <TableRow key={item.id}>
                    <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`cursor-pointer hover:opacity-80 transition-opacity ${
                        item.status
                          ? "border-green-500 text-green-700 bg-green-50"
                          : "border-red-500 text-red-700 bg-red-50"
                      }`}
                      onClick={() => handleStatusClick(item)}
                    >
                      {item.status ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Update
                        </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(item)}
                          className="text-red-600"
                            disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeleting ? "Deleting..." : "Delete"}
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {showingStart} to {showingEnd} of {totalItems} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={!canGoPrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === pageCount ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={!canGoNext}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold bg-yellow-100 py-3 -mt-6 -mx-6 mb-4">
              Staff Document Categories Form
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Category <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Category"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
              />
            </div>
            <div className="flex justify-center gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                className="bg-[#1e293b] hover:bg-[#0f172a] px-8"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                className="px-8"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setItemToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{itemToDelete?.name}</span>? This action cannot
              be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setItemToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete it"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Toggle Confirmation Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="rounded-full border-4 border-orange-200 p-3">
              <svg
                className="w-12 h-12 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Are you sure?</h3>
              <p className="text-gray-600 mt-2">
                Do you want to change the status?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleConfirmStatusChange}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                disabled={isTogglingStatus}
              >
                {isTogglingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Yes, change it!"
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsStatusDialogOpen(false);
                  setStatusChangingItem(null);
                }}
                variant="destructive"
                className="px-6"
                disabled={isTogglingStatus}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  );
}

