import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface HolidayModalData {
  id?: string;
  holidayDate: string;
  holidayName: string;
}

interface HolidayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  data?: HolidayModalData;
  onSubmit: (data: HolidayModalData) => void;
}

export default function HolidayModal({
  open,
  onOpenChange,
  mode,
  data,
  onSubmit,
}: HolidayModalProps) {
  const [formData, setFormData] = useState<HolidayModalData>({
    holidayDate: "",
    holidayName: "",
  });

  useEffect(() => {
    if (open) {
      if (mode === "edit" || mode === "view") {
        setFormData(data || {
          holidayDate: "",
          holidayName: "",
        });
      } else {
        // Reset form for create mode
        setFormData({
          holidayDate: "",
          holidayName: "",
        });
      }
    }
  }, [open, mode, data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== "view") {
      onSubmit(formData);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const isReadOnly = mode === "view";
  const isEditMode = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "New Holiday"}
            {mode === "edit" && "Edit Holiday"}
            {mode === "view" && "View Holiday"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" && "Create a new public holiday"}
            {mode === "edit" && "Update the holiday information"}
            {mode === "view" && "View holiday details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="holidayDate">Holiday Date *</Label>
              <Input
                id="holidayDate"
                type="date"
                value={formData.holidayDate}
                onChange={(e) =>
                  setFormData({ ...formData, holidayDate: e.target.value })
                }
                required
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="holidayName">Holiday Name *</Label>
              <Input
                id="holidayName"
                value={formData.holidayName}
                onChange={(e) =>
                  setFormData({ ...formData, holidayName: e.target.value })
                }
                placeholder="Enter holiday name"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit">
                {isEditMode ? "Update" : "Create"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

