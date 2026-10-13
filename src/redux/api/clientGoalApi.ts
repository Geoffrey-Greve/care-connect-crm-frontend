import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  ClientGoal,
  CreateClientGoalRequest,
  UpdateClientGoalRequest,
} from "@/types/models";

export const clientGoalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all client goals with optional client_id filter
    getClientGoals: builder.query<
      ApiResponse<ClientGoal[]>,
      { client_id?: number }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.client_id) {
          searchParams.append("client_id", params.client_id.toString());
        }
        return `/api/client/goal/list${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "ClientGoals" as const,
                id,
              })),
              { type: "ClientGoals", id: "LIST" },
            ]
          : [{ type: "ClientGoals", id: "LIST" }],
    }),

    // Get client goal by ID
    getClientGoalById: builder.query<ApiResponse<ClientGoal>, number>({
      query: (id) => `/api/client/goal/${id}`,
      providesTags: (result, error, id) => [{ type: "ClientGoals", id }],
    }),

    // Create client goal
    createClientGoal: builder.mutation<
      ApiResponse<ClientGoal>,
      CreateClientGoalRequest
    >({
      query: (body) => ({
        url: "/api/client/goal/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ClientGoals", id: "LIST" }],
    }),

    // Update client goal
    updateClientGoal: builder.mutation<
      ApiResponse<ClientGoal>,
      { id: number; data: UpdateClientGoalRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/client/goal/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ClientGoals", id },
        { type: "ClientGoals", id: "LIST" },
      ],
    }),

    // Delete client goal
    deleteClientGoal: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/client/goal/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ClientGoals", id },
        { type: "ClientGoals", id: "LIST" },
      ],
    }),

    // Toggle goal achieved
    toggleGoalAchieved: builder.mutation<
      ApiResponse<ClientGoal>,
      { id: number; goal_achieved: number }
    >({
      query: ({ id, goal_achieved }) => ({
        url: `/api/client/goal/achieved/${id}`,
        method: "PATCH",
        body: { goal_achieved },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ClientGoals", id },
        { type: "ClientGoals", id: "LIST" },
      ],
    }),

    // Toggle goal closed
    toggleGoalClosed: builder.mutation<
      ApiResponse<ClientGoal>,
      { id: number; goal_closed: number }
    >({
      query: ({ id, goal_closed }) => ({
        url: `/api/client/goal/closed/${id}`,
        method: "PATCH",
        body: { goal_closed },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ClientGoals", id },
        { type: "ClientGoals", id: "LIST" },
      ],
    }),

    // Change status
    changeClientGoalStatus: builder.mutation<
      ApiResponse<ClientGoal>,
      { id: number; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/api/client/goal/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ClientGoals", id },
        { type: "ClientGoals", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetClientGoalsQuery,
  useGetClientGoalByIdQuery,
  useCreateClientGoalMutation,
  useUpdateClientGoalMutation,
  useDeleteClientGoalMutation,
  useToggleGoalAchievedMutation,
  useToggleGoalClosedMutation,
  useChangeClientGoalStatusMutation,
} = clientGoalApi;

