import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  GripVertical,
  X,
  Trash2,
  Edit,
  Save,
  FileCode,
  Type,
  FileText,
  Hash,
  Calendar,
  Upload,
  CheckSquare,
  Circle,
  List,
  Search,
  EyeOff,
  Heading,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  options?: string[]; // For select, checkbox-group, radio-group
  rows?: number; // For textarea
  min?: number; // For number
  max?: number; // For number
  accept?: string; // For file-upload
}

interface FieldPaletteItem {
  type: FieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const fieldPalette: FieldPaletteItem[] = [
  { type: "text", label: "Text Field", icon: Type },
  { type: "textarea", label: "Text Area", icon: FileText },
  { type: "number", label: "Number", icon: Hash },
  { type: "date", label: "Date Field", icon: Calendar },
  { type: "select", label: "Select", icon: List },
  { type: "checkbox-group", label: "Checkbox Group", icon: CheckSquare },
  { type: "radio-group", label: "Radio Group", icon: Circle },
  { type: "file-upload", label: "File Upload", icon: Upload },
  { type: "autocomplete", label: "Autocomplete", icon: Search },
  { type: "header", label: "Header", icon: Heading },
  { type: "paragraph", label: "Paragraph", icon: FileText },
  { type: "hidden", label: "Hidden Input", icon: EyeOff },
];

const mockClients = [
  { id: "1", name: "Harrison" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "John Smith" },
];

const noteTypes = ["Incident", "Enquiry", "Feedback", "Notes", "Injury", "Other"];

// Mock form data - shared with FormView.tsx
const mockForms: Record<string, { id: string; name: string; client?: string; noteType: string; fields: FormField[] }> = {
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
    client: "1",
    fields: [
      { id: "1", type: "text", label: "Client Name", name: "clientName", required: true },
      { id: "2", type: "autocomplete", label: "Service Type", name: "serviceType", placeholder: "Search services..." },
      { id: "3", type: "textarea", label: "Enquiry", name: "enquiry", required: true, rows: 5 },
    ],
  },
};

