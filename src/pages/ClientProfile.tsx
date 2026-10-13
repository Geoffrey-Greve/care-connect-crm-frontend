import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Settings, FileText, User, Phone, Mail, MapPin, Calendar, Globe, Heart, Users, Building2, Plus, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Upload, Eye, EyeOff, X, MoreVertical, Trash2, Image as ImageIcon, Info, Loader2, Archive } from 'lucide-react';
import { useGetClientByIdQuery } from '@/redux/api/clientsApi';
import { 
  useGetClientDocumentsQuery, 
  useCreateClientDocumentMutation,
  useUpdateClientDocumentMutation,
  useDeleteClientDocumentMutation,
  useChangeClientDocumentStatusMutation 
} from '@/redux/api/clientDocumentApi';
import { useGetClientDocumentCategoriesQuery } from '@/redux/api/clientDocumentCategoryApi';
import { useGetClientTypesQuery } from '@/redux/api/clientTypeApi';
import { useGetLanguagesQuery } from '@/redux/api/languageApi';
import { useUpdateClientMutation, useArchiveClientMutation, useUnarchiveClientMutation, useToggleClientStatusMutation } from '@/redux/api/clientsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ErrorDialog } from '@/components/ErrorDialog';
import ClientGoals from '@/components/ClientGoals';
import ClientFunds from '@/components/ClientFunds';
import ClientInvoices from '@/components/ClientInvoices';
import ClientContacts from '@/components/ClientContacts';
import ClientPublicInformation from '@/components/ClientPublicInformation';
import ClientAdditionalInformation from '@/components/ClientAdditionalInformation';
import ArchiveConfirmationModal from '@/components/ArchiveConfirmationModal';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Mock client data - in production, this would come from an API
const mockClients = [
  {
    id: "CLI-001",
    name: "Sarah Johnson",
    gender: "Female",
    dateOfBirth: "1985-03-15",
    primaryPhone: "+61 3 9123 4567",
    secondaryPhone: "+61 400 123 456",
    email: "sarah.johnson@email.com",
    language: "English",
    maritalStatus: "Single",
    religion: "Christian",
    nationality: "Australian",
    address: "123 Main Street, Melbourne VIC 3000",
    ndisNumber: "NDIS-001234567",
    clientType: "Self-Managed",
    status: "Active",
    profileImg: "",
  },
  {
    id: "CLI-002",
    name: "Robert Smith",
    gender: "Male",
    dateOfBirth: "1978-11-22",
    primaryPhone: "+61 2 8234 5678",
    secondaryPhone: "+61 400 234 567",
    email: "robert.smith@email.com",
    language: "English",
    maritalStatus: "Married",
    religion: "None",
    nationality: "Australian",
    address: "456 Oak Avenue, Sydney NSW 2000",
    ndisNumber: "NDIS-002345678",
    clientType: "Plan Managed",
    status: "Active",
    profileImg: "",
      },
      {
    id: "CLI-003",
    name: "Maria Garcia",
    gender: "Female",
    dateOfBirth: "1992-07-08",
    primaryPhone: "+61 7 3345 6789",
    secondaryPhone: "+61 400 345 678",
    email: "maria.garcia@email.com",
    language: "Spanish",
    maritalStatus: "Single",
    religion: "Catholic",
    nationality: "Spanish",
    address: "789 Pine Road, Brisbane QLD 4000",
    ndisNumber: "NDIS-003456789",
    clientType: "NDIA Managed",
    status: "Active",
    profileImg: "",
  },
];

// Mock documents data
const mockDocuments = [
  {
    id: "DOC-001",
    name: "NDIS Plan 2024",
    category: "NDIS Plan",
    staffVisibility: true,
    expireAt: "2024-12-31",
    noExpiration: false,
    uploadDate: "2024-01-15",
    fileSize: "2.5 MB",
  },
  {
    id: "DOC-002",
    name: "Medical Certificate",
    category: "Medical",
    staffVisibility: true,
    expireAt: "2024-06-30",
    noExpiration: false,
    uploadDate: "2024-01-20",
    fileSize: "1.2 MB",
  },
  {
    id: "DOC-003",
    name: "Identity Document",
    category: "Identity",
    staffVisibility: false,
    expireAt: null,
    noExpiration: true,
    uploadDate: "2024-01-10",
    fileSize: "0.8 MB",
  },
  {
    id: "DOC-004",
    name: "Service Agreement",
    category: "Legal",
    staffVisibility: true,
    expireAt: "2025-01-15",
    noExpiration: false,
    uploadDate: "2024-01-25",
    fileSize: "3.1 MB",
  },
  {
    id: "DOC-005",
    name: "Assessment Report",
    category: "Assessment",
    staffVisibility: true,
    expireAt: null,
    noExpiration: true,
    uploadDate: "2024-02-01",
    fileSize: "4.5 MB",
  },
];

// Mock support network data
const mockSupportNetworks = [
  {
    id: "SN-001",
    clientName: "Sarah Johnson",
    supportNetworkName: "Johnson",
    supportNetworkCode: "SN-JOH-001",
    email: "johnson.supportnetwork@email.com",
    mobile: "+61 400 123 456",
    status: "Active",
  },
  {
    id: "SN-002",
    clientName: "Robert Smith",
    supportNetworkName: "Smith",
    supportNetworkCode: "SN-SMI-002",
    email: "smith.supportnetwork@email.com",
    mobile: "+61 400 234 567",
    status: "Active",
  },
  {
    id: "SN-003",
    clientName: "Maria Garcia",
    supportNetworkName: "Garcia",
    supportNetworkCode: "SN-GAR-003",
    email: "garcia.supportnetwork@email.com",
    mobile: "+61 400 345 678",
    status: "Inactive",
  },
];

type SortField = 'name' | 'category' | 'expireAt';
type SortDirection = 'asc' | 'desc' | null;

type SupportNetworkSortField = 'clientName' | 'supportNetworkName' | 'supportNetworkCode' | 'email' | 'mobile' | 'status';
type SupportNetworkSortDirection = 'asc' | 'desc' | null;

