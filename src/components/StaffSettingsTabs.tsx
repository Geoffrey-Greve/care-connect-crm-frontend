import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Info, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useGetStaffNextOfKinQuery,
  useCreateStaffNextOfKinMutation,
  useUpdateStaffNextOfKinMutation,
  useDeleteStaffNextOfKinMutation,
} from '@/redux/api/staffNextOfKinApi';
import {
  useGetStaffPayrollSettingsByStaffIdQuery,
  useCreateOrUpdateStaffPayrollSettingsMutation,
} from '@/redux/api/staffPayrollSettingsApi';
import {
  useGetStaffNotesQuery,
  useCreateStaffNoteMutation,
  useUpdateStaffNoteMutation,
} from '@/redux/api/staffNotesApi';
import { ErrorDialog } from '@/components/ErrorDialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { StaffNextOfKin, StaffPayrollSettings, StaffNote } from '@/types/models';

interface StaffSettingsData {
    role?: string;
    teams?: string;
    notifyTimesheetApproval?: boolean;
    subscribeToNotifications?: boolean;
    subscribedEmailCategories?: string;
    availableForRostering?: boolean;
    readWriteClientNotes?: boolean;
    readWriteStaffNotes?: boolean;
    accountOwner?: boolean;
}

interface NextOfKin {
    id: string;
    name: string;
    relation: string;
    contact: string;
    email: string;
}

interface PayrollSettings {
    id: string;
    payGroup: string;
    allowances: string;
    agreedDailyHours: string;
    agreedWeeklyHours: string;
    latenessThreshold: string;
}

interface Note {
    id: string;
    privateInfo: string;
}

interface StaffSettingsTabsProps {
    staffId?: string;
    initialData?: StaffSettingsData;
    onUpdate?: (data: StaffSettingsData) => void;
}

