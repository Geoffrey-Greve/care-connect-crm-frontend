import { baseApi } from "./baseApi";
import { 
  ApiResponse, 
  ClientType, 
  CreateClientTypeRequest, 
  UpdateClientTypeRequest,
  PaginationParams 
} from "@/types/models";

export const clientTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all client types with pagination
    getClientTypes: builder.query<ApiResponse<ClientType[]>, PaginationParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.status) queryParams.append("status", params.status.toString());
        
        return `/api/client/client-type/list?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "ClientTypes" as const, id })),
              { type: "ClientTypes", id: "LIST" },
            ]
          : [{ type: "ClientTypes", id: "LIST" }],
    }),

    // Get client type by ID
    getClientTypeById: builder.query<ApiResponse<ClientType>, number>({
      query: (id) => `/api/client/client-type/${id}`,
      providesTags: (result, error, id) => [{ type: "ClientTypes", id }],
    }),

    // Create client type
    createClientType: builder.mutation<ApiResponse<ClientType>, CreateClientTypeRequest>({
      query: (data) => ({
        url: "/api/client/client-type/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "ClientTypes", id: "LIST" }],
    }),

    // Update client type
    updateClientType: builder.mutation<ApiResponse<ClientType>, UpdateClientTypeRequest>({
      query: ({ id, ...data }) => ({
        url: `/api/client/client-type/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ClientTypes", id },
        { type: "ClientTypes", id: "LIST" },
      ],
    }),

    // Toggle client type status
    toggleClientTypeStatus: builder.mutation<ApiResponse<ClientType>, { id: number; status: number }>({
      query: (params) => {
        const { id, status } = params;
        return {
          url: `/api/client/client-type/${id}/toggle-status`,
          method: "PATCH",
          body: { status },
        };
      },
      invalidatesTags: (result, error, params) => [
        { type: "ClientTypes", id: params.id },
        { type: "ClientTypes", id: "LIST" },
      ],
    }),

    // Delete client type
    deleteClientType: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/api/client/client-type/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ClientTypes", id },
        { type: "ClientTypes", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetClientTypesQuery,
  useGetClientTypeByIdQuery,
  useCreateClientTypeMutation,
  useUpdateClientTypeMutation,
  useToggleClientTypeStatusMutation,
  useDeleteClientTypeMutation,
} = clientTypeApi;

