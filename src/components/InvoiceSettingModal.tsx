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
import RichTextEditor from "@/components/RichTextEditor";

interface InvoiceSettings {
  abn: string;
  address: string;
  phone: string;
  contactEmail: string;
  ndiaProviderNumber: string;
  transportRatePerKm: string;
  termsAndConditions: string;
}

interface InvoiceSettingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: InvoiceSettings;
  onSave: (data: InvoiceSettings) => void;
}

export default function InvoiceSettingModal({
  open,
  onOpenChange,
  data,
  onSave,
}: InvoiceSettingModalProps) {
  const [formData, setFormData] = useState<InvoiceSettings>({
    abn: "",
    address: "",
    phone: "",
    contactEmail: "",
    ndiaProviderNumber: "",
    transportRatePerKm: "",
    termsAndConditions: "",
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice Setting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="abn">
                    ABN <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="abn"
                    value={formData.abn}
                    onChange={(e) =>
                      setFormData({ ...formData, abn: e.target.value })
                    }
                    placeholder="Enter ABN"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ndiaProviderNumber">
                    NDIA provider or registration number
                  </Label>
                  <Input
                    id="ndiaProviderNumber"
                    value={formData.ndiaProviderNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, ndiaProviderNumber: e.target.value })
                    }
                    placeholder="Enter NDIA provider number"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Enter address"
                      required
                      className="pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-sm flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">G</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">
                    Contact email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    placeholder="Enter contact email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transportRatePerKm">
                    Transport Rate Per Km ($) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="transportRatePerKm"
                    type="number"
                    step="0.01"
                    value={formData.transportRatePerKm}
                    onChange={(e) =>
                      setFormData({ ...formData, transportRatePerKm: e.target.value })
                    }
                    placeholder="Enter transport rate"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Terms & Conditions - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
              <div className="relative">
                <RichTextEditor
                  value={formData.termsAndConditions}
                  onChange={(value) =>
                    setFormData({ ...formData, termsAndConditions: value })
                  }
                  placeholder="Enter terms and conditions..."
                  minHeight="200px"
                />
                <div className="absolute bottom-4 right-4 flex flex-col gap-0.5">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-sm flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">G</span>
                  </div>
                </div>
              </div>
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

