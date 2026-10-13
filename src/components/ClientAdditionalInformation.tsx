import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface ClientAdditionalInformationProps {
    privateInfo?: string;
    reviewDate?: string | Date;
    onUpdate?: (privateInfo: string, reviewDate: string) => void;
}

const ClientAdditionalInformation: React.FC<ClientAdditionalInformationProps> = ({
    privateInfo: initialPrivateInfo = "",
    reviewDate: initialReviewDate,
    onUpdate,
}) => {
    const { toast } = useToast();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        privateInfo: initialPrivateInfo,
        reviewDate: initialReviewDate
            ? typeof initialReviewDate === 'string'
                ? initialReviewDate
                : new Date(initialReviewDate).toISOString().split('T')[0]
            : "",
    });
    const [errors, setErrors] = useState<{
        privateInfo?: string;
        reviewDate?: string;
    }>({});

    // Update form data when props change
    useEffect(() => {
        setFormData({
            privateInfo: initialPrivateInfo,
            reviewDate: initialReviewDate
                ? typeof initialReviewDate === 'string'
                    ? initialReviewDate
                    : new Date(initialReviewDate).toISOString().split('T')[0]
                : "",
        });
    }, [initialPrivateInfo, initialReviewDate]);

    const handleOpenUpdateModal = () => {
        setFormData({
            privateInfo: initialPrivateInfo,
            reviewDate: initialReviewDate
                ? typeof initialReviewDate === 'string'
                    ? initialReviewDate
                    : new Date(initialReviewDate).toISOString().split('T')[0]
                : "",
        });
        setErrors({});
        setIsUpdateModalOpen(true);
    };

    const validateForm = (): boolean => {
        const newErrors: { privateInfo?: string; reviewDate?: string } = {};

        if (!formData.privateInfo.trim()) {
            newErrors.privateInfo = "Private information is required";
        }

        if (!formData.reviewDate) {
            newErrors.reviewDate = "Review date is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = () => {
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        // Call the onUpdate callback if provided
        if (onUpdate) {
            onUpdate(formData.privateInfo.trim(), formData.reviewDate);
        }

        setIsUpdateModalOpen(false);
        toast({
            title: "Additional Information Updated",
            description: "Private information and review date have been updated successfully.",
        });
    };

    const formatReviewDate = (date: string | Date | undefined): string => {
        if (!date) return "Not set";

        try {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return dateObj.toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return "Invalid date";
        }
    };

    return (
        <>
            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Additional Information</CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOpenUpdateModal}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Update
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="private" className="w-full">
                        <TabsContent value="private" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                                        Private Information
                                    </Label>
                                    <div className="p-4 bg-muted rounded-md min-h-[100px]">
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {initialPrivateInfo || "No private information available. Click 'Update' to add information."}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                                        Review Date
                                    </Label>
                                    <div className="p-4 bg-muted rounded-md">
                                        <p className="text-sm text-muted-foreground">
                                            {formatReviewDate(initialReviewDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Update Modal */}
            <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Update Additional Information</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="private-info">
                                Private Info <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="private-info"
                                value={formData.privateInfo}
                                onChange={(e) => {
                                    setFormData({ ...formData, privateInfo: e.target.value });
                                    if (errors.privateInfo) {
                                        setErrors({ ...errors, privateInfo: undefined });
                                    }
                                }}
                                placeholder="Enter private information"
                                rows={8}
                                className="resize-none"
                            />
                            {errors.privateInfo && (
                                <p className="text-sm text-destructive">{errors.privateInfo}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="review-date">
                                Review Date <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="review-date"
                                type="date"
                                value={formData.reviewDate}
                                onChange={(e) => {
                                    setFormData({ ...formData, reviewDate: e.target.value });
                                    if (errors.reviewDate) {
                                        setErrors({ ...errors, reviewDate: undefined });
                                    }
                                }}
                            />
                            {errors.reviewDate && (
                                <p className="text-sm text-destructive">{errors.reviewDate}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={handleUpdate}>
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ClientAdditionalInformation;

