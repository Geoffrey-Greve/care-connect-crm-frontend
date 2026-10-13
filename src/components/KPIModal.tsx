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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type KPIResponseType = "Yes/No" | "Text Box";

export interface KPIModalData {
  id?: string;
  title: string;
  type: "KPI" | "sub KPI";
  parentKPI?: string;
  status: "Active" | "Inactive";
  responseType: KPIResponseType;
}

interface KPIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  data?: KPIModalData;
  parentKPIOptions?: string[];
  onSubmit: (data: KPIModalData) => void;
}

const DEFAULT_FORM_STATE: KPIModalData = {
  title: "",
  type: "KPI",
  parentKPI: "",
  status: "Active",
  responseType: "Yes/No",
};

export default function KPIModal({
  open,
  onOpenChange,
  mode,
  data,
  parentKPIOptions = [],
  onSubmit,
}: KPIModalProps) {
  const [formData, setFormData] = useState<KPIModalData>(DEFAULT_FORM_STATE);

  useEffect(() => {
    if (open) {
      if ((mode === "edit" || mode === "view") && data) {
        setFormData({
          ...DEFAULT_FORM_STATE,
          ...data,
          responseType: data.responseType ?? "Yes/No",
        });
      } else {
        // Reset form for create mode
        setFormData(DEFAULT_FORM_STATE);
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
            {mode === "create" && "New KPI Title"}
            {mode === "edit" && "Edit KPI Title"}
            {mode === "view" && "View KPI Title"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" && "Create a new KPI or Sub KPI title"}
            {mode === "edit" && "Update the KPI title information"}
            {mode === "view" && "View KPI title details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter KPI title"
                required
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "KPI" | "sub KPI") =>
                  setFormData({
                    ...formData,
                    type: value,
                    parentKPI: value === "KPI" ? "" : formData.parentKPI,
                  })
                }
                disabled={isReadOnly}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KPI">KPI</SelectItem>
                  <SelectItem value="sub KPI">Sub KPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "sub KPI" && (
              <div className="space-y-2">
                <Label htmlFor="parentKPI">Parent KPI *</Label>
                <Select
                  value={formData.parentKPI || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentKPI: value })
                  }
                  disabled={isReadOnly}
                  required={formData.type === "sub KPI"}
                >
                  <SelectTrigger id="parentKPI">
                    <SelectValue placeholder="Select parent KPI" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentKPIOptions.length > 0 ? (
                      parentKPIOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No parent KPIs available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Response Type *</Label>
              <RadioGroup
                value={formData.responseType}
                onValueChange={(value) => {
                  if (isReadOnly) return;
                  const nextValue = value as KPIResponseType;
                  setFormData((prev) => ({
                    ...prev,
                    responseType: nextValue,
                  }));
                }}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Yes/No"
                    id="response-yesno"
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="response-yesno" className="font-normal">
                    Yes/No
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Text Box"
                    id="response-text"
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="response-text" className="font-normal">
                    Text Box
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "Active" | "Inactive") =>
                  setFormData({ ...formData, status: value })
                }
                disabled={isReadOnly}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
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

