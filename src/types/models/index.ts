export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
}

export type ApiError = {
  data?: {
    status: boolean;
    message: string;
  };
};

export interface LoginUserData {
  id: number;
  user_type: string;
  salutation: string | null;
  first_name: string;
  last_name: string;
  gender: string | null;
  date_of_birth: string | null;
  phone_number: string | null;
  emergency_phone_number: string | null;
  address: string | null;
  username: string;
  email: string;
  status: boolean;
  isdeleted: boolean;
  device_token: string | null;
  firebase_user_id: string | null;
  profile_img: string | null;
  token: string;
}

export interface UserState {
  id: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  username: string | null;
  phone_number: string | null;
  profile_img: string | null;
  user_type: string | null;
  token: string | null;
  tempEmail?: string | null; // For password reset flow
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

// List response with count
export interface ListResponse<T> {
  data: T[];
  count: number;
}

// Client Management
export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  clientTypeId?: number;
  status: boolean;
  created_at?: string;
  updated_at?: string;
  profileImg?: string;
  displayName?: string;
  salutation?: string;
  gender?: string;
  dateOfBirth?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  language?: string;
  maritalStatus?: string;
  religion?: string;
  nationality?: string;
  ndisNumber?: string;
  clientType?: string;
}

export interface CreateClientRequest {
  salutation?: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  email: string;
  primary_phone_number: string;
  secondary_phone_number?: string;
  client_type: number; // ID
  ndis_number?: string;
  nationality?: string;
  religion?: string;
  gender: string;
  date_of_birth?: string;
  marital_status: string;
  address?: string;
  language?: number; // ID
  profile_img?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: number;
}

