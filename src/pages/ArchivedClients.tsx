import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { User, Phone, Mail, Search, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreVertical, Eye, Loader2, Archive } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetClientsQuery, useUnarchiveClientMutation } from "@/redux/api/clientsApi";
import { ErrorDialog } from "@/components/ErrorDialog";

type SortField = 'serial' | 'type' | 'name' | 'email' | 'phone' | 'supportNetwork' | 'status';
type SortDirection = 'asc' | 'desc' | null;

const ArchivedClients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch archived clients from API
  const { data, isLoading, isFetching } = useGetClientsQuery({ 
    status: "1", 
    archived: 1,
    limit: 1000 // Fetch all for client-side filtering
  });
  
  const apiClients = data?.data || [];
  
  // Mutations
  const [unarchiveClient, { isLoading: isUnarchiving }] = useUnarchiveClientMutation();
  
  const [searchTerm, setSearchTerm] = useState("");
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
  
  // Unarchive confirmation state
  const [showUnarchiveConfirmation, setShowUnarchiveConfirmation] = useState(false);
  const [clientToUnarchive, setClientToUnarchive] = useState<any>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "secondary";
      case "Inactive": return "destructive";
      case "Suspended": return "warning";
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

  // Transform API clients to match the expected structure
  const transformedClients = useMemo(() => {
    return apiClients.map((client: any) => {
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
        supportNetwork: lastName || "N/A",
        status: client.status ? "Active" : "Inactive",
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
            aValue = parseInt(a.id.split('-')[1] || a.id);
            bValue = parseInt(b.id.split('-')[1] || b.id);
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

  // Handle unarchive button click
  const handleUnarchiveClick = (client: any) => {
    setClientToUnarchive(client);
    setShowUnarchiveConfirmation(true);
  };

  // Confirm unarchive
  const handleConfirmUnarchive = async () => {
    if (!clientToUnarchive) return;

    try {
      await unarchiveClient(parseInt(clientToUnarchive.id)).unwrap();
      setShowUnarchiveConfirmation(false);
      setClientToUnarchive(null);
      toast({
        title: "Client Unarchived",
        description: "Client has been unarchived successfully and is now visible in your client list.",
      });
    } catch (error: any) {
      console.error("Failed to unarchive client:", error);
      const errorMsg = error?.data?.message || "Failed to unarchive client";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setShowUnarchiveConfirmation(false);
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      {/* Loading Overlay */}
      {(isLoading || isFetching || isUnarchiving) && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {isUnarchiving ? "Unarchiving client..." : "Loading archived clients..."}
            </p>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Archived Client</h1>
          <p className="text-muted-foreground">
            View and manage archived client records
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Archived Client Management</CardTitle>
              <CardDescription>
                Complete list of archived clients
              </CardDescription>
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
              <Button
                variant="outline"
                size="icon"
                title="Advanced Filters"
                onClick={() => setShowAdvancedFilter(true)}
              >
                <Filter className="h-4 w-4" />
              </Button>
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
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedClients.length)} of {filteredAndSortedClients.length} entries
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">
                      <button
                        onClick={() => handleSort('serial')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Serial No
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
                        Mobile
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
                        No data available in table
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
                              <DropdownMenuItem onClick={() => handleUnarchiveClick(client)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Unarchive
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
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

      {/* Unarchive Confirmation Modal */}
      <Dialog open={showUnarchiveConfirmation} onOpenChange={setShowUnarchiveConfirmation}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Unarchive</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to unarchive <span className="font-semibold text-foreground">{clientToUnarchive?.name}</span>? This will make the client visible in your client list again.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowUnarchiveConfirmation(false);
                setClientToUnarchive(null);
              }}
              disabled={isUnarchiving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmUnarchive}
              disabled={isUnarchiving}
            >
              {isUnarchiving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Yes, unarchive"
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

export default ArchivedClients;

