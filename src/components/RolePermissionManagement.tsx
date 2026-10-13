import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { Save, Shield, CheckCircle2, X } from "lucide-react";

type Role = "Admin" | "Coordinator" | "Support Worker" | "Finance" | "Plan Manager";
type Permission = "view" | "create" | "edit" | "delete" | "approve";
type Module = 
  | "Clients"
  | "Appointments"
  | "Team"
  | "Documents"
  | "Invoices"
  | "Reports"
  | "Incidents"
  | "Complaints"
  | "Timesheets"
  | "SIL Management"
  | "SDA Management"
  | "BSP Management"
  | "Admin Settings";

interface PermissionMatrix {
  [role: string]: {
    [module: string]: {
      [permission: string]: boolean;
    };
  };
}

const roles: Role[] = ["Admin", "Coordinator", "Support Worker", "Finance", "Plan Manager"];
const permissions: Permission[] = ["view", "create", "edit", "delete", "approve"];
const modules: Module[] = [
  "Clients",
  "Appointments",
  "Team",
  "Documents",
  "Invoices",
  "Reports",
  "Incidents",
  "Complaints",
  "Timesheets",
  "SIL Management",
  "SDA Management",
  "BSP Management",
  "Admin Settings",
];

// Default permissions - Admin has all, others have limited
const getDefaultPermissions = (): PermissionMatrix => {
  const matrix: PermissionMatrix = {};
  
  roles.forEach((role) => {
    matrix[role] = {};
    modules.forEach((module) => {
      matrix[role][module] = {};
      permissions.forEach((permission) => {
        if (role === "Admin") {
          // Admin has all permissions
          matrix[role][module][permission] = true;
        } else if (role === "Coordinator") {
          // Coordinator has most permissions except delete and approve for sensitive modules
          matrix[role][module][permission] = 
            permission !== "delete" && 
            permission !== "approve" &&
            module !== "Admin Settings";
        } else if (role === "Support Worker") {
          // Support Worker has view and create for most, edit for some
          matrix[role][module][permission] = 
            (permission === "view" || permission === "create") &&
            module !== "Admin Settings" &&
            module !== "Invoices";
        } else if (role === "Finance") {
          // Finance has view, create, edit for financial modules
          matrix[role][module][permission] = 
            (permission === "view" || permission === "create" || permission === "edit") &&
            (module === "Invoices" || module === "Reports" || module === "Timesheets");
        } else if (role === "Plan Manager") {
          // Plan Manager has view and edit for client-related modules
          matrix[role][module][permission] = 
            (permission === "view" || permission === "edit") &&
            (module === "Clients" || module === "Appointments" || module === "Documents" || module === "Reports");
        }
      });
    });
  });
  
  return matrix;
};

