import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  RefreshCw,
  Check,
  X,
  Loader2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useGetStaffByIdQuery, useToggleStaffStatusMutation } from "@/redux/api/staffApi";
import {
  useGetStaffNextOfKinQuery,
  useCreateStaffNextOfKinMutation,
  useUpdateStaffNextOfKinMutation,
  useDeleteStaffNextOfKinMutation,
} from "@/redux/api/staffNextOfKinApi";
import {
  useGetStaffPayrollSettingsByStaffIdQuery,
  useCreateOrUpdateStaffPayrollSettingsMutation,
} from "@/redux/api/staffPayrollSettingsApi";
import {
  useGetStaffNotesQuery,
  useCreateStaffNoteMutation,
  useUpdateStaffNoteMutation,
} from "@/redux/api/staffNotesApi";
import { useToast } from "@/hooks/use-toast";
import { ErrorDialog } from "@/components/ErrorDialog";
import type { StaffNextOfKin, StaffPayrollSettings, StaffNote } from "@/types/models";

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch staff data
  const staffId = parseInt(id || "0");
  const { data: staffData, isLoading: isLoadingStaff } = useGetStaffByIdQuery(staffId, { skip: !id });
  const [toggleStaffStatus, { isLoading: isTogglingStatus }] = useToggleStaffStatusMutation();
  
  // Fetch Next of Kin data
  const { data: nextOfKinData, isLoading: isLoadingNextOfKin } = useGetStaffNextOfKinQuery(
    { staff_id: staffId },
    { skip: !staffId }
  );
  const [createNextOfKin, { isLoading: isCreatingNextOfKin }] = useCreateStaffNextOfKinMutation();
  const [updateNextOfKin, { isLoading: isUpdatingNextOfKin }] = useUpdateStaffNextOfKinMutation();
  const [deleteNextOfKin, { isLoading: isDeletingNextOfKin }] = useDeleteStaffNextOfKinMutation();

  // Fetch Payroll Settings data
  const { data: payrollSettingsData, isLoading: isLoadingPayrollSettings } = useGetStaffPayrollSettingsByStaffIdQuery(
    staffId,
    { skip: !staffId }
  );
  const [createOrUpdatePayrollSettings, { isLoading: isSavingPayrollSettings }] = useCreateOrUpdateStaffPayrollSettingsMutation();

  // Fetch Notes data
  const { data: notesData, isLoading: isLoadingNotes } = useGetStaffNotesQuery(
    { staff_id: staffId },
    { skip: !staffId }
  );
  const [createNote, { isLoading: isCreatingNote }] = useCreateStaffNoteMutation();
  const [updateNote, { isLoading: isUpdatingNote }] = useUpdateStaffNoteMutation();
  
  // Status and dialog states
  const [isStatusActive, setIsStatusActive] = useState(true);
  const [showStatusToggleConfirmation, setShowStatusToggleConfirmation] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingNextOfKinId, setEditingNextOfKinId] = useState<number | null>(null);
  const [isDeleteNextOfKinDialogOpen, setIsDeleteNextOfKinDialogOpen] = useState(false);
  const [nextOfKinToDelete, setNextOfKinToDelete] = useState<number | null>(null);

  // Update status when staff data loads
  useEffect(() => {
    if (staffData?.data) {
      const status = staffData.data.status;
      // Handle both boolean and number types
      setIsStatusActive(status === true || (typeof status === 'number' && status === 1));
    }
  }, [staffData]);

  // Mock employee data - in real app this would come from an API
  const employee = {
    id: id || "1",
    name: staffData?.data ? `${staffData.data.first_name} ${staffData.data.last_name}` : "Doctor. Testing",
    fullName: staffData?.data ? `${staffData.data.first_name} ${staffData.data.last_name}` : "Doctor. Testing",
    address: staffData?.data?.address || "a-25 karachi",
    dob: staffData?.data?.date_of_birth || "06/11/2007",
    languageSpoken: staffData?.data?.StaffDetail?.Language?.name || "Yoruba",
    contact: staffData?.data?.primary_phone_number || "3313429091",
    contact2: staffData?.data?.secondary_phone_number || "3313429091",
    gender: staffData?.data?.gender || "Non-binary",
    employmentType: staffData?.data?.StaffDetail?.employment_type || "Contractor",
    skills: "Admin, Community Access, Case Management",
    email: staffData?.data?.email || "staff@example.com",
    role: staffData?.data?.StaffDetail?.Role?.name || "Co-ordinator upfr",
    expiryDate: "28/11/2025",
    avatar: staffData?.data ? `${staffData.data.first_name?.[0]}${staffData.data.last_name?.[0]}` : "DT"
  };

  const handleStatusToggle = (checked: boolean) => {
    // Show confirmation dialog before toggling
    setShowStatusToggleConfirmation(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!id) return;

    try {
      const newStatus = isStatusActive ? 0 : 1;
      await toggleStaffStatus({
        id: parseInt(id),
        status: newStatus,
      }).unwrap();
      setIsStatusActive(!isStatusActive);
      setShowStatusToggleConfirmation(false);
      toast({
        title: "Status Updated",
        description: `Staff member has been ${!isStatusActive ? "activated" : "deactivated"}.`,
      });
    } catch (error: any) {
      console.error("Failed to toggle staff status:", error);
      const errorMsg = error?.data?.message || "Failed to toggle staff status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setShowStatusToggleConfirmation(false);
    }
  };

  const complianceItems = [
    { category: "COVID-19 Compliance", expiresAt: "-", lastUpdate: "-", status: "Not Specified" },
    { category: "COVID-19 Compliance", expiresAt: "-", lastUpdate: "-", status: "Not Specified" },
    { category: "COVID-19 Compliance", expiresAt: "-", lastUpdate: "-", status: "Not Specified" },
    { category: "First Aid Certificate", expiresAt: "-", lastUpdate: "-", status: "Not Specified" },
    { category: "First Aid Certificate", expiresAt: "-", lastUpdate: "-", status: "Not Specified" },
    { category: "First Aid Certificate", expiresAt: "-", lastUpdate: "-", status: "Not Specified" },
    { category: "NDIS Worker Check (NDISWC)", expiresAt: "-", lastUpdate: "-", status: "Not Specified" },
    { category: "NDIS Worker Check (NDISWC)", expiresAt: "-", lastUpdate: "-", status: "Not Specified" },
    { category: "NDIS Worker Check (NDISWC)", expiresAt: "-", lastUpdate: "-", status: "Not Specified" },
    { category: "Police Check", expiresAt: "-", lastUpdate: "-", status: "Not Specified" },
  ];

  // Dialog states
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isNextOfKinDialogOpen, setIsNextOfKinDialogOpen] = useState(false);
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");

  // Form states
  const [settingsForm, setSettingsForm] = useState({
    role: "Co-ordinator upfr",
    teams: "",
    notifyTimesheetApproval: true,
    subscribeToNotifications: true,
    subscribedEmailCategories: "",
    availableForRostering: false,
    readWritePrivateNotes: false,
    clientNotes: false,
    staffNotes: false,
    noAccess: false,
    accountOwner: true,
  });

  // Get first next of kin for display (or create new)
  const currentNextOfKin = useMemo(() => {
    if (!nextOfKinData?.data || nextOfKinData.data.length === 0) return null;
    return nextOfKinData.data.find(nok => nok.is_deleted === 0 && nok.status === 1) || nextOfKinData.data[0];
  }, [nextOfKinData]);

  const [nextOfKinForm, setNextOfKinForm] = useState({
    name: "",
    relation: "",
    contact: "",
    email: "",
  });

  // Load next of kin data into form when editing
  useEffect(() => {
    if (editingNextOfKinId && nextOfKinData?.data) {
      const nok = nextOfKinData.data.find(n => n.id === editingNextOfKinId);
      if (nok) {
        setNextOfKinForm({
          name: nok.name || "",
          relation: nok.relation || "",
          contact: nok.contact || "",
          email: nok.email || "",
        });
      }
    } else if (currentNextOfKin && !editingNextOfKinId) {
      setNextOfKinForm({
        name: currentNextOfKin.name || "",
        relation: currentNextOfKin.relation || "",
        contact: currentNextOfKin.contact || "",
        email: currentNextOfKin.email || "",
      });
    }
  }, [currentNextOfKin, editingNextOfKinId, nextOfKinData]);

  // Load payroll settings into form
  useEffect(() => {
    if (payrollSettingsData?.data) {
      const payroll = payrollSettingsData.data;
      setPayrollForm({
        payGroup: payroll.PayGroup?.name || payroll.paygroup_id?.toString() || "",
        allowances: payroll.Allowance?.name || payroll.allowance_id?.toString() || "",
        agreedDailyHours: payroll.agreed_daily_hours?.toString() || "0",
        agreedWeeklyHours: payroll.agreed_weekly_hours?.toString() || "0",
        latenessThreshold: payroll.lateness_threshold || "00:15:00",
        externalSystemIdentifier: "",
      });
    }
  }, [payrollSettingsData]);

  // Load notes into form
  useEffect(() => {
    if (notesData?.data && notesData.data.length > 0) {
      const note = notesData.data.find(n => n.is_deleted === 0 && n.status === 1) || notesData.data[0];
      setNotesForm({
        privateInfo: note.private_info || "",
      });
    }
  }, [notesData]);

  const [payrollForm, setPayrollForm] = useState({
    payGroup: "",
    allowances: "",
    agreedDailyHours: "0",
    agreedWeeklyHours: "0",
    latenessThreshold: "00:15:00",
    externalSystemIdentifier: "",
  });

  const [notesForm, setNotesForm] = useState({
    privateInfo: "",
  });

  // Pagination state for compliance items
  const [complianceEntriesPerPage, setComplianceEntriesPerPage] = useState(10);
  const [complianceCurrentPage, setComplianceCurrentPage] = useState(1);

  // Pagination calculations for compliance items
  const complianceTotalPages = Math.ceil(complianceItems.length / complianceEntriesPerPage);
  const complianceStartIndex = (complianceCurrentPage - 1) * complianceEntriesPerPage;
  const complianceEndIndex = complianceStartIndex + complianceEntriesPerPage;
  const paginatedComplianceItems = useMemo(() => {
    return complianceItems.slice(complianceStartIndex, complianceEndIndex);
  }, [complianceStartIndex, complianceEndIndex, complianceItems]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/staff-list")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            ← Back
          </Button>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate("/staff-list")} className="cursor-pointer">
                  Team
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>View Staff</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold">View Staff</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="status-toggle" className="text-sm font-medium">
              {isStatusActive ? "Active" : "Inactive"}
            </Label>
            <Switch
              id="status-toggle"
              checked={isStatusActive}
              onCheckedChange={handleStatusToggle}
              disabled={isTogglingStatus || isLoadingStaff}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                Manage <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit Profile</DropdownMenuItem>
              <DropdownMenuItem>Reset Password</DropdownMenuItem>
              <DropdownMenuItem>Deactivate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
        </div>
      </div>

      {/* Staff Details Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Staff Details</CardTitle>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Update
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            <Avatar className="h-20 w-20 bg-teal-500">
              <AvatarFallback className="text-white font-bold text-lg">
                {employee.avatar}
              </AvatarFallback>
            </Avatar>
            
            <div className="grid grid-cols-2 gap-6 flex-1">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Full Name:</Label>
                  <p className="font-medium">{employee.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Address:</Label>
                  <p className="font-medium">{employee.address}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date of Birth:</Label>
                  <p className="font-medium">{employee.dob}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Spoken Languages:</Label>
                  <p className="font-medium">{employee.languageSpoken}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Contact:</Label>
                  <p className="font-medium">{employee.contact}, {employee.contact2}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Gender:</Label>
                  <p className="font-medium">{employee.gender}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Employment Type:</Label>
                  <p className="font-medium">{employee.employmentType}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Skills:</Label>
                  <p className="font-medium">{employee.skills}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email:</Label>
                  <p className="font-medium">{employee.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Role:</Label>
                  <p className="font-medium">{employee.role}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Expiry Date:</Label>
                  <p className="font-medium">{employee.expiryDate}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Compliance</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-500">
            Manage All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Show</Label>
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
              <Label className="text-sm">entries</Label>
            </div>
            <Input placeholder="Search" className="w-[200px]" />
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Expire At</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedComplianceItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No compliance items found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedComplianceItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.category}</TableCell>
                    <TableCell>{item.expiresAt}</TableCell>
                    <TableCell>{item.lastUpdate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {complianceStartIndex + 1} to {Math.min(complianceEndIndex, complianceItems.length)} of {complianceItems.length} entries
            </p>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setComplianceCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={complianceCurrentPage === 1 || complianceTotalPages === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
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
        </CardContent>
      </Card>

      {/* KPI Mapping Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>KPI Mapping</CardTitle>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Update
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No KPI Assigned</p>
        </CardContent>
      </Card>

      {/* Settings Section with Tabs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Settings</CardTitle>
          <Button 
            variant="outline" 
            size="default"
            onClick={() => {
              if (activeTab === 'settings') setIsSettingsDialogOpen(true);
              else if (activeTab === 'nextOfKin') {
                if (currentNextOfKin) {
                  setEditingNextOfKinId(currentNextOfKin.id);
                } else {
                  setEditingNextOfKinId(null);
                }
                setIsNextOfKinDialogOpen(true);
              }
              else if (activeTab === 'payroll') setIsPayrollDialogOpen(true);
              else if (activeTab === 'notes') setIsNotesDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
            Update
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="nextOfKin">Next of Kin</TabsTrigger>
              <TabsTrigger value="payroll">Payroll Settings</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="mt-4">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-normal text-gray-700 ">Role:</Label>
                  <span className="text-sm text-gray-900">{settingsForm.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-normal text-gray-700">Teams:</Label>
                  <span className="text-sm text-gray-900">{settingsForm.teams || ""}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <Label className="text-sm font-normal text-gray-700">Notify Timesheet Approval</Label>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                  {settingsForm.notifyTimesheetApproval ? (
                    <Check className="h-4 w-4 text-blue-600" />
                  ) : (
                    <X className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-normal text-gray-700">Subscribe to Notifications</Label>
                  {settingsForm.subscribeToNotifications ? (
                    <Check className="h-4 w-4 text-blue-600" />
                  ) : (
                    <X className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-normal text-gray-700">Subscribed Email Categories:</Label>
                  <span className="text-sm text-gray-900">{settingsForm.subscribedEmailCategories || ""}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-normal text-gray-700">Available For Rostering</Label>
                  {settingsForm.availableForRostering ? (
                    <Check className="h-4 w-4 text-blue-600" />
                  ) : (
                    <X className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <Label className="text-sm font-normal text-gray-700">Read and Write Private Notes</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs text-gray-500 font-normal">Client Notes</Label>
                      {settingsForm.clientNotes ? (
                        <Check className="h-3 w-3 text-blue-600" />
                      ) : (
                        <X className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs text-gray-500 font-normal">Staff Notes</Label>
                      {settingsForm.staffNotes ? (
                        <Check className="h-3 w-3 text-blue-600" />
                      ) : (
                        <X className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <Label className="text-sm font-normal text-gray-700">No Access</Label>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                  {settingsForm.noAccess ? (
                    <Check className="h-4 w-4 text-blue-600" />
                  ) : (
                    <X className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <Label className="text-sm font-normal text-gray-700">Account Owner</Label>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                  {settingsForm.accountOwner ? (
                    <Check className="h-4 w-4 text-blue-600" />
                  ) : (
                    <X className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nextOfKin" className="mt-4">
              {isLoadingNextOfKin ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : currentNextOfKin ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-normal text-gray-700">Name :</Label>
                    <span className="text-sm text-gray-900">{currentNextOfKin.name || ""}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-normal text-gray-700">Relation :</Label>
                    <span className="text-sm text-gray-900">{currentNextOfKin.relation || ""}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-normal text-gray-700">Contact :</Label>
                    <span className="text-sm text-gray-900">{currentNextOfKin.contact || ""}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-normal text-gray-700">Email :</Label>
                    <span className="text-sm text-gray-900">{currentNextOfKin.email || ""}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No next of kin information available
                </div>
              )}
            </TabsContent>

            <TabsContent value="payroll" className="mt-4">
              {isLoadingPayrollSettings ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : payrollSettingsData?.data ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-normal text-gray-700">Pay Group :</Label>
                    <span className="text-sm text-gray-900">
                      {payrollSettingsData.data.PayGroup?.name || payrollForm.payGroup || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-normal text-gray-700">Allowances :</Label>
                    <span className="text-sm text-gray-900">
                      {payrollSettingsData.data.Allowance?.name || payrollForm.allowances || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-normal text-gray-700">Agreed Daily Hours :</Label>
                    <span className="text-sm text-gray-900">
                      {payrollSettingsData.data.agreed_daily_hours || 0} Hrs
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-normal text-gray-700">Agreed Weekly Hours :</Label>
                    <span className="text-sm text-gray-900">
                      {payrollSettingsData.data.agreed_weekly_hours || 0} Hrs
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-normal text-gray-700">Lateness Threshold :</Label>
                    <span className="text-sm text-gray-900">
                      {payrollSettingsData.data.lateness_threshold || "N/A"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payroll settings available
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              {isLoadingNotes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="">
                  <Label className="text-sm font-normal text-gray-700 mb-2 block">Private Info :</Label>
                  <Textarea 
                    value={notesForm.privateInfo || ""}
                    readOnly
                    className="min-h-[150px] resize-none bg-white border-gray-200"
                    placeholder={notesForm.privateInfo ? "" : "No notes available"}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Archive Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will archive the staff and you will not able to see staff in your list. if you do wish to access the client, please go to Archive menu.
            </p>
            <Button variant="destructive">Archive</Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Setting Form</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={settingsForm.role} onValueChange={(value) => setSettingsForm({...settingsForm, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Co-ordinator upfr">Co-ordinator upfr</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Teams *</Label>
              <Input 
                value={settingsForm.teams}
                onChange={(e) => setSettingsForm({...settingsForm, teams: e.target.value})}
                placeholder="Enter teams"
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Label>Notify Timesheet Approval</Label>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              <Checkbox 
                checked={settingsForm.notifyTimesheetApproval}
                onCheckedChange={(checked) => setSettingsForm({...settingsForm, notifyTimesheetApproval: checked as boolean})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label>Subscribe to Notifications</Label>
              <Checkbox 
                checked={settingsForm.subscribeToNotifications}
                onCheckedChange={(checked) => setSettingsForm({...settingsForm, subscribeToNotifications: checked as boolean})}
              />
            </div>
            <div className="space-y-2">
              <Label>Subscribed Email Categories *</Label>
              <Input 
                value={settingsForm.subscribedEmailCategories}
                onChange={(e) => setSettingsForm({...settingsForm, subscribedEmailCategories: e.target.value})}
                placeholder="Enter email categories"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label>Available For Rostering</Label>
              <Checkbox 
                checked={settingsForm.availableForRostering}
                onCheckedChange={(checked) => setSettingsForm({...settingsForm, availableForRostering: checked as boolean})}
              />
            </div>
            <div className="space-y-2">
              <Label>Read and Write Private Notes</Label>
              <div className="flex space-x-4 pl-2">
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Client Notes</Label>
                  <Checkbox 
                    checked={settingsForm.clientNotes}
                    onCheckedChange={(checked) => setSettingsForm({...settingsForm, clientNotes: checked as boolean})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-xs">Staff Notes</Label>
                  <Checkbox 
                    checked={settingsForm.staffNotes}
                    onCheckedChange={(checked) => setSettingsForm({...settingsForm, staffNotes: checked as boolean})}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Label>No Access</Label>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              <Checkbox 
                checked={settingsForm.noAccess}
                onCheckedChange={(checked) => setSettingsForm({...settingsForm, noAccess: checked as boolean})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Label>Account Owner</Label>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              <Checkbox 
                checked={settingsForm.accountOwner}
                onCheckedChange={(checked) => setSettingsForm({...settingsForm, accountOwner: checked as boolean})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSettingsDialogOpen(false)}>Update</Button>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Next of Kin Dialog */}
      <Dialog open={isNextOfKinDialogOpen} onOpenChange={setIsNextOfKinDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Next of Kin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input 
                value={nextOfKinForm.name}
                onChange={(e) => setNextOfKinForm({...nextOfKinForm, name: e.target.value})}
                placeholder="Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Relation *</Label>
              <Input 
                value={nextOfKinForm.relation}
                onChange={(e) => setNextOfKinForm({...nextOfKinForm, relation: e.target.value})}
                placeholder="Relation"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact *</Label>
              <Input 
                value={nextOfKinForm.contact}
                onChange={(e) => setNextOfKinForm({...nextOfKinForm, contact: e.target.value})}
                placeholder="Contact Number"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input 
                type="email"
                value={nextOfKinForm.email}
                onChange={(e) => setNextOfKinForm({...nextOfKinForm, email: e.target.value})}
                placeholder="Email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={async () => {
                if (!staffId) return;
                try {
                  if (editingNextOfKinId) {
                    await updateNextOfKin({
                      id: editingNextOfKinId,
                      data: {
                        name: nextOfKinForm.name,
                        relation: nextOfKinForm.relation,
                        contact: nextOfKinForm.contact,
                        email: nextOfKinForm.email || undefined,
                      },
                    }).unwrap();
                    toast({
                      title: "Next of Kin Updated",
                      description: "Next of kin information has been updated successfully.",
                    });
                  } else {
                    await createNextOfKin({
                      staff_id: staffId,
                      name: nextOfKinForm.name,
                      relation: nextOfKinForm.relation,
                      contact: nextOfKinForm.contact,
                      email: nextOfKinForm.email || undefined,
                    }).unwrap();
                    toast({
                      title: "Next of Kin Created",
                      description: "Next of kin information has been created successfully.",
                    });
                  }
                  setIsNextOfKinDialogOpen(false);
                  setEditingNextOfKinId(null);
                  setNextOfKinForm({ name: "", relation: "", contact: "", email: "" });
                } catch (error: any) {
                  const errorMsg = error?.data?.message || error?.message || "Failed to save next of kin";
                  setErrorMessage(errorMsg);
                  setIsErrorDialogOpen(true);
                }
              }}
              disabled={isCreatingNextOfKin || isUpdatingNextOfKin}
            >
              {(isCreatingNextOfKin || isUpdatingNextOfKin) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingNextOfKinId ? "Updating..." : "Creating..."}
                </>
              ) : (
                editingNextOfKinId ? "Update" : "Create"
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsNextOfKinDialogOpen(false);
                setEditingNextOfKinId(null);
                if (currentNextOfKin) {
                  setNextOfKinForm({
                    name: currentNextOfKin.name || "",
                    relation: currentNextOfKin.relation || "",
                    contact: currentNextOfKin.contact || "",
                    email: currentNextOfKin.email || "",
                  });
                } else {
                  setNextOfKinForm({ name: "", relation: "", contact: "", email: "" });
                }
              }}
              disabled={isCreatingNextOfKin || isUpdatingNextOfKin}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Next of Kin Confirmation Dialog */}
      <Dialog open={isDeleteNextOfKinDialogOpen} onOpenChange={setIsDeleteNextOfKinDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="rounded-full border-4 border-red-200 p-3">
              <svg
                className="w-12 h-12 text-red-500"
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
                This will permanently delete the next of kin information. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={async () => {
                  if (!nextOfKinToDelete) return;
                  try {
                    await deleteNextOfKin(nextOfKinToDelete).unwrap();
                    toast({
                      title: "Next of Kin Deleted",
                      description: "Next of kin information has been deleted successfully.",
                    });
                    setIsDeleteNextOfKinDialogOpen(false);
                    setNextOfKinToDelete(null);
                  } catch (error: any) {
                    const errorMsg = error?.data?.message || error?.message || "Failed to delete next of kin";
                    setErrorMessage(errorMsg);
                    setIsErrorDialogOpen(true);
                    setIsDeleteNextOfKinDialogOpen(false);
                    setNextOfKinToDelete(null);
                  }
                }}
                variant="destructive"
                className="px-6"
                disabled={isDeletingNextOfKin}
              >
                {isDeletingNextOfKin ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, delete it"
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsDeleteNextOfKinDialogOpen(false);
                  setNextOfKinToDelete(null);
                }}
                variant="outline"
                className="px-6"
                disabled={isDeletingNextOfKin}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payroll Settings Dialog */}
      <Dialog open={isPayrollDialogOpen} onOpenChange={setIsPayrollDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payroll Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pay Group *</Label>
              <Select value={payrollForm.payGroup} onValueChange={(value) => setPayrollForm({...payrollForm, payGroup: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select PayGroup" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group1">Group 1</SelectItem>
                  <SelectItem value="group2">Group 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Allowances *</Label>
              <Select value={payrollForm.allowances} onValueChange={(value) => setPayrollForm({...payrollForm, allowances: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Allowances" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allowance1">Allowance 1</SelectItem>
                  <SelectItem value="allowance2">Allowance 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Agreed Daily Hours *</Label>
              <Input 
                type="number"
                value={payrollForm.agreedDailyHours}
                onChange={(e) => setPayrollForm({...payrollForm, agreedDailyHours: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Agreed Weekly Hours *</Label>
              <Input 
                type="number"
                value={payrollForm.agreedWeeklyHours}
                onChange={(e) => setPayrollForm({...payrollForm, agreedWeeklyHours: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Lateness Threshold *</Label>
              <Input 
                value={payrollForm.latenessThreshold}
                onChange={(e) => setPayrollForm({...payrollForm, latenessThreshold: e.target.value})}
                placeholder="00:15"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={async () => {
                if (!staffId) return;
                try {
                  // Note: paygroup_id and allowance_id need to be numbers, not strings
                  // For now, using the IDs from the form (assuming they're stored as IDs)
                  // In production, you'd need to fetch pay groups and allowances lists
                  await createOrUpdatePayrollSettings({
                    staff_id: staffId,
                    paygroup_id: parseInt(payrollForm.payGroup) || 1, // TODO: Get actual paygroup_id from selection
                    allowance_id: parseInt(payrollForm.allowances) || 1, // TODO: Get actual allowance_id from selection
                    agreed_daily_hours: parseFloat(payrollForm.agreedDailyHours) || 0,
                    agreed_weekly_hours: parseFloat(payrollForm.agreedWeeklyHours) || 0,
                    lateness_threshold: payrollForm.latenessThreshold || "00:15:00",
                  }).unwrap();
                  toast({
                    title: "Payroll Settings Saved",
                    description: "Payroll settings have been saved successfully.",
                  });
                  setIsPayrollDialogOpen(false);
                } catch (error: any) {
                  const errorMsg = error?.data?.message || error?.message || "Failed to save payroll settings";
                  setErrorMessage(errorMsg);
                  setIsErrorDialogOpen(true);
                }
              }}
              disabled={isSavingPayrollSettings}
            >
              {isSavingPayrollSettings ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsPayrollDialogOpen(false)}
              disabled={isSavingPayrollSettings}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Private Info *</Label>
              <Textarea 
                value={notesForm.privateInfo}
                onChange={(e) => setNotesForm({...notesForm, privateInfo: e.target.value})}
                placeholder="Enter private notes"
                className="min-h-[150px] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={async () => {
                if (!staffId) return;
                try {
                  const existingNote = notesData?.data?.find(n => n.is_deleted === 0 && n.status === 1);
                  if (existingNote) {
                    await updateNote({
                      id: existingNote.id,
                      data: {
                        private_info: notesForm.privateInfo || undefined,
                      },
                    }).unwrap();
                    toast({
                      title: "Notes Updated",
                      description: "Staff notes have been updated successfully.",
                    });
                  } else {
                    await createNote({
                      staff_id: staffId,
                      private_info: notesForm.privateInfo || undefined,
                    }).unwrap();
                    toast({
                      title: "Notes Created",
                      description: "Staff notes have been created successfully.",
                    });
                  }
                  setIsNotesDialogOpen(false);
                } catch (error: any) {
                  const errorMsg = error?.data?.message || error?.message || "Failed to save notes";
                  setErrorMessage(errorMsg);
                  setIsErrorDialogOpen(true);
                }
              }}
              disabled={isCreatingNote || isUpdatingNote}
            >
              {(isCreatingNote || isUpdatingNote) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {notesData?.data?.find(n => n.is_deleted === 0 && n.status === 1) ? "Updating..." : "Creating..."}
                </>
              ) : (
                "Save"
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsNotesDialogOpen(false)}
              disabled={isCreatingNote || isUpdatingNote}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  );
};

export default EmployeeProfile;
