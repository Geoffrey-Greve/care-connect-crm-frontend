import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Plus, MoreVertical, ChevronLeft, ChevronRight, Eye, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusChangeModal from "@/components/StatusChangeModal";
import NotificationForm, { NotificationFormData } from "@/components/NotificationForm";
import { useToast } from "@/hooks/use-toast";
import {
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useToggleNotificationStatusMutation,
  useDeleteNotificationMutation,
  useGetNotificationByIdQuery,
} from "@/redux/api/notificationApi";
import { useGetStaffsQuery } from "@/redux/api/staffApi";
import { ErrorDialog } from "@/components/ErrorDialog";
import type { Notification as NotificationType } from "@/types/models";

const notificationTypes = ["All", "Reminder", "Document", "Schedule", "Training", "Compliance", "Alert"];

type SortField = 'serialNo' | 'staffName' | 'message' | 'type' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export default function NotificationList() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);
  const [selectedNotificationStatus, setSelectedNotificationStatus] = useState<boolean | null>(null);
  const [isNotificationFormOpen, setIsNotificationFormOpen] = useState(false);
  const [editingNotificationId, setEditingNotificationId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch notifications from API
  const { data: notificationsData, isLoading: isLoadingNotifications } = useGetNotificationsQuery();
  
  // Fetch staff for NotificationForm
  const { data: staffsData } = useGetStaffsQuery({ status: "1" });

  // Fetch notification by ID for editing
  const { data: notificationData } = useGetNotificationByIdQuery(
    editingNotificationId || 0,
    { skip: !editingNotificationId }
  );

  // Mutations
  const [createNotification, { isLoading: isCreatingNotification }] = useCreateNotificationMutation();
  const [updateNotification, { isLoading: isUpdatingNotification }] = useUpdateNotificationMutation();
  const [toggleNotificationStatus, { isLoading: isTogglingStatus }] = useToggleNotificationStatusMutation();
  const [deleteNotification, { isLoading: isDeletingNotification }] = useDeleteNotificationMutation();

  // Transform API notifications to display format
  const notifications = useMemo(() => {
    if (!notificationsData?.data) return [];
    return notificationsData.data.map((notif: NotificationType, index: number) => ({
      id: notif.id.toString(),
      serialNo: index + 1,
      staffName: notif.title || "System", // Using title as staff name for now
      staffId: "", // Not available in API response
      message: notif.message,
      type: notif.type === "sos" ? "SOS" : notif.type === "other" ? "Other" : notif.type,
      status: notif.status ? "Active" : "Inactive",
      statusValue: notif.status,
      rawNotification: notif,
    }));
  }, [notificationsData]);

  // Prepare staff options for NotificationForm
  const staffOptions = useMemo(() => {
    if (!staffsData?.data) return [];
    return staffsData.data.map(staff => ({
      id: staff.id.toString(),
      name: `${staff.first_name} ${staff.last_name}`,
    }));
  }, [staffsData]);

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

  // Filter and sort notifications
  const filteredAndSortedNotifications = useMemo(() => {
    let result = [...notifications];

    // Apply type filter
    if (typeFilter && typeFilter !== "All") {
      result = result.filter(n => n.type === typeFilter);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(n =>
        n.staffName.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower) ||
        n.type.toLowerCase().includes(searchLower)
      );
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
          case 'staffName':
            aValue = a.staffName;
            bValue = b.staffName;
            break;
          case 'message':
            aValue = a.message;
            bValue = b.message;
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }

    return result;
  }, [notifications, typeFilter, search, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedNotifications.length / entriesPerPage);
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return filteredAndSortedNotifications.slice(startIndex, startIndex + entriesPerPage);
  }, [filteredAndSortedNotifications, currentPage, entriesPerPage]);

  const handleStatusClick = (notificationId: number, currentStatus: boolean) => {
    setSelectedNotificationId(notificationId);
    setSelectedNotificationStatus(currentStatus);
    setShowStatusModal(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedNotificationId) return;

    try {
      await toggleNotificationStatus(selectedNotificationId).unwrap();
      toast({
        title: "Status Updated",
        description: `Notification status has been updated to ${newStatus}.`,
      });
      setShowStatusModal(false);
      setSelectedNotificationId(null);
      setSelectedNotificationStatus(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to update status";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setShowStatusModal(false);
      setSelectedNotificationId(null);
      setSelectedNotificationStatus(null);
    }
  };

  const handleDeleteClick = (notificationId: number) => {
    setNotificationToDelete(notificationId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;

    try {
      await deleteNotification(notificationToDelete).unwrap();
      toast({
        title: "Notification Deleted",
        description: "The notification has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setNotificationToDelete(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || "Failed to delete notification";
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setIsDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };

  const handleView = (notificationId: string) => {
    setEditingNotificationId(parseInt(notificationId));
    setIsNotificationFormOpen(true);
  };

  const handleNotificationFormSubmit = async (data: NotificationFormData) => {
    try {
      const staffName = staffOptions.find(s => s.id === data.staffId)?.name || "System";
      const notificationType = data.type.toLowerCase() === "sos" ? "sos" : "other";

      if (editingNotificationId) {
        // Update existing notification
        await updateNotification({
          id: editingNotificationId,
          data: {
            title: staffName,
            message: data.message,
          },
        }).unwrap();

        toast({
          title: "Notification Updated",
          description: "The notification has been updated successfully.",
        });
      } else {
        // Create new notification
        await createNotification({
          title: staffName,
          message: data.message,
          type: notificationType,
        }).unwrap();

        toast({
          title: "Notification Created",
          description: "The notification has been created successfully.",
        });
      }
      setIsNotificationFormOpen(false);
      setEditingNotificationId(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.message || `Failed to ${editingNotificationId ? "update" : "create"} notification`;
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const handleAddNotification = () => {
    setEditingNotificationId(null);
    setIsNotificationFormOpen(true);
  };

  // Prepare initial data for NotificationForm when editing
  const initialFormData = useMemo(() => {
    if (!editingNotificationId || !notificationData?.data) return undefined;
    const notif = notificationData.data;
    // Find staff by name (title) or use first staff as default
    const staffId = staffOptions.find(s => s.name === notif.title)?.id || staffOptions[0]?.id || "";
    return {
      staffId,
      message: notif.message,
      type: notif.type === "sos" ? "SOS" : notif.type === "other" ? "Other" : notif.type,
    };
  }, [editingNotificationId, notificationData, staffOptions]);

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Manage Notification</h1>
        <Button onClick={handleAddNotification} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add notification
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="type-filter" className="text-sm font-medium">
                  Type:
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type-filter" className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-[250px]"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort('serialNo')}>
                    <div className="flex items-center gap-2">
                      NO
                      {getSortIcon('serialNo')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('staffName')}>
                    <div className="flex items-center gap-2">
                      Staff name
                      {getSortIcon('staffName')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('message')}>
                    <div className="flex items-center gap-2">
                      Message
                      {getSortIcon('message')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                    <div className="flex items-center gap-2">
                      Type
                      {getSortIcon('type')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingNotifications ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : paginatedNotifications.length > 0 ? (
                  paginatedNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>{notification.serialNo}</TableCell>
                      <TableCell className="font-medium">{notification.staffName}</TableCell>
                      <TableCell>{notification.message}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{notification.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={notification.status === "Active" ? "secondary" : "destructive"}
                          className={`cursor-pointer hover:opacity-80 transition-opacity ${
                            notification.status === "Active"
                              ? "border-green-500 text-green-700 bg-green-50"
                              : "border-red-500 text-red-700 bg-red-50"
                          }`}
                          onClick={() => handleStatusClick(parseInt(notification.id), notification.statusValue)}
                        >
                          {notification.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(notification.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClick(parseInt(notification.id))}
                              disabled={isDeletingNotification}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {isDeletingNotification ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No notifications found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || totalPages === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StatusChangeModal
        isOpen={showStatusModal}
        onOpenChange={setShowStatusModal}
        title="Update Notification Status"
        nameLabel="Notification"
        nameValue={selectedNotificationId ? notifications.find(n => n.id === selectedNotificationId.toString())?.message.substring(0, 30) + "..." : ""}
        currentStatus={selectedNotificationStatus ? "Active" : "Inactive"}
        statusOptions={["Active", "Inactive"]}
        onConfirm={handleStatusChange}
      />

      {/* Delete Confirmation Dialog */}
      <StatusChangeModal
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Notification"
        nameLabel="Notification"
        nameValue={notificationToDelete ? notifications.find(n => n.id === notificationToDelete.toString())?.message.substring(0, 30) + "..." : ""}
        currentStatus=""
        statusOptions={[]}
        onConfirm={async () => {
          await handleConfirmDelete();
        }}
      />

      <NotificationForm
        isOpen={isNotificationFormOpen}
        onClose={() => {
          setIsNotificationFormOpen(false);
          setEditingNotificationId(null);
        }}
        onSubmit={handleNotificationFormSubmit}
        initialData={initialFormData}
        staffList={staffOptions}
      />

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  );
}

