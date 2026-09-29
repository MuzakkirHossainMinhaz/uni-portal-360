import type { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query/react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import { logout, requirePasswordChange, setUser } from '../features/auth/authSlice';
import type { TUser } from '../features/auth/authSlice';
import type { RootState } from '../store';

type ErrorWithMessage = {
  data?: {
    message?: string;
  };
};

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_SERVER_URL}`,
  credentials: 'include',
  timeout: 15_000,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token && !headers.has('authorization')) {
      headers.set('authorization', `${token}`);
    }

    return headers;
  },
});

let refreshPromise: Promise<Awaited<ReturnType<typeof baseQuery>>> | null = null;

const baseQueryWithAuth: BaseQueryFn<FetchArgs, unknown, unknown> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const path = typeof args === 'string' ? args : args.url;
  const mayRefresh = !['/auth/login', '/auth/refresh-token', '/auth/reset-password', '/auth/forget-password'].includes(
    path,
  );
  if (result.error?.status === 401 && mayRefresh && (api.getState() as RootState).auth.token) {
    if (!refreshPromise) {
      refreshPromise = Promise.resolve(baseQuery({ url: '/auth/refresh-token', method: 'POST' }, api, extraOptions));
    }
    const inFlight = refreshPromise;
    try {
      const refreshResult = await inFlight;
      const accessToken = (refreshResult.data as { data?: { accessToken?: string } } | undefined)?.data?.accessToken;
      if (accessToken) {
        const previous = (api.getState() as RootState).auth.user;
        const decoded = jwtDecode<TUser>(accessToken);
        api.dispatch(
          setUser({
            user: {
              ...decoded,
              permissions: previous?.permissions,
              needsPasswordChange: previous?.needsPasswordChange,
            },
            token: accessToken,
          }),
        );
        result = await baseQuery(args, api, extraOptions);
      }
    } catch {
      // A malformed or revoked refresh token falls through to the normal sign-out path.
    } finally {
      if (refreshPromise === inFlight) refreshPromise = null;
    }
  }

  if (result?.error?.status === 404) {
    const error = result.error as ErrorWithMessage;
    toast.error(error.data?.message ?? 'Resource not found');
  }
  if (result?.error?.status === 403) {
    const error = result.error as ErrorWithMessage;
    if (error.data?.message === 'Password change required') {
      api.dispatch(requirePasswordChange());
      toast.error('Please change your password to continue.', { id: 'password-change-required' });
    } else {
      toast.error(error.data?.message ?? 'You are not authorized');
    }
  }
  if (result?.error?.status === 401) {
    api.dispatch(logout());
    toast.error('Your session has expired. Please log in again.', {
      id: 'session-expired',
    });
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'AcademicSemesters',
    'AcademicFaculties',
    'AcademicDepartments',
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
    'Students',
    'Faculties',
    'Admins',
  ],
  endpoints: () => ({}),
});
