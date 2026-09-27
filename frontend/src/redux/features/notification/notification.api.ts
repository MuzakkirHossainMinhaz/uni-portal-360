import { toQueryParams, toPage } from '../../api/api.utils';
import type { TMeta, TResponse } from '../../../types';
import { baseApi } from '../../api/baseApi';

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
};

type PaginatedNotifications = {
  data?: NotificationItem[];
  meta?: (TMeta & { unreadCount?: number }) | null;
};

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserNotifications: builder.query<PaginatedNotifications, Record<string, string> | undefined>({
      query: (args) => ({
        url: '/notifications',
        method: 'GET',
        params: toQueryParams(args),
      }),
      providesTags: ['Notification'],
      transformResponse: (response: TResponse<NotificationItem[]>) => toPage(response),
    }),
    markAsRead: builder.mutation<TResponse<unknown>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation<TResponse<unknown>, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation<TResponse<unknown>, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetUserNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
