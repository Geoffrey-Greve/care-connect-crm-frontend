import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, MoreHorizontal, Plus, Pencil, Eye, Trash2, Loader2 } from "lucide-react";
import KPIModal, { KPIModalData } from "@/components/KPIModal";
import StatusChangeModal from "@/components/StatusChangeModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useGetKPIsQuery,
  useCreateKPIMutation,
  useUpdateKPIMutation,
  useDeleteKPIMutation,
  useChangeKPIStatusMutation,
} from "@/redux/api/kpiApi";
import { ErrorDialog } from "@/components/ErrorDialog";
import type { KPI as KPIType } from "@/types/models";

interface KPITitle {
  id: string;
  serialNo: number;
  title: string;
  type: "KPI" | "sub KPI";
  parentKPI: string;
  status: "Active" | "Inactive";
  statusValue: number;
  responseType: string;
  rawData: KPIType;
}

export default function ManageKPI() {
  const { toast } = useToast();
  
  // Fetch KPIs from API
  const { data: kpisData, isLoading: isLoadingKPIs } = useGetKPIsQuery();
  const [createKPI, { isLoading: isCreating }] = useCreateKPIMutation();
  const [updateKPI, { isLoading: isUpdating }] = useUpdateKPIMutation();
  const [deleteKPI, { isLoading: isDeleting }] = useDeleteKPIMutation();
  const [changeKPIStatus, { isLoading: isTogglingStatus }] = useChangeKPIStatusMutation();
  
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Transform API data to component format
  const data = useMemo<KPITitle[]>(() => {
    if (!kpisData?.data) return [];
    return kpisData.data
      .filter((kpi: KPIType) => kpi.is_deleted === 0)
      .map((kpi: KPIType, index: number) => ({
        id: kpi.id.toString(),
        serialNo: index + 1,
        title: kpi.title,
        type: (kpi.kpi_type === "KPI" ? "KPI" : "sub KPI") as "KPI" | "sub KPI",
        parentKPI: kpi.ParentKPI?.title || "--",
        status: kpi.status === 1 ? "Active" : "Inactive",
        statusValue: kpi.status,
        responseType: kpi.response_type,
        rawData: kpi,
      }));
  }, [kpisData]);

  // Get parent KPI options (only KPIs, not Sub KPIs)
  const parentKPIOptions = useMemo(() => {
    if (!kpisData?.data) return [];
    return kpisData.data
      .filter((kpi: KPIType) => kpi.is_deleted === 0 && kpi.kpi_type === "KPI")
      .map((kpi: KPIType) => ({
        id: kpi.id.toString(),
        title: kpi.title,
      }));
  }, [kpisData]);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedKPI, setSelectedKPI] = useState<KPITitle | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedKPIForStatus, setSelectedKPIForStatus] = useState<KPITitle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [kpiToDelete, setKpiToDelete] = useState<KPITitle | null>(null);

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

  const filteredData = useMemo(() => {
    let result = [...data];

    if (search) {
      result = result.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.parentKPI !== "--" && item.parentKPI.toLowerCase().includes(search.toLowerCase())) ||
        item.status.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case 'serialNo':
            aValue = a.serialNo;
            bValue = b.serialNo;
            break;
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'parentKPI':
            aValue = a.parentKPI;
            bValue = b.parentKPI;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return result;
  }, [data, search, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / entriesPerPage));
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredData, currentPage, entriesPerPage]);

  const handleNewTitle = () => {
    setSelectedKPI(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEdit = (item: KPITitle) => {
    setSelectedKPI(item);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleView = (item: KPITitle) => {
    setSelectedKPI(item);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleModalSubmit = async (formData: KPIModalData) => {
    try {
      if (modalMode === "create") {
        await createKPI({
          kpi_type: formData.type,
          title: formData.title,
          parent_kpi_id: formData.type === "sub KPI" && formData.parentKPI 
            ? (parentKPIOptions.find(kpi => kpi.title === formData.parentKPI)?.id 
                ? parseInt(parentKPIOptions.find(kpi => kpi.title === formData.parentKPI)!.id) 
                : null)
            : null,
          response_type: formData.responseType,
        }).unwrap();
        toast({
          title: "Success",
          description: "KPI created successfully.",
        });
      } else if (modalMode === "edit" && selectedKPI) {
        await updateKPI({
          id: parseInt(selectedKPI.id),
          data: {
            kpi_type: formData.type,
            title: formData.title,
            parent_kpi_id: formData.type === "sub KPI" && formData.parentKPI 
              ? (parentKPIOptions.find(kpi => kpi.title === formData.parentKPI)?.id 
                  ? parseInt(parentKPIOptions.find(kpi => kpi.title === formData.parentKPI)!.id) 
                  : null)
              : null,
            response_type: formData.responseType,
          },
        }).unwrap();
        toast({
          title: "Success",
          description: "KPI updated successfully.",
        });
      }
      setModalOpen(false);
      setSelectedKPI(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to save KPI";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const getModalData = (): KPIModalData | undefined => {
    if (!selectedKPI) return undefined;
    const normalizeResponseType = (type: string): KPIModalData["responseType"] =>
      type === "Text Box" ? "Text Box" : "Yes/No";

    return {
      id: selectedKPI.id,
      title: selectedKPI.title,
      type: selectedKPI.type,
      parentKPI: selectedKPI.parentKPI === "--" ? "" : selectedKPI.parentKPI,
      status: selectedKPI.status,
      responseType: normalizeResponseType(selectedKPI.responseType),
    };
  };

  const handleStatusClick = (item: KPITitle) => {
    setSelectedKPIForStatus(item);
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedKPIForStatus) return;
    try {
      const statusValue = newStatus === "Active" ? 1 : 0;
      await changeKPIStatus({
        id: parseInt(selectedKPIForStatus.id),
        status: statusValue,
      }).unwrap();
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
      setStatusModalOpen(false);
      setSelectedKPIForStatus(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to update status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setStatusModalOpen(false);
      setSelectedKPIForStatus(null);
    }
  };

  const handleDeleteClick = (item: KPITitle) => {
    setKpiToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!kpiToDelete) return;
    try {
      await deleteKPI(parseInt(kpiToDelete.id)).unwrap();
      toast({
        title: "Success",
        description: `KPI "${kpiToDelete.title}" has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setKpiToDelete(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to delete KPI";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setDeleteDialogOpen(false);
      setKpiToDelete(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manage KPI</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage KPI titles and their configurations</p>
        </div>
        <Button onClick={handleNewTitle} className="px-4 md:px-6 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Title
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
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
                className="w-full sm:w-[200px]"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            {isLoadingKPIs ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table className="min-w-[600px]">
                <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Serial No</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1">
                      Title
                      {getSortIcon('title')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('parentKPI')}>
                    <div className="flex items-center gap-1">
                      Parent KPI
                      {getSortIcon('parentKPI')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('serialNo')}>
                    <div className="flex items-center gap-1">
                      Action
                      {getSortIcon('serialNo')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No data available in table
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.serialNo}</TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.parentKPI}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`cursor-pointer hover:opacity-80 transition-opacity ${
                            item.status === "Active"
                              ? "border-green-500 text-green-700 bg-green-50"
                              : "border-red-500 text-red-700 bg-red-50"
                          }`}
                          onClick={() => handleStatusClick(item)}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(item)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(item)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || filteredData.length === 0}
              >
                Previous
              </Button>
              <Button
                variant={currentPage === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={filteredData.length === 0}
              >
                1
              </Button>
              {totalPages > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || filteredData.length === 0}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Modal */}
      <KPIModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        data={getModalData()}
        parentKPIOptions={parentKPIOptions.map(kpi => kpi.title)}
        onSubmit={handleModalSubmit}
      />

      {/* Status Change Modal */}
      {selectedKPIForStatus && (
        <StatusChangeModal
          isOpen={statusModalOpen}
          onOpenChange={setStatusModalOpen}
          title="Update KPI Status"
          nameLabel="KPI Title"
          nameValue={selectedKPIForStatus.title}
          currentStatus={selectedKPIForStatus.status}
          statusOptions={["Active", "Inactive"]}
          onConfirm={handleStatusUpdate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the KPI{" "}
              <span className="font-semibold">"{kpiToDelete?.title}"</span> and remove it from
              your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setKpiToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  );
}

