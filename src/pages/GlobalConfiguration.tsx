import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Globe, 
  DollarSign, 
  Receipt,
  FileText,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  Calendar,
  Info,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface GlobalConfiguration {
  // Time Zone & Locale
  defaultTimezone: string;
  locale: string;
  dateFormat: string;
  timeFormat: string;
  
  // Currency
  defaultCurrency: string;
  currencySymbolPosition: 'before' | 'after';
  decimalPrecision: number;
  
  // Tax
  taxPercentage: number;
  applyTaxByDefault: boolean;
  taxCalculationType: 'inclusive' | 'exclusive';
  
  // NDIS Price Guide
  activePriceGuideVersion: string;
  priceGuideEffectiveDate: string;
  priceGuideNotes: string;
}

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Australia/Sydney", label: "AEST/AEDT (Australian Eastern)" },
  { value: "Australia/Melbourne", label: "AEST/AEDT (Melbourne)" },
  { value: "Australia/Brisbane", label: "AEST (Brisbane)" },
  { value: "Australia/Adelaide", label: "ACST/ACDT (Adelaide)" },
  { value: "Australia/Perth", label: "AWST (Perth)" },
  { value: "Australia/Darwin", label: "ACST (Darwin)" },
  { value: "America/New_York", label: "EST/EDT (Eastern Time)" },
  { value: "America/Chicago", label: "CST/CDT (Central Time)" },
  { value: "America/Denver", label: "MST/MDT (Mountain Time)" },
  { value: "America/Los_Angeles", label: "PST/PDT (Pacific Time)" },
  { value: "Europe/London", label: "GMT/BST (London)" },
  { value: "Europe/Paris", label: "CET/CEST (Paris)" },
  { value: "Asia/Tokyo", label: "JST (Tokyo)" },
  { value: "Asia/Shanghai", label: "CST (Shanghai)" },
  { value: "Asia/Dubai", label: "GST (Dubai)" },
];

const locales = [
  { value: "en-AU", label: "English (Australia)" },
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "it-IT", label: "Italian (Italy)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "ja-JP", label: "Japanese" },
];

const currencies = [
  { value: "AUD", label: "AUD - Australian Dollar ($)" },
  { value: "USD", label: "USD - US Dollar ($)" },
  { value: "GBP", label: "GBP - British Pound (£)" },
  { value: "EUR", label: "EUR - Euro (€)" },
  { value: "CAD", label: "CAD - Canadian Dollar ($)" },
  { value: "NZD", label: "NZD - New Zealand Dollar ($)" },
  { value: "JPY", label: "JPY - Japanese Yen (¥)" },
  { value: "CNY", label: "CNY - Chinese Yuan (¥)" },
  { value: "INR", label: "INR - Indian Rupee (₹)" },
  { value: "SGD", label: "SGD - Singapore Dollar ($)" },
];

const ndisPriceGuideVersions = [
  { value: "2024-25", label: "2024-25 NDIS Price Guide" },
  { value: "2023-24", label: "2023-24 NDIS Price Guide" },
  { value: "2022-23", label: "2022-23 NDIS Price Guide" },
  { value: "2021-22", label: "2021-22 NDIS Price Guide" },
];

