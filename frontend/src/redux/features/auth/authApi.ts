import { TResponse } from '../../../types';
import { baseApi } from '../../api/baseApi';

type LoginData = {
  accessToken: string;
  needsPasswordChange: boolean;
};

type LoginPayload = {
  id: string;
  password: string;
};

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<TResponse<LoginData>, LoginPayload>({
      query: (userInfo) => ({
        url: '/auth/login',
        method: 'POST',
        body: userInfo,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
