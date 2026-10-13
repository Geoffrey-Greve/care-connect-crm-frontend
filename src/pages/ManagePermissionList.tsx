import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Eye, MoreHorizontal, Pencil, Trash2, UsersRound, LineChart } from "lucide-react";
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
import StatusChangeModal from "@/components/StatusChangeModal";
import RoleModal, { RoleModalData } from "@/components/RoleModal";

interface PermissionRole {
  id: string;
  serialNo: number;
  roleName: string;
  status: "Active" | "Inactive";
}

const mockRoles: PermissionRole[] = [
  { id: "1", serialNo: 1, roleName: "Co-ordinator upfr", status: "Active" },
  { id: "2", serialNo: 2, roleName: "Driver", status: "Inactive" },
  { id: "3", serialNo: 3, roleName: "Carer", status: "Inactive" },
  { id: "4", serialNo: 4, roleName: "Client", status: "Active" },
  { id: "5", serialNo: 5, roleName: "Co-ordinator", status: "Active" },
  { id: "6", serialNo: 6, roleName: "Driver", status: "Inactive" },
  { id: "7", serialNo: 7, roleName: "Carer", status: "Inactive" },
  { id: "8", serialNo: 8, roleName: "Client", status: "Active" },
  { id: "9", serialNo: 9, roleName: "Co-ordinator", status: "Active" },
  { id: "10", serialNo: 10, roleName: "Driver", status: "Inactive" },
  { id: "11", serialNo: 11, roleName: "Carer", status: "Active" },
  { id: "12", serialNo: 12, roleName: "Client", status: "Inactive" },
];

export default function ManagePermissionList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<PermissionRole[]>(mockRoles);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedRoleForStatus, setSelectedRoleForStatus] = useState<PermissionRole | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<PermissionRole | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<"view" | "edit">("view");
  const [selectedRole, setSelectedRole] = useState<PermissionRole | null>(null);

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
    let filtered = data.filter((role) => role.roleName.toLowerCase().includes(search.toLowerCase()));

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number = "";
        let bValue: string | number = "";

        switch (sortField) {
          case "serialNo":
            aValue = a.serialNo;
            bValue = b.serialNo;
            break;
          case "roleName":
            aValue = a.roleName.toLowerCase();
            bValue = b.roleName.toLowerCase();
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

  const totalPages = Math.max(1, Math.ceil(filteredData.length / entriesPerPage));
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredData, currentPage, entriesPerPage]);

  const getSortIcon = (field: string) => {
    if (sortField !== field || !sortDirection) {
      return <ChevronUp className="h-4 w-4 text-muted-foreground opacity-50" />;
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="h-4 w-4 text-primary" />;
    }
    return <ChevronDown className="h-4 w-4 text-primary" />;
  };

  const handleRolePermissionClick = (role: PermissionRole) => {
    navigate(`/admin/manage-permissions/create?roleId=${role.id}&roleName=${encodeURIComponent(role.roleName)}`);
  };

  const handleMapKpiClick = (role: PermissionRole) => {
    navigate(`/admin/manage-permissions/kpi?roleId=${role.id}&roleName=${encodeURIComponent(role.roleName)}`);
  };

  const handleStatusClick = (role: PermissionRole) => {
    setSelectedRoleForStatus(role);
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedRoleForStatus) {
      setData((prev) =>
        prev.map((role) => (role.id === selectedRoleForStatus.id ? { ...role, status: newStatus as "Active" | "Inactive" } : role)),
      );
      toast({
        title: "Success",
        description: `Status updated to ${newStatus}.`,
      });
      setSelectedRoleForStatus(null);
    }
  };

  const handleView = (role: PermissionRole) => {
    setSelectedRole(role);
    setRoleModalMode("view");
    setRoleModalOpen(true);
  };

  const handleEdit = (role: PermissionRole) => {
    setSelectedRole(role);
    setRoleModalMode("edit");
    setRoleModalOpen(true);
  };

  const handleRoleSubmit = (formData: RoleModalData) => {
    if (selectedRole) {
      setData((prev) =>
        prev.map((item) => (item.id === selectedRole.id ? { ...item, roleName: formData.roleName } : item)),
      );
      toast({
        title: "Role Updated",
        description: "Role name has been updated successfully.",
      });
    }
  };

  const handleDeleteClick = (role: PermissionRole) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      const filtered = data.filter((role) => role.id !== roleToDelete.id).map((role, index) => ({
        ...role,
        serialNo: index + 1,
      }));
      setData(filtered);
      toast({
        title: "Role Deleted",
        description: `${roleToDelete.roleName} has been removed.`,
      });
      setRoleToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Permission List</h1>
        <p className="text-muted-foreground">Control role level permissions and KPI mappings.</p>
      </div>

      <div className="border rounded-lg bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={entriesPerPage.toString()}
              onValueChange={(value) => {
                setEntriesPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-20">
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
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search role..."
              className="h-8 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">
                  <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-transparent" onClick={() => handleSort("serialNo")}>
                    <span className="mr-2">Serial No</span>
                    {getSortIcon("serialNo")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-transparent" onClick={() => handleSort("roleName")}>
                    <span className="mr-2">Role Name</span>
                    {getSortIcon("roleName")}
                  </Button>
                </TableHead>
                <TableHead>Role Permission</TableHead>
                <TableHead>Map KPI</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-transparent" onClick={() => handleSort("status")}>
                    <span className="mr-2">Status</span>
                    {getSortIcon("status")}
                  </Button>
                </TableHead>
                <TableHead className="w-16 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No roles found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.serialNo}</TableCell>
                    <TableCell className="font-medium">{role.roleName}</TableCell>
                    <TableCell>
                      <button
                        className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1 text-sm font-semibold text-sky-700 hover:bg-sky-200 transition-colors"
                        onClick={() => handleRolePermissionClick(role)}
                      >
                        <UsersRound className="h-4 w-4" />
                        Role
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1 text-sm font-semibold text-sky-700 hover:bg-sky-200 transition-colors"
                        onClick={() => handleMapKpiClick(role)}
                      >
                        <LineChart className="h-4 w-4" />
                        KPI
                      </button>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex cursor-pointer items-center rounded-full border px-4 py-1 text-sm font-semibold ${
                          role.status === "Active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                        onClick={() => handleStatusClick(role)}
                      >
                        {role.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(role)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(role)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(role)}
                            className="text-red-600 focus:bg-red-50 focus:text-red-600"
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
        <div className="flex flex-wrap items-center justify-between gap-4 border-t px-4 py-3 text-sm text-muted-foreground">
          <div>
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="font-semibold">{currentPage}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Role Modal */}
      <RoleModal
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        mode={roleModalMode}
        data={
          selectedRole
            ? {
                id: selectedRole.id,
                roleName: selectedRole.roleName,
              }
            : undefined
        }
        onSubmit={handleRoleSubmit}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{roleToDelete?.roleName}</span>? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        title="Change Role Status"
        nameLabel="Role Name"
        nameValue={selectedRoleForStatus?.roleName || ""}
        currentStatus={selectedRoleForStatus?.status || ""}
        statusOptions={["Active", "Inactive"]}
        onConfirm={handleStatusUpdate}
      />
    </div>
  );
}