export default function GlobalConfiguration() {
  const [config, setConfig] = useState<GlobalConfiguration>({
    defaultTimezone: "Australia/Sydney",
    locale: "en-AU",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24-hour",
    defaultCurrency: "AUD",
    currencySymbolPosition: 'before',
    decimalPrecision: 2,
    taxPercentage: 10,
    applyTaxByDefault: true,
    taxCalculationType: 'inclusive',
    activePriceGuideVersion: "2024-25",
    priceGuideEffectiveDate: new Date().toISOString().split('T')[0],
    priceGuideNotes: "",
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedPriceGuide, setUploadedPriceGuide] = useState<File | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showVersionsDialog, setShowVersionsDialog] = useState(false);
  const priceGuideInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      // In production, fetch from database
      const savedConfig = localStorage.getItem('globalConfiguration');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  const handleConfigChange = (field: keyof GlobalConfiguration, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In production, save to database
      // await supabase.from('global_configuration').upsert(config);
      
      localStorage.setItem('globalConfiguration', JSON.stringify(config));
      setHasUnsavedChanges(false);
      
      toast({
        title: "Configuration Saved",
        description: "Global configuration settings have been saved successfully",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Save Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyToAllTenants = () => {
    setShowConfirmDialog(true);
  };

  const confirmApplyToAllTenants = async () => {
    try {
      // In production, apply to all tenants
      toast({
        title: "Applied to All Tenants",
        description: "Currency settings have been applied to all tenants successfully",
      });
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error applying to tenants:', error);
      toast({
        title: "Error",
        description: "Failed to apply settings to all tenants",
        variant: "destructive"
      });
    }
  };

  const handlePriceGuideUpload = (file: File) => {
    const validTypes = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    
    if (!validTypes.includes(file.type) && !validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV or Excel file (.csv, .xlsx, .xls).",
        variant: "destructive",
      });
      return;
    }

    setUploadedPriceGuide(file);
    toast({
      title: "File Uploaded",
      description: `${file.name} uploaded successfully. Ready to activate.`,
    });
  };

  const handleUploadAndActivate = async () => {
    if (!uploadedPriceGuide) {
      toast({
        title: "No File Selected",
        description: "Please upload a price guide file first",
        variant: "destructive"
      });
      return;
    }

    try {
      // In production, upload and process the file
      // const fileExt = uploadedPriceGuide.name.split('.').pop();
      // const fileName = `price-guides/${config.activePriceGuideVersion}-${Date.now()}.${fileExt}`;
      // const { data, error } = await supabase.storage
      //   .from('ndis-price-guides')
      //   .upload(fileName, uploadedPriceGuide);

      toast({
        title: "Price Guide Activated",
        description: `NDIS Price Guide ${config.activePriceGuideVersion} has been uploaded and activated`,
      });
      
      setUploadedPriceGuide(null);
      if (priceGuideInputRef.current) {
        priceGuideInputRef.current.value = "";
      }
    } catch (error) {
      console.error('Error uploading price guide:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload and activate price guide",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    const formatted = amount.toFixed(config.decimalPrecision);
    if (config.currencySymbolPosition === 'before') {
      return `${config.defaultCurrency} ${formatted}`;
    }
    return `${formatted} ${config.defaultCurrency}`;
  };

  const formatTaxExample = () => {
    const amount = 100;
    if (config.taxCalculationType === 'inclusive') {
      const taxAmount = amount * (config.taxPercentage / (100 + config.taxPercentage));
      return `$${amount.toFixed(2)} includes $${taxAmount.toFixed(2)} ${config.taxPercentage}% tax`;
    } else {
      const taxAmount = amount * (config.taxPercentage / 100);
      const total = amount + taxAmount;
      return `$${amount.toFixed(2)} + $${taxAmount.toFixed(2)} tax = $${total.toFixed(2)}`;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Global Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Manage universal system-wide settings such as timezone, currency, locale, and tax preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              Unsaved Changes
            </Badge>
          )}
          <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timezone" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timezone">
            <Clock className="h-4 w-4 mr-2" />
            Time & Locale
          </TabsTrigger>
          <TabsTrigger value="currency">
            <DollarSign className="h-4 w-4 mr-2" />
            Currency
          </TabsTrigger>
          <TabsTrigger value="tax">
            <Receipt className="h-4 w-4 mr-2" />
            Tax Rules
          </TabsTrigger>
          <TabsTrigger value="ndis">
            <FileText className="h-4 w-4 mr-2" />
            NDIS Guide
          </TabsTrigger>
        </TabsList>

        {/* Time Zone & Locale Settings */}
        <TabsContent value="timezone">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Time Zone & Locale Settings</CardTitle>
              </div>
              <CardDescription>
                Define how the system handles regional formats and time settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="timezone">Default Time Zone *</Label>
                  <Select
                    value={config.defaultTimezone}
                    onValueChange={(value) => handleConfigChange('defaultTimezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="locale">Locale *</Label>
                  <Select
                    value={config.locale}
                    onValueChange={(value) => handleConfigChange('locale', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locales.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-format">Date Format *</Label>
                  <Select
                    value={config.dateFormat}
                    onValueChange={(value) => handleConfigChange('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (Day/Month/Year)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (Month/Day/Year)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY (Day-Month-Year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time-format">Time Format *</Label>
                  <Select
                    value={config.timeFormat}
                    onValueChange={(value) => handleConfigChange('timeFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12-hour">12-hour (AM/PM)</SelectItem>
                      <SelectItem value="24-hour">24-hour (Military Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Settings */}
        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Currency Settings</CardTitle>
              </div>
              <CardDescription>
                Define system-wide currency and formatting preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="currency">Default Currency *</Label>
                  <Select
                    value={config.defaultCurrency}
                    onValueChange={(value) => handleConfigChange('defaultCurrency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency-position">Currency Symbol Position *</Label>
                  <Select
                    value={config.currencySymbolPosition}
                    onValueChange={(value) => handleConfigChange('currencySymbolPosition', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before amount (e.g., $100.00)</SelectItem>
                      <SelectItem value="after">After amount (e.g., 100.00 $)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="decimal-precision">Decimal Precision *</Label>
                  <Input
                    id="decimal-precision"
                    type="number"
                    min="0"
                    max="4"
                    value={config.decimalPrecision}
                    onChange={(e) => handleConfigChange('decimalPrecision', parseInt(e.target.value) || 2)}
                    placeholder="2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of decimal places (e.g., 2 for 0.00)
                  </p>
                </div>

                <div className="flex items-end">
                  <div className="p-4 border rounded-lg bg-muted/50 w-full">
                    <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(1234.56)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={handleApplyToAllTenants}>
                  Apply to All Tenants
                </Button>
                <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Rules Configuration */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-primary" />
                <CardTitle>Tax Rules Configuration</CardTitle>
              </div>
              <CardDescription>
                Control system-wide tax calculation behavior for invoices and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="tax-percentage">Tax Percentage (GST/VAT) *</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="tax-percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={config.taxPercentage}
                      onChange={(e) => handleConfigChange('taxPercentage', parseFloat(e.target.value) || 0)}
                      placeholder="10"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="apply-tax">Apply Tax by Default *</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Switch
                      id="apply-tax"
                      checked={config.applyTaxByDefault}
                      onCheckedChange={(checked) => handleConfigChange('applyTaxByDefault', checked)}
                    />
                    <Label htmlFor="apply-tax" className="cursor-pointer">
                      {config.applyTaxByDefault ? "Yes" : "No"}
                    </Label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="tax-calculation">Tax Calculation Type *</Label>
                  <Select
                    value={config.taxCalculationType}
                    onValueChange={(value) => handleConfigChange('taxCalculationType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inclusive">Inclusive (Tax included in price)</SelectItem>
                      <SelectItem value="exclusive">Exclusive (Tax added to price)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tax Explanation */}
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      How tax will be applied:
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {formatTaxExample()}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      {config.taxCalculationType === 'inclusive' 
                        ? "The tax amount is included in the displayed price. Customers see the total price including tax."
                        : "The tax amount is added to the base price. Customers see the base price plus tax separately."
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NDIS Price Guide Versions */}
        <TabsContent value="ndis">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>NDIS Price Guide Versions</CardTitle>
              </div>
              <CardDescription>
                Manage which NDIS price guide version the system uses for billing and claims
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="price-guide-version">Active Price Guide Version *</Label>
                  <Select
                    value={config.activePriceGuideVersion}
                    onValueChange={(value) => handleConfigChange('activePriceGuideVersion', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ndisPriceGuideVersions.map((version) => (
                        <SelectItem key={version.value} value={version.value}>
                          {version.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="effective-date">Effective From Date *</Label>
                  <Input
                    id="effective-date"
                    type="date"
                    value={config.priceGuideEffectiveDate}
                    onChange={(e) => handleConfigChange('priceGuideEffectiveDate', e.target.value)}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <Label>Upload New Price Guide (CSV/Excel)</Label>
                <div className="mt-2">
                  {uploadedPriceGuide ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{uploadedPriceGuide.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedPriceGuide.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUploadedPriceGuide(null);
                          if (priceGuideInputRef.current) {
                            priceGuideInputRef.current.value = "";
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload CSV or Excel file
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => priceGuideInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                      <input
                        ref={priceGuideInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePriceGuideUpload(file);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="price-guide-notes">Notes (Optional)</Label>
                <Textarea
                  id="price-guide-notes"
                  value={config.priceGuideNotes}
                  onChange={(e) => handleConfigChange('priceGuideNotes', e.target.value)}
                  placeholder="Add any admin comments or notes about this price guide version..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowVersionsDialog(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Versions
                </Button>
                <Button
                  onClick={handleUploadAndActivate}
                  disabled={!uploadedPriceGuide}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Activate
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Apply to All Tenants */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply to All Tenants?</AlertDialogTitle>
            <AlertDialogDescription>
              This will apply the current currency settings to all tenants in the system. 
              This action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApplyToAllTenants}>
              Apply to All Tenants
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View All Versions Dialog */}
      <Dialog open={showVersionsDialog} onOpenChange={setShowVersionsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>NDIS Price Guide Versions</DialogTitle>
            <DialogDescription>
              View and manage all uploaded NDIS price guide versions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {ndisPriceGuideVersions.map((version) => (
              <div
                key={version.value}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  version.value === config.activePriceGuideVersion
                    ? "bg-primary/5 border-primary"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{version.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {version.value === config.activePriceGuideVersion
                        ? "Currently Active"
                        : "Available"}
                    </p>
                  </div>
                </div>
                {version.value === config.activePriceGuideVersion && (
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
