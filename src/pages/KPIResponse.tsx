import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

interface KPIResponseData {
  id: string;
  kpiName: string;
  value: string | number;
  target: string | number;
  status: "met" | "not-met" | "pending";
  notes?: string;
  date: string;
}

// Mock data - in production, this would come from an API
const mockKPIResponses: KPIResponseData[] = [
  {
    id: "KPI-RESP-001",
    kpiName: "Client Satisfaction Score",
    value: 4.5,
    target: 4.0,
    status: "met",
    notes: "Excellent feedback from clients this month",
    date: "2025-11-13",
  },
  {
    id: "KPI-RESP-002",
    kpiName: "On-Time Arrival Rate",
    value: "92%",
    target: "90%",
    status: "met",
    date: "2025-11-13",
  },
];

export default function KPIResponse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>("2025-11-13");
  const [kpiResponses, setKpiResponses] = useState<KPIResponseData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSearchWithDate = (date: string) => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      const filteredResponses = mockKPIResponses.filter(
        response => response.date === date
      );
      setKpiResponses(filteredResponses);
      setIsSearching(false);

      if (filteredResponses.length === 0) {
        toast({
          title: "No Records Found",
          description: `No KPI records found for ${formatDate(date)}.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Records Loaded",
          description: `Found ${filteredResponses.length} KPI record(s) for ${formatDate(date)}.`,
        });
      }
    }, 500);
  };

  const handleSearch = () => {
    handleSearchWithDate(selectedDate);
  };

  // Get date from URL params if available
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      setSelectedDate(dateParam);
      // Auto-search when date is provided from URL
      handleSearchWithDate(dateParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleBack = () => {
    navigate("/kpi-tracker");
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
      {/* Header with Date, Search, and Back Button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="kpi-response-date" className="font-semibold">Date</Label>
            <Input
              id="kpi-response-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[200px]"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching} className="h-10 self-end">
            {isSearching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Search"}
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <Card>
        <CardContent className="p-6">
          {kpiResponses.length > 0 ? (
            <div className="space-y-4">
              {kpiResponses.map((response) => (
                <div
                  key={response.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-base mb-2">{response.kpiName}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Value: </span>
                          <span className="font-medium">{response.value}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Target: </span>
                          <span className="font-medium">{response.target}</span>
                        </div>
                      </div>
                      {response.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">Notes: </span>
                          {response.notes}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(response.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-base text-muted-foreground">
                No Record found for this date
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

