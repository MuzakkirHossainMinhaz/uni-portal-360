import type { TResponse } from '../../../types';
import { baseApi } from '../../api/baseApi';

type LoginData = {
  accessToken: string;
  needsPasswordChange: boolean;
  permissions: string[];
};

type LoginPayload = {
  id: string;
  password: string;
};

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query<
      {
        account?: { id: string; email: string; role: string; status: string };
        name?: { firstName: string; middleName?: string; lastName: string };
      },
      void
    >({
      query: () => ({ url: '/users/me' }),
      transformResponse: (
        response: TResponse<{
          account?: { id: string; email: string; role: string; status: string };
          name?: { firstName: string; middleName?: string; lastName: string };
        }>,
      ) => response.data ?? {},
    }),
    getMyPermissions: builder.query<string[], void>({
      query: () => ({ url: '/users/me', method: 'GET' }),
      transformResponse: (response: TResponse<{ permissions: string[] }>) => response.data?.permissions ?? [],
    }),
    login: builder.mutation<TResponse<LoginData>, LoginPayload>({
      query: (userInfo) => ({
        url: '/auth/login',
        method: 'POST',
        body: userInfo,
      }),
    }),
    logoutSession: builder.mutation<TResponse<null>, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    refreshSession: builder.mutation<TResponse<{ accessToken: string }>, void>({
      query: () => ({ url: '/auth/refresh-token', method: 'POST' }),
    }),
    requestPasswordReset: builder.mutation<TResponse<null>, string>({
      query: (id) => ({ url: '/auth/forget-password', method: 'POST', body: { id } }),
    }),
    resetPassword: builder.mutation<TResponse<null>, { id: string; token: string; newPassword: string }>({
      query: ({ id, token, newPassword }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        headers: { authorization: token },
        body: { id, newPassword },
      }),
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useGetMyPermissionsQuery,
  useLoginMutation,
  useLogoutSessionMutation,
  useRefreshSessionMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} = authApi;
