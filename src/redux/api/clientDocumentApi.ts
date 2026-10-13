import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  ClientDocument,
  CreateClientDocumentRequest,
  UpdateClientDocumentRequest,
} from "@/types/models";

export const clientDocumentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all client documents with optional client_id filter
    getClientDocuments: builder.query<
      ApiResponse<ClientDocument[]>,
      { client_id?: number }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.client_id) {
          searchParams.append("client_id", params.client_id.toString());
        }
        return `/api/client/document/list${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "ClientDocuments" as const,
                id,
              })),
              { type: "ClientDocuments", id: "LIST" },
            ]
          : [{ type: "ClientDocuments", id: "LIST" }],
    }),

    // Get client document by ID
    getClientDocumentById: builder.query<ApiResponse<ClientDocument>, number>({
      query: (id) => `/api/client/document/${id}`,
      providesTags: (result, error, id) => [{ type: "ClientDocuments", id }],
    }),

    // Create client document
    createClientDocument: builder.mutation<
      ApiResponse<ClientDocument>,
      CreateClientDocumentRequest
    >({
      query: (body) => ({
        url: "/api/client/document/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ClientDocuments", id: "LIST" }],
    }),

    // Update client document
    updateClientDocument: builder.mutation<
      ApiResponse<ClientDocument>,
      { id: number; data: UpdateClientDocumentRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/client/document/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ClientDocuments", id },
        { type: "ClientDocuments", id: "LIST" },
      ],
    }),

    // Delete client document
    deleteClientDocument: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/client/document/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ClientDocuments", id },
        { type: "ClientDocuments", id: "LIST" },
      ],
    }),

    // Change status
    changeClientDocumentStatus: builder.mutation<
      ApiResponse<ClientDocument>,
      { id: number; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/api/client/document/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ClientDocuments", id },
        { type: "ClientDocuments", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetClientDocumentsQuery,
  useGetClientDocumentByIdQuery,
  useCreateClientDocumentMutation,
  useUpdateClientDocumentMutation,
  useDeleteClientDocumentMutation,
  useChangeClientDocumentStatusMutation,
} = clientDocumentApi;

