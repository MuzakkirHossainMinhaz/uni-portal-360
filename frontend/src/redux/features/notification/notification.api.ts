import { TMeta, TResponseRedux } from '../../../types';
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
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          Object.keys(args).forEach((key) => {
            params.append(key, args[key]);
          });
        }
        return {
          url: '/notifications',
          method: 'GET',
          params: params,
        };
      },
      providesTags: ['Notification'],
      transformResponse: (response: TResponseRedux<NotificationItem[]>) => ({
        data: response.data,
        meta: response.meta as PaginatedNotifications['meta'],
      }),
    }),
    markAsRead: builder.mutation<NotificationItem, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation<null, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation<null, string>({
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
