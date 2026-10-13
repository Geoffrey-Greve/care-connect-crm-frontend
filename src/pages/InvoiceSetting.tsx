import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import InvoiceSettingModal from "@/components/InvoiceSettingModal";
import TaxModal from "@/components/TaxModal";
import AccountDetailsModal from "@/components/AccountDetailsModal";
import NeedToKnowModal from "@/components/NeedToKnowModal";
import UsefulInformationModal from "@/components/UsefulInformationModal";
import { useToast } from "@/hooks/use-toast";

interface InvoiceSettings {
  abn: string;
  address: string;
  phone: string;
  contactEmail: string;
  ndiaProviderNumber: string;
  transportRatePerKm: string;
  termsAndConditions: string;
}

interface Tax {
  id: string;
  name: string;
  rate: string;
}

interface AccountDetails {
  accountName: string;
  accountNumber: string;
  bsb: string;
}

interface InformationItem {
  id: string;
  text: string;
  mandatory: boolean;
}

const defaultSettings: InvoiceSettings = {
  abn: "",
  address: "",
  phone: "",
  contactEmail: "",
  ndiaProviderNumber: "",
  transportRatePerKm: "",
  termsAndConditions: "",
};

const defaultTaxes: Tax[] = [
  {
    id: "1",
    name: "GST",
    rate: "20",
  },
];

const defaultAccountDetails: AccountDetails = {
  accountName: "",
  accountNumber: "",
  bsb: "",
};

const defaultNeedToKnow: InformationItem[] = [
  {
    id: "1",
    text: "Free OPD",
    mandatory: false,
  },
  {
    id: "2",
    text: "Theraphy Discount",
    mandatory: false,
  },
];

const defaultUsefulInfo: InformationItem[] = [
  {
    id: "1",
    text: "Home Care Service Started Will Be From Next Month",
    mandatory: false,
  },
  {
    id: "2",
    text: "Avail Onsite Services With Discount",
    mandatory: false,
  },
];

