import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, Loader2, Users } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetTeamsQuery, useToggleTeamStatusMutation, useDeleteTeamMutation } from "@/redux/api/teamApi";
import { useToast } from "@/hooks/use-toast";
import { ErrorDialog } from "@/components/ErrorDialog";

const Teams = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<number | null>(null);
  const [teamToToggleStatus, setTeamToToggleStatus] = useState<{ id: number; currentStatus: number } | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch teams data
  const statusParam = statusFilter === "all" ? undefined : statusFilter === "active" ? "1" : "0";
  const { data: teamsData, isLoading: isLoadingTeams } = useGetTeamsQuery({ status: statusParam });

  // Mutations
  const [deleteTeam, { isLoading: isDeletingTeam }] = useDeleteTeamMutation();
  const [toggleTeamStatus, { isLoading: isTogglingStatus }] = useToggleTeamStatusMutation();

  // Transform and filter teams
  const transformedTeams = useMemo(() => {
    if (!teamsData?.data) return [];
    return teamsData.data.map((team) => ({
      id: team.id.toString(),
      title: team.team_title,
      description: team.description || "No description",
      membersCount: team.Members?.length || 0,
      createdBy: team.Creator ? `${team.Creator.first_name} ${team.Creator.last_name}` : "Unknown",
      status: team.status === 1 ? "Active" : "Inactive",
      statusValue: team.status,
      teamData: team,
    }));
  }, [teamsData]);

  const filteredTeams = useMemo(() => {
    if (!searchTerm) return transformedTeams;
    const search = searchTerm.toLowerCase();
    return transformedTeams.filter(team =>
      team.title.toLowerCase().includes(search) ||
      team.description.toLowerCase().includes(search) ||
      team.createdBy.toLowerCase().includes(search)
    );
  }, [transformedTeams, searchTerm]);

  const handleDeleteClick = (teamId: number) => {
    setTeamToDelete(teamId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;

    try {
      await deleteTeam(teamToDelete).unwrap();
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
      toast({
        title: "Team Deleted",
        description: "Team has been deleted successfully.",
      });
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to delete team";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleToggleStatusClick = (teamId: number, currentStatus: number) => {
    setTeamToToggleStatus({ id: teamId, currentStatus });
    setIsStatusDialogOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!teamToToggleStatus) return;

    try {
      await toggleTeamStatus({
        id: teamToToggleStatus.id,
        status: teamToToggleStatus.currentStatus === 1 ? 0 : 1,
      }).unwrap();
      setIsStatusDialogOpen(false);
      setTeamToToggleStatus(null);
      toast({
        title: "Status Updated",
        description: `Team has been ${teamToToggleStatus.currentStatus === 1 ? "deactivated" : "activated"}.`,
      });
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to update status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setIsStatusDialogOpen(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-sm text-muted-foreground">Manage teams and their members</p>
        </div>
        <Button onClick={() => navigate("/teams/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter teams by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Teams List</CardTitle>
          <CardDescription>
            {isLoadingTeams ? "Loading teams..." : `${filteredTeams.length} team(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTeams ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No teams found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.title}</TableCell>
                      <TableCell className="max-w-md truncate">{team.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{team.membersCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>{team.createdBy}</TableCell>
                      <TableCell>
                        <Badge variant={team.statusValue === 1 ? "default" : "secondary"}>
                          {team.status}
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
                            <DropdownMenuItem onClick={() => navigate(`/teams/${team.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/teams/${team.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatusClick(parseInt(team.id), team.statusValue)}>
                              {team.statusValue === 1 ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(parseInt(team.id))}
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this team? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeletingTeam}>
              {isDeletingTeam ? (
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {teamToToggleStatus?.currentStatus === 1 ? "Deactivate" : "Activate"} Team
            </DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to {teamToToggleStatus?.currentStatus === 1 ? "deactivate" : "activate"} this team?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmToggleStatus} disabled={isTogglingStatus}>
              {isTogglingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
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

export default Teams;

