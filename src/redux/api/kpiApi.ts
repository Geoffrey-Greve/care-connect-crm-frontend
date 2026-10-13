import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  KPI,
  CreateKPIRequest,
  UpdateKPIRequest,
} from "@/types/models";

export const kpiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all KPIs
    getKPIs: builder.query<ApiResponse<KPI[]>, void>({
      query: () => "/api/kpi/list",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "KPIs" as const,
                id,
              })),
              { type: "KPIs", id: "LIST" },
            ]
          : [{ type: "KPIs", id: "LIST" }],
    }),

    // Get KPI by ID
    getKPIById: builder.query<ApiResponse<KPI>, number>({
      query: (id) => `/api/kpi/${id}`,
      providesTags: (result, error, id) => [{ type: "KPIs", id }],
    }),

    // Create KPI
    createKPI: builder.mutation<ApiResponse<KPI>, CreateKPIRequest>({
      query: (body) => ({
        url: "/api/kpi/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "KPIs", id: "LIST" }],
    }),

    // Update KPI
    updateKPI: builder.mutation<ApiResponse<KPI>, { id: number; data: UpdateKPIRequest }>({
      query: ({ id, data }) => ({
        url: `/api/kpi/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "KPIs", id },
        { type: "KPIs", id: "LIST" },
      ],
    }),

    // Change KPI status
    changeKPIStatus: builder.mutation<ApiResponse<KPI>, { id: number; status: number }>({
      query: ({ id, status }) => ({
        url: `/api/kpi/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "KPIs", id },
        { type: "KPIs", id: "LIST" },
      ],
    }),

    // Delete KPI
    deleteKPI: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/kpi/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "KPIs", id },
        { type: "KPIs", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetKPIsQuery,
  useGetKPIByIdQuery,
  useCreateKPIMutation,
  useUpdateKPIMutation,
  useChangeKPIStatusMutation,
  useDeleteKPIMutation,
} = kpiApi;

