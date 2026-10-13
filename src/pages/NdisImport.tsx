import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Get current financial year (Australian financial year: July 1 to June 30)
const getCurrentFinancialYear = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  // If month is July (6) or later, financial year starts this year
  // Otherwise, it started last year
  if (month >= 6) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

interface PriceItem {
  id: string;
  dayOfWeek: string;
  time: string;
  pricePerHour: string;
  effectiveDate: string;
  itemNo: string;
  multiplier: string;
}

interface PriceSection {
  id: string;
  heading: string;
  items: PriceItem[];
}

const mockSections: PriceSection[] = [
  {
    id: "1",
    heading: "Assistance With Self-Care Activities",
    items: [
      {
        id: "1-1",
        dayOfWeek: "Weekdays - Mon Tue Wed Thu Fri",
        time: "00 AM - 06 AM",
        pricePerHour: "78.81",
        effectiveDate: "01-Jul-2025",
        itemNo: "01_002_0107_1_1",
        multiplier: "1:1",
      },
      {
        id: "1-2",
        dayOfWeek: "Weekdays - Mon Tue Wed Thu Fri",
        time: "06 AM - 20 PM",
        pricePerHour: "70.23",
        effectiveDate: "01-Jul-2025",
        itemNo: "01_011_0107_1_1",
        multiplier: "1:1",
      },
      {
        id: "1-3",
        dayOfWeek: "Public Holidays",
        time: "00 AM - 23 PM",
        pricePerHour: "156.03",
        effectiveDate: "01-Jul-2025",
        itemNo: "01_012_0107_1_1",
        multiplier: "1:1",
      },
      {
        id: "1-4",
        dayOfWeek: "Saturday",
        time: "00 AM - 23 PM",
        pricePerHour: "98.83",
        effectiveDate: "01-Jul-2025",
        itemNo: "01_013_0107_1_1",
        multiplier: "1:1",
      },
      {
        id: "1-5",
        dayOfWeek: "Sunday",
        time: "00 AM - 23 PM",
        pricePerHour: "127.43",
        effectiveDate: "01-Jul-2025",
        itemNo: "01_014_0107_1_1",
        multiplier: "1:1",
      },
      {
        id: "1-6",
        dayOfWeek: "Weekdays - Mon Tue Wed Thu Fri",
        time: "20 PM - 23 PM",
        pricePerHour: "77.38",
        effectiveDate: "01-Jul-2025",
        itemNo: "01_015_0107_1_1",
        multiplier: "1:1",
      },
      {
        id: "1-7",
        dayOfWeek: "Sleepover",
        time: "00 AM - 23 PM",
        pricePerHour: "297.6",
        effectiveDate: "01-Jul-2025",
        itemNo: "01_016_0107_1_1",
        multiplier: "1:1",
      },
    ],
  },
  {
    id: "2",
    heading: "Assistance From Live-In Carer",
    items: [
      {
        id: "2-1",
        dayOfWeek: "Weekdays - Mon Tue Wed Thu Fri",
        time: "00 AM - 23 PM",
        pricePerHour: "0",
        effectiveDate: "01-Jul-2025",
        itemNo: "01_003_0107_1_1",
        multiplier: "1:1",
      },
    ],
  },
];

// Generate financial year options (current year and next 5 years)
const generateFinancialYears = (): string[] => {
  const years: string[] = [];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Start from current financial year
  let startYear = currentMonth >= 6 ? currentYear : currentYear - 1;

  for (let i = 0; i < 6; i++) {
    years.push(`${startYear + i}-${startYear + i + 1}`);
  }

  return years;
};

// Component for section checkbox with indeterminate support
interface SectionCheckboxProps {
  sectionId: string;
  checked: boolean;
  indeterminate: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function SectionCheckbox({
  sectionId,
  checked,
  indeterminate,
  onCheckedChange,
}: SectionCheckboxProps) {
  // Note: Radix UI Checkbox doesn't support indeterminate state directly
  // The visual state is handled by the checked prop and styling
  return (
    <Checkbox
      checked={checked || indeterminate}
      onCheckedChange={(checked) => onCheckedChange(checked === true)}
      className={indeterminate && !checked ? "opacity-50" : ""}
    />
  );
}

export default function NdisImport() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>(getCurrentFinancialYear());
  const [selectedSearchColumn, setSelectedSearchColumn] = useState<string>("name");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const financialYears = generateFinancialYears();

  // Filter items based on search and selected column
  const filteredSections = useMemo(() => {
    if (!search.trim()) {
      return mockSections;
    }

    const searchLower = search.toLowerCase();

    return mockSections.map((section) => {
      const filteredItems = section.items.filter((item) => {
        if (selectedSearchColumn === "name") {
          // Search only in "Day of Week"
          return item.dayOfWeek.toLowerCase().includes(searchLower);
        } else if (selectedSearchColumn === "item") {
          // Search only in "Item No"
          return item.itemNo.toLowerCase().includes(searchLower);
        }
        return true;
      });

      // Return section with filtered items, or hide section if no items match
      if (filteredItems.length === 0) {
        return null;
      }

      return {
        ...section,
        items: filteredItems,
      };
    }).filter((section): section is PriceSection => section !== null);
  }, [search, selectedSearchColumn]);

  const handleSelectAll = (sectionId: string, checked: boolean) => {
    const section = mockSections.find((s) => s.id === sectionId);
    if (!section) return;

    const newSelected = new Set(selectedItems);
    if (checked) {
      section.items.forEach((item) => newSelected.add(item.id));
    } else {
      section.items.forEach((item) => newSelected.delete(item.id));
    }
    setSelectedItems(newSelected);
  };

  const handleItemSelect = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const isSectionAllSelected = (sectionId: string): boolean => {
    const section = mockSections.find((s) => s.id === sectionId);
    if (!section || section.items.length === 0) return false;
    return section.items.every((item) => selectedItems.has(item.id));
  };

  const isSectionSomeSelected = (sectionId: string): boolean => {
    const section = mockSections.find((s) => s.id === sectionId);
    if (!section) return false;
    return section.items.some((item) => selectedItems.has(item.id)) && !isSectionAllSelected(sectionId);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">NDIS Import Price</h1>
        </div>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
        <div className="flex-1">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md"
          />
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedFinancialYear} onValueChange={setSelectedFinancialYear}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Financial Year" />
            </SelectTrigger>
            <SelectContent>
              {financialYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSearchColumn} onValueChange={setSelectedSearchColumn}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Day of Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Day of Week</SelectItem>
              <SelectItem value="item">Item</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No sections found matching your search criteria.
          </div>
        ) : (
          filteredSections.map((section) => (
            <div key={section.id} className="space-y-4">
              <h2 className="text-xl font-bold text-blue-600">{section.heading}</h2>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <SectionCheckbox
                          sectionId={section.id}
                          checked={isSectionAllSelected(section.id)}
                          indeterminate={isSectionSomeSelected(section.id)}
                          onCheckedChange={(checked) =>
                            handleSelectAll(section.id, checked === true)
                          }
                        />
                      </TableHead>
                      <TableHead>Day of Week</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Price Per Hour</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Item No</TableHead>
                      <TableHead>Multiplier</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {section.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={(checked) =>
                              handleItemSelect(item.id, checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell>{item.dayOfWeek}</TableCell>
                        <TableCell>{item.time}</TableCell>
                        <TableCell>{item.pricePerHour}</TableCell>
                        <TableCell>{item.effectiveDate}</TableCell>
                        <TableCell>{item.itemNo}</TableCell>
                        <TableCell>{item.multiplier}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

