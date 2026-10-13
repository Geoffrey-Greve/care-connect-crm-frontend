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

interface Tax {
  id: string;
  name: string;
  rate: string;
}

interface TaxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Tax[];
  onSave: (data: Tax[]) => void;
}

export default function TaxModal({
  open,
  onOpenChange,
  data,
  onSave,
}: TaxModalProps) {
  const [taxes, setTaxes] = useState<Tax[]>([]);

  useEffect(() => {
    if (open) {
      setTaxes(data.length > 0 ? [...data] : [{ id: "1", name: "", rate: "" }]);
    }
  }, [open, data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty taxes
    const validTaxes = taxes.filter(tax => tax.name.trim() !== "" && tax.rate.trim() !== "");
    onSave(validTaxes);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleTaxChange = (id: string, field: "name" | "rate", value: string) => {
    setTaxes(taxes.map(tax => 
      tax.id === id ? { ...tax, [field]: value } : tax
    ));
  };

  const addTax = () => {
    const newId = Date.now().toString();
    setTaxes([...taxes, { id: newId, name: "", rate: "" }]);
  };

  const removeTax = (id: string) => {
    if (taxes.length > 1) {
      setTaxes(taxes.filter(tax => tax.id !== id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Taxes</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {taxes.map((tax, index) => (
                <div key={tax.id} className="grid grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor={`tax-name-${tax.id}`}>
                      Name {index === 0 && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id={`tax-name-${tax.id}`}
                      value={tax.name}
                      onChange={(e) => handleTaxChange(tax.id, "name", e.target.value)}
                      placeholder="Enter tax name"
                      required={index === 0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`tax-rate-${tax.id}`}>
                      Rate % {index === 0 && <span className="text-destructive">*</span>}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`tax-rate-${tax.id}`}
                        type="number"
                        step="0.01"
                        value={tax.rate}
                        onChange={(e) => handleTaxChange(tax.id, "rate", e.target.value)}
                        placeholder="Enter rate"
                        required={index === 0}
                        className="flex-1"
                      />
                      {taxes.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTax(tax.id)}
                          className="px-3"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addTax}
              className="w-full"
            >
              Add Tax
            </Button>
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

