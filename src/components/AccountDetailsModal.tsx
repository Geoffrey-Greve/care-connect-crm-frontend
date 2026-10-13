import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AccountDetails {
  accountName: string;
  accountNumber: string;
  bsb: string;
}

interface AccountDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AccountDetails;
  onSave: (data: AccountDetails) => void;
}

export default function AccountDetailsModal({
  open,
  onOpenChange,
  data,
  onSave,
}: AccountDetailsModalProps) {
  const [formData, setFormData] = useState<AccountDetails>({
    accountName: "",
    accountNumber: "",
    bsb: "",
  });

  useEffect(() => {
    if (open) {
      setFormData(data);
    }
  }, [open, data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Account Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">
                Account Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
                placeholder="Enter account name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">
                Account Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
                placeholder="Enter account number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bsb">
                BSB <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bsb"
                value={formData.bsb}
                onChange={(e) =>
                  setFormData({ ...formData, bsb: e.target.value })
                }
                placeholder="Enter BSB"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

