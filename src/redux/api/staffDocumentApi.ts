import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  StaffDocument,
  CreateStaffDocumentRequest,
  UpdateStaffDocumentRequest,
} from "@/types/models";

export const staffDocumentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all staff documents with optional staff_id filter
    getStaffDocuments: builder.query<
      ApiResponse<StaffDocument[]>,
      { staff_id?: number }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.staff_id) {
          searchParams.append("staff_id", params.staff_id.toString());
        }
        return `/api/staff-document/list${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "StaffDocuments" as const,
                id,
              })),
              { type: "StaffDocuments", id: "LIST" },
            ]
          : [{ type: "StaffDocuments", id: "LIST" }],
    }),

    // Get expired staff documents
    getExpiredStaffDocuments: builder.query<ApiResponse<StaffDocument[]>, void>({
      query: () => `/api/staff-document/expire`,
      providesTags: [{ type: "StaffDocuments", id: "EXPIRED" }],
    }),

    // Get staff document by ID
    getStaffDocumentById: builder.query<ApiResponse<StaffDocument>, number>({
      query: (id) => `/api/staff-document/${id}`,
      providesTags: (result, error, id) => [{ type: "StaffDocuments", id }],
    }),

    // Create staff document
    createStaffDocument: builder.mutation<
      ApiResponse<StaffDocument>,
      CreateStaffDocumentRequest
    >({
      query: (body) => ({
        url: "/api/staff-document/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "StaffDocuments", id: "LIST" }],
    }),

    // Update staff document
    updateStaffDocument: builder.mutation<
      ApiResponse<StaffDocument>,
      { id: number; data: UpdateStaffDocumentRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/staff-document/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StaffDocuments", id },
        { type: "StaffDocuments", id: "LIST" },
      ],
    }),

    // Change document status
    changeStaffDocumentStatus: builder.mutation<
      ApiResponse<StaffDocument>,
      { id: number; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/api/staff-document/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StaffDocuments", id },
        { type: "StaffDocuments", id: "LIST" },
      ],
    }),

    // Delete staff document
    deleteStaffDocument: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/staff-document/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "StaffDocuments", id },
        { type: "StaffDocuments", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStaffDocumentsQuery,
  useGetExpiredStaffDocumentsQuery,
  useGetStaffDocumentByIdQuery,
  useCreateStaffDocumentMutation,
  useUpdateStaffDocumentMutation,
  useChangeStaffDocumentStatusMutation,
  useDeleteStaffDocumentMutation,
} = staffDocumentApi;

