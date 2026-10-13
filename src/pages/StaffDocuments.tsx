import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter, Download, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreVertical, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import StatusChangeModal from '@/components/StatusChangeModal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetStaffDocumentsQuery, useCreateStaffDocumentMutation, useUpdateStaffDocumentMutation, useDeleteStaffDocumentMutation, useChangeStaffDocumentStatusMutation } from '@/redux/api/staffDocumentApi';
import { useGetStaffDocumentCategoriesQuery } from '@/redux/api/staffDocumentCategoryApi';
import { useGetStaffByIdQuery } from '@/redux/api/staffApi';
import { ErrorDialog } from '@/components/ErrorDialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface StaffDocument {
    id: string;
    serialNo: number;
    category: string;
    categoryType: string;
    dateOfExpiry: string | null;
    documentUrl: string;
    status: string;
}


type DocumentSortField = 'serialNo' | 'category' | 'categoryType' | 'dateOfExpiry' | 'status';
type DocumentSortDirection = 'asc' | 'desc' | null;

const StaffDocuments = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<DocumentSortField | null>(null);
    const [sortDirection, setSortDirection] = useState<DocumentSortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(25);
    const [isNewDocumentModalOpen, setIsNewDocumentModalOpen] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
    const [documentForm, setDocumentForm] = useState({
        category_id: "",
        file: null as File | null,
        appVisibility: "Yes",
        expiration: "Yes",
        expirationDate: "",
    });
    const [documentErrors, setDocumentErrors] = useState<{
        category_id?: string;
        file?: string;
        expirationDate?: string;
    }>({});
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<StaffDocument | null>(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string>("");
    const [filterExpireFrom, setFilterExpireFrom] = useState<string>("");
    const [filterExpireTo, setFilterExpireTo] = useState<string>("");
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // API hooks
    const { data: documentsData, isLoading: isLoadingDocuments, isFetching: isFetchingDocuments } = useGetStaffDocumentsQuery({
        staff_id: id ? parseInt(id) : undefined,
    }, { skip: !id });
    const { data: staffData } = useGetStaffByIdQuery(id ? parseInt(id) : 0, { skip: !id });
    const { data: categoriesData } = useGetStaffDocumentCategoriesQuery({ limit: 100 });
    const [createDocument, { isLoading: isCreatingDocument }] = useCreateStaffDocumentMutation();
    const [updateDocument, { isLoading: isUpdatingDocument }] = useUpdateStaffDocumentMutation();
    const [deleteDocument, { isLoading: isDeletingDocument }] = useDeleteStaffDocumentMutation();
    const [changeDocumentStatus, { isLoading: isChangingStatus }] = useChangeStaffDocumentStatusMutation();

    // Get staff name
    const staffName = staffData?.data ? `${staffData.data.first_name} ${staffData.data.last_name}` : "Staff";

    // Transform API data to UI format
    const documents: StaffDocument[] = useMemo(() => {
        if (!documentsData?.data) return [];
        
        return documentsData.data
            .filter((doc) => doc.is_deleted === 0)
            .map((doc, index) => ({
                id: doc.id.toString(),
                serialNo: index + 1,
                category: doc.StaffDocumentCategory?.name || "Uncategorized",
                categoryType: doc.StaffDocumentCategory?.name || "",
                dateOfExpiry: doc.expiration_date || null,
                documentUrl: doc.document,
                status: doc.status === 1 ? "Active" : "Inactive",
            }));
    }, [documentsData]);

    // Get document categories for dropdown
    const documentCategories = categoriesData?.data?.filter(cat => cat.status) || [];

    const handleSort = (field: DocumentSortField) => {
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

    const getSortIcon = (field: DocumentSortField) => {
        if (sortField !== field) {
            return <ChevronUp className="h-4 w-4 opacity-30" />;
        }
        return sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
        ) : (
            <ChevronDown className="h-4 w-4" />
        );
    };

    // Get unique categories for filter dropdown
    const uniqueCategories = useMemo(() => {
        const categories = new Set(documents.map(doc => doc.category));
        return Array.from(categories).sort();
    }, [documents]);

    // Filter and sort documents
    const filteredAndSortedDocuments = useMemo(() => {
        let result = [...documents];

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(doc =>
                doc.category.toLowerCase().includes(searchLower) ||
                doc.categoryType.toLowerCase().includes(searchLower) ||
                doc.status.toLowerCase().includes(searchLower)
            );
        }

        // Apply category filter
        if (filterCategory) {
            result = result.filter(doc => doc.category === filterCategory);
        }

        // Apply expiration date range filter
        if (filterExpireFrom || filterExpireTo) {
            result = result.filter(doc => {
                if (!doc.dateOfExpiry) return false; // Exclude documents without expiry date

                const expiryDate = new Date(doc.dateOfExpiry);
                if (isNaN(expiryDate.getTime())) return false;

                if (filterExpireFrom && filterExpireTo) {
                    const fromDate = new Date(filterExpireFrom);
                    const toDate = new Date(filterExpireTo);
                    toDate.setHours(23, 59, 59, 999); // Include the entire end date
                    return expiryDate >= fromDate && expiryDate <= toDate;
                } else if (filterExpireFrom) {
                    const fromDate = new Date(filterExpireFrom);
                    return expiryDate >= fromDate;
                } else if (filterExpireTo) {
                    const toDate = new Date(filterExpireTo);
                    toDate.setHours(23, 59, 59, 999); // Include the entire end date
                    return expiryDate <= toDate;
                }
                return true;
            });
        }

        // Apply sorting
        if (sortField && sortDirection) {
            result.sort((a, b) => {
                let aValue: string | number | null;
                let bValue: string | number | null;

                switch (sortField) {
                    case 'serialNo':
                        aValue = a.serialNo;
                        bValue = b.serialNo;
                        break;
                    case 'category':
                        aValue = a.category;
                        bValue = b.category;
                        break;
                    case 'categoryType':
                        aValue = a.categoryType;
                        bValue = b.categoryType;
                        break;
                    case 'dateOfExpiry':
                        aValue = a.dateOfExpiry;
                        bValue = b.dateOfExpiry;
                        break;
                    case 'status':
                        aValue = a.status;
                        bValue = b.status;
                        break;
                    default:
                        return 0;
                }

                if (aValue === null && bValue === null) return 0;
                if (aValue === null) return 1;
                if (bValue === null) return -1;

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                }

                return sortDirection === 'asc'
                    ? String(aValue).localeCompare(String(bValue))
                    : String(bValue).localeCompare(String(aValue));
            });
        }

        return result;
    }, [documents, search, sortField, sortDirection, filterCategory, filterExpireFrom, filterExpireTo]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedDocuments.length / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const paginatedDocuments = filteredAndSortedDocuments.slice(startIndex, endIndex);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "—";
        // Handle both date string formats (ISO date string or formatted date)
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return as-is if invalid date
        return date.toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleDownload = (documentUrl: string) => {
        // In production, handle actual download
        console.log('Downloading:', documentUrl);
    };

    const handleNewDocument = () => {
        setIsViewMode(false);
        setSelectedDocumentId(null);
        setIsNewDocumentModalOpen(true);
        setDocumentForm({
            category_id: "",
            file: null,
            appVisibility: "Yes",
            expiration: "Yes",
            expirationDate: "",
        });
        setDocumentErrors({});
    };

    const handleViewDocument = (documentId: string) => {
        const document = documents.find(doc => doc.id === documentId);
        if (!document) return;

        // Find the document in API data to get full details
        const apiDoc = documentsData?.data?.find(d => d.id.toString() === documentId);
        if (!apiDoc) return;

        setIsViewMode(true);
        setSelectedDocumentId(documentId);
        setIsNewDocumentModalOpen(true);

        // Pre-fill form with document data
        setDocumentForm({
            category_id: apiDoc.category_id?.toString() || "",
            file: null, // File can't be pre-filled, but we can show the document name
            appVisibility: apiDoc.staff_visibility === 1 ? "Yes" : "No",
            expiration: apiDoc.expiration === 1 ? "Yes" : "No",
            expirationDate: apiDoc.expiration_date || "",
        });
        setDocumentErrors({});
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setDocumentForm({ ...documentForm, file });
        if (documentErrors.file) {
            setDocumentErrors({ ...documentErrors, file: undefined });
        }
    };

    const validateDocumentForm = () => {
        const errors: typeof documentErrors = {};

        if (!documentForm.category_id.trim()) {
            errors.category_id = "Category is required";
        }
        if (!isViewMode && !documentForm.file) {
            errors.file = "Document file is required";
        }
        if (documentForm.expiration === "Yes" && !documentForm.expirationDate.trim()) {
            errors.expirationDate = "Expiration date is required";
        }

        setDocumentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveDocument = async () => {
        if (!validateDocumentForm() || !id) {
            return;
        }

        try {
            // For file upload, we'll need to handle it properly (base64 or file upload endpoint)
            // For now, assuming document field accepts a path/URL string
            const documentPath = documentForm.file ? documentForm.file.name : undefined;

            if (isViewMode && selectedDocumentId) {
                // Update existing document
                await updateDocument({
                    id: parseInt(selectedDocumentId),
                    data: {
                        document: documentPath,
                        category_id: documentForm.category_id ? parseInt(documentForm.category_id) : undefined,
                        staff_visibility: documentForm.appVisibility === "Yes" ? 1 : 0,
                        expiration: documentForm.expiration === "Yes" ? 1 : 0,
                        expiration_date: documentForm.expiration === "Yes" ? documentForm.expirationDate : undefined,
                    },
                }).unwrap();

                toast({
                    title: "Document Updated",
                    description: "Staff document has been updated successfully.",
                });
            } else {
                // Create new document
                if (!documentForm.file) {
                    setDocumentErrors({ ...documentErrors, file: "Document file is required" });
                    return;
                }

                await createDocument({
                    staff_id: parseInt(id),
                    document: documentPath || "",
                    category_id: documentForm.category_id ? parseInt(documentForm.category_id) : undefined,
                    staff_visibility: documentForm.appVisibility === "Yes" ? 1 : 0,
                    expiration: documentForm.expiration === "Yes" ? 1 : 0,
                    expiration_date: documentForm.expiration === "Yes" ? documentForm.expirationDate : undefined,
                }).unwrap();

                toast({
                    title: "Document Added",
                    description: "Staff document has been added successfully.",
                });
            }

            setIsNewDocumentModalOpen(false);
            setIsViewMode(false);
            setSelectedDocumentId(null);
            setDocumentForm({
                category_id: "",
                file: null,
                appVisibility: "Yes",
                expiration: "Yes",
                expirationDate: "",
            });
            setDocumentErrors({});
        } catch (error: any) {
            const errorMsg = error?.data?.message || "Failed to save document";
            setErrorMessage(errorMsg);
            setIsErrorDialogOpen(true);
        }
    };

    const handleCloseDocumentModal = () => {
        setIsNewDocumentModalOpen(false);
        setIsViewMode(false);
        setSelectedDocumentId(null);
        setDocumentForm({
            category_id: "",
            file: null,
            appVisibility: "Yes",
            expiration: "Yes",
            expirationDate: "",
        });
        setDocumentErrors({});
    };

    const handleFilter = () => {
        setIsFilterModalOpen(true);
    };

    const handleClearFilters = () => {
        setFilterCategory("");
        setFilterExpireFrom("");
        setFilterExpireTo("");
        setCurrentPage(1);
    };

    const handleApplyFilters = () => {
        setIsFilterModalOpen(false);
        setCurrentPage(1);
    };

    const handleStatusClick = (doc: StaffDocument) => {
        setSelectedDocument(doc);
        setShowStatusModal(true);
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedDocument) return;

        try {
            const statusValue = newStatus === "Active" ? 1 : 0;
            await changeDocumentStatus({
                id: parseInt(selectedDocument.id),
                status: statusValue,
            }).unwrap();

            toast({
                title: "Status Updated",
                description: `Document status has been updated to ${newStatus}.`,
            });

            setShowStatusModal(false);
            setSelectedDocument(null);
        } catch (error: any) {
            const errorMsg = error?.data?.message || "Failed to update document status";
            setErrorMessage(errorMsg);
            setIsErrorDialogOpen(true);
            setShowStatusModal(false);
            setSelectedDocument(null);
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        try {
            await deleteDocument(parseInt(documentId)).unwrap();
            toast({
                title: "Document Deleted",
                description: "Staff document has been deleted successfully.",
            });
        } catch (error: any) {
            const errorMsg = error?.data?.message || "Failed to delete document";
            setErrorMessage(errorMsg);
            setIsErrorDialogOpen(true);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">   
                <Button variant="ghost" onClick={() => navigate(`/staff/${id}`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={() => navigate('/staff-list')} className="cursor-pointer">
                                Staff List
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink onClick={() => navigate(`/staff/${id}`)} className="cursor-pointer">
                                View Staff
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Documents</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h1 className="text-2xl font-bold">{staffName}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant='outline' onClick={()=>navigate('/clients/expired-documents')} className='border-red-500 text-red-500 hover:bg-red-500'>
                        <FileX className="h-4 w-4 mr-2" />
                        Expired Documents
                    </Button>
                    <Button onClick={handleNewDocument}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Document
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleFilter}>
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                <div className="relative flex-1 sm:flex-initial sm:w-[300px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Documents Table */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <button
                                    onClick={() => handleSort('serialNo')}
                                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                                >
                                    Serial No
                                    {getSortIcon('serialNo')}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort('category')}
                                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                                >
                                    Category
                                    {getSortIcon('category')}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort('categoryType')}
                                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                                >
                                    Category Type
                                    {getSortIcon('categoryType')}
                                </button>
                            </TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort('dateOfExpiry')}
                                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                                >
                                    Date of Expiry
                                    {getSortIcon('dateOfExpiry')}
                                </button>
                            </TableHead>
                            <TableHead>Document</TableHead>
                            <TableHead>
                                <button
                                    onClick={() => handleSort('status')}
                                    className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                                >
                                    Status
                                    {getSortIcon('status')}
                                </button>
                            </TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingDocuments || isFetchingDocuments ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : paginatedDocuments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No documents found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedDocuments.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell>{doc.serialNo}</TableCell>
                                    <TableCell className="font-medium">{doc.category}</TableCell>
                                    <TableCell>{doc.categoryType}</TableCell>
                                    <TableCell>{formatDate(doc.dateOfExpiry)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleDownload(doc.documentUrl)}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={doc.status === "Active" ? "secondary" : "destructive"}
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => handleStatusClick(doc)}
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
                                                <DropdownMenuItem onClick={() => handleViewDocument(doc.id)}>
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                    disabled={isDeletingDocument}
                                                >
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
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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

            {/* New Document Modal */}
            <Dialog open={isNewDocumentModalOpen} onOpenChange={handleCloseDocumentModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{isViewMode ? "View Document" : "New Document"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="doc-category">
                                Category <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={documentForm.category_id}
                                onValueChange={(value) => {
                                    setDocumentForm({ ...documentForm, category_id: value });
                                    if (documentErrors.category_id) {
                                        setDocumentErrors({ ...documentErrors, category_id: undefined });
                                    }
                                }}
                            >
                                <SelectTrigger id="doc-category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {documentCategories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {documentErrors.category_id && (
                                <p className="text-sm text-destructive">{documentErrors.category_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="doc-file">
                                Document {!isViewMode && <span className="text-destructive">*</span>}
                            </Label>
                            {isViewMode && selectedDocumentId ? (
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm flex-1 truncate">
                                        {documents.find(d => d.id === selectedDocumentId)?.categoryType || "Document"}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2"
                                        onClick={() => handleDownload(documents.find(d => d.id === selectedDocumentId)?.documentUrl || "")}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Input
                                        id="doc-file"
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Supported: PDF, DOC, DOCX, JPG, PNG (max 10MB)
                                    </p>
                                    {documentForm.file && (
                                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                            <FileText className="h-4 w-4" />
                                            <span className="text-sm flex-1 truncate">{documentForm.file.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={() => setDocumentForm({ ...documentForm, file: null })}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                    {documentErrors.file && (
                                        <p className="text-sm text-destructive">{documentErrors.file}</p>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>App Visibility</Label>
                            <RadioGroup
                                value={documentForm.appVisibility}
                                onValueChange={(value) => setDocumentForm({ ...documentForm, appVisibility: value })}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Yes" id="visibility-yes" />
                                    <Label htmlFor="visibility-yes" className="font-normal cursor-pointer">
                                        Yes
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="No" id="visibility-no" />
                                    <Label htmlFor="visibility-no" className="font-normal cursor-pointer">
                                        No
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label>Expiration</Label>
                            <RadioGroup
                                value={documentForm.expiration}
                                onValueChange={(value) => {
                                    setDocumentForm({
                                        ...documentForm,
                                        expiration: value,
                                        expirationDate: value === "No" ? "" : documentForm.expirationDate
                                    });
                                    if (documentErrors.expirationDate) {
                                        setDocumentErrors({ ...documentErrors, expirationDate: undefined });
                                    }
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Yes" id="expiration-yes" />
                                    <Label htmlFor="expiration-yes" className="font-normal cursor-pointer">
                                        Yes
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="No" id="expiration-no" />
                                    <Label htmlFor="expiration-no" className="font-normal cursor-pointer">
                                        No
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {documentForm.expiration === "Yes" && (
                            <div className="space-y-2">
                                <Label htmlFor="expiration-date">
                                    Expiration Date <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="expiration-date"
                                    type="date"
                                    value={documentForm.expirationDate}
                                    onChange={(e) => {
                                        setDocumentForm({ ...documentForm, expirationDate: e.target.value });
                                        if (documentErrors.expirationDate) {
                                            setDocumentErrors({ ...documentErrors, expirationDate: undefined });
                                        }
                                    }}
                                />
                                {documentErrors.expirationDate && (
                                    <p className="text-sm text-destructive">{documentErrors.expirationDate}</p>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDocumentModal} disabled={isCreatingDocument || isUpdatingDocument}>
                            Close
                        </Button>
                        <Button onClick={handleSaveDocument} disabled={isCreatingDocument || isUpdatingDocument}>
                            {isCreatingDocument || isUpdatingDocument ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isViewMode ? "Updating..." : "Adding..."}
                                </>
                            ) : (
                                isViewMode ? "Update Document" : "Add Document"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Change Modal */}
            <StatusChangeModal
                isOpen={showStatusModal}
                onOpenChange={setShowStatusModal}
                title="Change Document Status"
                nameLabel="Document Category"
                nameValue={selectedDocument?.category || ""}
                currentStatus={selectedDocument?.status || ""}
                statusOptions={["Active", "Inactive", "Expired"]}
                onConfirm={handleStatusChange}
            />

            {/* Advanced Filter Modal */}
            <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Filter Staff Documents</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="filter-category">Category</Label>
                            <Select
                                value={filterCategory || "all"}
                                onValueChange={(value) => setFilterCategory(value === "all" ? "" : value)}
                            >
                                <SelectTrigger id="filter-category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {uniqueCategories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="filter-expire-from">Expire From Date</Label>
                            <Input
                                id="filter-expire-from"
                                type="date"
                                value={filterExpireFrom}
                                onChange={(e) => setFilterExpireFrom(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="filter-expire-to">Expire To Date</Label>
                            <Input
                                id="filter-expire-to"
                                type="date"
                                value={filterExpireTo}
                                onChange={(e) => setFilterExpireTo(e.target.value)}
                                min={filterExpireFrom || undefined}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleClearFilters}>
                            Clear
                        </Button>
                        <Button variant="outline" onClick={() => setIsFilterModalOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={handleApplyFilters}>
                            Filter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ErrorDialog
                open={isErrorDialogOpen}
                onOpenChange={setIsErrorDialogOpen}
                message={errorMessage}
            />
        </div>
    );
};

export default StaffDocuments;

