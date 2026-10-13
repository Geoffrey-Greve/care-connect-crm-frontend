import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface DocumentUploadFormData {
    documentName: string;
    file: File | null;
}

interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: DocumentUploadFormData) => void;
    initialData?: Partial<DocumentUploadFormData> & { documentUrl?: string }; // For update mode
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {
    const isUpdateMode = !!initialData;
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<DocumentUploadFormData>({
        documentName: "",
        file: null,
    });
    const [errors, setErrors] = useState<{
        documentName?: string;
        file?: string;
    }>({});

    // Initialize form data when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Update mode - populate form with existing data
                setFormData({
                    documentName: initialData.documentName || "",
                    file: initialData.file || null,
                });
            } else {
                // Add mode - reset form
                setFormData({
                    documentName: "",
                    file: null,
                });
            }
            setErrors({});
        }
    }, [isOpen, initialData]);

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!formData.documentName.trim()) {
            newErrors.documentName = "Document name is required";
        }

        // File is only required for new uploads, not updates
        if (!isUpdateMode && !formData.file) {
            newErrors.file = "Document file is required";
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

        handleClose();
    };

    const handleClose = () => {
        setFormData({
            documentName: "",
            file: null,
        });
        setErrors({});
        // Clear the file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        // Auto-fill document name from file name
        if (file) {
            // Remove file extension for document name
            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            setFormData(prev => ({
                ...prev,
                file,
                // Update document name to new file name (without extension) when file changes
                documentName: fileNameWithoutExt
            }));
        } else {
            setFormData(prev => ({ ...prev, file: null }));
        }
        if (errors.file) {
            setErrors(prev => ({ ...prev, file: undefined }));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isUpdateMode ? "Update Document" : "Upload Document"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="upload-file">
                            Document File {!isUpdateMode && <span className="text-destructive">*</span>}
                        </Label>
                        <Input
                            ref={fileInputRef}
                            id="upload-file"
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.txt"
                        />
                        <p className="text-xs text-muted-foreground">
                            Supported: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX, TXT (max 10MB)
                        </p>
                        {isUpdateMode && initialData?.documentUrl && !formData.file && (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm flex-1 truncate">
                                    Current: {initialData.documentName || "Document"}
                                </span>
                            </div>
                        )}
                        {formData.file && (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm flex-1 truncate">{formData.file.name}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                        setFormData({ ...formData, file: null });
                                        // Clear the file input value
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        {errors.file && (
                            <p className="text-sm text-destructive">{errors.file}</p>
                        )}
                    </div>

                    {/* <div className="space-y-2">
                        <Label htmlFor="upload-document-name">
                            Document Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="upload-document-name"
                            value={formData.documentName}
                            onChange={(e) => {
                                setFormData({ ...formData, documentName: e.target.value });
                                if (errors.documentName) {
                                    setErrors({ ...errors, documentName: undefined });
                                }
                            }}
                            placeholder="Enter document name"
                        />
                        {errors.documentName && (
                            <p className="text-sm text-destructive">{errors.documentName}</p>
                        )}
                    </div> */}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {isUpdateMode ? "Update" : "Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DocumentUploadModal;

