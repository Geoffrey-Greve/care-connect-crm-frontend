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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ReferenceModalData {
  id?: string;
  itemName: string;
  travelItemNumber: string;
  type: string;
}

interface ReferenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  data?: ReferenceModalData;
  typeOptions?: string[];
  onSubmit: (data: ReferenceModalData) => void;
}

export default function ReferenceModal({
  open,
  onOpenChange,
  mode,
  data,
  typeOptions = [],
  onSubmit,
}: ReferenceModalProps) {
  const [formData, setFormData] = useState<ReferenceModalData>({
    itemName: "",
    travelItemNumber: "",
    type: "",
  });

  useEffect(() => {
    if (open) {
      if (mode === "edit" || mode === "view") {
        setFormData(data || {
          itemName: "",
          travelItemNumber: "",
          type: "",
        });
      } else {
        // Reset form for create mode
        setFormData({
          itemName: "",
          travelItemNumber: "",
          type: "",
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
            {mode === "create" && "New Reference"}
            {mode === "edit" && "Edit Reference"}
            {mode === "view" && "View Reference"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" && "Create a new reference item"}
            {mode === "edit" && "Update the reference information"}
            {mode === "view" && "View reference details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={(e) =>
                  setFormData({ ...formData, itemName: e.target.value })
                }
                placeholder="Enter item name"
                required
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="travelItemNumber">Travel Item Number *</Label>
              <Input
                id="travelItemNumber"
                value={formData.travelItemNumber}
                onChange={(e) =>
                  setFormData({ ...formData, travelItemNumber: e.target.value })
                }
                placeholder="Enter travel item number"
                required
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
                disabled={isReadOnly}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

