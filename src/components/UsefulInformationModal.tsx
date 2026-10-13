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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlusIcon, Trash2Icon } from "lucide-react";

interface InformationItem {
  id: string;
  text: string;
  mandatory: boolean;
}

interface UsefulInformationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: InformationItem[];
  onSave: (data: InformationItem[]) => void;
}

export default function UsefulInformationModal({
  open,
  onOpenChange,
  data,
  onSave,
}: UsefulInformationModalProps) {
  const [items, setItems] = useState<InformationItem[]>([]);

  useEffect(() => {
    if (open) {
      setItems(data.length > 0 ? [...data] : []);
    }
  }, [open, data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty items
    const validItems = items.filter(item => item.text.trim() !== "");
    onSave(validItems);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleItemChange = (id: string, field: "text" | "mandatory", value: string | boolean) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    const newId = Date.now().toString();
    setItems([...items, { id: newId, text: "", mandatory: false }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Useful Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <Input
                    value={item.text}
                    onChange={(e) => handleItemChange(item.id, "text", e.target.value)}
                    placeholder="Enter information"
                    className="flex-1"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`mandatory-${item.id}`}
                      checked={item.mandatory}
                      onCheckedChange={(checked) =>
                        handleItemChange(item.id, "mandatory", checked === true)
                      }
                    />
                    <Label htmlFor={`mandatory-${item.id}`} className="cursor-pointer whitespace-nowrap">
                      Mandatory
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-white bg-red-500 hover:bg-red-500"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                   <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              size="sm"
            >
              <PlusIcon className="w-4 h-4" />
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

