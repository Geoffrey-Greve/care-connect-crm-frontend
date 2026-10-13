import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  StaffNote,
  CreateStaffNoteRequest,
  UpdateStaffNoteRequest,
} from "@/types/models";

export const staffNotesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all staff notes with optional staff_id filter
    getStaffNotes: builder.query<ApiResponse<StaffNote[]>, { staff_id?: number }>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.staff_id) {
          searchParams.append("staff_id", params.staff_id.toString());
        }
        return `/api/staff/notes/list${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "StaffNotes" as const,
                id,
              })),
              { type: "StaffNotes", id: "LIST" },
            ]
          : [{ type: "StaffNotes", id: "LIST" }],
    }),

    // Get staff note by ID
    getStaffNoteById: builder.query<ApiResponse<StaffNote>, number>({
      query: (id) => `/api/staff/notes/${id}`,
      providesTags: (result, error, id) => [{ type: "StaffNotes", id }],
    }),

    // Create staff note
    createStaffNote: builder.mutation<ApiResponse<StaffNote>, CreateStaffNoteRequest>({
      query: (body) => ({
        url: "/api/staff/notes/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "StaffNotes", id: "LIST" }],
    }),

    // Update staff note
    updateStaffNote: builder.mutation<
      ApiResponse<StaffNote>,
      { id: number; data: UpdateStaffNoteRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/staff/notes/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StaffNotes", id },
        { type: "StaffNotes", id: "LIST" },
      ],
    }),

    // Change staff note status
    changeStaffNoteStatus: builder.mutation<
      ApiResponse<StaffNote>,
      { id: number; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/api/staff/notes/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "StaffNotes", id },
        { type: "StaffNotes", id: "LIST" },
      ],
    }),

    // Delete staff note
    deleteStaffNote: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/staff/notes/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "StaffNotes", id },
        { type: "StaffNotes", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStaffNotesQuery,
  useGetStaffNoteByIdQuery,
  useCreateStaffNoteMutation,
  useUpdateStaffNoteMutation,
  useChangeStaffNoteStatusMutation,
  useDeleteStaffNoteMutation,
} = staffNotesApi;

