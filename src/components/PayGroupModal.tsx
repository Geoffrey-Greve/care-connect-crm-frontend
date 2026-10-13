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

export interface PayGroupModalData {
  id?: string;
  payGroupName: string;
}

interface PayGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  data?: PayGroupModalData;
  onSubmit: (data: PayGroupModalData) => void;
}

export default function PayGroupModal({
  open,
  onOpenChange,
  mode,
  data,
  onSubmit,
}: PayGroupModalProps) {
  const [formData, setFormData] = useState<PayGroupModalData>({
    payGroupName: "",
  });

  useEffect(() => {
    if (open) {
      if (mode === "edit" || mode === "view") {
        setFormData(
          data || {
            payGroupName: "",
          }
        );
      } else {
        // Reset form for create mode
        setFormData({
          payGroupName: "",
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
            {mode === "create" && "New Pay Group"}
            {mode === "edit" && "Edit Pay Group"}
            {mode === "view" && "View Pay Group"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" && "Create a new pay group"}
            {mode === "edit" && "Update the pay group information"}
            {mode === "view" && "View pay group details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payGroupName">
                Pay Group Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="payGroupName"
                value={formData.payGroupName}
                onChange={(e) =>
                  setFormData({ ...formData, payGroupName: e.target.value })
                }
                placeholder="Enter pay group name"
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

