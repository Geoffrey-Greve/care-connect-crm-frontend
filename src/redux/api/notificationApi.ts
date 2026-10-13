import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  Notification,
  CreateNotificationRequest,
  UpdateNotificationRequest,
} from "@/types/models";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notifications
    getNotifications: builder.query<ApiResponse<Notification[]>, void>({
      query: () => `/api/admin/notification/list`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Notifications" as const,
                id,
              })),
              { type: "Notifications", id: "LIST" },
            ]
          : [{ type: "Notifications", id: "LIST" }],
    }),

    // Get notification by ID
    getNotificationById: builder.query<ApiResponse<Notification>, number>({
      query: (id) => `/api/admin/notification/${id}`,
      providesTags: (result, error, id) => [{ type: "Notifications", id }],
    }),

    // Create notification
    createNotification: builder.mutation<ApiResponse<Notification>, CreateNotificationRequest>({
      query: (body) => ({
        url: "/api/admin/notification/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Notifications", id: "LIST" }],
    }),

    // Update notification
    updateNotification: builder.mutation<
      ApiResponse<Notification>,
      { id: number; data: UpdateNotificationRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/admin/notification/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Notifications", id },
        { type: "Notifications", id: "LIST" },
      ],
    }),

    // Toggle notification status
    toggleNotificationStatus: builder.mutation<ApiResponse<Notification>, number>({
      query: (id) => ({
        url: `/api/admin/notification/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notifications", id },
        { type: "Notifications", id: "LIST" },
      ],
    }),

    // Delete notification
    deleteNotification: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/api/admin/notification/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notifications", id },
        { type: "Notifications", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useToggleNotificationStatusMutation,
  useDeleteNotificationMutation,
} = notificationApi;