const ClientProfile = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch client data from API
  const { data: clientData, isLoading: isLoadingClient, isFetching } = useGetClientByIdQuery(
    parseInt(clientId || "0"),
    { skip: !clientId }
  );
  
  // Fetch client documents
  const { data: documentsData, isLoading: isLoadingDocuments } = useGetClientDocumentsQuery(
    { client_id: parseInt(clientId || "0") },
    { skip: !clientId }
  );
  
  // Document mutations
  const [createDocument, { isLoading: isCreatingDocument }] = useCreateClientDocumentMutation();
  const [updateDocument, { isLoading: isUpdatingDocument }] = useUpdateClientDocumentMutation();
  const [deleteDocument, { isLoading: isDeletingDocument }] = useDeleteClientDocumentMutation();
  const [changeDocumentStatus, { isLoading: isChangingDocumentStatus }] = useChangeClientDocumentStatusMutation();
  
  // Fetch document categories, client types, and languages
  const { data: documentCategoriesData } = useGetClientDocumentCategoriesQuery({ limit: 100 });
  const { data: clientTypesData } = useGetClientTypesQuery({ limit: 100 });
  const { data: languagesData } = useGetLanguagesQuery({ limit: 100 });
  
  // Client mutations
  const [updateClient, { isLoading: isUpdatingClient }] = useUpdateClientMutation();
  const [archiveClient, { isLoading: isArchivingClient }] = useArchiveClientMutation();
  const [unarchiveClient, { isLoading: isUnarchivingClient }] = useUnarchiveClientMutation();
  const [toggleClientStatus, { isLoading: isTogglingStatus }] = useToggleClientStatusMutation();
  
  const documentCategories = documentCategoriesData?.data?.filter(cat => cat.status) || [];
  const clientTypes = clientTypesData?.data?.filter(ct => ct.status) || [];
  const languages = languagesData?.data?.filter(lang => lang.status) || [];
  
  const [client, setClient] = useState<any>(null);
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
  const [isStatusActive, setIsStatusActive] = useState(true);
  const [isArchived, setIsArchived] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    displayName: "",
    gender: "",
    dateOfBirth: "",
    primaryPhone: "",
    secondaryPhone: "",
    email: "",
    language: "",
    maritalStatus: "",
    religion: "",
    nationality: "",
    address: "",
    ndisNumber: "",
    clientType: "",
    profileImg: "",
  });

  // Document states
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isUpdateDocumentOpen, setIsUpdateDocumentOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isDeleteDocumentDialogOpen, setIsDeleteDocumentDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentSortField, setDocumentSortField] = useState<SortField | null>(null);
  const [documentSortDirection, setDocumentSortDirection] = useState<SortDirection>(null);
  const [documentCurrentPage, setDocumentCurrentPage] = useState(1);
  const [documentEntriesPerPage, setDocumentEntriesPerPage] = useState(10);
  const [documentForm, setDocumentForm] = useState({
    name: "",
    category_id: "" as string | number,
    staffVisibility: true,
    expireAt: "",
    noExpiration: false,
    file: null as File | null,
    notes: "",
  });

  // Support Network states
  const [supportNetworks, setSupportNetworks] = useState(mockSupportNetworks);
  const [isAddSupportNetworkOpen, setIsAddSupportNetworkOpen] = useState(false);
  const [isUpdateSupportNetworkOpen, setIsUpdateSupportNetworkOpen] = useState(false);
  const [selectedSupportNetwork, setSelectedSupportNetwork] = useState<any>(null);
  const [supportNetworkSearch, setSupportNetworkSearch] = useState("");
  const [supportNetworkSortField, setSupportNetworkSortField] = useState<SupportNetworkSortField | null>(null);
  const [supportNetworkSortDirection, setSupportNetworkSortDirection] = useState<SupportNetworkSortDirection>(null);
  const [supportNetworkCurrentPage, setSupportNetworkCurrentPage] = useState(1);
  const [supportNetworkEntriesPerPage, setSupportNetworkEntriesPerPage] = useState(10);

  // Additional Information state
  const [privateInfo, setPrivateInfo] = useState("This is private information about the client that should be kept confidential.");
  const [reviewDate, setReviewDate] = useState<string>("2024-12-31");
  const [supportNetworkForm, setSupportNetworkForm] = useState({
    salutation: "",
    firstName: "",
    middleName: "",
    lastName: "",
    displayName: "",
    maritalStatus: "",
    dateOfBirth: "",
    gender: "",
    language: "",
    address: "",
    clientType: "",
    ndisNumber: "",
    primaryPhone: "",
    email: "",
    secondaryPhone: "",
    nationality: "",
    religion: "",
    image: null as File | null,
  });
  const [supportNetworkImagePreview, setSupportNetworkImagePreview] = useState<string | null>(null);
  const [showSupportNetworkStatusModal, setShowSupportNetworkStatusModal] = useState(false);
  const [selectedSupportNetworkForStatus, setSelectedSupportNetworkForStatus] = useState<any>(null);
  const [showStatusToggleConfirmation, setShowStatusToggleConfirmation] = useState(false);

  useEffect(() => {
    if (clientData?.data) {
      const apiClient: any = clientData.data;
      
      // Helper function to normalize gender value to match Select options
      const normalizeGender = (gender: string): string => {
        if (!gender) return "";
        const lowerGender = gender.toLowerCase();
        if (lowerGender === "male") return "Male";
        if (lowerGender === "female") return "Female";
        if (lowerGender === "other") return "Other";
        if (lowerGender === "prefer not to say") return "Prefer not to say";
        // If already capitalized or doesn't match, return as is
        return gender;
      };

      // Helper function to normalize marital status value to match Select options
      const normalizeMaritalStatus = (status: string): string => {
        if (!status) return "";
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === "single") return "Single";
        if (lowerStatus === "married") return "Married";
        if (lowerStatus === "divorced") return "Divorced";
        if (lowerStatus === "widowed") return "Widowed";
        if (lowerStatus === "separated") return "Separated";
        // If already capitalized or doesn't match, return as is
        return status;
      };
      
      const rawGender = apiClient.gender || "";
      const rawMaritalStatus = apiClient.marital_status || apiClient.maritalStatus || "";
      const normalizedGender = normalizeGender(rawGender);
      const normalizedMaritalStatus = normalizeMaritalStatus(rawMaritalStatus);
      
      // Transform API data to match expected structure
      const transformedClient = {
        id: apiClient.id.toString(),
        name: apiClient.display_name || apiClient.displayName || `${apiClient.first_name || apiClient.firstName} ${apiClient.last_name || apiClient.lastName}`,
        gender: normalizedGender,
        dateOfBirth: apiClient.date_of_birth || apiClient.dateOfBirth || "",
        primaryPhone: apiClient.primary_phone_number || apiClient.primaryPhone || "",
        secondaryPhone: apiClient.secondary_phone_number || apiClient.secondaryPhone || "",
        email: apiClient.email || "",
        language: apiClient.Language?.name || apiClient.language?.name || "",
        maritalStatus: normalizedMaritalStatus,
        religion: apiClient.religion || "",
        nationality: apiClient.nationality || "",
        address: apiClient.address || "",
        ndisNumber: apiClient.ndis_number || apiClient.ndisNumber || "",
        clientType: apiClient.ClientType?.name || apiClient.clientType?.name || "",
        status: apiClient.status ? "Active" : "Inactive",
        profileImg: apiClient.profile_img || apiClient.profileImg || "",
      };
      
      setClient(transformedClient);
      setIsStatusActive(apiClient.status === true || apiClient.status === 1);
      setIsArchived(apiClient.archived === 1 || apiClient.is_archived === 1 || false);
      setFormData({
        salutation: apiClient.salutation || "",
        firstName: apiClient.first_name || apiClient.firstName || "",
        lastName: apiClient.last_name || apiClient.lastName || "",
        displayName: apiClient.display_name || apiClient.displayName || "",
        gender: normalizedGender,
        dateOfBirth: apiClient.date_of_birth || apiClient.dateOfBirth || "",
        primaryPhone: apiClient.primary_phone_number || apiClient.primaryPhone || "",
        secondaryPhone: apiClient.secondary_phone_number || apiClient.secondaryPhone || "",
        email: apiClient.email || "",
        language: (apiClient.Language?.id || apiClient.language?.id)?.toString() || "",
        maritalStatus: normalizedMaritalStatus,
        religion: apiClient.religion || "",
        nationality: apiClient.nationality || "",
        address: apiClient.address || "",
        ndisNumber: apiClient.ndis_number || apiClient.ndisNumber || "",
        clientType: (apiClient.ClientType?.id || apiClient.clientType?.id)?.toString() || "",
        profileImg: apiClient.profile_img || apiClient.profileImg || "",
      });
    }
  }, [clientData]);

  const handleStatusToggle = (checked: boolean) => {
    // Show confirmation dialog before toggling
    setShowStatusToggleConfirmation(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!clientId) return;

    try {
      await toggleClientStatus(parseInt(clientId)).unwrap();
      setIsStatusActive(!isStatusActive);
      setShowStatusToggleConfirmation(false);
    } catch (error: any) {
      console.error("Failed to toggle client status:", error);
      const errorMsg = error?.data?.message || "Failed to toggle client status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setShowStatusToggleConfirmation(false);
    }
  };

  const handleArchiveClick = () => {
    setIsArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!clientId) return;
    
    try {
      const newArchiveStatus = !isArchived;
      
      if (newArchiveStatus) {
        await archiveClient(parseInt(clientId)).unwrap();
      } else {
        await unarchiveClient(parseInt(clientId)).unwrap();
      }
      
      setIsArchived(newArchiveStatus);
      setIsArchiveModalOpen(false);
    } catch (error: any) {
      console.error("Failed to archive/unarchive client:", error);
      const errorMsg = error?.data?.message || "Failed to update archive status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setIsArchiveModalOpen(false);
    }
  };

  const handleUpdate = () => {
    // Refresh formData from current client data when opening update modal
    if (clientData?.data) {
      const apiClient: any = clientData.data;
      
      // Helper function to normalize gender value to match Select options
      const normalizeGender = (gender: string): string => {
        if (!gender) return "";
        const lowerGender = gender.toLowerCase();
        if (lowerGender === "male") return "Male";
        if (lowerGender === "female") return "Female";
        if (lowerGender === "other") return "Other";
        if (lowerGender === "prefer not to say") return "Prefer not to say";
        return gender;
      };

      // Helper function to normalize marital status value to match Select options
      const normalizeMaritalStatus = (status: string): string => {
        if (!status) return "";
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === "single") return "Single";
        if (lowerStatus === "married") return "Married";
        if (lowerStatus === "divorced") return "Divorced";
        if (lowerStatus === "widowed") return "Widowed";
        if (lowerStatus === "separated") return "Separated";
        return status;
      };
      
      const rawGender = apiClient.gender || "";
      const rawMaritalStatus = apiClient.marital_status || apiClient.maritalStatus || "";
      const normalizedGender = normalizeGender(rawGender);
      const normalizedMaritalStatus = normalizeMaritalStatus(rawMaritalStatus);
      
      // Debug logging
      console.log("API Client Data:", apiClient);
      console.log("Raw Gender:", rawGender, "Normalized:", normalizedGender);
      console.log("Raw Marital Status:", rawMaritalStatus, "Normalized:", normalizedMaritalStatus);
      
      setFormData({
        salutation: apiClient.salutation || "",
        firstName: apiClient.first_name || apiClient.firstName || "",
        lastName: apiClient.last_name || apiClient.lastName || "",
        displayName: apiClient.display_name || apiClient.displayName || "",
        gender: normalizedGender,
        dateOfBirth: apiClient.date_of_birth || apiClient.dateOfBirth || "",
        primaryPhone: apiClient.primary_phone_number || apiClient.primaryPhone || "",
        secondaryPhone: apiClient.secondary_phone_number || apiClient.secondaryPhone || "",
        email: apiClient.email || "",
        language: (apiClient.Language?.id || apiClient.language?.id)?.toString() || "",
        maritalStatus: normalizedMaritalStatus,
        religion: apiClient.religion || "",
        nationality: apiClient.nationality || "",
        address: apiClient.address || "",
        ndisNumber: apiClient.ndis_number || apiClient.ndisNumber || "",
        clientType: (apiClient.ClientType?.id || apiClient.clientType?.id)?.toString() || "",
        profileImg: apiClient.profile_img || apiClient.profileImg || "",
      });
    }
    setIsUpdateSheetOpen(true);
  };

  const handleSaveUpdate = async () => {
    if (!clientId) return;

    try {
      const payload: any = {
        salutation: formData.salutation || undefined,
        first_name: formData.firstName,
        last_name: formData.lastName,
        display_name: formData.displayName || undefined,
        email: formData.email,
        primary_phone_number: formData.primaryPhone,
        secondary_phone_number: formData.secondaryPhone || undefined,
        client_type: formData.clientType ? parseInt(formData.clientType) : undefined,
        ndis_number: formData.ndisNumber || undefined,
        nationality: formData.nationality || undefined,
        religion: formData.religion || undefined,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth || undefined,
        marital_status: formData.maritalStatus,
        address: formData.address || undefined,
        language: formData.language ? parseInt(formData.language) : undefined,
        profile_img: formData.profileImg || undefined,
      };

      await updateClient({
        id: parseInt(clientId),
        ...payload,
      }).unwrap();

      setIsUpdateSheetOpen(false);
    } catch (error: any) {
      console.error("Failed to update client:", error);
      const errorMsg = error?.data?.message || "Failed to update client";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const handleManage = () => {
    // Navigate to manage page or open manage dialog
    toast({
      title: "Manage Client",
      description: "Manage functionality will be implemented here.",
    });
  };

  const handleNotes = () => {
    // Navigate to notes page or open notes dialog
    toast({
      title: "Client Notes",
      description: "Notes functionality will be implemented here.",
    });
  };

  // Document handlers
  const handleAddDocument = () => {
    setIsAddDocumentOpen(true);
  };

  const handleViewAllDocuments = () => {
    // Navigate to full documents page
    toast({
      title: "View All Documents",
      description: "Navigating to all documents page...",
    });
  };

  const handleDocumentSort = (field: SortField) => {
    if (documentSortField === field) {
      if (documentSortDirection === 'asc') {
        setDocumentSortDirection('desc');
      } else if (documentSortDirection === 'desc') {
        setDocumentSortField(null);
        setDocumentSortDirection(null);
      }
    } else {
      setDocumentSortField(field);
      setDocumentSortDirection('asc');
    }
  };

  const getDocumentSortIcon = (field: SortField) => {
    if (documentSortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return documentSortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF, DOC, DOCX, JPG, or PNG files only",
          variant: "destructive",
        });
        return;
      }
      setDocumentForm({ ...documentForm, file, name: file.name });
    }
  };

  const handleDocumentSubmit = async () => {
    // Validation
    if (!documentForm.file) {
      toast({
        title: "Validation Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    if (!documentForm.noExpiration && !documentForm.expireAt) {
      toast({
        title: "Validation Error",
        description: "Please provide an expiry date or select 'No Expiration'",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create document with API
      const requestBody: any = {
        client_id: parseInt(clientId || "0"),
        document: documentForm.file ? documentForm.file.name : "", // File name - backend will handle upload
        staff_visibility: documentForm.staffVisibility ? 1 : 0,
        expiration: documentForm.noExpiration ? 0 : 1,
      };

      // Only include category_id if it's provided
      if (documentForm.category_id) {
        requestBody.category_id = parseInt(documentForm.category_id.toString());
      }

      // Only include expiration_date if expiration is enabled
      if (!documentForm.noExpiration && documentForm.expireAt) {
        requestBody.expiration_date = documentForm.expireAt;
      }

      await createDocument(requestBody).unwrap();

      setDocumentForm({
        name: "",
        category_id: "",
        staffVisibility: true,
        expireAt: "",
        noExpiration: false,
        file: null,
        notes: "",
      });
      setIsAddDocumentOpen(false);
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to upload document";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const handleEditDocument = (doc: any) => {
    setSelectedDocument(doc);
    setDocumentForm({
      name: doc.name || "",
      category_id: doc.category_id || doc.ClientDocumentCategory?.id || "",
      staffVisibility: doc.staff_visibility === 1,
      expireAt: doc.expiration_date || "",
      noExpiration: doc.expiration === 0,
      file: null,
      notes: "",
    });
    setIsUpdateDocumentOpen(true);
  };

  const handleUpdateDocumentSubmit = async () => {
    if (!selectedDocument) return;

    try {
      await updateDocument({
        id: parseInt(selectedDocument.id),
        data: {
          document: selectedDocument.document,
          category_id: documentForm.category_id ? parseInt(documentForm.category_id.toString()) : undefined,
          staff_visibility: documentForm.staffVisibility ? 1 : 0,
          expiration: documentForm.noExpiration ? 0 : 1,
          expiration_date: documentForm.noExpiration ? undefined : documentForm.expireAt,
        },
      }).unwrap();

      setIsUpdateDocumentOpen(false);
      setSelectedDocument(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to update document";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const handleDeleteDocumentClick = (docId: number) => {
    setDocumentToDelete(docId);
    setIsDeleteDocumentDialogOpen(true);
  };

  const handleConfirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocument(documentToDelete).unwrap();
      setIsDeleteDocumentDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Failed to delete document";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setIsDeleteDocumentDialogOpen(false);
    }
  };

  // Filter and sort documents
  // Transform API documents data
  const documentsArray = useMemo(() => {
    if (!documentsData?.data) return [];
    return documentsData.data.map((doc) => {
      // Get category name from relation or lookup by category_id
      let categoryName = 'Uncategorized';
      if (doc.ClientDocumentCategory?.name) {
        categoryName = doc.ClientDocumentCategory.name;
      } else if (doc.category_id) {
        const category = documentCategories.find(cat => cat.id === doc.category_id);
        if (category) {
          categoryName = category.name;
        }
      }

      return {
        id: doc.id.toString(),
        name: doc.document ? doc.document.split('/').pop() || 'Unknown' : 'Unknown',
        category: categoryName,
        staffVisibility: doc.staff_visibility === 1,
        expireAt: doc.expiration_date || null,
        noExpiration: doc.expiration === 0,
        uploadDate: doc.createdAt,
        fileSize: 'N/A', // File size not provided by API
        status: doc.status,
        document: doc.document,
        client_id: doc.client_id,
        category_id: doc.category_id,
      };
    });
  }, [documentsData, documentCategories]);

  const filteredAndSortedDocuments = useMemo(() => {
    let result = [...documentsArray];

    // Apply search filter
    if (documentSearch) {
      const search = documentSearch.toLowerCase();
      result = result.filter(doc =>
        doc.name.toLowerCase().includes(search) ||
        doc.category.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (documentSortField && documentSortDirection) {
      result.sort((a, b) => {
        let aValue: string | null;
        let bValue: string | null;

        switch (documentSortField) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'category':
            aValue = a.category;
            bValue = b.category;
            break;
          case 'expireAt':
            aValue = a.expireAt;
            bValue = b.expireAt;
            break;
          default:
            return 0;
        }

        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        return documentSortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }

    return result;
  }, [documentsArray, documentSearch, documentSortField, documentSortDirection]);
        
  // Document pagination
  const documentTotalPages = Math.ceil(filteredAndSortedDocuments.length / documentEntriesPerPage);
  const documentStartIndex = (documentCurrentPage - 1) * documentEntriesPerPage;
  const documentEndIndex = documentStartIndex + documentEntriesPerPage;
  const paginatedDocuments = filteredAndSortedDocuments.slice(documentStartIndex, documentEndIndex);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Support Network handlers
  const handleAddSupportNetwork = () => {
    setSupportNetworkForm({
      salutation: "",
      firstName: "",
      middleName: "",
      lastName: "",
      displayName: "",
      maritalStatus: "",
      dateOfBirth: "",
      gender: "",
      language: "",
      address: "",
      clientType: "",
      ndisNumber: "",
      primaryPhone: "",
      email: "",
      secondaryPhone: "",
      nationality: "",
      religion: "",
      image: null,
    });
    setSupportNetworkImagePreview(null);
    setIsAddSupportNetworkOpen(true);
  };

  const handleSupportNetworkImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSupportNetworkImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSupportNetworkForm({ ...supportNetworkForm, image: file });
    }
  };

  const handleViewSupportNetwork = (supportNetwork: any) => {
    setSelectedSupportNetwork(supportNetwork);
      toast({
      title: "View Support Network",
      description: `Viewing details for ${supportNetwork.supportNetworkName} support network`,
    });
  };

  const handleUpdateSupportNetwork = (supportNetwork: any) => {
    setSelectedSupportNetwork(supportNetwork);
    // Map existing Support Network data to new form structure
    // Split clientName to get firstName and lastName if possible
    const nameParts = supportNetwork.clientName?.split(' ') || [];
    setSupportNetworkForm({
      salutation: "",
      firstName: nameParts[0] || "",
      middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : "",
      lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0] || "",
      displayName: supportNetwork.clientName || "",
      maritalStatus: "",
      dateOfBirth: "",
      gender: "",
      language: "",
      address: "",
      clientType: "",
      ndisNumber: "",
      primaryPhone: supportNetwork.mobile || "",
      email: supportNetwork.email || "",
      secondaryPhone: "",
      nationality: "",
      religion: "",
      image: null,
    });
    setSupportNetworkImagePreview(null);
    setIsUpdateSupportNetworkOpen(true);
  };

  const handleDeleteSupportNetwork = (supportNetwork: any) => {
    setSupportNetworks(supportNetworks.filter(sn => sn.id !== supportNetwork.id));
      toast({
      title: "Support Network Deleted",
      description: `${supportNetwork.supportNetworkName} support network has been removed`,
    });
  };

  const handleSupportNetworkStatusClick = (supportNetwork: any) => {
    setSelectedSupportNetworkForStatus(supportNetwork);
    setShowSupportNetworkStatusModal(true);
  };

  const handleSupportNetworkStatusChange = () => {
    if (!selectedSupportNetworkForStatus) return;

    // Toggle status
    const newStatus = selectedSupportNetworkForStatus.status === "Active" ? "Inactive" : "Active";
    setSupportNetworks(supportNetworks.map(sn =>
      sn.id === selectedSupportNetworkForStatus.id
        ? { ...sn, status: newStatus }
        : sn
    ));

    setShowSupportNetworkStatusModal(false);
    setSelectedSupportNetworkForStatus(null);
  };

  const handleSupportNetworkSort = (field: SupportNetworkSortField) => {
    if (supportNetworkSortField === field) {
      if (supportNetworkSortDirection === 'asc') {
        setSupportNetworkSortDirection('desc');
      } else if (supportNetworkSortDirection === 'desc') {
        setSupportNetworkSortField(null);
        setSupportNetworkSortDirection(null);
      }
    } else {
      setSupportNetworkSortField(field);
      setSupportNetworkSortDirection('asc');
    }
  };

  const getSupportNetworkSortIcon = (field: SupportNetworkSortField) => {
    if (supportNetworkSortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return supportNetworkSortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const handleSupportNetworkSubmit = () => {
    // Validation for required fields
    if (!supportNetworkForm.salutation || !supportNetworkForm.firstName || !supportNetworkForm.lastName ||
      !supportNetworkForm.displayName || !supportNetworkForm.maritalStatus || !supportNetworkForm.dateOfBirth ||
      !supportNetworkForm.gender || !supportNetworkForm.language || !supportNetworkForm.address || !supportNetworkForm.primaryPhone) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation (if provided)
    if (supportNetworkForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(supportNetworkForm.email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }
    }

    if (isUpdateSupportNetworkOpen && selectedSupportNetwork) {
      // Update existing Support Network - map new form fields to existing structure
      const updatedSupportNetwork = {
        ...selectedSupportNetwork,
        clientName: supportNetworkForm.displayName || selectedSupportNetwork.clientName,
        supportNetworkName: supportNetworkForm.lastName || selectedSupportNetwork.supportNetworkName,
        supportNetworkCode: selectedSupportNetwork.supportNetworkCode, // Keep existing code
        email: supportNetworkForm.email || selectedSupportNetwork.email,
        mobile: supportNetworkForm.primaryPhone || selectedSupportNetwork.mobile,
        status: selectedSupportNetwork.status,
      };
      setSupportNetworks(supportNetworks.map(f =>
        f.id === selectedSupportNetwork.id
          ? updatedSupportNetwork
          : f
      ));
    } else {
      // Add new support network - create support network code from last name
      const supportNetworkCode = `SN-${(supportNetworkForm.lastName || 'XXX').toUpperCase().substring(0, 3)}-${Date.now().toString().slice(-3)}`;
      const newSupportNetwork = {
        id: `SN-${Date.now()}`,
        clientName: supportNetworkForm.displayName,
        supportNetworkName: supportNetworkForm.lastName,
        supportNetworkCode: supportNetworkCode,
        email: supportNetworkForm.email || "",
        mobile: supportNetworkForm.primaryPhone,
        status: "Active",
      };
      setSupportNetworks([...supportNetworks, newSupportNetwork]);
    }

    // Reset form
    setSupportNetworkForm({
      salutation: "",
      firstName: "",
      middleName: "",
      lastName: "",
      displayName: "",
      maritalStatus: "",
      dateOfBirth: "",
      gender: "",
      language: "",
      address: "",
      clientType: "",
      ndisNumber: "",
      primaryPhone: "",
      email: "",
      secondaryPhone: "",
      nationality: "",
      religion: "",
      image: null,
    });
    setSupportNetworkImagePreview(null);
    setIsAddSupportNetworkOpen(false);
    setIsUpdateSupportNetworkOpen(false);
    setSelectedSupportNetwork(null);
  };

  // Filter and sort Support Networks
  const filteredAndSortedSupportNetworks = useMemo(() => {
    let result = [...supportNetworks];

    // Apply search filter
    if (supportNetworkSearch) {
      const search = supportNetworkSearch.toLowerCase();
      result = result.filter(supportNetwork =>
        (supportNetwork.clientName || '').toLowerCase().includes(search) ||
        (supportNetwork.supportNetworkName || '').toLowerCase().includes(search) ||
        (supportNetwork.supportNetworkCode || '').toLowerCase().includes(search) ||
        (supportNetwork.email || '').toLowerCase().includes(search) ||
        (supportNetwork.mobile || '').includes(search)
      );
    }

    // Apply sorting
    if (supportNetworkSortField && supportNetworkSortDirection) {
      result.sort((a, b) => {
        let aValue: string;
        let bValue: string;

        switch (supportNetworkSortField) {
          case 'clientName':
            aValue = a.clientName || '';
            bValue = b.clientName || '';
            break;
          case 'supportNetworkName':
            aValue = a.supportNetworkName || '';
            bValue = b.supportNetworkName || '';
            break;
          case 'supportNetworkCode':
            aValue = a.supportNetworkCode || '';
            bValue = b.supportNetworkCode || '';
            break;
          case 'email':
            aValue = a.email || '';
            bValue = b.email || '';
            break;
          case 'mobile':
            aValue = a.mobile || '';
            bValue = b.mobile || '';
            break;
          case 'status':
            aValue = a.status || '';
            bValue = b.status || '';
            break;
          default:
            return 0;
        }

        return supportNetworkSortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }

    return result;
  }, [supportNetworks, supportNetworkSearch, supportNetworkSortField, supportNetworkSortDirection]);

  // Support Network pagination
  const supportNetworkTotalPages = Math.ceil(filteredAndSortedSupportNetworks.length / supportNetworkEntriesPerPage);
  const supportNetworkStartIndex = (supportNetworkCurrentPage - 1) * supportNetworkEntriesPerPage;
  const supportNetworkEndIndex = supportNetworkStartIndex + supportNetworkEntriesPerPage;
  const paginatedSupportNetworks = filteredAndSortedSupportNetworks.slice(supportNetworkStartIndex, supportNetworkEndIndex);

  // Show loading state
  if (isLoadingClient || isFetching) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Client Profile</h1>
        </div>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading client details...</p>
        </div>
      </div>
    );
  }

  // Show not found if client doesn't exist after loading
  if (!client) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Client Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => navigate("/clients")} className="cursor-pointer">
                    Clients
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>View Client</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-sm text-muted-foreground">Client ID: {client.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* <SwitchIcon className="h-4 w-4 text-muted-foreground" /> */}
            <Label htmlFor="status-toggle" className="text-sm font-medium">
              {isStatusActive ? "Active" : "Inactive"}
            </Label>
            <Switch
              id="status-toggle"
              checked={isStatusActive}
              onCheckedChange={handleStatusToggle}
              disabled={isTogglingStatus}
            />
          </div>
          <Button
            variant={isArchived ? "outline" : "destructive"}
            onClick={handleArchiveClick}
            disabled={isArchivingClient || isUnarchivingClient}
          >
            {isArchivingClient || isUnarchivingClient ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                {isArchived ? "Unarchive" : "Archive"}
              </>
            )}
                </Button>
          <Button variant="outline" onClick={handleManage}>
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Button>
          <Button variant="outline" onClick={handleNotes}>
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </Button>
        </div>
      </div>

      {/* Client Detail Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Details</CardTitle>
            <Button onClick={handleUpdate} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Update
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
          <div className="flex gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-blue-400 flex items-center justify-center overflow-hidden">
                {client.profileImg ? (
                  <img src={client.profileImg} alt={client.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
            </div>

            {/* Details Grid - 3 Columns */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
              {/* Column 1 */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">Name</Label>
                  <p className="text-sm">{client.name || "-"}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">Primary Phone Number</Label>
                  <p className="text-sm">{client.primaryPhone || "-"}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">Language</Label>
                  <p className="text-sm">{client.language || "-"}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">Nationality</Label>
                  <p className="text-sm">{client.nationality || "-"}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">Client Type</Label>
                  <p className="text-sm">{client.clientType || "-"}</p>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">Gender</Label>
                  <p className="text-sm">{client.gender || "-"}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">Secondary Phone Number</Label>
                  <p className="text-sm">{client.secondaryPhone || "-"}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">Marital Status</Label>
                  <p className="text-sm">{client.maritalStatus || "-"}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">Address</Label>
                  <p className="text-sm">{client.address || "-"}</p>
                </div>
              </div>

              {/* Column 3 */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">Date of Birth</Label>
                  <p className="text-sm">{client.dateOfBirth || "-"}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">Email</Label>
                  <p className="text-sm">{client.email || "-"}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">Religion</Label>
                  <p className="text-sm">{client.religion || "-"}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-semibold">NDIS Number</Label>
                  <p className="text-sm">{client.ndisNumber || "-"}</p>
                </div>
              </div>
            </div>
          </div>
                </CardContent>
              </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Documents</CardTitle>
            <div className="flex items-center gap-2">
              {/* <Button variant="outline" onClick={handleViewAllDocuments}>
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button> */}
              <Button onClick={handleAddDocument}>
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex-1 sm:flex-initial sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={documentSearch}
                  onChange={(e) => {
                    setDocumentSearch(e.target.value);
                    setDocumentCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={documentEntriesPerPage.toString()}
                  onValueChange={(value) => {
                    setDocumentEntriesPerPage(Number(value));
                    setDocumentCurrentPage(1);
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

            {/* Documents Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        onClick={() => handleDocumentSort('name')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Name
                        {getDocumentSortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleDocumentSort('category')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Category
                        {getDocumentSortIcon('category')}
                      </button>
                    </TableHead>
                    <TableHead>Staff Visibility</TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleDocumentSort('expireAt')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Expire At
                        {getDocumentSortIcon('expireAt')}
                      </button>
                    </TableHead>
                    <TableHead>No Expiration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No documents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {doc.staffVisibility ? (
                            <Badge variant="secondary" className="gap-1">
                              <Eye className="h-3 w-3" />
                              Visible
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <EyeOff className="h-3 w-3" />
                              Hidden
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(doc.expireAt)}</TableCell>
                        <TableCell>
                          {doc.noExpiration ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditDocument(doc)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteDocumentClick(parseInt(doc.id))}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
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
                Showing {documentStartIndex + 1} to {Math.min(documentEndIndex, filteredAndSortedDocuments.length)} of {filteredAndSortedDocuments.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDocumentCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={documentCurrentPage === 1 || documentTotalPages === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: documentTotalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === documentTotalPages ||
                      (page >= documentCurrentPage - 1 && page <= documentCurrentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={documentCurrentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDocumentCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === documentCurrentPage - 2 || page === documentCurrentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDocumentCurrentPage(prev => Math.min(documentTotalPages, prev + 1))}
                  disabled={documentCurrentPage === documentTotalPages || documentTotalPages === 0}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Document Sheet */}
      <Sheet open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Document</SheetTitle>
            <SheetDescription>
              Upload a new document for this client. Fill in all required fields.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doc-file">File <span className="text-destructive">*</span></Label>
              <Input
                id="doc-file"
                type="file"
                onChange={handleDocumentFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-muted-foreground">
                Supported: PDF, DOC, DOCX, JPG, PNG (max 10MB)
              </p>
              {documentForm.file && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{documentForm.file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-auto"
                    onClick={() => setDocumentForm({ ...documentForm, file: null, name: "" })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-name">Document Name <span className="text-destructive">*</span></Label>
              <Input
                id="doc-name"
                value={documentForm.name}
                onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })}
                placeholder="Enter document name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-category">Category <span className="text-destructive">*</span></Label>
              <Select
                value={documentForm.category_id?.toString() || ""}
                onValueChange={(value) => setDocumentForm({ ...documentForm, category_id: parseInt(value) })}
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="doc-staff-visibility">Staff Visibility</Label>
                <Switch
                  id="doc-staff-visibility"
                  checked={documentForm.staffVisibility}
                  onCheckedChange={(checked) => setDocumentForm({ ...documentForm, staffVisibility: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Allow staff members to view this document
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="doc-no-expiration">No Expiration</Label>
                <Switch
                  id="doc-no-expiration"
                  checked={documentForm.noExpiration}
                  onCheckedChange={(checked) => setDocumentForm({ ...documentForm, noExpiration: checked, expireAt: checked ? "" : documentForm.expireAt })}
                />
              </div>
            </div>

            {!documentForm.noExpiration && (
              <div className="space-y-2">
                <Label htmlFor="doc-expire-at">Expire At <span className="text-destructive">*</span></Label>
                <Input
                  id="doc-expire-at"
                  type="date"
                  value={documentForm.expireAt}
                  onChange={(e) => setDocumentForm({ ...documentForm, expireAt: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="doc-notes">Notes</Label>
              <Textarea
                id="doc-notes"
                value={documentForm.notes}
                onChange={(e) => setDocumentForm({ ...documentForm, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsAddDocumentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDocumentSubmit} disabled={isCreatingDocument}>
              {isCreatingDocument ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Update Document Sheet */}
      <Sheet open={isUpdateDocumentOpen} onOpenChange={setIsUpdateDocumentOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Document</SheetTitle>
            <SheetDescription>
              Update document details. Modify the fields below.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update-doc-category">Category <span className="text-destructive">*</span></Label>
              <Select
                value={documentForm.category_id?.toString() || ""}
                onValueChange={(value) => setDocumentForm({ ...documentForm, category_id: parseInt(value) })}
              >
                <SelectTrigger id="update-doc-category">
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="update-doc-staff-visibility">Staff Visibility</Label>
                <Switch
                  id="update-doc-staff-visibility"
                  checked={documentForm.staffVisibility}
                  onCheckedChange={(checked) => setDocumentForm({ ...documentForm, staffVisibility: checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Allow staff members to view this document
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="update-doc-no-expiration">No Expiration</Label>
                <Switch
                  id="update-doc-no-expiration"
                  checked={documentForm.noExpiration}
                  onCheckedChange={(checked) => setDocumentForm({ ...documentForm, noExpiration: checked, expireAt: checked ? "" : documentForm.expireAt })}
                />
              </div>
            </div>

            {!documentForm.noExpiration && (
              <div className="space-y-2">
                <Label htmlFor="update-doc-expire-at">Expire At <span className="text-destructive">*</span></Label>
                <Input
                  id="update-doc-expire-at"
                  type="date"
                  value={documentForm.expireAt}
                  onChange={(e) => setDocumentForm({ ...documentForm, expireAt: e.target.value })}
                />
              </div>
            )}
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsUpdateDocumentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDocumentSubmit} disabled={isUpdatingDocument}>
              {isUpdatingDocument ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Document"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Document Confirmation Dialog */}
      <Dialog open={isDeleteDocumentDialogOpen} onOpenChange={setIsDeleteDocumentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this document? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDocumentDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteDocument} disabled={isDeletingDocument}>
              {isDeletingDocument ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />

      {/* Support Network List Section */}
            <Card>
              <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Support Network List</CardTitle>
            <Button onClick={handleAddSupportNetwork}>
              <Plus className="h-4 w-4 mr-2" />
              Add Support Network
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex-1 sm:flex-initial sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search support network..."
                  value={supportNetworkSearch}
                  onChange={(e) => {
                    setSupportNetworkSearch(e.target.value);
                    setSupportNetworkCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select
                  value={supportNetworkEntriesPerPage.toString()}
                  onValueChange={(value) => {
                    setSupportNetworkEntriesPerPage(Number(value));
                    setSupportNetworkCurrentPage(1);
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

            {/* Support Network Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">
                      Serial No
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSupportNetworkSort('clientName')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Client Name
                        {getSupportNetworkSortIcon('clientName')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSupportNetworkSort('supportNetworkName')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Support Network Name
                        {getSupportNetworkSortIcon('supportNetworkName')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSupportNetworkSort('supportNetworkCode')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Support Network Code
                        {getSupportNetworkSortIcon('supportNetworkCode')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSupportNetworkSort('email')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Email
                        {getSupportNetworkSortIcon('email')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSupportNetworkSort('mobile')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Mobile
                        {getSupportNetworkSortIcon('mobile')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSupportNetworkSort('status')}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Status
                        {getSupportNetworkSortIcon('status')}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSupportNetworks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No support network found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSupportNetworks.map((supportNetwork, index) => (
                      <TableRow key={supportNetwork.id}>
                        <TableCell className="font-medium">
                          {supportNetworkStartIndex + index + 1}
                        </TableCell>
                        <TableCell>{supportNetwork.clientName}</TableCell>
                        <TableCell>{supportNetwork.supportNetworkName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{supportNetwork.supportNetworkCode}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{supportNetwork.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{supportNetwork.mobile}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={supportNetwork.status === "Active" ? "secondary" : "outline"}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleSupportNetworkStatusClick(supportNetwork)}
                          >
                            {supportNetwork.status}
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
                              <DropdownMenuItem onClick={() => handleViewSupportNetwork(supportNetwork)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateSupportNetwork(supportNetwork)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Update
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteSupportNetwork(supportNetwork)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
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
                Showing {supportNetworkStartIndex + 1} to {Math.min(supportNetworkEndIndex, filteredAndSortedSupportNetworks.length)} of {filteredAndSortedSupportNetworks.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSupportNetworkCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={supportNetworkCurrentPage === 1 || supportNetworkTotalPages === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: supportNetworkTotalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === supportNetworkTotalPages ||
                      (page >= supportNetworkCurrentPage - 1 && page <= supportNetworkCurrentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={supportNetworkCurrentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSupportNetworkCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === supportNetworkCurrentPage - 2 || page === supportNetworkCurrentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSupportNetworkCurrentPage(prev => Math.min(supportNetworkTotalPages, prev + 1))}
                  disabled={supportNetworkCurrentPage === supportNetworkTotalPages || supportNetworkTotalPages === 0}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Support Network Sheet */}
      <Sheet open={isAddSupportNetworkOpen} onOpenChange={setIsAddSupportNetworkOpen}>
        <SheetContent className="sm:max-w-[800px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Support Network</SheetTitle>
            <SheetDescription>
              Add a new support network member for this client. Fill in all required fields marked with *.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="support-network-salutation">Salutation <span className="text-destructive">*</span></Label>
                  <Select
                    value={supportNetworkForm.salutation}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, salutation: value })}
                  >
                    <SelectTrigger id="support-network-salutation">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                      <SelectItem value="Ms">Ms</SelectItem>
                      <SelectItem value="Miss">Miss</SelectItem>
                      <SelectItem value="Dr">Dr</SelectItem>
                      <SelectItem value="Prof">Prof</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-first-name">First Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="support-network-first-name"
                    value={supportNetworkForm.firstName}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, firstName: e.target.value })}
                    placeholder="First Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-middle-name">Middle Name</Label>
                  <Input
                    id="support-network-middle-name"
                    value={supportNetworkForm.middleName}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, middleName: e.target.value })}
                    placeholder="Middle Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-last-name">Last Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="support-network-last-name"
                    value={supportNetworkForm.lastName}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-display-name">Display Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="support-network-display-name"
                    value={supportNetworkForm.displayName}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, displayName: e.target.value })}
                    placeholder="Display Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-marital-status">Marital Status <span className="text-destructive">*</span></Label>
                  <Select
                    value={supportNetworkForm.maritalStatus}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, maritalStatus: value })}
                  >
                    <SelectTrigger id="support-network-marital-status">
                      <SelectValue placeholder="Select Marital Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-dob">Date of Birth <span className="text-destructive">*</span></Label>
                  <Input
                    id="support-network-dob"
                    type="date"
                    value={supportNetworkForm.dateOfBirth}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, dateOfBirth: e.target.value })}
                    placeholder="Date of Birth"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-gender">Gender <span className="text-destructive">*</span></Label>
                  <Select
                    value={supportNetworkForm.gender}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, gender: value })}
                  >
                    <SelectTrigger id="support-network-gender">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-language">Language <span className="text-destructive">*</span></Label>
                  <Select
                    value={supportNetworkForm.language}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, language: value })}
                  >
                    <SelectTrigger id="support-network-language">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="Mandarin">Mandarin</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-address">Address <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="support-network-address"
                    value={supportNetworkForm.address}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, address: e.target.value })}
                    placeholder="Address"
                    rows={3}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="support-network-client-type">Client Type</Label>
                  <Select
                    value={supportNetworkForm.clientType}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, clientType: value })}
                  >
                    <SelectTrigger id="support-network-client-type">
                      <SelectValue placeholder="Select Client Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Self-Managed">Self-Managed</SelectItem>
                      <SelectItem value="Plan Managed">Plan Managed</SelectItem>
                      <SelectItem value="NDIA Managed">NDIA Managed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-ndis">NDIS Number</Label>
                  <Input
                    id="support-network-ndis"
                    value={supportNetworkForm.ndisNumber}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, ndisNumber: e.target.value })}
                    placeholder="NDIS Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-primary-phone">Primary Phone Number <span className="text-destructive">*</span></Label>
                  <Input
                    id="support-network-primary-phone"
                    value={supportNetworkForm.primaryPhone}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, primaryPhone: e.target.value })}
                    placeholder="Primary Phone Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-email">Email</Label>
                  <Input
                    id="support-network-email"
                    type="email"
                    value={supportNetworkForm.email}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, email: e.target.value })}
                    placeholder="Email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-secondary-phone">Secondary Phone Number</Label>
                  <Input
                    id="support-network-secondary-phone"
                    value={supportNetworkForm.secondaryPhone}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, secondaryPhone: e.target.value })}
                    placeholder="Secondary Phone Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-nationality">Nationality</Label>
                  <Select
                    value={supportNetworkForm.nationality}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, nationality: value })}
                  >
                    <SelectTrigger id="support-network-nationality">
                      <SelectValue placeholder="Select Nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Australian">Australian</SelectItem>
                      <SelectItem value="British">British</SelectItem>
                      <SelectItem value="American">American</SelectItem>
                      <SelectItem value="Canadian">Canadian</SelectItem>
                      <SelectItem value="New Zealand">New Zealand</SelectItem>
                      <SelectItem value="Indian">Indian</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-network-religion">Religion</Label>
                  <Select
                    value={supportNetworkForm.religion}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, religion: value })}
                  >
                    <SelectTrigger id="support-network-religion">
                      <SelectValue placeholder="Select Religion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Christian">Christian</SelectItem>
                      <SelectItem value="Catholic">Catholic</SelectItem>
                      <SelectItem value="Muslim">Muslim</SelectItem>
                      <SelectItem value="Hindu">Hindu</SelectItem>
                      <SelectItem value="Buddhist">Buddhist</SelectItem>
                      <SelectItem value="Jewish">Jewish</SelectItem>
                      <SelectItem value="Sikh">Sikh</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="support-network-image">Upload Image</Label>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="support-network-image"
                      type="file"
                      accept="image/*"
                      onChange={handleSupportNetworkImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      {supportNetworkForm.image ? supportNetworkForm.image.name : "No file chosen"}
                    </p>
                    {supportNetworkImagePreview && (
                      <div className="mt-2">
                        <img
                          src={supportNetworkImagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-md border"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setSupportNetworkImagePreview(null);
                            setSupportNetworkForm({ ...supportNetworkForm, image: null });
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => {
              setIsAddSupportNetworkOpen(false);
              setSupportNetworkImagePreview(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSupportNetworkSubmit}>
              Add Support Network
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Update Support Network Sheet */}
      <Sheet open={isUpdateSupportNetworkOpen} onOpenChange={setIsUpdateSupportNetworkOpen}>
        <SheetContent className="sm:max-w-[800px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Support Network</SheetTitle>
            <SheetTitle>Update Support Network</SheetTitle>
            <SheetDescription>
              Update support network information. Fill in all required fields marked with *.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="update-support-network-salutation">Salutation <span className="text-destructive">*</span></Label>
                  <Select
                    value={supportNetworkForm.salutation}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, salutation: value })}
                  >
                    <SelectTrigger id="update-support-network-salutation">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                      <SelectItem value="Ms">Ms</SelectItem>
                      <SelectItem value="Miss">Miss</SelectItem>
                      <SelectItem value="Dr">Dr</SelectItem>
                      <SelectItem value="Prof">Prof</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-first-name">First Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="update-support-network-first-name"
                    value={supportNetworkForm.firstName}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, firstName: e.target.value })}
                    placeholder="First Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-middle-name">Middle Name</Label>
                  <Input
                    id="update-support-network-middle-name"
                    value={supportNetworkForm.middleName}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, middleName: e.target.value })}
                    placeholder="Middle Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-last-name">Last Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="update-support-network-last-name"
                    value={supportNetworkForm.lastName}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-display-name">Display Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="update-support-network-display-name"
                    value={supportNetworkForm.displayName}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, displayName: e.target.value })}
                    placeholder="Display Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-marital-status">Marital Status <span className="text-destructive">*</span></Label>
                  <Select
                    value={supportNetworkForm.maritalStatus}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, maritalStatus: value })}
                  >
                    <SelectTrigger id="update-support-network-marital-status">
                      <SelectValue placeholder="Select Marital Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-dob">Date of Birth <span className="text-destructive">*</span></Label>
                  <Input
                    id="update-support-network-dob"
                    type="date"
                    value={supportNetworkForm.dateOfBirth}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, dateOfBirth: e.target.value })}
                    placeholder="Date of Birth"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-gender">Gender <span className="text-destructive">*</span></Label>
                  <Select
                    value={supportNetworkForm.gender}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, gender: value })}
                  >
                    <SelectTrigger id="update-support-network-gender">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-language">Language <span className="text-destructive">*</span></Label>
                  <Select
                    value={supportNetworkForm.language}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, language: value })}
                  >
                    <SelectTrigger id="update-support-network-language">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="Mandarin">Mandarin</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-address">Address <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="update-support-network-address"
                    value={supportNetworkForm.address}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, address: e.target.value })}
                    placeholder="Address"
                    rows={3}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="update-support-network-client-type">Client Type</Label>
                  <Select
                    value={supportNetworkForm.clientType}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, clientType: value })}
                  >
                    <SelectTrigger id="update-support-network-client-type">
                      <SelectValue placeholder="Select Client Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Self-Managed">Self-Managed</SelectItem>
                      <SelectItem value="Plan Managed">Plan Managed</SelectItem>
                      <SelectItem value="NDIA Managed">NDIA Managed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-ndis">NDIS Number</Label>
                  <Input
                    id="update-support-network-ndis"
                    value={supportNetworkForm.ndisNumber}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, ndisNumber: e.target.value })}
                    placeholder="NDIS Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-primary-phone">Primary Phone Number <span className="text-destructive">*</span></Label>
                  <Input
                    id="update-support-network-primary-phone"
                    value={supportNetworkForm.primaryPhone}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, primaryPhone: e.target.value })}
                    placeholder="Primary Phone Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-email">Email</Label>
                  <Input
                    id="update-support-network-email"
                    type="email"
                    value={supportNetworkForm.email}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, email: e.target.value })}
                    placeholder="Email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-secondary-phone">Secondary Phone Number</Label>
                  <Input
                    id="update-support-network-secondary-phone"
                    value={supportNetworkForm.secondaryPhone}
                    onChange={(e) => setSupportNetworkForm({ ...supportNetworkForm, secondaryPhone: e.target.value })}
                    placeholder="Secondary Phone Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-nationality">Nationality</Label>
                  <Select
                    value={supportNetworkForm.nationality}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, nationality: value })}
                  >
                    <SelectTrigger id="update-support-network-nationality">
                      <SelectValue placeholder="Select Nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Australian">Australian</SelectItem>
                      <SelectItem value="British">British</SelectItem>
                      <SelectItem value="American">American</SelectItem>
                      <SelectItem value="Canadian">Canadian</SelectItem>
                      <SelectItem value="New Zealand">New Zealand</SelectItem>
                      <SelectItem value="Indian">Indian</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-support-network-religion">Religion</Label>
                  <Select
                    value={supportNetworkForm.religion}
                    onValueChange={(value) => setSupportNetworkForm({ ...supportNetworkForm, religion: value })}
                  >
                    <SelectTrigger id="update-support-network-religion">
                      <SelectValue placeholder="Select Religion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Christian">Christian</SelectItem>
                      <SelectItem value="Catholic">Catholic</SelectItem>
                      <SelectItem value="Muslim">Muslim</SelectItem>
                      <SelectItem value="Hindu">Hindu</SelectItem>
                      <SelectItem value="Buddhist">Buddhist</SelectItem>
                      <SelectItem value="Jewish">Jewish</SelectItem>
                      <SelectItem value="Sikh">Sikh</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="update-support-network-image">Upload Image</Label>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="update-support-network-image"
                      type="file"
                      accept="image/*"
                      onChange={handleSupportNetworkImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      {supportNetworkForm.image ? supportNetworkForm.image.name : "No file chosen"}
                    </p>
                    {supportNetworkImagePreview && (
                      <div className="mt-2">
                        <img
                          src={supportNetworkImagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-md border"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setSupportNetworkImagePreview(null);
                            setSupportNetworkForm({ ...supportNetworkForm, image: null });
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => {
              setIsUpdateSupportNetworkOpen(false);
              setSupportNetworkImagePreview(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSupportNetworkSubmit}>
              Update Support Network
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Support Network Status Change Modal */}
      <Dialog open={showSupportNetworkStatusModal} onOpenChange={setShowSupportNetworkStatusModal}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="rounded-full border-4 border-orange-200 p-3">
              <svg
                className="w-12 h-12 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Are you sure?</h3>
              <p className="text-gray-600 mt-2">
                Do you want to change the status?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSupportNetworkStatusChange}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6"
              >
                Yes, change it!
              </Button>
              <Button
                onClick={() => {
                  setShowSupportNetworkStatusModal(false);
                  setSelectedSupportNetworkForStatus(null);
                }}
                variant="destructive"
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Client Goals Section */}
      <ClientGoals clientName={client?.name} clientId={parseInt(clientId || "0")} />

      {/* Funds Section */}
      <ClientFunds clientName={client?.name} />

      {/* Invoices Section */}
      <ClientInvoices clientName={client?.name} />

      {/* Additional Contacts Section */}
      <ClientContacts clientName={client?.name} />

      {/* Public Information Section */}
      <ClientPublicInformation clientName={client?.name} />

      {/* Additional Information Section */}
      <ClientAdditionalInformation
        privateInfo={privateInfo}
        reviewDate={reviewDate}
        onUpdate={(updatedPrivateInfo, updatedReviewDate) => {
          setPrivateInfo(updatedPrivateInfo);
          setReviewDate(updatedReviewDate);
        }}
      />

      {/* Status Toggle Confirmation Modal */}
      <Dialog open={showStatusToggleConfirmation} onOpenChange={setShowStatusToggleConfirmation}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="rounded-full border-4 border-orange-200 p-3">
              <svg
                className="w-12 h-12 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Are you sure?</h3>
              <p className="text-gray-600 mt-2">
                Do you want to change the status?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleConfirmStatusToggle}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                disabled={isTogglingStatus}
              >
                {isTogglingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Yes, change it!"
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowStatusToggleConfirmation(false);
                }}
                variant="destructive"
                className="px-6"
                disabled={isTogglingStatus}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Modal */}
      <ArchiveConfirmationModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchiveConfirm}
        isArchived={isArchived}
        entityType="client"
      />

      {/* Update Sheet (Slide-over Drawer) */}
      <Sheet open={isUpdateSheetOpen} onOpenChange={setIsUpdateSheetOpen}>
        <SheetContent className="sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Update Client Details</SheetTitle>
            <SheetDescription>
              Update the client information below. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
              <div className="space-y-2">
              <Label htmlFor="update-salutation">Salutation</Label>
                <Select
                value={formData.salutation}
                onValueChange={(value) => setFormData({ ...formData, salutation: value })}
                >
                <SelectTrigger id="update-salutation">
                  <SelectValue placeholder="Select salutation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mr">Mr</SelectItem>
                  <SelectItem value="Mrs">Mrs</SelectItem>
                  <SelectItem value="Ms">Ms</SelectItem>
                  <SelectItem value="Dr">Dr</SelectItem>
                  <SelectItem value="Prof">Prof</SelectItem>
                </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
              <Label htmlFor="update-first-name">First Name <span className="text-destructive">*</span></Label>
                <Input
                id="update-first-name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
              <Label htmlFor="update-last-name">Last Name <span className="text-destructive">*</span></Label>
                <Input
                id="update-last-name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
              <Label htmlFor="update-display-name">Display Name</Label>
                <Input
                id="update-display-name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
              <Label htmlFor="update-gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger id="update-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-dob">Date of Birth</Label>
              <Input
                id="update-dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-primary-phone">Primary Phone Number</Label>
              <Input
                id="update-primary-phone"
                value={formData.primaryPhone}
                onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-secondary-phone">Secondary Phone Number</Label>
              <Input
                id="update-secondary-phone"
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-email">Email</Label>
              <Input
                id="update-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger id="update-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id.toString()}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
              </div>

            <div className="space-y-2">
              <Label htmlFor="update-marital-status">Marital Status</Label>
              <Select
                value={formData.maritalStatus}
                onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}
              >
                <SelectTrigger id="update-marital-status">
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                  <SelectItem value="Separated">Separated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-religion">Religion</Label>
              <Input
                id="update-religion"
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-nationality">Nationality</Label>
              <Input
                id="update-nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-address">Address</Label>
              <Input
                id="update-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-ndis">NDIS Number</Label>
              <Input
                id="update-ndis"
                value={formData.ndisNumber}
                onChange={(e) => setFormData({ ...formData, ndisNumber: e.target.value })}
              />
            </div>

              <div className="space-y-2">
              <Label htmlFor="update-client-type">Client Type <span className="text-destructive">*</span></Label>
                <Select
                value={formData.clientType}
                onValueChange={(value) => setFormData({ ...formData, clientType: value })}
              >
                <SelectTrigger id="update-client-type">
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  {clientTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
              </div>
              </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsUpdateSheetOpen(false)} disabled={isUpdatingClient}>
              Cancel
            </Button>
            <Button onClick={handleSaveUpdate} disabled={isUpdatingClient}>
              {isUpdatingClient ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ClientProfile;
