import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ChevronUp, ChevronDown, Download, MoreVertical, ChevronLeft, ChevronRight, Upload, FileX, FileText, X, Eye, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusChangeModal from "@/components/StatusChangeModal";
import DocumentUploadModal, { DocumentUploadFormData } from "@/components/DocumentUploadModal";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  useGetStaffDocumentsQuery,
  useCreateStaffDocumentMutation,
  useUpdateStaffDocumentMutation,
  useChangeStaffDocumentStatusMutation,
  useDeleteStaffDocumentMutation,
} from "@/redux/api/staffDocumentApi";
import { ErrorDialog } from "@/components/ErrorDialog";
import type { StaffDocument } from "@/types/models";

type SortField = 'serialNo' | 'documentName' | 'lastUpdate' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export default function SharedDocument() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [selectedDocumentStatus, setSelectedDocumentStatus] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all staff documents (no staff_id filter to get all)
  const { data: documentsData, isLoading: isLoadingDocuments } = useGetStaffDocumentsQuery({});

  // Mutations
  const [createStaffDocument, { isLoading: isCreatingDocument }] = useCreateStaffDocumentMutation();
  const [updateStaffDocument, { isLoading: isUpdatingDocument }] = useUpdateStaffDocumentMutation();
  const [changeStaffDocumentStatus, { isLoading: isTogglingStatus }] = useChangeStaffDocumentStatusMutation();
  const [deleteStaffDocument, { isLoading: isDeletingDocument }] = useDeleteStaffDocumentMutation();

  // Transform API documents to display format
  const documents = useMemo(() => {
    if (!documentsData?.data) return [];
    return documentsData.data
      .filter((doc: StaffDocument) => doc.is_deleted === 0) // Only show non-deleted documents
      .map((doc: StaffDocument, index: number) => ({
        id: doc.id.toString(),
        serialNo: index + 1,
        documentName: doc.document || "Untitled Document",
        documentUrl: doc.document || "",
        lastUpdate: doc.updatedAt || doc.createdAt || "",
        status: doc.status === 1 ? "Active" : "Inactive",
        statusValue: doc.status,
        rawDocument: doc,
      }));
  }, [documentsData]);

  const handleSort = (field: SortField) => {
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let result = [...documents];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(doc =>
        doc.documentName.toLowerCase().includes(searchLower) ||
        doc.status.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case 'serialNo':
            aValue = a.serialNo;
            bValue = b.serialNo;
            break;
          case 'documentName':
            aValue = a.documentName;
            bValue = b.documentName;
            break;
          case 'lastUpdate':
            aValue = a.lastUpdate;
            bValue = b.lastUpdate;
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
  }, [documents, search, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDocuments.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedDocuments = filteredAndSortedDocuments.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = (documentUrl: string, documentName: string) => {
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = documentName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `Downloading ${documentName}...`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: `Failed to download ${documentName}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleStatusClick = (documentId: number, currentStatus: number) => {
    setSelectedDocumentId(documentId);
    setSelectedDocumentStatus(currentStatus);
    setShowStatusModal(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedDocumentId) return;

    try {
      const statusValue = newStatus === "Active" ? 1 : 0;
      await changeStaffDocumentStatus({ id: selectedDocumentId, status: statusValue }).unwrap();

      toast({
        title: "Status Updated",
        description: `Document status has been updated to ${newStatus}.`,
      });

      setShowStatusModal(false);
      setSelectedDocumentId(null);
      setSelectedDocumentStatus(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to update status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setShowStatusModal(false);
      setSelectedDocumentId(null);
      setSelectedDocumentStatus(null);
    }
  };

  const handleDeleteClick = (documentId: number) => {
    setDocumentToDelete(documentId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await deleteStaffDocument(documentToDelete).unwrap();
      toast({
        title: "Document Deleted",
        description: "Document has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to delete document";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleView = (documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (document && document.documentUrl) {
      // Open document in a new tab/window for viewing
      try {
        window.open(document.documentUrl, '_blank', 'noopener,noreferrer');
        toast({
          title: "Opening Document",
          description: `Opening ${document.documentName} in a new tab...`,
        });
      } catch (error) {
        console.error('View error:', error);
        toast({
          title: "View Failed",
          description: `Failed to open ${document.documentName}. Please try again.`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Document Not Available",
        description: "Document URL is not available.",
        variant: "destructive",
      });
    }
  };

  const handleUploadDocument = () => {
    setEditingDocumentId(null);
    setIsUploadModalOpen(true);
  };

  const handleDocumentSubmit = async (data: DocumentUploadFormData) => {
    try {
      // For now, we'll need to convert the file to base64 or handle file upload
      // Since the API expects a document string, we'll need to handle file upload separately
      // For now, using documentName as the document identifier
      
      if (editingDocumentId) {
        // Update existing document
        await updateStaffDocument({
          id: editingDocumentId,
          data: {
            document: data.file ? await fileToBase64(data.file) : undefined,
          },
        }).unwrap();

        toast({
          title: "Document Updated",
          description: `Document has been updated successfully.`,
        });
      } else {
        // Note: Create requires staff_id, which we don't have in the form
        // For now, we'll need to add staff selection or use a default
        // This is a limitation - we need staff_id to create documents
        toast({
          title: "Error",
          description: "Staff selection is required to create a document. Please add staff selection to the form.",
          variant: "destructive",
        });
        return;
      }

      setIsUploadModalOpen(false);
      setEditingDocumentId(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || `Failed to ${editingDocumentId ? "update" : "create"} document`;
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleExpiredDocuments = () => {
    navigate("/clients/expired-documents");
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Shared Document</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExpiredDocuments}>
            <FileX className="h-4 w-4 mr-2" />
            Expired Document
          </Button>
          <Button onClick={handleUploadDocument}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select value={entriesPerPage.toString()} onValueChange={(value) => {
                setEntriesPerPage(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[80px] h-8">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Search:</span>
                <Input
                  type="text"
                  placeholder=""
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-[200px] h-8"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <button
                      onClick={() => handleSort('serialNo')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      No
                      {getSortIcon('serialNo')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('documentName')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Document Name
                      {getSortIcon('documentName')}
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <span className="font-semibold">Download</span>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('lastUpdate')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Last Update
                      {getSortIcon('lastUpdate')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Status
                      {getSortIcon('status')}
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <span className="font-semibold">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingDocuments ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : paginatedDocuments.length > 0 ? (
                  paginatedDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.serialNo}</TableCell>
                      <TableCell className="font-medium">{doc.documentName}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownload(doc.documentUrl, doc.documentName)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell>{formatDate(doc.lastUpdate)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={doc.status === "Active" ? "secondary" : "destructive"}
                          className={`cursor-pointer hover:opacity-80 transition-opacity ${
                            doc.status === "Active"
                              ? "border-green-500 text-green-700 bg-green-50"
                              : "border-red-500 text-red-700 bg-red-50"
                          }`}
                          onClick={() => handleStatusClick(parseInt(doc.id), doc.statusValue)}
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(doc.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDownload(doc.documentUrl, doc.documentName)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClick(parseInt(doc.id))}
                              disabled={isDeletingDocument}
                            >
                              {isDeletingDocument ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No documents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedDocuments.length)} of {filteredAndSortedDocuments.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || totalPages === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={showStatusModal}
        onOpenChange={setShowStatusModal}
        title="Change Document Status"
        nameLabel="Document Name"
        nameValue={selectedDocumentId ? documents.find(d => d.id === selectedDocumentId.toString())?.documentName || "" : ""}
        currentStatus={selectedDocumentStatus === 1 ? "Active" : "Inactive"}
        statusOptions={["Active", "Inactive"]}
        onConfirm={handleStatusChange}
      />

      {/* Delete Confirmation Dialog */}
      <StatusChangeModal
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Document"
        nameLabel="Document Name"
        nameValue={documentToDelete ? documents.find(d => d.id === documentToDelete.toString())?.documentName || "" : ""}
        currentStatus=""
        statusOptions={[]}
        onConfirm={async () => {
          await handleConfirmDelete();
        }}
      />

      {/* Upload/Update Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setEditingDocumentId(null);
        }}
        onSubmit={handleDocumentSubmit}
        initialData={editingDocumentId ? {
          documentName: documents.find(d => d.id === editingDocumentId.toString())?.documentName || "",
          file: null,
          documentUrl: documents.find(d => d.id === editingDocumentId.toString())?.documentUrl || "",
        } : undefined}
      />

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  );
}

