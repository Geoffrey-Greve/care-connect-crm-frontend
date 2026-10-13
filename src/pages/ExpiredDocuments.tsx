import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ChevronUp, ChevronDown, Download, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface Document {
  id: string;
  serialNo: number;
  client: string;
  category: string;
  name: string;
  expires: string; // Relative time like "12 hours ago"
}

const mockDocuments: Document[] = [
  {
    id: "DOC-001",
    serialNo: 1,
    client: "Test Test Test",
    category: "Tester demo",
    name: "RLL_Racing_QA_Report_1dQcV8.docx",
    expires: "12 hours ago",
  },
];

type SortField = 'serialNo' | 'client' | 'category' | 'name' | 'expires';
type SortDirection = 'asc' | 'desc' | null;

export default function ExpiredDocuments() {
  const [documents] = useState<Document[]>(mockDocuments);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterClient, setFilterClient] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Get unique clients and categories for filter dropdowns
  const uniqueClients = useMemo(() => {
    const clients = Array.from(new Set(documents.map(doc => doc.client)));
    return clients.sort();
  }, [documents]);

  const uniqueCategories = useMemo(() => {
    const categories = Array.from(new Set(documents.map(doc => doc.category)));
    return categories.sort();
  }, [documents]);

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let result = [...documents];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(doc =>
        doc.client.toLowerCase().includes(searchLower) ||
        doc.category.toLowerCase().includes(searchLower) ||
        doc.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply advanced filters
    if (filterClient && filterClient !== "all") {
      result = result.filter(doc => doc.client === filterClient);
    }
    if (filterCategory && filterCategory !== "all") {
      result = result.filter(doc => doc.category === filterCategory);
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case 'serialNo':
            aValue = a.serialNo;
            bValue = b.serialNo;
            break;
          case 'client':
            aValue = a.client;
            bValue = b.client;
            break;
          case 'category':
            aValue = a.category;
            bValue = b.category;
            break;
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'expires':
            aValue = a.expires;
            bValue = b.expires;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [documents, search, sortField, sortDirection, filterClient, filterCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDocuments.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedDocuments = filteredAndSortedDocuments.slice(startIndex, endIndex);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manage Expired Document</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select value={entriesPerPage.toString()} onValueChange={(value) => {
                setEntriesPerPage(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[80px] h-8">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Search:</span>
                <Input
                  type="text"
                  placeholder=""
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-[200px] h-8"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead className="w-[100px]">
                    <button
                      onClick={() => handleSort('serialNo')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Serial No
                      {getSortIcon('serialNo')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('client')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Client
                      {getSortIcon('client')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Category
                      {getSortIcon('category')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Name
                      {getSortIcon('name')}
                    </button>
                  </TableHead>
                  <TableHead className="w-[100px]">
                    <span className="font-semibold">Document</span>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('expires')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors font-semibold"
                    >
                      Expires
                      {getSortIcon('expires')}
                    </button>
                  </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedDocuments.length > 0 ? (
                  paginatedDocuments.map((document) => (
                <TableRow key={document.id}>
                      <TableCell>{document.serialNo}</TableCell>
                      <TableCell>{document.client}</TableCell>
                      <TableCell>{document.category}</TableCell>
                      <TableCell>{document.name}</TableCell>
                  <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                  </TableCell>
                      <TableCell>{document.expires}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No documents found
                  </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedDocuments.length)} of {filteredAndSortedDocuments.length} entries
                    </div>
                      <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || totalPages === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filter Modal */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filter Client Expired Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-client">Client</Label>
              <Select 
                value={filterClient || "all"} 
                onValueChange={(value) => setFilterClient(value === "all" ? "" : value)}
              >
                <SelectTrigger id="filter-client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {uniqueClients.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-category">Category</Label>
              <Select 
                value={filterCategory || "all"} 
                onValueChange={(value) => setFilterCategory(value === "all" ? "" : value)}
              >
                <SelectTrigger id="filter-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
              </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFilterModalOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsFilterModalOpen(false);
              setCurrentPage(1);
            }}>
              Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
