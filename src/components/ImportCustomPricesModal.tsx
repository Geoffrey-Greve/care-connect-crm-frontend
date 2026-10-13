import { useState, useRef } from "react";
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
import { Download, Info, X } from "lucide-react";

interface ImportCustomPricesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { effectiveDate: string; file: File | null }) => void;
}

export default function ImportCustomPricesModal({
  open,
  onOpenChange,
  onSubmit,
}: ImportCustomPricesModalProps) {
  const [effectiveDate, setEffectiveDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveDate) {
      return;
    }
    if (!selectedFile) {
      return;
    }
    onSubmit({ effectiveDate, file: selectedFile });
    handleClose();
  };

  const handleClose = () => {
    setEffectiveDate("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  const handleDownloadCustomPricesList = () => {
    // Create a sample CSV file for download
    const csvContent = `Financial Year,Service,External Id,Fixed Price,Provider Travel,Day of Week,Time,Price,Effective Date,Reference No,Price Per Km,Reference No KM,Multiplier
2024-2025,Service A,EXT001,Yes,No,Standard,All day,100.00,01/01/2024,REF001,2.50,REFKM001,1:1
2024-2025,Service B,EXT002,No,Yes,Saturday,Daytime,150.00,01/01/2024,REF002,3.00,REFKM002,1:1`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "custom_prices_list.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between">
            <DialogTitle>Import Custom Prices</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleDownloadCustomPricesList}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Custom Prices List
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">
                Effective Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="effectiveDate"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                placeholder="Effective Date"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="agreement">
                  Agreement <span className="text-destructive">*</span>
                </Label>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="agreement"
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-auto"
                >
                  Choose file
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </span>
              </div>
            </div>

            <p className="text-sm text-destructive">
              Follow the parameters of sample sheet only.
            </p>

            <div className="space-y-3">
              <p className="font-semibold text-sm">
                Kindly ensure that all field are mandotory as given in note:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Valid Financial Year</li>
                <li>Valid Service</li>
                <li>Valid External Id</li>
                <li>Specify Fixed Price (Yes/No)</li>
                <li>Specify Provider Travel (Yes/No)</li>
                <li>Specify Day of Week (Standard/Saturday/Sunday/Public Holiday)</li>
                <li>Specify Time (All day/Night/Daytime/Evening)</li>
                <li>Specify Price</li>
                <li>Specify Efficetive Date (MM/DD/YYYY)</li>
                <li>Specify Reference No</li>
                <li>Specify Price Per Km</li>
                <li>Specify Reference No KM</li>
                <li>Specify Multiplier (1:1)</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

