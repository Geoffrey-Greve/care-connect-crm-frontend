import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Save, ToggleLeft, ToggleRight, Users, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Module = 
  | "Client Management"
  | "Rostering"
  | "Billing"
  | "Payroll"
  | "Reporting"
  | "Documents"
  | "Incidents"
  | "Complaints"
  | "SIL Management"
  | "SDA Management"
  | "BSP Management"
  | "Timesheets";

interface Client {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface ClientModuleState {
  [clientId: string]: {
    [module: string]: boolean;
  };
}

const modules: Module[] = [
  "Client Management",
  "Rostering",
  "Billing",
  "Payroll",
  "Reporting",
  "Documents",
  "Incidents",
  "Complaints",
  "SIL Management",
  "SDA Management",
  "BSP Management",
  "Timesheets",
];

// Mock client data - in production, fetch from database
const mockClients: Client[] = [
  { id: "CLI-001", name: "Sarah Johnson", email: "sarah.johnson@email.com", status: "Active" },
  { id: "CLI-002", name: "Robert Smith", email: "robert.smith@email.com", status: "Active" },
  { id: "CLI-003", name: "Maria Garcia", email: "maria.garcia@email.com", status: "Active" },
  { id: "CLI-004", name: "David Brown", email: "david.brown@email.com", status: "Inactive" },
  { id: "CLI-005", name: "Emily Davis", email: "emily.davis@email.com", status: "Active" },
];

// Default: All modules enabled for all clients
const getDefaultModuleStates = (clients: Client[]): ClientModuleState => {
  const states: ClientModuleState = {};
  clients.forEach((client) => {
    states[client.id] = {};
    modules.forEach((module) => {
      states[client.id][module] = true; // Default: all enabled
    });
  });
  return states;
};

export function FeatureToggles() {
  const [clients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moduleStates, setModuleStates] = useState<ClientModuleState>(
    getDefaultModuleStates(mockClients)
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load saved states on mount
  useEffect(() => {
    const saved = localStorage.getItem("clientModuleStates");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setModuleStates(parsed);
      } catch (error) {
        console.error("Error loading saved module states:", error);
      }
    }
  }, []);

  const handleModuleToggle = (clientId: string, module: Module, enabled: boolean) => {
    setModuleStates((prev) => ({
      ...prev,
      [clientId]: {
        ...prev[clientId],
        [module]: enabled,
      },
    }));
    setHasChanges(true);
  };

  const handleClientAllModulesToggle = (clientId: string, enabled: boolean) => {
    setModuleStates((prev) => ({
      ...prev,
      [clientId]: Object.fromEntries(
        modules.map((module) => [module, enabled])
      ),
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In production, save to database
      // await supabase.from('client_module_states').upsert(moduleStates);
      
      // For now, save to localStorage
      localStorage.setItem("clientModuleStates", JSON.stringify(moduleStates));
      
      setHasChanges(false);
      setShowConfirmDialog(false);
      
      toast({
        title: "Module Settings Saved",
        description: "Feature toggles have been updated successfully for all clients",
      });
    } catch (error) {
      console.error("Error saving module states:", error);
      toast({
        title: "Save Error",
        description: "Failed to save module settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getEnabledModuleCount = (clientId: string): number => {
    return Object.values(moduleStates[clientId] || {}).filter(Boolean).length;
  };

  const hasAllModulesEnabled = (clientId: string): boolean => {
    return modules.every((module) => moduleStates[clientId]?.[module] === true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Feature Toggles / Module Enablement</span>
              </CardTitle>
              <CardDescription>
                Enable or disable system modules for individual clients
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  Unsaved Changes
                </Badge>
              )}
              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={!hasChanges || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clients and Modules Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="sticky left-0 bg-muted/50 z-10 min-w-[200px]">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Client</span>
                      </div>
                    </TableHead>
                    {modules.map((module) => (
                      <TableHead key={module} className="text-center min-w-[140px]">
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-xs font-medium">{module}</span>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-[100px]">All</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={modules.length + 2} className="text-center py-8 text-muted-foreground">
                        No clients found matching your search criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div className="space-y-1">
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-muted-foreground">{client.email}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                variant={client.status === "Active" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {client.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getEnabledModuleCount(client.id)}/{modules.length} enabled
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        {modules.map((module) => (
                          <TableCell key={module} className="text-center">
                            <Switch
                              checked={moduleStates[client.id]?.[module] === true}
                              onCheckedChange={(checked) =>
                                handleModuleToggle(client.id, module, checked)
                              }
                              aria-label={`Toggle ${module} for ${client.name}`}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleClientAllModulesToggle(
                                client.id,
                                !hasAllModulesEnabled(client.id)
                              )
                            }
                            className="h-8"
                          >
                            {hasAllModulesEnabled(client.id) ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredClients.length} shown
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{modules.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available features
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Average Enabled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clients.length > 0
                    ? Math.round(
                        clients.reduce(
                          (sum, client) => sum + getEnabledModuleCount(client.id),
                          0
                        ) / clients.length
                      )
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Modules per client
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Module Settings</DialogTitle>
            <DialogDescription>
              Are you sure you want to save these module enablement changes? This will
              affect feature availability for {filteredClients.length} client(s).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

