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

export interface PriceFormModalData {
  id?: string;
  dayOfWeek: string;
  itemNo: string;
  effectiveDate: string;
  startTime: string;
  endTime: string;
  perKm: string;
  multiplier: string;
  pricePerHour: string;
  transportReferenceNo: string;
}

interface PriceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  data?: PriceFormModalData;
  onSubmit: (data: PriceFormModalData) => void;
}

const dayOfWeekOptions = [
  "Weekdays - Mon Tue Wed Thu Fri",
  "Saturday",
  "Sunday",
  "Public Holidays",
  "Sleepover",
];

const multiplierOptions = ["1:1", "1:2", "1:3", "2:1", "3:1"];

export default function PriceFormModal({
  open,
  onOpenChange,
  mode,
  data,
  onSubmit,
}: PriceFormModalProps) {
  const [formData, setFormData] = useState<PriceFormModalData>({
    dayOfWeek: "",
    itemNo: "",
    effectiveDate: "",
    startTime: "00:00",
    endTime: "00:00",
    perKm: "",
    multiplier: "1:1",
    pricePerHour: "",
    transportReferenceNo: "",
  });

  useEffect(() => {
    if (open) {
      if (mode === "edit" || mode === "view") {
        setFormData(
          data || {
            dayOfWeek: "",
            itemNo: "",
            effectiveDate: "",
            startTime: "00:00",
            endTime: "00:00",
            perKm: "",
            multiplier: "1:1",
            pricePerHour: "",
            transportReferenceNo: "",
          }
        );
      } else {
        // Reset form for create mode
        setFormData({
          dayOfWeek: "",
          itemNo: "",
          effectiveDate: "",
          startTime: "00:00",
          endTime: "00:00",
          perKm: "",
          multiplier: "1:1",
          pricePerHour: "",
          transportReferenceNo: "",
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>NDIS Import</DialogTitle>
          <DialogDescription>
            {mode === "create" && "Create a new price entry"}
            {mode === "edit" && "Update the price entry"}
            {mode === "view" && "View price entry details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Warning Message */}
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">
                Note: Please avoid duplicate prices, as they affect the invoice.
              </p>
            </div>

            {/* Three Column Layout */}
            <div className="grid grid-cols-3 gap-6">
              {/* Column 1 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">
                    Day of Week <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.dayOfWeek}
                    onValueChange={(value) =>
                      setFormData({ ...formData, dayOfWeek: value })
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day of week" />
                    </SelectTrigger>
                    <SelectContent>
                      {dayOfWeekOptions.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemNo">
                    Item No <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="itemNo"
                    value={formData.itemNo}
                    onChange={(e) =>
                      setFormData({ ...formData, itemNo: e.target.value })
                    }
                    placeholder="Reference Number Hour"
                    required
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">
                    Effective Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) =>
                      setFormData({ ...formData, effectiveDate: e.target.value })
                    }
                    required
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Time <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      required
                      disabled={isReadOnly}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      required
                      disabled={isReadOnly}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perKm">
                    Per Km <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="perKm"
                    type="number"
                    value={formData.perKm}
                    onChange={(e) =>
                      setFormData({ ...formData, perKm: e.target.value })
                    }
                    placeholder="Per Km"
                    required
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="multiplier">
                    Multiplier <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.multiplier}
                      onValueChange={(value) =>
                        setFormData({ ...formData, multiplier: value })
                      }
                      disabled={true}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select multiplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {multiplierOptions.map((mult) => (
                          <SelectItem key={mult} value={mult}>
                            {mult}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerHour">
                    Price Per Hour ($) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    step="0.01"
                    value={formData.pricePerHour}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerHour: e.target.value })
                    }
                    placeholder="Per Hour"
                    required
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transportReferenceNo">
                    Transport Reference No. <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="transportReferenceNo"
                    value={formData.transportReferenceNo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transportReferenceNo: e.target.value,
                      })
                    }
                    placeholder="Reference Number"
                    required
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit">
                {isEditMode ? "Update" : "Submit"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

