import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ArchiveConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isArchived: boolean;
    entityType?: string; // e.g., "client", "staff", "employee"
}

const ArchiveConfirmationModal: React.FC<ArchiveConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isArchived,
    entityType = "client",
}) => {
    const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    const entityListName = entityType === "staff" ? "staff list" : `${entityType} list`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        Are you sure to update the archive status?
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        {isArchived
                            ? `This will unarchive the ${entityType} and make them visible in your ${entityListName} again.`
                            : `This will archive the ${entityType} and you will not be able to see this ${entityType} in your list. If you do wish to access the ${entityType}, please go to the Archive menu.`}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        onClick={onConfirm}
                        variant={isArchived ? "default" : "destructive"}
                    >
                        {isArchived ? "Unarchive" : "Archive"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ArchiveConfirmationModal;

