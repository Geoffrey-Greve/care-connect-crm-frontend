import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { User, Phone, Mail, FileText, Plus, Search, Filter, AlertTriangle, CheckCircle, Clock, UserCheck, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreVertical, Eye, Edit, Trash2, Loader2, UserPlus, Target, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetClientsQuery, useToggleClientStatusMutation, useDeleteClientMutation } from "@/redux/api/clientsApi";
import { Client } from "@/types/models";
import { ErrorDialog } from "@/components/ErrorDialog";
import StatusChangeModal from "@/components/StatusChangeModal";

const clients = [
  {
    id: "CLI-001",
    name: "Sarah Johnson",
    type: "Self-Managed",
    email: "sarah.johnson@email.com",
    phone: "+61 3 9123 4567",
    supportNetwork: "Johnson",
    status: "Active",
    ndisNumber: "NDIS-001234567",
    dateOfBirth: "1985-03-15",
    address: "123 Main Street, Melbourne VIC 3000",
    emergencyContact: "John Johnson - 0412 345 678",
    lastServiceDate: "2024-01-20",
    nextReview: "2024-07-15",
    totalBudget: 45000.00,
    budgetUtilized: 32500.00,
    riskLevel: "Low",
    primarySupport: "Personal Care",
    assignedTo: "Michael Chen",
    caseManager: "Sarah Johnson",
  },
  {
    id: "CLI-002", 
    name: "Robert Smith",
    type: "Plan Managed",
    email: "robert.smith@email.com",
    phone: "+61 2 8234 5678",
    family: "Smith",
    status: "Active",
    ndisNumber: "NDIS-002345678",
    dateOfBirth: "1978-11-22",
    address: "456 Oak Avenue, Sydney NSW 2000",
    emergencyContact: "Mary Smith - 0423 456 789",
    lastServiceDate: "2024-01-19",
    nextReview: "2024-08-22",
    totalBudget: 52000.00,
    budgetUtilized: 28000.00,
    riskLevel: "Medium",
    primarySupport: "Community Access",
    assignedTo: "Emma Wilson",
    caseManager: "Michael Chen",
  },
  {
    id: "CLI-003",
    name: "Maria Garcia",
    type: "NDIA Managed",
    email: "maria.garcia@email.com",
    phone: "+61 7 3345 6789",
    family: "Garcia",
    status: "Active",
    ndisNumber: "NDIS-003456789", 
    dateOfBirth: "1992-07-08",
    address: "789 Pine Road, Brisbane QLD 4000",
    emergencyContact: "Carlos Garcia - 0434 567 890",
    lastServiceDate: "2024-01-18",
    nextReview: "2024-09-08",
    totalBudget: 38000.00,
    budgetUtilized: 35000.00,
    riskLevel: "High",
    primarySupport: "Nursing Care",
    assignedTo: "Michael Chen",
    caseManager: "James Miller",
  },
  {
    id: "CLI-004",
    name: "John Williams",
    type: "Self-Managed",
    email: "john.williams@email.com",
    phone: "+61 8 6456 7890",
    family: "Williams",
    status: "Inactive",
    ndisNumber: "NDIS-004567890",
    dateOfBirth: "1965-12-03",
    address: "321 Elm Street, Perth WA 6000",
    emergencyContact: "Lisa Williams - 0445 678 901",
    lastServiceDate: "2023-12-15",
    nextReview: "2024-06-03",
    totalBudget: 41000.00,
    budgetUtilized: 15000.00,
    riskLevel: "Low",
    primarySupport: "Social Support",
    assignedTo: "Emma Wilson",
    caseManager: "Sarah Johnson",
  },
  {
    id: "CLI-005",
    name: "Emma Davis",
    type: "Plan Managed",
    email: "emma.davis@email.com",
    phone: "+61 8 8567 8901",
    family: "Davis",
    status: "Active",
    ndisNumber: "NDIS-005678901",
    dateOfBirth: "1989-04-27",
    address: "654 Maple Drive, Adelaide SA 5000",
    emergencyContact: "Peter Davis - 0456 789 012",
    lastServiceDate: "2024-01-21",
    nextReview: "2024-10-27",
    totalBudget: 47000.00,
    budgetUtilized: 22000.00,
    riskLevel: "Medium",
    primarySupport: "Physiotherapy",
    assignedTo: "Michael Chen",
    caseManager: "Emma Wilson",
  },
  {
    id: "CLI-006",
    name: "James Brown",
    type: "Self-Managed",
    email: "james.brown@email.com",
    phone: "+61 3 9123 9999",
    family: "Brown",
    status: "Active",
    ndisNumber: "NDIS-006789012",
    dateOfBirth: "1990-05-20",
    address: "111 Collins Street, Melbourne VIC 3000",
    emergencyContact: "Anna Brown - 0411 222 333",
    lastServiceDate: "2024-01-22",
    nextReview: "2024-11-20",
    totalBudget: 50000.00,
    budgetUtilized: 30000.00,
    riskLevel: "Low",
    primarySupport: "Personal Care",
    assignedTo: "Emma Wilson",
    caseManager: "Michael Chen",
  },
  {
    id: "CLI-007",
    name: "Lisa Anderson",
    type: "NDIA Managed",
    email: "lisa.anderson@email.com",
    phone: "+61 2 8234 8888",
    family: "Anderson",
    status: "Active",
    ndisNumber: "NDIS-007890123",
    dateOfBirth: "1987-09-14",
    address: "222 George Street, Sydney NSW 2000",
    emergencyContact: "Tom Anderson - 0422 333 444",
    lastServiceDate: "2024-01-21",
    nextReview: "2024-12-14",
    totalBudget: 42000.00,
    budgetUtilized: 38000.00,
    riskLevel: "High",
    primarySupport: "Nursing Care",
    assignedTo: "Michael Chen",
    caseManager: "Sarah Johnson",
  },
  {
    id: "CLI-008",
    name: "David Wilson",
    type: "Plan Managed",
    email: "david.wilson@email.com",
    phone: "+61 7 3345 7777",
    family: "Wilson",
    status: "Inactive",
    ndisNumber: "NDIS-008901234",
    dateOfBirth: "1975-02-28",
    address: "333 Queen Street, Brisbane QLD 4000",
    emergencyContact: "Susan Wilson - 0433 444 555",
    lastServiceDate: "2023-11-30",
    nextReview: "2024-08-28",
    totalBudget: 48000.00,
    budgetUtilized: 20000.00,
    riskLevel: "Medium",
    primarySupport: "Community Access",
    assignedTo: "Emma Wilson",
    caseManager: "James Miller",
  },
];

