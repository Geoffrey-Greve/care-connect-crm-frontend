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
import { Checkbox } from "@/components/ui/checkbox";

export interface PriceBookModalData {
  id?: string;
  priceBookName: string;
  externalId: string;
  financialYear: string; // Auto-calculated, not shown in form
  fixedPrices: boolean;
  providerTravel: boolean;
}

interface PriceBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  data?: PriceBookModalData;
  onSubmit: (data: PriceBookModalData) => void;
}

export default function PriceBookModal({
  open,
  onOpenChange,
  mode,
  data,
  onSubmit,
}: PriceBookModalProps) {
  // Get current financial year (Australian financial year: July 1 to June 30)
  const getCurrentFinancialYear = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    
    // If month is July (6) or later, financial year starts this year
    // Otherwise, it started last year
    if (month >= 6) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };

  const [formData, setFormData] = useState<PriceBookModalData>({
    priceBookName: "",
    externalId: "",
    financialYear: getCurrentFinancialYear(),
    fixedPrices: false,
    providerTravel: false,
  });

  useEffect(() => {
    if (open) {
      if (mode === "edit" || mode === "view") {
        setFormData(data || {
          priceBookName: "",
          externalId: "",
          financialYear: getCurrentFinancialYear(),
          fixedPrices: false,
          providerTravel: false,
        });
      } else {
        // Reset form for create mode with auto financial year
        setFormData({
          priceBookName: "",
          externalId: "",
          financialYear: getCurrentFinancialYear(),
          fixedPrices: false,
          providerTravel: false,
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
            {mode === "create" && "New Price Book"}
            {mode === "edit" && "Edit Price Book"}
            {mode === "view" && "View Price Book"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" && "Create a new price book"}
            {mode === "edit" && "Update the price book information"}
            {mode === "view" && "View price book details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="priceBookName">
                Price Book Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="priceBookName"
                value={formData.priceBookName}
                onChange={(e) =>
                  setFormData({ ...formData, priceBookName: e.target.value })
                }
                placeholder="Enter price book name"
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
                value={formData.externalId}
                onChange={(e) =>
                  setFormData({ ...formData, externalId: e.target.value })
                }
                placeholder="Enter external ID"
                required
                disabled={isReadOnly}
              />
            </div>

            {isReadOnly && (
              <div className="space-y-2">
                <Label htmlFor="financialYear">Financial Year</Label>
                <Input
                  id="financialYear"
                  value={formData.financialYear}
                  disabled
                  readOnly
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fixedPrices">Fixed Prices</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fixedPrices"
                  checked={formData.fixedPrices}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, fixedPrices: checked === true })
                  }
                  disabled={isReadOnly}
                />
                <Label htmlFor="fixedPrices" className="cursor-pointer font-normal">
                  {formData.fixedPrices ? "Yes" : "No"}
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerTravel">Provider Travel</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="providerTravel"
                  checked={formData.providerTravel}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, providerTravel: checked === true })
                  }
                  disabled={isReadOnly}
                />
                <Label htmlFor="providerTravel" className="cursor-pointer font-normal">
                  {formData.providerTravel ? "Yes" : "No"}
                </Label>
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

