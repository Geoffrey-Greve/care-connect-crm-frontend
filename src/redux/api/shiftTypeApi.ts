import { baseApi } from "./baseApi";
import {
  ApiResponse,
  ShiftType,
  CreateShiftTypeRequest,
  UpdateShiftTypeRequest,
  PaginationParams,
} from "@/types/models";

export const shiftTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShiftTypes: builder.query<ApiResponse<ShiftType[]>, PaginationParams | void>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.status) queryParams.append("status", params.status.toString());
        
        return `/api/shift-type/list?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "ShiftTypes" as const, id })),
              { type: "ShiftTypes", id: "LIST" },
            ]
          : [{ type: "ShiftTypes", id: "LIST" }],
    }),
    getShiftTypeById: builder.query<ApiResponse<ShiftType>, number>({
      query: (id) => `/api/shift-type/${id}`,
      providesTags: (result, error, id) => [{ type: "ShiftTypes", id }],
    }),
    createShiftType: builder.mutation<ApiResponse<ShiftType>, CreateShiftTypeRequest>({
      query: (newShiftType) => ({
        url: "/api/shift-type/create",
        method: "POST",
        body: newShiftType,
      }),
      invalidatesTags: [{ type: "ShiftTypes", id: "LIST" }],
    }),
    updateShiftType: builder.mutation<ApiResponse<ShiftType>, UpdateShiftTypeRequest>({
      query: ({ id, ...patch }) => ({
        url: `/api/shift-type/update/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ShiftTypes", id },
        { type: "ShiftTypes", id: "LIST" },
      ],
    }),
    changeShiftTypeStatus: builder.mutation<ApiResponse<null>, { id: number; status: number }>({
      query: (params) => {
        const { id, status } = params;
        return {
          url: `/api/shift-type/status/${id}`,
          method: "PATCH",
          body: { status },
        };
      },
      invalidatesTags: (result, error, params) => [
        { type: "ShiftTypes", id: params.id },
        { type: "ShiftTypes", id: "LIST" },
      ],
    }),
    deleteShiftType: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/api/shift-type/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ShiftTypes", id },
        { type: "ShiftTypes", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetShiftTypesQuery,
  useGetShiftTypeByIdQuery,
  useCreateShiftTypeMutation,
  useUpdateShiftTypeMutation,
  useChangeShiftTypeStatusMutation,
  useDeleteShiftTypeMutation,
} = shiftTypeApi;
