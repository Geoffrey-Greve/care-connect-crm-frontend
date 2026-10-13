import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  StaffLeave,
  CreateStaffLeaveRequest,
  UpdateStaffLeaveRequest,
  UpdateLeaveStatusRequest,
} from "@/types/models";

export const staffLeaveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all staff leaves with optional filters
    getStaffLeaves: builder.query<
      ApiResponse<StaffLeave[]>,
      { staff_id?: number; status?: string }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.staff_id) {
          searchParams.append("staff_id", params.staff_id.toString());
        }
        if (params.status) {
          searchParams.append("status", params.status);
        }
        return `/api/staff/leave/list${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "StaffLeaves" as const,
                id,
              })),
              { type: "StaffLeaves", id: "LIST" },
            ]
          : [{ type: "StaffLeaves", id: "LIST" }],
    }),

    // Get staff leave by ID
    getStaffLeaveById: builder.query<ApiResponse<StaffLeave>, number>({
      query: (id) => `/api/staff/leave/${id}`,
      providesTags: (result, error, id) => [{ type: "StaffLeaves", id }],
    }),

    // Create staff leave
    createStaffLeave: builder.mutation<
      ApiResponse<StaffLeave>,
      CreateStaffLeaveRequest
    >({
      query: (body) => ({
        url: "/api/staff/leave/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "StaffLeaves", id: "LIST" }],
    }),

    // Update staff leave
    updateStaffLeave: builder.mutation<
      ApiResponse<StaffLeave>,
      { id: number; data: UpdateStaffLeaveRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/staff/leave/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StaffLeaves", id },
        { type: "StaffLeaves", id: "LIST" },
      ],
    }),

    // Update leave status (approve/reject/pending)
    updateLeaveStatus: builder.mutation<
      ApiResponse<StaffLeave>,
      { id: number; data: UpdateLeaveStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/staff/leave/status/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StaffLeaves", id },
        { type: "StaffLeaves", id: "LIST" },
      ],
    }),

    // Delete staff leave
    deleteStaffLeave: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/staff/leave/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "StaffLeaves", id },
        { type: "StaffLeaves", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStaffLeavesQuery,
  useGetStaffLeaveByIdQuery,
  useCreateStaffLeaveMutation,
  useUpdateStaffLeaveMutation,
  useUpdateLeaveStatusMutation,
  useDeleteStaffLeaveMutation,
} = staffLeaveApi;

