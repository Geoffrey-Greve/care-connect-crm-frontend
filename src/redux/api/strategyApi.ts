import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  Strategy,
  CreateStrategyRequest,
  UpdateStrategyRequest,
  ToggleStrategyCompletedRequest,
  ToggleStrategyReviewedRequest,
} from "@/types/models";

export const strategyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all strategies with optional client_id and goal_id filters
    getStrategies: builder.query<
      ApiResponse<Strategy[]>,
      { client_id?: number; goal_id?: number }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.client_id) {
          searchParams.append("client_id", params.client_id.toString());
        }
        if (params.goal_id) {
          searchParams.append("goal_id", params.goal_id.toString());
        }
        return `/api/strategy/list${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Strategies" as const,
                id,
              })),
              { type: "Strategies", id: "LIST" },
            ]
          : [{ type: "Strategies", id: "LIST" }],
    }),

    // Get strategy by ID
    getStrategyById: builder.query<ApiResponse<Strategy>, number>({
      query: (id) => `/api/strategy/${id}`,
      providesTags: (result, error, id) => [{ type: "Strategies", id }],
    }),

    // Create strategy
    createStrategy: builder.mutation<ApiResponse<Strategy>, CreateStrategyRequest>({
      query: (body) => ({
        url: "/api/strategy/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Strategies", id: "LIST" }],
    }),

    // Update strategy
    updateStrategy: builder.mutation<
      ApiResponse<Strategy>,
      { id: number; data: UpdateStrategyRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/strategy/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Strategies", id },
        { type: "Strategies", id: "LIST" },
      ],
    }),

    // Toggle strategy completed status
    toggleStrategyCompleted: builder.mutation<
      ApiResponse<Strategy>,
      { id: number; data: ToggleStrategyCompletedRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/strategy/completed/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Strategies", id },
        { type: "Strategies", id: "LIST" },
      ],
    }),

    // Toggle strategy reviewed status
    toggleStrategyReviewed: builder.mutation<
      ApiResponse<Strategy>,
      { id: number; data: ToggleStrategyReviewedRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/strategy/reviewed/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Strategies", id },
        { type: "Strategies", id: "LIST" },
      ],
    }),

    // Delete strategy
    deleteStrategy: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/strategy/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Strategies", id },
        { type: "Strategies", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStrategiesQuery,
  useGetStrategyByIdQuery,
  useCreateStrategyMutation,
  useUpdateStrategyMutation,
  useToggleStrategyCompletedMutation,
  useToggleStrategyReviewedMutation,
  useDeleteStrategyMutation,
} = strategyApi;

