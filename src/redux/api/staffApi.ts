import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  Staff,
  CreateStaffRequest,
  UpdateStaffRequest,
} from "@/types/models";

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all staff with optional status filter
    getStaffs: builder.query<ApiResponse<Staff[]>, { status?: string }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.status) {
          searchParams.append("status", params.status);
        }
        return `/api/staff/get-all${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Staff" as const,
                id,
              })),
              { type: "Staff", id: "LIST" },
            ]
          : [{ type: "Staff", id: "LIST" }],
    }),

    // Get staff by ID
    getStaffById: builder.query<ApiResponse<Staff>, number>({
      query: (id) => `/api/staff/get-detail/${id}`,
      providesTags: (result, error, id) => [{ type: "Staff", id }],
    }),

    // Create staff
    createStaff: builder.mutation<ApiResponse<Staff>, CreateStaffRequest>({
      query: (body) => ({
        url: "/api/staff/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Staff", id: "LIST" }],
    }),

    // Update staff
    updateStaff: builder.mutation<
      ApiResponse<Staff>,
      { id: number; data: UpdateStaffRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/staff/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Staff", id },
        { type: "Staff", id: "LIST" },
      ],
    }),

    // Delete staff
    deleteStaff: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/staff/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Staff", id },
        { type: "Staff", id: "LIST" },
      ],
    }),

    // Toggle staff status
    toggleStaffStatus: builder.mutation<
      ApiResponse<Staff>,
      { id: number; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/api/staff/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Staff", id },
        { type: "Staff", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStaffsQuery,
  useGetStaffByIdQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useToggleStaffStatusMutation,
} = staffApi;