type SortField = 'serial' | 'type' | 'name' | 'email' | 'phone' | 'supportNetwork' | 'status';
type SortDirection = 'asc' | 'desc' | null;

const Clients = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch clients from API
  const statusParam = statusFilter === "all" ? undefined : statusFilter === "active" ? "1" : "0";
  const { data, isLoading, isFetching } = useGetClientsQuery({
    status: statusParam,
    archived: 0,
    limit: 1000 // Fetch all for client-side filtering
  });

  const apiClients = data?.data || [];

  // Mutations
  const [toggleClientStatus, { isLoading: isTogglingStatus }] = useToggleClientStatusMutation();
  const [deleteClient, { isLoading: isDeletingClient }] = useDeleteClientMutation();
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    clientType: "all"
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  // New state for toggle status confirmation
  const [showToggleConfirmation, setShowToggleConfirmation] = useState(false);
  const [clientToToggle, setClientToToggle] = useState<any>(null);

  // New state for delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "secondary";
      case "Inactive": return "destructive";
      // case "Suspended": return "warning";
      default: return "outline";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Self-Managed": return "default";
      case "Plan Managed": return "secondary";
      case "NDIA Managed": return "outline";
      default: return "outline";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  // Transform API clients to match the expected structure
  const transformedClients = useMemo(() => {
    return apiClients.map((client: any) => {
      // Handle both snake_case (from API) and camelCase field names
      const displayName = client.display_name || client.displayName || "";
      const firstName = client.first_name || client.firstName || "";
      const lastName = client.last_name || client.lastName || "";
      const clientType = client.ClientType?.name || client.clientType || "N/A";
      const primaryPhone = client.primary_phone_number || client.primaryPhone || client.phone || "";

      return {
        id: client.id.toString(),
        name: displayName || `${firstName} ${lastName}`.trim() || "N/A",
        type: clientType,
        email: client.email || "N/A",
        phone: primaryPhone || "N/A",
        family: lastName || "N/A",
        supportNetwork: client.support_network || client.supportNetwork || lastName || "N/A",
        status: client.status ? "Active" : "Inactive",
        // Keep the original client data for reference
        originalData: client
      };
    });
  }, [apiClients]);

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let result = [...transformedClients];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(client =>
        client.name.toLowerCase().includes(search) ||
        client.email.toLowerCase().includes(search) ||
        client.phone.includes(search) ||
        client.supportNetwork.toLowerCase().includes(search) ||
        client.type.toLowerCase().includes(search) ||
        client.status.toLowerCase().includes(search) ||
        client.id.toLowerCase().includes(search)
      );
    }

    // Apply advanced filters
    if (advancedFilters.name) {
      result = result.filter(client =>
        client.name.toLowerCase().includes(advancedFilters.name.toLowerCase())
      );
    }
    if (advancedFilters.email) {
      result = result.filter(client =>
        client.email.toLowerCase().includes(advancedFilters.email.toLowerCase())
      );
    }
    if (advancedFilters.mobileNumber) {
      result = result.filter(client =>
        client.phone.includes(advancedFilters.mobileNumber)
      );
    }
    if (advancedFilters.clientType !== "all") {
      result = result.filter(client => client.type === advancedFilters.clientType);
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case 'serial':
            aValue = parseInt(a.id.split('-')[1]);
            bValue = parseInt(b.id.split('-')[1]);
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'email':
            aValue = a.email;
            bValue = b.email;
            break;
          case 'phone':
            aValue = a.phone;
            bValue = b.phone;
            break;
          case 'supportNetwork':
            aValue = a.supportNetwork;
            bValue = b.supportNetwork;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sortDirection === 'asc'
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
        }
      });
    }

    return result;
  }, [transformedClients, searchTerm, sortField, sortDirection, advancedFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedClients.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedClients = filteredAndSortedClients.slice(startIndex, endIndex);

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

  const activeClients = transformedClients.filter(client => client.status === "Active").length;
  // Note: Budget and risk data are kept as mock for now since API doesn't provide them yet
  const totalBudget = clients.reduce((sum, client) => sum + client.totalBudget, 0);
  const utilizedBudget = clients.reduce((sum, client) => sum + client.budgetUtilized, 0);
  const highRiskClients = clients.filter(client => client.riskLevel === "High").length;

  // Reset to first page when entries per page changes
  const handleEntriesChange = (value: string) => {
    setEntriesPerPage(Number(value));
    setCurrentPage(1);
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
      clientType: "all"
    });
    setCurrentPage(1);
  };

  const handleStatusClick = (client: any) => {
    setSelectedClient(client);
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedClient || !newStatus) return;

    try {
      // Get current status from original data (API uses boolean: true = Active, false = Inactive)
      const currentStatus = selectedClient.originalData?.status ?? (selectedClient.status === "Active");

      // Determine desired status
      // Note: "Suspended" status is not supported by the API (only boolean active/inactive)
      // If user selects "Suspended", we'll treat it as "Inactive"
      const desiredStatus = newStatus === "Active";

      // Only toggle if status needs to change
      if (desiredStatus !== currentStatus) {
        await toggleClientStatus(parseInt(selectedClient.id)).unwrap();
      }

      setShowStatusModal(false);
      setSelectedClient(null);
      setNewStatus("");
    } catch (error: any) {
      console.error("Failed to update client status:", error);
      const errorMsg = error?.data?.message || "Failed to update client status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  // Handle toggle status button click
  const handleToggleStatusClick = (client: any) => {
    setClientToToggle(client);
    setShowToggleConfirmation(true);
  };

  // Confirm toggle status
  const handleConfirmToggleStatus = async () => {
    if (!clientToToggle) return;

    try {
      await toggleClientStatus(parseInt(clientToToggle.id)).unwrap();
      setShowToggleConfirmation(false);
      setClientToToggle(null);
    } catch (error: any) {
      console.error("Failed to toggle client status:", error);
      const errorMsg = error?.data?.message || "Failed to toggle client status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setShowToggleConfirmation(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (client: any) => {
    setClientToDelete(client);
    setShowDeleteConfirmation(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClient(parseInt(clientToDelete.id)).unwrap();
      setShowDeleteConfirmation(false);
      setClientToDelete(null);
    } catch (error: any) {
      console.error("Failed to delete client:", error);
      const errorMsg = error?.data?.message || "Failed to delete client";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 relative">
      {/* Loading Overlay */}
      {(isLoading || isFetching || isTogglingStatus || isDeletingClient) && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {isTogglingStatus ? "Updating status..." : isDeletingClient ? "Deleting client..." : "Loading clients..."}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Clients</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            View and manage all client records, documents, and information
          </p>
        </div>
          <Button onClick={() => navigate("/clients/new")} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
          New Client
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transformedClients.length}</div>
            <p className="text-xs text-muted-foreground">{activeClients} active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">Across all plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilized</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(utilizedBudget)}</div>
            <p className="text-xs text-muted-foreground">{Math.round((utilizedBudget / totalBudget) * 100)}% utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highRiskClients}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

          <Card>
            <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Client Management</CardTitle>
              {/* <CardDescription>
                Complete list of clients with their details and current status
              </CardDescription> */}
            </div>

          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={entriesPerPage.toString()}
                  onValueChange={handleEntriesChange}
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
                <div className="relative flex-1 sm:flex-initial sm:w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {/* <Button
                variant="outline"
                size="icon"
                title="Advanced Filters"
                onClick={() => setShowAdvancedFilter(true)}
              >
                <Filter className="h-4 w-4" />
              </Button> */}
              </div>
              {/* <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedClients.length)} of {filteredAndSortedClients.length} entries
              </div> */}
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">
                      <button
                        onClick={() => handleSort('serial')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        #
                        {getSortIcon('serial')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('type')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Type
                        {getSortIcon('type')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Name
                        {getSortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Email
                        {getSortIcon('email')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('phone')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Phone Number
                        {getSortIcon('phone')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('supportNetwork')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Support Network
                        {getSortIcon('supportNetwork')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Status
                        {getSortIcon('status')}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No clients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedClients.map((client, index) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                          <Badge variant={getTypeColor(client.type) as any}>
                            {client.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{client.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{client.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                          <span className="text-sm">{client.supportNetwork}</span>
                      </TableCell>
                      <TableCell>
                          <Badge
                            variant={getStatusColor(client.status) as any}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleToggleStatusClick(client)}
                          >
                            {client.status}
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
                              {/* <DropdownMenuItem onClick={() => handleToggleStatusClick(client)}>
                                <AlertCircle className="h-4 w-4 mr-2" />
                                {client.status === "Active" ? "Inactive" : "Active"}
                              </DropdownMenuItem> */}
                              <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(client)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Family
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Target className="h-4 w-4 mr-2" />
                                Client Goal
                              </DropdownMenuItem> */}
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedClients.length)} of {filteredAndSortedClients.length} entries
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
              </div>
            </CardContent>
          </Card>

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
                placeholder="Enter client name"
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

            <div className="space-y-2">
              <Label htmlFor="filter-type">Client Type</Label>
              <Select
                value={advancedFilters.clientType}
                onValueChange={(value) => setAdvancedFilters(prev => ({ ...prev, clientType: value }))}
              >
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Self-Managed">Self-Managed</SelectItem>
                  <SelectItem value="Plan Managed">Plan Managed</SelectItem>
                  <SelectItem value="NDIA Managed">NDIA Managed</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Status Change Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change Client Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <div className="p-2 bg-muted rounded-md text-sm font-medium">
                {selectedClient?.name || ""}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-select">Status</Label>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
              >
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  {/* <SelectItem value="Suspended">Suspended</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusModal(false);
                setSelectedClient(null);
                setNewStatus("");
              }}
              disabled={isTogglingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={isTogglingStatus || !newStatus}
            >
              {isTogglingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Confirmation Modal */}
      <Dialog open={showToggleConfirmation} onOpenChange={setShowToggleConfirmation}>
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
                  setShowToggleConfirmation(false);
                  setClientToToggle(null);
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

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">{clientToDelete?.name}</span>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirmation(false);
                setClientToDelete(null);
              }}
              disabled={isDeletingClient}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingClient}
            >
              {isDeletingClient ? (
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

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  );
};

export default Clients;