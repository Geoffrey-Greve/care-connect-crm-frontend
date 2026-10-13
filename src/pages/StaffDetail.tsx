import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Settings, FileText, User, Phone, Mail, MapPin, Calendar, Globe, Building2, Briefcase, Users, Archive, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ArchiveConfirmationModal from '@/components/ArchiveConfirmationModal';
import AddStaffForm, { StaffFormData } from '@/components/AddStaffForm';
import StaffSettingsTabs from '@/components/StaffSettingsTabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Mock staff data - in production, this would come from an API
export const mockStaff = [
    {
        id: "STAFF-001",
        fullName: "Harrison",
        email: "h.lyricartifact@outlook.com",
        primaryPhoneNumber: "0499158022",
        secondaryPhoneNumber: "0499158023",
        role: "Carer",
        dateOfBirth: "1990-05-15",
        gender: "Male",
        employmentType: "Full-time",
        spokenLanguages: "English, Spanish",
        skills: "First Aid, CPR, Disability Support",
        address: "123 Main Street, Melbourne VIC 3000",
        salutation: "Mr",
        status: "Active",
        image: null,
    },
    {
        id: "STAFF-002",
        fullName: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        primaryPhoneNumber: "+61 3 9123 4567",
        secondaryPhoneNumber: "+61 400 123 456",
        role: "Nurse",
        dateOfBirth: "1985-03-20",
        gender: "Female",
        employmentType: "Part-time",
        spokenLanguages: "English, French",
        skills: "Nursing, Medication Administration",
        address: "456 Oak Avenue, Sydney NSW 2000",
        salutation: "Ms",
        status: "Active",
        image: null,
    },
];

// Mock compliance data
const mockCompliance = [
    {
        id: "COMP-001",
        category: "COVID-19 Compliance",
        expireAt: null,
        lastUpdate: null,
        status: "Not Specified",
    },
    {
        id: "COMP-002",
        category: "COVID-19 Compliance",
        expireAt: null,
        lastUpdate: null,
        status: "Not Specified",
    },
    {
        id: "COMP-003",
        category: "COVID-19 Compliance",
        expireAt: null,
        lastUpdate: null,
        status: "Not Specified",
    },
    {
        id: "COMP-004",
        category: "First Aid Certificate",
        expireAt: null,
        lastUpdate: null,
        status: "Not Specified",
    },
    {
        id: "COMP-005",
        category: "First Aid Certificate",
        expireAt: null,
        lastUpdate: null,
        status: "Not Specified",
    },
    {
        id: "COMP-006",
        category: "First Aid Certificate",
        expireAt: null,
        lastUpdate: null,
        status: "Not Specified",
    },
];

type ComplianceSortField = 'category' | 'expireAt' | 'lastUpdate' | 'status';
type ComplianceSortDirection = 'asc' | 'desc' | null;

const StaffDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [staff, setStaff] = useState<any>(null);
    const [isStatusActive, setIsStatusActive] = useState(true);
    const [isArchived, setIsArchived] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
    const [isKPIMappingModalOpen, setIsKPIMappingModalOpen] = useState(false);
    const [kpiMapping, setKPIMapping] = useState({
        role: "",
        staff: "",
    });
    
    // Compliance states
    const [complianceList] = useState(mockCompliance);
    const [complianceSearch, setComplianceSearch] = useState("");
    const [complianceSortField, setComplianceSortField] = useState<ComplianceSortField | null>(null);
    const [complianceSortDirection, setComplianceSortDirection] = useState<ComplianceSortDirection>(null);
    const [complianceCurrentPage, setComplianceCurrentPage] = useState(1);
    const [complianceEntriesPerPage, setComplianceEntriesPerPage] = useState(10);

    useEffect(() => {
        // In production, fetch from API
        const foundStaff = mockStaff.find(s => s.id === id);
        if (foundStaff) {
            setStaff(foundStaff);
            setIsStatusActive(foundStaff.status === "Active");
            setIsArchived((foundStaff as any).isArchived || false);
        }
    }, [id]);

    const handleStatusToggle = (checked: boolean) => {
        setIsStatusActive(checked);
        // In production, update via API
        if (staff) {
            setStaff({ ...staff, status: checked ? "Active" : "Inactive" });
        }
        toast({
            title: "Status Updated",
            description: `Staff status changed to ${checked ? "Active" : "Inactive"}`,
        });
    };

    const handleArchiveClick = () => {
        setIsArchiveModalOpen(true);
    };

    const handleArchiveConfirm = () => {
        const newArchiveStatus = !isArchived;
        setIsArchived(newArchiveStatus);
        setIsArchiveModalOpen(false);

        // In production, update via API
        if (staff) {
            setStaff({ ...staff, isArchived: newArchiveStatus });
        }

        toast({
            title: newArchiveStatus ? "Staff Archived" : "Staff Unarchived",
            description: newArchiveStatus
                ? "Staff has been archived successfully. You can access it from the Archive menu."
                : "Staff has been unarchived successfully and is now visible in your staff list.",
        });
    };

    const handleUpdateStaff = (data: StaffFormData) => {
        // In production, update via API
        if (staff) {
            setStaff({
                ...staff,
                ...data,
            });
        }
        toast({
            title: "Staff Updated",
            description: "Staff details have been updated successfully.",
        });
    };

    // Compliance handlers
    const handleComplianceSort = (field: ComplianceSortField) => {
        if (complianceSortField === field) {
            if (complianceSortDirection === 'asc') {
                setComplianceSortDirection('desc');
            } else if (complianceSortDirection === 'desc') {
                setComplianceSortField(null);
                setComplianceSortDirection(null);
            }
        } else {
            setComplianceSortField(field);
            setComplianceSortDirection('asc');
        }
    };

    const getComplianceSortIcon = (field: ComplianceSortField) => {
        if (complianceSortField !== field) {
            return <ChevronUp className="h-4 w-4 opacity-30" />;
        }
        return complianceSortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
        ) : (
            <ChevronDown className="h-4 w-4" />
        );
    };

    // Filter and sort compliance
    const filteredAndSortedCompliance = useMemo(() => {
        let result = [...complianceList];

        // Apply search filter
        if (complianceSearch) {
            const search = complianceSearch.toLowerCase();
            result = result.filter(item =>
                item.category.toLowerCase().includes(search) ||
                item.status.toLowerCase().includes(search)
            );
        }

        // Apply sorting
        if (complianceSortField && complianceSortDirection) {
            result.sort((a, b) => {
                let aValue: string | null;
                let bValue: string | null;

                switch (complianceSortField) {
                    case 'category':
                        aValue = a.category;
                        bValue = b.category;
                        break;
                    case 'expireAt':
                        aValue = a.expireAt;
                        bValue = b.expireAt;
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

                if (aValue === null && bValue === null) return 0;
                if (aValue === null) return 1;
                if (bValue === null) return -1;

                return complianceSortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            });
        }

        return result;
    }, [complianceList, complianceSearch, complianceSortField, complianceSortDirection]);

    // Compliance pagination
    const complianceTotalPages = Math.ceil(filteredAndSortedCompliance.length / complianceEntriesPerPage);
    const complianceStartIndex = (complianceCurrentPage - 1) * complianceEntriesPerPage;
    const complianceEndIndex = complianceStartIndex + complianceEntriesPerPage;
    const paginatedCompliance = filteredAndSortedCompliance.slice(complianceStartIndex, complianceEndIndex);

    const formatComplianceDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleOpenKPIMappingModal = () => {
        setIsKPIMappingModalOpen(true);
    };

    const handleSaveKPIMapping = () => {
        // In production, save via API
        toast({
            title: "KPI Mapping Updated",
            description: "KPI permissions have been updated successfully.",
        });
        setIsKPIMappingModalOpen(false);
    };

    const handleCloseKPIMappingModal = () => {
        setIsKPIMappingModalOpen(false);
    };

    if (!staff) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Staff member not found</p>
                    <Button variant="ghost" size="icon" onClick={() => navigate('/staff-list')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
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
                                <BreadcrumbPage>View Staff</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div>
                        <h1 className="text-3xl font-bold">{staff.fullName}</h1>
                        <p className="text-muted-foreground">Staff Profile</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {/* <span className="text-sm font-medium">Status:</span> */}
                        <Badge variant={isStatusActive ? "secondary" : "destructive"}>
                            {isStatusActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                            checked={isStatusActive}
                            onCheckedChange={handleStatusToggle}
                        />
                    </div>

                    <Button
                        variant={isArchived ? "outline" : "destructive"}
                        onClick={handleArchiveClick}
                    >
                        <Archive className="h-4 w-4 mr-2" />
                        {isArchived ? "Unarchive" : "Archive"}
                    </Button>

                    {/* <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                    </Button>
                    <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Notes
                    </Button> */}
                </div>
            </div>

            {/* Staff Details Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Staff Details</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setIsUpdateFormOpen(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Update
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column - Image */}
                        <div className="flex flex-col items-center md:items-start md:col-span-1">
                            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden border-4 border-background shadow-lg">
                                {staff.image ? (
                                    <img
                                        src={staff.image}
                                        alt={staff.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="h-16 w-16 text-muted-foreground" />
                                )}
                            </div>
                        </div>

                        {/* Right Column - Details */}
                        <div className="space-y-4 md:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                                    </div>
                                    <p className="text-base font-semibold mt-1">{staff.fullName}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-medium text-muted-foreground">Contact</Label>
                                    </div>
                                    <p className="text-base mt-1">{staff.primaryPhoneNumber}</p>
                                    {staff.secondaryPhoneNumber && (
                                        <p className="text-base text-muted-foreground mt-1">{staff.secondaryPhoneNumber}</p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                    </div>
                                    <p className="text-base mt-1">{staff.email}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                                    </div>
                                    <p className="text-base mt-1">{staff.address}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                                    </div>
                                    <p className="text-base mt-1">{staff.gender}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                                    </div>
                                    <p className="text-base mt-1">{staff.role}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                                    </div>
                                    <p className="text-base mt-1">{new Date(staff.dateOfBirth).toLocaleDateString('en-AU', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-medium text-muted-foreground">Employment Type</Label>
                                    </div>
                                    <p className="text-base mt-1">{staff.employmentType}</p>
                                </div>

                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-medium text-muted-foreground">Spoken Languages</Label>
                                    </div>
                                    <p className="text-base mt-1">{staff.spokenLanguages}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Compliance Section */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle>Compliance</CardTitle>
                        <Button variant="link" className="p-0 h-auto" onClick={() => navigate(`/staff/${id}/documents`)}>
                            Manage All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Search and Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Show</span>
                                <Select
                                    value={complianceEntriesPerPage.toString()}
                                    onValueChange={(value) => {
                                        setComplianceEntriesPerPage(Number(value));
                                        setComplianceCurrentPage(1);
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
                                    value={complianceSearch}
                                    onChange={(e) => {
                                        setComplianceSearch(e.target.value);
                                        setComplianceCurrentPage(1);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Compliance Table */}
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <button
                                                onClick={() => handleComplianceSort('category')}
                                                className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                                            >
                                                Category
                                                {getComplianceSortIcon('category')}
                                            </button>
                                        </TableHead>
                                        <TableHead>
                                            <button
                                                onClick={() => handleComplianceSort('expireAt')}
                                                className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                                            >
                                                Expire At
                                                {getComplianceSortIcon('expireAt')}
                                            </button>
                                        </TableHead>
                                        <TableHead>
                                            <button
                                                onClick={() => handleComplianceSort('lastUpdate')}
                                                className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                                            >
                                                Last Update
                                                {getComplianceSortIcon('lastUpdate')}
                                            </button>
                                        </TableHead>
                                        <TableHead>
                                            <button
                                                onClick={() => handleComplianceSort('status')}
                                                className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                                            >
                                                Status
                                                {getComplianceSortIcon('status')}
                                            </button>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedCompliance.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No compliance records found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedCompliance.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.category}</TableCell>
                                                <TableCell>{formatComplianceDate(item.expireAt)}</TableCell>
                                                <TableCell>{formatComplianceDate(item.lastUpdate)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-muted">
                                                        {item.status}
                                                    </Badge>
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
                                Showing {complianceStartIndex + 1} to {Math.min(complianceEndIndex, filteredAndSortedCompliance.length)} of {filteredAndSortedCompliance.length} entries
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setComplianceCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={complianceCurrentPage === 1 || complianceTotalPages === 0}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: complianceTotalPages }, (_, i) => i + 1).map((page) => {
                                        if (
                                            page === 1 ||
                                            page === complianceTotalPages ||
                                            (page >= complianceCurrentPage - 1 && page <= complianceCurrentPage + 1)
                                        ) {
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={complianceCurrentPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setComplianceCurrentPage(page)}
                                                    className="w-10"
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        } else if (page === complianceCurrentPage - 2 || page === complianceCurrentPage + 2) {
                                            return <span key={page} className="px-2">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setComplianceCurrentPage(prev => Math.min(complianceTotalPages, prev + 1))}
                                    disabled={complianceCurrentPage === complianceTotalPages || complianceTotalPages === 0}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KPI Mapping Section */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle>KPI Mapping</CardTitle>
                        <Button variant="default" size="sm" onClick={handleOpenKPIMappingModal}>
                            <Edit className="h-4 w-4 mr-2" />
                            Update
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {kpiMapping.role || kpiMapping.staff ? (
                            <div className="rounded-md border p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">Role</Label>
                                        <p className="text-sm font-medium">{kpiMapping.role || "Not set"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">Staff</Label>
                                        <p className="text-sm font-medium">{kpiMapping.staff || "Not set"}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground border rounded-md">
                                <p>No KPI mapping configured</p>
                                <p className="text-sm mt-2">Click "Update" to configure KPI permissions</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Staff Settings Tabs Section */}
            <StaffSettingsTabs
                staffId={staff?.id}
                initialData={{
                    role: staff?.role,
                    teams: "Test",
                    notifyTimesheetApproval: true,
                    subscribeToNotifications: true,
                    subscribedEmailCategories: "Clockin",
                    availableForRostering: true,
                    readWriteClientNotes: true,
                    readWriteStaffNotes: false,
                    accountOwner: true,
                }}
                onUpdate={(data) => {
                    // In production, update via API
                    toast({
                        title: "Settings Updated",
                        description: "Staff settings have been updated successfully.",
                    });
                }}
            />

            {/* Archive Confirmation Modal */}
            <ArchiveConfirmationModal
                isOpen={isArchiveModalOpen}
                onClose={() => setIsArchiveModalOpen(false)}
                onConfirm={handleArchiveConfirm}
                isArchived={isArchived}
                entityType="staff"
            />

            {/* KPI Mapping Modal */}
            <Dialog open={isKPIMappingModalOpen} onOpenChange={handleCloseKPIMappingModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Manage KPI Permissions</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="kpi-role">
                                Select Role
                            </Label>
                            <Select
                                value={kpiMapping.role}
                                onValueChange={(value) => setKPIMapping({ ...kpiMapping, role: value })}
                            >
                                <SelectTrigger id="kpi-role">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Carer">Carer</SelectItem>
                                    <SelectItem value="Nurse">Nurse</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                                    <SelectItem value="Coordinator">Coordinator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kpi-staff">
                                Select Staff
                            </Label>
                            <Select
                                value={kpiMapping.staff}
                                onValueChange={(value) => setKPIMapping({ ...kpiMapping, staff: value })}
                            >
                                <SelectTrigger id="kpi-staff">
                                    <SelectValue placeholder="Select staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Harrison">Harrison</SelectItem>
                                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                                    <SelectItem value="John Doe">John Doe</SelectItem>
                                    <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                                    <SelectItem value="Mike Wilson">Mike Wilson</SelectItem>
                                    <SelectItem value="Emily Brown">Emily Brown</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseKPIMappingModal}>
                            Close
                        </Button>
                        <Button onClick={handleSaveKPIMapping}>
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update Staff Form */}
            {staff && (
                <AddStaffForm
                    isOpen={isUpdateFormOpen}
                    onClose={() => setIsUpdateFormOpen(false)}
                    onSubmit={handleUpdateStaff}
                    initialData={{
                        salutation: staff.salutation || "",
                        fullName: staff.fullName,
                        email: staff.email,
                        primaryPhoneNumber: staff.primaryPhoneNumber,
                        secondaryPhoneNumber: staff.secondaryPhoneNumber || "",
                        role: staff.role,
                        dateOfBirth: staff.dateOfBirth,
                        gender: staff.gender,
                        employmentType: staff.employmentType,
                        spokenLanguages: staff.spokenLanguages,
                        skills: staff.skills || "",
                        address: staff.address,
                        image: null,
                        imageUrl: staff.image || undefined,
                    }}
                />
            )}
        </div>
    );
};

export default StaffDetail;

