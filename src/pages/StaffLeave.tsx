import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown, Plus, MoreVertical, ChevronLeft, ChevronRight, Filter, Trash2, Check, X, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LeaveForm, { LeaveFormData } from "@/components/LeaveForm";
import { useToast } from "@/hooks/use-toast";
import { useGetStaffLeavesQuery, useCreateStaffLeaveMutation, useDeleteStaffLeaveMutation, useUpdateLeaveStatusMutation } from "@/redux/api/staffLeaveApi";
import { useGetStaffsQuery } from "@/redux/api/staffApi";
import { ErrorDialog } from "@/components/ErrorDialog";

interface Leave {
  id: string;
  serialNo: number;
  staffName: string;
  staffId: string;
  leaveDate: string; // Format: DD/MM/YYYY
  startTime: string | null; // Format: HH:MM or null if all day
  endTime: string | null; // Format: HH:MM or null if all day
  reason: string;
  appliedDate: string; // Format: DD/MM/YYYY
  status: "Approved" | "Pending" | "Rejected";
  startDate: string; // ISO format for sorting
  endDate: string; // ISO format for sorting
}

type SortField = 'serialNo' | 'staffName' | 'leaveDate' | 'startTime' | 'endTime' | 'reason' | 'appliedDate' | 'status';
type SortDirection = 'asc' | 'desc' | null;

// Helper function to format date from ISO to DD/MM/YYYY
const formatDate = (isoDate: string | null | undefined): string => {
  if (!isoDate || isoDate.trim() === "") {
    return "—";
  }
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return "—";
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "—";
  }
};

// Helper function to format date from DD/MM/YYYY to ISO
const parseDate = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
};

