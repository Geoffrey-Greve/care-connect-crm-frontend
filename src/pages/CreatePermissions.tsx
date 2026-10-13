import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { defaultPermissions, MenuItem, PermissionSection } from "@/lib/mockData";

export default function CreatePermissions() {
  const [permissions, setPermissions] = useState<PermissionSection[]>(defaultPermissions);
  const [searchParams] = useSearchParams();
  const roleName = searchParams.get("roleName") || "Selected Role";
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalActions = useMemo(() => {
    return permissions.reduce((count, section) => {
      return count + section.menuItems.reduce((itemCount, item) => {
        // Count actions, or count 1 for items with no actions
        return itemCount + (item.actions.length > 0 ? item.actions.length : 1);
      }, 0);
    }, 0);
  }, [permissions]);

  const totalSelected = useMemo(() => {
    return permissions.reduce((count, section) => {
      return (
        count +
        section.menuItems.reduce((itemCount, item) => {
          if (item.actions.length === 0) {
            // For items with no actions, count 1 if checked
            return itemCount + (item.checked ? 1 : 0);
          }
          // For items with actions, count checked actions
          return itemCount + item.actions.filter((action) => action.checked).length;
        }, 0)
      );
    }, 0);
  }, [permissions]);

  const handleToggleAction = (sectionId: string, menuItemId: string, actionId: string, checked: boolean) => {
    setPermissions((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            menuItems: section.menuItems.map((item) =>
              item.id === menuItemId
                ? {
                  ...item,
                  actions: item.actions.map((action) => (action.id === actionId ? { ...action, checked } : action)),
                }
                : item,
            ),
          }
          : section,
      ),
    );
  };

  const handleToggleMenuItem = (sectionId: string, menuItemId: string, checked: boolean) => {
    setPermissions((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            menuItems: section.menuItems.map((item) =>
              item.id === menuItemId
                ? {
                  ...item,
                  checked: item.actions.length === 0 ? checked : item.checked,
                  actions: item.actions.map((action) => ({ ...action, checked })),
                }
                : item,
            ),
          }
          : section,
      ),
    );
  };

  const getMenuItemCheckedState = (menuItem: MenuItem): boolean | "indeterminate" => {
    // For menu items with no actions, use the checked property
    if (menuItem.actions.length === 0) {
      return menuItem.checked ?? false;
    }
    // For menu items with actions, check all actions
    const allChecked = menuItem.actions.every((action) => action.checked);
    if (allChecked) return true;
    const partiallyChecked = menuItem.actions.some((action) => action.checked);
    if (partiallyChecked) return "indeterminate";
    return false;
  };

  const getSectionCheckedState = (section: PermissionSection): boolean | "indeterminate" => {
    const allMenuItems = section.menuItems;
    if (allMenuItems.length === 0) return false;

    // Check if all menu items are fully checked
    const allFullyChecked = allMenuItems.every((item) => {
      if (item.actions.length === 0) {
        // For items with no actions, check the checked property
        return item.checked ?? false;
      }
      // For items with actions, check if all actions are checked
      return item.actions.every((action) => action.checked);
    });

    if (allFullyChecked) return true;

    // Check if any menu item has any action checked or is checked itself
    const hasAnyChecked = allMenuItems.some((item) => {
      if (item.actions.length === 0) {
        return item.checked ?? false;
      }
      return item.actions.some((action) => action.checked);
    });

    if (hasAnyChecked) return "indeterminate";
    return false;
  };

  const handleToggleSection = (sectionId: string, checked: boolean) => {
    setPermissions((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
            ...section,
            menuItems: section.menuItems.map((item) => ({
              ...item,
              checked: item.actions.length === 0 ? checked : item.checked,
              actions: item.actions.map((action) => ({ ...action, checked })),
            })),
          }
          : section,
      ),
    );
  };

  const handleSubmit = () => {
    toast({
      title: "Permissions Saved",
      description: `${totalSelected} of ${totalActions} permissions assigned to ${roleName}.`,
    });
    navigate(-1);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Permissions</h1>
          <p className="text-muted-foreground mt-1">Assigning Permissions: {roleName}</p>
        </div>
      </div>

      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[300px] font-semibold">Menus</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((section) => (
              <React.Fragment key={section.id}>
                {/* Section (Parent) Row */}
                <TableRow className="border-b bg-slate-50">
                  <TableCell className="align-top py-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={getSectionCheckedState(section)}
                        onCheckedChange={(value) => handleToggleSection(section.id, value === true)}
                        aria-label={`Toggle all permissions for ${section.name}`}
                        className="mt-1"
                      />
                      <div>
                        <span className="font-semibold text-slate-800">{section.name}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top py-4">
                    <span className="text-sm text-muted-foreground italic">Section</span>
                  </TableCell>
                </TableRow>
                {/* Menu Items (Children) Rows */}
                {section.menuItems.map((menuItem) => (
                  <TableRow key={menuItem.id} className="border-b">
                    <TableCell className="align-top py-4">
                      <div className="flex items-start gap-3 pl-8">
                        <Checkbox
                          checked={getMenuItemCheckedState(menuItem)}
                          onCheckedChange={(value) => handleToggleMenuItem(section.id, menuItem.id, value === true)}
                          aria-label={`Toggle all permissions for ${menuItem.name}`}
                          className="mt-1"
                        />
                        <div>
                          <span className="text-slate-700">{menuItem.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <div className="flex flex-wrap gap-2">
                        {menuItem.actions.length > 0 ? (
                          menuItem.actions.map((action) => (
                            <label
                              key={action.id}
                              className="inline-flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={action.checked}
                                onCheckedChange={(value) =>
                                  handleToggleAction(section.id, menuItem.id, action.id, value === true)
                                }
                                aria-label={`Toggle ${action.label}`}
                              />
                              <span className="text-sm text-slate-700">{action.label}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground italic">No actions available</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  );
}
