import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreVertical, Eye, Edit, Trash2, Target, Calendar, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { 
  useGetClientGoalsQuery, 
  useCreateClientGoalMutation, 
  useUpdateClientGoalMutation, 
  useDeleteClientGoalMutation,
  useToggleGoalAchievedMutation,
  useToggleGoalClosedMutation,
  useChangeClientGoalStatusMutation
} from '@/redux/api/clientGoalApi';
import {
  useGetStrategiesQuery,
  useCreateStrategyMutation,
  useUpdateStrategyMutation,
  useDeleteStrategyMutation,
  useToggleStrategyCompletedMutation,
  useToggleStrategyReviewedMutation,
} from '@/redux/api/strategyApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { ErrorDialog } from '@/components/ErrorDialog';

// Mock goals data
const mockGoals = [
  {
    id: "GOAL-001",
    clientName: "Sarah Johnson",
    goalTitle: "Improve Communication Skills",
    commencementDate: "2024-01-15",
    dateAchieved: null,
    dateClosed: null,
    status: "Active",
  },
  {
    id: "GOAL-002",
    clientName: "Sarah Johnson",
    goalTitle: "Increase Independence in Daily Activities",
    commencementDate: "2024-02-01",
    dateAchieved: "2024-06-15",
    dateClosed: "2024-06-20",
    status: "Inactive",
  },
  {
    id: "GOAL-003",
    clientName: "Sarah Johnson",
    goalTitle: "Develop Social Connections",
    commencementDate: "2024-03-10",
    dateAchieved: null,
    dateClosed: null,
    status: "Active",
  },
];

type GoalSortField = 'clientName' | 'goalTitle' | 'commencementDate' | 'dateAchieved' | 'dateClosed' | 'status';
type GoalSortDirection = 'asc' | 'desc' | null;

interface ClientGoalsProps {
  clientName?: string;
  clientId?: number;
}

