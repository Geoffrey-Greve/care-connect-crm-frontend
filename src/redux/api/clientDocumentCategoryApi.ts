import { baseApi } from "./baseApi";
import {
  ApiResponse,
  ClientDocumentCategory,
  CreateClientDocumentCategoryRequest,
  UpdateClientDocumentCategoryRequest,
  PaginationParams,
} from "@/types/models";

export const clientDocumentCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClientDocumentCategories: builder.query<ApiResponse<ClientDocumentCategory[]>, PaginationParams | void>({
      query: ({ page, limit, status }: PaginationParams = {}) => {
        const queryParams = new URLSearchParams();
        if (typeof page !== "undefined") {
          queryParams.append("page", page.toString());
        }
        if (typeof limit !== "undefined") {
          queryParams.append("limit", limit.toString());
        }
        if (typeof status !== "undefined" && status !== "") {
          queryParams.append("status", status.toString());
        }
        
        return `/api/client/document-category/list?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "ClientDocumentCategories" as const, id })),
              { type: "ClientDocumentCategories", id: "LIST" },
            ]
          : [{ type: "ClientDocumentCategories", id: "LIST" }],
    }),
    getClientDocumentCategoryById: builder.query<ApiResponse<ClientDocumentCategory>, number>({
      query: (id) => `/api/client/document-category/${id}`,
      providesTags: (result, error, id) => [{ type: "ClientDocumentCategories", id }],
    }),
    createClientDocumentCategory: builder.mutation<ApiResponse<ClientDocumentCategory>, CreateClientDocumentCategoryRequest>({
      query: (newCategory) => ({
        url: "/api/client/document-category/create",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: [{ type: "ClientDocumentCategories", id: "LIST" }],
    }),
    updateClientDocumentCategory: builder.mutation<ApiResponse<ClientDocumentCategory>, UpdateClientDocumentCategoryRequest>({
      query: ({ id, ...patch }) => ({
        url: `/api/client/document-category/update/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ClientDocumentCategories", id },
        { type: "ClientDocumentCategories", id: "LIST" },
      ],
    }),
    changeClientDocumentCategoryStatus: builder.mutation<ApiResponse<null>, { id: number; status: number }>({
      query: (params) => {
        const { id, status } = params;
        return {
          url: `/api/client/document-category/status/${id}`,
          method: "PATCH",
          body: { status },
        };
      },
      invalidatesTags: (result, error, params) => [
        { type: "ClientDocumentCategories", id: params.id },
        { type: "ClientDocumentCategories", id: "LIST" },
      ],
    }),
    deleteClientDocumentCategory: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/api/client/document-category/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ClientDocumentCategories", id },
        { type: "ClientDocumentCategories", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetClientDocumentCategoriesQuery,
  useGetClientDocumentCategoryByIdQuery,
  useCreateClientDocumentCategoryMutation,
  useUpdateClientDocumentCategoryMutation,
  useChangeClientDocumentCategoryStatusMutation,
  useDeleteClientDocumentCategoryMutation,
} = clientDocumentCategoryApi;