export default function CreateForm() {
  const { id: formId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!formId;
  const existingForm = formId ? mockForms[formId] : null;

  const [formName, setFormName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedNoteType, setSelectedNoteType] = useState("Enquiry");
  const [fields, setFields] = useState<FormField[]>([]);
  const [draggedField, setDraggedField] = useState<FieldType | null>(null);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [fieldCounter, setFieldCounter] = useState(0);

  // Load form data when editing
  useEffect(() => {
    if (isEditMode && existingForm) {
      setFormName(existingForm.name);
      setSelectedClient(existingForm.client || "");
      setSelectedNoteType(existingForm.noteType);
      setFields(existingForm.fields || []);
      // Set field counter to max field ID to avoid conflicts
      const maxId = existingForm.fields.reduce((max, field) => {
        const fieldNum = parseInt(field.id) || 0;
        return fieldNum > max ? fieldNum : max;
      }, 0);
      setFieldCounter(maxId);
    }
  }, [isEditMode, existingForm]);

  const createField = (type: FieldType): FormField => {
    const counter = fieldCounter + 1;
    setFieldCounter(counter);
    const baseField: FormField = {
      id: `field-${counter}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")} Field`,
      name: `field_${counter}`,
      required: false,
    };

    switch (type) {
      case "textarea":
        return { ...baseField, rows: 4 };
      case "select":
      case "checkbox-group":
      case "radio-group":
        return { ...baseField, options: ["Option 1", "Option 2"] };
      case "file-upload":
        return { ...baseField, accept: ".pdf,.doc,.docx,.jpg,.png" };
      default:
        return baseField;
    }
  };

  const handleDragStart = (e: React.DragEvent, fieldType: FieldType) => {
    setDraggedField(fieldType);
    setDraggedFieldId(null);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `palette-${fieldType}`);
  };

  const handleFieldDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedFieldId(fieldId);
    setDraggedField(null);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `field-${fieldId}`);
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleFieldDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (draggedFieldId && draggedFieldId !== fieldId) {
      setDragOverFieldId(fieldId);
    }
  };

  const handleFieldDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFieldId(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    
    if (data.startsWith("palette-")) {
      // Adding new field from palette
      const fieldType = data.replace("palette-", "") as FieldType;
      if (fieldType) {
        const newField = createField(fieldType);
        setFields([...fields, newField]);
        setDraggedField(null);
        toast({
          title: "Field Added",
          description: `${fieldPalette.find((f) => f.type === fieldType)?.label} added to form.`,
        });
      }
    }
    setDragOverFieldId(null);
  };

  const handleFieldDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const data = e.dataTransfer.getData("text/plain");

    if (data.startsWith("field-")) {
      // Reordering existing field
      const sourceFieldId = data.replace("field-", "");
      if (sourceFieldId && sourceFieldId !== targetFieldId) {
        const sourceIndex = fields.findIndex((f) => f.id === sourceFieldId);
        const targetIndex = fields.findIndex((f) => f.id === targetFieldId);

        if (sourceIndex !== -1 && targetIndex !== -1) {
          const newFields = [...fields];
          const [removed] = newFields.splice(sourceIndex, 1);
          newFields.splice(targetIndex, 0, removed);
          setFields(newFields);
          toast({
            title: "Field Reordered",
            description: "Field position has been updated.",
          });
        }
      }
    } else if (data.startsWith("palette-")) {
      // Adding new field from palette at specific position
      const fieldType = data.replace("palette-", "") as FieldType;
      if (fieldType) {
        const targetIndex = fields.findIndex((f) => f.id === targetFieldId);
        const newField = createField(fieldType);
        const newFields = [...fields];
        newFields.splice(targetIndex, 0, newField);
        setFields(newFields);
        setDraggedField(null);
        toast({
          title: "Field Added",
          description: `${fieldPalette.find((f) => f.type === fieldType)?.label} added to form.`,
        });
      }
    }

    setDraggedFieldId(null);
    setDragOverFieldId(null);
  };

  const handleFieldClick = (field: FormField) => {
    setEditingField({ ...field });
    setIsEditModalOpen(true);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
    toast({
      title: "Field Deleted",
      description: "Field has been removed from the form.",
    });
  };

  const handleSaveField = () => {
    if (!editingField) return;

    setFields(fields.map((f) => (f.id === editingField.id ? editingField : f)));
    setIsEditModalOpen(false);
    setEditingField(null);
    toast({
      title: "Field Updated",
      description: "Field configuration has been saved.",
    });
  };

  const handleClear = () => {
    setFields([]);
    setFormName("");
    setSelectedClient("");
    setSelectedNoteType("Enquiry");
    setFieldCounter(0);
    toast({
      title: "Form Cleared",
      description: "All fields have been removed from the form.",
    });
  };

  const handleSave = () => {
    if (!formName.trim()) {
      toast({
        title: "Validation Error",
        description: "Form Name is required.",
        variant: "destructive",
      });
      return;
    }

    const formData = {
      id: formId || `FORM-${Date.now()}`,
      name: formName,
      client: selectedClient,
      noteType: selectedNoteType,
      fields: fields,
    };

    console.log("Form Data:", formData);
    toast({
      title: isEditMode ? "Form Updated" : "Form Saved",
      description: `Form "${formName}" has been ${isEditMode ? "updated" : "saved"} successfully.`,
    });

    // Navigate back to form builder list
    navigate("/form-builder");
  };

  const getFormJson = () => {
    return JSON.stringify(
      {
        name: formName,
        client: selectedClient,
        noteType: selectedNoteType,
        fields: fields,
      },
      null,
      2
    );
  };

  const renderField = (field: FormField) => {
    const paletteItem = fieldPalette.find((item) => item.type === field.type);
    const Icon = paletteItem?.icon || Type;

    return (
      <div
        key={field.id}
        draggable
        onDragStart={(e) => handleFieldDragStart(e, field.id)}
        onDragOver={(e) => handleFieldDragOver(e, field.id)}
        onDragLeave={handleFieldDragLeave}
        onDrop={(e) => handleFieldDrop(e, field.id)}
        className={cn(
          "group relative border-2 border-dashed rounded-lg p-4 bg-white transition-colors",
          dragOverFieldId === field.id
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400"
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            <Icon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{field.label}</span>
            {field.required && (
              <span className="text-xs text-red-500 font-medium">*</span>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleFieldClick(field)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-500 hover:text-white hover:bg-red-500"
              onClick={() => handleDeleteField(field.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="mt-2">
          {field.type === "text" && (
            <Input placeholder={field.placeholder || "Enter text..."} disabled />
          )}
          {field.type === "textarea" && (
            <Textarea
              rows={field.rows || 4}
              placeholder={field.placeholder || "Enter text..."}
              disabled
            />
          )}
          {field.type === "number" && (
            <Input
              type="number"
              placeholder={field.placeholder || "Enter number..."}
              min={field.min}
              max={field.max}
              disabled
            />
          )}
          {field.type === "date" && (
            <Input type="date" disabled />
          )}
          {field.type === "select" && (
            <Select disabled>
              <SelectTrigger>
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
          )}
          {field.type === "checkbox-group" && (
            <div className="space-y-2">
              {field.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox id={`${field.id}-${idx}`} disabled />
                  <Label htmlFor={`${field.id}-${idx}`} className="font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}
          {field.type === "radio-group" && (
            <RadioGroup disabled>
              {field.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${idx}`} />
                  <Label htmlFor={`${field.id}-${idx}`} className="font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {field.type === "file-upload" && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-6 w-6 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">{field.accept}</p>
            </div>
          )}
          {field.type === "autocomplete" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={field.placeholder || "Type to search..."}
                className="pl-10"
                disabled
              />
            </div>
          )}
          {field.type === "header" && (
            <h2 className="text-2xl font-bold">{field.label}</h2>
          )}
          {field.type === "paragraph" && (
            <p className="text-gray-600">{field.placeholder || "Paragraph text..."}</p>
          )}
          {field.type === "hidden" && (
            <Input type="hidden" value={field.placeholder || ""} disabled />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/form-builder")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{isEditMode ? "Update Form" : "Create Form"}</h1>
          </div>
        </div>

        {/* Form Configuration */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-name">
                Form Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="form-name"
                placeholder="Form Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-type">Notes Type</Label>
              <Select value={selectedNoteType} onValueChange={setSelectedNoteType}>
                <SelectTrigger id="note-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {noteTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Form Canvas */}
          <div className="flex-1 bg-white rounded-lg border p-6 overflow-hidden">
            <div
              className={cn(
                "min-h-[600px] max-h-[calc(100vh-300px)] border-2 border-dashed rounded-lg p-6 transition-colors overflow-y-auto",
                fields.length === 0
                  ? "border-gray-300 bg-gray-50"
                  : "border-gray-200 bg-white"
              )}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {fields.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[500px]">
                  <p className="text-gray-500 text-center">
                    Drag a field from the right to this area
                  </p>
                </div>
              ) : (
                <div className="space-y-4">{fields.map((field) => renderField(field))}</div>
              )}
            </div>
          </div>

          {/* Field Palette */}
          <div className="w-64 bg-white rounded-lg border p-4 space-y-2">
            <h3 className="font-semibold text-sm mb-4">Form Fields</h3>
            {fieldPalette.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-gray-50 transition-colors"
                >
                  <Icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500" onClick={handleClear}>
            Clear
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsJsonModalOpen(true)}
          >
            <FileCode className="h-4 w-4" />
            [{`{...}`}]
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Edit Field Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
          </DialogHeader>
          {editingField && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="field-label">Label</Label>
                <Input
                  id="field-label"
                  value={editingField.label}
                  onChange={(e) =>
                    setEditingField({ ...editingField, label: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-name">Name</Label>
                <Input
                  id="field-name"
                  value={editingField.name}
                  onChange={(e) =>
                    setEditingField({ ...editingField, name: e.target.value })
                  }
                />
              </div>
              {editingField.type !== "header" && editingField.type !== "paragraph" && (
                <div className="space-y-2">
                  <Label htmlFor="field-placeholder">Placeholder</Label>
                  <Input
                    id="field-placeholder"
                    value={editingField.placeholder || ""}
                    onChange={(e) =>
                      setEditingField({ ...editingField, placeholder: e.target.value })
                    }
                  />
                </div>
              )}
              {(editingField.type === "select" ||
                editingField.type === "checkbox-group" ||
                editingField.type === "radio-group") && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  <Textarea
                    value={editingField.options?.join("\n") || ""}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        options: e.target.value.split("\n").filter((o) => o.trim()),
                      })
                    }
                    placeholder="Enter options, one per line"
                    rows={4}
                  />
                </div>
              )}
              {editingField.type === "textarea" && (
                <div className="space-y-2">
                  <Label htmlFor="field-rows">Rows</Label>
                  <Input
                    id="field-rows"
                    type="number"
                    min="1"
                    max="20"
                    value={editingField.rows || 4}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        rows: parseInt(e.target.value) || 4,
                      })
                    }
                  />
                </div>
              )}
              {editingField.type === "number" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field-min">Min</Label>
                    <Input
                      id="field-min"
                      type="number"
                      value={editingField.min || ""}
                      onChange={(e) =>
                        setEditingField({
                          ...editingField,
                          min: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="field-max">Max</Label>
                    <Input
                      id="field-max"
                      type="number"
                      value={editingField.max || ""}
                      onChange={(e) =>
                        setEditingField({
                          ...editingField,
                          max: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              )}
              {editingField.type === "file-upload" && (
                <div className="space-y-2">
                  <Label htmlFor="field-accept">Accept File Types</Label>
                  <Input
                    id="field-accept"
                    value={editingField.accept || ""}
                    onChange={(e) =>
                      setEditingField({ ...editingField, accept: e.target.value })
                    }
                    placeholder=".pdf,.doc,.jpg"
                  />
                </div>
              )}
              {(editingField.type === "header" || editingField.type === "paragraph") && (
                <div className="space-y-2">
                  <Label htmlFor="field-content">Content</Label>
                  <Textarea
                    id="field-content"
                    value={editingField.placeholder || ""}
                    onChange={(e) =>
                      setEditingField({ ...editingField, placeholder: e.target.value })
                    }
                    rows={editingField.type === "paragraph" ? 4 : 2}
                  />
                </div>
              )}
              {editingField.type !== "header" &&
                editingField.type !== "paragraph" &&
                editingField.type !== "hidden" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="field-required"
                      checked={editingField.required || false}
                      onCheckedChange={(checked) =>
                        setEditingField({ ...editingField, required: checked as boolean })
                      }
                    />
                    <Label htmlFor="field-required" className="font-normal cursor-pointer">
                      Required
                    </Label>
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveField}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* JSON View Modal */}
      <Dialog open={isJsonModalOpen} onOpenChange={setIsJsonModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Form JSON</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[500px] text-sm">
              {getFormJson()}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJsonModalOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(getFormJson());
                toast({
                  title: "Copied",
                  description: "JSON has been copied to clipboard.",
                });
              }}
            >
              Copy JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

