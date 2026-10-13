import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export interface LeaveFormData {
  staffId: string;
  startDate: string; // ISO format YYYY-MM-DD
  endDate: string; // ISO format YYYY-MM-DD
  allDay: boolean;
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  reason: string;
}

interface LeaveFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveFormData) => void;
  header: string;
  staffList: Array<{ id: string; name: string }>;
}

const LeaveForm: React.FC<LeaveFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  staffList,
  header,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<LeaveFormData>({
    staffId: "",
    startDate: "",
    endDate: "",
    allDay: true,
    startTime: "",
    endTime: "",
    reason: "",
  });
  const [errors, setErrors] = useState<{
    staffId?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    reason?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        staffId: "",
        startDate: "",
        endDate: "",
        allDay: true,
        startTime: "",
        endTime: "",
        reason: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.staffId) {
      newErrors.staffId = "Carer is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    // Validate date range
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = "End date must be after or equal to start date";
      }
    }

    // Validate time fields if not all day
    if (!formData.allDay) {
      if (!formData.startTime) {
        newErrors.startTime = "Start time is required";
      }
      if (!formData.endTime) {
        newErrors.endTime = "End time is required";
      }

      // Validate time range
      if (formData.startTime && formData.endTime) {
        const [startHour, startMin] = formData.startTime.split(':').map(Number);
        const [endHour, endMin] = formData.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        // If same date, end time must be after start time
        if (formData.startDate === formData.endDate && endMinutes <= startMinutes) {
          newErrors.endTime = "End time must be after start time";
        }
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required";
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
      startDate: "",
      endDate: "",
      allDay: true,
      startTime: "",
      endTime: "",
      reason: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="carer-select">
              Choose Carer <span className="text-destructive">*</span>
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
              <SelectTrigger id="carer-select">
                <SelectValue placeholder="Select carer" />
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
            <Label>Unavailable Dates <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date" className="text-sm text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value });
                    if (errors.startDate) {
                      setErrors({ ...errors, startDate: undefined });
                    }
                    // Auto-set end date if not set or if end date is before new start date
                    if (!formData.endDate || e.target.value > formData.endDate) {
                      setFormData(prev => ({ ...prev, endDate: e.target.value }));
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">{errors.startDate}</p>
                )}
              </div>
              <div>
                <Label htmlFor="end-date" className="text-sm text-muted-foreground">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value });
                    if (errors.endDate) {
                      setErrors({ ...errors, endDate: undefined });
                    }
                  }}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="all-day-switch">All Day</Label>
              <Switch
                id="all-day-switch"
                checked={formData.allDay}
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, allDay: checked });
                  // Clear time errors when toggling
                  if (checked) {
                    setErrors(prev => ({ ...prev, startTime: undefined, endTime: undefined }));
                  }
                }}
              />
            </div>
            {!formData.allDay && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <Label htmlFor="start-time">
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => {
                      setFormData({ ...formData, startTime: e.target.value });
                      if (errors.startTime) {
                        setErrors({ ...errors, startTime: undefined });
                      }
                    }}
                  />
                  {errors.startTime && (
                    <p className="text-sm text-destructive mt-1">{errors.startTime}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="end-time">
                    End Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => {
                      setFormData({ ...formData, endTime: e.target.value });
                      if (errors.endTime) {
                        setErrors({ ...errors, endTime: undefined });
                      }
                    }}
                  />
                  {errors.endTime && (
                    <p className="text-sm text-destructive mt-1">{errors.endTime}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => {
                setFormData({ ...formData, reason: e.target.value });
                if (errors.reason) {
                  setErrors({ ...errors, reason: undefined });
                }
              }}
              placeholder="Enter reason for leave..."
              rows={4}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveForm;

