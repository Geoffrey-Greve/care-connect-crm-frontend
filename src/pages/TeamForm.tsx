import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useGetTeamByIdQuery, useCreateTeamMutation, useUpdateTeamMutation } from "@/redux/api/teamApi";
import { useGetStaffsQuery } from "@/redux/api/staffApi";
import { useToast } from "@/hooks/use-toast";
import { ErrorDialog } from "@/components/ErrorDialog";

const TeamForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;

  // Fetch team data if editing
  const { data: teamData, isLoading: isLoadingTeam } = useGetTeamByIdQuery(
    parseInt(id || "0"),
    { skip: !isEditMode }
  );

  // Fetch staff list for multi-select
  const { data: staffsData, isLoading: isLoadingStaffs } = useGetStaffsQuery({ status: "1" });

  // Mutations
  const [createTeam, { isLoading: isCreatingTeam }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdatingTeam }] = useUpdateTeamMutation();

  // Form state
  const [teamTitle, setTeamTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load team data when editing
  useEffect(() => {
    if (teamData?.data) {
      const team = teamData.data;
      setTeamTitle(team.team_title);
      setDescription(team.description || "");
      setSelectedStaffIds(team.Members?.map(member => member.id) || []);
    }
  }, [teamData]);

  const handleStaffToggle = (staffId: number, checked: boolean) => {
    if (checked) {
      setSelectedStaffIds(prev => [...prev, staffId]);
    } else {
      setSelectedStaffIds(prev => prev.filter(id => id !== staffId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && staffsData?.data) {
      setSelectedStaffIds(staffsData.data.map(staff => staff.id));
    } else {
      setSelectedStaffIds([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Team title is required",
        variant: "destructive",
      });
      return;
    }

    if (selectedStaffIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one staff member",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditMode) {
        await updateTeam({
          id: parseInt(id!),
          data: {
            team_title: teamTitle,
            description: description || undefined,
            staff_ids: selectedStaffIds,
          },
        }).unwrap();
        toast({
          title: "Team Updated",
          description: "Team has been updated successfully.",
        });
        navigate("/team-list");
      } else {
        await createTeam({
          team_title: teamTitle,
          description: description || undefined,
          staff_ids: selectedStaffIds,
        }).unwrap();
        toast({
          title: "Team Created",
          description: "Team has been created successfully.",
        });
        navigate("/team-list");
      }
    } catch (error: any) {
      const errorMsg = error?.data?.message || `Failed to ${isEditMode ? "update" : "create"} team`;
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  if (isEditMode && isLoadingTeam) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/teams")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditMode ? "Edit Team" : "Create Team"}</h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? "Update team details" : "Create a new team with staff members"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Team Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Team Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-title">
                Team Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="team-title"
                placeholder="Enter team title"
                value={teamTitle}
                onChange={(e) => setTeamTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter team description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Staff Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select Staff Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingStaffs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Label>Staff Members <span className="text-destructive">*</span></Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedStaffIds.length === (staffsData?.data?.length || 0) && (staffsData?.data?.length || 0) > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="text-sm text-muted-foreground">Select All</Label>
                  </div>
                </div>

                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                  {staffsData?.data && staffsData.data.length > 0 ? (
                    staffsData.data.map((staff) => (
                      <div key={staff.id} className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedStaffIds.includes(staff.id)}
                          onCheckedChange={(checked) => handleStaffToggle(staff.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <Label className="font-medium">
                            {staff.first_name} {staff.last_name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {staff.email} • {staff.StaffDetail?.Role?.name || "No role"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No staff members available
                    </p>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {selectedStaffIds.length} staff member(s) selected
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/teams")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreatingTeam || isUpdatingTeam}>
            {isCreatingTeam || isUpdatingTeam ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditMode ? "Update Team" : "Create Team"
            )}
          </Button>
        </div>
      </form>

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  );
};

export default TeamForm;

