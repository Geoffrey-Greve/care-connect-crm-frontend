import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CompanyProfileModal from "@/components/CompanyProfileModal";
import MailConfigurationModal from "@/components/MailConfigurationModal";
import PaymentMethodModal from "@/components/PaymentMethodModal";
import TestConnectionModal from "@/components/TestConnectionModal";

interface CompanyProfile {
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

interface MailConfiguration {
  serviceProvider: string;
  host: string;
  port: string;
  username: string;
  password: string;
  encryption: string;
  mailFromAddress: string;
  mailFromName: string;
}

interface PaymentMethod {
  brand: string;
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
}

const defaultCompanyProfile: CompanyProfile = {
  companyName: "Harrison OD",
  mobile: "0499158022",
  state: "New South Wales",
  companyAddress: "4/1 Mossgiel Street, Fairlight NSW, Australia",
  contactName: "Harrison",
  phone: "NA",
  suburb: "Sydney",
  contactEmail: "h.lyricartifact@outlook.com",
  country: "Australia",
  postcode: "2094",
};

const defaultMailConfiguration: MailConfiguration = {
  serviceProvider: "NA",
  host: "NA",
  port: "NA",
  username: "NA",
  password: "NA",
  encryption: "NA",
  mailFromAddress: "NA",
  mailFromName: "NA",
};

const defaultPaymentMethod: PaymentMethod = {
  brand: "mastercard",
  cardHolderName: "Harrison",
  cardNumber: "XXXX XXXX XXXX 0556",
  expiryDate: "3/2027",
  cvc: "***",
};

const packageInfo = {
  companyPackageName: "Unrestricted Features 1 To 5 Users",
  numberOfStaff: "5",
  purchaseDate: "18/11/2025",
  expiryDate: "19/12/2025",
};

export default function ManageSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("company-profile");
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(defaultCompanyProfile);
  const [mailConfiguration, setMailConfiguration] = useState<MailConfiguration>(defaultMailConfiguration);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(defaultPaymentMethod);
  const [companyProfileModalOpen, setCompanyProfileModalOpen] = useState(false);
  const [mailConfigModalOpen, setMailConfigModalOpen] = useState(false);
  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);
  const [testConnectionModalOpen, setTestConnectionModalOpen] = useState(false);

  const handleCompanyProfileUpdate = (data: CompanyProfile) => {
    setCompanyProfile(data);
    toast({
      title: "Success",
      description: "Company profile updated successfully.",
    });
  };

  const handleMailConfigUpdate = (data: MailConfiguration) => {
    setMailConfiguration(data);
    toast({
      title: "Success",
      description: "Mail configuration updated successfully.",
    });
  };

  const handlePaymentMethodUpdate = (data: PaymentMethod) => {
    setPaymentMethod(data);
    toast({
      title: "Success",
      description: "Payment method updated successfully.",
    });
  };

  const handleTestConnection = () => {
    setTestConnectionModalOpen(true);
  };

  const maskCardNumber = (cardNumber: string) => {
    if (cardNumber.includes("XXXX")) return cardNumber;
    const last4 = cardNumber.slice(-4);
    return `XXXX XXXX XXXX ${last4}`;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b pb-6">
          <TabsList className="h-auto p-0 bg-transparent grid w-full max-w-md grid-cols-3">
            <TabsTrigger 
              value="company-profile"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Company Profile
            </TabsTrigger>
            <TabsTrigger 
              value="mail-configuration"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Mail Configuration
            </TabsTrigger>
            <TabsTrigger 
              value="payment-method"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Payment Method
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Company Profile Tab */}
        <TabsContent value="company-profile" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Company Profile</h2>
                <Button onClick={() => setCompanyProfileModalOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Logo Placeholders */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Company Logo</label>
                    <div className="w-[70px] h-[70px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                      {companyProfile.companyLogo ? (
                        <img
                          src={companyProfile.companyLogo}
                          alt="Company Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Hamburger Icon</label>
                    <div className="w-[70px] h-[70px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                      {companyProfile.hamburgerIcon ? (
                        <img
                          src={companyProfile.hamburgerIcon}
                          alt="Hamburger Icon"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">70x70</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle Column - Company Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <p className="text-sm font-semibold mt-1">{companyProfile.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                    <p className="text-sm font-semibold mt-1">{companyProfile.mobile}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">State</label>
                    <p className="text-sm font-semibold mt-1">{companyProfile.state}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Address</label>
                    <p className="text-sm font-semibold mt-1">{companyProfile.companyAddress}</p>
                  </div>
                </div>

                {/* Right Column - Contact Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact Name</label>
                    <p className="text-sm font-semibold mt-1">{companyProfile.contactName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-sm font-semibold mt-1">{companyProfile.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Suburb</label>
                    <p className="text-sm font-semibold mt-1">{companyProfile.suburb}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                    <p className="text-sm font-semibold mt-1">{companyProfile.contactEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Country</label>
                    <p className="text-sm font-semibold mt-1">{companyProfile.country}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Postcode</label>
                    <p className="text-sm font-semibold mt-1">{companyProfile.postcode}</p>
                  </div>
                </div>
              </div>

              {/* Package Section */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-primary mb-4">Package</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Package Name</label>
                    <p className="text-sm font-semibold mt-1">{packageInfo.companyPackageName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Number Of Staff</label>
                    <p className="text-sm font-semibold mt-1">{packageInfo.numberOfStaff}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                    <p className="text-sm font-semibold mt-1">{packageInfo.purchaseDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                    <p className="text-sm font-semibold mt-1">{packageInfo.expiryDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mail Configuration Tab */}
        <TabsContent value="mail-configuration" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Mail Configuration</h2>
                <div className="flex gap-3">
                  <Button variant="default" onClick={handleTestConnection}>
                    Test Connection
                  </Button>
                  <Button variant="outline" onClick={() => setMailConfigModalOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Service Provider</label>
                    <p className="text-sm font-semibold mt-1">{mailConfiguration.serviceProvider}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="text-sm font-semibold mt-1">{mailConfiguration.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mail From Address</label>
                    <p className="text-sm font-semibold mt-1">{mailConfiguration.mailFromAddress}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Host</label>
                    <p className="text-sm font-semibold mt-1">{mailConfiguration.host}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Password</label>
                    <p className="text-sm font-semibold mt-1">{mailConfiguration.password}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mail From Name</label>
                    <p className="text-sm font-semibold mt-1">{mailConfiguration.mailFromName}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Port</label>
                    <p className="text-sm font-semibold mt-1">{mailConfiguration.port}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Encryption</label>
                    <p className="text-sm font-semibold mt-1">{mailConfiguration.encryption}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Method Tab */}
        <TabsContent value="payment-method" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                <Button onClick={() => setPaymentMethodModalOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Brand</label>
                  <p className="text-sm font-semibold mt-1 capitalize">{paymentMethod.brand}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Card Holder Name</label>
                  <p className="text-sm font-semibold mt-1">{paymentMethod.cardHolderName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Card Number</label>
                  <p className="text-sm font-semibold mt-1">{maskCardNumber(paymentMethod.cardNumber)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                  <p className="text-sm font-semibold mt-1">{paymentMethod.expiryDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CompanyProfileModal
        open={companyProfileModalOpen}
        onOpenChange={setCompanyProfileModalOpen}
        data={companyProfile}
        onSubmit={handleCompanyProfileUpdate}
      />

      <MailConfigurationModal
        open={mailConfigModalOpen}
        onOpenChange={setMailConfigModalOpen}
        data={mailConfiguration}
        onSubmit={handleMailConfigUpdate}
      />

      <PaymentMethodModal
        open={paymentMethodModalOpen}
        onOpenChange={setPaymentMethodModalOpen}
        data={paymentMethod}
        onSubmit={handlePaymentMethodUpdate}
      />

      <TestConnectionModal
        open={testConnectionModalOpen}
        onOpenChange={setTestConnectionModalOpen}
      />
    </div>
  );
}

