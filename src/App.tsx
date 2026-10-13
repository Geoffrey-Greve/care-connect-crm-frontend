import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Panel from "./pages/Panel";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import OTPVerification from "./pages/OTPVerification";
import SetNewPassword from "./pages/SetNewPassword";
import NotFound from "./pages/NotFound";
import ClientForm from "./pages/ClientForm";
import ClientSetup from "./pages/ClientSetup";
import ClientProfile from "./pages/ClientProfile";
import Appointments from "./pages/Appointments";
import Outlets from "./pages/Outlets";
import Clients from "./pages/Clients";
import ArchivedClients from "./pages/ArchivedClients";
import Team from "./pages/Staff-List";
import NewEmployee from "./pages/NewEmployee";
import Teams from "./pages/Teams";
import TeamForm from "./pages/TeamForm";
import StaffList from "./pages/StaffList";
import StaffDetail from "./pages/StaffDetail";
import StaffDocuments from "./pages/StaffDocuments";
import StaffArchived from "./pages/StaffArchived";
import TeamList from "./pages/TeamList";
import EmployeeProfile from "./pages/EmployeeProfile";
import ExpiredDocuments from "./pages/ExpiredDocuments";
import Timesheets from "./pages/Timesheets";
import Timesheet from "./pages/Timesheet";
import Invoices from "./pages/Invoices";
import NDISClaims from "./pages/NDISClaims";
import GenerateInvoice from "./pages/GenerateInvoice";
import VoidInvoiceList from "./pages/VoidInvoiceList";
import Documents from "./pages/Documents";
import ReceivedDocuments from "./pages/ReceivedDocuments";
import SharedDocument from "./pages/SharedDocument";
import NotificationList from "./pages/NotificationList";
import StaffLeave from "./pages/StaffLeave";
import KPITracker from "./pages/KPITracker";
import KPIResponse from "./pages/KPIResponse";
import CarerLiveLocation from "./pages/CarerLiveLocation";
import AddEventForm from "./pages/AddEventForm";
import ManageCalendar from "./pages/ManageCalendar";
import FormBuilder from "./pages/FormBuilder";
import CreateForm from "./pages/CreateForm";
import FormView from "./pages/FormView";
import UserGuideDocuments from "./pages/UserGuideDocuments";
import UserGuideVideo from "./pages/UserGuideVideo";
import IncidentsDashboard from "./pages/IncidentsDashboard";
import IncidentsOverview from "./pages/IncidentsOverview";
import EscalatedIncidents from "./pages/EscalatedIncidents";
import OpenTicketsByClient from "./pages/OpenTicketsByClient";
import ResolvedIncidents from "./pages/ResolvedIncidents";
import IncidentsByStaff from "./pages/IncidentsByStaff";
import NDISReportable from "./pages/NDISReportable";
import IncidentTickets from "./pages/IncidentTickets";
import ComplaintsDashboard from "./pages/ComplaintsDashboard";
import ComplaintsOverview from "./pages/ComplaintsOverview";
import EscalatedComplaints from "./pages/EscalatedComplaints";
import ComplaintTicketsByClient from "./pages/ComplaintTicketsByClient";
import ResolvedComplaints from "./pages/ResolvedComplaints";
import ComplaintsByStaff from "./pages/ComplaintsByStaff";
import ComplaintTickets from "./pages/ComplaintTickets";
import InvoiceReport from "./pages/InvoiceReport";
import PaymentReport from "./pages/ClientReport";
import TimeTracker from "./pages/TimeTracker";
import ValuationReport from "./pages/ValuationReport";
import ComplianceReport from "./pages/ComplianceReport";
import SkillReport from "./pages/SkillReport";
import ActionsReport from "./pages/ActionsReport";
import QualificationReport from "./pages/QualificationReport";
import LogReport from "./pages/LogReport";
import KPIReport from "./pages/KPIReport";
import DeletedShift from "./pages/DeletedShift";
import ManageKPI from "./pages/ManageKPI";
import ManagePublicHolidays from "./pages/ManagePublicHolidays";
import ManageReference from "./pages/ManageReference";
import InvoiceSetting from "./pages/InvoiceSetting";
import ClientPublicInformationHeadings from "./pages/ClientPublicInformationHeadings";
import ManagePriceBook from "./pages/ManagePriceBook";
import ManagePrice from "./pages/ManagePrice";
import ManagePayGroup from "./pages/ManagePayGroup";
import ManageAllowances from "./pages/ManageAllowances";
import ManagePermissionList from "./pages/ManagePermissionList";
import CreatePermissions from "./pages/CreatePermissions";
import CreateKPIPermission from "./pages/CreateKPIPermission";
import ManageSettings from "./pages/ManageSettings";
import ManageSubscription from "./pages/ManageSubscription";
import NdisImport from "./pages/NdisImport";
import StaffTracking from "./pages/StaffTracking";
import LiveStaffDashboard from "./pages/LiveStaffDashboard";
import AdminManagement from "./pages/AdminManagement";
import AdminOverview from "./pages/AdminOverview";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminOutlets from "./pages/AdminOutlets";
import ManageFields from "./pages/ManageFields";
import OrganizationSettings from "./pages/OrganizationSettings";
import SDAPropertyManagement from "./pages/SDAPropertyManagement";
import SDAtenantRegister from "./pages/SDAtenantRegister";
import SDAVacancyManagement from "./pages/SDAVacancyManagement";
import SDAFinancialReports from "./pages/SDAFinancialReports";
import SDACompliance from "./pages/SDACompliance";
import SILManagement from "./pages/SILManagement";
import SILHouseManagement from "./pages/SILHouseManagement";
import SILParticipantPlans from "./pages/SILParticipantPlans";
import SILFundingClaims from "./pages/SILFundingClaims";
import SILStaffIntegration from "./pages/SILStaffIntegration";
import BehaviourSupportPlan from "./pages/BehaviourSupportPlan";
import BSPRestrictivePractices from "./pages/BSPRestrictivePractices";
import BSPProdaReporting from "./pages/BSPProdaReporting";
import PlaceholderPage from "./components/PlaceholderPage";
import GlobalConfiguration from "./pages/GlobalConfiguration";
import ManageClientType from "./pages/ManageClientType";
import ManageLanguage from "./pages/ManageLanguage";
import ManageSkill from "./pages/ManageSkill";
import ManageClientDocumentCategory from "./pages/ManageClientDocumentCategory";
import ManageStaffDocumentCategory from "./pages/ManageStaffDocumentCategory";
import ManageShift from "./pages/ManageShift";
import ManageRole from "./pages/ManageRole";

