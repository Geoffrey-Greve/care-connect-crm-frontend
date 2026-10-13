import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface KPI {
  id: string;
  title: string;
  checked: boolean;
}

const mockKPIs: KPI[] = [
  { id: "1", title: "ASCXX", checked: false },
  { id: "2", title: "Qq", checked: false },
  { id: "3", title: "Wrewersfs", checked: false },
  { id: "4", title: "Client Satisfaction", checked: false },
  { id: "5", title: "On-Time Arrival", checked: false },
  { id: "6", title: "Documentation Rate", checked: false },
];

const mockRoles = [
  { id: "1", name: "Co-ordinator upfr" },
  { id: "2", name: "Driver" },
  { id: "3", name: "Carer" },
  { id: "4", name: "Client" },
  { id: "5", name: "Co-ordinator" },
];

const mockStaff = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Bob Johnson" },
  { id: "4", name: "Alice Williams" },
];

export default function CreateKPIPermission() {
  const [searchParams] = useSearchParams();
  const roleId = searchParams.get("roleId");
  const roleName = searchParams.get("roleName") || "";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedRole, setSelectedRole] = useState<string>(roleId || "");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [kpis, setKpis] = useState<KPI[]>(mockKPIs);

  const handleToggleKPI = (kpiId: string, checked: boolean) => {
    setKpis((prev) =>
      prev.map((kpi) => (kpi.id === kpiId ? { ...kpi, checked } : kpi))
    );
  };

  const handleSubmit = () => {
    const selectedKPIs = kpis.filter((kpi) => kpi.checked);
    const role = mockRoles.find((r) => r.id === selectedRole);
    const staff = mockStaff.find((s) => s.id === selectedStaff);

    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedStaff) {
      toast({
        title: "Error",
        description: "Please select a staff member.",
        variant: "destructive",
      });
      return;
    }

    if (selectedKPIs.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one KPI.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `${selectedKPIs.length} KPI(s) assigned to ${staff?.name} (${role?.name}).`,
    });
    navigate(-1);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Manage KPI Permissions</h1>
      </div>

      <div className="border rounded-lg bg-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="font-semibold text-primary">Assigning to :</span>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {mockRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}

            </SelectContent>
          </Select>
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Staff" />
            </SelectTrigger>
            <SelectContent>
              {mockStaff.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI Table */}
        <div className="border rounded-lg bg-white p-0.5">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-center">KPI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpis.map((kpi) => (
                <TableRow key={kpi.id} className="border-b">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={kpi.checked}
                        onCheckedChange={(value) => handleToggleKPI(kpi.id, value === true)}
                        aria-label={`Toggle ${kpi.title}`}
                      />
                      <span className="text-slate-700">{kpi.title}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>

    </div>
  );
}

