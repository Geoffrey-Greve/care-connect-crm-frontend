import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface KPIResponse {
  id: string;
  kpiName: string;
  value: string | number;
  target: string | number;
  status: "met" | "not-met" | "pending";
  notes?: string;
}

const mockKPIData: KPIResponse[] = [
  {
    id: "KPI-001",
    kpiName: "Client Satisfaction Score",
    value: 4.5,
    target: 4.0,
    status: "met",
    notes: "Excellent feedback from clients this month",
  },
  {
    id: "KPI-002",
    kpiName: "On-Time Arrival Rate",
    value: "92%",
    target: "90%",
    status: "met",
  },
  {
    id: "KPI-003",
    kpiName: "Documentation Completion",
    value: "85%",
    target: "95%",
    status: "not-met",
    notes: "Need to improve documentation timeliness",
  },
  {
    id: "KPI-004",
    kpiName: "Training Hours Completed",
    value: 24,
    target: 20,
    status: "met",
  },
];

// Mock staff list
const mockStaffList = [
  { id: "STAFF-001", name: "Harrison" },
  { id: "STAFF-002", name: "John Smith" },
  { id: "STAFF-003", name: "Sarah Johnson" },
  { id: "STAFF-004", name: "Mike Chen" },
  { id: "STAFF-005", name: "Emma Davis" },
];

export default function KPITracker() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>("2025-11-13");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("STAFF-001");
  const [kpiResponses, setKpiResponses] = useState<KPIResponse[]>(mockKPIData);
  const [isLoading, setIsLoading] = useState(false);

  const selectedStaff = mockStaffList.find(s => s.id === selectedStaffId);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleViewKPIsResponse = () => {
    // Navigate to KPI Response page with selected date
    navigate(`/kpi-response?date=${selectedDate}`);
  };

  const handleSubmit = () => {
    toast({
      title: "KPIs Submitted",
      description: `KPI responses for ${selectedStaff?.name || "Staff"} have been submitted successfully.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "met":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Met
          </span>
        );
      case "not-met":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Not Met
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Date and View Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="kpi-date">Date</Label>
            <Input
              id="kpi-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[200px]"
            />
          </div>
        </div>
        <Button onClick={handleViewKPIsResponse} disabled={isLoading}>
          View KPIs Response
        </Button>
      </div>

      {/* KPIs Section */}
      <Card>
        <CardContent className="p-0">
          {/* KPIs Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-muted/50 border-b">
            <h2 className="text-lg font-semibold">KPIs</h2>
            <span className="text-sm font-medium text-muted-foreground">
              {selectedStaff?.name || "Staff"}
            </span>
          </div>

          {/* KPIs Content */}
          <div className="p-6 space-y-6">
            {kpiResponses.length > 0 ? (
              <div className="space-y-4">
                {kpiResponses.map((kpi) => (
                  <div
                    key={kpi.id}
                    className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-base mb-2">{kpi.kpiName}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Value: </span>
                            <span className="font-medium">{kpi.value}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Target: </span>
                            <span className="font-medium">{kpi.target}</span>
                          </div>
                        </div>
                        {kpi.notes && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium">Notes: </span>
                            {kpi.notes}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(kpi.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No KPI responses found for the selected date.</p>
                <p className="text-sm mt-2">Click "View KPIs Response" to load data.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-start">
        <Button onClick={handleSubmit} size="lg">
          Submit
        </Button>
      </div>
    </div>
  );
}

