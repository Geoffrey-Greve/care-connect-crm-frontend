import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, ChevronUp, ChevronDown, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SkillCategory {
  id: string;
  name: string;
}

interface StaffSkill {
  id: string;
  staffName: string;
  agedCareAssessment: string;
  foodHandling: string;
  hoistTraining: string;
  onlineTraining: string;
  autismAssessment: string;
  manualHandling: string;
  medicationHandling: string;
  suctioningCare: string;
  complexPhysicalCareAssessment: string;
  dementiaCareAssessment: string;
  paediatricChildrenAssessment: string;
}

const skillCategories: SkillCategory[] = [
  { id: "1", name: "Wheelchair Handling" },
  { id: "2", name: "Aged Care Assessment" },
  { id: "3", name: "Food Handling" },
  { id: "4", name: "Hoist Training" },
  { id: "5", name: "Online Training" },
  { id: "6", name: "Austim Assessment" },
  { id: "7", name: "Manual Handling" },
  { id: "8", name: "Medication Handling" },
  { id: "9", name: "Suctioning Care" },
  { id: "10", name: "Complex Physical Care Assessment" },
  { id: "11", name: "Dementia Care Assessment" },
  { id: "12", name: "Paediatric/Children Assessment" },
];

const mockStaffSkills: StaffSkill[] = [
  {
    id: "1",
    staffName: "Harrison",
    agedCareAssessment: "-",
    foodHandling: "-",
    hoistTraining: "-",
    onlineTraining: "-",
    autismAssessment: "-",
    manualHandling: "-",
    medicationHandling: "-",
    suctioningCare: "-",
    complexPhysicalCareAssessment: "-",
    dementiaCareAssessment: "-",
    paediatricChildrenAssessment: "-",
  },
  {
    id: "2",
    staffName: "Testing",
    agedCareAssessment: "-",
    foodHandling: "-",
    hoistTraining: "-",
    onlineTraining: "-",
    autismAssessment: "-",
    manualHandling: "-",
    medicationHandling: "-",
    suctioningCare: "-",
    complexPhysicalCareAssessment: "-",
    dementiaCareAssessment: "-",
    paediatricChildrenAssessment: "-",
  },
];

export default function SkillReport() {
  const { toast } = useToast();
  const [staff] = useState<StaffSkill[]>(mockStaffSkills);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const handleSort = (field: string) => {
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

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col">
          <ChevronUp className="h-3 w-3 opacity-30" />
          <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
        </div>
      );
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const filteredStaff = useMemo(() => {
    let result = [...staff];

    if (search) {
      result = result.filter((member) =>
        member.staffName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string;
        let bValue: string;

        switch (sortField) {
          case 'staffName':
            aValue = a.staffName;
            bValue = b.staffName;
            break;
          default:
            return 0;
        }

        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return result;
  }, [staff, search, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredStaff.length / entriesPerPage);
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredStaff.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredStaff, currentPage, entriesPerPage]);

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your skill report is being generated and will download shortly.",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Report</h1>
          <p className="text-muted-foreground">Track staff skills and training assessments</p>
        </div>
        <Button variant="outline" onClick={handleExport} className="bg-primary text-primary-foreground">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={entriesPerPage.toString()}
                onValueChange={(value) => {
                  setEntriesPerPage(Number(value));
                  setCurrentPage(1);
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
            <div className="flex items-center gap-2">
              <Label className="text-sm">Search:</Label>
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-[200px]"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="cursor-pointer" onClick={() => handleSort('staffName')}>
                    <div className="flex items-center gap-1">
                      Staff Name
                      {getSortIcon('staffName')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Aged Care Assessment
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Food Handling
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Hoist Training
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Online Training
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Austim Assessment
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Manual Handling
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Medication Handling
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Suctioning Care
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Complex Physical Care Assessment
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Dementia Care Assessment
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Paediatric/Children Assessment
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                      No staff found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStaff.map((member) => {
                    const isExpanded = expandedRows.includes(member.id);
                    return (
                      <>
                        <TableRow key={member.id}>

                          <TableCell className="flex items-center font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-transparent"
                              onClick={() => {
                                if (isExpanded) {
                                  setExpandedRows(expandedRows.filter(id => id !== member.id));
                                } else {
                                  setExpandedRows([...expandedRows, member.id]);
                                }
                              }}
                            >
                              {isExpanded ? (
                                <Minus className="h-4 w-4 text-red-500" />
                              ) : (
                                <Plus className="h-4 w-4 text-blue-500" />
                              )}
                            </Button>
                            {member.staffName}</TableCell>
                          <TableCell>{member.agedCareAssessment}</TableCell>
                          <TableCell>{member.foodHandling}</TableCell>
                          <TableCell>{member.hoistTraining}</TableCell>
                          <TableCell>{member.onlineTraining}</TableCell>
                          <TableCell>{member.autismAssessment}</TableCell>
                          <TableCell>{member.manualHandling}</TableCell>
                          <TableCell>{member.medicationHandling}</TableCell>
                          <TableCell>{member.suctioningCare}</TableCell>
                          <TableCell>{member.complexPhysicalCareAssessment}</TableCell>
                          <TableCell>{member.dementiaCareAssessment}</TableCell>
                          <TableCell>{member.paediatricChildrenAssessment}</TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={13} className="bg-muted/50 p-0">
                              <div className="py-4 pl-8 space-y-2">
                                {skillCategories.map((category) => (
                                  <div key={category.id} className="text-sm">
                                    {category.name} -
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, filteredStaff.length)} of {filteredStaff.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

