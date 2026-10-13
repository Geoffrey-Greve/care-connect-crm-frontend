import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Mail,
  MessageSquare,
  CalendarIcon,
  Phone,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Circle,
  AlertCircle,
  CheckCircle,
  Info,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useGetStaffsQuery, useGetStaffByIdQuery, useDeleteStaffMutation, useToggleStaffStatusMutation, useCreateStaffMutation, useUpdateStaffMutation } from "@/redux/api/staffApi";
import { useGetRolesQuery } from "@/redux/api/roleApi";
import { useGetLanguagesQuery } from "@/redux/api/languageApi";
import { useToast } from "@/hooks/use-toast";
import { ErrorDialog } from "@/components/ErrorDialog";
import { useTablePagination } from "@/hooks/useTablePagination";

const Team = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNewStaffDialogOpen, setIsNewStaffDialogOpen] = useState(false);
  const [isUpdateStaffDialogOpen, setIsUpdateStaffDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [documentFilter, setDocumentFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<number | null>(null);
  const [staffToToggleStatus, setStaffToToggleStatus] = useState<{ id: number; currentStatus: boolean } | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch staff data
  const statusParam = statusFilter === "all" ? undefined : statusFilter === "active" ? "1" : "0";
  const { data: staffsData, isLoading: isLoadingStaffs } = useGetStaffsQuery({ status: statusParam });

  // Mutations
  const [deleteStaff, { isLoading: isDeletingStaff }] = useDeleteStaffMutation();
  const [toggleStaffStatus, { isLoading: isTogglingStatus }] = useToggleStaffStatusMutation();

  // Transform API data
  const staffMembers = useMemo(() => {
    if (!staffsData?.data) return [];
    return staffsData.data.map((staff) => ({
      id: staff.id.toString(),
      name: `${staff.first_name} ${staff.last_name}`,
      gender: staff.gender || "N/A",
      role: staff.StaffDetail?.Role?.name || "N/A",
      team: "", // Teams not available in staff response
      email: staff.email,
      mobile: staff.primary_phone_number || "N/A",
      employmentType: staff.StaffDetail?.employment_type || "N/A",
      status: staff.status,
      staffData: staff,
    }));
  }, [staffsData]);

  // Filter staff by search term
  const filteredStaff = useMemo(() => {
    if (!searchTerm) return staffMembers;
    const search = searchTerm.toLowerCase();
    return staffMembers.filter(staff =>
      staff.name.toLowerCase().includes(search) ||
      staff.email.toLowerCase().includes(search) ||
      staff.mobile.includes(search) ||
      staff.role.toLowerCase().includes(search)
    );
  }, [staffMembers, searchTerm]);

  // Pagination hook
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
  } = useTablePagination(filteredStaff);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStaff(filteredStaff.map(staff => staff.id));
    } else {
      setSelectedStaff([]);
    }
  };

  const handleSelectStaff = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaff(prev => [...prev, staffId]);
    } else {
      setSelectedStaff(prev => prev.filter(id => id !== staffId));
    }
  };

  const handleDeleteClick = (staffId: number) => {
    setStaffToDelete(staffId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;

    try {
      await deleteStaff(staffToDelete).unwrap();
      setIsDeleteDialogOpen(false);
      setStaffToDelete(null);
      toast({
        title: "Staff Deleted",
        description: "Staff member has been deleted successfully.",
      });
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to delete staff";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleToggleStatusClick = (staffId: number, currentStatus: boolean) => {
    setStaffToToggleStatus({ id: staffId, currentStatus });
    setIsStatusDialogOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!staffToToggleStatus) return;

    try {
      await toggleStaffStatus({
        id: staffToToggleStatus.id,
        status: staffToToggleStatus.currentStatus ? 0 : 1,
      }).unwrap();
      setIsStatusDialogOpen(false);
      setStaffToToggleStatus(null);
      toast({
        title: "Status Updated",
        description: `Staff member has been ${staffToToggleStatus.currentStatus ? "deactivated" : "activated"}.`,
      });
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to update status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setIsStatusDialogOpen(false);
    }
  };

  const getOnboardingStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Circle className="h-4 w-4 text-gray-400" />;
      case "incomplete":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Staff</h1>
        <Dialog open={isNewStaffDialogOpen} onOpenChange={(open) => {
          setIsNewStaffDialogOpen(open);
          if (!open) {
            // Reset form when dialog closes
            setIsNewStaffDialogOpen(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <ChevronLeft className="h-5 w-5" />
                <div>
                  <DialogTitle className="text-2xl">New Employee</DialogTitle>
                  <p className="text-sm text-muted-foreground">Staff</p>
                </div>
              </div>
            </DialogHeader>
            {isNewStaffDialogOpen && <NewStaffForm onClose={() => setIsNewStaffDialogOpen(false)} />}
          </DialogContent>
        </Dialog>

        {/* Update Staff Dialog */}
        {selectedStaffId && (
          <Dialog open={isUpdateStaffDialogOpen} onOpenChange={(open) => {
            setIsUpdateStaffDialogOpen(open);
            if (!open) setSelectedStaffId(null);
          }}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center space-x-2">
                  <ChevronLeft className="h-5 w-5" />
                  <div>
                    <DialogTitle className="text-2xl">Update Employee</DialogTitle>
                    <p className="text-sm text-muted-foreground">Staff</p>
                  </div>
                </div>
              </DialogHeader>
              <UpdateStaffForm
                staffId={selectedStaffId}
                onClose={() => {
                  setIsUpdateStaffDialogOpen(false);
                  setSelectedStaffId(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
            className="w-full sm:w-64"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={documentFilter} onValueChange={setDocumentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Document Attached" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="attached">Attached</SelectItem>
              <SelectItem value="missing">Missing</SelectItem>
            </SelectContent>
          </Select>

          {/* <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-32">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <span className="text-sm text-muted-foreground">To</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-32">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="pointer-events-auto"
                  disabled={(date) => {
                    if (!startDate) return false;
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    const checkDate = new Date(date);
                    checkDate.setHours(0, 0, 0, 0);
                    return checkDate < start;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div> */}
        </div>
      </div>

      {/* Bulk Actions */}
      {/* <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" disabled={selectedStaff.length === 0}>
          <Mail className="h-4 w-4 mr-2" />
          Bulk Email
        </Button>
        <Button variant="outline" size="sm" disabled={selectedStaff.length === 0}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Bulk SMS
        </Button>
      </div> */}

      {/* Staff Table */}
      <div className="border rounded-lg overflow-x-auto">
        {isLoadingStaffs ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedStaff.length === filteredStaff.length && filteredStaff.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Employment Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No staff members found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((staff, index) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStaff.includes(staff.id)}
                        onCheckedChange={(checked) => handleSelectStaff(staff.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => navigate(`/staff-list/${staff.id}`)}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        {staff.name}
                      </button>
                    </TableCell>
                    <TableCell>{staff.gender}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{staff.role}</Badge>
                    </TableCell>
                    <TableCell>{staff.team}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.mobile}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{staff.employmentType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`cursor-pointer hover:opacity-80 transition-opacity ${
                          staff.status
                            ? "border-green-500 text-green-700 bg-green-50"
                            : "border-red-500 text-red-700 bg-red-50"
                        }`}
                        onClick={() => handleToggleStatusClick(parseInt(staff.id), staff.status)}
                      >
                        {staff.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/staff-list/${staff.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedStaffId(parseInt(staff.id));
                            setIsUpdateStaffDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem onClick={() => handleToggleStatusClick(parseInt(staff.id), staff.status)}>
                            {staff.status ? "Deactivate" : "Activate"}
                          </DropdownMenuItem> */}
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(parseInt(staff.id))}
                            className="text-destructive"
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
        )}
      </div>

      {/* Pagination */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this staff member? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeletingStaff}>
              {isDeletingStaff ? (
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
                onClick={handleConfirmToggleStatus}
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
                  setStaffToToggleStatus(null);
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
};

// New Employee Form Component
const NewStaffForm = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast();
  const [createStaff, { isLoading: isCreatingStaff }] = useCreateStaffMutation();
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery({});
  const { data: languagesData, isLoading: isLoadingLanguages } = useGetLanguagesQuery({});
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [useSalutation, setUseSalutation] = useState(true);
  const [salutation, setSalutation] = useState("Mr");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [roleId, setRoleId] = useState<number | null>(null);
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [employmentType, setEmploymentType] = useState("casual");
  const [address, setAddress] = useState("");
  const [languageId, setLanguageId] = useState<number | null>(null);

  // Compliance checkboxes (for skills array)
  const [policeClearance, setPoliceClearance] = useState(false);
  const [ndisWorkerScreening, setNdisWorkerScreening] = useState(false);
  const [ndisWorkerInduction, setNdisWorkerInduction] = useState(false);
  const [firstAidCPR, setFirstAidCPR] = useState(false);
  const [infectionControlTraining, setInfectionControlTraining] = useState(false);

  // Reset form when component mounts
  React.useEffect(() => {
    setUseSalutation(true);
    setSalutation("Mr");
    setFirstName("");
    setLastName("");
    setEmail("");
    setUsername("");
    setPassword("");
    setMobileNumber("");
    setPhoneNumber("");
    setRoleId(null);
    setGender("");
    setDateOfBirth(undefined);
    setEmploymentType("casual");
    setAddress("");
    setLanguageId(null);
    setPoliceClearance(false);
    setNdisWorkerScreening(false);
    setNdisWorkerInduction(false);
    setFirstAidCPR(false);
    setInfectionControlTraining(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!firstName || !lastName || !email || !username || !password || !roleId || !languageId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Build skills array from compliance checkboxes
    const skills: string[] = [];
    if (policeClearance) skills.push("police-clearance");
    if (ndisWorkerScreening) skills.push("ndis-worker-screening");
    if (ndisWorkerInduction) skills.push("ndis-worker-induction");
    if (firstAidCPR) skills.push("first-aid-cpr");
    if (infectionControlTraining) skills.push("infection-control-training");

    try {
      await createStaff({
        salutation: useSalutation ? salutation : undefined,
        first_name: firstName,
        last_name: lastName,
        gender: gender || undefined,
        date_of_birth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : undefined,
        primary_phone_number: mobileNumber || undefined,
        secondary_phone_number: phoneNumber || undefined,
        email,
        username,
        password,
        address: address || undefined,
        profile_img: undefined, // Optional - can be added later if needed
        role_id: roleId!,
        employment_type: employmentType,
        skills: skills.length > 0 ? skills : undefined,
        language: languageId!,
      }).unwrap();

      toast({
        title: "Staff Created",
        description: "Staff member has been created successfully.",
      });
      onClose();
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to create staff";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Staff Detail</h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>No Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Name Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="name">Name:</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-salutation"
                  checked={useSalutation}
                  onCheckedChange={(checked) => setUseSalutation(checked as boolean)}
                />
                <Label htmlFor="use-salutation" className="text-blue-500">Use salutation</Label>
              </div>
            </div>

            <div className={`grid gap-4 ${useSalutation ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {useSalutation && (
                <Select value={salutation} onValueChange={setSalutation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Input
                placeholder="Enter First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                placeholder="Enter Last/Family Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email: <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter Email"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="username">Username: <span className="text-destructive">*</span></Label>
            <Input
              id="username"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password: <span className="text-destructive">*</span></Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <Label>Contact:</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Mobile Number"
                  className="pl-10"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Phone Number"
                  className="pl-10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role: <span className="text-destructive">*</span></Label>
            <Select
              value={roleId?.toString() || ""}
              onValueChange={(value) => setRoleId(parseInt(value))}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {isLoadingRoles ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : rolesData?.data?.filter((role: any) => role.status === true || role.status === 1).length > 0 ? (
                  rolesData.data.filter((role: any) => role.status === true || role.status === 1).map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>No data available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gender:</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dob">Date Of Birth:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, "dd-MM-yyyy") : "23-09-2025"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={setDateOfBirth}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="employment-type">Employment Type:</Label>
            <Select value={employmentType} onValueChange={setEmploymentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="address">Address:</Label>
            <Input
              id="address"
              placeholder="Enter Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Skills</Label>
            <div className="space-y-3 max-h-[200px] overflow-y-auto border rounded-md p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="police-clearance"
                  checked={policeClearance}
                  onCheckedChange={(checked) => setPoliceClearance(checked === true)}
                />
                <Label htmlFor="police-clearance">Police Clearance</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ndis-worker-screening"
                  checked={ndisWorkerScreening}
                  onCheckedChange={(checked) => setNdisWorkerScreening(checked === true)}
                />
                <Label htmlFor="ndis-worker-screening">NDIS Worker Screening Check</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ndis-worker-induction"
                  checked={ndisWorkerInduction}
                  onCheckedChange={(checked) => setNdisWorkerInduction(checked === true)}
                />
                <Label htmlFor="ndis-worker-induction">NDIS Worker Induction</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="first-aid-cpr"
                  checked={firstAidCPR}
                  onCheckedChange={(checked) => setFirstAidCPR(checked === true)}
                />
                <Label htmlFor="first-aid-cpr">First Aid and CPR</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="infection-control"
                  checked={infectionControlTraining}
                  onCheckedChange={(checked) => setInfectionControlTraining(checked === true)}
                />
                <Label htmlFor="infection-control">Infection Control Training</Label>
              </div>
            </div>
          </div>


          {/* Language Selection */}
          <div>
            <Label htmlFor="language">Language: <span className="text-destructive">*</span></Label>
            <Select
              value={languageId?.toString() || ""}
              onValueChange={(value) => setLanguageId(parseInt(value))}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {isLoadingLanguages ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : languagesData?.data?.filter((lang: any) => lang.status === true || lang.status === 1).length > 0 ? (
                  languagesData.data.filter((lang: any) => lang.status === true || lang.status === 1).map((lang) => (
                    <SelectItem key={lang.id} value={lang.id.toString()}>
                      {lang.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>No data available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-6 pt-6">
        <Button type="button" variant="outline" onClick={onClose} className="min-w-[120px]">
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 min-w-[120px]" disabled={isCreatingStaff}>
          {isCreatingStaff ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create"
          )}
        </Button>
      </div>

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </form>
  );
};

// Update Staff Form Component
const UpdateStaffForm = ({ staffId, onClose }: { staffId: number; onClose: () => void }) => {
  const { toast } = useToast();
  const [updateStaff, { isLoading: isUpdatingStaff }] = useUpdateStaffMutation();
  const { data: staffData, isLoading: isLoadingStaff } = useGetStaffByIdQuery(staffId, { skip: !staffId });
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery({});
  const { data: languagesData, isLoading: isLoadingLanguages } = useGetLanguagesQuery({});
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [useSalutation, setUseSalutation] = useState(true);
  const [salutation, setSalutation] = useState("Mr");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // Optional for update
  const [mobileNumber, setMobileNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [roleId, setRoleId] = useState<number | null>(null);
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [employmentType, setEmploymentType] = useState("casual");
  const [address, setAddress] = useState("");
  const [languageId, setLanguageId] = useState<number | null>(null);

  // Compliance checkboxes (for skills array)
  const [policeClearance, setPoliceClearance] = useState(false);
  const [ndisWorkerScreening, setNdisWorkerScreening] = useState(false);
  const [ndisWorkerInduction, setNdisWorkerInduction] = useState(false);
  const [firstAidCPR, setFirstAidCPR] = useState(false);
  const [infectionControlTraining, setInfectionControlTraining] = useState(false);

  // Populate form when staff data is loaded
  React.useEffect(() => {
    if (staffData?.data) {
      const staff: any = staffData.data;
      setSalutation(staff.salutation || "Mr");
      setUseSalutation(!!staff.salutation);
      setFirstName(staff.first_name || "");
      setLastName(staff.last_name || "");
      setEmail(staff.email || "");
      setUsername(staff.username || "");
      setMobileNumber(staff.primary_phone_number || "");
      setPhoneNumber(staff.secondary_phone_number || "");
      setGender(staff.gender || "");
      setDateOfBirth(staff.date_of_birth ? new Date(staff.date_of_birth) : undefined);
      setAddress(staff.address || "");
      setRoleId(staff.StaffDetail?.role_id || null);
      setEmploymentType(staff.StaffDetail?.employment_type || "casual");
      setLanguageId(staff.StaffDetail?.language_id || staff.StaffDetail?.language || null);

      // Parse skills array
      const skills = staff.StaffDetail?.skills || [];
      setPoliceClearance(skills.includes("police-clearance"));
      setNdisWorkerScreening(skills.includes("ndis-worker-screening"));
      setNdisWorkerInduction(skills.includes("ndis-worker-induction"));
      setFirstAidCPR(skills.includes("first-aid-cpr"));
      setInfectionControlTraining(skills.includes("infection-control-training"));
    }
  }, [staffData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation (password is optional for update)
    if (!firstName || !lastName || !email || !username || !roleId || !languageId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Build skills array from compliance checkboxes
    const skills: string[] = [];
    if (policeClearance) skills.push("police-clearance");
    if (ndisWorkerScreening) skills.push("ndis-worker-screening");
    if (ndisWorkerInduction) skills.push("ndis-worker-induction");
    if (firstAidCPR) skills.push("first-aid-cpr");
    if (infectionControlTraining) skills.push("infection-control-training");

    try {
      const updatePayload: any = {
        salutation: useSalutation ? salutation : undefined,
        first_name: firstName,
        last_name: lastName,
        gender: gender || undefined,
        date_of_birth: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : undefined,
        primary_phone_number: mobileNumber || undefined,
        secondary_phone_number: phoneNumber || undefined,
        email,
        username,
        address: address || undefined,
        profile_img: undefined, // Optional - can be added later if needed
        role_id: roleId!,
        employment_type: employmentType,
        skills: skills.length > 0 ? skills : undefined,
        language: languageId!,
      };

      // Only include password if provided
      if (password) {
        updatePayload.password = password;
      }

      await updateStaff({
        id: staffId,
        data: updatePayload,
      }).unwrap();

      toast({
        title: "Staff Updated",
        description: "Staff member has been updated successfully.",
      });
      onClose();
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to update staff";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  if (isLoadingStaff) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Staff Detail</h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>No Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Name Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="name">Name:</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-salutation-update"
                  checked={useSalutation}
                  onCheckedChange={(checked) => setUseSalutation(checked as boolean)}
                />
                <Label htmlFor="use-salutation-update" className="text-blue-500">Use salutation</Label>
              </div>
            </div>

            <div className={`grid gap-4 ${useSalutation ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {useSalutation && (
                <Select value={salutation} onValueChange={setSalutation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Input
                placeholder="Enter First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                placeholder="Enter Last/Family Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email-update">Email: <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email-update"
                type="email"
                placeholder="Enter Email"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="username-update">Username: <span className="text-destructive">*</span></Label>
            <Input
              id="username-update"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password-update">Password: <span className="text-muted-foreground text-xs">(Leave empty to keep current password)</span></Label>
            <Input
              id="password-update"
              type="password"
              placeholder="Enter New Password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <Label>Contact:</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Mobile Number"
                  className="pl-10"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Phone Number"
                  className="pl-10"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role-update">Role: <span className="text-destructive">*</span></Label>
            <Select
              value={roleId?.toString() || ""}
              onValueChange={(value) => setRoleId(parseInt(value))}
            >
              <SelectTrigger id="role-update">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {rolesData?.data?.filter((role: any) => role.status === true || role.status === 1).map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender-update">Gender:</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dob-update">Date Of Birth:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(dateOfBirth, "dd-MM-yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={setDateOfBirth}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="employment-type-update">Employment Type:</Label>
            <Select value={employmentType} onValueChange={setEmploymentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="address-update">Address:</Label>
            <Input
              id="address-update"
              placeholder="Enter Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language-update">Language: <span className="text-destructive">*</span></Label>
            <Select
              value={languageId?.toString() || ""}
              onValueChange={(value) => setLanguageId(parseInt(value))}
            >
              <SelectTrigger id="language-update">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {isLoadingLanguages ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : languagesData?.data?.filter((lang: any) => lang.status === true || lang.status === 1).length > 0 ? (
                  languagesData.data.filter((lang: any) => lang.status === true || lang.status === 1).map((lang) => (
                    <SelectItem key={lang.id} value={lang.id.toString()}>
                      {lang.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-data" disabled>No data available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Compliance Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Skills</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="police-clearance-update"
                  checked={policeClearance}
                  onCheckedChange={(checked) => setPoliceClearance(checked === true)}
                />
                <Label htmlFor="police-clearance-update">Police Clearance</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ndis-worker-screening-update"
                  checked={ndisWorkerScreening}
                  onCheckedChange={(checked) => setNdisWorkerScreening(checked === true)}
                />
                <Label htmlFor="ndis-worker-screening-update">NDIS Worker Screening Check</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ndis-worker-induction-update"
                  checked={ndisWorkerInduction}
                  onCheckedChange={(checked) => setNdisWorkerInduction(checked === true)}
                />
                <Label htmlFor="ndis-worker-induction-update">NDIS Worker Induction</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="first-aid-cpr-update"
                  checked={firstAidCPR}
                  onCheckedChange={(checked) => setFirstAidCPR(checked === true)}
                />
                <Label htmlFor="first-aid-cpr-update">First Aid and CPR</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="infection-control-update"
                  checked={infectionControlTraining}
                  onCheckedChange={(checked) => setInfectionControlTraining(checked === true)}
                />
                <Label htmlFor="infection-control-update">Infection Control Training</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-6 pt-6">
        <Button type="button" variant="outline" onClick={onClose} className="min-w-[120px]" disabled={isUpdatingStaff}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 min-w-[120px]" disabled={isUpdatingStaff}>
          {isUpdatingStaff ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            "Update"
          )}
        </Button>
      </div>

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </form>
  );
};

export default Team;