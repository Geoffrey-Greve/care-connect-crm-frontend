import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ChevronUp, ChevronDown, Plus, Filter, MoreVertical, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddStaffForm from "@/components/AddStaffForm";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { mockArchivedStaff } from "./StaffArchived";

interface Staff {
  id: string;
  serialNo: number;
  fullName: string;
  email: string;
  primaryPhoneNumber: string;
  userType: string;
  status: "Active" | "Inactive";
}

type SortField = 'serialNo' | 'fullName' | 'email' | 'primaryPhoneNumber' | 'userType' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export default function StaffList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [staff, setStaff] = useState<Staff[]>(mockArchivedStaff);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isAddStaffFormOpen, setIsAddStaffFormOpen] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    name: "",
    email: "",
    mobileNumber: "",
  });

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

  // Filter and sort staff
  const filteredAndSortedStaff = useMemo(() => {
    let result = [...staff];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(s =>
        s.fullName.toLowerCase().includes(searchLower) ||
        s.email.toLowerCase().includes(searchLower) ||
        s.primaryPhoneNumber.includes(searchLower) ||
        s.userType.toLowerCase().includes(searchLower)
      );
    }

    // Apply advanced filters
    if (advancedFilters.name) {
      result = result.filter(s =>
        s.fullName.toLowerCase().includes(advancedFilters.name.toLowerCase())
      );
    }
    if (advancedFilters.email) {
      result = result.filter(s =>
        s.email.toLowerCase().includes(advancedFilters.email.toLowerCase())
      );
    }
    if (advancedFilters.mobileNumber) {
      result = result.filter(s =>
        s.primaryPhoneNumber.includes(advancedFilters.mobileNumber)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case 'serialNo':
            aValue = a.serialNo;
            bValue = b.serialNo;
            break;
          case 'fullName':
            aValue = a.fullName;
            bValue = b.fullName;
            break;
          case 'email':
            aValue = a.email;
            bValue = b.email;
            break;
          case 'primaryPhoneNumber':
            aValue = a.primaryPhoneNumber;
            bValue = b.primaryPhoneNumber;
            break;
          case 'userType':
            aValue = a.userType;
            bValue = b.userType;
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

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [staff, search, sortField, sortDirection, advancedFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedStaff.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedStaff = filteredAndSortedStaff.slice(startIndex, endIndex);

  const handleStatusClick = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedStaff) return;

    setIsTogglingStatus(true);
    try {
      // Toggle status
      const newStatus = selectedStaff.status === "Active" ? "Inactive" : "Active";
      setStaff(staff.map(s =>
        s.id === selectedStaff.id
          ? { ...s, status: newStatus as "Active" | "Inactive" }
          : s
      ));
      toast({
        title: "Status Updated",
        description: `${selectedStaff.fullName}'s status has been updated to ${newStatus}.`,
      });
      setShowStatusModal(false);
      setSelectedStaff(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to update status";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setShowAdvancedFilter(false);
  };

  const handleClearFilters = () => {
    setAdvancedFilters({
      name: "",
      email: "",
      mobileNumber: "",
    });
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Staff</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select value={entriesPerPage.toString()} onValueChange={(value) => {
                setEntriesPerPage(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[80px] h-8">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Search:</span>
                <Input
                  type="text"
                  placeholder=""
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-[200px] h-8"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setShowAdvancedFilter(true)}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button size="sm" className="h-8" onClick={() => setIsAddStaffFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Staff
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <button
                      onClick={() => handleSort('serialNo')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Serial No
                      {getSortIcon('serialNo')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('fullName')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Full Name
                      {getSortIcon('fullName')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Email
                      {getSortIcon('email')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('primaryPhoneNumber')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Primary Phone Number
                      {getSortIcon('primaryPhoneNumber')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('userType')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      User Type
                      {getSortIcon('userType')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Status
                      {getSortIcon('status')}
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <span className="font-semibold">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStaff.length > 0 ? (
                  paginatedStaff.map((staffMember) => (
                    <TableRow key={staffMember.id}>
                      <TableCell>{staffMember.serialNo}</TableCell>
                      <TableCell>{staffMember.fullName}</TableCell>
                      <TableCell>{staffMember.email}</TableCell>
                      <TableCell>{staffMember.primaryPhoneNumber}</TableCell>
                      <TableCell>{staffMember.userType}</TableCell>
                      <TableCell>
                        <Badge
                          variant={staffMember.status === "Active" ? "secondary" : "destructive"}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleStatusClick(staffMember)}
                        >
                          {staffMember.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/staff/${staffMember.id}`)}>
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No staff members found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedStaff.length)} of {filteredAndSortedStaff.length} entries
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

      {/* Status Toggle Confirmation Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
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
                onClick={handleStatusChange}
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
                  setShowStatusModal(false);
                  setSelectedStaff(null);
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

      {/* Add Staff Form */}
      <AddStaffForm
        isOpen={isAddStaffFormOpen}
        onClose={() => setIsAddStaffFormOpen(false)}
        onSubmit={(data) => {
          // Handle form submission
          const newStaff: Staff = {
            id: `STAFF-${Date.now()}`,
            serialNo: staff.length + 1,
            fullName: data.fullName,
            email: data.email,
            primaryPhoneNumber: data.primaryPhoneNumber,
            userType: data.role,
            status: "Active",
          };
          setStaff([...staff, newStaff]);
          toast({
            title: "Staff Added",
            description: `${data.fullName} has been added successfully.`,
          });
        }}
      />

      {/* Advanced Filter Modal */}
      <Dialog open={showAdvancedFilter} onOpenChange={setShowAdvancedFilter}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Name</Label>
              <Input
                id="filter-name"
                placeholder="Enter staff name"
                value={advancedFilters.name}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-email">Email</Label>
              <Input
                id="filter-email"
                type="email"
                placeholder="Enter email address"
                value={advancedFilters.email}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-mobile">Mobile Number</Label>
              <Input
                id="filter-mobile"
                placeholder="Enter mobile number"
                value={advancedFilters.mobileNumber}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, mobileNumber: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button variant="outline" onClick={() => setShowAdvancedFilter(false)}>
              Close
            </Button>
            <Button onClick={handleApplyFilters}>
              Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

