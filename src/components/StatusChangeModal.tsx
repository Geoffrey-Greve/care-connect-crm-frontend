import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface StatusChangeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  nameLabel: string;
  nameValue: string;
  currentStatus: string;
  statusOptions: string[];
  onConfirm: (newStatus: string) => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  nameLabel,
  nameValue,
  currentStatus,
  statusOptions,
  onConfirm,
}) => {
  const [newStatus, setNewStatus] = useState(currentStatus);

  // Update newStatus when currentStatus or modal opens
  useEffect(() => {
    if (isOpen) {
      setNewStatus(currentStatus);
    }
  }, [currentStatus, isOpen]);

  const handleConfirm = () => {
    onConfirm(newStatus);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{nameLabel}</Label>
            <div className="p-2 bg-muted rounded-md text-sm font-medium">
              {nameValue || ""}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status-select">Status</Label>
            <Select
              value={newStatus}
              onValueChange={setNewStatus}
            >
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeModal;

