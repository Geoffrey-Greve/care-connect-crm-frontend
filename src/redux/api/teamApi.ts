import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
} from "@/types/models";

export const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all teams with optional status filter
    getTeams: builder.query<ApiResponse<Team[]>, { status?: string }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.status) {
          searchParams.append("status", params.status);
        }
        return `/api/staff/team/list${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Teams" as const,
                id,
              })),
              { type: "Teams", id: "LIST" },
            ]
          : [{ type: "Teams", id: "LIST" }],
    }),

    // Get team by ID
    getTeamById: builder.query<ApiResponse<Team>, number>({
      query: (id) => `/api/staff/team/${id}`,
      providesTags: (result, error, id) => [{ type: "Teams", id }],
    }),

    // Create team
    createTeam: builder.mutation<ApiResponse<Team>, CreateTeamRequest>({
      query: (body) => ({
        url: "/api/staff/team/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Teams", id: "LIST" }],
    }),

    // Update team
    updateTeam: builder.mutation<
      ApiResponse<Team>,
      { id: number; data: UpdateTeamRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/staff/team/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Teams", id },
        { type: "Teams", id: "LIST" },
      ],
    }),

    // Delete team
    deleteTeam: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/staff/team/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Teams", id },
        { type: "Teams", id: "LIST" },
      ],
    }),

    // Toggle team status
    toggleTeamStatus: builder.mutation<
      ApiResponse<Team>,
      { id: number; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/api/staff/team/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Teams", id },
        { type: "Teams", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useToggleTeamStatusMutation,
} = teamApi;