export default function StaffLeave() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isLeaveFormOpen, setIsLeaveFormOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; leaveId: string | null }>({
    isOpen: false,
    leaveId: null,
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterStaffId, setFilterStaffId] = useState<string>("");
  const [filterLeaveDate, setFilterLeaveDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // API hooks
  const { data: leavesData, isLoading: isLoadingLeaves, isFetching: isFetchingLeaves } = useGetStaffLeavesQuery({
    staff_id: filterStaffId ? parseInt(filterStaffId) : undefined,
    status: filterStatus || undefined,
  });
  const { data: staffsData } = useGetStaffsQuery({ status: "1" });
  const [createLeave, { isLoading: isCreatingLeave }] = useCreateStaffLeaveMutation();
  const [deleteLeave, { isLoading: isDeletingLeave }] = useDeleteStaffLeaveMutation();
  const [updateLeaveStatus, { isLoading: isUpdatingStatus }] = useUpdateLeaveStatusMutation();

  // Transform API data to UI format
  const leaves: Leave[] = useMemo(() => {
    if (!leavesData?.data) return [];
    
    return leavesData.data
      .filter((leave) => leave.is_deleted === 0)
      .map((leave, index) => {
        // Parse unavailable_dates - API returns it as a JSON string
        let unavailableDates: string[] = [];
        try {
          if (typeof leave.unavailable_dates === 'string') {
            unavailableDates = JSON.parse(leave.unavailable_dates);
          } else if (Array.isArray(leave.unavailable_dates)) {
            unavailableDates = leave.unavailable_dates;
          }
        } catch (error) {
          console.error('Error parsing unavailable_dates:', error);
          unavailableDates = [];
        }
        
        const startDate = unavailableDates[0] || null;
        const endDate = unavailableDates[unavailableDates.length - 1] || null;
        
        // Handle date range display
        let leaveDateDisplay = "—";
        if (startDate && endDate) {
          if (startDate === endDate) {
            leaveDateDisplay = formatDate(startDate);
          } else {
            leaveDateDisplay = `${formatDate(startDate)} - ${formatDate(endDate)}`;
          }
        } else if (startDate) {
          leaveDateDisplay = formatDate(startDate);
        }

        // Map status from API to UI format
        let statusDisplay: "Approved" | "Pending" | "Rejected" = "Pending";
        if (leave.status === "approve") statusDisplay = "Approved";
        else if (leave.status === "reject") statusDisplay = "Rejected";

        // Format time (remove seconds if present)
        const formatTime = (time?: string) => {
          if (!time) return null;
          return time.substring(0, 5); // HH:MM
        };

        return {
          id: leave.id.toString(),
          serialNo: index + 1,
          staffName: leave.Staff ? `${leave.Staff.first_name} ${leave.Staff.last_name}` : "Unknown Staff",
          staffId: leave.staff_id.toString(),
          leaveDate: leaveDateDisplay,
          startTime: leave.all_day === 1 ? null : formatTime(leave.start_time),
          endTime: leave.all_day === 1 ? null : formatTime(leave.end_time),
          reason: leave.reason || "",
          appliedDate: formatDate(leave.createdAt),
          status: statusDisplay,
          startDate: startDate || "",
          endDate: endDate || "",
        };
      });
  }, [leavesData]);

  // Transform staff data for dropdown
  const staffList = useMemo(() => {
    if (!staffsData?.data) return [];
    return staffsData.data
      .filter((staff) => {
        // API query already filters by status: "1", but handle both boolean and number/string formats
        const status = staff.status as any;
        return status === true || status === 1 || status === "1";
      })
      .map((staff) => ({
        id: staff.id.toString(),
        name: `${staff.first_name} ${staff.last_name}`,
      }));
  }, [staffsData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Filter and sort leaves
  const filteredAndSortedLeaves = useMemo(() => {
    let result = [...leaves];

    // Apply advanced filters
    if (filterStaffId) {
      result = result.filter(l => l.staffId === filterStaffId);
    }

    if (filterLeaveDate) {
      result = result.filter(l => {
        // Check if the selected date falls within the leave date range
        return l.startDate <= filterLeaveDate && l.endDate >= filterLeaveDate;
      });
    }

    if (filterStatus) {
      result = result.filter(l => l.status === filterStatus);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(l =>
        l.staffName.toLowerCase().includes(searchLower) ||
        l.reason.toLowerCase().includes(searchLower) ||
        l.leaveDate.toLowerCase().includes(searchLower) ||
        l.status.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number | null;
        let bValue: string | number | null;

        switch (sortField) {
          case 'serialNo':
            aValue = a.serialNo;
            bValue = b.serialNo;
            break;
          case 'staffName':
            aValue = a.staffName;
            bValue = b.staffName;
            break;
          case 'leaveDate':
            aValue = a.startDate;
            bValue = b.startDate;
            break;
          case 'startTime':
            aValue = a.startTime || "";
            bValue = b.startTime || "";
            break;
          case 'endTime':
            aValue = a.endTime || "";
            bValue = b.endTime || "";
            break;
          case 'reason':
            aValue = a.reason;
            bValue = b.reason;
            break;
          case 'appliedDate':
            aValue = parseDate(a.appliedDate);
            bValue = parseDate(b.appliedDate);
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (aValue === null || aValue === "") return 1;
        if (bValue === null || bValue === "") return -1;

        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return result;
  }, [leaves, search, sortField, sortDirection, filterStaffId, filterLeaveDate, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedLeaves.length / entriesPerPage);
  const paginatedLeaves = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredAndSortedLeaves.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredAndSortedLeaves, currentPage, entriesPerPage]);

  const handleDelete = (leaveId: string) => {
    setDeleteConfirmation({ isOpen: true, leaveId });
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.leaveId) {
      try {
        const leave = leaves.find(l => l.id === deleteConfirmation.leaveId);
        await deleteLeave(parseInt(deleteConfirmation.leaveId)).unwrap();
        toast({
          title: "Leave Deleted",
          description: leave ? `Leave for ${leave.staffName} has been deleted successfully.` : "Leave has been deleted successfully.",
        });
      } catch (error: any) {
        const errorMsg = error?.data?.message || "Failed to delete leave";
        setErrorMessage(errorMsg);
        setIsErrorDialogOpen(true);
      }
    }
    setDeleteConfirmation({ isOpen: false, leaveId: null });
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await updateLeaveStatus({
        id: parseInt(leaveId),
        data: { status: "approve" },
      }).unwrap();
      toast({
        title: "Leave Approved",
        description: "Leave request has been approved successfully.",
      });
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to approve leave";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      await updateLeaveStatus({
        id: parseInt(leaveId),
        data: { status: "reject" },
      }).unwrap();
      toast({
        title: "Leave Rejected",
        description: "Leave request has been rejected.",
      });
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to reject leave";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const handleLeaveFormSubmit = async (data: LeaveFormData) => {
    try {
      // Generate array of dates from start to end date
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const unavailableDates: string[] = [];
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        unavailableDates.push(d.toISOString().split('T')[0]);
      }

      // Format time to HH:MM:SS if not all day
      let startTime: string | undefined;
      let endTime: string | undefined;
      if (!data.allDay) {
        startTime = data.startTime ? `${data.startTime}:00` : undefined;
        endTime = data.endTime ? `${data.endTime}:00` : undefined;
      }

      await createLeave({
        staff_id: parseInt(data.staffId),
        unavailable_dates: unavailableDates,
        all_day: data.allDay ? 1 : 0,
        start_time: startTime,
        end_time: endTime,
        reason: data.reason,
      }).unwrap();

      const staffName = staffList.find(s => s.id === data.staffId)?.name || "Staff";
      toast({
        title: "Leave Created",
        description: `Leave request for ${staffName} has been created successfully.`,
      });
      setIsLeaveFormOpen(false);
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to create leave";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const handleAddLeave = () => {
    setIsLeaveFormOpen(true);
  };

  const handleFilter = () => {
    setIsFilterModalOpen(true);
  };

  const handleClearFilters = () => {
    setFilterStaffId("");
    setFilterLeaveDate("");
    setFilterStatus("");
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setIsFilterModalOpen(false);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Leave</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={handleFilter}>
            <Filter className="h-4 w-4" />
          </Button>
          <Button onClick={handleAddLeave}>
            <Plus className="h-4 w-4 mr-2" />
            New Leave
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={entriesPerPage.toString()}
                onValueChange={(value) => {
                  setEntriesPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
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
                placeholder=""
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-[200px]"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort('serialNo')}>
                    <div className="flex items-center gap-2">
                      Serial No
                      {getSortIcon('serialNo')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('staffName')}>
                    <div className="flex items-center gap-2">
                      Staff Name
                      {getSortIcon('staffName')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('leaveDate')}>
                    <div className="flex items-center gap-2">
                      Leave Date
                      {getSortIcon('leaveDate')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('startTime')}>
                    <div className="flex items-center gap-2">
                      Start Time
                      {getSortIcon('startTime')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('endTime')}>
                    <div className="flex items-center gap-2">
                      End Time
                      {getSortIcon('endTime')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('reason')}>
                    <div className="flex items-center gap-2">
                      Reason
                      {getSortIcon('reason')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('appliedDate')}>
                    <div className="flex items-center gap-2">
                      Applied Date
                      {getSortIcon('appliedDate')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLeaves || isFetchingLeaves ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : paginatedLeaves.length > 0 ? (
                  paginatedLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{leave.serialNo}</TableCell>
                      <TableCell className="font-medium">{leave.staffName}</TableCell>
                      <TableCell>{leave.leaveDate}</TableCell>
                      <TableCell>{leave.startTime || "-"}</TableCell>
                      <TableCell>{leave.endTime || "-"}</TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell>{leave.appliedDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            leave.status === "Approved"
                              ? "secondary"
                              : leave.status === "Pending"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isUpdatingStatus || isDeletingLeave}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {leave.status === "Pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleApproveLeave(leave.id)}
                                  disabled={isUpdatingStatus}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRejectLeave(leave.id)}
                                  disabled={isUpdatingStatus}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(leave.id)}
                              disabled={isDeletingLeave}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No leave records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedLeaves.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * entriesPerPage, filteredAndSortedLeaves.length)} of{" "}
              {filteredAndSortedLeaves.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || totalPages === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <LeaveForm
        header="New Leave"
        isOpen={isLeaveFormOpen}
        onClose={() => setIsLeaveFormOpen(false)}
        onSubmit={handleLeaveFormSubmit}
        staffList={staffList}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) => setDeleteConfirmation({ isOpen: open, leaveId: null })}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Leave</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this leave record? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmation({ isOpen: false, leaveId: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeletingLeave}>
              {isDeletingLeave ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Filter Modal */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filter Staff Leave</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-staff">Staff Name</Label>
              <Select
                value={filterStaffId || "all"}
                onValueChange={(value) => setFilterStaffId(value === "all" ? "" : value)}
              >
                <SelectTrigger id="filter-staff">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-leave-date">Leave Date</Label>
              <Input
                id="filter-leave-date"
                type="date"
                value={filterLeaveDate}
                onChange={(e) => setFilterLeaveDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-status">Status</Label>
              <Select
                value={filterStatus || "all"}
                onValueChange={(value) => setFilterStatus(value === "all" ? "" : value)}
              >
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button variant="outline" onClick={() => setIsFilterModalOpen(false)}>
              Close
            </Button>
            <Button onClick={handleApplyFilters}>
              Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  );
}

