import { useState, useEffect, useRef } from "react";
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
import { Image as ImageIcon, Upload, X } from "lucide-react";

export interface CompanyProfileData {
  companyName: string;
  mobile: string;
  state: string;
  companyAddress: string;
  contactName: string;
  phone: string;
  suburb: string;
  contactEmail: string;
  country: string;
  postcode: string;
  companyLogo?: string;
  hamburgerIcon?: string;
}

interface CompanyProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CompanyProfileData;
  onSubmit: (data: CompanyProfileData) => void;
}

export default function CompanyProfileModal({
  open,
  onOpenChange,
  data,
  onSubmit,
}: CompanyProfileModalProps) {
  const [formData, setFormData] = useState<CompanyProfileData>(data);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
  const [hamburgerIconPreview, setHamburgerIconPreview] = useState<string | null>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);
  const hamburgerIconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFormData(data);
      setCompanyLogoPreview(data.companyLogo || null);
      setHamburgerIconPreview(data.hamburgerIcon || null);
    }
  }, [open, data]);

  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setCompanyLogoPreview(result);
          setFormData({ ...formData, companyLogo: result });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleHamburgerIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setHamburgerIconPreview(result);
          setFormData({ ...formData, hamburgerIcon: result });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveCompanyLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCompanyLogoPreview(null);
    setFormData({ ...formData, companyLogo: undefined });
    if (companyLogoInputRef.current) {
      companyLogoInputRef.current.value = "";
    }
  };

  const handleRemoveHamburgerIcon = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHamburgerIconPreview(null);
    setFormData({ ...formData, hamburgerIcon: undefined });
    if (hamburgerIconInputRef.current) {
      hamburgerIconInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Company Profile</DialogTitle>
          <DialogDescription>Update your company profile information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Logo Upload Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-3">
                  <div className="relative w-[70px] h-[70px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    {companyLogoPreview ? (
                      <>
                        <img
                          src={companyLogoPreview}
                          alt="Company Logo"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveCompanyLogo}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={companyLogoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCompanyLogoChange}
                      className="hidden"
                      id="company-logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => companyLogoInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hamburger Icon</Label>
                <div className="flex items-center gap-3">
                  <div className="relative w-[70px] h-[70px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    {hamburgerIconPreview ? (
                      <>
                        <img
                          src={hamburgerIconPreview}
                          alt="Hamburger Icon"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveHamburgerIcon}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">70x70</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={hamburgerIconInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHamburgerIconChange}
                      className="hidden"
                      id="hamburger-icon-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => hamburgerIconInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Input
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suburb">Suburb</Label>
                <Input
                  id="suburb"
                  value={formData.suburb}
                  onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  Contact Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
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

