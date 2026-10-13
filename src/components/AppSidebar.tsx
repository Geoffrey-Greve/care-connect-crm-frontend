import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Users,
  UserPlus,
  FileX,
  Clock,
  FileText,
  DollarSign,
  CreditCard,
  Plus,
  FolderOpen,
  ClipboardCheck,
  AlertTriangle,
  Ticket,
  MessageSquareWarning,
  BarChart3,
  Settings,
  ChevronDown,
  BookOpen,
  Navigation,
  Activity,
  Building,
  Home,
  Shield,
  Layers,
  Cog
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const menuItems = [
  // {
  //   title: "Dashboard",
  //   url: "/",
  //   icon: LayoutDashboard,
  // },
  {
    title: "Dashboard",
    url: "/panel",
    icon: Calendar,
  },
  // {
  //   title: "Appointments",
  //   url: "/appointments",
  //   icon: Calendar,
  //  },
  {
    title: "Clients",
    icon: Users,
    items: [
      { title: "List", url: "/clients" },
      // { title: "New Client", url: "/clients/new" },
      { title: "Archived", url: "/clients/staff-archived" },
      { title: "Expired Documents", url: "/clients/expired-documents" },
    ],
  },
  {
    title: "SIL Services",
    icon: Home,
    items: [
      { title: "SIL Management", url: "/sil/management" },
      { title: "House Management", url: "/sil/house-management" },
      { title: "Participant Plans", url: "/sil/participant-plans" },
      { title: "Funding Claims", url: "/sil/funding-claims" },
      { title: "Staff Integration", url: "/sil/staff-integration" },
    ],
  },
  {
    title: "SDA Management",
    icon: Building,
    items: [
      { title: "Property Management", url: "/sda/property-management" },
      { title: "Tenant Register", url: "/sda/tenant-register" },
      { title: "Vacancy Management", url: "/sda/vacancy-management" },
      { title: "Compliance Logs", url: "/sda/compliance" },
      { title: "Financial Reports", url: "/sda/reports" },
    ],
  },
  {
    title: "Behaviour Support",
    icon: Shield,
    items: [
      { title: "BSP Register", url: "/bsp/register" },
      { title: "Restrictive Practices", url: "/bsp/restrictive-practices" },
      { title: "PRODA Reporting", url: "/bsp/proda-reporting" },
      { title: "Case Notes", url: "/bsp/case-notes" },
      { title: "Progress Monitoring", url: "/bsp/progress-monitoring" },
    ],
  },
  {
    title: "Staff",
    icon: Users,
    items: [
      { title: "Staff List", url: "/staff-list" },
      // { title: "New Employee", url: "/staff-list/new" },
      // { title: "Create Team", url: "/teams/new" },
      { title: "Team List", url: "/team-list" },
      { title: "Archived", url: "/staff-archived" },
      { title: "Document Center", url: "/shared-documents" },
      { title: "Notifications", url: "/notifications" },
      { title: "Staff Leave", url: "/staff-leave" },
      { title: "KPI Tracker", url: "/kpi-tracker" },
      { title: "Carer Live Location", url: "/carer-live-location" },
    ],
  },
  // {
  //   title: "Staff Tracking",
  //   icon: Navigation,
  //   items: [
  //     { title: "Mobile Check-in", url: "/staff-tracking" },
  //     { title: "Live Dashboard", url: "/live-staff-dashboard" },
  //   ],
  // },
  // {
  //   title: "Timesheets",
  //   url: "/timesheets",
  //   icon: Clock,
  // },
  {
    title: "Invoices",
    icon: DollarSign,
    items: [
      { title: "List", url: "/invoices" },
      // { title: "NDIS Claims", url: "/invoices/ndis-claims" },
      { title: "Generate Invoice", url: "/invoices/generate" },
      { title: "Voided Invoices", url: "/invoices/voided" },
    ],
  },
  // {
  //   title: "Incidents",
  //   icon: AlertTriangle,
  //   items: [
  //     { title: "Dashboard", url: "/incidents/dashboard" },
  //     { title: "Incident Overview", url: "/incidents/overview" },
  //     { title: "Escalated Incidents", url: "/incidents/escalated" },
  //     { title: "Open Tickets by Client", url: "/incidents/open-by-client" },
  //     { title: "Resolved Incidents", url: "/incidents/resolved" },
  //     { title: "Incidents by Staff", url: "/incidents/by-staff" },
  //     { title: "NDIS Reportable", url: "/incidents/ndis-reportable" },
  //     { title: "Tickets", url: "/incidents/tickets" },
  //   ],
  // },
  // {
  //   title: "Complaints",
  //   icon: MessageSquareWarning,
  //   items: [
  //     { title: "Dashboard", url: "/complaints/dashboard" },
  //     { title: "Complaints Overview", url: "/complaints/overview" },
  //     { title: "Escalated Complaints", url: "/complaints/escalated" },
  //     { title: "Open Tickets by Client", url: "/complaints/open-by-client" },
  //     { title: "Resolved Complaints", url: "/complaints/resolved" },
  //     { title: "Complaints by Staff", url: "/complaints/by-staff" },
  //     { title: "Tickets", url: "/complaints/tickets" },
  //   ],
  // },
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      { title: "Invoice Report", url: "/reports/invoice-report" },
      { title: "Payment Report", url: "/reports/payment-report" },
      { title: "Time Tracker", url: "/reports/time-tracker" },
      { title: "Valuation Report", url: "/reports/valuation-report" },
      { title: "Compliance Report", url: "/reports/compliance-report" },
      { title: "Skill Report", url: "/reports/skill-report" },
      { title: "Actions Report", url: "/reports/actions-report" },
      { title: "Qualification Report", url: "/reports/qualification-report" },
      { title: "Area Tracker", url: "/reports/area-tracker" },
      { title: "Log Report", url: "/reports/log-report" },
      { title: "KPI Report", url: "/reports/kpi-report" },
      { title: "Deleted Shift", url: "/reports/deleted-shift" },
    ],
  },
  {
    title: "Form Builder",
    url: "/form-builder",
    icon: FileText,
  },
  {
    title: "User Guide",
    icon: BookOpen,
    items: [
      { title: "Documents", url: "/user-guide-documents" },
      { title: "Videos", url: "/user-guide-videos" },
    ],
  },
  {
    title: "Organization Master",
    icon: Settings,
    items: [
      // { title: "Overview", url: "/admin" },
      // { title: "User Management", url: "/admin/users" },
      // { title: "Permissions", url: "/admin/permissions" },
      // { title: "Manage Fields", url: "/admin/manage-fields" },
      { title: "Manage Client Type", url: "/admin/client-type" },
      { title: "Manage Language", url: "/admin/language" },
      { title: "Manage Skill", url: "/admin/skill" },
      { title: "Manage Client Document Category", url: "/admin/client-document-category" },
      { title: "Manage Staff Document Category", url: "/admin/staff-document-category" },
      { title: "Manage Shift", url: "/admin/shift" },
      { title: "Manage Role", url: "/admin/role" },
      { title: "Manage KPI", url: "/admin/manage-kpi" },
      { title: "Manage Public Holidays", url: "/admin/manage-public-holidays" },
      { title: "Manage Reference", url: "/admin/manage-reference" },
    ],
  },
  {
    title: "Manage Accounts",
    icon: Cog,
    items: [
      { title: "Invoice Setting", url: "/admin/invoice-setting" },
      { title: "Prices", url: "/admin/manage-price-book" },
      { title: "Pay Groups", url: "/admin/manage-pay-groups" },
      { title: "Allowances", url: "/admin/manage-allowances" },
      { title: "Subscription", url: "/admin/manage-subscriptions" },
      { title: "Add Permissions", url: "/admin/manage-permissions" },
      { title: "Settings", url: "/admin/manage-settings" }
    ],
  },
  // {
  //   title: "Admin Management",
  //   icon: Settings,
  //   items: [
  //     { title: "Overview", url: "/admin" },
  //     { title: "User Management", url: "/admin/users" },
  //     { title: "Permissions", url: "/admin/permissions" },
  //     { title: "Manage Fields", url: "/admin/manage-fields" },
  //     { title: "Pricing Schedules", url: "/admin/pricing" },
  //     { title: "Outlets", url: "/admin/outlets" },
  //     { title: "Tenant Settings", url: "/admin/organization-settings" },
  //     { title: "Global Configuration", url: "/admin/global-configuration" },
  //     { title: "System Settings", url: "/admin/system" },
  //     { title: "Audit Logs", url: "/admin/audit" },
  //   ],
  // },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (items: { url: string }[]) =>
    items.some(item => currentPath === item.url);

  const toggleGroup = (title: string) => {
    setOpenGroups(prev =>
      prev.includes(title)
        ? prev.filter(group => group !== title)
        : [...prev, title]
    );
  };

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-medium border-r-2 border-primary shadow-sm"
      : "text-foreground/80 hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/2 hover:shadow-sm transition-all duration-200 ease-in-out";

  const getGroupClassName = (isGroupActive: boolean) =>
    isGroupActive
      ? "bg-gradient-to-r from-primary/10 to-transparent text-primary font-medium"
      : "text-foreground/80 hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200 ease-in-out";

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-64"} border-r border-border/50 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm`}
      collapsible="icon"
    >
      <SidebarContent className="relative">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        <SidebarGroup className="relative">
          <SidebarGroupLabel className="text-sm font-bold text-foreground/70 tracking-wide uppercase mb-4 px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item, index) => (
                <SidebarMenuItem
                  key={item.title}
                  className="animate-fade-in"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {item.items ? (
                    <Collapsible
                      open={openGroups.includes(item.title) || isGroupActive(item.items)}
                      onOpenChange={() => toggleGroup(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={`w-full justify-between rounded-lg px-3 py-2.5 transition-all duration-200 ease-in-out hover-scale ${getGroupClassName(isGroupActive(item.items))}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-5 h-5">
                              <item.icon className="h-4 w-4" />
                            </div>
                            {!collapsed && (
                              <span className="font-medium tracking-wide">{item.title}</span>
                            )}
                          </div>
                          {!collapsed && (
                            <ChevronDown
                              className={`h-4 w-4 transition-all duration-300 ease-out ${openGroups.includes(item.title) || isGroupActive(item.items)
                                  ? "rotate-180 text-primary"
                                  : "text-foreground/60"
                                }`}
                            />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {!collapsed && (
                        <CollapsibleContent className="animate-accordion-down">
                          <SidebarMenuSub className="ml-6 mt-2 space-y-1 border-l border-border/30 pl-4">
                            {item.items.map((subItem, subIndex) => (
                              <SidebarMenuSubItem
                                key={subItem.title}
                                className="animate-fade-in"
                                style={{
                                  animationDelay: `${(index * 50) + (subIndex * 30) + 100}ms`,
                                  animationFillMode: 'both'
                                }}
                              >
                                <SidebarMenuSubButton asChild>
                                  <NavLink
                                    to={subItem.url}
                                    className={({ isActive }) =>
                                      `${getNavClassName({ isActive })} rounded-lg px-3 py-2.5 transition-all duration-200 ease-in-out hover-scale relative overflow-hidden group`
                                    }
                                  >
                                    <span className="relative z-10">{subItem.title}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url!}
                        className={({ isActive }) =>
                          `${getNavClassName({ isActive })} rounded-lg px-3 py-2.5 transition-all duration-200 ease-in-out hover-scale relative overflow-hidden group`
                        }
                      >
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="flex items-center justify-center w-5 h-5">
                            <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          </div>
                          {!collapsed && (
                            <span className="font-medium tracking-wide">{item.title}</span>
                          )}
                        </div>
                        {/* Subtle animated background on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}