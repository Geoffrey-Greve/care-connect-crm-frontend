import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  StaffPayrollSettings,
  CreateStaffPayrollSettingsRequest,
  UpdateStaffPayrollSettingsRequest,
} from "@/types/models";

export const staffPayrollSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all staff payroll settings with optional staff_id filter
    // Note: API returns a single object when staff_id is provided, array otherwise
    getStaffPayrollSettings: builder.query<
      ApiResponse<StaffPayrollSettings | StaffPayrollSettings[]>,
      { staff_id?: number }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.staff_id) {
          searchParams.append("staff_id", params.staff_id.toString());
        }
        return `/api/staff/payroll-settings/list${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (result) => {
        if (!result?.data) return [{ type: "StaffPayrollSettings", id: "LIST" }];
        // Handle both single object and array responses
        if (Array.isArray(result.data)) {
          return [
            ...result.data.map(({ id }) => ({
              type: "StaffPayrollSettings" as const,
              id,
            })),
            { type: "StaffPayrollSettings", id: "LIST" },
          ];
        } else {
          return [
            { type: "StaffPayrollSettings", id: result.data.id },
            { type: "StaffPayrollSettings", id: "LIST" },
          ];
        }
      },
    }),

    // Get payroll settings by staff ID
    getStaffPayrollSettingsByStaffId: builder.query<
      ApiResponse<StaffPayrollSettings>,
      number
    >({
      query: (staff_id) => `/api/staff/payroll-settings/staff/${staff_id}`,
      providesTags: (result, error, staff_id) => [
        { type: "StaffPayrollSettings", id: `STAFF-${staff_id}` },
      ],
    }),

    // Get payroll settings by ID
    getStaffPayrollSettingsById: builder.query<
      ApiResponse<StaffPayrollSettings>,
      number
    >({
      query: (id) => `/api/staff/payroll-settings/${id}`,
      providesTags: (result, error, id) => [
        { type: "StaffPayrollSettings", id },
      ],
    }),

    // Create or update staff payroll settings
    createOrUpdateStaffPayrollSettings: builder.mutation<
      ApiResponse<StaffPayrollSettings>,
      CreateStaffPayrollSettingsRequest
    >({
      query: (body) => ({
        url: "/api/staff/payroll-settings/create-or-update",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { staff_id }) => [
        { type: "StaffPayrollSettings", id: "LIST" },
        { type: "StaffPayrollSettings", id: `STAFF-${staff_id}` },
      ],
    }),

    // Update staff payroll settings
    updateStaffPayrollSettings: builder.mutation<
      ApiResponse<StaffPayrollSettings>,
      { id: number; data: UpdateStaffPayrollSettingsRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/staff/payroll-settings/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StaffPayrollSettings", id },
        { type: "StaffPayrollSettings", id: "LIST" },
      ],
    }),

    // Change staff payroll settings status
    changeStaffPayrollSettingsStatus: builder.mutation<
      ApiResponse<StaffPayrollSettings>,
      { id: number; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/api/staff/payroll-settings/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StaffPayrollSettings", id },
        { type: "StaffPayrollSettings", id: "LIST" },
      ],
    }),

    // Delete staff payroll settings
    deleteStaffPayrollSettings: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/staff/payroll-settings/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "StaffPayrollSettings", id },
        { type: "StaffPayrollSettings", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStaffPayrollSettingsQuery,
  useGetStaffPayrollSettingsByStaffIdQuery,
  useGetStaffPayrollSettingsByIdQuery,
  useCreateOrUpdateStaffPayrollSettingsMutation,
  useUpdateStaffPayrollSettingsMutation,
  useChangeStaffPayrollSettingsStatusMutation,
  useDeleteStaffPayrollSettingsMutation,
} = staffPayrollSettingsApi;

