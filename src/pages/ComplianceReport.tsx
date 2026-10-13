import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, ChevronUp, ChevronDown, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComplianceCheck {
  id: string;
  name: string;
}

interface StaffCompliance {
  id: string;
  staffName: string;
  covid19Compliance: string;
  policeCheck: string;
  visaDocumentation: string;
  firstAidCertificate: string;
  ndisWorkerCheck: string;
  workingWithChildrenCheck: string;
}

const complianceCategories: ComplianceCheck[] = [
  { id: "1", name: "COVID-19 Compliance" },
  { id: "2", name: "Police Check" },
  { id: "3", name: "Visa Documentation" },
  { id: "4", name: "First Aid Certificate" },
  { id: "5", name: "NDIS Worker Check (NDISWC)" },
  { id: "6", name: "Working With Children Check" },
];

const mockStaffCompliance: StaffCompliance[] = [
  {
    id: "1",
    staffName: "Harrison",
    covid19Compliance: "-",
    policeCheck: "-",
    visaDocumentation: "-",
    firstAidCertificate: "-",
    ndisWorkerCheck: "-",
    workingWithChildrenCheck: "-",
  },
  {
    id: "2",
    staffName: "Testing",
    covid19Compliance: "-",
    policeCheck: "-",
    visaDocumentation: "-",
    firstAidCertificate: "-",
    ndisWorkerCheck: "-",
    workingWithChildrenCheck: "-",
  },
];

export default function ComplianceReport() {
  const { toast } = useToast();
  const [staff] = useState<StaffCompliance[]>(mockStaffCompliance);
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
      description: "Your compliance report is being generated and will download shortly.",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Report</h1>
          <p className="text-muted-foreground">Track staff compliance checks and certifications</p>
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
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('staffName')}>
                      <div className="flex items-center gap-2">
                        Staff Name
                        {getSortIcon('staffName')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        COVID-19 Compliance
                        <div className="flex flex-col">
                          <ChevronUp className="h-3 w-3 opacity-30" />
                          <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        Police Check
                        <div className="flex flex-col">
                          <ChevronUp className="h-3 w-3 opacity-30" />
                          <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        Visa Documentation
                        <div className="flex flex-col">
                          <ChevronUp className="h-3 w-3 opacity-30" />
                          <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        First Aid Certificate
                        <div className="flex flex-col">
                          <ChevronUp className="h-3 w-3 opacity-30" />
                          <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        NDIS Worker Check (NDISWC)
                        <div className="flex flex-col">
                          <ChevronUp className="h-3 w-3 opacity-30" />
                          <ChevronDown className="h-3 w-3 opacity-30 -mt-1" />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        Working With Children Check
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
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No staff found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStaff.map((member) => {
                      const isExpanded = expandedRows.includes(member.id);
                      return (
                        <>
                          <TableRow key={member.id}>
                            <TableCell>
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
                            </TableCell>
                            <TableCell className="font-medium">{member.staffName}</TableCell>
                            <TableCell>{member.covid19Compliance}</TableCell>
                            <TableCell>{member.policeCheck}</TableCell>
                            <TableCell>{member.visaDocumentation}</TableCell>
                            <TableCell>{member.firstAidCertificate}</TableCell>
                            <TableCell>{member.ndisWorkerCheck}</TableCell>
                            <TableCell>{member.workingWithChildrenCheck}</TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={8} className="bg-muted/50 p-0">
                                <div className="py-4 pl-8 space-y-2">
                                  {complianceCategories.map((category) => (
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
