import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export interface NotificationFormData {
  staffId: string;
  message: string;
  type: string;
}

interface NotificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NotificationFormData) => void;
  initialData?: NotificationFormData;
  staffList: Array<{ id: string; name: string }>;
}

const notificationTypes = ["Reminder", "Document", "Schedule", "Training", "Compliance", "Alert"];

const NotificationForm: React.FC<NotificationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  staffList,
}) => {
  const isUpdateMode = !!initialData;
  const { toast } = useToast();
  const [formData, setFormData] = useState<NotificationFormData>({
    staffId: "",
    message: "",
    type: "",
  });
  const [errors, setErrors] = useState<{
    staffId?: string;
    message?: string;
    type?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          staffId: "",
          message: "",
          type: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.staffId) {
      newErrors.staffId = "Staff is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (!formData.type) {
      newErrors.type = "Type is required";
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

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      staffId: "",
      message: "",
      type: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isUpdateMode ? "Update Notification" : "Add Notification"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="staff-select">
              Staff <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.staffId}
              onValueChange={(value) => {
                setFormData({ ...formData, staffId: value });
                if (errors.staffId) {
                  setErrors({ ...errors, staffId: undefined });
                }
              }}
            >
              <SelectTrigger id="staff-select">
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.staffId && (
              <p className="text-sm text-destructive">{errors.staffId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-type">
              Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => {
                setFormData({ ...formData, type: value });
                if (errors.type) {
                  setErrors({ ...errors, type: undefined });
                }
              }}
            >
              <SelectTrigger id="notification-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="notification-message"
              value={formData.message}
              onChange={(e) => {
                setFormData({ ...formData, message: e.target.value });
                if (errors.message) {
                  setErrors({ ...errors, message: undefined });
                }
              }}
              placeholder="Enter notification message..."
              rows={4}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isUpdateMode ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationForm;

