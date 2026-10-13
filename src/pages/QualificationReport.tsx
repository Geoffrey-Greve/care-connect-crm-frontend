import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, ChevronUp, ChevronDown, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QualificationCategory {
  id: string;
  name: string;
}

interface StaffQualification {
  id: string;
  staffName: string;
  certificateIIIDisabilityWork: string;
  certificateIVDisabilityWork: string;
  diplomaDisabilityStudies: string;
  certificateIVWorkplaceAssessmentTraining: string;
  certificateIIIInAgeingSupport: string;
  certificateIVInAgeingSupport: string;
  diplomaAgedCareServices: string;
  enrolledNurse: string;
  otherCertificates: string;
  overseasNurseDoctor: string;
  overseasTherapist: string;
}

const qualificationCategories: QualificationCategory[] = [
  { id: "1", name: "Registered Nurse" },
  { id: "2", name: "Certificate III Disability Work" },
  { id: "3", name: "Certificate IV Disability Work" },
  { id: "4", name: "Diploma Disability Studies" },
  { id: "5", name: "Certificate IV Workplace Assessment & Training" },
  { id: "6", name: "Certificate III in Ageing Support" },
  { id: "7", name: "Certificate IV in Ageing Support" },
  { id: "8", name: "Diploma Aged Care Services" },
  { id: "9", name: "Enrolled Nurse" },
  { id: "10", name: "Other Certificates" },
  { id: "11", name: "Overseas Nurse/Doctor" },
];

const mockStaffQualifications: StaffQualification[] = [
  {
    id: "1",
    staffName: "Harrison",
    certificateIIIDisabilityWork: "-",
    certificateIVDisabilityWork: "-",
    diplomaDisabilityStudies: "-",
    certificateIVWorkplaceAssessmentTraining: "-",
    certificateIIIInAgeingSupport: "-",
    certificateIVInAgeingSupport: "-",
    diplomaAgedCareServices: "-",
    enrolledNurse: "-",
    otherCertificates: "-",
    overseasNurseDoctor: "-",
    overseasTherapist: "-",
  },
  {
    id: "2",
    staffName: "Testing",
    certificateIIIDisabilityWork: "-",
    certificateIVDisabilityWork: "-",
    diplomaDisabilityStudies: "-",
    certificateIVWorkplaceAssessmentTraining: "-",
    certificateIIIInAgeingSupport: "-",
    certificateIVInAgeingSupport: "-",
    diplomaAgedCareServices: "-",
    enrolledNurse: "-",
    otherCertificates: "-",
    overseasNurseDoctor: "-",
    overseasTherapist: "-",
  },
];

export default function QualificationReport() {
  const { toast } = useToast();
  const [staff] = useState<StaffQualification[]>(mockStaffQualifications);
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
      description: "Your qualification report is being generated and will download shortly.",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Qualification Report</h1>
          <p className="text-muted-foreground">Track staff qualifications and certifications</p>
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
          <Button variant="outline" onClick={handleExport} className="bg-primary text-primary-foreground">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
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
                      Certificate III Disability Work
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Certificate IV Disability Work
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Diploma Disability Studies
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Certificate IV Workplace Assessment & Training
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Certificate III in Ageing Support
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Certificate IV in Ageing Support
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Diploma Aged Care Services
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Enrolled Nurse
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Other Certificates
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Overseas Nurse/Doctor
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 opacity-30" />
                        <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-1">
                      Overseas Therapist
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
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
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
                            {member.staffName}
                          </TableCell>
                          <TableCell>{member.certificateIIIDisabilityWork}</TableCell>
                          <TableCell>{member.certificateIVDisabilityWork}</TableCell>
                          <TableCell>{member.diplomaDisabilityStudies}</TableCell>
                          <TableCell>{member.certificateIVWorkplaceAssessmentTraining}</TableCell>
                          <TableCell>{member.certificateIIIInAgeingSupport}</TableCell>
                          <TableCell>{member.certificateIVInAgeingSupport}</TableCell>
                          <TableCell>{member.diplomaAgedCareServices}</TableCell>
                          <TableCell>{member.enrolledNurse}</TableCell>
                          <TableCell>{member.otherCertificates}</TableCell>
                          <TableCell>{member.overseasNurseDoctor}</TableCell>
                          <TableCell>{member.overseasTherapist}</TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={12} className="bg-muted/50 p-0">
                              <div className="py-4 pl-8 space-y-2">
                                {qualificationCategories.map((category) => (
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

