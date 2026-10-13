import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  Skill,
  CreateSkillRequest,
  UpdateSkillRequest,
} from "@/types/models";

export const skillApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all skills
    getSkills: builder.query<ApiResponse<Skill[]>, void>({
      query: () => "/api/skill/list",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Skills" as const,
                id,
              })),
              { type: "Skills", id: "LIST" },
            ]
          : [{ type: "Skills", id: "LIST" }],
    }),

    // Get skill by ID
    getSkillById: builder.query<ApiResponse<Skill>, number>({
      query: (id) => `/api/skill/${id}`,
      providesTags: (result, error, id) => [{ type: "Skills", id }],
    }),

    // Create skill
    createSkill: builder.mutation<ApiResponse<Skill>, CreateSkillRequest>({
      query: (body) => ({
        url: "/api/skill/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Skills", id: "LIST" }],
    }),

    // Update skill
    updateSkill: builder.mutation<ApiResponse<Skill>, { id: number; data: UpdateSkillRequest }>({
      query: ({ id, data }) => ({
        url: `/api/skill/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Skills", id },
        { type: "Skills", id: "LIST" },
      ],
    }),

    // Change skill status
    changeSkillStatus: builder.mutation<ApiResponse<Skill>, { id: number; status: number }>({
      query: ({ id, status }) => ({
        url: `/api/skill/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Skills", id },
        { type: "Skills", id: "LIST" },
      ],
    }),

    // Delete skill
    deleteSkill: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/skill/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Skills", id },
        { type: "Skills", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSkillsQuery,
  useGetSkillByIdQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useChangeSkillStatusMutation,
  useDeleteSkillMutation,
} = skillApi;

