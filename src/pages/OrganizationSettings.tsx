import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Palette, 
  Sun, 
  Moon,
  Save,
  RotateCcw,
  Eye,
  Mail,
  Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationSettings {
  name: string;
  domain: string;
  contactEmail: string;
  primaryLogo: string | null;
  secondaryLogo: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  theme: 'light' | 'dark' | 'auto';
  fontStyle: string;
  backgroundImage: string | null;
}

export default function OrganizationSettings() {
  const [settings, setSettings] = useState<OrganizationSettings>({
    name: "",
    domain: "",
    contactEmail: "",
    primaryLogo: null,
    secondaryLogo: null,
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    accentColor: "#10b981",
    theme: 'light',
    fontStyle: 'system',
    backgroundImage: null,
  });

  const [primaryLogoPreview, setPrimaryLogoPreview] = useState<string | null>(null);
  const [secondaryLogoPreview, setSecondaryLogoPreview] = useState<string | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const primaryLogoInputRef = useRef<HTMLInputElement>(null);
  const secondaryLogoInputRef = useRef<HTMLInputElement>(null);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Load existing settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real app, fetch from database
      // For now, we'll use localStorage or default values
      const savedSettings = localStorage.getItem('organizationSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        
        // Load image previews
        if (parsed.primaryLogo) setPrimaryLogoPreview(parsed.primaryLogo);
        if (parsed.secondaryLogo) setSecondaryLogoPreview(parsed.secondaryLogo);
        if (parsed.backgroundImage) setBackgroundImagePreview(parsed.backgroundImage);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleInputChange = (field: keyof OrganizationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleLogoUpload = async (file: File, type: 'primary' | 'secondary') => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Logo must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        if (type === 'primary') {
          setPrimaryLogoPreview(preview);
          handleInputChange('primaryLogo', preview);
        } else {
          setSecondaryLogoPreview(preview);
          handleInputChange('secondaryLogo', preview);
        }
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);

      // In production, upload to Supabase storage
      // const fileExt = file.name.split('.').pop();
      // const fileName = `logos/${type}-${Date.now()}.${fileExt}`;
      // const { data, error } = await supabase.storage
      //   .from('organization-assets')
      //   .upload(fileName, file);
      
      toast({
        title: "Logo Uploaded",
        description: `${type === 'primary' ? 'Primary' : 'Secondary'} logo uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload logo",
        variant: "destructive"
      });
    }
  };

  const handleBackgroundImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setBackgroundImagePreview(preview);
        handleInputChange('backgroundImage', preview);
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Background Image Uploaded",
        description: "Background image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading background image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload background image",
        variant: "destructive"
      });
    }
  };

  const removeLogo = (type: 'primary' | 'secondary') => {
    if (type === 'primary') {
      setPrimaryLogoPreview(null);
      handleInputChange('primaryLogo', null);
    } else {
      setSecondaryLogoPreview(null);
      handleInputChange('secondaryLogo', null);
    }
  };

  const removeBackgroundImage = () => {
    setBackgroundImagePreview(null);
    handleInputChange('backgroundImage', null);
  };

  const resetToDefaults = () => {
    const defaultSettings: OrganizationSettings = {
      name: "",
      domain: "",
      contactEmail: "",
      primaryLogo: null,
      secondaryLogo: null,
      primaryColor: "#3b82f6",
      secondaryColor: "#8b5cf6",
      accentColor: "#10b981",
      theme: 'light',
      fontStyle: 'system',
      backgroundImage: null,
    };
    setSettings(defaultSettings);
    setPrimaryLogoPreview(null);
    setSecondaryLogoPreview(null);
    setBackgroundImagePreview(null);
    setHasUnsavedChanges(true);
    
    toast({
      title: "Reset to Defaults",
      description: "Settings have been reset to default values",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In production, save to database
      // await supabase.from('organization_settings').upsert(settings);
      
      // For now, save to localStorage
      localStorage.setItem('organizationSettings', JSON.stringify(settings));
      
      setHasUnsavedChanges(false);
      toast({
        title: "Settings Saved",
        description: "Organization settings have been saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Save Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fontStyles = [
    { value: 'system', label: 'System Default' },
    { value: 'modern', label: 'Modern (Inter)' },
    { value: 'serif', label: 'Serif (Georgia)' },
    { value: 'mono', label: 'Monospace (Fira Code)' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's branding and appearance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Organization Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>Organization Information</CardTitle>
              </div>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization Name *</Label>
                <Input
                  id="org-name"
                  value={settings.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter organization name"
                />
              </div>
              
              <div>
                <Label htmlFor="domain">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Domain or Short Code</span>
                  </div>
                </Label>
                <Input
                  id="domain"
                  value={settings.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  placeholder="e.g., myorg or myorg.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Used for custom branding URLs
                </p>
              </div>
              
              <div>
                <Label htmlFor="contact-email">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Contact Email *</span>
                  </div>
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@organization.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Branding & Logo */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <CardTitle>Branding & Logo</CardTitle>
              </div>
              <CardDescription>
                Upload your organization logos and customize colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Logo */}
              <div>
                <Label>Primary Logo</Label>
                <div className="mt-2 space-y-3">
                  {primaryLogoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={primaryLogoPreview}
                        alt="Primary logo preview"
                        className="h-24 w-auto border rounded-lg p-2 bg-background"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeLogo('primary')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">No logo uploaded</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => primaryLogoInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                      <input
                        ref={primaryLogoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file, 'primary');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Secondary / Dark Mode Logo */}
              <div>
                <Label>Secondary / Dark Mode Logo (Optional)</Label>
                <div className="mt-2 space-y-3">
                  {secondaryLogoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={secondaryLogoPreview}
                        alt="Secondary logo preview"
                        className="h-24 w-auto border rounded-lg p-2 bg-background"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeLogo('secondary')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">No logo uploaded</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => secondaryLogoInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                      <input
                        ref={secondaryLogoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file, 'secondary');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Theme Colors */}
              <div className="space-y-4">
                <Label>Theme Colors</Label>
                
                <div>
                  <Label htmlFor="primary-color" className="text-sm">Primary Color</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary-color" className="text-sm">Secondary Color</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={settings.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      placeholder="#8b5cf6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent-color" className="text-sm">Accent / Button Color</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={settings.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      placeholder="#10b981"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Customization */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Theme Customization</CardTitle>
              </div>
              <CardDescription>
                Customize the appearance and theme of your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme-mode">Theme Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose light, dark, or automatic theme
                  </p>
                </div>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => handleInputChange('theme', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="font-style">Font Style</Label>
                <Select
                  value={settings.fontStyle}
                  onValueChange={(value) => handleInputChange('fontStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontStyles.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Background Image (Optional)</Label>
                <div className="mt-2">
                  {backgroundImagePreview ? (
                    <div className="relative">
                      <img
                        src={backgroundImagePreview}
                        alt="Background preview"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeBackgroundImage}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">No background image</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => backgroundImageInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                      <input
                        ref={backgroundImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBackgroundImageUpload(file);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-primary" />
                <CardTitle>Brand Preview</CardTitle>
              </div>
              <CardDescription>
                Preview your branding before saving
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg border-2 border-dashed p-8 space-y-6"
                style={{
                  backgroundColor: settings.backgroundImage ? 'transparent' : 'white',
                  backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Header Preview */}
                <div className="flex items-center justify-between border-b pb-4">
                  {primaryLogoPreview ? (
                    <img
                      src={primaryLogoPreview}
                      alt="Logo"
                      className="h-10 w-auto"
                    />
                  ) : (
                    <div
                      className="h-10 w-32 rounded flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      {settings.name || 'Logo'}
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: settings.secondaryColor }}
                    />
                  </div>
                </div>

                {/* Content Preview */}
                <div className="space-y-4">
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: settings.primaryColor }}
                  >
                    Sample Heading
                  </h3>
                  <p className="text-muted-foreground">
                    This is a preview of how your organization's branding will appear
                    throughout the application.
                  </p>
                  
                  <div className="flex space-x-2">
                    <Button
                      style={{
                        backgroundColor: settings.accentColor,
                        borderColor: settings.accentColor,
                      }}
                    >
                      Primary Button
                    </Button>
                    <Button
                      variant="outline"
                      style={{
                        borderColor: settings.secondaryColor,
                        color: settings.secondaryColor,
                      }}
                    >
                      Secondary Button
                    </Button>
                  </div>

                  {/* Color Swatches */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                    <div>
                      <div
                        className="w-full h-12 rounded mb-1"
                        style={{ backgroundColor: settings.primaryColor }}
                      />
                      <p className="text-xs text-center">Primary</p>
                    </div>
                    <div>
                      <div
                        className="w-full h-12 rounded mb-1"
                        style={{ backgroundColor: settings.secondaryColor }}
                      />
                      <p className="text-xs text-center">Secondary</p>
                    </div>
                    <div>
                      <div
                        className="w-full h-12 rounded mb-1"
                        style={{ backgroundColor: settings.accentColor }}
                      />
                      <p className="text-xs text-center">Accent</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

