import { TResponse } from '../../../types';
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
  }),
});

export const { useGetMyPermissionsQuery, useLoginMutation } = authApi;
