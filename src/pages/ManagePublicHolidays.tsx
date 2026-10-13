import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, MoreHorizontal, Plus, Pencil, Eye, Trash2, Calendar, Loader2 } from "lucide-react";
import HolidayModal, { HolidayModalData } from "@/components/HolidayModal";
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
import {
  useGetPublicHolidaysQuery,
  useCreatePublicHolidayMutation,
  useUpdatePublicHolidayMutation,
  useDeletePublicHolidayMutation,
  useChangePublicHolidayStatusMutation,
} from "@/redux/api/publicHolidayApi";
import { ErrorDialog } from "@/components/ErrorDialog";
import type { PublicHoliday as PublicHolidayType } from "@/types/models";

interface PublicHoliday {
  id: string;
  serialNo: number;
  holidayDate: string;
  holidayName: string;
  status: "Active" | "Inactive";
  statusValue: number;
  rawData: PublicHolidayType;
}

export default function ManagePublicHolidays() {
  const { toast } = useToast();
  
  // Fetch public holidays from API
  const { data: holidaysData, isLoading: isLoadingHolidays } = useGetPublicHolidaysQuery();
  const [createPublicHoliday, { isLoading: isCreating }] = useCreatePublicHolidayMutation();
  const [updatePublicHoliday, { isLoading: isUpdating }] = useUpdatePublicHolidayMutation();
  const [deletePublicHoliday, { isLoading: isDeleting }] = useDeletePublicHolidayMutation();
  const [changePublicHolidayStatus, { isLoading: isTogglingStatus }] = useChangePublicHolidayStatusMutation();
  
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Transform API data to component format
  const data = useMemo(() => {
    if (!holidaysData?.data) return [];
    return holidaysData.data
      .filter((holiday: PublicHolidayType) => holiday.is_deleted === 0)
      .map((holiday: PublicHolidayType, index: number) => ({
        id: holiday.id.toString(),
        serialNo: index + 1,
        holidayDate: new Date(holiday.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        holidayName: holiday.name,
        status: holiday.status === 1 ? "Active" : "Inactive",
        statusValue: holiday.status,
        rawData: holiday,
      }));
  }, [holidaysData]);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedHoliday, setSelectedHoliday] = useState<PublicHoliday | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedHolidayForStatus, setSelectedHolidayForStatus] = useState<PublicHoliday | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<PublicHoliday | null>(null);

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
        item.holidayName.toLowerCase().includes(searchLower) ||
        item.holidayDate.toLowerCase().includes(searchLower)
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
          case "holidayDate":
            aValue = a.holidayDate;
            bValue = b.holidayDate;
            break;
          case "holidayName":
            aValue = a.holidayName;
            bValue = b.holidayName;
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

  const handleNewHoliday = () => {
    setSelectedHoliday(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleView = (item: PublicHoliday) => {
    setSelectedHoliday(item);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (item: PublicHoliday) => {
    setSelectedHoliday(item);
    setModalMode("edit");
    setModalOpen(true);
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for date input
  const formatDateForInput = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleModalSubmit = async (formData: HolidayModalData) => {
    try {
      if (modalMode === "create") {
        await createPublicHoliday({
          name: formData.holidayName,
          date: formData.holidayDate, // API expects YYYY-MM-DD format
        }).unwrap();
        toast({
          title: "Success",
          description: "Holiday created successfully.",
        });
      } else if (modalMode === "edit" && selectedHoliday) {
        await updatePublicHoliday({
          id: parseInt(selectedHoliday.id),
          data: {
            name: formData.holidayName,
            date: formData.holidayDate, // API expects YYYY-MM-DD format
          },
        }).unwrap();
        toast({
          title: "Success",
          description: "Holiday updated successfully.",
        });
      }
      setModalOpen(false);
      setSelectedHoliday(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to save holiday";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const getModalData = (): HolidayModalData | undefined => {
    if (!selectedHoliday) return undefined;
    // Convert from DD/MM/YYYY to YYYY-MM-DD for input
    const dateParts = selectedHoliday.rawData.date.split('-');
    const formattedDate = dateParts.length === 3 ? selectedHoliday.rawData.date : formatDateForInput(selectedHoliday.holidayDate);
    return {
      id: selectedHoliday.id,
      holidayDate: formattedDate,
      holidayName: selectedHoliday.holidayName,
    };
  };

  const handleStatusClick = (item: PublicHoliday) => {
    setSelectedHolidayForStatus(item);
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedHolidayForStatus) return;
    try {
      const statusValue = newStatus === "Active" ? 1 : 0;
      await changePublicHolidayStatus({
        id: parseInt(selectedHolidayForStatus.id),
        status: statusValue,
      }).unwrap();
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
      setStatusModalOpen(false);
      setSelectedHolidayForStatus(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to update status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setStatusModalOpen(false);
      setSelectedHolidayForStatus(null);
    }
  };

  const handleDeleteClick = (item: PublicHoliday) => {
    setHolidayToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!holidayToDelete) return;
    try {
      await deletePublicHoliday(parseInt(holidayToDelete.id)).unwrap();
      toast({
        title: "Success",
        description: `Holiday "${holidayToDelete.holidayName}" has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setHolidayToDelete(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to delete holiday";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setDeleteDialogOpen(false);
      setHolidayToDelete(null);
    }
  };

  const handleImportAustralianHolidays = () => {
    toast({
      title: "Import Holidays",
      description: "Australian holidays import feature will be implemented soon.",
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
          <h1 className="text-3xl font-bold tracking-tight">Manage Public Holidays</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleNewHoliday}>
            <Plus className="h-4 w-4 mr-2" />
            New Holiday
          </Button>
          <Button onClick={handleImportAustralianHolidays}>
            <Calendar className="h-4 w-4 mr-2" />
            Import Australian Holidays
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
              placeholder="Search holidays..."
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
          {isLoadingHolidays ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
                      onClick={() => handleSort("holidayDate")}
                    >
                      <span className="mr-2">Holiday Date</span>
                      {getSortIcon("holidayDate")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 hover:bg-transparent"
                      onClick={() => handleSort("holidayName")}
                    >
                      <span className="mr-2">Holiday Name</span>
                      {getSortIcon("holidayName")}
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
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No holidays found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.serialNo}</TableCell>
                    <TableCell>{item.holidayDate}</TableCell>
                    <TableCell>{item.holidayName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`cursor-pointer hover:opacity-80 transition-opacity ${
                          item.status === "Active"
                            ? "border-green-500 text-green-700 bg-green-50"
                            : "border-red-500 text-red-700 bg-red-50"
                        }`}
                        onClick={() => handleStatusClick(item)}
                      >
                        {item.status}
                      </Badge>
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
          )}
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

      {/* Holiday Modal */}
      <HolidayModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        data={getModalData()}
        onSubmit={handleModalSubmit}
      />

      {/* Status Change Modal */}
      {selectedHolidayForStatus && (
        <StatusChangeModal
          isOpen={statusModalOpen}
          onOpenChange={setStatusModalOpen}
          title="Update Holiday Status"
          nameLabel="Holiday Name"
          nameValue={selectedHolidayForStatus.holidayName}
          currentStatus={selectedHolidayForStatus.status}
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
              This action cannot be undone. This will permanently delete the holiday{" "}
              <span className="font-semibold">"{holidayToDelete?.holidayName}"</span> and remove it from
              your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setHolidayToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  );
}

