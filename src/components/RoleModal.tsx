import { useEffect, useState } from "react";
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

export interface RoleModalData {
  id?: string;
  roleName: string;
}

interface RoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit";
  data?: RoleModalData;
  onSubmit: (data: RoleModalData) => void;
}

export default function RoleModal({ open, onOpenChange, mode, data, onSubmit }: RoleModalProps) {
  const [formData, setFormData] = useState<RoleModalData>({
    roleName: "",
  });

  useEffect(() => {
    if (open) {
      setFormData(
        data || {
          roleName: "",
        },
      );
    }
  }, [open, data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "edit") {
      onSubmit(formData);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? "View Role" : "Update Role Name"}</DialogTitle>
          <DialogDescription>
            {isReadOnly ? "Review the role name." : "Only role name can be updated from here."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">
                Role Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="roleName"
                value={formData.roleName}
                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                placeholder="Enter role name"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && <Button type="submit">Save Changes</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


