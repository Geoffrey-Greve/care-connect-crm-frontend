import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  StaffNextOfKin,
  CreateStaffNextOfKinRequest,
  UpdateStaffNextOfKinRequest,
} from "@/types/models";

export const staffNextOfKinApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all staff next of kin with optional staff_id filter
    getStaffNextOfKin: builder.query<
      ApiResponse<StaffNextOfKin[]>,
      { staff_id?: number }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.staff_id) {
          searchParams.append("staff_id", params.staff_id.toString());
        }
        return `/api/staff/next-of-kin/list${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "StaffNextOfKin" as const,
                id,
              })),
              { type: "StaffNextOfKin", id: "LIST" },
            ]
          : [{ type: "StaffNextOfKin", id: "LIST" }],
    }),

    // Get staff next of kin by ID
    getStaffNextOfKinById: builder.query<ApiResponse<StaffNextOfKin>, number>({
      query: (id) => `/api/staff/next-of-kin/${id}`,
      providesTags: (result, error, id) => [{ type: "StaffNextOfKin", id }],
    }),

    // Create staff next of kin
    createStaffNextOfKin: builder.mutation<
      ApiResponse<StaffNextOfKin>,
      CreateStaffNextOfKinRequest
    >({
      query: (body) => ({
        url: "/api/staff/next-of-kin/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "StaffNextOfKin", id: "LIST" }],
    }),

    // Update staff next of kin
    updateStaffNextOfKin: builder.mutation<
      ApiResponse<StaffNextOfKin>,
      { id: number; data: UpdateStaffNextOfKinRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/staff/next-of-kin/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StaffNextOfKin", id },
        { type: "StaffNextOfKin", id: "LIST" },
      ],
    }),

    // Change staff next of kin status
    changeStaffNextOfKinStatus: builder.mutation<
      ApiResponse<StaffNextOfKin>,
      { id: number; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/api/staff/next-of-kin/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StaffNextOfKin", id },
        { type: "StaffNextOfKin", id: "LIST" },
      ],
    }),

    // Delete staff next of kin
    deleteStaffNextOfKin: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/staff/next-of-kin/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "StaffNextOfKin", id },
        { type: "StaffNextOfKin", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStaffNextOfKinQuery,
  useGetStaffNextOfKinByIdQuery,
  useCreateStaffNextOfKinMutation,
  useUpdateStaffNextOfKinMutation,
  useChangeStaffNextOfKinStatusMutation,
  useDeleteStaffNextOfKinMutation,
} = staffNextOfKinApi;

