import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp, MoreVertical, Plus, Upload, Eye, Pencil, Trash2 } from "lucide-react";
import StatusChangeModal from "@/components/StatusChangeModal";
import { useToast } from "@/hooks/use-toast";

type FormStatus = "Active" | "Inactive";

interface FormTemplate {
  id: string;
  serialNo: number;
  name: string;
  noteType: string;
  clientName: string;
  status: FormStatus;
}

const mockFormTemplates: FormTemplate[] = [
  { id: "FORM-001", serialNo: 1, name: "Incident_Staff_Form", noteType: "Incident", clientName: "-", status: "Inactive" },
  { id: "FORM-002", serialNo: 2, name: "Incident_Admin_Form", noteType: "Incident", clientName: "-", status: "Inactive" },
  { id: "FORM-003", serialNo: 3, name: "Enquiry Form", noteType: "Enquiry", clientName: "-", status: "Inactive" },
  { id: "FORM-004", serialNo: 4, name: "Feedback_Form", noteType: "Feedback", clientName: "-", status: "Inactive" },
  { id: "FORM-005", serialNo: 5, name: "Notes_Form", noteType: "Notes", clientName: "-", status: "Inactive" },
  { id: "FORM-006", serialNo: 6, name: "Injury Form", noteType: "Injury", clientName: "-", status: "Inactive" },
  { id: "FORM-007", serialNo: 7, name: "Client Enquiry Form", noteType: "Enquiry", clientName: "Harrison", status: "Inactive" },
];

type SortField = "serialNo" | "name" | "noteType" | "clientName" | "status";
type SortDirection = "asc" | "desc" | null;

const FormBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [forms, setForms] = useState<FormTemplate[]>(mockFormTemplates);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);

  const filteredAndSortedForms = useMemo(() => {
    let result = [...forms];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (form) =>
          form.name.toLowerCase().includes(searchLower) ||
          form.noteType.toLowerCase().includes(searchLower) ||
          form.clientName.toLowerCase().includes(searchLower) ||
          form.status.toLowerCase().includes(searchLower),
      );
    }

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number = a[sortField];
        let bValue: string | number = b[sortField];

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }

        return sortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return result;
  }, [forms, search, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedForms.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedForms = filteredAndSortedForms.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <span className="flex flex-col">
          <ChevronUp className="h-3 w-3 opacity-30" />
          <ChevronDown className="h-3 w-3 -mt-2 opacity-30" />
        </span>
      );
    }

    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const handleStatusClick = (form: FormTemplate) => {
    setSelectedForm(form);
    setShowStatusModal(true);
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedForm) return;

    // Update form status
    setForms(
      forms.map((form) =>
        form.id === selectedForm.id ? { ...form, status: newStatus as FormStatus } : form
      )
    );

    toast({
      title: "Status Updated",
      description: `Form status has been updated to ${newStatus}.`,
    });

    setShowStatusModal(false);
    setSelectedForm(null);
  };

  const handleView = (formId: string) => {
    navigate(`/form-view/${formId}`);
  };

  const handleEdit = (formId: string) => {
    navigate(`/create-form/${formId}`);
  };

  const handleDelete = (formId: string) => {
    const form = forms.find((f) => f.id === formId);
    if (form) {
      setForms(forms.filter((f) => f.id !== formId));
      toast({
        title: "Form Deleted",
        description: `Form "${form.name}" has been deleted successfully.`,
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Forms</h1>
          <div className="flex items-center gap-3">
            <Button variant="default" className="bg-[#0b1f4b] text-white hover:bg-[#0b1f4b]/90" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              variant="default"
              className="bg-[#0b1f4b] text-white hover:bg-[#0b1f4b]/90"
              size="sm"
              onClick={() => navigate("/create-form")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <Select
              value={entriesPerPage.toString()}
              onValueChange={(value) => {
                setEntriesPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="form-search" className="text-sm text-muted-foreground">
              Search:
            </label>
            <Input
              id="form-search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-[250px]"
              placeholder="Search forms..."
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <button className="flex items-center gap-2 font-semibold" onClick={() => handleSort("serialNo")}>
                  Serial No
                  {getSortIcon("serialNo")}
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-2 font-semibold" onClick={() => handleSort("name")}>
                  Name
                  {getSortIcon("name")}
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-2 font-semibold" onClick={() => handleSort("noteType")}>
                  Note Type
                  {getSortIcon("noteType")}
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-2 font-semibold" onClick={() => handleSort("clientName")}>
                  Client Name
                  {getSortIcon("clientName")}
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-2 font-semibold" onClick={() => handleSort("status")}>
                  Status
                  {getSortIcon("status")}
                </button>
              </TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedForms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                  No forms found
                </TableCell>
              </TableRow>
            ) : (
              paginatedForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>{form.serialNo}</TableCell>
                  <TableCell className="font-medium">{form.name}</TableCell>
                  <TableCell>{form.noteType}</TableCell>
                  <TableCell>{form.clientName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`px-4 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                        form.status === "Active"
                          ? "border-green-300 bg-green-50 text-green-500"
                          : "border-red-300 bg-red-50 text-red-500"
                      }`}
                      onClick={() => handleStatusClick(form)}
                    >
                      {form.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(form.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(form.id)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(form.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          Showing {filteredAndSortedForms.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(endIndex, filteredAndSortedForms.length)} of {filteredAndSortedForms.length} entries
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-10"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={showStatusModal}
        onOpenChange={setShowStatusModal}
        title="Change Form Status"
        nameLabel="Form Name"
        nameValue={selectedForm?.name || ""}
        currentStatus={selectedForm?.status || ""}
        statusOptions={["Active", "Inactive"]}
        onConfirm={handleStatusChange}
      />
    </div>
  );
};

export default FormBuilder;

