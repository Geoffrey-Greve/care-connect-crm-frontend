// Mock data for dashboard demonstration
type DashboardStatus = "critical" | "warning" | "success" | "info";

interface DashboardItem {
  value: string | number;
  status: DashboardStatus;
}
interface PermissionAction {
  id: string;
  label: string;
  checked: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  actions: PermissionAction[];
  checked?: boolean; // For menu items with no actions
}


export interface PermissionSection {
  id: string;
  name: string;
  menuItems: MenuItem[];
}


interface DashboardData {
  quickAlerts: {
    newIncidents: DashboardItem;
    newComplaints: DashboardItem;
    highRiskAlerts: DashboardItem;
    restrictivePracticeAlerts: DashboardItem;
  };
  dailyOperations: {
    lateCheckIns: DashboardItem;
    lateCheckOuts: DashboardItem;
    todayCancellationsStaff: DashboardItem;
    todayCancellationsClient: DashboardItem;
    shiftCoverageGaps: DashboardItem;
  };
  compliance: {
    expiredStaffDocs: DashboardItem;
    staffDocsExpiring30: DashboardItem;
    staffDocsExpiring60: DashboardItem;
    staffDocsExpiring90: DashboardItem;
    expiredClientDocs: DashboardItem;
    clientDocsExpiring30: DashboardItem;
    clientDocsExpiring60: DashboardItem;
    clientDocsExpiring90: DashboardItem;
    overdueTasks: DashboardItem;
  };
  financial: {
    unvoicedCosts: DashboardItem;
    invoicedCosts: DashboardItem;
    outstandingPayments30: DashboardItem;
    outstandingPayments60: DashboardItem;
    outstandingPayments90: DashboardItem;
    pendingApprovals: DashboardItem;
    fundingUtilisation: DashboardItem;
  };
  workforce: {
    staffAvailabilityToday: DashboardItem;
    leaveRequests: DashboardItem;
    staffParticipantRatioAlerts: DashboardItem;
    serviceHoursDelivered: DashboardItem;
    attendanceRate: DashboardItem;
  };
  strategic: {
    topReferrers: DashboardItem;
    openCasesByStatus: DashboardItem;
    participantSatisfaction: DashboardItem;
  };
}

export const mockDashboardData: DashboardData = {
  quickAlerts: {
    newIncidents: { value: 3, status: "critical" },
    newComplaints: { value: 1, status: "warning" },
    highRiskAlerts: { value: 7, status: "critical" },
    restrictivePracticeAlerts: { value: 2, status: "warning" },
  },
  
  dailyOperations: {
    lateCheckIns: { value: 5, status: "warning" },
    lateCheckOuts: { value: 3, status: "warning" },
    todayCancellationsStaff: { value: 2, status: "info" },
    todayCancellationsClient: { value: 4, status: "warning" },
    shiftCoverageGaps: { value: 1, status: "critical" },
  },
  
  compliance: {
    expiredStaffDocs: { value: 8, status: "critical" },
    staffDocsExpiring30: { value: 12, status: "warning" },
    staffDocsExpiring60: { value: 15, status: "info" },
    staffDocsExpiring90: { value: 18, status: "info" },
    expiredClientDocs: { value: 3, status: "critical" },
    clientDocsExpiring30: { value: 7, status: "warning" },
    clientDocsExpiring60: { value: 9, status: "info" },
    clientDocsExpiring90: { value: 11, status: "info" },
    overdueTasks: { value: 23, status: "warning" },
  },
  
  financial: {
    unvoicedCosts: { value: "$45,230", status: "warning" },
    invoicedCosts: { value: "$123,450", status: "success" },
    outstandingPayments30: { value: "$15,670", status: "warning" },
    outstandingPayments60: { value: "$8,450", status: "critical" },
    outstandingPayments90: { value: "$3,200", status: "critical" },
    pendingApprovals: { value: 6, status: "info" },
    fundingUtilisation: { value: "87%", status: "success" },
  },
  
  workforce: {
    staffAvailabilityToday: { value: "92%", status: "success" },
    leaveRequests: { value: 14, status: "info" },
    staffParticipantRatioAlerts: { value: 2, status: "warning" },
    serviceHoursDelivered: { value: "94%", status: "success" },
    attendanceRate: { value: "96%", status: "success" },
  },
  
  strategic: {
    topReferrers: { value: 15, status: "success" },
    openCasesByStatus: { value: 48, status: "info" },
    participantSatisfaction: { value: "4.2/5", status: "success" },
  },
};

