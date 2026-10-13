import { baseApi } from "./baseApi";
import {
  ApiResponse,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  PaginationParams,
} from "@/types/models";

export const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<ApiResponse<Role[]>, PaginationParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.status) queryParams.append("status", params.status.toString());
        
        return `/api/role/list?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Roles" as const, id })),
              { type: "Roles", id: "LIST" },
            ]
          : [{ type: "Roles", id: "LIST" }],
    }),
    getRoleById: builder.query<ApiResponse<Role>, number>({
      query: (id) => `/api/role/${id}`,
      providesTags: (result, error, id) => [{ type: "Roles", id }],
    }),
    createRole: builder.mutation<ApiResponse<Role>, CreateRoleRequest>({
      query: (newRole) => ({
        url: "/api/role/create",
        method: "POST",
        body: newRole,
      }),
      invalidatesTags: [{ type: "Roles", id: "LIST" }],
    }),
    updateRole: builder.mutation<ApiResponse<Role>, UpdateRoleRequest>({
      query: ({ id, ...patch }) => ({
        url: `/api/role/update/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Roles", id },
        { type: "Roles", id: "LIST" },
      ],
    }),
    changeRoleStatus: builder.mutation<ApiResponse<null>, { id: number; status: number }>({
      query: (params) => {
        const { id, status } = params;
        return {
          url: `/api/role/status/${id}`,
          method: "PATCH",
          body: { status },
        };
      },
      invalidatesTags: (result, error, params) => [
        { type: "Roles", id: params.id },
        { type: "Roles", id: "LIST" },
      ],
    }),
    deleteRole: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/api/role/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Roles", id },
        { type: "Roles", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useChangeRoleStatusMutation,
  useDeleteRoleMutation,
} = roleApi;
