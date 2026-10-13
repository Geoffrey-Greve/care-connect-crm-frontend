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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface AllowanceModalData {
  id?: string;
  title: string;
  allowancesType: string;
  value: number;
  externalIdCode: number;
  externalId: number;
}

interface AllowanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  data?: AllowanceModalData;
  onSubmit: (data: AllowanceModalData) => void;
}

const allowanceTypeOptions = [
  "Expense",
  "Mileage/Travel",
  "Override payitems",
  "Override hours",
  "One-off",
];

export default function AllowanceModal({
  open,
  onOpenChange,
  mode,
  data,
  onSubmit,
}: AllowanceModalProps) {
  const [formData, setFormData] = useState<AllowanceModalData>({
    title: "",
    allowancesType: "",
    value: 0,
    externalIdCode: 0,
    externalId: 0,
  });

  useEffect(() => {
    if (open) {
      if (mode === "edit" || mode === "view") {
        setFormData(
          data || {
            title: "",
            allowancesType: "",
            value: 0,
            externalIdCode: 0,
            externalId: 0,
          }
        );
      } else {
        // Reset form for create mode
        setFormData({
          title: "",
          allowancesType: "",
          value: 0,
          externalIdCode: 0,
          externalId: 0,
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "New Allowance"}
            {mode === "edit" && "Edit Allowance"}
            {mode === "view" && "View Allowance"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" && "Create a new allowance"}
            {mode === "edit" && "Update the allowance information"}
            {mode === "view" && "View allowance details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter title"
                required
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowancesType">
                Allowances Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.allowancesType}
                onValueChange={(value) =>
                  setFormData({ ...formData, allowancesType: value })
                }
                required
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select allowances type" />
                </SelectTrigger>
                <SelectContent>
                  {allowanceTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">
                Value <span className="text-destructive">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: Number(e.target.value) })
                }
                placeholder="Enter value"
                required
                disabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="externalIdCode">
                  External ID Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="externalIdCode"
                  type="number"
                  value={formData.externalIdCode}
                  onChange={(e) =>
                    setFormData({ ...formData, externalIdCode: Number(e.target.value) })
                  }
                  placeholder="Enter external ID code"
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="externalId">
                  External ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="externalId"
                  type="number"
                  value={formData.externalId}
                  onChange={(e) =>
                    setFormData({ ...formData, externalId: Number(e.target.value) })
                  }
                  placeholder="Enter external ID"
                  required
                  disabled={isReadOnly}
                />
              </div>
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

