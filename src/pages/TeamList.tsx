import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Plus, MoreVertical, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import TeamForm, { TeamFormData } from "@/components/TeamForm";
import { useToast } from "@/hooks/use-toast";
import { 
  useGetTeamsQuery, 
  useToggleTeamStatusMutation, 
  useDeleteTeamMutation,
  useGetTeamByIdQuery,
  useUpdateTeamMutation,
  useCreateTeamMutation,
} from "@/redux/api/teamApi";
import { useGetStaffsQuery } from "@/redux/api/staffApi";
import { ErrorDialog } from "@/components/ErrorDialog";

type SortField = 'serialNo' | 'name' | 'staffCount' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export default function TeamList() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingTeamId, setViewingTeamId] = useState<number | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch teams from API
  const { data: teamsData, isLoading: isLoadingTeams, error: teamsError } = useGetTeamsQuery({});
  
  // Fetch staff for TeamForm
  const { data: staffsData } = useGetStaffsQuery({ status: "1" });

  // Fetch team by ID for editing
  const { data: teamData } = useGetTeamByIdQuery(
    editingTeamId || 0,
    { skip: !editingTeamId }
  );

  // Fetch team by ID for viewing
  const { data: viewingTeamData } = useGetTeamByIdQuery(
    viewingTeamId || 0,
    { skip: !viewingTeamId }
  );

  // Mutations
  const [toggleTeamStatus, { isLoading: isTogglingStatus }] = useToggleTeamStatusMutation();
  const [deleteTeam, { isLoading: isDeletingTeam }] = useDeleteTeamMutation();
  const [updateTeam, { isLoading: isUpdatingTeam }] = useUpdateTeamMutation();
  const [createTeam, { isLoading: isCreatingTeam }] = useCreateTeamMutation();

  // Transform API teams to display format
  const teams = useMemo(() => {
    if (!teamsData?.data) return [];
    return teamsData.data.map((team, index) => ({
      id: team.id,
      serialNo: index + 1,
      name: team.team_title,
      staffCount: team.Members?.length || 0,
      status: team.status === 1 ? "Active" : "Inactive",
      statusValue: team.status,
      staff: team.Members?.map(m => m.id.toString()) || [],
      note: team.description || "",
      rawTeam: team, // Keep reference to original team data
    }));
  }, [teamsData]);

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

  // Filter and sort teams
  const filteredAndSortedTeams = useMemo(() => {
    let result = [...teams];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(team =>
        team.name.toLowerCase().includes(searchLower) ||
        team.staffCount.toString().includes(searchLower) ||
        team.status.toLowerCase().includes(searchLower)
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
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'staffCount':
            aValue = a.staffCount;
            bValue = b.staffCount;
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

        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return result;
  }, [teams, search, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTeams.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedTeams = filteredAndSortedTeams.slice(startIndex, endIndex);

  const handleStatusClick = (teamId: number, currentStatus: number) => {
    setSelectedTeamId(teamId);
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedTeamId) return;

    try {
      const team = teams.find(t => t.id === selectedTeamId);
      if (!team) return;

      const newStatus = team.statusValue === 1 ? 0 : 1;
      await toggleTeamStatus({ id: selectedTeamId, status: newStatus }).unwrap();

      toast({
        title: "Status Updated",
        description: `Team status has been updated to ${newStatus === 1 ? "Active" : "Inactive"}.`,
      });

      setShowStatusModal(false);
      setSelectedTeamId(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to update status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setShowStatusModal(false);
      setSelectedTeamId(null);
    }
  };

  const handleDelete = async (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    try {
      await deleteTeam(teamId).unwrap();
      toast({
        title: "Team Deleted",
        description: `${team.name} has been deleted successfully.`,
      });
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to delete team";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const handleView = (teamId: number) => {
    setViewingTeamId(teamId);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (teamId: number) => {
    setEditingTeamId(teamId);
    setIsTeamFormOpen(true);
  };

  const handleTeamFormSubmit = async (data: TeamFormData) => {
    try {
      if (editingTeamId) {
        // Update existing team
        await updateTeam({
          id: editingTeamId,
          data: {
            team_title: data.title,
            description: data.note || undefined,
            staff_ids: data.staff.map(id => parseInt(id)),
          },
        }).unwrap();

        toast({
          title: "Team Updated",
          description: `Team "${data.title}" has been updated successfully.`,
        });
      } else {
        // Create new team
        await createTeam({
          team_title: data.title,
          description: data.note || undefined,
          staff_ids: data.staff.map(id => parseInt(id)),
        }).unwrap();

        toast({
          title: "Team Created",
          description: `Team "${data.title}" has been created successfully.`,
        });
      }
      setIsTeamFormOpen(false);
      setEditingTeamId(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || `Failed to ${editingTeamId ? "update" : "create"} team`;
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const handleCreateNewTeam = () => {
    setEditingTeamId(null);
    setIsTeamFormOpen(true);
  };

  // Prepare staff options for TeamForm
  const staffOptions = useMemo(() => {
    if (!staffsData?.data) return [];
    return staffsData.data.map(staff => ({
      id: staff.id.toString(),
      name: `${staff.first_name} ${staff.last_name}`,
    }));
  }, [staffsData]);

  // Prepare initial data for TeamForm when editing
  const initialFormData = useMemo(() => {
    if (!editingTeamId || !teamData?.data) return undefined;
    const team = teamData.data;
    return {
      title: team.team_title,
      staff: team.Members?.map(m => m.id.toString()) || [],
      note: team.description || "",
    };
  }, [editingTeamId, teamData]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Manage Teams</h1>
      </div>
      <Card>
        <CardContent className="p-4 md:p-6">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
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
                  className="w-full sm:w-[200px] h-8"
                />
              </div>
              <Button size="sm" className="h-8 w-full sm:w-auto" onClick={handleCreateNewTeam}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Team
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[600px]">
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
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Team Name
                      {getSortIcon('name')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('staffCount')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Staff Count
                      {getSortIcon('staffCount')}
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
                {isLoadingTeams ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : paginatedTeams.length > 0 ? (
                  paginatedTeams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.serialNo}</TableCell>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{team.staffCount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={team.status === "Active" ? "secondary" : "destructive"}
                          className={`cursor-pointer hover:opacity-80 transition-opacity ${
                            team.status === "Active"
                              ? "border-green-500 text-green-700 bg-green-50"
                              : "border-red-500 text-red-700 bg-red-50"
                          }`}
                          onClick={() => handleStatusClick(team.id, team.statusValue)}
                        >
                          {team.status}
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
                            <DropdownMenuItem onClick={() => handleView(team.id)}>
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(team.id)}>
                              Update
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(team.id)}
                              disabled={isDeletingTeam}
                            >
                              {isDeletingTeam ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No teams found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedTeams.length)} of {filteredAndSortedTeams.length} entries
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
                  setSelectedTeamId(null);
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

      {/* Team Form Modal */}
      <TeamForm
        isOpen={isTeamFormOpen}
        onClose={() => {
          setIsTeamFormOpen(false);
          setEditingTeamId(null);
        }}
        onSubmit={handleTeamFormSubmit}
        initialData={initialFormData}
        availableStaff={staffOptions}
      />

      {/* View Team Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold bg-blue-100 py-3 -mt-6 -mx-6 mb-4">
              Team Details
            </DialogTitle>
          </DialogHeader>
          {viewingTeamData?.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Team ID</Label>
                  <p className="font-medium">{viewingTeamData.data.id}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Status</Label>
                  <div>
                    <Badge
                      variant="outline"
                      className={
                        viewingTeamData.data.status === 1
                          ? "border-green-500 text-green-700 bg-green-50"
                          : "border-red-500 text-red-700 bg-red-50"
                      }
                    >
                      {viewingTeamData.data.status === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Team Title</Label>
                <p className="font-medium">{viewingTeamData.data.team_title}</p>
              </div>
              {viewingTeamData.data.description && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Description</Label>
                  <div 
                    className="font-medium prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: viewingTeamData.data.description }}
                  />
                </div>
              )}
              {viewingTeamData.data.Creator && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Created By</Label>
                  <p className="font-medium">
                    {viewingTeamData.data.Creator.first_name} {viewingTeamData.data.Creator.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{viewingTeamData.data.Creator.email}</p>
                </div>
              )}
              {viewingTeamData.data.Members && viewingTeamData.data.Members.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Team Members ({viewingTeamData.data.Members.length})</Label>
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                    {viewingTeamData.data.Members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">
                            {member.first_name} {member.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        {member.StaffDetail?.Role && (
                          <Badge variant="outline" className="text-xs">
                            {member.StaffDetail.Role.name}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setViewingTeamId(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  className="ml-2 bg-blue-500 hover:bg-blue-600"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setViewingTeamId(null);
                    handleEdit(viewingTeamData.data.id);
                  }}
                >
                  Edit Team
                </Button>
              </div>
            </div>
          )}
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

