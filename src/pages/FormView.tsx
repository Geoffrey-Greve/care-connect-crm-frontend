import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Upload, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "checkbox-group"
  | "radio-group"
  | "file-upload"
  | "autocomplete"
  | "header"
  | "paragraph"
  | "hidden";

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  rows?: number;
  min?: number;
  max?: number;
  accept?: string;
}

interface FormData {
  id: string;
  name: string;
  client?: string;
  noteType: string;
  fields: FormField[];
}

// Mock form data - in production, this would come from an API
const mockForms: Record<string, FormData> = {
  "FORM-001": {
    id: "FORM-001",
    name: "Incident_Staff_Form",
    noteType: "Incident",
    fields: [
      { id: "1", type: "header", label: "Incident Report", name: "header1" },
      { id: "2", type: "text", label: "Staff Name", name: "staffName", required: true },
      { id: "3", type: "date", label: "Incident Date", name: "incidentDate", required: true },
      { id: "4", type: "textarea", label: "Description", name: "description", required: true, rows: 5 },
      { id: "5", type: "select", label: "Severity", name: "severity", options: ["Low", "Medium", "High", "Critical"], required: true },
    ],
  },
  "FORM-002": {
    id: "FORM-002",
    name: "Incident_Admin_Form",
    noteType: "Incident",
    fields: [
      { id: "1", type: "header", label: "Admin Incident Form", name: "header1" },
      { id: "2", type: "text", label: "Admin Name", name: "adminName", required: true },
      { id: "3", type: "textarea", label: "Notes", name: "notes", rows: 4 },
    ],
  },
  "FORM-003": {
    id: "FORM-003",
    name: "Enquiry Form",
    noteType: "Enquiry",
    fields: [
      { id: "1", type: "text", label: "Enquirer Name", name: "enquirerName", required: true },
      { id: "2", type: "text", label: "Contact Number", name: "contactNumber", required: true },
      { id: "3", type: "textarea", label: "Enquiry Details", name: "enquiryDetails", required: true, rows: 6 },
    ],
  },
  "FORM-004": {
    id: "FORM-004",
    name: "Feedback_Form",
    noteType: "Feedback",
    fields: [
      { id: "1", type: "header", label: "Feedback Form", name: "header1" },
      { id: "2", type: "radio-group", label: "Rating", name: "rating", options: ["Excellent", "Good", "Average", "Poor"], required: true },
      { id: "3", type: "textarea", label: "Comments", name: "comments", rows: 4 },
    ],
  },
  "FORM-005": {
    id: "FORM-005",
    name: "Notes_Form",
    noteType: "Notes",
    fields: [
      { id: "1", type: "text", label: "Title", name: "title", required: true },
      { id: "2", type: "textarea", label: "Note Content", name: "content", required: true, rows: 8 },
    ],
  },
  "FORM-006": {
    id: "FORM-006",
    name: "Injury Form",
    noteType: "Injury",
    fields: [
      { id: "1", type: "header", label: "Injury Report", name: "header1" },
      { id: "2", type: "text", label: "Person Name", name: "personName", required: true },
      { id: "3", type: "date", label: "Injury Date", name: "injuryDate", required: true },
      { id: "4", type: "textarea", label: "Injury Description", name: "injuryDescription", required: true, rows: 5 },
      { id: "5", type: "file-upload", label: "Medical Report", name: "medicalReport", accept: ".pdf,.jpg,.png" },
    ],
  },
  "FORM-007": {
    id: "FORM-007",
    name: "Client Enquiry Form",
    noteType: "Enquiry",
    client: "Harrison",
    fields: [
      { id: "1", type: "text", label: "Client Name", name: "clientName", required: true },
      { id: "2", type: "autocomplete", label: "Service Type", name: "serviceType", placeholder: "Search services..." },
      { id: "3", type: "textarea", label: "Enquiry", name: "enquiry", required: true, rows: 5 },
    ],
  },
};

export default function FormView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const form = id ? mockForms[id] : null;

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Form Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The form you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/form-builder")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forms
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleInputChange = (name: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = form.fields
      .filter((field) => field.required && !formValues[field.name])
      .map((field) => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Form Submitted",
      description: `Form "${form.name}" has been submitted successfully.`,
    });

    // In production, this would submit to an API
    console.log("Form Values:", formValues);
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "header":
        return (
          <h2 className="text-2xl font-bold mb-4">{field.label}</h2>
        );
      case "paragraph":
        return (
          <p className="text-gray-600 mb-4">{field.placeholder || field.label}</p>
        );
      case "hidden":
        return (
          <Input type="hidden" name={field.name} value={formValues[field.name] || field.placeholder || ""} />
        );
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              name={field.name}
              value={formValues[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );
      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={formValues[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 4}
              required={field.required}
            />
          </div>
        );
      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              name={field.name}
              value={formValues[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              required={field.required}
            />
          </div>
        );
      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id={field.name}
                type="date"
                name={field.name}
                value={formValues[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="pl-10"
                required={field.required}
              />
            </div>
          </div>
        );
      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={formValues[field.name] || ""}
              onValueChange={(value) => handleInputChange(field.name, value)}
            >
              <SelectTrigger id={field.name}>
                <SelectValue placeholder={field.placeholder || "Select an option..."} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, idx) => (
                  <SelectItem key={idx} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "checkbox-group":
        return (
          <div className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${idx}`}
                    checked={formValues[field.name]?.includes(option) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = formValues[field.name] || [];
                      if (checked) {
                        handleInputChange(field.name, [...currentValues, option]);
                      } else {
                        handleInputChange(field.name, currentValues.filter((v: string) => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${field.name}-${idx}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );
      case "radio-group":
        return (
          <div className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <RadioGroup
              value={formValues[field.name] || ""}
              onValueChange={(value) => handleInputChange(field.name, value)}
            >
              {field.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.name}-${idx}`} />
                  <Label htmlFor={`${field.name}-${idx}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case "file-upload":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <Input
                id={field.name}
                type="file"
                name={field.name}
                accept={field.accept}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleInputChange(field.name, file.name);
                    toast({
                      title: "File Selected",
                      description: `${file.name} has been selected.`,
                    });
                  }
                }}
                className="hidden"
              />
              <Label htmlFor={field.name} className="cursor-pointer text-blue-600 hover:text-blue-700">
                Click to upload or drag and drop
              </Label>
              <p className="text-xs text-gray-400 mt-2">{field.accept}</p>
              {formValues[field.name] && (
                <p className="text-sm text-gray-600 mt-2">Selected: {formValues[field.name]}</p>
              )}
            </div>
          </div>
        );
      case "autocomplete":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id={field.name}
                name={field.name}
                value={formValues[field.name] || ""}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder || "Type to search..."}
                className="pl-10"
                required={field.required}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/form-builder")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{form.name}</h1>
              <p className="text-sm text-muted-foreground">
                {form.noteType} {form.client && `• ${form.client}`}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map((field) => (
                <div key={field.id}>{renderField(field)}</div>
              ))}

              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => navigate("/form-builder")}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Submit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