export default function InvoiceSetting() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<InvoiceSettings>(defaultSettings);
  const [modalOpen, setModalOpen] = useState(false);
  const [taxes, setTaxes] = useState<Tax[]>(defaultTaxes);
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [accountDetails, setAccountDetails] = useState<AccountDetails>(defaultAccountDetails);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [needToKnow, setNeedToKnow] = useState<InformationItem[]>(defaultNeedToKnow);
  const [usefulInfo, setUsefulInfo] = useState<InformationItem[]>(defaultUsefulInfo);
  const [needToKnowModalOpen, setNeedToKnowModalOpen] = useState(false);
  const [usefulInfoModalOpen, setUsefulInfoModalOpen] = useState(false);

  const handleUpdate = () => {
    setModalOpen(true);
  };

  const handleSave = (data: InvoiceSettings) => {
    setSettings(data);
    setModalOpen(false);
    toast({
      title: "Success",
      description: "Invoice settings updated successfully.",
    });
  };

  const handleTaxUpdate = () => {
    setTaxModalOpen(true);
  };

  const handleTaxSave = (data: Tax[]) => {
    setTaxes(data);
    setTaxModalOpen(false);
    toast({
      title: "Success",
      description: "Taxes updated successfully.",
    });
  };

  const handleAccountUpdate = () => {
    setAccountModalOpen(true);
  };

  const handleAccountSave = (data: AccountDetails) => {
    setAccountDetails(data);
    setAccountModalOpen(false);
    toast({
      title: "Success",
      description: "Account details updated successfully.",
    });
  };

  const handleNeedToKnowSave = (data: InformationItem[]) => {
    setNeedToKnow(data);
    setNeedToKnowModalOpen(false);
    toast({
      title: "Success",
      description: "Need to know information updated successfully.",
    });
  };

  const handleUsefulInfoSave = (data: InformationItem[]) => {
    setUsefulInfo(data);
    setUsefulInfoModalOpen(false);
    toast({
      title: "Success",
      description: "Useful information updated successfully.",
    });
  };

  const displayValue = (value: string) => {
    return value || "-";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Setting</h1>
        </div>
      </div>

      {/* Invoices Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Invoices</h2>
            <Button onClick={handleUpdate}>
              <Pencil className="h-4 w-4 mr-2" />
              Update
            </Button>
          </div>

          <div className="space-y-0">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm font-medium text-muted-foreground">ABN:</span>
              <span className="text-sm font-medium">{displayValue(settings.abn)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm font-medium text-muted-foreground">Address:</span>
              <span className="text-sm font-medium">{displayValue(settings.address)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm font-medium text-muted-foreground">Phone:</span>
              <span className="text-sm font-medium">{displayValue(settings.phone)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm font-medium text-muted-foreground">Contact email:</span>
              <span className="text-sm font-medium">{displayValue(settings.contactEmail)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm font-medium text-muted-foreground">NDIA provider or registration number:</span>
              <span className="text-sm font-medium">{displayValue(settings.ndiaProviderNumber)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm font-medium text-muted-foreground">Transport Rate Per Km:</span>
              <span className="text-sm font-medium">{displayValue(settings.transportRatePerKm)}</span>
            </div>
            <div className="flex items-start justify-between py-3">
              <span className="text-sm font-medium text-muted-foreground">Terms & Conditions:</span>
              <div className="text-sm font-medium max-w-md text-right">
                {settings.termsAndConditions ? (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: settings.termsAndConditions }}
                  />
                ) : (
                  <span>-</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taxes Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Taxes</h2>
            <Button onClick={handleTaxUpdate}>
              <Pencil className="h-4 w-4 mr-2" />
              Update
            </Button>
          </div>

          <div className="space-y-4">
            {/* Header Row */}
            <div className="grid grid-cols-2 gap-4 pb-3 border-b">
              <span className="text-sm font-bold text-foreground">Name:</span>
              <span className="text-sm font-bold text-foreground">Rate %:</span>
            </div>

            {/* Tax Rows */}
            {taxes.length > 0 ? (
              taxes.map((tax) => (
                <div key={tax.id} className="grid grid-cols-2 gap-4 py-2">
                  <span className="text-sm font-medium">{tax.name || "-"}</span>
                  <span className="text-sm font-medium">{tax.rate || "-"}</span>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-4 py-2">
                <span className="text-sm font-medium text-muted-foreground">-</span>
                <span className="text-sm font-medium text-muted-foreground">-</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Details Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Account Details</h2>
            <Button onClick={handleAccountUpdate}>
              <Pencil className="h-4 w-4 mr-2" />
              Update
            </Button>
          </div>

          <div className="space-y-0">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm font-medium text-muted-foreground">Account Name:</span>
              <span className="text-sm font-medium">{displayValue(accountDetails.accountName)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-sm font-medium text-muted-foreground">Account Number:</span>
              <span className="text-sm font-medium">{displayValue(accountDetails.accountNumber)}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-muted-foreground">BSB:</span>
              <span className="text-sm font-medium">{displayValue(accountDetails.bsb)}</span>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Useful Information Card */}
      <Card>
        <CardContent className="p-6">
          {/* Client Public Information Headings Card */}
          <div className="flex items-center justify-between mb-6 ">
            <h2 className="text-lg font-semibold">Need to know Information:</h2>
            <Button
              variant="link"
              className="text-primary p-0 h-auto"
              onClick={() => setNeedToKnowModalOpen(true)}
            >
              Manage
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 border-b pb-3">
            {needToKnow.length > 0 ? (
              needToKnow.map((item) => (
                <div
                  key={item.id}
                  className="text-white text-xs bg-slate-800 p-2 rounded-md"
                >
                  {item.text}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No items added yet</p>
            )}
          </div>


          <div className="flex items-center justify-between my-6">
            <h2 className="text-lg font-semibold">Useful Information:</h2>
            <Button
              variant="link"
              className="text-primary p-0 h-auto"
              onClick={() => setUsefulInfoModalOpen(true)}
            >
              Manage
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {usefulInfo.length > 0 ? (
              usefulInfo.map((item) => (
                <div
                  key={item.id}
                  className="text-white text-xs bg-slate-800 p-2 rounded-md"
                >
                  {item.text}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No items added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Setting Modal */}
      <InvoiceSettingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        data={settings}
        onSave={handleSave}
      />

      {/* Tax Modal */}
      <TaxModal
        open={taxModalOpen}
        onOpenChange={setTaxModalOpen}
        data={taxes}
        onSave={handleTaxSave}
      />

      {/* Account Details Modal */}
      <AccountDetailsModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
        data={accountDetails}
        onSave={handleAccountSave}
      />

      {/* Need to know Modal */}
      <NeedToKnowModal
        open={needToKnowModalOpen}
        onOpenChange={setNeedToKnowModalOpen}
        data={needToKnow}
        onSave={handleNeedToKnowSave}
      />

      {/* Useful Information Modal */}
      <UsefulInformationModal
        open={usefulInfoModalOpen}
        onOpenChange={setUsefulInfoModalOpen}
        data={usefulInfo}
        onSave={handleUsefulInfoSave}
      />
    </div>
  );
}
