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

export interface PaymentMethodData {
  brand: string;
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
}

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PaymentMethodData;
  onSubmit: (data: PaymentMethodData) => void;
}

export default function PaymentMethodModal({
  open,
  onOpenChange,
  data,
  onSubmit,
}: PaymentMethodModalProps) {
  const [formData, setFormData] = useState<PaymentMethodData>(data);

  useEffect(() => {
    if (open) {
      setFormData(data);
    }
  }, [open, data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/.{1,4}/g);
    return matches ? matches.join(" ") : v;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  const formatCVC = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 4);
  };

  const cardBrands = [
    { id: "visa", name: "Visa", color: "bg-blue-600" },
    { id: "mastercard", name: "Mastercard", color: "bg-red-500" },
    { id: "amex", name: "Amex", color: "bg-blue-500" },
    // { id: "discover", name: "Discover", color: "bg-orange-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Payment Method</DialogTitle>
          <DialogDescription>Update your payment method information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Card Brand <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-3">
                {cardBrands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, brand: brand.id })}
                    className={`flex-1 h-12 rounded-lg border-2 transition-all ${
                      formData.brand === brand.id
                        ? "border-black bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`${brand.color} h-full rounded-md flex items-center justify-center`}>
                      <span className="text-white font-semibold text-sm">{brand.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardHolderName">
                Card Holder Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cardHolderName"
                value={formData.cardHolderName}
                onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">
                Card Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  setFormData({ ...formData, cardNumber: formatted });
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">
                  Expiry Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="expiryDate"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    setFormData({ ...formData, expiryDate: formatted });
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">
                  CVC <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cvc"
                  type="password"
                  value={formData.cvc}
                  onChange={(e) => {
                    const formatted = formatCVC(e.target.value);
                    setFormData({ ...formData, cvc: formatted });
                  }}
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