import AreaTracker from "./pages/AreaTracker";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Authentication Routes - Without AppLayout */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/otp-verification" element={<OTPVerification />} />
            <Route path="/auth/set-password" element={<SetNewPassword />} />
            
            {/* Protected Routes - With AppLayout */}
            <Route path="/*" element={
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/panel" element={<Panel />} />
              <Route path="/panel/add-event" element={<AddEventForm />} />
              <Route path="/manage-calendar" element={<ManageCalendar />} />
              <Route path="/manage-calendar/:id" element={<ManageCalendar />} />
              <Route path="/form-builder" element={<FormBuilder />} />
              <Route path="/create-form" element={<CreateForm />} />
              <Route path="/create-form/:id" element={<CreateForm />} />
              <Route path="/form-view/:id" element={<FormView />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/outlets" element={<Outlets />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/new" element={<ClientForm />} />
              <Route path="/clients/:clientId" element={<ClientProfile />} />
              <Route path="/clients/:clientId/setup" element={<ClientSetup />} />
              {/* <Route path="/clients/:clientId/goals/:goalId" element={<ViewClientGoal />} /> */}
              <Route path="/clients/expired-documents" element={<ExpiredDocuments />} />
              <Route path="/clients/staff-archived" element={<ArchivedClients />} />
              <Route path="/staff/:id" element={<StaffDetail />} />
              <Route path="/staff/:id/documents" element={<StaffDocuments />} />
              <Route path="/staff-archived" element={<StaffArchived />} />
              <Route path="/staff-list" element={<Team />} />
              <Route path="/staff-list/new" element={<NewEmployee />} />
              <Route path="/staff-list/:id" element={<EmployeeProfile />} />
              <Route path="/team-list" element={<TeamList />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/new" element={<TeamForm />} />
              <Route path="/teams/:id/edit" element={<TeamForm />} />
              <Route path="/timesheets" element={<Timesheets />} />
              <Route path="/timesheet/:id" element={<Timesheet />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/ndis-claims" element={<NDISClaims />} />
              <Route path="/invoices/generate" element={<GenerateInvoice />} />
              <Route path="/invoices/voided" element={<VoidInvoiceList />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/received" element={<ReceivedDocuments />} />
              <Route path="/shared-documents" element={<SharedDocument />} />
              <Route path="/notifications" element={<NotificationList />} />
              <Route path="/staff-leave" element={<StaffLeave />} />
              <Route path="/kpi-tracker" element={<KPITracker />} />
              <Route path="/kpi-response" element={<KPIResponse />} />
              <Route path="/carer-live-location" element={<CarerLiveLocation />} />
              <Route path="/incidents/dashboard" element={<IncidentsDashboard />} />
              <Route path="/incidents/overview" element={<IncidentsOverview />} />
              <Route path="/incidents/escalated" element={<EscalatedIncidents />} />
              <Route path="/incidents/open-by-client" element={<OpenTicketsByClient />} />
              <Route path="/incidents/resolved" element={<ResolvedIncidents />} />
              <Route path="/incidents/by-staff" element={<IncidentsByStaff />} />
              <Route path="/incidents/ndis-reportable" element={<NDISReportable />} />
              <Route path="/incidents/tickets" element={<IncidentTickets />} />
              <Route path="/complaints/dashboard" element={<ComplaintsDashboard />} />
              <Route path="/complaints/overview" element={<ComplaintsOverview />} />
              <Route path="/complaints/escalated" element={<EscalatedComplaints />} />
              <Route path="/complaints/open-by-client" element={<ComplaintTicketsByClient />} />
              <Route path="/complaints/resolved" element={<ResolvedComplaints />} />
              <Route path="/complaints/by-staff" element={<ComplaintsByStaff />} />
              <Route path="/complaints/tickets" element={<ComplaintTickets />} />
              <Route path="/reports/invoice-report" element={<InvoiceReport />} />
              <Route path="/reports/payment-report" element={<PaymentReport />} />
              <Route path="/reports/time-tracker" element={<TimeTracker />} />
              <Route path="/reports/area-tracker" element={<AreaTracker />} />
              <Route path="/reports/valuation-report" element={<ValuationReport />} />
              <Route path="/reports/compliance-report" element={<ComplianceReport />} />
              <Route path="/reports/skill-report" element={<SkillReport />} />
              <Route path="/reports/actions-report" element={<ActionsReport />} />
              <Route path="/reports/qualification-report" element={<QualificationReport />} />
              <Route path="/reports/log-report" element={<LogReport />} />
              <Route path="/reports/kpi-report" element={<KPIReport />} />
              <Route path="/reports/deleted-shift" element={<DeletedShift />} />
              <Route path="/user-guide-documents" element={<UserGuideDocuments />} />
              <Route path="/user-guide-videos" element={<UserGuideVideo />} />
              <Route path="/staff-tracking" element={<StaffTracking />} />
              <Route path="/live-staff-dashboard" element={<LiveStaffDashboard />} />
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/admin/permissions" element={<AdminManagement />} />
              <Route path="/admin/pricing" element={<AdminManagement />} />
              <Route path="/admin/outlets" element={<AdminOutlets />} />
              <Route path="/admin/manage-fields" element={<ManageFields />} />
              <Route path="/admin/organization-settings" element={<OrganizationSettings />} />
              <Route path="/admin/manage-kpi" element={<ManageKPI />} />
              <Route path="/admin/manage-public-holidays" element={<ManagePublicHolidays />} />
              <Route path="/admin/manage-reference" element={<ManageReference />} />
              <Route path="/admin/invoice-setting" element={<InvoiceSetting />} />
              <Route path="/admin/manage-price-book" element={<ManagePriceBook />} />
              <Route path="/admin/manage-price" element={<ManagePrice />} />
              <Route path="/admin/manage-pay-groups" element={<ManagePayGroup />} />
              <Route path="/admin/manage-allowances" element={<ManageAllowances />} />
              <Route path="/admin/manage-permissions" element={<ManagePermissionList />} />
              <Route path="/admin/manage-permissions/create" element={<CreatePermissions />} />
              <Route path="/admin/manage-permissions/kpi" element={<CreateKPIPermission />} />
              <Route path="/admin/manage-settings" element={<ManageSettings />} />
              <Route path="/admin/manage-subscriptions" element={<ManageSubscription />} />
              <Route path="/admin/ndis-import" element={<NdisImport />} />
              <Route path="/admin/client-public-information-headings" element={<ClientPublicInformationHeadings />} />
              <Route path="/admin/global-configuration" element={<GlobalConfiguration />} />
              <Route path="/admin/client-type" element={<ManageClientType />} />
              <Route path="/admin/language" element={<ManageLanguage />} />
              <Route path="/admin/skill" element={<ManageSkill />} />
              <Route path="/admin/client-document-category" element={<ManageClientDocumentCategory />} />
              <Route path="/admin/staff-document-category" element={<ManageStaffDocumentCategory />} />
              <Route path="/admin/shift" element={<ManageShift />} />
              <Route path="/admin/role" element={<ManageRole />} />
              <Route path="/admin/system" element={<AdminManagement />} />
              <Route path="/admin/audit" element={<AdminManagement />} />
              <Route path="/admin/overview" element={<AdminManagement />} />

              {/* SDA Routes */}
              <Route path="/sda/property-management" element={<SDAPropertyManagement />} />
              <Route path="/sda/tenant-register" element={<SDAtenantRegister />} />
              <Route path="/sda/vacancy-management" element={<SDAVacancyManagement />} />
              <Route path="/sda/compliance" element={<SDACompliance />} />
              <Route path="/sda/reports" element={<SDAFinancialReports />} />

              {/* SIL Routes */}
              <Route path="/sil/management" element={<SILManagement />} />
              <Route path="/sil/house-management" element={<SILHouseManagement />} />
              <Route path="/sil/participant-plans" element={<SILParticipantPlans />} />
              <Route path="/sil/funding-claims" element={<SILFundingClaims />} />
              <Route path="/sil/staff-integration" element={<SILStaffIntegration />} />

              {/* BSP Routes */}
              <Route path="/bsp/register" element={<BehaviourSupportPlan />} />
              <Route path="/bsp/restrictive-practices" element={<BSPRestrictivePractices />} />
              <Route path="/bsp/proda-reporting" element={<BSPProdaReporting />} />
              <Route path="/bsp/case-notes" element={<PlaceholderPage title="BSP Case Notes" description="Behaviour intervention case notes and reviews" />} />
              <Route path="/bsp/progress-monitoring" element={<PlaceholderPage title="Progress Monitoring" description="Participant goals and progress tracking with data visualisation" />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;