export function generateRandomData(): DashboardData {
  // Simulate real-time data updates
  const variations = {
    quickAlerts: {
      newIncidents: Math.floor(Math.random() * 5),
      newComplaints: Math.floor(Math.random() * 3),
      highRiskAlerts: Math.floor(Math.random() * 10),
      restrictivePracticeAlerts: Math.floor(Math.random() * 4),
    },
    financialAmounts: [
      "$42,150", "$47,890", "$51,200", "$39,670", "$44,330"
    ],
    percentages: [
      "85%", "87%", "89%", "91%", "93%", "95%", "97%"
    ]
  };
  
  return {
    ...mockDashboardData,
    quickAlerts: {
      ...mockDashboardData.quickAlerts,
      newIncidents: { 
        value: variations.quickAlerts.newIncidents, 
        status: variations.quickAlerts.newIncidents > 2 ? "critical" : "warning"
      },
    },
    financial: {
      ...mockDashboardData.financial,
      unvoicedCosts: { 
        value: variations.financialAmounts[Math.floor(Math.random() * variations.financialAmounts.length)], 
        status: "warning"
      },
    },
    workforce: {
      ...mockDashboardData.workforce,
      staffAvailabilityToday: { 
        value: variations.percentages[Math.floor(Math.random() * variations.percentages.length)], 
        status: "success"
      },
    }
  };
}

