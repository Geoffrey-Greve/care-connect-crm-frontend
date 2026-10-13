import React, { useState } from 'react';
import { Plus, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ClientPublicInformationProps {
    clientName?: string;
}

interface NeedToKnowItem {
    id: string;
    heading: string;
}

interface UsefulInfoItem {
    id: string;
    heading: string;
}

const ClientPublicInformation: React.FC<ClientPublicInformationProps> = ({ clientName }) => {
    const { toast } = useToast();

    // General Information state
    const [generalInfo, setGeneralInfo] = useState("This is the current general information about the client. It can be updated using the Update button.");
    const [isGeneralInfoModalOpen, setIsGeneralInfoModalOpen] = useState(false);
    const [generalInfoText, setGeneralInfoText] = useState(generalInfo);

    // Need to Know Information state
    const [needToKnowItems, setNeedToKnowItems] = useState<NeedToKnowItem[]>([
        { id: "NTK-001", heading: "Allergies: Peanuts, Shellfish" },
        { id: "NTK-002", heading: "Medical Condition: Diabetes Type 2" },
        { id: "NTK-003", heading: "Emergency Contact: John Doe - 0400 123 456" },
    ]);
    const [isNeedToKnowModalOpen, setIsNeedToKnowModalOpen] = useState(false);
    const [newNeedToKnowHeading, setNewNeedToKnowHeading] = useState("");

    // Useful Information state
    const [usefulInfoItems, setUsefulInfoItems] = useState<UsefulInfoItem[]>([
        { id: "UI-001", heading: "Preferred Communication: Email" },
        { id: "UI-002", heading: "Language Preference: English" },
        { id: "UI-003", heading: "Transportation: Own Vehicle" },
    ]);
    const [isUsefulInfoModalOpen, setIsUsefulInfoModalOpen] = useState(false);
    const [newUsefulInfoHeading, setNewUsefulInfoHeading] = useState("");

    // General Information handlers
    const handleOpenGeneralInfoModal = () => {
        setGeneralInfoText(generalInfo);
        setIsGeneralInfoModalOpen(true);
    };

    const handleSaveGeneralInfo = () => {
        if (!generalInfoText.trim()) {
            toast({
                title: "Validation Error",
                description: "General information cannot be empty",
                variant: "destructive",
            });
            return;
        }

        setGeneralInfo(generalInfoText);
        setIsGeneralInfoModalOpen(false);
        toast({
            title: "General Information Updated",
            description: "General information has been updated successfully.",
        });
    };

    // Need to Know Information handlers
    const handleOpenNeedToKnowModal = () => {
        setNewNeedToKnowHeading("");
        setIsNeedToKnowModalOpen(true);
    };

    const handleSaveNeedToKnow = () => {
        if (!newNeedToKnowHeading.trim()) {
            toast({
                title: "Validation Error",
                description: "Heading cannot be empty",
                variant: "destructive",
            });
            return;
        }

        const newItem: NeedToKnowItem = {
            id: `NTK-${Date.now()}`,
            heading: newNeedToKnowHeading.trim(),
        };

        setNeedToKnowItems([...needToKnowItems, newItem]);
        setNewNeedToKnowHeading("");
        setIsNeedToKnowModalOpen(false);
        toast({
            title: "Item Added",
            description: "New 'Need to Know' information has been added successfully.",
        });
    };

    const handleDeleteNeedToKnow = (id: string) => {
        setNeedToKnowItems(needToKnowItems.filter(item => item.id !== id));
        toast({
            title: "Item Removed",
            description: "Item has been removed successfully.",
        });
    };

    // Useful Information handlers
    const handleOpenUsefulInfoModal = () => {
        setNewUsefulInfoHeading("");
        setIsUsefulInfoModalOpen(true);
    };

    const handleSaveUsefulInfo = () => {
        if (!newUsefulInfoHeading.trim()) {
            toast({
                title: "Validation Error",
                description: "Heading cannot be empty",
                variant: "destructive",
            });
            return;
        }

        const newItem: UsefulInfoItem = {
            id: `UI-${Date.now()}`,
            heading: newUsefulInfoHeading.trim(),
        };

        setUsefulInfoItems([...usefulInfoItems, newItem]);
        setNewUsefulInfoHeading("");
        setIsUsefulInfoModalOpen(false);
        toast({
            title: "Item Added",
            description: "New 'Useful Information' has been added successfully.",
        });
    };

    const handleDeleteUsefulInfo = (id: string) => {
        setUsefulInfoItems(usefulInfoItems.filter(item => item.id !== id));
        toast({
            title: "Item Removed",
            description: "Item has been removed successfully.",
        });
    };

    return (
        <>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Public Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Subsection 1: General Information */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">General Information</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenGeneralInfoModal}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Update
                            </Button>
                        </div>
                        <div className="p-4 bg-muted rounded-md">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {generalInfo}
                            </p>
                        </div>
                    </div>

                    {/* Subsection 2: Need to Know Information */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Need to Know Information</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenNeedToKnowModal}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {needToKnowItems.length > 0 ? (
                                needToKnowItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 bg-muted rounded-md group hover:bg-muted/80 transition-colors"
                                    >
                                        <p className="text-sm font-medium">{item.heading}</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteNeedToKnow(item.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                                    No "Need to Know" information available. Click "Add" to add new items.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Horizontal Divider */}
                    <div className="border-t border-border" />

                    {/* Subsection 3: Useful Information */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Useful Information</h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenUsefulInfoModal}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {usefulInfoItems.length > 0 ? (
                                usefulInfoItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 bg-muted rounded-md group hover:bg-muted/80 transition-colors"
                                    >
                                        <p className="text-sm font-medium">{item.heading}</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteUsefulInfo(item.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                                    No "Useful Information" available. Click "Add" to add new items.
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* General Information Update Modal */}
            <Dialog open={isGeneralInfoModalOpen} onOpenChange={setIsGeneralInfoModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Update General Information</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="general-info-description">Description</Label>
                            <Textarea
                                id="general-info-description"
                                value={generalInfoText}
                                onChange={(e) => setGeneralInfoText(e.target.value)}
                                placeholder="Enter general information description"
                                rows={8}
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGeneralInfoModalOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={handleSaveGeneralInfo}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Need to Know Information Add Modal */}
            <Dialog open={isNeedToKnowModalOpen} onOpenChange={setIsNeedToKnowModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Need to Know Information</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="need-to-know-heading">Add New Heading</Label>
                            <Input
                                id="need-to-know-heading"
                                value={newNeedToKnowHeading}
                                onChange={(e) => setNewNeedToKnowHeading(e.target.value)}
                                placeholder="Enter new heading"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNeedToKnowModalOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={handleSaveNeedToKnow}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Useful Information Add Modal */}
            <Dialog open={isUsefulInfoModalOpen} onOpenChange={setIsUsefulInfoModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Useful Information</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="useful-info-heading">Add Useful Information</Label>
                            <Input
                                id="useful-info-heading"
                                value={newUsefulInfoHeading}
                                onChange={(e) => setNewUsefulInfoHeading(e.target.value)}
                                placeholder="Enter useful information heading"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUsefulInfoModalOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={handleSaveUsefulInfo}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ClientPublicInformation;

