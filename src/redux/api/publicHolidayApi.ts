import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  PublicHoliday,
  CreatePublicHolidayRequest,
  UpdatePublicHolidayRequest,
} from "@/types/models";

export const publicHolidayApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all public holidays
    getPublicHolidays: builder.query<ApiResponse<PublicHoliday[]>, void>({
      query: () => "/api/public-holiday/list",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "PublicHolidays" as const,
                id,
              })),
              { type: "PublicHolidays", id: "LIST" },
            ]
          : [{ type: "PublicHolidays", id: "LIST" }],
    }),

    // Get public holiday by ID
    getPublicHolidayById: builder.query<ApiResponse<PublicHoliday>, number>({
      query: (id) => `/api/public-holiday/${id}`,
      providesTags: (result, error, id) => [{ type: "PublicHolidays", id }],
    }),

    // Create public holiday
    createPublicHoliday: builder.mutation<
      ApiResponse<PublicHoliday>,
      CreatePublicHolidayRequest
    >({
      query: (body) => ({
        url: "/api/public-holiday/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "PublicHolidays", id: "LIST" }],
    }),

    // Update public holiday
    updatePublicHoliday: builder.mutation<
      ApiResponse<PublicHoliday>,
      { id: number; data: UpdatePublicHolidayRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/public-holiday/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PublicHolidays", id },
        { type: "PublicHolidays", id: "LIST" },
      ],
    }),

    // Change public holiday status
    changePublicHolidayStatus: builder.mutation<
      ApiResponse<PublicHoliday>,
      { id: number; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/api/public-holiday/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PublicHolidays", id },
        { type: "PublicHolidays", id: "LIST" },
      ],
    }),

    // Delete public holiday
    deletePublicHoliday: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/public-holiday/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PublicHolidays", id },
        { type: "PublicHolidays", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPublicHolidaysQuery,
  useGetPublicHolidayByIdQuery,
  useCreatePublicHolidayMutation,
  useUpdatePublicHolidayMutation,
  useChangePublicHolidayStatusMutation,
  useDeletePublicHolidayMutation,
} = publicHolidayApi;