const StaffSettingsTabs: React.FC<StaffSettingsTabsProps> = ({
    staffId,
    initialData,
    onUpdate,
}) => {
    const { toast } = useToast();
    const parsedStaffId = staffId ? parseInt(staffId) : 0;
    
    // Fetch Next of Kin data
    const { data: nextOfKinData, isLoading: isLoadingNextOfKin } = useGetStaffNextOfKinQuery(
        { staff_id: parsedStaffId },
        { skip: !parsedStaffId }
    );
    const [createNextOfKin, { isLoading: isCreatingNextOfKin }] = useCreateStaffNextOfKinMutation();
    const [updateNextOfKin, { isLoading: isUpdatingNextOfKin }] = useUpdateStaffNextOfKinMutation();
    const [deleteNextOfKin, { isLoading: isDeletingNextOfKin }] = useDeleteStaffNextOfKinMutation();

    // Fetch Payroll Settings data
    const { data: payrollSettingsData, isLoading: isLoadingPayrollSettings } = useGetStaffPayrollSettingsByStaffIdQuery(
        parsedStaffId,
        { skip: !parsedStaffId }
    );
    const [createOrUpdatePayrollSettings, { isLoading: isSavingPayrollSettings }] = useCreateOrUpdateStaffPayrollSettingsMutation();

    // Fetch Notes data
    const { data: notesData, isLoading: isLoadingNotes } = useGetStaffNotesQuery(
        { staff_id: parsedStaffId },
        { skip: !parsedStaffId }
    );
    const [createNote, { isLoading: isCreatingNote }] = useCreateStaffNoteMutation();
    const [updateNote, { isLoading: isUpdatingNote }] = useUpdateStaffNoteMutation();

    // Transform API data to component format
    const nextOfKinList = useMemo(() => {
        if (!nextOfKinData?.data) return [];
        return nextOfKinData.data
            .filter((nok: StaffNextOfKin) => nok.is_deleted === 0 && nok.status === 1)
            .map((nok: StaffNextOfKin) => ({
                id: nok.id.toString(),
                name: nok.name,
                relation: nok.relation,
                contact: nok.contact,
                email: nok.email || "",
            }));
    }, [nextOfKinData]);

    const payrollSettings = useMemo(() => {
        if (!payrollSettingsData?.data) return null;
        const payroll = payrollSettingsData.data;
        return {
            id: payroll.id.toString(),
            payGroup: payroll.PayGroup?.name || payroll.paygroup_id?.toString() || "",
            allowances: payroll.Allowance?.name || payroll.allowance_id?.toString() || "",
            agreedDailyHours: payroll.agreed_daily_hours?.toString() || "0",
            agreedWeeklyHours: payroll.agreed_weekly_hours?.toString() || "0",
            latenessThreshold: payroll.lateness_threshold || "00:15:00",
        };
    }, [payrollSettingsData]);

    const note = useMemo(() => {
        if (!notesData?.data || notesData.data.length === 0) return null;
        const noteData = notesData.data.find((n: StaffNote) => n.is_deleted === 0 && n.status === 1) || notesData.data[0];
        return {
            id: noteData.id.toString(),
            privateInfo: noteData.private_info || "",
        };
    }, [notesData]);
    
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeTab, setActiveTab] = useState('settings');
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [isUpdateNextOfKinModalOpen, setIsUpdateNextOfKinModalOpen] = useState(false);
    const [selectedNextOfKin, setSelectedNextOfKin] = useState<NextOfKin | null>(null);
    const [nextOfKinForm, setNextOfKinForm] = useState({
        name: "",
        relation: "",
        contact: "",
        email: "",
    });
    const [nextOfKinErrors, setNextOfKinErrors] = useState<{
        name?: string;
        relation?: string;
        contact?: string;
        email?: string;
    }>({});
    const [isPayrollSettingsModalOpen, setIsPayrollSettingsModalOpen] = useState(false);
    const [payrollForm, setPayrollForm] = useState({
        payGroup: "",
        allowances: "",
        agreedDailyHours: "",
        agreedWeeklyHours: "",
        latenessThreshold: "",
    });
    const [payrollErrors, setPayrollErrors] = useState<{
        payGroup?: string;
        allowances?: string;
        agreedDailyHours?: string;
        agreedWeeklyHours?: string;
        latenessThreshold?: string;
    }>({});
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteForm, setNoteForm] = useState({
        privateInfo: "",
    });
    const [noteErrors, setNoteErrors] = useState<{
        privateInfo?: string;
    }>({});
    const [settingsData, setSettingsData] = useState<StaffSettingsData>({
        role: initialData?.role || 'Carer',
        teams: initialData?.teams || 'Test',
        notifyTimesheetApproval: initialData?.notifyTimesheetApproval ?? true,
        subscribeToNotifications: initialData?.subscribeToNotifications ?? true,
        subscribedEmailCategories: initialData?.subscribedEmailCategories || 'Clockin',
        availableForRostering: initialData?.availableForRostering ?? true,
        readWriteClientNotes: initialData?.readWriteClientNotes ?? true,
        readWriteStaffNotes: initialData?.readWriteStaffNotes ?? false,
        accountOwner: initialData?.accountOwner ?? true,
    });

    const handleUpdate = () => {
        if (isUpdateMode) {
            // Save changes
            if (onUpdate) {
                onUpdate(settingsData);
            }
            toast({
                title: "Settings Updated",
                description: "Staff settings have been updated successfully.",
            });
        }
        setIsUpdateMode(!isUpdateMode);
    };

    const handleFieldChange = (field: keyof StaffSettingsData, value: any) => {
        setSettingsData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    // Next of Kin handlers
    const handleUpdateNextOfKin = (nextOfKin: NextOfKin) => {
        setSelectedNextOfKin(nextOfKin);
        setNextOfKinForm({
            name: nextOfKin.name,
            relation: nextOfKin.relation,
            contact: nextOfKin.contact,
            email: nextOfKin.email,
        });
        setNextOfKinErrors({});
        setIsUpdateNextOfKinModalOpen(true);
    };

    const validateNextOfKinForm = () => {
        const errors: typeof nextOfKinErrors = {};

        if (!nextOfKinForm.name.trim()) {
            errors.name = "Name is required";
        }
        if (!nextOfKinForm.relation.trim()) {
            errors.relation = "Relation is required";
        }
        if (!nextOfKinForm.contact.trim()) {
            errors.contact = "Contact is required";
        }
        if (!nextOfKinForm.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextOfKinForm.email)) {
            errors.email = "Invalid email format";
        }

        setNextOfKinErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveNextOfKin = async () => {
        if (!validateNextOfKinForm()) {
            return;
        }

        if (!parsedStaffId) {
            toast({
                title: "Error",
                description: "Staff ID is required",
                variant: "destructive",
            });
            return;
        }

        try {
            if (selectedNextOfKin) {
                // Update existing
                await updateNextOfKin({
                    id: parseInt(selectedNextOfKin.id),
                    data: {
                        name: nextOfKinForm.name,
                        relation: nextOfKinForm.relation,
                        contact: nextOfKinForm.contact,
                        email: nextOfKinForm.email || undefined,
                    },
                }).unwrap();
                toast({
                    title: "Next of Kin Updated",
                    description: "Next of Kin information has been updated successfully.",
                });
            } else {
                // Create new
                await createNextOfKin({
                    staff_id: parsedStaffId,
                    name: nextOfKinForm.name,
                    relation: nextOfKinForm.relation,
                    contact: nextOfKinForm.contact,
                    email: nextOfKinForm.email || undefined,
                }).unwrap();
                toast({
                    title: "Next of Kin Created",
                    description: "Next of Kin information has been created successfully.",
                });
            }

            setIsUpdateNextOfKinModalOpen(false);
            setSelectedNextOfKin(null);
            setNextOfKinForm({ name: "", relation: "", contact: "", email: "" });
            setNextOfKinErrors({});
        } catch (error: any) {
            const errorMsg = error?.data?.message || error?.message || "Failed to save next of kin";
            setErrorMessage(errorMsg);
            setIsErrorDialogOpen(true);
        }
    };

    const handleCloseNextOfKinModal = () => {
        setIsUpdateNextOfKinModalOpen(false);
        setSelectedNextOfKin(null);
        setNextOfKinForm({ name: "", relation: "", contact: "", email: "" });
        setNextOfKinErrors({});
    };

    // Payroll Settings handlers
    useEffect(() => {
        if (payrollSettings) {
            setPayrollForm({
                payGroup: payrollSettings.payGroup,
                allowances: payrollSettings.allowances,
                agreedDailyHours: payrollSettings.agreedDailyHours,
                agreedWeeklyHours: payrollSettings.agreedWeeklyHours,
                latenessThreshold: payrollSettings.latenessThreshold,
            });
        }
    }, [payrollSettings]);

    const handleOpenPayrollSettingsModal = () => {
        if (payrollSettings) {
            // Edit mode - pre-fill form
            setPayrollForm({
                payGroup: payrollSettings.payGroup,
                allowances: payrollSettings.allowances,
                agreedDailyHours: payrollSettings.agreedDailyHours,
                agreedWeeklyHours: payrollSettings.agreedWeeklyHours,
                latenessThreshold: payrollSettings.latenessThreshold,
            });
        } else {
            // Add mode - reset form
            setPayrollForm({
                payGroup: "",
                allowances: "",
                agreedDailyHours: "",
                agreedWeeklyHours: "",
                latenessThreshold: "",
            });
        }
        setPayrollErrors({});
        setIsPayrollSettingsModalOpen(true);
    };

    const validatePayrollForm = () => {
        const errors: typeof payrollErrors = {};

        if (!payrollForm.payGroup.trim()) {
            errors.payGroup = "Pay Group is required";
        }
        if (!payrollForm.allowances.trim()) {
            errors.allowances = "Allowances is required";
        }
        if (!payrollForm.agreedWeeklyHours.trim()) {
            errors.agreedWeeklyHours = "Agreed Weekly Hours is required";
        } else if (isNaN(Number(payrollForm.agreedWeeklyHours)) || Number(payrollForm.agreedWeeklyHours) <= 0) {
            errors.agreedWeeklyHours = "Agreed Weekly Hours must be a valid positive number";
        }
        if (payrollForm.agreedDailyHours && (isNaN(Number(payrollForm.agreedDailyHours)) || Number(payrollForm.agreedDailyHours) <= 0)) {
            errors.agreedDailyHours = "Agreed Daily Hours must be a valid positive number";
        }
        if (payrollForm.latenessThreshold && (isNaN(Number(payrollForm.latenessThreshold)) || Number(payrollForm.latenessThreshold) < 0)) {
            errors.latenessThreshold = "Lateness Threshold must be a valid non-negative number";
        }

        setPayrollErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSavePayrollSettings = async () => {
        if (!validatePayrollForm()) {
            return;
        }

        if (!parsedStaffId) {
            toast({
                title: "Error",
                description: "Staff ID is required",
                variant: "destructive",
            });
            return;
        }

        try {
            await createOrUpdatePayrollSettings({
                staff_id: parsedStaffId,
                paygroup_id: parseInt(payrollForm.payGroup) || 1, // TODO: Get actual paygroup_id from selection
                allowance_id: parseInt(payrollForm.allowances) || 1, // TODO: Get actual allowance_id from selection
                agreed_daily_hours: parseFloat(payrollForm.agreedDailyHours) || 0,
                agreed_weekly_hours: parseFloat(payrollForm.agreedWeeklyHours) || 0,
                lateness_threshold: payrollForm.latenessThreshold || "00:15:00",
            }).unwrap();

            toast({
                title: payrollSettings ? "Payroll Settings Updated" : "Payroll Settings Added",
                description: "Payroll settings have been saved successfully.",
            });

            setIsPayrollSettingsModalOpen(false);
            setPayrollForm({ payGroup: "", allowances: "", agreedDailyHours: "", agreedWeeklyHours: "", latenessThreshold: "" });
            setPayrollErrors({});
        } catch (error: any) {
            const errorMsg = error?.data?.message || error?.message || "Failed to save payroll settings";
            setErrorMessage(errorMsg);
            setIsErrorDialogOpen(true);
        }
    };

    const handleClosePayrollSettingsModal = () => {
        setIsPayrollSettingsModalOpen(false);
        setPayrollForm({ payGroup: "", allowances: "", agreedDailyHours: "", agreedWeeklyHours: "", latenessThreshold: "" });
        setPayrollErrors({});
    };

    // Notes handlers
    useEffect(() => {
        if (note) {
            setNoteForm({
                privateInfo: note.privateInfo,
            });
        }
    }, [note]);

    const handleOpenNoteModal = () => {
        if (note) {
            // Edit mode - pre-fill form
            setNoteForm({
                privateInfo: note.privateInfo,
            });
        } else {
            // Add mode - reset form
            setNoteForm({
                privateInfo: "",
            });
        }
        setNoteErrors({});
        setIsNoteModalOpen(true);
    };

    const validateNoteForm = () => {
        const errors: typeof noteErrors = {};

        if (!noteForm.privateInfo.trim()) {
            errors.privateInfo = "Private Info is required";
        }

        setNoteErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveNote = async () => {
        if (!validateNoteForm()) {
            return;
        }

        if (!parsedStaffId) {
            toast({
                title: "Error",
                description: "Staff ID is required",
                variant: "destructive",
            });
            return;
        }

        try {
            if (note) {
                // Update existing
                await updateNote({
                    id: parseInt(note.id),
                    data: {
                        private_info: noteForm.privateInfo || undefined,
                    },
                }).unwrap();
                toast({
                    title: "Note Updated",
                    description: "Note has been updated successfully.",
                });
            } else {
                // Create new
                await createNote({
                    staff_id: parsedStaffId,
                    private_info: noteForm.privateInfo || undefined,
                }).unwrap();
                toast({
                    title: "Note Added",
                    description: "Note has been created successfully.",
                });
            }

            setIsNoteModalOpen(false);
            setNoteForm({ privateInfo: "" });
            setNoteErrors({});
        } catch (error: any) {
            const errorMsg = error?.data?.message || error?.message || "Failed to save note";
            setErrorMessage(errorMsg);
            setIsErrorDialogOpen(true);
        }
    };

    const handleCloseNoteModal = () => {
        setIsNoteModalOpen(false);
        setNoteForm({ privateInfo: "" });
        setNoteErrors({});
    };

    return (
        <Card>
            <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-between border-b px-6 pt-6">
                        <TabsList className="grid w-full max-w-md grid-cols-4">
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                            <TabsTrigger value="nextOfKin">Next of Kin</TabsTrigger>
                            <TabsTrigger value="payroll">Payroll Settings</TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                        </TabsList>
                    </div>
                    {/* Settings Tab */}
                    <TabsContent value="settings" className="p-6 space-y-6 mt-0">
                    <Button
                            variant="default"
                            size="sm"
                            onClick={handleUpdate}
                            className="float-right"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            {isUpdateMode ? 'Save' : 'Update'}
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Role */}
                            <div className="space-y-2">
                                <Label>Role</Label>
                                {isUpdateMode ? (
                                    <Select
                                        value={settingsData.role}
                                        onValueChange={(value) => handleFieldChange('role', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Carer">Carer</SelectItem>
                                            <SelectItem value="Nurse">Nurse</SelectItem>
                                            <SelectItem value="Manager">Manager</SelectItem>
                                            <SelectItem value="Admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-sm font-medium">{settingsData.role}</p>
                                )}
                            </div>

                            {/* Teams */}
                            <div className="space-y-2">
                                <Label>Teams</Label>
                                {isUpdateMode ? (
                                    <Select
                                        value={settingsData.teams}
                                        onValueChange={(value) => handleFieldChange('teams', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Test">Test</SelectItem>
                                            <SelectItem value="Team A">Team A</SelectItem>
                                            <SelectItem value="Team B">Team B</SelectItem>
                                            <SelectItem value="Team C">Team C</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-sm font-medium">{settingsData.teams}</p>
                                )}
                            </div>

                            {/* Notify Timesheet Approval */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>Notify Timesheet Approval</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Receive notifications when timesheets are approved</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="notify-timesheet"
                                        checked={settingsData.notifyTimesheetApproval}
                                        onCheckedChange={(checked) =>
                                            handleFieldChange('notifyTimesheetApproval', checked)
                                        }
                                        disabled={!isUpdateMode}
                                    />
                                    <label
                                        htmlFor="notify-timesheet"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {settingsData.notifyTimesheetApproval ? 'Enabled' : 'Disabled'}
                                    </label>
                                </div>
                            </div>

                            {/* Subscribe to Notifications */}
                            <div className="space-y-2">
                                <Label>Subscribe to Notifications</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="subscribe-notifications"
                                        checked={settingsData.subscribeToNotifications}
                                        onCheckedChange={(checked) =>
                                            handleFieldChange('subscribeToNotifications', checked)
                                        }
                                        disabled={!isUpdateMode}
                                    />
                                    <label
                                        htmlFor="subscribe-notifications"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {settingsData.subscribeToNotifications ? 'Subscribed' : 'Not Subscribed'}
                                    </label>
                                </div>
                            </div>

                            {/* Subscribed Email Categories */}
                            <div className="space-y-2">
                                <Label>Subscribed Email Categories</Label>
                                {isUpdateMode ? (
                                    <Select
                                        value={settingsData.subscribedEmailCategories}
                                        onValueChange={(value) => handleFieldChange('subscribedEmailCategories', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Clockin">Clockin</SelectItem>
                                            <SelectItem value="All">All</SelectItem>
                                            <SelectItem value="Timesheet">Timesheet</SelectItem>
                                            <SelectItem value="Schedule">Schedule</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-sm font-medium">{settingsData.subscribedEmailCategories}</p>
                                )}
                            </div>

                            {/* Available For Rostering */}
                            <div className="space-y-2">
                                <Label>Available For Rostering</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="available-rostering"
                                        checked={settingsData.availableForRostering}
                                        onCheckedChange={(checked) =>
                                            handleFieldChange('availableForRostering', checked)
                                        }
                                        disabled={!isUpdateMode}
                                    />
                                    <label
                                        htmlFor="available-rostering"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {settingsData.availableForRostering ? 'Available' : 'Not Available'}
                                    </label>
                                </div>
                            </div>

                            {/* Read and Write Private Notes */}
                            <div className="space-y-2">
                                <Label>Read and Write Private Notes</Label>
                                <div className="space-y-3 mt-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="client-notes"
                                            checked={settingsData.readWriteClientNotes}
                                            onCheckedChange={(checked) =>
                                                handleFieldChange('readWriteClientNotes', checked)
                                            }
                                            disabled={!isUpdateMode}
                                        />
                                        <label
                                            htmlFor="client-notes"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            Client Notes
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="staff-notes"
                                            checked={settingsData.readWriteStaffNotes}
                                            onCheckedChange={(checked) =>
                                                handleFieldChange('readWriteStaffNotes', checked)
                                            }
                                            disabled={!isUpdateMode}
                                        />
                                        <label
                                            htmlFor="staff-notes"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            Staff Notes
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* No Access */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>No Access</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>This staff member has no access to this feature</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="flex items-center">
                                    <X className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>

                            {/* Account Owner */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>Account Owner</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>This staff member is the account owner</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="account-owner"
                                        checked={settingsData.accountOwner}
                                        onCheckedChange={(checked) =>
                                            handleFieldChange('accountOwner', checked)
                                        }
                                        disabled={!isUpdateMode}
                                    />
                                    <label
                                        htmlFor="account-owner"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {settingsData.accountOwner ? 'Yes' : 'No'}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Next of Kin Tab */}
                    <TabsContent value="nextOfKin" className="p-6 mt-0">
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedNextOfKin(null);
                                        setNextOfKinForm({ name: "", relation: "", contact: "", email: "" });
                                        setNextOfKinErrors({});
                                        setIsUpdateNextOfKinModalOpen(true);
                                    }}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Add Next of Kin
                                </Button>
                            </div>
                            {isLoadingNextOfKin ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="rounded-md border overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Relation</TableHead>
                                                <TableHead>Contact</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {nextOfKinList.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                        No next of kin records found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                nextOfKinList.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium">{item.name}</TableCell>
                                                        <TableCell>{item.relation}</TableCell>
                                                        <TableCell>{item.contact}</TableCell>
                                                        <TableCell>{item.email}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleUpdateNextOfKin(item)}
                                                            >
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Update
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Payroll Settings Tab */}
                    <TabsContent value="payroll" className="p-6 mt-0">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Payroll Settings</h3>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleOpenPayrollSettingsModal}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {payrollSettings ? 'Update' : 'Add'} Payroll Settings
                                </Button>
                            </div>

                            {isLoadingPayrollSettings ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : payrollSettings ? (
                                <div className="rounded-md border p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm text-muted-foreground">Pay Group</Label>
                                            <p className="text-sm font-medium">{payrollSettings.payGroup}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm text-muted-foreground">Allowances</Label>
                                            <p className="text-sm font-medium">{payrollSettings.allowances}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm text-muted-foreground">Agreed Daily Hours</Label>
                                            <p className="text-sm font-medium">{payrollSettings.agreedDailyHours || "Not set"}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm text-muted-foreground">Agreed Weekly Hours</Label>
                                            <p className="text-sm font-medium">{payrollSettings.agreedWeeklyHours}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm text-muted-foreground">Lateness Threshold</Label>
                                            <p className="text-sm font-medium">{payrollSettings.latenessThreshold || "Not set"}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground border rounded-md">
                                    <p>No payroll settings configured</p>
                                    <p className="text-sm mt-2">Click "Add Payroll Settings" to configure</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Notes Tab */}
                    <TabsContent value="notes" className="p-6 mt-0">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Notes</h3>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleOpenNoteModal}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {note ? 'Update' : 'Add'} Note
                                </Button>
                            </div>

                            {isLoadingNotes ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : note ? (
                                <div className="rounded-md border p-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">Private Info</Label>
                                        <div className="p-4 bg-muted rounded-md min-h-[200px]">
                                            <p className="text-sm whitespace-pre-wrap">{note.privateInfo}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground border rounded-md">
                                    <p>No note added</p>
                                    <p className="text-sm mt-2">Click "Add Note" to create a note</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>

            {/* Update Next of Kin Modal */}
            <Dialog open={isUpdateNextOfKinModalOpen} onOpenChange={handleCloseNextOfKinModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Update Next of Kin</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nok-name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="nok-name"
                                value={nextOfKinForm.name}
                                onChange={(e) => setNextOfKinForm({ ...nextOfKinForm, name: e.target.value })}
                                placeholder="Enter name"
                            />
                            {nextOfKinErrors.name && (
                                <p className="text-sm text-destructive">{nextOfKinErrors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nok-relation">
                                Relation <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={nextOfKinForm.relation}
                                onValueChange={(value) => setNextOfKinForm({ ...nextOfKinForm, relation: value })}
                            >
                                <SelectTrigger id="nok-relation">
                                    <SelectValue placeholder="Select relation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Father">Father</SelectItem>
                                    <SelectItem value="Mother">Mother</SelectItem>
                                    <SelectItem value="Spouse">Spouse</SelectItem>
                                    <SelectItem value="Sibling">Sibling</SelectItem>
                                    <SelectItem value="Child">Child</SelectItem>
                                    <SelectItem value="Guardian">Guardian</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {nextOfKinErrors.relation && (
                                <p className="text-sm text-destructive">{nextOfKinErrors.relation}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nok-contact">
                                Contact <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="nok-contact"
                                value={nextOfKinForm.contact}
                                onChange={(e) => setNextOfKinForm({ ...nextOfKinForm, contact: e.target.value })}
                                placeholder="Enter contact number"
                            />
                            {nextOfKinErrors.contact && (
                                <p className="text-sm text-destructive">{nextOfKinErrors.contact}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nok-email">
                                Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="nok-email"
                                type="email"
                                value={nextOfKinForm.email}
                                onChange={(e) => setNextOfKinForm({ ...nextOfKinForm, email: e.target.value })}
                                placeholder="Enter email address"
                            />
                            {nextOfKinErrors.email && (
                                <p className="text-sm text-destructive">{nextOfKinErrors.email}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseNextOfKinModal} disabled={isCreatingNextOfKin || isUpdatingNextOfKin}>
                            Close
                        </Button>
                        <Button onClick={handleSaveNextOfKin} disabled={isCreatingNextOfKin || isUpdatingNextOfKin}>
                            {(isCreatingNextOfKin || isUpdatingNextOfKin) ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {selectedNextOfKin ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                selectedNextOfKin ? "Update" : "Create"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payroll Settings Modal */}
            <Dialog open={isPayrollSettingsModalOpen} onOpenChange={handleClosePayrollSettingsModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{payrollSettings ? 'Update' : 'Add'} Payroll Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="payroll-pay-group">
                                Pay Group <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={payrollForm.payGroup}
                                onValueChange={(value) => setPayrollForm({ ...payrollForm, payGroup: value })}
                            >
                                <SelectTrigger id="payroll-pay-group">
                                    <SelectValue placeholder="Select pay group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Group A">Group A</SelectItem>
                                    <SelectItem value="Group B">Group B</SelectItem>
                                    <SelectItem value="Group C">Group C</SelectItem>
                                    <SelectItem value="Group D">Group D</SelectItem>
                                    <SelectItem value="Senior">Senior</SelectItem>
                                    <SelectItem value="Junior">Junior</SelectItem>
                                </SelectContent>
                            </Select>
                            {payrollErrors.payGroup && (
                                <p className="text-sm text-destructive">{payrollErrors.payGroup}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payroll-allowances">
                                Allowances <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={payrollForm.allowances}
                                onValueChange={(value) => setPayrollForm({ ...payrollForm, allowances: value })}
                            >
                                <SelectTrigger id="payroll-allowances">
                                    <SelectValue placeholder="Select allowances" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Standard">Standard</SelectItem>
                                    <SelectItem value="Premium">Premium</SelectItem>
                                    <SelectItem value="Overtime">Overtime</SelectItem>
                                    <SelectItem value="Shift Allowance">Shift Allowance</SelectItem>
                                    <SelectItem value="Weekend Allowance">Weekend Allowance</SelectItem>
                                    <SelectItem value="Public Holiday">Public Holiday</SelectItem>
                                    <SelectItem value="None">None</SelectItem>
                                </SelectContent>
                            </Select>
                            {payrollErrors.allowances && (
                                <p className="text-sm text-destructive">{payrollErrors.allowances}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payroll-daily-hours">
                                Agreed Daily Hours
                            </Label>
                            <Input
                                id="payroll-daily-hours"
                                type="number"
                                step="0.5"
                                min="0"
                                value={payrollForm.agreedDailyHours}
                                onChange={(e) => setPayrollForm({ ...payrollForm, agreedDailyHours: e.target.value })}
                                placeholder="Enter daily hours"
                            />
                            {payrollErrors.agreedDailyHours && (
                                <p className="text-sm text-destructive">{payrollErrors.agreedDailyHours}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payroll-weekly-hours">
                                Agreed Weekly Hours <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="payroll-weekly-hours"
                                type="number"
                                step="0.5"
                                min="0"
                                value={payrollForm.agreedWeeklyHours}
                                onChange={(e) => setPayrollForm({ ...payrollForm, agreedWeeklyHours: e.target.value })}
                                placeholder="Enter weekly hours"
                            />
                            {payrollErrors.agreedWeeklyHours && (
                                <p className="text-sm text-destructive">{payrollErrors.agreedWeeklyHours}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payroll-lateness-threshold">
                                Lateness Threshold
                            </Label>
                            <Input
                                id="payroll-lateness-threshold"
                                type="number"
                                step="1"
                                min="0"
                                value={payrollForm.latenessThreshold}
                                onChange={(e) => setPayrollForm({ ...payrollForm, latenessThreshold: e.target.value })}
                                placeholder="Enter lateness threshold (minutes)"
                            />
                            {payrollErrors.latenessThreshold && (
                                <p className="text-sm text-destructive">{payrollErrors.latenessThreshold}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleClosePayrollSettingsModal} disabled={isSavingPayrollSettings}>
                            Close
                        </Button>
                        <Button onClick={handleSavePayrollSettings} disabled={isSavingPayrollSettings}>
                            {isSavingPayrollSettings ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                payrollSettings ? 'Update' : 'Add'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Note Modal */}
            <Dialog open={isNoteModalOpen} onOpenChange={handleCloseNoteModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{note ? 'Update' : 'Add'} Note</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="note-private-info">
                                Private Info <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="note-private-info"
                                value={noteForm.privateInfo}
                                onChange={(e) => setNoteForm({ ...noteForm, privateInfo: e.target.value })}
                                placeholder="Enter private information..."
                                rows={8}
                                className="resize-none"
                            />
                            {noteErrors.privateInfo && (
                                <p className="text-sm text-destructive">{noteErrors.privateInfo}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseNoteModal} disabled={isCreatingNote || isUpdatingNote}>
                            Close
                        </Button>
                        <Button onClick={handleSaveNote} disabled={isCreatingNote || isUpdatingNote}>
                            {(isCreatingNote || isUpdatingNote) ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {note ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                note ? 'Update' : 'Add'
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
        </Card>
    );
};

export default StaffSettingsTabs;

