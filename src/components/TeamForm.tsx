import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/RichTextEditor';

export interface TeamFormData {
    title: string;
    staff: string[]; // Array of staff IDs
    note: string;
}

interface TeamFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: TeamFormData) => void;
    initialData?: Partial<TeamFormData>; // For update mode
    availableStaff?: Array<{ id: string; name: string }>; // Available staff members
}

// Mock staff data - in production, this would come from props or API
const defaultAvailableStaff = [
    { id: "STAFF-001", name: "Harrison" },
    { id: "STAFF-002", name: "John Doe" },
    { id: "STAFF-003", name: "Jane Smith" },
    { id: "STAFF-004", name: "Mike Johnson" },
    { id: "STAFF-005", name: "Sarah Williams" },
];

const TeamForm: React.FC<TeamFormProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData,
    availableStaff = defaultAvailableStaff 
}) => {
    const isUpdateMode = !!initialData;
    const { toast } = useToast();
    const [formData, setFormData] = useState<TeamFormData>({
        title: "",
        staff: [],
        note: "",
    });
    const [errors, setErrors] = useState<Partial<Record<keyof TeamFormData, string>>>({});

    // Initialize form data when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Update mode - populate form with existing data
                setFormData({
                    title: initialData.title || "",
                    staff: initialData.staff || [],
                    note: initialData.note || "",
                });
            } else {
                // Add mode - reset form
                setFormData({
                    title: "",
                    staff: [],
                    note: "",
                });
            }
            setErrors({});
        }
    }, [isOpen, initialData]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof TeamFormData, string>> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Team title is required";
        }

        if (formData.staff.length === 0) {
            newErrors.staff = "At least one staff member is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields correctly.",
                variant: "destructive",
            });
            return;
        }

        if (onSubmit) {
            onSubmit(formData);
        }

        toast({
            title: isUpdateMode ? "Team Updated" : "Team Created",
            description: `Team "${formData.title}" has been ${isUpdateMode ? "updated" : "created"} successfully.`,
        });

        handleClose();
    };

    const handleClose = () => {
        setFormData({
            title: "",
            staff: [],
            note: "",
        });
        setErrors({});
        onClose();
    };

    const handleStaffChange = (selectedIds: string[]) => {
        setFormData(prev => {
            // Clear error if staff is selected
            if (selectedIds.length > 0 && errors.staff) {
                setErrors(prev => ({ ...prev, staff: undefined }));
            }
            return { ...prev, staff: selectedIds };
        });
    };

    // Convert availableStaff to MultiSelectOption format
    const staffOptions: MultiSelectOption[] = useMemo(() => {
        return availableStaff.map(staff => ({
            label: staff.name,
            value: staff.id,
        }));
    }, [availableStaff]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isUpdateMode ? "Update Team" : "Create New Team"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {/* Team Title */}
                    <div className="space-y-2">
                        <Label htmlFor="team-title">
                            Team Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="team-title"
                            value={formData.title}
                            onChange={(e) => {
                                setFormData({ ...formData, title: e.target.value });
                                if (errors.title) {
                                    setErrors({ ...errors, title: undefined });
                                }
                            }}
                            placeholder="Enter team title"
                        />
                        {errors.title && (
                            <p className="text-sm text-destructive">{errors.title}</p>
                        )}
                    </div>

                    {/* Staff Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="team-staff">
                            Staff <span className="text-destructive">*</span>
                        </Label>
                        <MultiSelect
                            options={staffOptions}
                            selected={formData.staff}
                            onChange={handleStaffChange}
                            placeholder="Select staff members..."
                        />
                        {errors.staff && (
                            <p className="text-sm text-destructive">{errors.staff}</p>
                        )}
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <Label htmlFor="team-note">Note</Label>
                        <RichTextEditor
                            value={formData.note}
                            onChange={(value) => setFormData({ ...formData, note: value })}
                            placeholder="Enter team notes..."
                            minHeight="200px"
                        />
                        <p className="text-xs text-muted-foreground">
                            Add any additional notes or information about this team.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {isUpdateMode ? "Update Team" : "Create Team"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TeamForm;