export function RolePermissionManagement() {
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>(getDefaultPermissions());
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load saved permissions on mount
  useEffect(() => {
    const saved = localStorage.getItem("rolePermissions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPermissionMatrix(parsed);
      } catch (error) {
        console.error("Error loading saved permissions:", error);
      }
    }
  }, []);

  const handlePermissionChange = (
    role: Role,
    module: Module,
    permission: Permission,
    checked: boolean
  ) => {
    setPermissionMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...prev[role][module],
          [permission]: checked,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleRoleModuleChange = (role: Role, module: Module, checked: boolean) => {
    setPermissionMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: Object.fromEntries(
          permissions.map((perm) => [perm, checked])
        ),
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In production, save to database
      // await supabase.from('role_permissions').upsert(permissionMatrix);
      
      // For now, save to localStorage
      localStorage.setItem("rolePermissions", JSON.stringify(permissionMatrix));
      
      setHasChanges(false);
      setShowConfirmDialog(false);
      
      toast({
        title: "Permissions Saved",
        description: "Role permissions have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Save Error",
        description: "Failed to save permissions",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPermissionLabel = (permission: Permission): string => {
    const labels: Record<Permission, string> = {
      view: "View",
      create: "Create",
      edit: "Edit",
      delete: "Delete",
      approve: "Approve",
    };
    return labels[permission];
  };

  const getRoleColor = (role: Role): string => {
    const colors: Record<Role, string> = {
      Admin: "bg-red-100 text-red-800 border-red-300",
      Coordinator: "bg-blue-100 text-blue-800 border-blue-300",
      "Support Worker": "bg-green-100 text-green-800 border-green-300",
      Finance: "bg-purple-100 text-purple-800 border-purple-300",
      "Plan Manager": "bg-orange-100 text-orange-800 border-orange-300",
    };
    return colors[role];
  };

  const hasAllPermissions = (role: Role, module: Module): boolean => {
    return permissions.every(
      (perm) => permissionMatrix[role]?.[module]?.[perm] === true
    );
  };

  const hasAnyPermission = (role: Role, module: Module): boolean => {
    return permissions.some(
      (perm) => permissionMatrix[role]?.[module]?.[perm] === true
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Role & Permission Management</span>
              </CardTitle>
              <CardDescription>
                Configure granular permissions for each role across all system modules
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
                Save Permissions
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Permission Matrix Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="sticky left-0 bg-muted/50 z-10 min-w-[200px]">
                        Module
                      </TableHead>
                      {roles.map((role) => (
                        <TableHead
                          key={role}
                          className="text-center min-w-[120px]"
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <Badge className={getRoleColor(role)}>{role}</Badge>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.map((module) => (
                      <TableRow key={module}>
                        <TableCell className="font-medium sticky left-0 bg-background z-10">
                          {module}
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role} className="text-center">
                            <div className="flex flex-col items-center space-y-2">
                              {/* Select All for this module/role */}
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={hasAllPermissions(role, module)}
                                  onCheckedChange={(checked) =>
                                    handleRoleModuleChange(
                                      role,
                                      module,
                                      checked === true
                                    )
                                  }
                                  id={`${role}-${module}-all`}
                                />
                                <Label
                                  htmlFor={`${role}-${module}-all`}
                                  className="text-xs text-muted-foreground cursor-pointer"
                                >
                                  All
                                </Label>
                              </div>
                              {/* Individual permissions */}
                              <div className="grid grid-cols-2 gap-1">
                                {permissions.map((permission) => (
                                  <div
                                    key={permission}
                                    className="flex items-center space-x-1"
                                  >
                                    <Checkbox
                                      checked={
                                        permissionMatrix[role]?.[module]?.[
                                          permission
                                        ] === true
                                      }
                                      onCheckedChange={(checked) =>
                                        handlePermissionChange(
                                          role,
                                          module,
                                          permission,
                                          checked === true
                                        )
                                      }
                                      id={`${role}-${module}-${permission}`}
                                    />
                                    <Label
                                      htmlFor={`${role}-${module}-${permission}`}
                                      className="text-xs cursor-pointer"
                                    >
                                      {getPermissionLabel(permission)[0]}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Permissions:</span>
                {permissions.map((perm) => (
                  <Badge key={perm} variant="outline" className="text-xs">
                    {getPermissionLabel(perm)[0]} = {getPermissionLabel(perm)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Role Descriptions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => {
                const moduleCount = modules.filter((module) =>
                  hasAnyPermission(role, module)
                ).length;
                return (
                  <Card key={role} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{role}</CardTitle>
                        <Badge className={getRoleColor(role)}>{moduleCount} modules</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {role === "Admin" &&
                          "Full system access with all permissions"}
                        {role === "Coordinator" &&
                          "Manage clients, schedules, and team members"}
                        {role === "Support Worker" &&
                          "View and create records, limited editing"}
                        {role === "Finance" &&
                          "Access to invoices, reports, and financial data"}
                        {role === "Plan Manager" &&
                          "Manage client plans and appointments"}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Permissions</DialogTitle>
            <DialogDescription>
              Are you sure you want to save these permission changes? This will
              affect all users with the selected roles.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

