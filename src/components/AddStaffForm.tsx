import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

export interface StaffFormData {
    salutation: string;
    fullName: string;
    email: string;
    primaryPhoneNumber: string;
    secondaryPhoneNumber: string;
    role: string;
    dateOfBirth: string;
    gender: string;
    employmentType: string;
    spokenLanguages: string;
    skills: string;
    address: string;
    image: File | null;
}

interface AddStaffFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: StaffFormData) => void;
    initialData?: Partial<StaffFormData> & { imageUrl?: string }; // For update mode
}

const salutations = ["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof"];
const genders = ["Male", "Female", "Non-binary", "Prefer not to say"];
const roles = ["Admin", "Carer", "Nurse", "Support Worker", "Manager", "Coordinator", "Other"];
const employmentTypes = ["Full-time", "Part-time", "Casual", "Contract", "Volunteer"];

const AddStaffForm: React.FC<AddStaffFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isUpdateMode = !!initialData;
    const { toast } = useToast();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<StaffFormData>({
        salutation: "",
        fullName: "",
        email: "",
        primaryPhoneNumber: "",
        secondaryPhoneNumber: "",
        role: "",
        dateOfBirth: "",
        gender: "",
        employmentType: "",
        spokenLanguages: "",
        skills: "",
        address: "",
        image: null,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});

    // Initialize form data when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Update mode - populate form with existing data
                setFormData({
                    salutation: initialData.salutation || "",
                    fullName: initialData.fullName || "",
                    email: initialData.email || "",
                    primaryPhoneNumber: initialData.primaryPhoneNumber || "",
                    secondaryPhoneNumber: initialData.secondaryPhoneNumber || "",
                    role: initialData.role || "",
                    dateOfBirth: initialData.dateOfBirth || "",
                    gender: initialData.gender || "",
                    employmentType: initialData.employmentType || "",
                    spokenLanguages: initialData.spokenLanguages || "",
                    skills: initialData.skills || "",
                    address: initialData.address || "",
                    image: initialData.image || null,
                });
                // Set image preview if imageUrl is provided
                if (initialData.imageUrl) {
                    setImagePreview(initialData.imageUrl);
                } else {
                    setImagePreview(null);
                }
                setSelectedImage(initialData.image || null);
            } else {
                // Add mode - reset form
                setFormData({
                    salutation: "",
                    fullName: "",
                    email: "",
                    primaryPhoneNumber: "",
                    secondaryPhoneNumber: "",
                    role: "",
                    dateOfBirth: "",
                    gender: "",
                    employmentType: "",
                    spokenLanguages: "",
                    skills: "",
                    address: "",
                    image: null,
                });
                setSelectedImage(null);
                setImagePreview(null);
            }
            setErrors({});
        }
    }, [isOpen, initialData]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setFormData({ ...formData, image: null });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof StaffFormData, string>> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = "Please enter a valid email address";
            }
        }
        if (!formData.primaryPhoneNumber.trim()) {
            newErrors.primaryPhoneNumber = "Primary phone number is required";
        }
        if (!formData.role) {
            newErrors.role = "Role is required";
        }
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = "Date of birth is required";
        }
        if (!formData.gender) {
            newErrors.gender = "Gender is required";
        }
        if (!formData.employmentType) {
            newErrors.employmentType = "Employment type is required";
        }
        if (!formData.spokenLanguages.trim()) {
            newErrors.spokenLanguages = "Spoken languages is required";
        }
        if (!formData.skills.trim()) {
            newErrors.skills = "Skills is required";
        }
        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        if (onSubmit) {
            onSubmit(formData);
        }

        toast({
            title: isUpdateMode ? "Staff Updated" : "Staff Added",
            description: isUpdateMode
                ? "Staff member has been updated successfully."
                : "New staff member has been added successfully.",
        });

        // Reset form only if not in update mode
        if (!isUpdateMode) {
            setFormData({
                salutation: "",
                fullName: "",
                email: "",
                primaryPhoneNumber: "",
                secondaryPhoneNumber: "",
                role: "",
                dateOfBirth: "",
                gender: "",
                employmentType: "",
                spokenLanguages: "",
                skills: "",
                address: "",
                image: null,
            });
            setSelectedImage(null);
            setImagePreview(null);
        }
        setErrors({});
        onClose();
    };

    const handleCancel = () => {
        // Reset form only if not in update mode
        if (!isUpdateMode) {
            setFormData({
                salutation: "",
                fullName: "",
                email: "",
                primaryPhoneNumber: "",
                secondaryPhoneNumber: "",
                role: "",
                dateOfBirth: "",
                gender: "",
                employmentType: "",
                spokenLanguages: "",
                skills: "",
                address: "",
                image: null,
            });
            setSelectedImage(null);
            setImagePreview(null);
        }
        setErrors({});
        onClose();
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[800px] overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <SheetTitle>{isUpdateMode ? "Update Staff" : "Add Staff"}</SheetTitle>
                    </div>
                </SheetHeader>
                <div className="space-y-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="salutation">Salutation</Label>
                                <Select
                                    value={formData.salutation}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, salutation: value });
                                        if (errors.salutation) {
                                            setErrors({ ...errors, salutation: undefined });
                                        }
                                    }}
                                >
                                    <SelectTrigger id="salutation">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {salutations.map((salutation) => (
                                            <SelectItem key={salutation} value={salutation}>
                                                {salutation}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData({ ...formData, email: e.target.value });
                                        if (errors.email) {
                                            setErrors({ ...errors, email: undefined });
                                        }
                                    }}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="secondaryPhoneNumber">Secondary Phone Number</Label>
                                <Input
                                    id="secondaryPhoneNumber"
                                    placeholder="Secondary Phone Number"
                                    value={formData.secondaryPhoneNumber}
                                    onChange={(e) => setFormData({ ...formData, secondaryPhoneNumber: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">
                                    Gender <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, gender: value });
                                        if (errors.gender) {
                                            setErrors({ ...errors, gender: undefined });
                                        }
                                    }}
                                >
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {genders.map((gender) => (
                                            <SelectItem key={gender} value={gender}>
                                                {gender}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.gender && (
                                    <p className="text-sm text-destructive">{errors.gender}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employmentType">
                                    Employment Type <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={formData.employmentType}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, employmentType: value });
                                        if (errors.employmentType) {
                                            setErrors({ ...errors, employmentType: undefined });
                                        }
                                    }}
                                >
                                    <SelectTrigger id="employmentType">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employmentTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.employmentType && (
                                    <p className="text-sm text-destructive">{errors.employmentType}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skills">
                                    Skills <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="skills"
                                    placeholder="Skills"
                                    value={formData.skills}
                                    onChange={(e) => {
                                        setFormData({ ...formData, skills: e.target.value });
                                        if (errors.skills) {
                                            setErrors({ ...errors, skills: undefined });
                                        }
                                    }}
                                />
                                {errors.skills && (
                                    <p className="text-sm text-destructive">{errors.skills}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">
                                    Address <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="address"
                                    placeholder="Address"
                                    value={formData.address}
                                    onChange={(e) => {
                                        setFormData({ ...formData, address: e.target.value });
                                        if (errors.address) {
                                            setErrors({ ...errors, address: undefined });
                                        }
                                    }}
                                    rows={3}
                                    className="resize-none"
                                />
                                {errors.address && (
                                    <p className="text-sm text-destructive">{errors.address}</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">
                                    Full Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="fullName"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={(e) => {
                                        setFormData({ ...formData, fullName: e.target.value });
                                        if (errors.fullName) {
                                            setErrors({ ...errors, fullName: undefined });
                                        }
                                    }}
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-destructive">{errors.fullName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="primaryPhoneNumber">
                                    Primary Phone Number <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="primaryPhoneNumber"
                                    placeholder="Primary Phone Number"
                                    value={formData.primaryPhoneNumber}
                                    onChange={(e) => {
                                        setFormData({ ...formData, primaryPhoneNumber: e.target.value });
                                        if (errors.primaryPhoneNumber) {
                                            setErrors({ ...errors, primaryPhoneNumber: undefined });
                                        }
                                    }}
                                />
                                {errors.primaryPhoneNumber && (
                                    <p className="text-sm text-destructive">{errors.primaryPhoneNumber}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">
                                    Role <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => {
                                        setFormData({ ...formData, role: value });
                                        if (errors.role) {
                                            setErrors({ ...errors, role: undefined });
                                        }
                                    }}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="text-sm text-destructive">{errors.role}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">
                                    Date of Birth <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => {
                                        setFormData({ ...formData, dateOfBirth: e.target.value });
                                        if (errors.dateOfBirth) {
                                            setErrors({ ...errors, dateOfBirth: undefined });
                                        }
                                    }}
                                />
                                {errors.dateOfBirth && (
                                    <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="spokenLanguages">
                                    Spoken Languages <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="spokenLanguages"
                                    placeholder="Spoken Languages"
                                    value={formData.spokenLanguages}
                                    onChange={(e) => {
                                        setFormData({ ...formData, spokenLanguages: e.target.value });
                                        if (errors.spokenLanguages) {
                                            setErrors({ ...errors, spokenLanguages: undefined });
                                        }
                                    }}
                                />
                                {errors.spokenLanguages && (
                                    <p className="text-sm text-destructive">{errors.spokenLanguages}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="image">Upload Image</Label>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        ref={fileInputRef}
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {selectedImage ? selectedImage.name : "No file chosen"}
                                    </p>
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded-md border"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2"
                                                onClick={handleRemoveImage}
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

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            {isUpdateMode ? "Update" : "Submit"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default AddStaffForm;

