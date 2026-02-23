import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'sonner';
import { logger } from '../../utils/logger';
import { logout, setUser } from '../features/auth/authSlice';
import { RootState } from '../store';

type ErrorWithMessage = {
  data?: {
    message?: string;
  };
};

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_SERVER_URL}`,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set('authorization', `${token}`);
    }

    return headers;
  },
});

const baseQueryWithRefreshToken: BaseQueryFn<FetchArgs, unknown, unknown> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 404) {
    const error = result.error as ErrorWithMessage;
    toast.error(error.data?.message ?? 'Resource not found');
  }
  if (result?.error?.status === 403) {
    const error = result.error as ErrorWithMessage;
    toast.error(error.data?.message ?? 'You are not authorized');
  }
  if (result?.error?.status === 401) {
    //* Send Refresh
    logger.info('Sending refresh token');

    const res = await fetch('http://localhost:5000/api/v1/auth/refresh-token', {
      method: 'POST',
      credentials: 'include',
    });

    const data = await res.json();

    if (data?.data?.accessToken) {
      const user = (api.getState() as RootState).auth.user;

      api.dispatch(
        setUser({
          user,
          token: data.data.accessToken,
        }),
      );

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: [
    'semester',
    'courses',
    'offeredCourse',
    'EnrolledCourse',
    'Assignment',
    'Attendance',
    'Fee',
    'Notification',
    'SemesterResult',
    'Submission',
  ],
  endpoints: () => ({}),
});