const ClientGoals: React.FC<ClientGoalsProps> = ({ clientName = "Sarah Johnson", clientId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch client goals from API
  const { data: goalsData, isLoading: isLoadingGoals } = useGetClientGoalsQuery(
    { client_id: clientId },
    { skip: !clientId }
  );
  
  // Fetch strategies from API
  const { data: strategiesData, isLoading: isLoadingStrategies } = useGetStrategiesQuery(
    { client_id: clientId },
    { skip: !clientId }
  );
  
  // Goal mutations
  const [createGoal, { isLoading: isCreatingGoal }] = useCreateClientGoalMutation();
  const [updateGoal, { isLoading: isUpdatingGoal }] = useUpdateClientGoalMutation();
  const [deleteGoal, { isLoading: isDeletingGoal }] = useDeleteClientGoalMutation();
  const [toggleAchieved, { isLoading: isTogglingAchieved }] = useToggleGoalAchievedMutation();
  const [toggleClosed, { isLoading: isTogglingClosed }] = useToggleGoalClosedMutation();
  const [changeGoalStatus, { isLoading: isChangingGoalStatus }] = useChangeClientGoalStatusMutation();

  // Strategy mutations
  const [createStrategy, { isLoading: isCreatingStrategy }] = useCreateStrategyMutation();
  const [updateStrategy, { isLoading: isUpdatingStrategy }] = useUpdateStrategyMutation();
  const [deleteStrategy, { isLoading: isDeletingStrategy }] = useDeleteStrategyMutation();
  const [toggleStrategyCompleted, { isLoading: isTogglingStrategyCompleted }] = useToggleStrategyCompletedMutation();
  const [toggleStrategyReviewed, { isLoading: isTogglingStrategyReviewed }] = useToggleStrategyReviewedMutation();
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isUpdateGoalOpen, setIsUpdateGoalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [isDeleteGoalDialogOpen, setIsDeleteGoalDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [goalSearch, setGoalSearch] = useState("");
  const [goalSortField, setGoalSortField] = useState<GoalSortField | null>(null);
  const [goalSortDirection, setGoalSortDirection] = useState<GoalSortDirection>(null);
  const [goalCurrentPage, setGoalCurrentPage] = useState(1);
  const [goalEntriesPerPage, setGoalEntriesPerPage] = useState(10);
  const [showStatusToggleConfirmation, setShowStatusToggleConfirmation] = useState(false);
  const [selectedGoalForStatus, setSelectedGoalForStatus] = useState<any>(null);
  const [goalForm, setGoalForm] = useState({
    clientName: clientName,
    goalTitle: "",
    commencementDate: "",
    dateAchieved: "",
    dateClosed: "",
    status: "Active",
    description: "",
    strategies: "",
  });
  
  // Strategy states
  const [isAddStrategyOpen, setIsAddStrategyOpen] = useState(false);
  const [isUpdateStrategyOpen, setIsUpdateStrategyOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [isDeleteStrategyDialogOpen, setIsDeleteStrategyDialogOpen] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState<number | null>(null);
  const [strategySearch, setStrategySearch] = useState("");
  const [strategyCurrentPage, setStrategyCurrentPage] = useState(1);
  const [strategyEntriesPerPage, setStrategyEntriesPerPage] = useState(10);
  const [strategyForm, setStrategyForm] = useState({
    goal_id: "",
    due_at: "",
    description: "",
  });

  // Transform API goals data
  const goalsArray = useMemo(() => {
    if (!goalsData?.data) return [];
    return goalsData.data.map((goal) => ({
      id: goal.id.toString(),
      clientName: goal.Client?.display_name || `${goal.Client?.first_name || ''} ${goal.Client?.last_name || ''}`.trim() || clientName,
      goalTitle: goal.title,
      commencementDate: goal.commencement_date,
      dateAchieved: goal.goal_achieved ? goal.updatedAt : null,
      dateClosed: goal.goal_closed ? goal.updatedAt : null,
      status: goal.status === 1 ? "Active" : "Inactive",
      description: goal.description || "",
      goal_achieved: goal.goal_achieved,
      goal_closed: goal.goal_closed,
    }));
  }, [goalsData, clientName]);

  const handleAddGoal = () => {
    setGoalForm({
      clientName: clientName,
      goalTitle: "",
      commencementDate: "",
      dateAchieved: "",
      dateClosed: "",
      status: "Active",
      description: "",
      strategies: "",
    });
    setIsAddGoalOpen(true);
  };

  // const handleViewGoal = (goal: any) => {
  //   if (clientId && goal.id) {
  //     navigate(`/clients/${clientId}/goals/${goal.id}`);
  //   } else {
  //     toast({
  //       title: "Error",
  //       description: "Unable to navigate to goal details",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const handleUpdateGoal = (goal: any) => {
    setSelectedGoal(goal);
    setGoalForm({
      clientName: goal.clientName,
      goalTitle: goal.goalTitle,
      commencementDate: goal.commencementDate || "",
      dateAchieved: goal.dateAchieved || "",
      dateClosed: goal.dateClosed || "",
      status: goal.status,
      description: "",
      strategies: "",
    });
    setIsUpdateGoalOpen(true);
  };

  const handleDeleteGoal = (goal: any) => {
    handleDeleteGoalClick(parseInt(goal.id));
  };

  const handleStrategies = (goal: any) => {
    setSelectedGoal(goal);
    toast({
      title: "Strategies",
      description: `Viewing strategies for ${goal.goalTitle}`,
    });
  };

  const handleGoalStatusClick = (goal: any) => {
    setSelectedGoalForStatus(goal);
    setShowStatusToggleConfirmation(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!selectedGoalForStatus) return;

    try {
      // Toggle status: if currently Active (1), set to Inactive (0), and vice versa
      const currentStatus = selectedGoalForStatus.status === "Active" || selectedGoalForStatus.status === 1 ? 1 : 0;
      const newStatus = currentStatus === 1 ? 0 : 1;
      const goalId = parseInt(selectedGoalForStatus.id);

      await changeGoalStatus({
        id: goalId,
        status: newStatus,
      }).unwrap();

      setShowStatusToggleConfirmation(false);
      setSelectedGoalForStatus(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to update goal status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setShowStatusToggleConfirmation(false);
    }
  };

  const handleGoalSort = (field: GoalSortField) => {
    if (goalSortField === field) {
      if (goalSortDirection === 'asc') {
        setGoalSortDirection('desc');
      } else if (goalSortDirection === 'desc') {
        setGoalSortField(null);
        setGoalSortDirection(null);
      }
    } else {
      setGoalSortField(field);
      setGoalSortDirection('asc');
    }
  };

  const getGoalSortIcon = (field: GoalSortField) => {
    if (goalSortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return goalSortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const handleGoalSubmit = async () => {
    // Validation
    if (!goalForm.goalTitle || !goalForm.commencementDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!clientId) {
      toast({
        title: "Error",
        description: "Client ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isUpdateGoalOpen && selectedGoal) {
        // Update existing goal
        await updateGoal({
          id: parseInt(selectedGoal.id),
          data: {
            title: goalForm.goalTitle,
            commencement_date: goalForm.commencementDate,
            description: goalForm.description,
          },
        }).unwrap();
        
        toast({
          title: "Goal Updated",
          description: "Goal details have been updated successfully.",
        });
      } else {
        // Add new goal
        await createGoal({
          client_id: clientId,
          title: goalForm.goalTitle,
          commencement_date: goalForm.commencementDate,
          description: goalForm.description,
        }).unwrap();
        
        toast({
          title: "Goal Added",
          description: "New goal has been added successfully.",
        });
      }

      // Reset form
      setGoalForm({
        clientName: clientName,
        goalTitle: "",
        commencementDate: "",
        dateAchieved: "",
        dateClosed: "",
        status: "Active",
        description: "",
        strategies: "",
      });
      setIsAddGoalOpen(false);
      setIsUpdateGoalOpen(false);
      setSelectedGoal(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to save goal",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoalClick = (goalId: number) => {
    setGoalToDelete(goalId);
    setIsDeleteGoalDialogOpen(true);
  };

  const handleConfirmDeleteGoal = async () => {
    if (!goalToDelete) return;

    try {
      await deleteGoal(goalToDelete).unwrap();
      setIsDeleteGoalDialogOpen(false);
      setGoalToDelete(null);
      toast({
        title: "Goal Deleted",
        description: "Goal has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const handleToggleAchieved = async (goalId: number, currentValue: number) => {
    try {
      await toggleAchieved({
        id: goalId,
        goal_achieved: currentValue === 1 ? 0 : 1,
      }).unwrap();
      
      toast({
        title: "Goal Updated",
        description: currentValue === 1 ? "Goal marked as not achieved" : "Goal marked as achieved",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const handleToggleClosed = async (goalId: number, currentValue: number) => {
    try {
      await toggleClosed({
        id: goalId,
        goal_closed: currentValue === 1 ? 0 : 1,
      }).unwrap();
      
      toast({
        title: "Goal Updated",
        description: currentValue === 1 ? "Goal reopened" : "Goal closed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  // Filter and sort goals
  const filteredAndSortedGoals = useMemo(() => {
    let result = [...goalsArray];

    // Apply search filter
    if (goalSearch) {
      const search = goalSearch.toLowerCase();
      result = result.filter(goal =>
        goal.clientName.toLowerCase().includes(search) ||
        goal.goalTitle.toLowerCase().includes(search) ||
        goal.status.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (goalSortField && goalSortDirection) {
      result.sort((a, b) => {
        let aValue: string | null;
        let bValue: string | null;

        switch (goalSortField) {
          case 'clientName':
            aValue = a.clientName;
            bValue = b.clientName;
            break;
          case 'goalTitle':
            aValue = a.goalTitle;
            bValue = b.goalTitle;
            break;
          case 'commencementDate':
            aValue = a.commencementDate;
            bValue = b.commencementDate;
            break;
          case 'dateAchieved':
            aValue = a.dateAchieved;
            bValue = b.dateAchieved;
            break;
          case 'dateClosed':
            aValue = a.dateClosed;
            bValue = b.dateClosed;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        return goalSortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }

    return result;
  }, [goalsArray, goalSearch, goalSortField, goalSortDirection]);

  // Goal pagination
  const goalTotalPages = Math.ceil(filteredAndSortedGoals.length / goalEntriesPerPage);
  const goalStartIndex = (goalCurrentPage - 1) * goalEntriesPerPage;
  const goalEndIndex = goalStartIndex + goalEntriesPerPage;
  const paginatedGoals = filteredAndSortedGoals.slice(goalStartIndex, goalEndIndex);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    return status === "Active" ? "secondary" : "outline";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Manage Client Goals</CardTitle>
            <Button onClick={handleAddGoal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex-1 sm:flex-initial sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search goals..."
                  value={goalSearch}
                  onChange={(e) => {
                    setGoalSearch(e.target.value);
                    setGoalCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={goalEntriesPerPage.toString()}
                  onValueChange={(value) => {
                    setGoalEntriesPerPage(Number(value));
                    setGoalCurrentPage(1);
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
            </div>

            {/* Goals Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">
                      Serial No
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleGoalSort('clientName')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Client Name
                        {getGoalSortIcon('clientName')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleGoalSort('goalTitle')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Goal Title
                        {getGoalSortIcon('goalTitle')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleGoalSort('commencementDate')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Commencement Date
                        {getGoalSortIcon('commencementDate')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleGoalSort('dateAchieved')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Date Achieved
                        {getGoalSortIcon('dateAchieved')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleGoalSort('dateClosed')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Date Closed
                        {getGoalSortIcon('dateClosed')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleGoalSort('status')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Status
                        {getGoalSortIcon('status')}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGoals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No goals found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedGoals.map((goal, index) => (
                      <TableRow key={goal.id}>
                        <TableCell className="font-medium">
                          {goalStartIndex + index + 1}
                        </TableCell>
                        <TableCell>{goal.clientName}</TableCell>
                        <TableCell className="font-medium">{goal.goalTitle}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(goal.commencementDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(goal.dateAchieved)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(goal.dateClosed)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusColor(goal.status) as any}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleGoalStatusClick(goal)}
                          >
                            {goal.status}
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
                              {/* <DropdownMenuItem onClick={() => handleViewGoal(goal)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem> */}
                              <DropdownMenuItem onClick={() => handleUpdateGoal(goal)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Update
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleAchieved(parseInt(goal.id), goal.goal_achieved)}>
                                {goal.goal_achieved === 1 ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Mark as Not Achieved
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as Achieved
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleClosed(parseInt(goal.id), goal.goal_closed)}>
                                {goal.goal_closed === 1 ? (
                                  <>
                                    <Target className="h-4 w-4 mr-2" />
                                    Reopen Goal
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Close Goal
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteGoal(goal)}
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
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {goalStartIndex + 1} to {Math.min(goalEndIndex, filteredAndSortedGoals.length)} of {filteredAndSortedGoals.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGoalCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={goalCurrentPage === 1 || goalTotalPages === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: goalTotalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === goalTotalPages ||
                      (page >= goalCurrentPage - 1 && page <= goalCurrentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={goalCurrentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setGoalCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === goalCurrentPage - 2 || page === goalCurrentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGoalCurrentPage(prev => Math.min(goalTotalPages, prev + 1))}
                  disabled={goalCurrentPage === goalTotalPages || goalTotalPages === 0}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Goal Sheet */}
      <Sheet open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Goal</SheetTitle>
            <SheetDescription>
              Add a new goal for this client. Fill in all required fields.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-client-name">Client Name <span className="text-destructive">*</span></Label>
              <Input
                id="goal-client-name"
                value={goalForm.clientName}
                onChange={(e) => setGoalForm({ ...goalForm, clientName: e.target.value })}
                placeholder="Enter client name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-title">Goal Title <span className="text-destructive">*</span></Label>
              <Input
                id="goal-title"
                value={goalForm.goalTitle}
                onChange={(e) => setGoalForm({ ...goalForm, goalTitle: e.target.value })}
                placeholder="Enter goal title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-commencement-date">Commencement Date <span className="text-destructive">*</span></Label>
              <Input
                id="goal-commencement-date"
                type="date"
                value={goalForm.commencementDate}
                onChange={(e) => setGoalForm({ ...goalForm, commencementDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-date-achieved">Date Achieved</Label>
              <Input
                id="goal-date-achieved"
                type="date"
                value={goalForm.dateAchieved}
                onChange={(e) => setGoalForm({ ...goalForm, dateAchieved: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-date-closed">Date Closed</Label>
              <Input
                id="goal-date-closed"
                type="date"
                value={goalForm.dateClosed}
                onChange={(e) => setGoalForm({ ...goalForm, dateClosed: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-status">Status</Label>
              <Select
                value={goalForm.status}
                onValueChange={(value) => setGoalForm({ ...goalForm, status: value })}
              >
                <SelectTrigger id="goal-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                placeholder="Enter goal description..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-strategies">Strategies</Label>
              <Textarea
                id="goal-strategies"
                value={goalForm.strategies}
                onChange={(e) => setGoalForm({ ...goalForm, strategies: e.target.value })}
                placeholder="Enter strategies to achieve this goal..."
                rows={4}
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGoalSubmit} disabled={isCreatingGoal}>
              {isCreatingGoal ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Goal"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Update Goal Sheet */}
      <Sheet open={isUpdateGoalOpen} onOpenChange={setIsUpdateGoalOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Goal</SheetTitle>
            <SheetDescription>
              Update goal information. Fill in all required fields.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update-goal-client-name">Client Name <span className="text-destructive">*</span></Label>
              <Input
                id="update-goal-client-name"
                value={goalForm.clientName}
                onChange={(e) => setGoalForm({ ...goalForm, clientName: e.target.value })}
                placeholder="Enter client name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-goal-title">Goal Title <span className="text-destructive">*</span></Label>
              <Input
                id="update-goal-title"
                value={goalForm.goalTitle}
                onChange={(e) => setGoalForm({ ...goalForm, goalTitle: e.target.value })}
                placeholder="Enter goal title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-goal-commencement-date">Commencement Date <span className="text-destructive">*</span></Label>
              <Input
                id="update-goal-commencement-date"
                type="date"
                value={goalForm.commencementDate}
                onChange={(e) => setGoalForm({ ...goalForm, commencementDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-goal-date-achieved">Date Achieved</Label>
              <Input
                id="update-goal-date-achieved"
                type="date"
                value={goalForm.dateAchieved}
                onChange={(e) => setGoalForm({ ...goalForm, dateAchieved: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-goal-date-closed">Date Closed</Label>
              <Input
                id="update-goal-date-closed"
                type="date"
                value={goalForm.dateClosed}
                onChange={(e) => setGoalForm({ ...goalForm, dateClosed: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-goal-status">Status</Label>
              <Select
                value={goalForm.status}
                onValueChange={(value) => setGoalForm({ ...goalForm, status: value })}
              >
                <SelectTrigger id="update-goal-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-goal-description">Description</Label>
              <Textarea
                id="update-goal-description"
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                placeholder="Enter goal description..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-goal-strategies">Strategies</Label>
              <Textarea
                id="update-goal-strategies"
                value={goalForm.strategies}
                onChange={(e) => setGoalForm({ ...goalForm, strategies: e.target.value })}
                placeholder="Enter strategies to achieve this goal..."
                rows={4}
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsUpdateGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGoalSubmit} disabled={isUpdatingGoal}>
              {isUpdatingGoal ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Goal"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Goal Confirmation Dialog */}
      <Dialog open={isDeleteGoalDialogOpen} onOpenChange={setIsDeleteGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this goal? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteGoalDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteGoal} disabled={isDeletingGoal}>
              {isDeletingGoal ? (
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

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />

      {/* Strategy Section */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Strategies</CardTitle>
            <Button onClick={() => setIsAddStrategyOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Strategy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex-1 sm:flex-initial sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search strategies..."
                  value={strategySearch}
                  onChange={(e) => {
                    setStrategySearch(e.target.value);
                    setStrategyCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={strategyEntriesPerPage.toString()}
                  onValueChange={(value) => {
                    setStrategyEntriesPerPage(Number(value));
                    setStrategyCurrentPage(1);
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
            </div>

            {/* Strategies Table */}
            {isLoadingStrategies ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Serial No</TableHead>
                      <TableHead>Goal</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Reviewed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!strategiesData?.data || strategiesData.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No strategies found
                        </TableCell>
                      </TableRow>
                    ) : (
                      strategiesData.data
                        .filter((strategy: any) => {
                          if (!strategySearch) return true;
                          const searchLower = strategySearch.toLowerCase();
                          return (
                            strategy.ClientGoal?.title?.toLowerCase().includes(searchLower) ||
                            strategy.description?.toLowerCase().includes(searchLower)
                          );
                        })
                        .slice(
                          (strategyCurrentPage - 1) * strategyEntriesPerPage,
                          strategyCurrentPage * strategyEntriesPerPage
                        )
                        .map((strategy: any, index: number) => (
                          <TableRow key={strategy.id}>
                            <TableCell>{(strategyCurrentPage - 1) * strategyEntriesPerPage + index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {strategy.ClientGoal?.title || "N/A"}
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {strategy.description || "N/A"}
                            </TableCell>
                            <TableCell>{formatDate(strategy.due_at)}</TableCell>
                            <TableCell>
                              <Badge variant={strategy.completed === 1 ? "secondary" : "outline"}>
                                {strategy.completed === 1 ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={strategy.reviewed === 1 ? "secondary" : "outline"}>
                                {strategy.reviewed === 1 ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedStrategy(strategy);
                                      setStrategyForm({
                                        goal_id: strategy.goal_id.toString(),
                                        due_at: strategy.due_at ? new Date(strategy.due_at).toISOString().split('T')[0] : "",
                                        description: strategy.description || "",
                                      });
                                      setIsUpdateStrategyOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      toggleStrategyCompleted({
                                        id: strategy.id,
                                        data: {
                                          completed: strategy.completed === 1 ? 0 : 1,
                                          completion_outcome: strategy.completed === 1 ? undefined : "Completed",
                                        },
                                      }).unwrap().then(() => {
                                        toast({
                                          title: "Strategy Updated",
                                          description: `Strategy has been ${strategy.completed === 1 ? "unmarked" : "marked"} as completed.`,
                                        });
                                      }).catch((error: any) => {
                                        const errorMsg = error?.data?.message || "Failed to update strategy";
                                        setErrorMessage(errorMsg);
                                        setIsErrorDialogOpen(true);
                                      });
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {strategy.completed === 1 ? "Mark Incomplete" : "Mark Complete"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      toggleStrategyReviewed({
                                        id: strategy.id,
                                        data: {
                                          reviewed: strategy.reviewed === 1 ? 0 : 1,
                                          review_outcome: strategy.reviewed === 1 ? undefined : "Reviewed",
                                        },
                                      }).unwrap().then(() => {
                                        toast({
                                          title: "Strategy Updated",
                                          description: `Strategy has been ${strategy.reviewed === 1 ? "unmarked" : "marked"} as reviewed.`,
                                        });
                                      }).catch((error: any) => {
                                        const errorMsg = error?.data?.message || "Failed to update strategy";
                                        setErrorMessage(errorMsg);
                                        setIsErrorDialogOpen(true);
                                      });
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {strategy.reviewed === 1 ? "Mark Unreviewed" : "Mark Reviewed"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setStrategyToDelete(strategy.id);
                                      setIsDeleteStrategyDialogOpen(true);
                                    }}
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
              </div>
            )}

            {/* Strategy Pagination */}
            {strategiesData?.data && strategiesData.data.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min((strategyCurrentPage - 1) * strategyEntriesPerPage + 1, strategiesData.data.length)} to{" "}
                  {Math.min(strategyCurrentPage * strategyEntriesPerPage, strategiesData.data.length)} of{" "}
                  {strategiesData.data.length} strategies
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStrategyCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={strategyCurrentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {strategyCurrentPage} of {Math.ceil((strategiesData.data.filter((s: any) => !strategySearch || s.description?.toLowerCase().includes(strategySearch.toLowerCase()) || s.ClientGoal?.title?.toLowerCase().includes(strategySearch.toLowerCase())).length) / strategyEntriesPerPage) || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setStrategyCurrentPage((prev) =>
                        Math.min(
                          Math.ceil((strategiesData.data.filter((s: any) => !strategySearch || s.description?.toLowerCase().includes(strategySearch.toLowerCase()) || s.ClientGoal?.title?.toLowerCase().includes(strategySearch.toLowerCase())).length) / strategyEntriesPerPage) || 1,
                          prev + 1
                        )
                      )
                    }
                    disabled={
                      strategyCurrentPage >=
                      Math.ceil((strategiesData.data.filter((s: any) => !strategySearch || s.description?.toLowerCase().includes(strategySearch.toLowerCase()) || s.ClientGoal?.title?.toLowerCase().includes(strategySearch.toLowerCase())).length) / strategyEntriesPerPage) || 1
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Strategy Sheet */}
      <Sheet open={isAddStrategyOpen} onOpenChange={setIsAddStrategyOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Strategy</SheetTitle>
            <SheetDescription>
              Add a new strategy for a goal. Fill in all required fields.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="strategy-goal-id">
                Goal <span className="text-destructive">*</span>
              </Label>
              <Select
                value={strategyForm.goal_id}
                onValueChange={(value) => setStrategyForm({ ...strategyForm, goal_id: value })}
              >
                <SelectTrigger id="strategy-goal-id">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  {goalsData?.data?.map((goal: any) => (
                    <SelectItem key={goal.id} value={goal.id.toString()}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy-due-date">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="strategy-due-date"
                type="date"
                value={strategyForm.due_at}
                onChange={(e) => setStrategyForm({ ...strategyForm, due_at: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="strategy-description"
                value={strategyForm.description}
                onChange={(e) => setStrategyForm({ ...strategyForm, description: e.target.value })}
                placeholder="Enter strategy description..."
                rows={4}
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsAddStrategyOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!strategyForm.goal_id || !strategyForm.due_at || !strategyForm.description) {
                  toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields",
                    variant: "destructive",
                  });
                  return;
                }

                if (!clientId) {
                  toast({
                    title: "Error",
                    description: "Client ID is required",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  await createStrategy({
                    client_id: clientId,
                    goal_id: parseInt(strategyForm.goal_id),
                    due_at: strategyForm.due_at,
                    description: strategyForm.description,
                  }).unwrap();

                  toast({
                    title: "Strategy Added",
                    description: "New strategy has been added successfully.",
                  });

                  setStrategyForm({ goal_id: "", due_at: "", description: "" });
                  setIsAddStrategyOpen(false);
                } catch (error: any) {
                  const errorMsg = error?.data?.message || error?.message || "Failed to create strategy";
                  setErrorMessage(errorMsg);
                  setIsErrorDialogOpen(true);
                }
              }}
              disabled={isCreatingStrategy}
            >
              {isCreatingStrategy ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Strategy"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Update Strategy Sheet */}
      <Sheet open={isUpdateStrategyOpen} onOpenChange={setIsUpdateStrategyOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Strategy</SheetTitle>
            <SheetDescription>
              Update strategy information. Fill in all required fields.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update-strategy-goal-id">
                Goal <span className="text-destructive">*</span>
              </Label>
              <Select
                value={strategyForm.goal_id}
                onValueChange={(value) => setStrategyForm({ ...strategyForm, goal_id: value })}
              >
                <SelectTrigger id="update-strategy-goal-id">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  {goalsData?.data?.map((goal: any) => (
                    <SelectItem key={goal.id} value={goal.id.toString()}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-strategy-due-date">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="update-strategy-due-date"
                type="date"
                value={strategyForm.due_at}
                onChange={(e) => setStrategyForm({ ...strategyForm, due_at: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-strategy-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="update-strategy-description"
                value={strategyForm.description}
                onChange={(e) => setStrategyForm({ ...strategyForm, description: e.target.value })}
                placeholder="Enter strategy description..."
                rows={4}
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsUpdateStrategyOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedStrategy) return;

                if (!strategyForm.goal_id || !strategyForm.due_at || !strategyForm.description) {
                  toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  await updateStrategy({
                    id: selectedStrategy.id,
                    data: {
                      due_at: strategyForm.due_at,
                      description: strategyForm.description,
                    },
                  }).unwrap();

                  toast({
                    title: "Strategy Updated",
                    description: "Strategy has been updated successfully.",
                  });

                  setStrategyForm({ goal_id: "", due_at: "", description: "" });
                  setIsUpdateStrategyOpen(false);
                  setSelectedStrategy(null);
                } catch (error: any) {
                  const errorMsg = error?.data?.message || error?.message || "Failed to update strategy";
                  setErrorMessage(errorMsg);
                  setIsErrorDialogOpen(true);
                }
              }}
              disabled={isUpdatingStrategy}
            >
              {isUpdatingStrategy ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Strategy"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Strategy Confirmation Dialog */}
      <Dialog open={isDeleteStrategyDialogOpen} onOpenChange={setIsDeleteStrategyDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="rounded-full border-4 border-red-200 p-3">
              <svg
                className="w-12 h-12 text-red-500"
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
                This will permanently delete the strategy. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={async () => {
                  if (!strategyToDelete) return;
                  try {
                    await deleteStrategy(strategyToDelete).unwrap();
                    toast({
                      title: "Strategy Deleted",
                      description: "Strategy has been deleted successfully.",
                    });
                    setIsDeleteStrategyDialogOpen(false);
                    setStrategyToDelete(null);
                  } catch (error: any) {
                    const errorMsg = error?.data?.message || error?.message || "Failed to delete strategy";
                    setErrorMessage(errorMsg);
                    setIsErrorDialogOpen(true);
                    setIsDeleteStrategyDialogOpen(false);
                    setStrategyToDelete(null);
                  }
                }}
                variant="destructive"
                className="px-6"
                disabled={isDeletingStrategy}
              >
                {isDeletingStrategy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, delete it"
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsDeleteStrategyDialogOpen(false);
                  setStrategyToDelete(null);
                }}
                variant="outline"
                className="px-6"
                disabled={isDeletingStrategy}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Toggle Confirmation Modal */}
      <Dialog open={showStatusToggleConfirmation} onOpenChange={setShowStatusToggleConfirmation}>
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
                onClick={handleConfirmStatusToggle}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                disabled={isChangingGoalStatus}
              >
                {isChangingGoalStatus ? (
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
                  setShowStatusToggleConfirmation(false);
                  setSelectedGoalForStatus(null);
                }}
                variant="destructive"
                className="px-6"
                disabled={isChangingGoalStatus}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientGoals;

