import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import StatusChangeModal from "@/components/StatusChangeModal";
import { useToast } from "@/hooks/use-toast";
import { useTablePagination } from "@/hooks/useTablePagination";
import {
  useGetSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
  useChangeSkillStatusMutation,
} from "@/redux/api/skillApi";
import { ErrorDialog } from "@/components/ErrorDialog";
import type { Skill as SkillType } from "@/types/models";

export default function ManageSkill() {
  const { toast } = useToast();
  
  // Fetch skills from API
  const { data: skillsData, isLoading: loading } = useGetSkillsQuery();
  const [createSkill, { isLoading: isCreating }] = useCreateSkillMutation();
  const [updateSkill, { isLoading: isUpdating }] = useUpdateSkillMutation();
  const [deleteSkill, { isLoading: isDeleting }] = useDeleteSkillMutation();
  const [changeSkillStatus, { isLoading: isTogglingStatus }] = useChangeSkillStatusMutation();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SkillType | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", category: "", level: "", icon: "", color: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SkillType | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusToggleItem, setStatusToggleItem] = useState<SkillType | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  // Transform API data
  const skills = useMemo(() => {
    if (!skillsData?.data) return [];
    return skillsData.data.filter((skill: SkillType) => skill.is_deleted === 0);
  }, [skillsData]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Skill name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingItem) {
        await updateSkill({
          id: editingItem.id,
          data: {
            name: formData.name,
            description: formData.description || undefined,
            category: formData.category || undefined,
            level: formData.level || undefined,
            icon: formData.icon || undefined,
            color: formData.color || undefined,
          },
        }).unwrap();
        toast({
          title: "Success",
          description: "Skill updated successfully.",
        });
      } else {
        await createSkill({
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category || undefined,
          level: formData.level || undefined,
          icon: formData.icon || undefined,
          color: formData.color || undefined,
        }).unwrap();
        toast({
          title: "Success",
          description: "Skill created successfully.",
        });
      }
      
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({ name: "", description: "", category: "", level: "", icon: "", color: "" });
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to save skill";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const handleEdit = (item: SkillType) => {
    setEditingItem(item);
    setFormData({ 
      name: item.name, 
      description: item.description || "",
      category: item.category || "",
      level: item.level || "",
      icon: item.icon || "",
      color: item.color || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (item: SkillType) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteSkill(itemToDelete.id).unwrap();
      toast({
        title: "Success",
        description: "Skill deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to delete skill";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleStatusClick = (item: SkillType) => {
    setStatusToggleItem(item);
    setIsStatusDialogOpen(true);
  };

  const handleConfirmStatusToggle = async (newStatus: string) => {
    if (!statusToggleItem) return;
    try {
      const statusValue = newStatus === "Active" ? 1 : 0;
      await changeSkillStatus({
        id: statusToggleItem.id,
        status: statusValue,
      }).unwrap();
      toast({
        title: "Success",
        description: `Skill ${statusValue === 1 ? "activated" : "deactivated"} successfully.`,
      });
      setIsStatusDialogOpen(false);
      setStatusToggleItem(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to update skill status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setIsStatusDialogOpen(false);
      setStatusToggleItem(null);
    }
  };

  const handleView = (item: SkillType) => {
    toast({
      title: "Skill Details",
      description: `Name: ${item.name}, Status: ${item.status === 1 ? 'Active' : 'Inactive'}`,
    });
  };

  const handleNewClick = () => {
    setEditingItem(null);
    setFormData({ name: "", description: "", category: "", level: "", icon: "", color: "" });
    setIsDialogOpen(true);
  };

  const filteredItems = useMemo(() => {
    return skills.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [skills, searchTerm]);

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
            <span className="font-medium text-foreground">Manage Skill</span>
          </p>
          <h1 className="text-3xl font-bold tracking-tight mt-2">Manage Skill</h1>
        </div>
        <Button onClick={handleNewClick} className="bg-[#1e293b] hover:bg-[#0f172a]">
          <Plus className="h-4 w-4 mr-2" />
          New Skill
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Serial No</TableHead>
                <TableHead className="font-semibold">Skill</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
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
                          item.status === 1
                            ? "border-green-500 text-green-700 bg-green-50"
                            : "border-red-500 text-red-700 bg-red-50"
                        }`}
                        onClick={() => handleStatusClick(item)}
                      >
                        {item.status === 1 ? "Active" : "Inactive"}
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
                          {/* <DropdownMenuItem onClick={() => handleView(item)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem> */}
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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
        </CardContent>
      </Card>

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
              Skill Form
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Skill <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Skill"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex justify-center gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                className="bg-[#1e293b] hover:bg-[#0f172a] px-8"
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingItem(null);
                  setFormData({ name: "", description: "", category: "", level: "", icon: "", color: "" });
                }}
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
              <span className="font-semibold text-foreground">{itemToDelete?.name}</span>? This action
              cannot be undone.
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

      {/* Status Change Modal */}
      {statusToggleItem && (
        <StatusChangeModal
          isOpen={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
          title="Update Skill Status"
          nameLabel="Skill Name"
          nameValue={statusToggleItem.name}
          currentStatus={statusToggleItem.status === 1 ? "Active" : "Inactive"}
          statusOptions={["Active", "Inactive"]}
          onConfirm={handleConfirmStatusToggle}
        />
      )}

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  );
}