// Client Type
export interface ClientType {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateClientTypeRequest {
  name: string;
  description?: string;
  status?: boolean;
}

export interface UpdateClientTypeRequest extends Partial<CreateClientTypeRequest> {
  id: number;
}

// Client Document Category
export interface ClientDocumentCategory {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateClientDocumentCategoryRequest {
  name: string;
  description?: string;
  status?: boolean;
}

export interface UpdateClientDocumentCategoryRequest extends Partial<CreateClientDocumentCategoryRequest> {
  id: number;
}

// Language
export interface Language {
  id: number;
  name: string;
  code?: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLanguageRequest {
  name: string;
  code?: string;
  status?: boolean;
}

export interface UpdateLanguageRequest extends Partial<CreateLanguageRequest> {
  id: number;
}

// Shift Type
export interface ShiftType {
  id: number;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateShiftTypeRequest {
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status?: boolean;
}

export interface UpdateShiftTypeRequest extends Partial<CreateShiftTypeRequest> {
  id: number;
}

// Role
export interface Role {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  status?: boolean;
}

export interface UpdateRoleRequest extends Partial<CreateRoleRequest> {
  id: number;
}

// Client Document
export interface ClientDocument {
  id: number;
  user_id: number;
  client_id: number;
  document: string;
  category_id?: number;
  staff_visibility: number;
  expiration: number;
  expiration_date?: string;
  status: number;
  is_deleted: number;
  createdAt: string;
  updatedAt: string;
  Client?: {
    id: number;
    display_name?: string;
    first_name: string;
    last_name: string;
  };
  ClientDocumentCategory?: {
    id: number;
    name: string;
  };
}

export interface CreateClientDocumentRequest {
  client_id: number;
  document: string;
  category_id?: number;
  staff_visibility: number;
  expiration: number;
  expiration_date?: string;
}

export interface UpdateClientDocumentRequest {
  document?: string;
  category_id?: number;
  staff_visibility?: number;
  expiration?: number;
  expiration_date?: string;
}

// Client Goal
export interface ClientGoal {
  id: number;
  user_id: number;
  client_id: number;
  title: string;
  commencement_date: string;
  description?: string;
  goal_achieved: number;
  goal_closed: number;
  status: number;
  is_deleted: number;
  createdAt: string;
  updatedAt: string;
  Client?: {
    id: number;
    user_id: number;
    salutation?: string;
    email: string;
    first_name: string;
    last_name: string;
    display_name?: string;
    gender?: string;
    date_of_birth?: string;
    primary_phone_number?: string;
    secondary_phone_number?: string;
    client_type?: number;
    ndis_number?: string;
    nationality?: string;
    religion?: string;
    marital_status?: string;
    address?: string;
    language?: number;
    profile_img?: string;
    status: number;
    isdeleted: number;
    archived: number;
    createdAt: string;
    updatedAt: string;
    ClientType?: {
      id: number;
      name: string;
      status: number;
      isdeleted: number;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface CreateClientGoalRequest {
  client_id: number;
  title: string;
  commencement_date: string;
  description?: string;
}

export interface UpdateClientGoalRequest {
  title?: string;
  commencement_date?: string;
  description?: string;
}

// Staff Management
export interface Staff {
  id: number;
  user_type: string;
  salutation?: string;
  first_name: string;
  last_name: string;
  gender?: string;
  date_of_birth?: string;
  primary_phone_number?: string;
  secondary_phone_number?: string;
  address?: string;
  username: string;
  email: string;
  status: boolean;
  isdeleted: boolean;
  profile_img?: string;
  created_by?: number;
  createdAt: string;
  updatedAt: string;
  StaffDetail?: StaffDetail;
}

export interface StaffDetail {
  id: number;
  user_id: number;
  role_id: number;
  employment_type: string;
  skills?: string; // JSON string array
  language: number;
  status: number;
  isdeleted: number;
  createdAt: string;
  updatedAt: string;
  Role?: Role;
  Language?: Language;
}

export interface CreateStaffRequest {
  salutation?: string;
  first_name: string;
  last_name: string;
  gender?: string;
  date_of_birth?: string;
  primary_phone_number?: string;
  secondary_phone_number?: string;
  email: string;
  username: string;
  password: string;
  address?: string;
  profile_img?: string;
  role_id: number;
  employment_type: string;
  skills?: string[];
  language: number;
}

export interface UpdateStaffRequest {
  salutation?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  primary_phone_number?: string;
  secondary_phone_number?: string;
  email?: string;
  address?: string;
  profile_img?: string;
  role_id?: number;
  employment_type?: string;
  skills?: string[];
  language?: number;
}

// Team Management
export interface Team {
  id: number;
  team_title: string;
  description?: string;
  status: number;
  is_deleted: number;
  created_by: number;
  createdAt: string;
  updatedAt: string;
  Creator?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  Members?: TeamMember[];
}

export interface TeamMember {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
  StaffDetail?: StaffDetail;
}

export interface CreateTeamRequest {
  team_title: string;
  description?: string;
  staff_ids: number[];
}

export interface UpdateTeamRequest {
  team_title?: string;
  description?: string;
  staff_ids?: number[];
}

// Staff Leave Management
export interface StaffLeave {
  id: number;
  staff_id: number;
  unavailable_dates: string[] | string; // Array of dates in YYYY-MM-DD format, or JSON string from API
  all_day: number; // 1 or 0
  start_time?: string; // Format: HH:MM:SS (required if all_day = 0)
  end_time?: string; // Format: HH:MM:SS (required if all_day = 0)
  reason?: string;
  status: string; // "approve", "reject", "pending"
  created_by: number;
  is_deleted: number;
  createdAt: string;
  updatedAt: string;
  Staff?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  Creator?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateStaffLeaveRequest {
  staff_id: number;
  unavailable_dates: string[]; // Array of dates in YYYY-MM-DD format
  all_day: number; // 1 or 0
  start_time?: string; // Format: HH:MM:SS (required if all_day = 0)
  end_time?: string; // Format: HH:MM:SS (required if all_day = 0)
  reason?: string;
}

export interface UpdateStaffLeaveRequest {
  unavailable_dates?: string[];
  all_day?: number;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

export interface UpdateLeaveStatusRequest {
  status: "approve" | "reject" | "pending";
}

// Staff Document Category
export interface StaffDocumentCategory {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStaffDocumentCategoryRequest {
  name: string;
  description?: string;
  status?: boolean;
}

export interface UpdateStaffDocumentCategoryRequest extends Partial<CreateStaffDocumentCategoryRequest> {
  id: number;
}

// Staff Document
export interface StaffDocument {
  id: number;
  user_id: number;
  staff_id: number;
  document: string;
  category_id?: number;
  staff_visibility: number; // 1 or 0
  expiration: number; // 1 or 0
  expiration_date?: string;
  status: number; // 1 or 0
  is_deleted: number;
  createdAt: string;
  updatedAt: string;
  Staff?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  StaffDocumentCategory?: {
    id: number;
    name: string;
  };
}

export interface CreateStaffDocumentRequest {
  staff_id: number;
  document: string;
  category_id?: number;
  staff_visibility: number;
  expiration: number;
  expiration_date?: string;
}

export interface UpdateStaffDocumentRequest {
  document?: string;
  category_id?: number;
  staff_visibility?: number;
  expiration?: number;
  expiration_date?: string;
}

// Notification
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string; // "sos" or "other"
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: string; // "sos" or "other"
}

export interface UpdateNotificationRequest {
  title?: string;
  message?: string;
}

// Staff Next of Kin
export interface StaffNextOfKin {
  id: number;
  staff_id: number;
  name: string;
  relation: string;
  contact: string;
  email?: string;
  user_id: number;
  status: number;
  is_deleted: number;
  createdAt: string;
  updatedAt: string;
  Staff?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_img?: string;
  };
}

export interface CreateStaffNextOfKinRequest {
  staff_id: number;
  name: string;
  relation: string;
  contact: string;
  email?: string;
}

export interface UpdateStaffNextOfKinRequest {
  name?: string;
  relation?: string;
  contact?: string;
  email?: string;
}

// Staff Payroll Settings
export interface StaffPayrollSettings {
  id: number;
  staff_id: number;
  paygroup_id: number;
  allowance_id: number;
  agreed_daily_hours: string; // "8.00" - returned as string
  agreed_weekly_hours: string; // "40.00" - returned as string
  lateness_threshold: string; // "09:15:00"
  user_id: number;
  status: number;
  is_deleted: number;
  createdAt: string;
  updatedAt: string;
  Staff?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_img?: string;
  };
  PayGroup?: {
    id: number;
    name: string;
    status: number;
    is_deleted: number;
    createdAt: string;
    updatedAt: string;
  };
  Allowance?: {
    id: number;
    title: string;
    allowance_type: string;
    value: string;
    external_id_code?: string;
    external_id?: string;
    status: number;
    is_deleted: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreateStaffPayrollSettingsRequest {
  staff_id: number;
  paygroup_id: number;
  allowance_id: number;
  agreed_daily_hours: number;
  agreed_weekly_hours: number;
  lateness_threshold: string; // "HH:MM:SS"
}

export interface UpdateStaffPayrollSettingsRequest {
  paygroup_id?: number;
  allowance_id?: number;
  agreed_daily_hours?: number;
  agreed_weekly_hours?: number;
  lateness_threshold?: string;
}

// Staff Notes
export interface StaffNote {
  id: number;
  staff_id: number;
  private_info: string;
  user_id: number;
  status: number;
  is_deleted: number;
  createdAt: string;
  updatedAt: string;
  Staff?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_img?: string;
  };
}

export interface CreateStaffNoteRequest {
  staff_id: number;
  private_info?: string;
}

export interface UpdateStaffNoteRequest {
  private_info?: string;
}

// Strategy
export interface Strategy {
  id: number;
  client_id: number;
  goal_id: number;
  due_at: string;
  description: string;
  completed: number;
  completion_outcome?: string;
  reviewed: number;
  review_outcome?: string;
  status: number;
  is_deleted: number;
  createdAt: string;
  updatedAt: string;
  Client?: {
    id: number;
    user_id: number;
    salutation?: string;
    email: string;
    first_name: string;
    last_name: string;
    display_name?: string;
    gender?: string;
    date_of_birth?: string;
    primary_phone_number?: string;
    secondary_phone_number?: string;
    client_type?: number;
    ndis_number?: string;
    nationality?: string;
    religion?: string;
    marital_status?: string;
    address?: string;
    language?: number;
    profile_img?: string;
    status: number;
    isdeleted: number;
    archived: number;
    createdAt: string;
    updatedAt: string;
    ClientType?: {
      id: number;
      name: string;
      status: number;
      isdeleted: number;
      createdAt: string;
      updatedAt: string;
    };
  };
  ClientGoal?: {
    id: number;
    user_id: number;
    client_id: number;
    title: string;
    commencement_date: string;
    description?: string;
    goal_achieved: number;
    goal_closed: number;
    status: number;
    is_deleted: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreateStrategyRequest {
  client_id: number;
  goal_id: number;
  due_at: string;
  description: string;
}

export interface UpdateStrategyRequest {
  due_at?: string;
  description?: string;
}

export interface ToggleStrategyCompletedRequest {
  completed: number;
  completion_outcome?: string;
}

export interface ToggleStrategyReviewedRequest {
  reviewed: number;
  review_outcome?: string;
}

// Public Holiday
export interface PublicHoliday {
  id: number;
  name: string;
  date: string; // "2025-01-01"
  status: number;
  is_deleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePublicHolidayRequest {
  name: string;
  date: string;
}

export interface UpdatePublicHolidayRequest {
  name?: string;
  date?: string;
}

// KPI
export interface KPI {
  id: number;
  kpi_type: string; // "KPI" or "Sub KPI"
  title: string;
  parent_kpi_id?: number | null;
  response_type: string; // "Yes/No", etc.
  status: number;
  is_deleted: number;
  createdAt: string;
  updatedAt: string;
  ParentKPI?: KPI | null;
}

export interface CreateKPIRequest {
  kpi_type: string;
  title: string;
  parent_kpi_id?: number | null;
  response_type: string;
}

export interface UpdateKPIRequest {
  kpi_type?: string;
  title?: string;
  parent_kpi_id?: number | null;
  response_type?: string;
}

// Skill
export interface Skill {
  id: number;
  name: string;
  description?: string;
  category?: string;
  level?: string; // "beginner", "intermediate", "advanced"
  icon?: string;
  color?: string;
  user_id: number;
  status: number;
  is_deleted: number;
  createdAt: string;
  updatedAt: string;
  Creator?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_img?: string;
    user_type: string;
  };
}

export interface CreateSkillRequest {
  name: string;
  description?: string;
  category?: string;
  level?: string;
  icon?: string;
  color?: string;
}

export interface UpdateSkillRequest {
  name?: string;
  description?: string;
  category?: string;
  level?: string;
  icon?: string;
  color?: string;
}