export const defaultPermissions: PermissionSection[] = [
  {
    id: "manage-staff",
    name: "Manage Staff",
    menuItems: [
      {
        id: "staff-members",
        name: "Staff Members",
        actions: [
          { id: "staff-list", label: "Staff List", checked: false },
          { id: "create-staff", label: "Create Staff", checked: false },
          { id: "view-staff", label: "View Staff", checked: false },
          { id: "update-staff", label: "Update Staff", checked: false },
          { id: "delete-staff", label: "Delete Staff", checked: false },
        ],
      },
      {
        id: "create-new-team",
        name: "Create New Team",
        actions: [
          { id: "team-list", label: "Team List", checked: false },
          { id: "create-team", label: "Create Team", checked: false },
          { id: "view-team", label: "View Team", checked: false },
          { id: "update-team", label: "Update Team", checked: false },
          { id: "delete-team", label: "Delete Team", checked: false },
        ],
      },
      {
        id: "archived-staff",
        name: "Archived",
        actions: [{ id: "staff-list-archived", label: "Staff List", checked: false }],
      },
      {
        id: "document-center",
        name: "Document Center",
        actions: [
          { id: "document-list", label: "Document List", checked: false },
          { id: "view-document", label: "View Document", checked: false },
          { id: "create-document", label: "Create Document", checked: false },
          { id: "update-document", label: "Update Document", checked: false },
          { id: "delete-document", label: "Delete Document", checked: false },
          { id: "expired-document", label: "Expired Document", checked: false },
        ],
      },
      {
        id: "calendar",
        name: "Calendar",
        actions: [],
        checked: false,
      },
      {
        id: "staff-leave",
        name: "Staff Leave",
        actions: [
          { id: "leave-list", label: "Leave List", checked: false },
          { id: "delete-leave", label: "Delete Leave", checked: false },
          { id: "view-leave", label: "View Leave", checked: false },
          { id: "approved-leave", label: "Approved Leave", checked: false },
          { id: "rejected-leave", label: "Rejected Leave", checked: false },
          { id: "submit-leave", label: "Submit Leave", checked: false },
        ],
      },
      {
        id: "kpi-tracker",
        name: "KPI Tracker",
        actions: [
          { id: "kpi-tracker-list", label: "KPI Tracker List", checked: false },
          { id: "kpi-tracker-submit", label: "KPI Tracker List submit", checked: false },
        ],
      },
      {
        id: "carer-live-location",
        name: "Carer Live Location",
        actions: [{ id: "carer-live-location", label: "Carer Live Location", checked: false }],
      },
    ],
  },
  {
    id: "manage-clients",
    name: "Manage Clients",
    menuItems: [
      {
        id: "client-list",
        name: "Client List",
        actions: [
          { id: "client-list-action", label: "Client List", checked: false },
          { id: "create-client", label: "Create Client", checked: false },
          { id: "view-client", label: "View Client", checked: false },
          { id: "update-client", label: "Update Client", checked: false },
          { id: "delete-client", label: "Delete Client", checked: false },
          { id: "client-family-add", label: "Client Family Add", checked: false },
          { id: "client-goal", label: "Client Goal", checked: false },
          { id: "list-client-document", label: "List Client Document", checked: false },
        ],
      },
      {
        id: "archived-clients",
        name: "Archived",
        actions: [{ id: "client-list-archived", label: "Client List", checked: false }],
      },
      {
        id: "expired-documents",
        name: "Expired Documents",
        actions: [
          { id: "expired-document-list", label: "Expired Document List", checked: false },
          { id: "delete-document-expired", label: "Delete Document", checked: false },
          { id: "view-document-expired", label: "View Document", checked: false },
          { id: "create-document-expired", label: "Create Document", checked: false },
          { id: "update-document-expired", label: "Update Document", checked: false },
        ],
      },
      {
        id: "client-goal",
        name: "Client Goal",
        actions: [
          { id: "client-goal-list", label: "Client Goal List", checked: false },
          { id: "create-goal", label: "Create Goal", checked: false },
          { id: "view-goal", label: "View Goal", checked: false },
          { id: "update-goal", label: "Update Goal", checked: false },
          { id: "delete-goal", label: "Delete Goal", checked: false },
          { id: "create-strategies", label: "Create Strategies", checked: false },
        ],
      },
      {
        id: "family",
        name: "Family",
        actions: [
          { id: "family-list", label: "Family List", checked: false },
          { id: "add-family", label: "Add Family", checked: false },
          { id: "view-family", label: "View Family", checked: false },
          { id: "update-family", label: "Update Family", checked: false },
          { id: "delete-family", label: "Delete Family", checked: false },
        ],
      },
    ],
  },
  {
    id: "manage-invoices",
    name: "Manage Invoices",
    menuItems: [
      {
        id: "invoice-list",
        name: "Invoice List",
        actions: [{ id: "invoice-list-action", label: "Invoice List", checked: false }],
      },
      {
        id: "voided-invoices",
        name: "Voided Invoices",
        actions: [{ id: "void-list", label: "Void List", checked: false }],
      },
      {
        id: "generate",
        name: "Generate",
        actions: [
          { id: "generate-invoice-list", label: "Generate Invoice List", checked: false },
          { id: "generate-invoice", label: "Generate Invoice", checked: false },
        ],
      },
    ],
  },
  {
    id: "reports",
    name: "Reports",
    menuItems: [
      {
        id: "invoice-report",
        name: "Invoice Report",
        actions: [{ id: "invoice-report-list", label: "Invoice Report List", checked: true }],
      },
      {
        id: "payment-report",
        name: "Payment Report",
        actions: [{ id: "payment-report-list", label: "Payment Report List", checked: true }],
      },
      {
        id: "time-tracker",
        name: "Time Tracker",
        actions: [
          { id: "timesheet-report-list", label: "Timesheet Report List", checked: true },
          { id: "timesheet-report-view", label: "Timesheet Report View", checked: true },
        ],
      },
      {
        id: "valuation-report",
        name: "Valuation Report",
        actions: [{ id: "valuation-report-list", label: "Valuation Report List", checked: true }],
      },
      {
        id: "compliance-report",
        name: "Compliance Report",
        actions: [{ id: "compliance-report-list", label: "Compliance Report List", checked: true }],
      },
      {
        id: "skills-report",
        name: "Skills Report",
        actions: [{ id: "skills-report-list", label: "Skills Report List", checked: true }],
      },
      {
        id: "actions-report",
        name: "Actions Report",
        actions: [{ id: "actions-report-list", label: "Actions Report List", checked: true }],
      },
      {
        id: "qualification-report",
        name: "Qualification Report",
        actions: [{ id: "qualification-report-list", label: "Qualification Report List", checked: true }],
      },
      {
        id: "area-tracker",
        name: "Area Tracker",
        actions: [{ id: "area-tracker-report-list", label: "Area Tracker Report List", checked: true }],
      },
      {
        id: "log-report",
        name: "Log Report",
        actions: [{ id: "log-report-list", label: "Log Report List", checked: true }],
      },
      {
        id: "kpi-report",
        name: "KPI Report",
        actions: [{ id: "kpi-report-list", label: "KPI Report List", checked: true }],
      },
      {
        id: "deleted-shift",
        name: "Deleted Shift",
        actions: [{ id: "deleted-shift-list", label: "Deleted Shift List", checked: true }],
      },
    ],
  },
  {
    id: "manage-accounts",
    name: "Manage Accounts",
    menuItems: [
      {
        id: "invoice-setting",
        name: "Invoice Setting",
        actions: [
          { id: "view-invoice-setting", label: "View Invoice Setting", checked: false },
          { id: "update-invoice-setting", label: "Update Invoice Setting", checked: false },
        ],
      },
      {
        id: "prices",
        name: "Prices",
        actions: [
          { id: "price-book-list", label: "Price Book List", checked: false },
          { id: "create-price-book", label: "Create Price Book", checked: false },
          { id: "view-price-book", label: "View Price Book", checked: false },
          { id: "update-price-book", label: "Update Price Book", checked: false },
          { id: "delete-price-book", label: "Delete Price Book", checked: false },
          { id: "price-book-cost-detail", label: "Price Book Cost Detail", checked: false },
        ],
      },
      {
        id: "pay-groups",
        name: "Pay Groups",
        actions: [
          { id: "pay-group-list", label: "Pay Group List", checked: false },
          { id: "create-pay-group", label: "Create Pay Group", checked: false },
          { id: "view-pay-group", label: "View Pay Group", checked: false },
          { id: "update-pay-group", label: "Update Pay Group", checked: false },
          { id: "delete-pay-group", label: "Delete Pay Group", checked: false },
          { id: "pay-group-cost-detail", label: "Pay Group Cost Detail", checked: false },
        ],
      },
      {
        id: "allowances",
        name: "Allowances",
        actions: [
          { id: "allowance-list", label: "Allowance list", checked: false },
          { id: "create-allowance", label: "Create Allowance", checked: false },
          { id: "view-allowance", label: "View Allowance", checked: false },
          { id: "update-allowance", label: "Update Create Allowance", checked: false },
          { id: "delete-allowance", label: "Delete Create Allowance", checked: false },
        ],
      },
      {
        id: "subscription",
        name: "Subscription",
        actions: [
          { id: "subscription-view", label: "Subscription View", checked: false },
          { id: "update-subscription", label: "Update Subscription", checked: false },
        ],
      },
      {
        id: "add-permission",
        name: "Add Permission",
        actions: [
          { id: "role-permission-list", label: "Role Permission List", checked: false },
          { id: "add-role", label: "Add Role", checked: false },
          { id: "view-role", label: "View Role", checked: false },
          { id: "delete-role", label: "Delete Role", checked: false },
          { id: "update-role", label: "Update Role", checked: false },
          { id: "add-role-permission", label: "Add Role Permission", checked: false },
          { id: "kpi-mapping", label: "KPI Mapping", checked: false },
        ],
      },
      {
        id: "settings",
        name: "Settings",
        actions: [
          { id: "view-settings", label: "View Settings", checked: false },
          { id: "update-settings", label: "Update Settings", checked: false },
        ],
      },
      {
        id: "integrations",
        name: "Integrations",
        actions: [],
        checked: false,
      },
    ],
  },
  {
    id: "organization-master",
    name: "Organization Master",
    menuItems: [
      {
        id: "manage-client-document-categories",
        name: "Manage Client Document Categories",
        actions: [
          { id: "category-list", label: "Category List", checked: false },
          { id: "create-category", label: "Create Category", checked: false },
          { id: "update-category", label: "Update Category", checked: false },
          { id: "view-category", label: "View Category", checked: false },
          { id: "delete-category", label: "Delete Category", checked: false },
        ],
      },
      {
        id: "manage-client-type",
        name: "Manage Client Type",
        actions: [
          { id: "client-type-list", label: "Client Type List", checked: false },
          { id: "create-client-type", label: "Create Client Type", checked: false },
          { id: "update-client-type", label: "Update Client Type", checked: false },
          { id: "view-client-type", label: "View Client Type", checked: false },
          { id: "delete-client-type", label: "Delete Client Type", checked: false },
        ],
      },
      {
        id: "manage-competency-and-qualification",
        name: "Manage Competency And Qualification",
        actions: [
          { id: "competency-list", label: "Competency List", checked: false },
          { id: "create-competency", label: "Create Competency", checked: false },
          { id: "update-competency", label: "Update Competency", checked: false },
          { id: "view-competency", label: "View Competency", checked: false },
          { id: "delete-competency", label: "Delete Competency", checked: false },
        ],
      },
      {
        id: "manage-staff-document-categories",
        name: "Manage Staff Document Categories",
        actions: [
          { id: "categories-list", label: "Categories List", checked: false },
          { id: "create-categories", label: "Create Categories", checked: false },
          { id: "update-categories", label: "Update Categories", checked: false },
          { id: "view-categories", label: "View Categories", checked: false },
          { id: "delete-categories", label: "Delete Categories", checked: false },
        ],
      },
      {
        id: "manage-language",
        name: "Manage Language",
        actions: [
          { id: "language-list", label: "Language List", checked: false },
          { id: "create-language", label: "Create Language", checked: false },
          { id: "update-language", label: "Update Language", checked: false },
          { id: "view-language", label: "View Language", checked: false },
          { id: "delete-language", label: "Delete Language", checked: false },
        ],
      },
      {
        id: "manage-shift-type",
        name: "Manage Shift Type",
        actions: [
          { id: "shift-type-list", label: "Shift Type List", checked: false },
          { id: "create-shift-type", label: "Create Shift Type", checked: false },
          { id: "update-shift-type", label: "Update Shift Type", checked: false },
          { id: "view-shift-type", label: "View Shift Type", checked: false },
          { id: "delete-shift-type", label: "Delete Shift Type", checked: false },
        ],
      },
      {
        id: "manage-kpi",
        name: "Manage KPI",
        actions: [
          { id: "kpi-list", label: "KPI List", checked: false },
          { id: "create-kpi", label: "Create KPI", checked: false },
          { id: "update-kpi", label: "Update KPI", checked: false },
          { id: "view-kpi", label: "View KPI", checked: false },
          { id: "delete-kpi", label: "Delete KPI", checked: false },
        ],
      },
      {
        id: "manage-roles",
        name: "Manage Roles",
        actions: [
          { id: "roles-list", label: "Roles List", checked: false },
          { id: "create-roles", label: "Create Roles", checked: false },
          { id: "update-roles", label: "Update Roles", checked: false },
          { id: "view-roles", label: "View Roles", checked: false },
          { id: "delete-roles", label: "Delete Roles", checked: false },
        ],
      },
      {
        id: "manage-skill",
        name: "Manage Skill",
        actions: [
          { id: "skills-list", label: "Skills List", checked: false },
          { id: "create-skills", label: "Create Skills", checked: false },
          { id: "update-skills", label: "Update Skills", checked: false },
          { id: "view-skills", label: "View Skills", checked: false },
          { id: "delete-skills", label: "Delete Skills", checked: false },
        ],
      },
      {
        id: "manage-public-holidays",
        name: "Manage Public Holidays",
        actions: [
          { id: "public-holiday-list", label: "Public Holiday List", checked: false },
          { id: "create-public-holiday", label: "Create Public Holiday", checked: false },
          { id: "update-public-holiday", label: "Update Public Holiday", checked: false },
          { id: "view-public-holiday", label: "View Public Holiday", checked: false },
          { id: "delete-public-holiday", label: "Delete Public Holiday", checked: false },
        ],
      },
      {
        id: "manage-reference",
        name: "Manage Reference",
        actions: [
          { id: "reference-list", label: "Reference List", checked: false },
          { id: "create-reference", label: "Create Reference", checked: false },
          { id: "update-reference", label: "Update Reference", checked: false },
          { id: "view-reference", label: "View Reference", checked: false },
          { id: "delete-reference", label: "Delete Reference", checked: false },
        ],
      },
    ],
  },
  {
    id: "manage-vehicle",
    name: "Manage Vehicle",
    menuItems: [
      {
        id: "vehicle-master",
        name: "Vehicle Master",
        actions: [
          { id: "vehicle-master-list", label: "Vehicle Master List", checked: false },
          { id: "create-vehicle-master", label: "Create Vehicle Master", checked: false },
          { id: "update-vehicle-master", label: "Update Vehicle Master", checked: false },
          { id: "view-vehicle-master", label: "View Vehicle Master", checked: false },
          { id: "delete-vehicle-master", label: "Delete Vehicle Master", checked: false },
        ],
      },
      {
        id: "vehicle-list",
        name: "Vehicle List",
        actions: [
          { id: "vehicle-list-action", label: "Vehicle List", checked: false },
          { id: "create-vehicle", label: "Create Vehicle", checked: false },
          { id: "update-vehicle", label: "Update Vehicle", checked: false },
          { id: "view-vehicle", label: "View Vehicle", checked: false },
          { id: "delete-vehicle", label: "Delete Vehicle", checked: false },
          { id: "update-odo-meter", label: "Update ODO Meter", checked: false },
          { id: "change-driver", label: "Change Driver", checked: false },
          { id: "vehicle-log", label: "Vehicle Log", checked: false },
        ],
      },
      {
        id: "vehicle-report",
        name: "Vehicle Report",
        actions: [{ id: "vehicle-report-list", label: "Vehicle Report List", checked: false }],
      },
    ],
  },
  {
    id: "manage-payment",
    name: "Manage Payment",
    menuItems: [
      {
        id: "payment-history",
        name: "Payment History",
        actions: [
          { id: "payment-history-list", label: "Payment History List", checked: false },
          { id: "payment-history-view", label: "Payment History View", checked: false },
        ],
      },
    ],
  },
  {
    id: "shift",
    name: "Shift",
    menuItems: [
      {
        id: "add-shift",
        name: "Add Shift",
        actions: [
          { id: "delete-shift", label: "Delete shift", checked: false },
          { id: "edit-shift", label: "Edit shift", checked: false },
          { id: "show-staff-action", label: "Show staff action", checked: false },
          { id: "add-shift-action", label: "Add Shift", checked: false },
        ],
      },
    ],
  },
  {
    id: "dashboard",
    name: "Dashboard",
    menuItems: [
      {
        id: "staff",
        name: "Staff",
        actions: [{
          id: "restrict-access-dashboard",
          label: "Restrict Access",
          checked: false,
        }],
        checked: false,
      },
      {
        id: "client",
        name: "Client",
        actions: [{
          id: "restrict-access-dashboard",
          label: "Restrict Access",
          checked: false,
        },],
        checked: false,
      },

    ],
  },
  {
    id: "form-builder",
    name: "Form Builder",
    menuItems: [{
      id: "customize-form",
      name: "Customize form",
      actions: [],
      checked: false,
    }],
  },

  {
    id: "guide",
    name: "Guide",
    menuItems: [
      {
        id: "support-documents",
        name: "Support Documents",
        actions: [],
        checked: false,
      },
      {
        id: "videos",
        name: "Videos",
        actions: [],
        checked: false,
      },
    ],
  }
];