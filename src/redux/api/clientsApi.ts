import { baseApi } from "./baseApi";
import { 
  ApiResponse, 
  Client, 
  CreateClientRequest, 
  UpdateClientRequest,
  PaginationParams 
} from "@/types/models";

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all clients with pagination
    getClients: builder.query<ApiResponse<Client[]>, PaginationParams & { archived?: number }>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.status !== undefined) queryParams.append("status", params.status.toString());
        if (params.archived !== undefined) queryParams.append("archived", params.archived.toString());
        
        return `/api/client/list?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Clients" as const, id })),
              { type: "Clients", id: "LIST" },
            ]
          : [{ type: "Clients", id: "LIST" }],
    }),

    // Get client by ID
    getClientById: builder.query<ApiResponse<Client>, number>({
      query: (id) => `/api/client/${id}`,
      providesTags: (result, error, id) => [{ type: "Clients", id }],
    }),

    // Create client
    createClient: builder.mutation<ApiResponse<Client>, CreateClientRequest>({
      query: (data) => ({
        url: "/api/client/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Clients", id: "LIST" }],
    }),

    // Update client
    updateClient: builder.mutation<ApiResponse<Client>, UpdateClientRequest>({
      query: ({ id, ...data }) => ({
        url: `/api/client/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Clients", id },
        { type: "Clients", id: "LIST" },
      ],
    }),

    // Toggle client status
    toggleClientStatus: builder.mutation<ApiResponse<Client>, number>({
      query: (id) => ({
        url: `/api/client/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Clients", id },
        { type: "Clients", id: "LIST" },
      ],
    }),

    // Archive client
    archiveClient: builder.mutation<ApiResponse<Client>, number>({
      query: (id) => ({
        url: `/api/client/${id}/archive`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Clients", id },
        { type: "Clients", id: "LIST" },
      ],
    }),

    // Unarchive client
    unarchiveClient: builder.mutation<ApiResponse<Client>, number>({
      query: (id) => ({
        url: `/api/client/${id}/unarchive`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Clients", id },
        { type: "Clients", id: "LIST" },
      ],
    }),

    // Delete client
    deleteClient: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/api/client/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Clients", id },
        { type: "Clients", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useToggleClientStatusMutation,
  useArchiveClientMutation,
  useUnarchiveClientMutation,
  useDeleteClientMutation,
} = clientsApi;

