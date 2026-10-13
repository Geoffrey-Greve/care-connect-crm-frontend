import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, Leaf, MoreVertical, User, Eye, Users, Clock, Calendar, FileText, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import LeaveForm, { LeaveFormData } from "@/components/LeaveForm";
import { useToast } from "@/hooks/use-toast";
  import RichTextEditor from "@/components/RichTextEditor";
  import { mockStaff } from "./StaffDetail";


interface CalendarEvent {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  type: "invoiced" | "booked" | "pending" | "leave" | "holiday";
  label?: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    staffId: "1",
    date: "2025-11-14",
    type: "leave",
    label: "Leave",
  },
  {
    id: "2",
    staffId: "2",
    date: "2025-11-12",
    type: "booked",
  },
  {
    id: "3",
    staffId: "3",
    date: "2025-11-15",
    type: "pending",
  },
];

type ViewType = "day" | "week" | "month";

export default function Panel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedView, setSelectedView] = useState<ViewType>("week");
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 10)); // November 10, 2025
  const [selectedStaff, setSelectedStaff] = useState<string>("staff");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeaveFormOpen, setIsLeaveFormOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedStaffForNotes, setSelectedStaffForNotes] = useState<any | null>(null);
  const [noteData, setNoteData] = useState({
    noteType: "",
    isPrivate: false,
    description: "",
    image: null as File | null,
  });

  // Get date range based on view type
  const getDateRange = (date: Date, view: ViewType) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    switch (view) {
      case "day": {
        const start = new Date(year, month, day);
        return { start, end: start, days: [start] };
      }
      case "week": {
        const start = new Date(year, month, day);
        const dayOfWeek = start.getDay();
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
        const weekStart = new Date(year, month, diff);
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(weekStart);
          d.setDate(weekStart.getDate() + i);
          return d;
        });
        return { start: days[0], end: days[6], days };
      }
      case "month": {
        // For month view, show only days from 1 to the end of the month
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0); // Last day of the month
        const daysInMonth = lastDayOfMonth.getDate();

        // Create array with days from 1 to the last day of the month
        const days = Array.from({ length: daysInMonth }, (_, i) => {
          return new Date(year, month, i + 1);
        });
        return { start: days[0], end: days[days.length - 1], days };
      }
    }
  };

  const dateRange = useMemo(() => getDateRange(currentDate, selectedView), [currentDate, selectedView]);

  // Filter staff based on search
  const filteredStaff = useMemo(() => {
    if (searchQuery) {
      return mockStaff.filter((staff) =>
        staff.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return mockStaff;
  }, [searchQuery]);

  // Get events for a specific date and staff
  const getEventsForDate = (date: Date, staffId?: string) => {
    const dateStr = date.toISOString().split("T")[0];
    return mockEvents.filter(
      (event) =>
        event.date === dateStr &&
        (!staffId || event.staffId === staffId) &&
        (selectedStaff === "staff" || selectedStaff === "client")
    );
  };

  // Navigate calendar
  const navigateCalendar = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    switch (selectedView) {
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "month":
        // For month view, always navigate to the first day of the previous/next month
        const year = newDate.getFullYear();
        const month = newDate.getMonth();
        if (direction === "next") {
          newDate.setFullYear(year, month + 1, 1);
        } else {
          newDate.setFullYear(year, month - 1, 1);
        }
        break;
    }
    setCurrentDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    const today = new Date();
    // If in month view, snap to the first day of the current month
    if (selectedView === "month") {
      today.setDate(1);
    }
    setCurrentDate(today);
  };

  // Format date range display
  const formatDateRange = () => {
    const { start, end } = dateRange;
    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];

    if (selectedView === "day") {
      return `${months[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()}`;
    } else if (selectedView === "week") {
      return `${months[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      // For month view, show full month name and year
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${monthNames[start.getMonth()]} ${start.getFullYear()}`;
    }
  };

  // Get day name
  const getDayName = (date: Date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  };

  // Get event color
  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "invoiced":
        return "bg-blue-200 border-blue-300";
      case "booked":
        return "bg-green-200 border-green-300";
      case "pending":
        return "bg-pink-200 border-pink-300";
      case "leave":
        return "bg-gray-200 border-gray-300";
      case "holiday":
        return "bg-yellow-200 border-yellow-300";
      default:
        return "bg-gray-200 border-gray-300";
    }
  };

  return (
    <div className="relative p-6 w-screen max-w-[86vw] overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-white border rounded-lg p-4 space-y-4 mb-4">
        <div className="flex items-center justify-between">
          {/* Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded"></div>
              <span className="text-sm">Invoiced</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
              <span className="text-sm">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-200 border border-pink-300 rounded"></div>
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
              <span className="text-sm">Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
              <span className="text-sm">Holiday</span>
            </div>
          </div>

          {/* Global Controls */}
          <div className="flex items-center gap-4">
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px]"
            />
            <Button onClick={() => setIsLeaveFormOpen(true)}>
              <Leaf className="h-4 w-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>

        {/* Secondary Control Bar */}
        <div className="flex items-center justify-between">
          {/* Left - Calendar Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateCalendar("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateCalendar("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/panel/add-event')}>Add</Button>
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
          </div>

          {/* Center - Date Range */}
          <div className="font-bold text-lg">
            {formatDateRange()}
          </div>

          {/* Right - View Toggles */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={selectedView === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setSelectedView("day");
              }}
              className={cn(
                selectedView === "day" && "bg-gray-800 text-white hover:bg-gray-700"
              )}
            >
              Day
            </Button>
            <Button
              variant={selectedView === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setSelectedView("week");
              }}
              className={cn(
                selectedView === "week" && "bg-gray-800 text-white hover:bg-gray-700"
              )}
            >
              Week
            </Button>
            <Button
              variant={selectedView === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                // When switching to month view, snap to the first day of the current month
                const newDate = new Date(currentDate);
                newDate.setDate(1);
                setCurrentDate(newDate);
                setSelectedView("month");
              }}
              className={cn(
                selectedView === "month" && "bg-gray-800 text-white hover:bg-gray-700"
              )}
            >
              Month
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0.5">
          {/* Scrollable Content */}
          <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
            <div className="inline-block min-w-full">
              {/* Header Row - Days - Scrollable with content */}
              <div className="grid border-b bg-gray-50 sticky top-0 z-20" style={{
                gridTemplateColumns: `250px repeat(${dateRange.days.length}, minmax(150px, 1fr))`,
                minWidth: `${250 + (dateRange.days.length * 150)}px`
              }}>
                <div className="p-4 font-semibold border-r bg-gray-50 sticky left-0 z-30">Staff</div>
                {dateRange.days.map((day, index) => (
                  <div
                    key={index}
                    className="p-4 text-center border-r last:border-r-0 bg-gray-50"
                  >
                    <div className="font-semibold">{getDayName(day).slice(0, 3)}</div>
                    <div className="text-sm text-muted-foreground">{day.getDate()}</div>
                  </div>
                ))}
              </div>

              {/* Staff Rows */}
              {filteredStaff.map((staff:any) => (
                <div
                  key={staff.id}
                  className="grid border-b last:border-b-0"
                  style={{
                    gridTemplateColumns: `250px repeat(${dateRange.days.length}, minmax(150px, 1fr))`,
                    minWidth: `${250 + (dateRange.days.length * 150)}px`
                  }}
                >
                  {/* Staff Name Column */}
                  <div className="p-4 border-r flex items-center gap-3 sticky left-0 bg-white w-[250px] z-20">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-sm">{staff.fullName}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto hover:bg-gray-100">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate(`/staff/${staff.id}`)} className="flex items-center gap-2 cursor-pointer">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            setSelectedStaffForNotes(staff);
                            setNoteData({
                              noteType: "",
                              isPrivate: false,
                              description: "",
                              image: null,
                            });
                            setIsNotesModalOpen(true);
                          }}
                        >
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Communications</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => navigate(`/timesheet/${staff.id}`)}
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Timesheet</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => navigate(`/manage-calendar/${staff.id}`)}
                        >
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Calendar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => navigate(`/staff/${staff.id}/documents`)}
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>Documents</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Calendar Cells */}
                  {dateRange.days.map((day, dayIndex) => {
                    const events = getEventsForDate(day, staff.id);
                    return (
                      <div
                        key={dayIndex}
                        className="p-2 border-r last:border-r-0 min-h-[80px] relative"
                      >
                        {events.map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "rounded-lg p-2 mb-1 text-xs flex flex-col items-center",
                              getEventColor(event.type)
                            )}
                          >
                            {event.type === "leave" ? (
                              <>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center mb-1">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-medium">{event.label || "Leave"}</span>
                              </>
                            ) : (
                              <span className="font-medium capitalize">{event.type}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Form Modal */}
      <LeaveForm
        header="Add Unavailability"
        isOpen={isLeaveFormOpen}
        onClose={() => setIsLeaveFormOpen(false)}
        onSubmit={(data: LeaveFormData) => {
          // Handle leave form submission
          toast({
            title: "Leave Request Submitted",
            description: `Leave request has been submitted successfully.`,
          });
          setIsLeaveFormOpen(false);
        }}
        staffList={mockStaff.map((staff:any) => ({ id: staff.id, name: staff.fullName }))}
      />

      {/* Add Notes Modal */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-xl font-semibold">
              {selectedStaffForNotes?.fullName || "Add Notes"}
            </DialogTitle>
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 mr-10">
              <Eye className="h-4 w-4 mr-2" />
              View Notes
            </Button>
          </div>

          <div className="space-y-6 py-4">
            {/* Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="note-type">
                Notes <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-3">
                <Select
                  value={noteData.noteType}
                  onValueChange={(value) => setNoteData({ ...noteData, noteType: value })}
                >
                  <SelectTrigger id="note-type" className="flex-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="incident">Incident</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="private-note"
                    checked={noteData.isPrivate}
                    onCheckedChange={(checked) => setNoteData({ ...noteData, isPrivate: checked as boolean })}
                  />
                  <Label htmlFor="private-note" className="cursor-pointer">
                    Private
                  </Label>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <Label htmlFor="note-description">Description</Label>
              <RichTextEditor
                value={noteData.description}
                onChange={(value) => setNoteData({ ...noteData, description: value })}
                placeholder="Description"
                minHeight="300px"
              />
            </div>

            {/* Upload Image Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="note-image">Upload Image</Label>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="note-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNoteData({ ...noteData, image: file });
                  }}
                  className="cursor-pointer"
                />
                {noteData.image && (
                  <span className="text-sm text-muted-foreground">
                    {noteData.image.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => {
                setIsNotesModalOpen(false);
                setNoteData({
                  noteType: "",
                  isPrivate: false,
                  description: "",
                  image: null,
                });
                setSelectedStaffForNotes(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!noteData.noteType) {
                  toast({
                    title: "Validation Error",
                    description: "Please select a note type.",
                    variant: "destructive",
                  });
                  return;
                }
                // Handle save notes
                toast({
                  title: "Notes Added",
                  description: `Notes have been added successfully for ${selectedStaffForNotes?.name}.`,
                });
                setIsNotesModalOpen(false);
                setNoteData({
                  noteType: "",
                  isPrivate: false,
                  description: "",
                  image: null,
                });
                setSelectedStaffForNotes(null);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}