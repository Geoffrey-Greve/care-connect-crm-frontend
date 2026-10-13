import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DocumentItem {
  id: string;
  serialNo: number;
  title: string;
  link: string;
  fileType?: string; // e.g., "pdf", "apk", "docx"
  fileUrl?: string; // Full URL or path to the file
}

const mockDocuments: DocumentItem[] = [
  { id: "1", serialNo: 1, title: "Support Documents", link: "support-documents", fileType: "pdf", fileUrl: "/documents/support-documents.pdf" },
  { id: "2", serialNo: 2, title: "Android Apk", link: "android-apk", fileType: "apk", fileUrl: "/documents/android-app.apk" },
];

type SortField = "serialNo" | "title" | "link";
type SortDirection = "asc" | "desc" | null;

export default function UserGuideDocuments() {
  const [documents] = useState<DocumentItem[]>(mockDocuments);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const filteredAndSortedDocuments = useMemo(() => {
    let result = [...documents];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (document) =>
          document.title.toLowerCase().includes(searchLower) ||
          document.link.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
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
  }, [documents, search, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedDocuments.length / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedDocuments = filteredAndSortedDocuments.slice(startIndex, endIndex);

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

  const handleView = (doc: DocumentItem) => {
    // Browser-supported file types that can be opened in a new tab
    const browserSupportedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'txt', 'html', 'htm', 'xml', 'json', 'csv'];
    
    // Get file type from document or infer from link/URL
    const fileType = doc.fileType || doc.link.split('.').pop()?.toLowerCase() || '';
    const fileUrl = doc.fileUrl || `/documents/${doc.link}`;
    
    if (browserSupportedTypes.includes(fileType)) {
      // Open in new tab for browser-supported files
      window.open(fileUrl, '_blank');
    } else {
      // Download directly for non-browser-supported files (like APK, ZIP, etc.)
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = doc.title || doc.link;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Documents</h1>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
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
          <span className="text-sm text-muted-foreground">entries</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Search:</span>
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-[250px]"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  className="flex items-center gap-2 font-semibold"
                  onClick={() => handleSort("serialNo")}
                >
                  Serial No
                  {getSortIcon("serialNo")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-2 font-semibold"
                  onClick={() => handleSort("title")}
                >
                  Title
                  {getSortIcon("title")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-2 font-semibold"
                  onClick={() => handleSort("link")}
                >
                  Link
                  {getSortIcon("link")}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                  No documents found
                </TableCell>
              </TableRow>
            ) : (
              paginatedDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{document.serialNo}</TableCell>
                  <TableCell className="font-medium">{document.title}</TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                      onClick={() => handleView(document)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          Showing {filteredAndSortedDocuments.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(endIndex, filteredAndSortedDocuments.length)} of {filteredAndSortedDocuments.length} entries
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
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

