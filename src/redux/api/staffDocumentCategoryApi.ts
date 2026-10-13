import { baseApi } from "./baseApi";
import {
  ApiResponse,
  StaffDocumentCategory,
  CreateStaffDocumentCategoryRequest,
  UpdateStaffDocumentCategoryRequest,
  PaginationParams,
} from "@/types/models";

export const staffDocumentCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaffDocumentCategories: builder.query<ApiResponse<StaffDocumentCategory[]>, PaginationParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.status) queryParams.append("status", params.status.toString());
        
        return `/api/staff-document-category/list${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "StaffDocumentCategories" as const, id })),
              { type: "StaffDocumentCategories", id: "LIST" },
            ]
          : [{ type: "StaffDocumentCategories", id: "LIST" }],
    }),
    getStaffDocumentCategoryById: builder.query<ApiResponse<StaffDocumentCategory>, number>({
      query: (id) => `/api/staff-document-category/${id}`,
      providesTags: (result, error, id) => [{ type: "StaffDocumentCategories", id }],
    }),
    createStaffDocumentCategory: builder.mutation<ApiResponse<StaffDocumentCategory>, CreateStaffDocumentCategoryRequest>({
      query: (newCategory) => ({
        url: "/api/staff-document-category/create",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: [{ type: "StaffDocumentCategories", id: "LIST" }],
    }),
    updateStaffDocumentCategory: builder.mutation<ApiResponse<StaffDocumentCategory>, UpdateStaffDocumentCategoryRequest>({
      query: ({ id, ...patch }) => ({
        url: `/api/staff-document-category/update/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StaffDocumentCategories", id },
        { type: "StaffDocumentCategories", id: "LIST" },
      ],
    }),
    changeStaffDocumentCategoryStatus: builder.mutation<ApiResponse<null>, { id: number; status: number }>({
      query: (params) => {
        const { id, status } = params;
        return {
          url: `/api/staff-document-category/status/${id}`,
          method: "PATCH",
          body: { status },
        };
      },
      invalidatesTags: (result, error, params) => [
        { type: "StaffDocumentCategories", id: params.id },
        { type: "StaffDocumentCategories", id: "LIST" },
      ],
    }),
    deleteStaffDocumentCategory: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/api/staff-document-category/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "StaffDocumentCategories", id },
        { type: "StaffDocumentCategories", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStaffDocumentCategoriesQuery,
  useGetStaffDocumentCategoryByIdQuery,
  useCreateStaffDocumentCategoryMutation,
  useUpdateStaffDocumentCategoryMutation,
  useChangeStaffDocumentCategoryStatusMutation,
  useDeleteStaffDocumentCategoryMutation,
} = staffDocumentCategoryApi;

